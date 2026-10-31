import { useState, useRef, useEffect, useContext } from "react";
import { Navigate, useNavigate, Link } from "react-router";
import { AuthContext } from "../context/AuthContext";

export default function Authentification() {
  // Consommation directe du contexte AuthContext 
  const { connecter, estConnecte, utilisateur } = useContext(AuthContext);
  const navigate = useNavigate();

  // États contrôlés avec useState

  const [login, setLogin] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");

  const loginRef = useRef(null);

  useEffect(() => {
    loginRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await connecter(login.trim(), motDePasse);
    if (res.ok) {

      navigate(res.user.role === "admin" ? "/admin/produits" : "/catalogue", {
        replace: true,
      });
    } else {
      setErreur(res.message || "Identifiant ou mot de passe incorrect.");
      setMotDePasse("");
    }
  };

  // Déjà connecté : on l'envoie vers sa page selon son rôle.
  if (estConnecte) {
    return (
      <Navigate
        to={utilisateur.role === "admin" ? "/admin/produits" : "/catalogue"}
        replace
      />
    );
  }

  return (
    <div style={{ maxWidth: 360, margin: "20px auto", padding: "20px", background: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ marginBottom: "16px", color: "#1f3a5f" }}>Authentification</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="login" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Identifiant
          </label>
          <input
            id="login"
            ref={loginRef}
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="ex: alice ou bob"
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #bbb" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="motdepasse" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
            Mot de passe
          </label>
          <input
            id="motdepasse"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="ex: react123 ou hooks456"
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #bbb" }}
          />
        </div>

        {erreur && (
          <p style={{ color: "#c0392b", margin: "8px 0", fontSize: "14px" }}>
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={!login || !motDePasse}
          style={{
            width: "100%",
            padding: "10px",
            background: "#1f3a5f",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: "8px",
          }}
        >Se Connecter
        </button>
      </form>

      <p style={{ marginTop: "16px", fontSize: "14px", textAlign: "center" }}>
        Pas encore de compte ?{" "}
        <Link to="/inscription" style={{ color: "#1f3a5f" }}>
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
