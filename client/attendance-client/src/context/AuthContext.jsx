import { createContext, useState } from "react";
import api from "../services/api"
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const login = (t) => {
    console.log(`LOGIN called with token:\n ${t}`);
    setToken(t); // memory only
  };

  const logout = async () => {
    setToken(null);
    await api.post('/logout') // implement later
  };

  return (
    <AuthContext.Provider value={{ token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
