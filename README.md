# Paper Trading Platform - Crypto Practice Trading

**Hosted Frontend:** https://ind-stocks-six.vercel.app  
**Hosted Backend:** https://ind-stocks-1.onrender.com/api  
**GitHub Repository:** https://github.com/HardikGenOne/IND_STOCKS

---

## Problem Statement

Many beginner traders lose money in cryptocurrency markets due to lack of practice and emotional decision-making. New traders face several challenges:

- **No Risk-Free Practice Environment** - They jump directly into real trading without understanding market dynamics
- **Emotional Trading** - Fear and greed lead to poor decisions when real money is at stake
- **Lack of Performance Tracking** - No way to analyze their trading patterns and learn from mistakes
- **Complex Trading Platforms** - Existing platforms are overwhelming for beginners

**The Need:** A simple, risk-free environment where beginners can practice trading, track their performance, and build confidence before risking real money.

---

## Proposed Solution

A **Paper Trading Platform** that provides a realistic trading experience with zero financial risk:

### Core Features
- **$10,000 Virtual Capital** - Start with virtual money to practice trading
- **Real-Time Market Data** - Live cryptocurrency prices from Binance WebSocket
- **Professional Charts** - Candlestick charts with drawing tools for technical analysis
- **Complete Trade Journal** - Track every trade with detailed performance analytics
- **Portfolio Management** - Real-time P&L tracking and position management

### How It Solves the Problem
1. **Risk-Free Learning** - Practice without losing real money
2. **Build Confidence** - Understand market movements and test strategies
3. **Track Performance** - Analyze win rate, P&L, and trading patterns
4. **Learn from Mistakes** - Add notes to trades and review what worked/didn't work

---

## Features Implemented

### 🔐 Authentication & User Management
- Secure signup and login with JWT authentication
- Password hashing with bcrypt
- Update user profile (username/email)
- Persistent sessions (7 days)

### 💹 Trading Operations
- **Buy/Sell** cryptocurrency (BTC, ETH, SOL, DOGE)
- Real-time price updates via Binance WebSocket
- Portfolio tracking with average entry prices
- Automatic profit/loss calculation on sell trades
- One-click position closing

### 📊 Advanced Charting
- Live candlestick charts (1-minute timeframe)
- Trendline drawing tools
- Entry price visualization on chart
- Real-time P&L updates

### 📖 Trade Journal & Analytics
- Complete trade history with pagination (10 trades per page)
- Search trades by symbol
- Filter by trade type (BUY/SELL)
- Sort by date (ascending/descending)
- **Add notes to trades** for journaling
- **Delete individual trades**
- **Reset entire trade history**
- Performance metrics:
  - Net P&L calculation
  - Win rate percentage
  - Best winning trade
  - Total closed positions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Styled Components, Lightweight Charts |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | PostgreSQL (hosted on Neon) |
| **External API** | Binance WebSocket (live price data) |
| **Authentication** | JWT + bcrypt |
| **Hosting** | Vercel (frontend), Render (backend) |

---

## API Endpoints (CRUD Operations)

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Trading Operations

**CREATE (2 operations)**
- `POST /api/trade/buy` - Create buy trade
- `POST /api/trade/sell` - Create sell trade

**READ (2 operations)**
- `GET /api/trade/portfolio` - Read user portfolio and holdings
- `GET /api/trade/history` - Read trade history with pagination, search, sort, filter

**UPDATE (2 operations)**
- `PUT /api/trade/trade/:id/note` - Update trade note/label
- `PUT /api/trade/user/profile` - Update user profile (username/email)

**DELETE (2 operations)**
- `DELETE /api/trade/trade/:id` - Delete single trade
- `DELETE /api/trade/history/reset` - Delete all trades (reset history)

### Advanced Features
- **Pagination:** `/api/trade/history?page=1&limit=10`
- **Search:** `/api/trade/history?search=BTC`
- **Sort:** `/api/trade/history?sortBy=createdAt&order=desc`
- **Filter:** `/api/trade/history?type=BUY`

---

## Database Schema

### User Model
```
id          UUID (Primary Key)
username    String (Unique)
email       String (Unique)
password    String (Hashed with bcrypt)
balance     Float (Default: 10000.00)
createdAt   DateTime
```

### Trade Model
```
id          UUID (Primary Key)
userId      UUID (Foreign Key → User)
symbol      String (e.g., "BTCUSDT")
type        String ("BUY" or "SELL")
quantity    Float
price       Float
totalCost   Float
realizedPnl Float (Nullable - only for SELL trades)
note        String (Nullable - for trade journaling)
createdAt   DateTime
```

### Holding Model
```
id       UUID (Primary Key)
userId   UUID (Foreign Key → User)
symbol   String
quantity Float
avgPrice Float
Unique constraint: (userId, symbol)
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/HardikGenOne/IND_STOCKS
cd IND_STOCKS
```

**2. Setup backend:**
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

**3. Setup frontend:**
```bash
cd client
npm install
npm run dev
```

**4. Environment Variables:**

Create `.env` file in `server/` directory:
```
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secret_key"
PORT=8080
```

---

## College Submission Evaluation Checklist

### ✅ CRUD Operations (Non-Auth)

**CREATE (2 required)**
1. ✅ `POST /api/trade/buy` - Create buy trade
2. ✅ `POST /api/trade/sell` - Create sell trade

**READ (2 required)**
1. ✅ `GET /api/trade/portfolio` - Read portfolio data
2. ✅ `GET /api/trade/history` - Read trade history

**UPDATE (2 required)**
1. ✅ `PUT /api/trade/trade/:id/note` - Update trade note
2. ✅ `PUT /api/trade/user/profile` - Update user profile

**DELETE (2 required)**
1. ✅ `DELETE /api/trade/trade/:id` - Delete single trade
2. ✅ `DELETE /api/trade/history/reset` - Delete all trades

### ✅ Advanced Features

- ✅ **Pagination** - History page shows 10 trades per page with navigation
- ✅ **Search** - Filter trades by symbol (case-insensitive)
- ✅ **Sort** - Sort by date (ascending/descending)
- ✅ **Filter** - Filter by trade type (BUY/SELL)

### ✅ Hosting & Verification

- ✅ **Frontend Hosted** - https://ind-stocks-six.vercel.app
- ✅ **Backend Hosted** - https://ind-stocks-1.onrender.com/api
- ✅ **Database** - PostgreSQL on Neon (verifiable via Render dashboard)
- ✅ **API Calls** - Visible in browser DevTools Network tab

### ✅ Documentation

- ✅ **Hosted URLs** - Listed at top of README
- ✅ **Proposal Format** - Problem statement and solution clearly defined
- ✅ **Problem Solved** - Platform enables risk-free trading practice

---

## How to Verify (For Evaluators)

### 1. Test CRUD Operations

**CREATE:**
1. Visit https://ind-stocks-six.vercel.app
2. Sign up / Login
3. Execute a BUY trade → Check database for new entry
4. Execute a SELL trade → Check database for new entry

**READ:**
1. View Dashboard → Portfolio displayed
2. Click "📊 Journal" → Trade history displayed with pagination

**UPDATE:**
1. In Journal, click "+" button on any trade
2. Add a note and click "Save" → Note saved to database
3. Go to Dashboard → Click username → Update profile

**DELETE:**
1. In Journal, click "🗑 Delete" on any trade → Trade removed
2. Click "🗑 Reset History" → All trades cleared

### 2. Test Advanced Features

**Pagination:**
- Create 15+ trades
- Navigate through pages (10 per page)

**Search:**
- Type "BTC" in search box → Only BTC trades shown

**Sort:**
- Default: Newest first (descending)
- Can be changed via API parameter

**Filter:**
- Select "Buys Only" → Only BUY trades
- Select "Sells Only" → Only SELL trades

### 3. Verify Hosting

**Frontend:**
1. Open https://ind-stocks-six.vercel.app
2. Open DevTools → Network → Fetch/XHR
3. Execute a trade
4. Verify API call to `https://ind-stocks-1.onrender.com/api/trade/buy`

**Database:**
1. Backend logs show database connection
2. All operations persist to PostgreSQL
3. Data survives server restarts

---

## Project Impact

This platform helps beginner traders:
- **Learn Without Risk** - Practice with $10,000 virtual capital
- **Build Confidence** - Understand market movements before trading real money
- **Track Performance** - Analyze win rate, P&L, and trading patterns
- **Improve Skills** - Add notes to trades and learn from mistakes

**Target Users:** Beginner cryptocurrency traders, students learning about markets, anyone wanting to test trading strategies risk-free.

---

## Future Enhancements

- Multiple asset support (stocks, forex)
- Advanced charting indicators (RSI, MACD, Bollinger Bands)
- Strategy backtesting on historical data
- Social features (share strategies, leaderboards)
- Mobile app version

---

## License

MIT License

---

## Contact

**Developer:** Hardik Maheshwari  
**GitHub:** https://github.com/HardikGenOne  
**Repository:** https://github.com/HardikGenOne/IND_STOCKS