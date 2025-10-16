import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { setupNetworkErrorHandling } from "./errorHandling"

// Setup network error handling in development
setupNetworkErrorHandling();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
