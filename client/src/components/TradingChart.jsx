import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, CrosshairMode } from 'lightweight-charts';

const POPULAR_PAIRS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT'];

const TradingChart = () => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  
  const [currentPrice, setCurrentPrice] = useState(0);
  const [symbol, setSymbol] = useState('BTCUSDT'); 
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [firstPoint, setFirstPoint] = useState(null);
  const [trendlines, setTrendlines] = useState([]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.remove();
      setTrendlines([]);
      setFirstPoint(null);
    }

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#1E222D' }, textColor: '#D9D9D9' },
      grid: { vertLines: { color: '#2B2B43' }, horzLines: { color: '#2B2B43' } },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      timeScale: { timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
    });
    
    chartRef.current = chart; 
    
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350',
    });
    candleSeriesRef.current = candleSeries;

    // Fetch History
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

    // WebSocket
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const candle = message.k;
      candleSeries.update({
        time: candle.t / 1000, open: parseFloat(candle.o), high: parseFloat(candle.h), low: parseFloat(candle.l), close: parseFloat(candle.c),
      });
      setCurrentPrice(parseFloat(candle.c));
    };

    // Drawing Logic
    chart.subscribeClick((param) => {
        if (!isDrawMode || !param.time || !candleSeriesRef.current) return;
        const price = candleSeriesRef.current.coordinateToPrice(param.point.y);
        if (!price) return;
  
        if (!firstPoint) {
          setFirstPoint({ time: param.time, value: price });
        } else {
          const p1 = firstPoint.time < param.time ? firstPoint : { time: param.time, value: price };
          const p2 = firstPoint.time < param.time ? { time: param.time, value: price } : firstPoint;
          const trendLineSeries = chartRef.current.addSeries(LineSeries, { color: '#f39c12', lineWidth: 2 });
          trendLineSeries.setData([p1, p2]);
          setTrendlines(prev => [...prev, trendLineSeries]);
          setFirstPoint(null);
          setIsDrawMode(false);
        }
    });

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
  }, [symbol, isDrawMode, firstPoint]);

  return (
    <div style={{ padding: '20px', background: '#131722', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select 
            value={symbol} onChange={(e) => setSymbol(e.target.value)}
            style={{ padding: '10px', background: '#2B2B43', color: 'white', border: '1px solid #434651', borderRadius: '6px', cursor: 'pointer' }}
          >
            {POPULAR_PAIRS.map((sym) => <option key={sym} value={sym}>{sym}</option>)}
          </select>
          <h2 style={{ color: 'white', margin: 0 }}>{symbol}</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
           <button onClick={() => { setIsDrawMode(!isDrawMode); setFirstPoint(null); }}
             style={{ padding: '8px 16px', borderRadius: '6px', background: isDrawMode ? '#f39c12' : '#2B2B43', color: 'white', border: 'none', cursor: 'pointer' }}>
             {isDrawMode ? 'Click 2 Points' : '🖊 Draw Trendline'}
           </button>
           <button onClick={() => { trendlines.forEach(l => chartRef.current.removeSeries(l)); setTrendlines([]); }}
             style={{ padding: '8px 16px', background: '#2B2B43', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>🗑 Clear</button>
        </div>

        <h2 style={{ margin: 0, color: currentPrice >= 0 ? '#26a69a' : '#ef5350', fontSize: '24px' }}>
          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h2>
      </div>

      <div ref={chartContainerRef} style={{ width: '100%', height: '500px', border: '1px solid #2B2B43', borderRadius: '4px', cursor: isDrawMode ? 'crosshair' : 'default' }} />
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button style={{ flex: 1, padding: '15px', background: '#26a69a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>BUY / LONG</button>
        <button style={{ flex: 1, padding: '15px', background: '#ef5350', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>SELL / SHORT</button>
      </div>
    </div>
  );
};

export default TradingChart;