import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div> // avoid flash to login bug

  if (!token) return <Navigate to="/login" replace />;
  return children;
}
