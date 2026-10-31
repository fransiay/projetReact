import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProduitsProvider } from "./context/ProduitsContext.jsx";
import { PanierProvider } from "./context/PanierContext.jsx";
import "./composant/Mon.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProduitsProvider>
          <PanierProvider>
            <App />
          </PanierProvider>
        </ProduitsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
