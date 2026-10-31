import { useContext } from "react";
import { Link } from "react-router";
import { PanierContext } from "../context/PanierContext";
import DetailPanier from "./DetailPanier";

export default function Panier() {
  // Consommation directe du contexte PanierContext 
  
  const { lignes, total, changerQuantite, retirer, vider, QUANTITE_MAX } =
    useContext(PanierContext);

  const handleVider = () => {
    if (window.confirm("Voulez-vous vraiment vider votre panier ?")) {
      vider();
    }
  };

  if (lignes.length === 0) {
    return (
      <div>
        <h2>Votre Panier</h2>
        <p style={{ margin: "16px 0" }}>Votre panier est actuellement vide.</p>
        <Link
          to="/catalogue"
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#1f3a5f",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Retourner au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Votre Panier</h2>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "16px" }}>
        {lignes.map((l) => (
          <DetailPanier
            key={l.id}
            ligne={l}
            max={QUANTITE_MAX}
            onChangerQuantite={changerQuantite}
            onRetirer={retirer}
          />
        ))}
      </ul>
      <p style={{ marginTop: "20px", fontSize: "18px" }}>
        <strong>Total de la commande : {total} €</strong>
      </p>
      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={handleVider}
          style={{
            padding: "8px 16px",
            background: "#c0392b",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Vider le panier
        </button>
        <Link
          to="/catalogue"
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#1f3a5f",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}

