import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { AuthContext } from "./AuthContext";

// Contexte des produits 
export const ProduitsContext = createContext(null);

export function ProduitsProvider({ children }) {

  const { utilisateur } = useContext(AuthContext);

  // useState : la liste des produits reçue de l'API.
  const [produits, setProduits] = useState([]);

  // useEffect : au montage (deps []), on charge le catalogue depuis l'API.
  useEffect(() => {
    fetch("/api/produits")
      .then((r) => r.json())
      .then((data) => setProduits(data))
      .catch(() => setProduits([]));
  }, []);

 
  const ajouterProduit = useCallback(
    async (donnees) => {
      try {
        const res = await fetch("/api/produits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": utilisateur?.id ?? "",
          },
          body: JSON.stringify(donnees),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, message: data.message };

        // Le serveur renvoie le produit créé (avec son id) → on l'ajoute.
        setProduits((prev) => [...prev, data]);
        return { ok: true };
      } catch {
        return { ok: false, message: "Serveur injoignable." };
      }
    },
    [utilisateur]
  );

  const supprimerProduit = useCallback(
    async (id) => {
      try {
        const res = await fetch(`/api/produits/${id}`, {
          method: "DELETE",
          headers: { "x-user-id": utilisateur?.id ?? "" },
        });
        if (!res.ok) return { ok: false };

        setProduits((prev) => prev.filter((p) => p.id !== id));
        return { ok: true };
      } catch {
        return { ok: false };
      }
    },
    [utilisateur]
  );

  // useMemo : objet du contexte mémorisé pour éviter des réaffichages inutiles.
  const value = useMemo(
    () => ({ produits, ajouterProduit, supprimerProduit }),
    [produits, ajouterProduit, supprimerProduit]
  );

  return (
    <ProduitsContext.Provider value={value}>
      {children}
    </ProduitsContext.Provider>
  );
}
