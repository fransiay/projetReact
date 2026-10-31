import { memo } from "react";

function DetailPanier({ ligne, max, onChangerQuantite, onRetirer }) {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div>
        <strong>{ligne.nom}</strong>
        <span style={{ color: "#555", marginLeft: "8px" }}>– {ligne.prix} €</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={() => onChangerQuantite(ligne.id, -1)}
          disabled={ligne.quantite <= 1}
          style={{ width: "28px", height: "28px", cursor: "pointer" }}
        >
          −
        </button>
        <span style={{ minWidth: "20px", textAlign: "center" }}>{ligne.quantite}</span>
        <button
          type="button"
          onClick={() => onChangerQuantite(ligne.id, 1)}
          disabled={ligne.quantite >= max}
          style={{ width: "28px", height: "28px", cursor: "pointer" }}
        >
          +
        </button>
        <strong style={{ minWidth: "60px", textAlign: "right" }}>
          = {ligne.prix * ligne.quantite} €
        </strong>
        <button
          type="button"
          onClick={() => onRetirer(ligne.id)}
          style={{
            marginLeft: "8px",
            color: "#c0392b",
            background: "none",
            border: "1px solid #c0392b",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}


export default memo(DetailPanier);

