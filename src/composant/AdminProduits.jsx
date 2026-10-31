import { useState, useRef, useEffect, useContext, useCallback } from "react";
import { ProduitsContext } from "../context/ProduitsContext";

export default function AdminProduits() {

  const { produits, ajouterProduit, supprimerProduit } =
  useContext(ProduitsContext);

  const [form, setForm] = useState({ nom: "", prix: "", categorie: "" });
  const [erreur, setErreur] = useState("");

  const nomRef = useRef(null);

  useEffect(() => {
    nomRef.current?.focus();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nom = form.nom.trim();
    const prix = Number(form.prix);

    if (!nom) {
      setErreur("Le nom du produit est obligatoire.");
      return;
    }
    if (form.prix === "" || Number.isNaN(prix) || prix < 0) {
      setErreur("Le prix doit être un nombre positif.");
      return;
    }

    const res = await ajouterProduit({
      nom,
      prix,
      categorie: form.categorie.trim() || "Divers",
    });

    if (!res.ok) {
      setErreur(res.message || "Impossible d'ajouter le produit.");
      return;
    }

    setForm({ nom: "", prix: "", categorie: "" });
    setErreur("");
    nomRef.current?.focus();
  };

  return (
    <div>
      <h2>Espace administrateur — Produits</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "flex-end",
          background: "#f8f9fa",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="nom" style={{ fontWeight: "bold", fontSize: 13 }}>
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            ref={nomRef}
            type="text"
            value={form.nom}
            onChange={handleChange}
            placeholder="ex: Clavier gamer"
            style={{ padding: "8px", border: "1px solid #bbb", borderRadius: 4 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="prix" style={{ fontWeight: "bold", fontSize: 13 }}>
            Prix (€)
          </label>
          <input
            id="prix"
            name="prix"
            type="number"
            min="0"
            value={form.prix}
            onChange={handleChange}
            placeholder="ex: 99"
            style={{ padding: "8px", border: "1px solid #bbb", borderRadius: 4, width: 100 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor="categorie" style={{ fontWeight: "bold", fontSize: 13 }}>
            Catégorie
          </label>
          <input
            id="categorie"
            name="categorie"
            type="text"
            value={form.categorie}
            onChange={handleChange}
            placeholder="ex: Claviers"
            style={{ padding: "8px", border: "1px solid #bbb", borderRadius: 4 }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "9px 16px",
            background: "#1f3a5f",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Ajouter
        </button>
      </form>

      {erreur && (
        <p style={{ color: "#c0392b", marginBottom: 12 }}>{erreur}</p>
      )}

      <p style={{ color: "#666", margin: "8px 0" }}>
        {produits.length} produit(s) dans le catalogue
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {produits.map((p) => (
          <li
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              border: "1px solid #e0e0e0",
              borderRadius: 6,
              marginBottom: 6,
              background: "#fff",
            }}
          >
            <span>
              <strong>{p.nom}</strong> — {p.prix} €{" "}
              <small style={{ color: "#888" }}>({p.categorie})</small>
            </span>
            <button
              type="button"
              onClick={() => supprimerProduit(p.id)}
              style={{
                padding: "4px 10px",
                background: "#c0392b",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
