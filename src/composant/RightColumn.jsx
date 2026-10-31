import { useContext } from "react";
import { Link } from "react-router";
import { PanierContext } from "../context/PanierContext";

function RightColumn() {
  // Consommation directe du contexte PanierContext sans hook personnalisé
  const { nombreArticles, total } = useContext(PanierContext);

  return (
    <aside className="right-column">
      <h2>Panier</h2>
      <p style={{ marginTop: "8px" }}>
        {nombreArticles} article{nombreArticles > 1 ? "s" : ""}
      </p>
      <p style={{ marginTop: "4px" }}>
        <strong>Total : {total} €</strong>
      </p>
      <Link
        to="/panier"
        style={{
          display: "inline-block",
          marginTop: "12px",
          color: "#1f3a5f",
          fontWeight: "bold",
          textDecoration: "underline",
        }}
      >
        Voir le panier →
      </Link>
    </aside>
  );
}

export default RightColumn;
