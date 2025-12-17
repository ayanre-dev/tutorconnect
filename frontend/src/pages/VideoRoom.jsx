
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../polyfills";
import Peer from "simple-peer";
import Chat from "../components/Chat";
import { BACKEND_URL } from "../config";

// (no polyfills)

const VideoRoom = () => {
    const { roomId } = useParams();
    const [socket, setSocket] = useState(null);
    const [peers, setPeers] = useState([]); // Array of { peerID, peer }
    const [streams, setStreams] = useState([]); // Array of { peerID, stream }
    const localVideo = useRef();
    const localStreamRef = useRef();
    const peersRef = useRef([]); // Refs are mutable, good for callbacks. content: { peerID, peer }

    useEffect(() => {
        // Use explicit transports so socket.io prefers websocket.
        // Browsers ignore `extraHeaders`; use the ngrok HTTPS URL as BACKEND_URL.
        const s = io(BACKEND_URL, { transports: ["websocket", "polling"] });
        setSocket(s);

        s.on("connect", () => {
            console.log("🔌 Socket connected! ID:", s.id);
        });

        const startConnection = (stream) => {
            s.emit("join-room", roomId);

            s.on("all-users", (users) => {
                console.log("👥 [STATE] all-users received:", users);
                const newPeers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, s.id, stream, s);
                    if (!peer) return;
                    peersRef.current.push({ peerID: userID, peer });
                    newPeers.push({ peerID: userID, peer });
                });
                setPeers(newPeers);
            });

            s.on("webrtc-offer", (payload) => {
                console.log("📩 [SIGNAL] webrtc-offer from:", payload?.from);
                if (!payload || !payload.offer) {
                    console.warn('webrtc-offer missing offer payload', payload);
                    return;
                }
                const item = peersRef.current.find(p => p.peerID === payload.from);
                if (!item) {
                    const peer = addPeer(payload.offer, payload.from, stream, s);
                    if (!peer) return;
                    peersRef.current.push({ peerID: payload.from, peer });
                    setPeers(users => {
                        console.log("👥 [STATE] adding peer from offer:", payload.from);
                        return [...users, { peerID: payload.from, peer }];
                    });
                }
            });

            s.on("webrtc-answer", (payload) => {
                console.log("📩 [SIGNAL] webrtc-answer from:", payload?.from);
                if (!payload || !payload.answer) {
                    console.warn('webrtc-answer missing answer payload', payload);
                    return;
                }
                const item = peersRef.current.find(p => p.peerID === payload.from);
                if (item && item.peer) {
                    try {
                        item.peer.signal(payload.answer);
                    } catch (err) {
                        console.error('Failed to signal peer with answer', err, payload);
                    }
                } else {
                    console.warn('No peer object found for answer from', payload.from);
                }
            });

            s.on("user-joined", (payload) => {
                console.log("👤 [EVENT] User joined room:", payload.socketId);
            });

            s.on("user-disconnected", (id) => {
                console.log("👋 [EVENT] User disconnected:", id);
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if (peerObj) peerObj.peer.destroy();
                const peers = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = peers;
                setPeers(peers);
                setStreams(prev => prev.filter(s => s.peerID !== id));
            });
        };

        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                console.log("🎥 Media stream acquired");
                localStreamRef.current = stream;
                if (localVideo.current) localVideo.current.srcObject = stream;
                startConnection(stream);
            } catch (err) {
                console.error("❌ Media error:", err);
                // Try starting without media? 
                startConnection(null);
            }
        };

        if (roomId) init();

        return () => {
            console.log("🧹 Cleaning up VideoRoom");
            s.disconnect();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [roomId]);

    function createPeer(userToSignal, callerID, stream, s) {
        console.log("📞 Creating peer (initiator) for:", userToSignal);
        const options = {
            initiator: true,
            trickle: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ]
            }
        };

        if (stream && typeof stream.getTracks === 'function') {
            options.stream = stream;
        } else if (stream) {
            console.warn('createPeer: provided stream does not look like a MediaStream', stream);
        }

        let peer;
        try {
            peer = new Peer(options);
        } catch (err) {
            console.error('Failed to create Peer (initiator)', err, { userToSignal, callerID, hasStream: !!stream });
            return null;
        }

        peer.on("signal", signal => {
            console.log("📤 Sending offer to:", userToSignal);
            s.emit("webrtc-offer", { room: roomId, offer: signal, to: userToSignal });
        });

        peer.on("stream", stream => {
            console.log("🎬 Received remote stream from:", userToSignal);
            setStreams(prev => {
                if(!prev.find(x => x.peerID === userToSignal)) {
                    return [...prev, { peerID: userToSignal, stream }];
                }
                return prev;
            });
        });

        peer.on("error", err => console.error("Peer error:", err));

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream, s) {
        console.log("📞 Adding peer (non-initiator) for:", callerID);
        const options = {
            initiator: false,
            trickle: false,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ]
            }
        };

        if (stream && typeof stream.getTracks === 'function') {
            options.stream = stream;
        } else if (stream) {
            console.warn('addPeer: provided stream does not look like a MediaStream', stream);
        }

        let peer;
        try {
            peer = new Peer(options);
        } catch (err) {
            console.error('Failed to create Peer (non-initiator)', err, { callerID, hasStream: !!stream });
            return null;
        }

        peer.on("signal", signal => {
            console.log("📤 Sending answer to:", callerID);
            s.emit("webrtc-answer", { room: roomId, answer: signal, to: callerID });
        });

        peer.on("stream", stream => {
            console.log("🎬 Received remote stream from:", callerID);
            setStreams(prev => {
                if(!prev.find(x => x.peerID === callerID)) {
                     return [...prev, { peerID: callerID, stream }];
                }
                return prev;
            });
        });

        peer.on("error", err => console.error("Peer error:", err));

        try {
            peer.signal(incomingSignal);
        } catch (err) {
            console.error('Error signaling incoming offer on non-initiator peer', err, { callerID, incomingSignal });
        }

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
                            'Authorization': `Bearer ${token}`,
                            'ngrok-skip-browser-warning': 'true'
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
                     
                     {/* Remote Videos or Placeholders */}
                     {peers.length === 0 ? (
                         <div className="video-wrapper">
                             <div style={{
                                 width: '100%',
                                 height: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 justifyContent: 'center',
                                 alignItems: 'center',
                                 background: '#1a1a1a',
                                 color: 'var(--text-muted)'
                             }}>
                                 <div className="placeholder-avatar" style={{
                                     width: '80px',
                                     height: '80px',
                                     borderRadius: '50%',
                                     background: '#333',
                                     marginBottom: '1rem',
                                     display: 'flex',
                                     justifyContent: 'center',
                                     alignItems: 'center',
                                     fontSize: '2rem'
                                 }}>
                                     👤
                                 </div>
                                 <p>Waiting for {JSON.parse(localStorage.getItem("user"))?.role === "tutor" ? "Student" : "Tutor"} to join...</p>
                             </div>
                             <span style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize:'0.8rem' }}>
                                 Waiting...
                             </span>
                         </div>
                     ) : (
                         peers.map((peer) => {
                             const streamItem = streams.find(s => s.peerID === peer.peerID);
                             return (
                                 <div key={peer.peerID} className="video-wrapper">
                                     {streamItem ? (
                                         <VideoPlayer stream={streamItem.stream} />
                                     ) : (
                                         <div style={{
                                             width: '100%',
                                             height: '100%',
                                             display: 'flex',
                                             flexDirection: 'column',
                                             justifyContent: 'center',
                                             alignItems: 'center',
                                             background: '#1a1a1a',
                                             color: 'var(--text-muted)'
                                         }}>
                                             <div className="placeholder-avatar" style={{
                                                 width: '80px',
                                                 height: '80px',
                                                 borderRadius: '50%',
                                                 background: '#333',
                                                 marginBottom: '1rem',
                                                 display: 'flex',
                                                 justifyContent: 'center',
                                                 alignItems: 'center',
                                                 fontSize: '2rem'
                                             }}>
                                                 👤
                                         </div>
                                             <p>Connecting to {JSON.parse(localStorage.getItem("user"))?.role === "tutor" ? "Student" : "Tutor"}...</p>
                                         </div>
                                     )}
                                     <span style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', fontSize:'0.8rem' }}>
                                         {streamItem ? `User ${peer.peerID.substr(0, 5)}` : "Joining..."}
                                     </span>
                                 </div>
                             );
                         })
                     )}
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
