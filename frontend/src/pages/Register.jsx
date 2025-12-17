import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"student" });
  const [err,setErr] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score++;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // Max 5
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setForm({...form, password: val});
    setPasswordStrength(calculateStrength(val));
  };

  async function submit(e){
    e.preventDefault();
    setErr("");

    if (!validateEmail(form.email)) {
      setErr("Invalid email format");
      return;
    }
    if (passwordStrength < 3) {
      setErr("Password is too weak (Try adding numbers or symbols)");
      return;
    }

    setLoading(true);
    try{
      const { data } = await axios.post(`${BACKEND_URL}/api/users/register`, form);
      login(data.user, data.token);
      navigate("/dashboard");
    }catch(error){
      setErr(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  // Visualizing strength color
  const getStrengthColor = () => {
    if(passwordStrength < 2) return "#F92672"; // Red
    if(passwordStrength < 4) return "#FD971F"; // Orange
    return "#A6E22E"; // Green
  };

  return (
    <div className="center-screen">
      <div className="card">
        <h2 style={{textAlign:'center', marginBottom: '1.5rem'}}>Create Account</h2>
        {err && <div style={{color:"var(--danger)", padding: '10px', background:'rgba(249, 38, 114, 0.1)', borderRadius:'4px', marginBottom: '1rem', textAlign:'center'}}>{err}</div>}
        
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              placeholder="e.g. John Doe" 
              value={form.name} 
              onChange={e=>setForm({...form, name:e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              placeholder="john@example.com" 
              value={form.email} 
              onChange={e=>setForm({...form, email:e.target.value})} 
              style={{borderColor: form.email && !validateEmail(form.email) ? 'var(--danger)' : ''}}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={handlePasswordChange} 
            />
            <div className="strength-bar-container">
                <div className="strength-bar-fill" style={{
                    width: `${(passwordStrength/5)*100}%`,
                    backgroundColor: getStrengthColor()
                }}/>
            </div>
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>
          </div>

          <button className="btn btn-primary btn-block" style={{marginTop:'1rem'}} disabled={loading}>
            {loading ? "Creating Account..." : "Join Now"}
          </button>
        </form>
        
        <p style={{textAlign:'center', marginTop: '1.5rem', color: 'var(--text-muted)'}}>
          Already have an account? <a href="/">Sign In</a>
        </p>
      </div>
    </div>
  );
}
