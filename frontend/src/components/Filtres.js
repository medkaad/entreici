import { useState } from "react";

function Filtres({ onFilter }) {
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onFilter({
      type,
      city,
      max_price: maxPrice,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Filtres</h3>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Tous</option>
        <option value="SERVICE">Service</option>
        <option value="OBJET">Objet</option>
        <option value="AIDE">Aide</option>
      </select>

      <input placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} />
      <input type="number" placeholder="Prix max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />

      <button>Rechercher</button>
    </form>
  );
}

export default Filtres;
