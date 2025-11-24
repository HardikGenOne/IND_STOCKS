import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, CrosshairMode } from 'lightweight-charts';

const POPULAR_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT'];

const TradingChart = () => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  
  // We use refs for drawing state to prevent chart re-renders during clicks
  const isDrawModeRef = useRef(false);
  const firstPointRef = useRef(null);
  
  // UI State
  const [currentPrice, setCurrentPrice] = useState(0);
  const [symbol, setSymbol] = useState('BTCUSDT'); 
  const [isDrawMode, setIsDrawMode] = useState(false); // Keeps buttons in sync
  const [trendlines, setTrendlines] = useState([]);

  // Sync Ref with State
  useEffect(() => {
    isDrawModeRef.current = isDrawMode;
    if (!isDrawMode) firstPointRef.current = null; // Reset point if cancelled
  }, [isDrawMode]);

  // --- CHART INITIALIZATION ---
  useEffect(() => {
    // 1. Cleanup Old Chart
    if (chartRef.current) {
      chartRef.current.remove();
      setTrendlines([]);
      firstPointRef.current = null;
    }

    // 2. Create New Chart
    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#1E222D' }, textColor: '#D9D9D9' },
      grid: { vertLines: { color: '#2B2B43' }, horzLines: { color: '#2B2B43' } },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: { timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
    });
    
    chartRef.current = chart; 
    
    // 3. Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    candleSeriesRef.current = candleSeries;

    // 4. Click Handler (Safe Version)
    chart.subscribeClick((param) => {
      // Guard: If not drawing or invalid click, stop
      if (!isDrawModeRef.current || !param.time || !candleSeriesRef.current) return;
      
      // Guard: Convert coordinate to price
      const price = candleSeriesRef.current.coordinateToPrice(param.point.y);
      if (price === null) return;

      // LOGIC: First Point vs Second Point
      if (!firstPointRef.current) {
        // Set Point A
        firstPointRef.current = { time: param.time, value: price };
        console.log("Point A Set");
      } else {
        // Set Point B & Draw
        const p1 = firstPointRef.current;
        const p2 = { time: param.time, value: price };

        // CRITICAL FIX: Prevent crash if points are identical
        if (p1.time === p2.time) {
             console.warn("Cannot draw line on same time point");
             return;
        }

        // Sort points (Time must be ascending for Lightweight Charts)
        const sortedPoints = p1.time < p2.time ? [p1, p2] : [p2, p1];

        try {
          const trendLineSeries = chart.addSeries(LineSeries, { 
             color: '#f39c12', 
             lineWidth: 2,
             lastValueVisible: false,
             priceLineVisible: false 
          });
          
          trendLineSeries.setData(sortedPoints);
          setTrendlines(prev => [...prev, trendLineSeries]);
          
          // Reset
          firstPointRef.current = null;
          setIsDrawMode(false); // Turn off draw mode button
        } catch (err) {
          console.error("Drawing Error:", err);
        }
      }
    });

    // 5. Fetch Historical Data
    fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=1000`)
      .then((res) => res.json())
      .then((data) => {
        const cdata = data.map((d) => ({
          time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
        }));
        candleSeries.setData(cdata);
        if (cdata.length > 0) setCurrentPrice(cdata[cdata.length - 1].close);
      })
      .catch((err) => console.error(err));

    // 6. WebSocket Connection
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const candle = message.k;
      candleSeries.update({
        time: candle.t / 1000, open: parseFloat(candle.o), high: parseFloat(candle.h), low: parseFloat(candle.l), close: parseFloat(candle.c),
      });
      setCurrentPrice(parseFloat(candle.c));
    };

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      ws.close();
      window.removeEventListener('resize', handleResize);
    };
  }, [symbol]); // Only re-run if symbol changes (Robust!)

  // --- BUTTON HANDLERS ---
  const toggleDrawMode = () => {
      setIsDrawMode(!isDrawMode);
      if (isDrawMode) firstPointRef.current = null; // Reset if cancelling
  };

  const clearAllLines = () => {
      trendlines.forEach(l => chartRef.current.removeSeries(l));
      setTrendlines([]);
      firstPointRef.current = null;
  };

  return (
    <div style={{ padding: '20px', background: '#131722', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select 
            value={symbol} onChange={(e) => setSymbol(e.target.value)}
            style={{ padding: '10px', background: '#2B2B43', color: 'white', border: '1px solid #434651', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {POPULAR_PAIRS.map((sym) => <option key={sym} value={sym}>{sym}</option>)}
          </select>
          <h2 style={{ color: 'white', margin: 0 }}>{symbol}</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
           <button onClick={toggleDrawMode}
             style={{ padding: '8px 16px', borderRadius: '6px', background: isDrawMode ? '#f39c12' : '#2B2B43', color: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
             {isDrawMode ? 'Cancel Drawing' : '🖊 Draw Trendline'}
           </button>
           <button onClick={clearAllLines}
             style={{ padding: '8px 16px', background: '#2B2B43', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>🗑 Clear</button>
        </div>

        <h2 style={{ margin: 0, color: currentPrice >= 0 ? '#26a69a' : '#ef5350', fontSize: '24px' }}>
          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h2>
      </div>

      {/* CHART */}
      <div ref={chartContainerRef} style={{ width: '100%', height: '500px', border: '1px solid #2B2B43', borderRadius: '4px', cursor: isDrawMode ? 'crosshair' : 'default' }} />
      
      {/* ACTION BUTTONS */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button style={{ flex: 1, padding: '15px', background: '#26a69a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>BUY / LONG</button>
        <button style={{ flex: 1, padding: '15px', background: '#ef5350', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>SELL / SHORT</button>
      </div>
    </div>
  );
};

export default TradingChart;