import { useEffect, useState } from "react";
import styled from "styled-components";
import AuthForm from "./components/AuthForm";
import Dashboard from "./pages/Dashboard"; // Import the new Dashboard
import { signup, login, getUser, logout } from "./api";

// --- STYLES FOR LOGIN PAGE ONLY ---
const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 440px;
  width: 100%;
  animation: slideUp 0.5s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Check if user is already logged in on page load
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await getUser();
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  const handleSignup = async (data) => {
    try {
      setError("");
      const res = await signup(data); 
      setUser(res.data.user);
      // Removed alert, direct transition to dashboard
    } catch (err) {
      if (err.response?.status === 409) {
        try {
          const loginRes = await login({ identifier: data.email, password: data.password });
          setUser(loginRes.data.user);
        } catch {
          setError("User already exists but login failed.");
        }
      } else {
        setError(err.response?.data?.message || "Signup failed. Try again.");
      }
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
      setError("Logout failed. Try again.");
    }
  };

  // --- THE MAIN RENDER LOGIC ---
  
  // 1. If User is Logged In -> Show Dashboard (Full Screen)
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // 2. If No User -> Show Login Card
  return (
    <LoginContainer>
      <Card>
        <Logo>
          <Title>Smart Strategy Backtester</Title>
          <Subtitle>Analyze Charts, See Strategy Matrix</Subtitle>
        </Logo>

        <AuthForm
          onSignup={handleSignup}
          onLogin={handleLogin}
          error={error}
        />
      </Card>
    </LoginContainer>
  );
}