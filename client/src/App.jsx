import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import styled from "styled-components";

// Pages & Components
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AuthForm from "./components/AuthForm";
import { signup, login, getUser, logout } from "./services/api";

// --- STYLED COMPONENTS FOR AUTH PAGE ---
const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', sans-serif;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 440px;
  width: 100%;
`;

const Logo = styled.div` text-align: center; margin-bottom: 32px; `;
const Title = styled.h1` font-size: 32px; font-weight: 800; color: #333; margin: 0 0 8px 0; `;
const Subtitle = styled.p` color: #6b7280; font-size: 15px; margin: 0; font-weight: 500; `;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState("");

  // 1. Check Auth on Load
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await getUser();
        if(res.data.user) setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // 2. Handlers
  const handleSignup = async (data) => {
    try {
      setError("");
      const res = await signup(data); 
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
    }
  };

  const handleLogin = async (data) => {
    try {
      setError("");
      const res = await login(data);
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch {
      setError("Logout failed.");
    }
  };

  if (loading) return <div style={{background:'#0e1016', height:'100vh'}}></div>; // Black screen while checking auth

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. HOME PAGE */}
        <Route path="/" element={<Home user={user} />} />

        {/* 2. LOGIN / SIGNUP PAGE */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" /> : (
              <LoginContainer>
                <Card>
                  <Logo>
                    <Title>Welcome Back</Title>
                    <Subtitle>Login to access your terminal</Subtitle>
                  </Logo>
                  <AuthForm onSignup={handleSignup} onLogin={handleLogin} error={error} />
                </Card>
              </LoginContainer>
            )
          } 
        />

        {/* 3. DASHBOARD (Protected) */}
        <Route 
          path="/dashboard" 
          element={
            user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}