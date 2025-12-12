import React, { useState } from "react";
import axios from "axios";

export default function Register(){
  const [form,setForm] = useState({ name:"", email:"", password:"", role:"student" });
  const [err,setErr] = useState("");

  async function submit(e){
    e.preventDefault();
    setErr("");
    try{
      await axios.post("http://localhost:5000/api/users/register", form);
      window.location = "/";
    }catch(error){
      setErr(error.response?.data?.message || error.message);
    }
  }

  return (
    <div>
      <h2>Register</h2>
      {err && <div style={{color:"red"}}>{err}</div>}
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
        </select>
        <button>Register</button>
      </form>
    </div>
  );
}
