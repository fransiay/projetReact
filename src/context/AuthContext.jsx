import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // useState : l'utilisateur connecté (null si personne). Il contient son rôle,
  // renvoyé par l'API (donc lu dans la base).
  const [utilisateur, setUtilisateur] = useState(null);
  // useState : vrai tant qu'on n'a pas fini de relire la session sauvegardée.
  const [chargement, setChargement] = useState(true);

  // useEffect : au montage seulement (deps []), on restaure la session locale.
  useEffect(() => {
    try {
      const sauvegarde = localStorage.getItem("utilisateur");
      if (sauvegarde) setUtilisateur(JSON.parse(sauvegarde));
    } catch (e) {
      console.error("Erreur lors de la lecture de la session :", e);
    }
    setChargement(false);
  }, []);

  // useCallback : connecter via l'API. async car on attend la réponse réseau.
  // Renvoie { ok, user?, message? }. Le rôle est dans user (venu de la base).
  const connecter = useCallback(async (login, motDePasse) => {
    try {
      const res = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, motDePasse }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message };

      setUtilisateur(data);
      localStorage.setItem("utilisateur", JSON.stringify(data));
      return { ok: true, user: data };
    } catch {
      return { ok: false, message: "Serveur injoignable. Lance le backend." };
    }
  }, []);

  // useCallback : inscrire un nouveau CLIENT via l'API, puis le connecter.
  const inscrire = useCallback(async (donnees) => {
    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, message: data.message };

      setUtilisateur(data);
      localStorage.setItem("utilisateur", JSON.stringify(data));
      return { ok: true, user: data };
    } catch {
      return { ok: false, message: "Serveur injoignable. Lance le backend." };
    }
  }, []);

  // useCallback : déconnecter (identité stable, sans dépendance).
  const deconnecter = useCallback(() => {
    setUtilisateur(null);
    localStorage.removeItem("utilisateur");
  }, []);

  // useMemo : valeur du contexte mémorisée pour éviter des réaffichages inutiles.
  const value = useMemo(() => {
    return {
      utilisateur,
      estConnecte: utilisateur !== null,
      estAdmin: utilisateur?.role === "admin",
      role: utilisateur?.role ?? null,
      chargement,
      connecter,
      inscrire,
      deconnecter,
    };
  }, [utilisateur, chargement, connecter, inscrire, deconnecter]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
