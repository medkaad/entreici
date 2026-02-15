import { useState } from "react";
import { createAnnonce } from "../api/api";

function CreateAnnonce({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("service_offer");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await createAnnonce({
        title,
        description,
        type,
        category,
        price: price === "" ? null : Number(price),
        is_urgent: isUrgent,
      });

      // Reset
      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setType("service_offer");
      setIsUrgent(false);

      onCreated();
    } catch (error) {
      alert("Erreur création annonce");
    }

    setLoading(false);
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Créer une annonce
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Titre
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Réparation ordinateur"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Description
          </label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Décrivez votre annonce..."
          />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="service_offer">Service proposé</option>
              <option value="service_request">Service recherché</option>
              <option value="item_sale">Objet à vendre</option>
              <option value="item_request">Objet recherché</option>
              <option value="urgent_help">Aide urgente</option>
            </select>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Informatique"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Prix (€)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Optionnel"
            />
          </div>

          {/* Urgent */}
          <div className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={() => setIsUrgent(!isUrgent)}
              className="w-4 h-4 text-red-600"
            />
            <label className="text-sm font-medium text-gray-700">
              Marquer comme urgent
            </label>
          </div>

        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Publication..." : "Publier l’annonce"}
        </button>

      </form>
    </div>
  );
}

export default CreateAnnonce;
