import { Link, useSearchParams } from "react-router";
import "./Mon.css";

function Sidebar() {
  const [params] = useSearchParams();
  const catActive = params.get("categorie") || "";

  const categories = [
    "Tous",
    "Claviers",
    "Souris",
    "Écrans",
    "Audio",
    "Vidéo",
    "Accessoires",
  ];

  return (
    <aside className="sidebar">
      <h2>Catégories</h2>
      <ul>
        {categories.map((cat) => {
          const isTous = cat === "Tous";
          const query = isTous ? "" : `?categorie=${encodeURIComponent(cat)}`;
          const isActive = isTous ? !catActive : catActive.toLowerCase() === cat.toLowerCase();

          return (
            <li key={cat}>
              <div
                to={`/catalogue${query}`}
                style={{
                  fontWeight: isActive ? "bold" : "normal",
                  textDecoration: isActive ? "underline" : "none",
                  display: "block",
                  padding: "4px 0",
                }}
              >
                {cat}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default Sidebar;
