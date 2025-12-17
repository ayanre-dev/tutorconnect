import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export default function Dashboard(){
  const [classes, setClasses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(()=>{
    async function fetch(){
      try{
        const res = await axios.get(`${BACKEND_URL}/api/classes`);
        setClasses(res.data);
      }catch(err){
        console.error(err);
      }
    }
    fetch();
  },[]);

  return (
    <div className="container">
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
        <h2>Dashboard</h2>
        {user && 
            <div className="badge badge-student" style={{fontSize:'1rem', padding:'8px 16px'}}>
                {user.name} ({user.role})
            </div>
        }
      </header>

      <div style={{background:'var(--bg-card)', padding:'2rem', borderRadius:'8px', textAlign:'center', marginBottom:'3rem', border:'1px dashed var(--secondary)'}}>
        <h3 style={{color:'var(--text-main)'}}>Ready for a session?</h3>
        <p style={{color:'var(--text-muted)', marginBottom:'1.5rem'}}>Join the demo room to test audio and video.</p>
        <a href="/room/demo-room" className="btn btn-primary">Join Video Classroom</a>
      </div>

      <h3 style={{borderBottom:'1px solid #444', paddingBottom:'10px'}}>Available Classes</h3>
      {classes.length === 0 ? <p style={{color:'var(--text-muted)', marginTop:'2rem'}}>No classes found.</p> :
        <div className="class-grid">
            {classes.map(c=>(
            <div key={c._id} className="class-card">
                <h4 style={{marginBottom:'0.5rem', color:'var(--secondary)'}}>{c.title}</h4>
                <div style={{fontSize:'0.9rem', color:'var(--text-muted)', marginBottom:'1rem'}}>
                     {c.subject} • {c.duration} mins
                </div>
                <div style={{fontSize:'1.2rem', fontWeight:'bold', color:'var(--primary)'}}>
                    ${c.price}
                </div>
            </div>
            ))}
        </div>
      }
    </div>
  );
}
