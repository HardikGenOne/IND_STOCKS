import { useEffect, useState } from "react";
import styled from "styled-components";
import AuthForm from "./components/AuthForm";
import { signup, login, getUser, logout } from "./api";

const Container = styled.div`
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
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

const UserSection = styled.div`
  text-align: center;
`;

const WelcomeText = styled.p`
  font-size: 18px;
  color: #374151;
  margin-bottom: 24px;
  
  strong {
    color: #667eea;
    font-weight: 700;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const UserIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
`;

export default function FoodifyAuth() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getUser().then((res) => setUser(res.data.user)).catch(() => {});
  }, []);

  const handleSignup = async (data) => {
    try {
      setError("");
      await signup(data);
      const res = await getUser();
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  // const handleLogin = async (data) => {
  //   try {
  //     setError("");
  //     await login(data);
  //     const res = await getUser();
  //     setUser(res.data.user);
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Invalid credentials.");
  //   }
  // };
  const handleLogin = async (data) => {
    try {
      setError("");
      const res = await login(data);              // if server returns user
      if (res.data?.user) {
        setUser(res.data.user);
        return;
      }
      // otherwise fallback
      const me = await getUser();
      setUser(me.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    }
  };
  

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <Container>
      <Card>
        <Logo>
          <Title>Smart Strategy Backtester</Title>
          <Subtitle>Analyze Charts, See Strategy Matrix</Subtitle>
        </Logo>

        {!user ? (
          <AuthForm
            onSignup={handleSignup}
            onLogin={handleLogin}
            error={error}
          />
        ) : (
          <UserSection>
            <UserIcon>{user.username.charAt(0).toUpperCase()}</UserIcon>
            <WelcomeText>
              Welcome back, <strong>{user.username}</strong>!
            </WelcomeText>
            <LogoutButton onClick={handleLogout}>
              Logout
            </LogoutButton>
          </UserSection>
        )}
      </Card>
    </Container>
  );
}