export default function BarreRecherche({ valeur, onChange, onEffacer, inputRef }) {
  return (
    <div style={{ display: "flex", gap: "8px", margin: "12px 0" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Rechercher un produit…"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />
      {valeur && (
        <button
          type="button"
          onClick={onEffacer}
          style={{
            padding: "8px 14px",
            background: "#e5e7eb",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Effacer
        </button>
      )}
    </div>
  );
}

