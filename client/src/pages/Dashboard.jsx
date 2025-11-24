import React from 'react';
import styled from 'styled-components';
import TradingChart from '../components/TradingChart';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #0e1016;
  padding: 20px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #2B2B43;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
`;

const LogoutBtn = styled.button`
  padding: 8px 20px;
  background: rgba(239, 83, 80, 0.2);
  color: #ef5350;
  border: 1px solid #ef5350;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #ef5350;
    color: white;
  }
`;

const Dashboard = ({ user, onLogout }) => {
  return (
    <DashboardContainer>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Header>
          <Title>Smart Strategy Backtester</Title>
          <UserInfo>
            <span>Welcome, <strong>{user.username}</strong></span>
            {/* We will add Balance here later */}
            <span style={{ color: '#26a69a' }}>$10,000.00</span>
            <LogoutBtn onClick={onLogout}>Logout</LogoutBtn>
          </UserInfo>
        </Header>
        
        <main>
          <TradingChart />
        </main>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;