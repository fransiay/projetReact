import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../context/AuthContext";
import styles from "./Inscription.module.css";
import { validerInscription, nettoyerNom } from "../utils/validators";

const CHAMPS_NOM = ["nom", "prenom"];

function Inscription() {
  const { inscrire } = useContext(AuthContext);
  const navigate = useNavigate();

  // Un seul état objet pour tous les champs du formulaire
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmation: "",
    cgu: false,
  });

  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);
  const [erreurs, setErreurs] = useState({});

  const nomRef = useRef(null);

  useEffect(() => {
    // nomRef.current est l'élément <input> réel du DOM ; .focus() y place le curseur

    nomRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Valeur à enregistrer : booléen pour une checkbox, texte pour les autres champs

    let nouvelleValeur = type === "checkbox" ? checked : value;

    // Message à afficher sous le champ (undefined = aucun message)
    let messageChamp;

    // AJOUT NOM : pour le nom et le prénom, on retire les chiffres et caractères spéciaux

    if (CHAMPS_NOM.includes(name)) {
      const nettoye = nettoyerNom(value);

      // Si la valeur a changé, c'est qu'un caractère interdit a été tapé ou collé
      if (nettoye !== value) {
        messageChamp = "Chiffres et caractères spéciaux interdits.";
      }
      nouvelleValeur = nettoye;
    }

    setForm((prev) => ({
      ...prev,
      [name]: nouvelleValeur,
    }));
    setErreurs((prev) => ({ ...prev, [name]: messageChamp }));
    console.log(e.target.name, e.target.value);
  };

  // Fonction appelée à l'envoi du formulaire 
  const handleSubmit = async (e) => {
    e.preventDefault();


    const erreursForm = validerInscription(form);
    
    // Enregistre les erreurs pour les afficher sous chaque champ
    setErreurs(erreursForm);
    // Objet non vide : au moins un champ est invalide
    if (Object.keys(erreursForm).length > 0) {
      setErreur("");
      setSucces(false);
      // Arrête la fonction : rien n'est enregistré
      return;
    }

    // Inscription via l'API (l'e-mail sert d'identifiant). On attend la réponse.
    const res = await inscrire({
      login: form.email,
      motDePasse: form.password,
      nom: `${form.prenom} ${form.nom}`.trim(),
    });

    if (!res.ok) {
      setErreur(res.message);
      setSucces(false);
      return;
    }

    setErreur("");
    setSucces(true);
    navigate("/catalogue", { replace: true });
  };

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate autoComplete="off">
        <h1>Créer un compte</h1>

        <div className={styles.champ}>
          <label htmlFor="nom">Nom</label>

          {/* AJOUT : ref={nomRef} relie cet <input> à la référence : React la remplit avec l'élément */}
          <input
            type="text"
            id="nom"
            name="nom"
            ref={nomRef}
            value={form.nom}
            onChange={handleChange}
          />
          {erreurs.nom && <small className={styles.erreur}>{erreurs.nom}</small>}
        </div>

        <div className={styles.champ}>
          <label htmlFor="prenom">Prénom</label>
          <input type="text" id="prenom" name="prenom" value={form.prenom} onChange={handleChange} />
          {erreurs.prenom && <small className={styles.erreur}>{erreurs.prenom}</small>}
        </div>

        <div className={styles.champ}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="nom@exemple.fr"
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
          />
          {erreurs.email && <small className={styles.erreur}>{erreurs.email}</small>}
        </div>

        <div className={styles.champ}>
          <label htmlFor="password">Mot de passe</label>
          <input type="password" id="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
          {erreurs.password && <small className={styles.erreur}>{erreurs.password}</small>}
        </div>

        <div className={styles.champ}>
          <label htmlFor="confirmation">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmation"
            name="confirmation"
            value={form.confirmation}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {erreurs.confirmation && <small className={styles.erreur}>{erreurs.confirmation}</small>}
        </div>

        <div className={`${styles.champ} ${styles.champCase}`}>
          <input type="checkbox" id="cgu" name="cgu" checked={form.cgu} onChange={handleChange} />
          <label htmlFor="cgu">J'accepte les conditions d'utilisation</label>

          {/* AJOUT VALIDATION  */}
          {erreurs.cgu && <small className={styles.erreur}>{erreurs.cgu}</small>}
        </div>

        {erreur && <p className={styles.erreur}>{erreur}</p>}
        {succes && <p className={styles.succes}>Inscription réussie, {form.prenom} !</p>}

        <button type="submit">S'inscrire</button>

        <p className={styles.lien}>
          Déjà un compte ? <Link to="/authentification">Se Connecter </Link>
        </p>
      </form>
    </main>
  );
}

export default Inscription;
