import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [err,setErr] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault();
    setErr("");
    try{
      const { data } = await axios.post(`${BACKEND_URL}/api/users/login`, { email, password });
      login(data.user, data.token); // Use context action
      navigate("/dashboard");
    }catch(err){
      setErr(err.response?.data?.message || err.message);
    }
  }

  return (
    <div className="center-screen">
      <div className="card">
        <h2 style={{textAlign:'center', marginBottom:'2rem'}}>Welcome Back</h2>
        {err && <div style={{color:"var(--danger)", padding:'10px', background:'rgba(249,38,114,0.1)', textAlign:'center', borderRadius:'4px', marginBottom:'1rem'}}>{err}</div>}
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input 
                placeholder="Enter your email" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                style={{width:'100%'}}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                style={{width:'100%'}}
            />
          </div>
          <button className="btn btn-primary btn-block" style={{marginTop:'1rem'}}>Sign In</button>
        </form>
        
        <p style={{textAlign:'center', marginTop:'1.5rem', color:'var(--text-muted)'}}>
          New here? <a href="/register">Create an account</a>
        </p>
      </div>
    </div>
  );
}
