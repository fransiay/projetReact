import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { AuthContext } from "./AuthContext";

// Contexte du panier 
export const PanierContext = createContext(null);

export const QUANTITE_MAX = 10;
const PREFIXE_CLE = "panier-";

// Lecture du stockage local
function lireStockage(cle) {
  try {
    const valeur = JSON.parse(localStorage.getItem(cle));
    return Array.isArray(valeur) ? valeur : [];
  } catch {
    return [];
  }
}

function PanierInterne({ cle, children }) {
  // Initialisation paresseuse : lecture au premier rendu seulement
  const [lignes, setLignes] = useState(() => (cle ? lireStockage(cle) : []));

  // Sauvegarde à chaque modification du panier
  useEffect(() => {
    if (!cle) return;
    localStorage.setItem(cle, JSON.stringify(lignes));
  }, [cle, lignes]);

  const ajouter = useCallback((produit) => {
    setLignes((prev) => {
      const existante = prev.find((l) => l.id === produit.id);
      if (!existante) {
        return [
          ...prev,
          {
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            quantite: 1,
          },
        ];
      }
      if (existante.quantite >= QUANTITE_MAX) return prev;
      return prev.map((l) =>
        l.id === produit.id ? { ...l, quantite: l.quantite + 1 } : l
      );
    });
  }, []);

  const changerQuantite = useCallback((id, variation) => {
    setLignes((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              quantite: Math.min(
                QUANTITE_MAX,
                Math.max(1, l.quantite + variation)
              ),
            }
          : l
      )
    );
  }, []);

  const retirer = useCallback((id) => {
    setLignes((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const vider = useCallback(() => {
    setLignes([]);
  }, []);

  // Valeurs dérivées mémorisées avec useMemo
  const nombreArticles = useMemo(
    () => lignes.reduce((somme, l) => somme + l.quantite, 0),
    [lignes]
  );

  const total = useMemo(
    () => lignes.reduce((somme, l) => somme + l.prix * l.quantite, 0),
    [lignes]
  );

  const quantites = useMemo(() => {
    const resultat = {};
    for (const l of lignes) {
      resultat[l.id] = l.quantite;
    }
    return resultat;
  }, [lignes]);

  const value = useMemo(() => {
    return {
      lignes,
      quantites,
      nombreArticles,
      total,
      ajouter,
      changerQuantite,
      retirer,
      vider,
      QUANTITE_MAX,
    };
  }, [lignes, quantites, nombreArticles, total, ajouter, changerQuantite, retirer, vider]);

  return (
    <PanierContext.Provider value={value}>{children}</PanierContext.Provider>
  );
}

// Composant enveloppe utilisant useContext(AuthContext) directement
export function PanierProvider({ children }) {
  const auth = useContext(AuthContext);
  const utilisateur = auth ? auth.utilisateur : null;
  const cle = utilisateur ? PREFIXE_CLE + utilisateur.login : null;

  return (
    <PanierInterne key={cle ?? "anonyme"} cle={cle}>
      {children}
    </PanierInterne>
  );
}

