import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import { signup, login, getUser, logout } from "./api";

export default function FoodifyAuth() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(""); // 👈 error state

  useEffect(() => {
    getUser().then((res) => setUser(res.data.user)).catch(() => {});
  }, []);

  const handleSignup = async (data) => {
    try {
      setError(""); // reset any old error
      await signup(data);
      const res = await getUser();
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  const handleLogin = async (data) => {
    try {
      setError("");
      await login(data);
      const res = await getUser();
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Foodify</h1>
        <p className="subtitle">Smart Food Ordering & Delivery System</p>

        {!user ? (
          <AuthForm
            onSignup={handleSignup}
            onLogin={handleLogin}
            error={error} // 👈 pass error to form
          />
        ) : (
          <>
            <p style={{ textAlign: "center", marginBottom: "20px" }}>
              Logged in as: <b>{user.username}</b>
            </p>

            <button className="submit-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
