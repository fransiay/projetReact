// Base de données SQLite via le module intégré de Node (aucune dépendance native).
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Chemin absolu du fichier de base, à côté de ce fichier (server/data.db).
const __dirname = dirname(fileURLToPath(import.meta.url));
export const db = new DatabaseSync(join(__dirname, "data.db"));

// --- Schéma : le RÔLE est une colonne de la table utilisateurs ---
db.exec(`
  CREATE TABLE IF NOT EXISTS utilisateurs (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    login          TEXT    NOT NULL UNIQUE,
    nom            TEXT    NOT NULL,
    mot_de_passe   TEXT    NOT NULL,              -- haché avec bcrypt, jamais en clair
    role           TEXT    NOT NULL DEFAULT 'client'  -- 'admin' ou 'client'
  );

  CREATE TABLE IF NOT EXISTS produits (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nom       TEXT    NOT NULL,
    prix      REAL    NOT NULL,
    categorie TEXT    NOT NULL DEFAULT 'Divers'
  );
`);


const admin = db
  .prepare("SELECT id FROM utilisateurs WHERE role = 'admin' LIMIT 1")
  .get();

  // initiation du login de l'admin

if (!admin) {
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO utilisateurs (login, nom, mot_de_passe, role) VALUES (?, ?, ?, 'admin')"
  ).run("admin@site.fr", "Administrateur", hash);
  console.log(
    " Compte admin créé en base : admin@site.fr / admin@242."
  );
}

const nbProduits = db.prepare("SELECT COUNT(*) AS n FROM produits").get();
if (nbProduits.n === 0) {
  const insert = db.prepare(
    "INSERT INTO produits (nom, prix, categorie) VALUES (?, ?, ?)"
  );
  const base = [
    ["Clavier mécanique", 89, "Claviers"],
    ["Souris sans fil", 35, "Souris"],
    ["Écran 27 pouces", 249, "Écrans"],
    ["Casque audio", 120, "Audio"],
    ["Webcam HD", 59, "Vidéo"],
  ];
  for (const [nom, prix, categorie] of base) insert.run(nom, prix, categorie);
  console.log(" Produits de départ insérés en base.");
}
