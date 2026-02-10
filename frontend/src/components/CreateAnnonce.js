import { useState } from "react";
import { createAnnonce } from "../api/api";

function CreateAnnonce({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("SERVICE");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    await createAnnonce({
      title,
      description,
      type,
      city,
      price: price === "" ? null : Number(price),
    });

    setTitle("");
    setDescription("");
    setCity("");
    setPrice("");
    setType("SERVICE");

    onCreated();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Créer une annonce</h2>

      <input placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="SERVICE">Service</option>
        <option value="OBJET">Objet</option>
        <option value="AIDE">Aide</option>
      </select>

      <input placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} required />
      <input type="number" placeholder="Prix" value={price} onChange={(e) => setPrice(e.target.value)} />

      <button type="submit">Publier</button>
    </form>
  );
}

export default CreateAnnonce;
