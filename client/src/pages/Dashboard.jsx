import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TradingChart from '../components/TradingChart';
import { getPortfolio } from '../services/api'; // Import the new API function

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
  const [portfolio, setPortfolio] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Helper to refresh data after trade

  // Fetch Portfolio on Mount OR when a trade happens
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPortfolio();
        setPortfolio(res.data);
      } catch (err) {
        console.error("Failed to fetch portfolio", err);
      }
    };
    fetchData();
  }, [refreshTrigger]); // Re-run when this changes

  // Function to force refresh (pass this to the Chart)
  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  // Use the fetched balance OR the initial user balance
  const currentBalance = portfolio?.balance ?? user.balance;

  return (
    <DashboardContainer>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Header>
          <Title>Smart Strategy Backtester</Title>
          <UserInfo>
            <span>Welcome, <strong>{user.username}</strong></span>
            <span style={{ color: '#26a69a', fontSize: '18px', fontWeight: 'bold' }}>
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <LogoutBtn onClick={onLogout}>Logout</LogoutBtn>
          </UserInfo>
        </Header>
        
        <main>
          {/* Pass the refresh function so the Chart can tell Dashboard to update balance */}
          <TradingChart onTradeSuccess={refreshData} />
          
          {/* OPTIONAL: Show Holdings List Below Chart */}
          <div style={{ marginTop: '30px', color: 'white' }}>
            <h3 style={{ borderBottom: '1px solid #2B2B43', paddingBottom: '10px' }}>Your Portfolio</h3>
            {portfolio?.holdings?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                 {portfolio.holdings.map(h => (
                   <div key={h.symbol} style={{ background: '#1E222D', padding: '15px', borderRadius: '8px' }}>
                     <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{h.symbol}</div>
                     <div style={{ color: '#aaa', fontSize: '14px' }}>Qty: {h.quantity}</div>
                     {/* Calculate Value roughly using avgPrice for now */}
                     <div style={{ color: '#26a69a' }}>Entry: ${h.avgPrice.toFixed(2)}</div>
                   </div>
                 ))}
              </div>
            ) : (
              <p style={{ color: 'gray', marginTop: '10px' }}>No trades yet.</p>
            )}
          </div>

        </main>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;