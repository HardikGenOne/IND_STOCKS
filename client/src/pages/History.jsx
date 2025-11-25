import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getPortfolio } from '../api';
import { Link } from 'react-router-dom';

// --- STYLES ---
const Container = styled.div`
  min-height: 100vh;
  background-color: #0e1016;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
  color: white;
`;

const Header = styled.div`
  max-width: 1000px;
  margin: 0 auto 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackBtn = styled(Link)`
  color: #8892b0;
  text-decoration: none;
  font-weight: 600;
  &:hover { color: white; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto 40px;
`;

const StatCard = styled.div`
  background: #1E222D;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #2B2B43;
  
  h3 { font-size: 14px; color: #8892b0; margin-bottom: 5px; }
  p { font-size: 24px; font-weight: 800; margin: 0; }
`;

const TableContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: #1E222D;
  border-radius: 12px;
  border: 1px solid #2B2B43;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #2B2B43;
    padding: 15px;
    text-align: left;
    font-size: 14px;
    color: #ccc;
  }

  td {
    padding: 15px;
    border-bottom: 1px solid #2B2B43;
    font-size: 14px;
  }

  tr:last-child td { border-bottom: none; }
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  background: ${props => props.type === 'BUY' ? 'rgba(38, 166, 154, 0.2)' : 'rgba(239, 83, 80, 0.2)'};
  color: ${props => props.type === 'BUY' ? '#26a69a' : '#ef5350'};
`;

const PnlText = styled.span`
  color: ${props => props.val > 0 ? '#26a69a' : props.val < 0 ? '#ef5350' : '#888'};
  font-weight: bold;
`;

const History = () => {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ totalPnl: 0, winRate: 0, totalTrades: 0, bestWin: 0 });

  useEffect(() => {
    // We reuse getPortfolio because our backend returns 'trades' inside the user object
    getPortfolio().then(res => {
      const allTrades = res.data.trades || [];
      setTrades(allTrades);
      calculateStats(allTrades);
    });
  }, []);

  const calculateStats = (data) => {
    // Only look at SELL trades for PnL
    const sellTrades = data.filter(t => t.type === 'SELL');
    
    const totalPnl = sellTrades.reduce((acc, t) => acc + (t.realizedPnl || 0), 0);
    const wins = sellTrades.filter(t => (t.realizedPnl || 0) > 0).length;
    const winRate = sellTrades.length > 0 ? (wins / sellTrades.length) * 100 : 0;
    const bestWin = Math.max(0, ...sellTrades.map(t => t.realizedPnl || 0));

    setStats({
      totalPnl,
      winRate,
      totalTrades: sellTrades.length,
      bestWin
    });
  };

  return (
    <Container>
      <Header>
        <h1 style={{ margin: 0 }}>Trading Journal</h1>
        <BackBtn to="/dashboard">← Back to Dashboard</BackBtn>
      </Header>

      {/* STATS ROW */}
      <StatsGrid>
        <StatCard>
          <h3>Net PnL</h3>
          <PnlText val={stats.totalPnl} style={{ fontSize: '24px' }}>
            {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(2)}
          </PnlText>
        </StatCard>
        <StatCard>
          <h3>Win Rate</h3>
          <p style={{ color: stats.winRate >= 50 ? '#26a69a' : '#f39c12' }}>
            {stats.winRate.toFixed(1)}%
          </p>
        </StatCard>
        <StatCard>
          <h3>Total Trades (Closed)</h3>
          <p style={{ color: 'white' }}>{stats.totalTrades}</p>
        </StatCard>
        <StatCard>
          <h3>Best Trade</h3>
          <p style={{ color: '#26a69a' }}>+${stats.bestWin.toFixed(2)}</p>
        </StatCard>
      </StatsGrid>

      {/* HISTORY TABLE */}
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Type</th>
              <th>Price</th>
              <th>Qty</th>
              <th>PnL</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(t => (
              <tr key={t.id}>
                <td style={{ color: '#8892b0' }}>{new Date(t.createdAt).toLocaleString()}</td>
                <td style={{ fontWeight: 'bold' }}>{t.symbol}</td>
                <td><Badge type={t.type}>{t.type}</Badge></td>
                <td>${t.price.toFixed(2)}</td>
                <td>{t.quantity}</td>
                <td>
                  {t.type === 'SELL' ? (
                    <PnlText val={t.realizedPnl}>
                      {t.realizedPnl > 0 ? '+' : ''}{t.realizedPnl?.toFixed(2)}
                    </PnlText>
                  ) : (
                    <span style={{ color: '#444' }}>-</span>
                  )}
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'gray' }}>
                  No trades yet. Go make some money!
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

    </Container>
  );
};

export default History;