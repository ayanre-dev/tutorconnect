
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import Chat from "../components/Chat";
import { BACKEND_URL } from "../config";

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
        const s = io(BACKEND_URL, {
            extraHeaders: {
                "ngrok-skip-browser-warning": "true"
            }
        });
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
                    // Optional: You could log that someone joined, 
                    // but the joiner will initiate the Peer connection (createPeer)
                    // and we will receive an 'webrtc-offer'.
                    console.log("User joined:", payload.socketId);
                });

                s.on("webrtc-answer", (payload) => {
                    const item = peersRef.current.find(p => p.peerID === payload.from);
                    if (item) {
                        item.peer.signal(payload.answer);
                    }
                });

                s.on("webrtc-offer", (payload) => {
                    // Receiving an offer from another peer
                    const item = peersRef.current.find(p => p.peerID === payload.from);
                    if (!item) {
                        // New peer calling us - create answer peer
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

    const leaveMeeting = () => {
        // Students just leave without ending the session
        if (socket) socket.disconnect();
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        window.location.href = "/dashboard";
    };

    const endMeeting = async () => {
        // Only tutors can end the session for everyone
        const user = JSON.parse(localStorage.getItem("user"));
        
        if (user?.role === "tutor") {
            try {
                const token = localStorage.getItem("token");
                if(token) {
                    await fetch(`${BACKEND_URL}/api/sessions/${roomId}/end`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to end meeting API call", err);
            }
        }
        
        // Both students and tutors disconnect and leave
        leaveMeeting();
    };

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1e1f1c', borderBottom:'1px solid #333' }}>
                <h2>Room: {roomId}</h2>
                <div>
                    <button onClick={toggleScreenShare} className="btn btn-secondary" style={{marginRight: '1rem'}}>
                        Share Screen
                    </button>
                    <button onClick={endMeeting} className="btn btn-danger">
                        {JSON.parse(localStorage.getItem("user"))?.role === "tutor" ? "End Meeting" : "Leave Meeting"}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Video Grid Area */}
                <div className="video-grid" style={{background: 'var(--bg-dark)', overflowY:'auto'}}>
                     {/* Local Video */}
                     <div className="video-wrapper">
                         <video ref={localVideo} autoPlay muted playsInline style={{transform: 'scaleX(-1)'}} />
                         <span style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize:'0.8rem' }}>You</span>
                     </div>
                     
                     {/* Remote Videos */}
                     {streams.map((item) => (
                         <div key={item.peerID} className="video-wrapper">
                             <VideoPlayer stream={item.stream} />
                             <span style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize:'0.8rem' }}>User {item.peerID.substr(0, 5)}</span>
                         </div>
                     ))}
                </div>

                {/* Chat Area */}
                <div style={{ width: '350px', background: 'var(--bg-card)', borderLeft: '1px solid #444', display:'flex', flexDirection:'column' }}>
                     <Chat socket={socket} roomId={roomId} username={`User-${socket?.id?.substr(0,5)}`} />
                </div>
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
