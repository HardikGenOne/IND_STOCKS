import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:8080/api",

  // baseURL: "https://ind-stocks-1.onrender.com/api",
  withCredentials: true, // send cookies
});

// signup
export const signup = (data) => API.post("/auth/signup", data);

// login
export const login = (data) => API.post("/auth/login", data);

// logged in user
export const getUser = () => API.get("/auth/me");

// logout
export const logout = () => API.post("/auth/logout");

export const getPortfolio = async () => {
  return await API.get("/trade/portfolio");
};

export const buyStock = async (symbol, price, quantity) => {
  return await API.post("/trade/buy", { symbol, price, quantity });
};

export const sellStock = async (symbol, price, quantity) => {
  return await API.post("/trade/sell", { symbol, price, quantity });
};

export const getTradeHistory = async (params) => {
  // Params looks like: { page: 1, limit: 10, search: 'BTC', type: 'BUY' }
  return await API.get("/trade/history", { params });
};

// ========================================
// NEW CRUD OPERATIONS FOR COLLEGE SUBMISSION
// ========================================

// UPDATE Operations
export const updateTradeNote = async (tradeId, note) => {
  return await API.put(`/trade/trade/${tradeId}/note`, { note });
};

export const updateUserProfile = async (username, email) => {
  return await API.put(`/trade/user/profile`, { username, email });
};

// DELETE Operations
export const deleteTrade = async (tradeId) => {
  return await API.delete(`/trade/trade/${tradeId}`);
};

export const resetTradeHistory = async () => {
  return await API.delete(`/trade/history/reset`);
};
