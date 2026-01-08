import { createContext, useState, useEffect } from "react";
import api from "../services/api"
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = (t) => {
    console.log(`LOGIN called with token:\n ${t}`);
    setToken(t); // memory only
  };

  const logout = async () => {
    setToken(null);
    await api.post('/logout')
  };

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await api.post("/refresh");
        setToken(res.data.accessToken);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
