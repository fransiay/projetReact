import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../context/AuthContext";

// `role` (prop optionnelle) : si fourni, la route n'est accessible qu'à ce rôle.
export default function ProtectedRoute({ role }) {
  // useContext : lecture directe du contexte d'auth (aucun hook personnalisé).
  const { estConnecte, chargement, utilisateur } = useContext(AuthContext);

  if (chargement) {
    return <p style={{ padding: "20px" }}>Chargement en cours…</p>;
  }

  // Pas connecté → on renvoie vers l'authentification (qui propose l'inscription).
  if (!estConnecte) {
    return <Navigate to="/authentification" replace />;
  }

  // Connecté mais mauvais rôle (ex : un client sur /admin) → retour au catalogue.
  if (role && utilisateur.role !== role) {
    return <Navigate to="/catalogue" replace />;
  }

  return <Outlet />;
}
