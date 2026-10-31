import { useContext } from "react";
import { NavLink, useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";
import { PanierContext } from "../context/PanierContext";

const style = ({ isActive }) => ({
  fontWeight: isActive ? "bold" : "normal",
  textDecoration: isActive ? "underline" : "none",
  color: "#fff",
});

export default function Menu() {
  // Consommation directe des contextes sans aucun hook personnalisé
  const { utilisateur, estConnecte, estAdmin, deconnecter } =
    useContext(AuthContext);
  const { nombreArticles } = useContext(PanierContext);
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnecter();
    navigate("/authentification", { replace: true });
  };

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <NavLink to="/catalogue" style={style}>
        Catalogue
      </NavLink>
      <NavLink to="/panier" style={style}>
        Panier ({nombreArticles})
      </NavLink>
      {estAdmin && (
        <NavLink to="/admin/produits" style={style}>
          Produits
        </NavLink>
      )}
      {!estConnecte && (
        <NavLink to="/inscription" style={style}>
          Inscription
        </NavLink>
      )}

      {estConnecte ? (
        <span style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "12px", color: "#eef1f5" }}>
          <span>Bonjour {utilisateur.nom}</span>
          <button
            type="button"
            onClick={handleDeconnexion}
            style={{
              padding: "4px 8px",
              background: "#c0392b",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Se déconnecter
          </button>
        </span>
      ) : (
        <NavLink to="/authentification" style={style}>
          Connexion
        </NavLink>
      )}
    </nav>
  );
}
