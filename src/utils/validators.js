export function nettoyerNom(value) {
  return (value ?? "").replace(/[^\p{L}\s'-]/gu, "");
}

export function validerInscription(form) {
  const erreurs = {};

  if (!form.nom || !form.nom.trim()) {
    erreurs.nom = "Le nom est obligatoire.";
  }

  if (!form.prenom || !form.prenom.trim()) {
    erreurs.prenom = "Le prénom est obligatoire.";
  }

  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    erreurs.email = "Saisis une adresse e-mail valide.";
  }

  if (!form.password) {
    erreurs.password = "Le mot de passe est obligatoire.";
  }

  if (form.confirmation !== form.password) {
    erreurs.confirmation = "Les mots de passe ne correspondent pas.";
  }

  if (!form.cgu) {
    erreurs.cgu = "Tu dois accepter les conditions d'utilisation.";
  }

  return erreurs;
}

