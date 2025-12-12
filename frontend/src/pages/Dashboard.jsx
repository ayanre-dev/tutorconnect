import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard(){
  const [classes, setClasses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(()=>{
    async function fetch(){
      try{
        const res = await axios.get("http://localhost:5000/api/classes");
        setClasses(res.data);
      }catch(err){
        console.error(err);
      }
    }
    fetch();
  },[]);

  return (
    <div>
      <h2>Dashboard</h2>
      {user && <div>Signed in as <strong>{user.name}</strong> ({user.role})</div>}
      <div style={{marginTop:12}}>
        <a href="/room/demo-room">Join test room (demo-room)</a>
      </div>
      <h3>All classes</h3>
      <ul>
        {classes.map(c=>(
          <li key={c._id}>
            <strong>{c.title}</strong> — {c.subject} — ${c.price} — <em>{c.duration} min</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
