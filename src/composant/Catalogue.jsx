import { useState, useMemo, useRef, useEffect, useCallback, useContext } from "react";
import { useSearchParams } from "react-router";
import { PanierContext } from "../context/PanierContext";
import { ProduitsContext } from "../context/ProduitsContext";
import { normaliser } from "../utils/texte";
import BarreRecherche from "./BarreRecherche";
import ProduitCard from "./ProduitCard";

export default function Catalogue() {
  // Consommation directe du contexte du panier 

  const { ajouter, quantites } = useContext(PanierContext);

  // Liste des produits lue depuis le contexte 
  const { produits } = useContext(ProduitsContext);

  // Gestion des paramètres URL avec react-router
  const [params, setParams] = useSearchParams();

  // États locaux avec useState
  const [saisie, setSaisie] = useState(params.get("q") ?? "");
  const [terme, setTerme] = useState(saisie);
  const [favoris, setFavoris] = useState([]);

  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerme(saisie);
    }, 300);

    return () => clearTimeout(timer);
  }, [saisie]);

  useEffect(() => {
    const qActuel = params.get("q") ?? "";
    if (qActuel === terme) return;

    const newParams = new URLSearchParams(params);
    if (terme) {
      newParams.set("q", terme);
    } else {
      newParams.delete("q");
    }
    setParams(newParams, { replace: true });
  }, [terme, params, setParams]);

  // Filtrage mémorisé avec useMemo
  const categorieActive = params.get("categorie") || "";

  const produitsFiltres = useMemo(() => {
    const t = normaliser(terme);
    return produits.filter((p) => {
      const matchNom = normaliser(p.nom).includes(t);
      const matchCat = categorieActive
        ? p.categorie?.toLowerCase() === categorieActive.toLowerCase()
        : true;
      return matchNom && matchCat;
    });
  }, [produits, terme, categorieActive]);

  // Callback mémorisé avec useCallback
  const toggleFavori = useCallback((id) => {
    setFavoris((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const effacer = () => {
    setSaisie("");
    inputRef.current?.focus();
  };

  return (
    <div>
      <h2>Catalogue des produits</h2>

      {categorieActive && (
        <p style={{ margin: "8px 0", color: "#1f3a5f" }}>
          Filtre catégorie : <strong>{categorieActive}</strong>
        </p>
      )}

      <BarreRecherche
        valeur={saisie}
        onChange={setSaisie}
        onEffacer={effacer}
        inputRef={inputRef}
      />

      <p style={{ margin: "10px 0", color: "#666" }}>
        {produitsFiltres.length} résultat(s)
        {saisie !== terme && <small> – recherche en cours…</small>}
      </p>

      {produitsFiltres.length === 0 && (
        <p>Aucun produit ne correspond à « {terme} ».</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {produitsFiltres.map((p) => (
          <ProduitCard
            key={p.id}
            produit={p}
            estFavori={favoris.includes(p.id)}
            onToggleFavori={toggleFavori}
            onAjouter={ajouter}
            quantite={quantites[p.id] ?? 0}
          />
        ))}
      </ul>
    </div>
  );
}

