import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getPortfolio, getTradeHistory, updateTradeNote, deleteTrade, resetTradeHistory } from '../api';
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

// --- NEW FILTERS BAR ---
const FilterBar = styled.div`
  max-width: 1000px;
  margin: 0 auto 20px;
  display: flex;
  gap: 15px;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #434651;
  background: #2B2B43;
  color: white;
  flex: 1;
  
  &:focus { outline: 1px solid #667eea; }
`;

const Select = styled.select`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #434651;
  background: #2B2B43;
  color: white;
  cursor: pointer;
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

const Pagination = styled.div`
  max-width: 1000px;
  margin: 20px auto 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;

  button {
    padding: 8px 16px;
    background: #2B2B43;
    border: 1px solid #434651;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    &:hover:not(:disabled) { background: #434651; }
  }
`;

// NEW: Action Buttons
const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
  &.note {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
    &:hover { background: #667eea; color: white; }
  }
  
  &.delete {
    background: rgba(239, 83, 80, 0.2);
    color: #ef5350;
    &:hover { background: #ef5350; color: white; }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResetButton = styled.button`
  padding: 10px 20px;
  background: rgba(239, 83, 80, 0.2);
  color: #ef5350;
  border: 1px solid #ef5350;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #ef5350;
    color: white;
  }
`;

const History = () => {
  // Data State
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({ totalPnl: 0, winRate: 0, totalTrades: 0, bestWin: 0 });
  const [loading, setLoading] = useState(false);

  // Filter State
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState(""); // "" | "BUY" | "SELL"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // NEW: CRUD Operation State
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. Fetch Global Stats (Uses Portfolio API)
  useEffect(() => {
    getPortfolio().then(res => {
      // Calculate Stats based on ALL trades (not just current page)
      const allTrades = res.data.trades || [];
      const sellTrades = allTrades.filter(t => t.type === 'SELL');

      const totalPnl = sellTrades.reduce((acc, t) => acc + (t.realizedPnl || 0), 0);
      const wins = sellTrades.filter(t => (t.realizedPnl || 0) > 0).length;
      const winRate = sellTrades.length > 0 ? (wins / sellTrades.length) * 100 : 0;
      const bestWin = Math.max(0, ...sellTrades.map(t => t.realizedPnl || 0));

      setStats({ totalPnl, winRate, totalTrades: sellTrades.length, bestWin });
    }).catch(console.error);
  }, []);

  // 2. Fetch Paginated History (Uses new History API)
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Calls: /api/trade/history?page=1&limit=10&search=BTC&type=SELL
        const res = await getTradeHistory({
          page,
          limit: 10,
          search,
          type: filterType
        });

        setTrades(res.data.data);
        setTotalPages(res.data.pagination.pages);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly to avoid too many API calls
    const timeout = setTimeout(() => {
      fetchHistory();
    }, 300);

    return () => clearTimeout(timeout);
  }, [page, search, filterType, refreshTrigger]);

  // NEW: Handler Functions for CRUD Operations
  const handleAddNote = async (tradeId) => {
    if (!noteText.trim()) return;
    try {
      await updateTradeNote(tradeId, noteText);
      setEditingNoteId(null);
      setNoteText("");
      setRefreshTrigger(prev => prev + 1); // Refresh data
    } catch (err) {
      alert("Failed to add note: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!window.confirm("Are you sure you want to delete this trade?")) return;
    try {
      await deleteTrade(tradeId);
      setRefreshTrigger(prev => prev + 1); // Refresh data
    } catch (err) {
      alert("Failed to delete trade: " + (err.response?.data?.message || err.message));
    }
  };

  const handleResetHistory = async () => {
    if (!window.confirm("Are you sure you want to delete ALL trades? This cannot be undone!")) return;
    try {
      await resetTradeHistory();
      setRefreshTrigger(prev => prev + 1); // Refresh data
    } catch (err) {
      alert("Failed to reset history: " + (err.response?.data?.message || err.message));
    }
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
          <h3>Closed Trades</h3>
          <p style={{ color: 'white' }}>{stats.totalTrades}</p>
        </StatCard>
        <StatCard>
          <h3>Best Win</h3>
          <p style={{ color: '#26a69a' }}>+${stats.bestWin.toFixed(2)}</p>
        </StatCard>
      </StatsGrid>

      {/* FILTERS & SEARCH */}
      <FilterBar>
        <SearchInput
          placeholder="Search Symbol (e.g. BTC)..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          <option value="BUY">Buys Only</option>
          <option value="SELL">Sells Only</option>
        </Select>
        <ResetButton onClick={handleResetHistory}>
          🗑 Reset History
        </ResetButton>
      </FilterBar>

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
              <th>Total</th>
              <th>PnL</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody style={{ opacity: loading ? 0.5 : 1 }}>
            {trades.map(t => (
              <tr key={t.id}>
                <td style={{ color: '#8892b0' }}>{new Date(t.createdAt).toLocaleString()}</td>
                <td style={{ fontWeight: 'bold' }}>{t.symbol}</td>
                <td><Badge type={t.type}>{t.type}</Badge></td>
                <td>${t.price.toFixed(2)}</td>
                <td>{t.quantity}</td>
                <td>${t.totalCost.toFixed(2)}</td>
                <td>
                  {t.type === 'SELL' ? (
                    <PnlText val={t.realizedPnl}>
                      {t.realizedPnl > 0 ? '+' : ''}{t.realizedPnl?.toFixed(2)}
                    </PnlText>
                  ) : (
                    <span style={{ color: '#444' }}>-</span>
                  )}
                </td>
                <td>
                  {editingNoteId === t.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add note..."
                        style={{
                          padding: '4px 8px',
                          background: '#2B2B43',
                          border: '1px solid #434651',
                          borderRadius: '4px',
                          color: 'white',
                          fontSize: '12px'
                        }}
                      />
                      <ActionButton className="note" onClick={() => handleAddNote(t.id)}>Save</ActionButton>
                      <ActionButton className="delete" onClick={() => { setEditingNoteId(null); setNoteText(""); }}>Cancel</ActionButton>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '12px', color: '#8892b0' }}>{t.note || '-'}</span>
                      <ActionButton
                        className="note"
                        onClick={() => {
                          setEditingNoteId(t.id);
                          setNoteText(t.note || '');
                        }}
                      >
                        {t.note ? '✏️' : '+'}
                      </ActionButton>
                    </div>
                  )}
                </td>
                <td>
                  <ActionButton className="delete" onClick={() => handleDeleteTrade(t.id)}>
                    🗑 Delete
                  </ActionButton>
                </td>
              </tr>
            ))}
            {!loading && trades.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'gray' }}>
                  No trades found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <Pagination>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ color: '#8892b0', fontSize: '14px' }}>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </Pagination>
      )}

    </Container>
  );
};

export default History;