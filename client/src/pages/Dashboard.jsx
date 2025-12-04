import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TradingChart from '../components/TradingChart';
import { getPortfolio, sellStock } from '../api';
import { Link } from 'react-router-dom';

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

// New Styles for the Portfolio Grid
const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PortfolioCard = styled.div`
  background: #1E222D;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #2B2B43;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    border-color: #434651;
  }
`;

const ExitButton = styled.button`
  width: 100%;
  padding: 10px;
  background: ${props => props.disabled ? '#444' : 'rgba(239, 83, 80, 0.1)'};
  color: ${props => props.disabled ? '#888' : '#ef5350'};
  border: 1px solid ${props => props.disabled ? '#444' : '#ef5350'};
  border-radius: 6px;
  font-weight: bold;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-top: 10px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.disabled ? '#444' : '#ef5350'};
    color: ${props => props.disabled ? '#888' : 'white'};
  }
`;

const Dashboard = ({ user, onLogout }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [exitingSymbol, setExitingSymbol] = useState(null); // Track which coin is being sold

  // Fetch Portfolio
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
  }, [refreshTrigger]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  // ✅ LOGIC: FULL EXIT
  const handleFullExit = async (symbol, qty) => {
    if (!window.confirm(`Are you sure you want to sell ALL ${qty} ${symbol}?`)) return;

    setExitingSymbol(symbol); // Show loading state on button

    try {
      // 1. We need the CURRENT price to execute a market sell
      // We fetch it directly from Binance API for accuracy
      const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const priceData = await priceRes.json();
      const currentPrice = parseFloat(priceData.price);

      // 2. Call Backend to Sell Everything
      await sellStock(symbol, currentPrice, qty);

      // 3. Refresh Dashboard
      refreshData();

    } catch (err) {
      alert("Failed to close position: " + (err.response?.data?.message || err.message));
    } finally {
      setExitingSymbol(null);
    }
  };

  const currentBalance = portfolio?.balance ?? user.balance ?? 0;

  return (
    <DashboardContainer>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Header>
          <Title>IND STOCKS</Title>
          <UserInfo>
            <Link
              to="/history"
              style={{ color: '#8892b0', textDecoration: 'none', marginRight: '15px', fontWeight: 'bold' }}
            >
              📊 Journal
            </Link>

            <span>Welcome, <strong>{user.username}</strong></span>
            <span style={{ color: '#26a69a', fontSize: '18px', fontWeight: 'bold' }}>
              ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <LogoutBtn onClick={onLogout}>Logout</LogoutBtn>
          </UserInfo>
        </Header>

        <main>
          {/* Chart Section */}
          <TradingChart onTradeSuccess={refreshData} />

          {/* Portfolio Section */}
          <div style={{ marginTop: '40px', color: 'white' }}>
            <h3 style={{ borderBottom: '1px solid #2B2B43', paddingBottom: '15px', fontSize: '20px' }}>Your Portfolio</h3>

            {portfolio?.holdings?.length > 0 ? (
              <PortfolioGrid>
                {portfolio.holdings.map(h => (
                  <PortfolioCard key={h.symbol}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{h.symbol}</span>
                      <span style={{ background: '#2B2B43', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#aaa' }}>LONG</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#ccc' }}>
                      <span>Quantity:</span>
                      <span style={{ color: 'white' }}>{h.quantity}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#ccc' }}>
                      <span>Avg Entry:</span>
                      <span style={{ color: '#26a69a' }}>${h.avgPrice.toFixed(2)}</span>
                    </div>

                    {/* THE EXIT BUTTON */}
                    <ExitButton
                      onClick={() => handleFullExit(h.symbol, h.quantity)}
                      disabled={exitingSymbol === h.symbol}
                    >
                      {exitingSymbol === h.symbol ? 'SELLING...' : 'CLOSE POSITION'}
                    </ExitButton>
                  </PortfolioCard>
                ))}
              </PortfolioGrid>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'gray', background: '#1E222D', borderRadius: '12px', marginTop: '20px' }}>
                <p>No open positions. Start trading above!</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;