import { Routes, Route, Navigate } from "react-router";
import Layout from "./composant/Layout";
import Catalogue from "./composant/Catalogue";
import Panier from "./composant/Panier";
import Authentification from "./composant/Authentification";
import Inscription from "./composant/Inscription";
import AdminProduits from "./composant/AdminProduits";
import ProtectedRoute from "./composant/ProtectedRoute";import { Import } from "lucide-react";


function App() {
  
  return (
    <Routes>

      <Route path="/authentification" element={<Authentification />} />
      <Route path="/login" element={<Authentification />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route element={<Layout />}>
      <Route element={<ProtectedRoute />}>
      <Route path="/catalogue" element={<Catalogue />} />
      <Route path="/panier" element={<Panier />} />
      </Route>

        <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin/produits" element={<AdminProduits />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/catalogue" replace />} />
      <Route path="/sidebar" element={<Navigate to="/catalogue" replace />} />
      <Route path="/rightColumn" element={<Navigate to="/panier" replace />} />
      <Route path="/content" element={<Navigate to="/catalogue" replace />} />
      <Route path="*" element={<Navigate to="/catalogue" replace />} />
    </Routes>

    
  );
}

export default App;
