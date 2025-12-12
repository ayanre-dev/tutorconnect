import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";

export default function VideoRoom(){
  const { roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef();

  useEffect(()=>{
    const s = io("http://localhost:5000");
    setSocket(s);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (userVideo.current) userVideo.current.srcObject = stream;
        s.emit("join-room", roomId);

        s.on("webrtc-offer", ({ from, offer }) => {
          // create non-initiator peer
          const peer = new Peer({ initiator: false, trickle: false, stream });
          peer.on("signal", answer => {
            s.emit("webrtc-answer", { room: roomId, answer, to: from });
          });
          peer.on("stream", remoteStream => {
            if (partnerVideo.current) partnerVideo.current.srcObject = remoteStream;
          });
          peer.signal(offer);
          peerRef.current = peer;
        });

        s.on("webrtc-answer", ({ from, answer }) => {
          if (peerRef.current) peerRef.current.signal(answer);
        });

        s.on("webrtc-candidate", ({ from, candidate }) => {
          // simple-peer handles candidates through signal, so usually not needed separately
        });

        s.on("user-joined", ({ socketId }) => {
          // when someone joins, create an offer
          if (socketId === s.id) return;
          const peer = new Peer({ initiator: true, trickle: false, stream });
          peer.on("signal", offer => {
            s.emit("webrtc-offer", { room: roomId, offer, to: socketId });
          });
          peer.on("stream", remoteStream => {
            if (partnerVideo.current) partnerVideo.current.srcObject = remoteStream;
          });
          peerRef.current = peer;
        });

      })
      .catch(err => {
        console.error("getUserMedia error", err);
        alert("Please allow camera and microphone.");
      });

    return () => {
      s.disconnect();
      localStreamRef.current?.getTracks()?.forEach(t => t.stop());
    };
  }, [roomId]);

  function startCall(){
    // clicking "Start Call" can trigger waiting for others (offers are sent automatically on user-joined)
    if (!socket) return;
    socket.emit("join-room", roomId);
  }

  async function shareScreen(){
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (peerRef.current) {
        // replace track
        const sender = peerRef.current._pc.getSenders().find(s => s.track.kind === "video");
        if (sender) sender.replaceTrack(screenStream.getTracks()[0]);
      }
      // when done sharing, revert
      screenStream.getTracks()[0].onended = () => {
        const localStream = localStreamRef.current;
        if (peerRef.current) {
          const sender = peerRef.current._pc.getSenders().find(s => s.track.kind === "video");
          if (sender && localStream) sender.replaceTrack(localStream.getVideoTracks()[0]);
        }
      };
    } catch (err) {
      console.error("Screen share failed", err);
    }
  }

  return (
    <div>
      <h2>Video Room: {roomId}</h2>
      <div className="video-row">
        <div>
          <div>Your Camera</div>
          <video ref={userVideo} autoPlay muted playsInline/>
        </div>
        <div>
          <div>Partner</div>
          <video ref={partnerVideo} autoPlay playsInline/>
        </div>
      </div>
      <div style={{marginTop:12}}>
        <button onClick={startCall}>Start / Join Call</button>
        <button onClick={shareScreen}>Share Screen</button>
      </div>
    </div>
  );
}
