import React, { useState } from "react";
import axios from "axios";

export default function Login(){
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [err,setErr] = useState("");

  async function submit(e){
    e.preventDefault();
    setErr("");
    try{
      const { data } = await axios.post("http://localhost:5000/api/users/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location = "/dashboard";
    }catch(err){
      setErr(err.response?.data?.message || err.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {err && <div style={{color:"red"}}>{err}</div>}
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button>Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
}
