import { memo } from "react";

function ProduitCard({ produit, estFavori, onToggleFavori, onAjouter, quantite }) {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px",
        margin: "10px 0",
        border: "1px solid #ddd",
        borderRadius: "6px",
        background: "#fff",
      }}
    >
      <div>
        <h4 style={{ margin: "0 0 4px 0" }}>{produit.nom}</h4>
        <p style={{ margin: 0, color: "#444" }}>{produit.prix} €</p>
        {produit.categorie && (
          <small style={{ color: "#888" }}>Catégorie : {produit.categorie}</small>
        )}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          type="button"
          onClick={() => onAjouter(produit)}
          style={{
            padding: "8px 12px",
            background: "#1f3a5f",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Ajouter au panier{quantite > 0 ? ` (${quantite})` : ""}
        </button>
        <button
          type="button"
          onClick={() => onToggleFavori(produit.id)}
          aria-pressed={estFavori}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            background: estFavori ? "#ffeaa7" : "#f1f2f6",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          {estFavori ? "★ Favori" : "☆ Ajouter"}
        </button>
      </div>
    </li>
  );
}

// Optimisation avec React.memo
export default memo(ProduitCard);

