import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, CrosshairMode } from 'lightweight-charts';
import { buyStock, sellStock, getPortfolio } from '../services/api'; 

const POPULAR_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT'];

const TradingChart = ({ onTradeSuccess }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  
  // REFS for Drawing
  const isDrawModeRef = useRef(false);
  const firstPointRef = useRef(null);

  // REFS for Live PnL (We use refs to access data inside WebSocket closure without re-rendering)
  const myPositionRef = useRef(null); // Stores { quantity: 0.1, avgPrice: 50000 }
  const priceLineRef = useRef(null);  // Stores the actual line object on the chart
  
  // UI State
  const [currentPrice, setCurrentPrice] = useState(0);
  const [symbol, setSymbol] = useState('BTCUSDT'); 
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [trendlines, setTrendlines] = useState([]);
  
  // Trade State
  const [quantity, setQuantity] = useState(0.1); 
  const [isLoading, setIsLoading] = useState(false);

  // Sync Draw Mode Ref
  useEffect(() => {
    isDrawModeRef.current = isDrawMode;
    if (!isDrawMode) firstPointRef.current = null; 
  }, [isDrawMode]);

  // --- 1. HELPER: FETCH MY POSITION FOR THIS COIN ---
  const fetchMyPosition = async () => {
    try {
      // Clean up old line first
      if (priceLineRef.current && candleSeriesRef.current) {
        candleSeriesRef.current.removePriceLine(priceLineRef.current);
        priceLineRef.current = null;
      }
      myPositionRef.current = null;

      const res = await getPortfolio();
      const portfolio = res.data;
      
      // Find if we own the CURRENT symbol
      const holding = portfolio.holdings.find(h => h.symbol === symbol);

      if (holding && holding.quantity > 0) {
        myPositionRef.current = holding;
        
        // DRAW THE LINE IMMEDIATELY
        if (candleSeriesRef.current) {
          createPositionLine(holding.avgPrice, holding.quantity, currentPrice);
        }
      }
    } catch (err) {
      console.error("Position fetch error", err);
    }
  };

  // --- 2. HELPER: CREATE/UPDATE THE PRICE LINE ---
  const createPositionLine = (avgPrice, quantity, marketPrice) => {
     if (!candleSeriesRef.current) return;

     // Calculate PnL
     const diff = marketPrice - avgPrice;
     const pnl = diff * quantity;
     const isProfit = pnl >= 0;

     const lineTitle = `Avg: ${avgPrice.toFixed(2)} | Qty: ${quantity} | PnL: $${pnl.toFixed(2)}`;

     // If line exists, just update title (Animation effect)
     if (priceLineRef.current) {
        priceLineRef.current.applyOptions({
            title: lineTitle,
            color: isProfit ? '#26a69a' : '#ef5350', // Green if profit, Red if loss
            axisLabelVisible: true,
        });
     } else {
        // Create new line
        priceLineRef.current = candleSeriesRef.current.createPriceLine({
            price: avgPrice,
            color: '#2962FF', // Blue line for entry
            lineWidth: 2,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: lineTitle,
        });
     }
  };

  // --- 3. CHART SETUP ---
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.remove();
      setTrendlines([]);
      firstPointRef.current = null;
      priceLineRef.current = null; // Reset line ref
    }

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#1E222D' }, textColor: '#D9D9D9' },
      grid: { vertLines: { color: '#2B2B43' }, horzLines: { color: '#2B2B43' } },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: { timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
    });
    chartRef.current = chart; 
    
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    candleSeriesRef.current = candleSeries;

    // Load Position for this coin immediately
    fetchMyPosition();

    // Drawing Logic (Same as before)
    chart.subscribeClick((param) => {
      if (!isDrawModeRef.current || !param.time || !candleSeriesRef.current) return;
      const price = candleSeriesRef.current.coordinateToPrice(param.point.y);
      if (price === null) return;

      if (!firstPointRef.current) {
        firstPointRef.current = { time: param.time, value: price };
      } else {
        const p1 = firstPointRef.current;
        const p2 = { time: param.time, value: price };
        if (p1.time === p2.time) return; 
        
        const sortedPoints = p1.time < p2.time ? [p1, p2] : [p2, p1];
        try {
            const line = chart.addSeries(LineSeries, { color: '#f39c12', lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
            line.setData(sortedPoints);
            setTrendlines(prev => [...prev, line]);
            firstPointRef.current = null;
            setIsDrawMode(false);
        } catch(e) { console.error(e); }
      }
    });

    // Fetch History
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=1000`)
      .then((res) => res.json())
      .then((data) => {
        const cdata = data.map((d) => ({
          time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
        }));
        candleSeries.setData(cdata);
        if (cdata.length > 0) setCurrentPrice(cdata[cdata.length - 1].close);
      });

    // WebSocket
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const candle = message.k;
      const livePrice = parseFloat(candle.c);

      candleSeries.update({
        time: candle.t / 1000, open: parseFloat(candle.o), high: parseFloat(candle.h), low: parseFloat(candle.l), close: livePrice,
      });
      setCurrentPrice(livePrice);

      // --- LIVE PNL ANIMATION LOGIC ---
      if (myPositionRef.current && priceLineRef.current) {
          // If we have a position, update the line title dynamically
          createPositionLine(myPositionRef.current.avgPrice, myPositionRef.current.quantity, livePrice);
      }
    };

    const handleResize = () => { if (chartContainerRef.current) chart.applyOptions({ width: chartContainerRef.current.clientWidth }); };
    window.addEventListener('resize', handleResize);
    return () => { ws.close(); window.removeEventListener('resize', handleResize); };
  }, [symbol]);

  // --- TRADE HANDLERS ---
  const handleTrade = async (type) => {
    if (!currentPrice) return alert("Waiting for price data...");
    
    setIsLoading(true);
    try {
      if (type === 'BUY') {
        await buyStock(symbol, currentPrice, quantity);
      } else {
        await sellStock(symbol, currentPrice, quantity);
      }
      
      // REFRESH DATA
      if(onTradeSuccess) onTradeSuccess();
      
      // Update the chart line instantly
      await fetchMyPosition();

    } catch (err) {
      alert(err.response?.data?.message || "Trade Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#131722', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} style={{ padding: '10px', background: '#2B2B43', color: 'white', border: '1px solid #434651', borderRadius: '6px', fontWeight: 'bold' }}>
            {POPULAR_PAIRS.map((sym) => <option key={sym} value={sym}>{sym}</option>)}
          </select>
          <h2 style={{ color: 'white', margin: 0 }}>{symbol}</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
           <button onClick={() => {setIsDrawMode(!isDrawMode); if(isDrawMode) firstPointRef.current=null;}} style={{ padding: '8px 16px', borderRadius: '6px', background: isDrawMode ? '#f39c12' : '#2B2B43', color: 'white', border: 'none', cursor: 'pointer' }}>
             {isDrawMode ? 'Cancel' : '🖊 Draw'}
           </button>
           <button onClick={() => {trendlines.forEach(l => chartRef.current.removeSeries(l)); setTrendlines([]);}} style={{ padding: '8px 16px', background: '#2B2B43', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>🗑 Clear</button>
        </div>
        <h2 style={{ margin: 0, color: currentPrice >= 0 ? '#26a69a' : '#ef5350', fontSize: '24px' }}>${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
      </div>

      <div ref={chartContainerRef} style={{ width: '100%', height: '500px', border: '1px solid #2B2B43', borderRadius: '4px', cursor: isDrawMode ? 'crosshair' : 'default' }} />
      
      {/* ACTION BAR */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column' }}>
            <label style={{ color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>Quantity</label>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              style={{ padding: '12px', background: '#2B2B43', border: '1px solid #434651', color: 'white', borderRadius: '6px', fontWeight: 'bold' }}
            />
        </div>

        <button onClick={() => handleTrade('BUY')} disabled={isLoading} style={{ flex: 1, padding: '15px', background: isLoading ? '#555' : '#26a69a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          {isLoading ? 'PROCESSING...' : 'BUY / LONG'}
        </button>
        
        <button onClick={() => handleTrade('SELL')} disabled={isLoading} style={{ flex: 1, padding: '15px', background: isLoading ? '#555' : '#ef5350', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          {isLoading ? 'PROCESSING...' : 'SELL / SHORT'}
        </button>
      </div>
    </div>
  );
};

export default TradingChart;