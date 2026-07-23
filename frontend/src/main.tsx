import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

if (!import.meta.env.VITE_API_URL || !import.meta.env.VITE_WS_URL) {
  console.error(
    "Missing environment variables: VITE_API_URL and VITE_WS_URL must be set."
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);