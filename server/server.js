import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { db } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

function utilisateurPublic(u) {
  return { id: u.id, login: u.login, nom: u.nom, role: u.role };
}

function exigerAdmin(req, res, next) {
  const id = Number(req.header("x-user-id"));
  if (!id) return res.status(401).json({ message: "Non authentifié." });

  const u = db.prepare("SELECT role FROM utilisateurs WHERE id = ?").get(id);
  if (!u) return res.status(401).json({ message: "Utilisateur inconnu." });
  if (u.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé à l'administrateur." });
  }
  next();
}


app.post("/api/connexion", (req, res) => {
  const { login, motDePasse } = req.body ?? {};
  if (!login || !motDePasse) {
    return res.status(400).json({ message: "Login et mot de passe requis." });
  }

  const u = db.prepare("SELECT * FROM utilisateurs WHERE login = ?").get(login);

  // Message identique si login inconnu ou mot de passe faux .
  if (!u || !bcrypt.compareSync(motDePasse, u.mot_de_passe)) {
    return res.status(401).json({ message: "Identifiant ou mot de passe incorrect." });
  }

  res.json(utilisateurPublic(u));
});


app.post("/api/inscription", (req, res) => {
  const { login, motDePasse, nom } = req.body ?? {};
  if (!login || !motDePasse || !nom) {
    return res.status(400).json({ message: "Champs manquants." });
  }

  const existe = db.prepare("SELECT id FROM utilisateurs WHERE login = ?").get(login);
  if (existe) {
    return res.status(409).json({ message: "Un compte existe déjà avec cet e-mail." });
  }

  const hash = bcrypt.hashSync(motDePasse, 10);
  const info = db
    .prepare("INSERT INTO utilisateurs (login, nom, mot_de_passe, role) VALUES (?, ?, ?, 'client')")
    .run(login, nom, hash);

  const u = db.prepare("SELECT * FROM utilisateurs WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(utilisateurPublic(u));
});

// Lecture : ouverte à tous (le catalogue).
app.get("/api/produits", (_req, res) => {
  const produits = db.prepare("SELECT * FROM produits ORDER BY id").all();
  res.json(produits);
});

// Ajout : réservé à l'admin .
app.post("/api/produits", exigerAdmin, (req, res) => {
  const { nom, prix, categorie } = req.body ?? {};
  if (!nom || prix == null || Number.isNaN(Number(prix)) || Number(prix) < 0) {
    return res.status(400).json({ message: "Nom et prix valides requis." });
  }

  const info = db
    .prepare("INSERT INTO produits (nom, prix, categorie) VALUES (?, ?, ?)")
    .run(nom, Number(prix), categorie || "Divers");

  const produit = db.prepare("SELECT * FROM produits WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(produit);
});

// Suppression réservé à l'admin.
app.delete("/api/produits/:id", exigerAdmin, (req, res) => {
  db.prepare("DELETE FROM produits WHERE id = ?").run(Number(req.params.id));
  res.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});
