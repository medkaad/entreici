import { useState } from "react";
import { createAnnonce } from "./api";

function CreateAnnonce({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("SERVICE");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createAnnonce({
        title,
        description,
        type,
        price: price === "" ? null : Number(price),
        city,
      });

      // reset form
      setTitle("");
      setDescription("");
      setType("SERVICE");
      setPrice("");
      setCity("");

      onCreated();
    } catch (err) {
      setError("Erreur lors de la création de l’annonce");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
      <h2>Créer une annonce</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>Titre</label><br />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Description</label><br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Type</label><br />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="SERVICE">Service</option>
          <option value="OBJET">Objet</option>
          <option value="AIDE">Aide</option>
        </select>
      </div>

      <div>
        <label>Ville</label><br />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Prix (€)</label><br />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Publication..." : "Publier l’annonce"}
      </button>
    </form>
  );
}

export default CreateAnnonce;
