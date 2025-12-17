import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import Chat from "../components/Chat";

// Polyfill for simple-peer in Vite environment if needed
if (typeof global === "undefined") {
    window.global = window;
}
// process is sometimes needed by simple-peer dependencies
if (typeof process === "undefined") {
    window.process = { env: { DEBUG: undefined }, nextTick: (cb) => setTimeout(cb, 0) };
}

const VideoRoom = () => {
    const { roomId } = useParams();
    const [socket, setSocket] = useState(null);
    const [peers, setPeers] = useState([]); // Array of { peerID, peer }
    const [streams, setStreams] = useState([]); // Array of { peerID, stream }
    const localVideo = useRef();
    const localStreamRef = useRef();
    const peersRef = useRef([]); // Refs are mutable, good for callbacks. content: { peerID, peer }

    useEffect(() => {
        const s = io("http://localhost:5000");
        setSocket(s);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStreamRef.current = stream;
                if (localVideo.current) {
                    localVideo.current.srcObject = stream;
                }

                s.emit("join-room", roomId);

                s.on("all-users", (users) => {
                    // users is an array of socket IDs e.g. ["ID_A", "ID_B"]
                    const newPeers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, s.id, stream, s);
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        });
                        newPeers.push({ peerID: userID, peer });
                    });
                    setPeers(newPeers);
                });

                s.on("user-joined", (payload) => {
                    const peer = addPeer(payload.signal, payload.callerID, stream, s);
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer
                    });
                    setPeers(users => [...users, { peerID: payload.callerID, peer }]);
                });

                s.on("webrtc-answer", (payload) => {
                    const item = peersRef.current.find(p => p.peerID === payload.from);
                    if (item) {
                        item.peer.signal(payload.answer);
                    }
                });

                s.on("webrtc-offer", (payload) => {
                    // Handled in 'user-joined' usually if initiator logic is correct, 
                    // BUT in this mesh logic:
                    // 'user-joined' means "Someone new joined, call them".
                    // 'webrtc-offer' means "Someone is calling ME".
                    // Wait, my server logic emits 'user-joined' to ALL.
                    // Let's refine the signal handling.
                    
                    // Actually, standard mesh:
                    // 1. Joiner receives 'all-users'.
                    // 2. Joiner calls createPeer -> emits 'webrtc-offer' to Target.
                    // 3. Target receives 'webrtc-offer' -> calls addPeer -> emits 'webrtc-answer'.
                    
                    // So we need to listen for 'webrtc-offer' here to answer calls from Joiners.
                    const item = peersRef.current.find(p => p.peerID === payload.from);
                    if (item) {
                        // We already have a peer for this user? Maybe re-negotiating?
                        // Or race condition.
                        item.peer.signal(payload.offer);
                    } else {
                        // Incoming call from a new joiner
                        const peer = addPeer(payload.offer, payload.from, stream, s);
                        peersRef.current.push({ peerID: payload.from, peer });
                        setPeers(users => [...users, { peerID: payload.from, peer }]);
                    }
                });

                s.on("webrtc-candidate", (payload) => {
                     const item = peersRef.current.find(p => p.peerID === payload.from);
                     if (item) {
                         item.peer.signal(payload.candidate);
                     }
                });

                s.on("user-disconnected", (id) => {
                    const peerObj = peersRef.current.find(p => p.peerID === id);
                    if (peerObj) {
                        peerObj.peer.destroy();
                    }
                    const peers = peersRef.current.filter(p => p.peerID !== id);
                    peersRef.current = peers;
                    setPeers(peers);
                    setStreams(prev => prev.filter(s => s.peerID !== id));
                });
            })
            .catch(err => console.error("getUserMedia error:", err));

            return () => {
                s.disconnect();
                // cleanup
            };

    }, [roomId]);

    function createPeer(userToSignal, callerID, stream, s) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            s.emit("webrtc-offer", { room: roomId, offer: signal, to: userToSignal });
        });

        peer.on("stream", stream => {
            setStreams(prev => {
                if(!prev.find(x => x.peerID === userToSignal)) {
                    return [...prev, { peerID: userToSignal, stream }];
                }
                return prev;
            });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream, s) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            s.emit("webrtc-answer", { room: roomId, answer: signal, to: callerID });
        });

        peer.on("stream", stream => {
            setStreams(prev => {
                if(!prev.find(x => x.peerID === callerID)) {
                     return [...prev, { peerID: callerID, stream }];
                }
                return prev;
            });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    async function toggleScreenShare() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];

            peersRef.current.forEach(({ peer }) => {
                // Determine which track to replace.
                // We are sending 'localStreamRef.current'.
                // If specific track manipulation is needed, we grab the video track from localStream
                const sender = peer._pc.getSenders().find(s => s.track.kind === "video");
                if (sender) {
                    sender.replaceTrack(screenTrack);
                }
            });

            // Handle "Stop Sharing" (user clicks built-in browser button)
            screenTrack.onended = () => {
                const webcamTrack = localStreamRef.current.getVideoTracks()[0];
                peersRef.current.forEach(({ peer }) => {
                    const sender = peer._pc.getSenders().find(s => s.track.kind === "video");
                    if (sender) {
                        sender.replaceTrack(webcamTrack);
                    }
                });
            };

        } catch (err) {
            console.error("Failed to share screen:", err);
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Video Area */}
            <div style={{ flex: 3, padding: '20px', background: '#202124', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', marginBottom: '20px' }}>
                    <h2>Room: {roomId}</h2>
                    <button onClick={toggleScreenShare} style={{ padding: '8px 16px', borderRadius: '4px', background: '#ea4335', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Share Screen
                    </button>
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                     {/* Local Video */}
                     <div style={{ position: 'relative' }}>
                         <video ref={localVideo} autoPlay muted playsInline style={{ width: '100%', borderRadius: '8px', transform: 'scaleX(-1)' }} />
                         <span style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px' }}>You</span>
                     </div>
                     
                     {/* Remote Videos */}
                     {streams.map((item) => (
                         <div key={item.peerID} style={{ position: 'relative' }}>
                             <VideoPlayer stream={item.stream} />
                             <span style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px' }}>Peer {item.peerID.substr(0, 5)}</span>
                         </div>
                     ))}
                 </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, background: 'white' }}>
                 <Chat socket={socket} roomId={roomId} username={`User-${socket?.id?.substr(0,5)}`} />
            </div>
        </div>
    );
};

const VideoPlayer = ({ stream }) => {
    const ref = useRef();
    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream;
    }, [stream]);
    return <video ref={ref} autoPlay playsInline style={{ width: '100%', borderRadius: '8px' }} />;
};

export default VideoRoom;
