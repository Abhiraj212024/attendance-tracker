import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";
import "./styles/global.css";

function Root() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading authentication...</div>;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
);
