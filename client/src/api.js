import axios from "axios";

export const API = axios.create({
  // baseURL: "http://localhost:8080/api",

  baseURL: "https://ind-stocks-1.onrender.com/api",
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
// -----------------------------

// import axios from "axios";

// const BASE_URL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:8080/api"
//     : "https://ind-stocks-1.onrender.com/api";

// export const API = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// });

// export const signup = (data) => API.post("/auth/signup", data);
// export const login = (data) => API.post("/auth/login", data);
// export const getUser = () => API.get("/auth/me");
// export const logout = () => API.post("/auth/logout");
 
// export default API;
// ---------------------------------



