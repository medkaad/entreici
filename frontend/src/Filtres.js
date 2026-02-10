import { useState } from "react";

function Filtres({ onFilter }) {
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onFilter({
      type: type || undefined,
      city: city || undefined,
      max_price: maxPrice || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <h3>Filtres</h3>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Tous les types</option>
        <option value="SERVICE">Service</option>
        <option value="OBJET">Objet</option>
        <option value="AIDE">Aide</option>
      </select>

      <input
        type="text"
        placeholder="Ville"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ marginLeft: 10 }}
      />

      <input
        type="number"
        placeholder="Prix max"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        style={{ marginLeft: 10 }}
      />

      <button type="submit" style={{ marginLeft: 10 }}>
        Rechercher
      </button>
    </form>
  );
}

export default Filtres;
