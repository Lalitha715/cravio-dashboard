import React, { useState } from "react";
import { loginAdmin } from "../services/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginAdmin(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-6 bg-white rounded shadow-md w-96">
        <div className="flex items-center gap-3 mb-6">
        <img src="/logo_cravio.png" alt="cravio_logo" width="50px"height="50px"/>
        <h2 className="text-4xl font-bold mb-4">Admin Login</h2>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input type="email" placeholder="Email" value={email} 
               onChange={(e) => setEmail(e.target.value)} 
               className="w-full p-2 mb-3 border rounded" />
        <input type="password" placeholder="Password" value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               className="w-full p-2 mb-3 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
};

export default Login;
