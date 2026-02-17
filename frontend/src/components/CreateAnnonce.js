import { useState } from "react";
import { createAnnonce, getMe, aiGenerateAnnonce } from "../api/api";

function CreateAnnonce({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("service_offer");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  // IA
  const [draft, setDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiInfo, setAiInfo] = useState(null);

  const [loading, setLoading] = useState(false);

  async function handleAI() {
    setAiError(null);
    setAiInfo(null);

    if (!draft.trim()) {
      setAiError("Écris 1 ou 2 phrases, puis clique sur “Générer avec IA”.");
      return;
    }

    try {
      setAiLoading(true);

      // optionnel: prendre ville/quartier depuis le profil (si getMe existe)
      let ville = "";
      let quartier = "";
      try {
        const me = await getMe();
        ville = me?.ville || "";
        quartier = me?.quartier || "";
      } catch {
        // pas bloquant
      }

      const data = await aiGenerateAnnonce({
        draft: draft.trim(),
        ville,
        quartier,
        type_hint: type,
        category_hint: category,
        price_hint: price,
      });

      // Remplir le formulaire avec la proposition IA
      setTitle(data.title || "");
      setDescription(data.description || "");
      setType(data.type || "service_offer");
      setCategory(data.category || "");
      setPrice(data.price === null || data.price === undefined ? "" : String(data.price));
      setIsUrgent(Boolean(data.is_urgent));

      setAiInfo("✅ Proposition IA appliquée. Tu peux modifier avant de publier.");
    } catch (e) {
      setAiError(e.message || "Erreur IA");
    } finally {
      setAiLoading(false);
    }
  }

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
      setDraft("");
      setAiError(null);
      setAiInfo(null);

      onCreated();
    } catch (error) {
      alert("Erreur création annonce");
    }

    setLoading(false);
  }

  return (
    <div className="senior-card">
      <h3 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-3">
        ➕ Créer une annonce
      </h3>

      {/* Bloc IA */}
      <div className="mb-6 p-5 rounded-3xl border-2 border-blue-100 bg-blue-50">
        <p className="text-gray-900 font-extrabold text-lg">
          🤖 Aide IA (facile)
        </p>
        <p className="text-gray-800 font-semibold mt-2">
          Écris juste 1–2 phrases. Exemple : “Je propose de réparer un ordinateur à Villemomble.”
        </p>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className="w-full mt-4 p-4 rounded-3xl border-2 border-gray-200 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
          placeholder="Ex : Je peux aider pour des courses ou bricolage léger..."
        />

        {aiError && (
          <div className="mt-4 p-4 rounded-3xl border-2 border-red-200 bg-red-50 text-red-700 font-extrabold">
            ❌ {aiError}
          </div>
        )}

        {aiInfo && (
          <div className="mt-4 p-4 rounded-3xl border-2 border-green-200 bg-green-50 text-green-800 font-extrabold">
            {aiInfo}
          </div>
        )}

        <button
          type="button"
          onClick={handleAI}
          disabled={aiLoading}
          className={`mt-4 w-full py-4 rounded-3xl font-extrabold text-lg text-white transition focus:outline-none focus:ring-4 focus:ring-blue-200 ${
            aiLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
          }`}
        >
          {aiLoading ? "Génération..." : "✨ Générer avec IA"}
        </button>

        <p className="text-sm md:text-base text-gray-700 font-semibold mt-3">
          ℹ️ L’IA peut se tromper : vérifie avant de publier.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Titre */}
        <div>
          <label className="block text-lg font-extrabold text-gray-900 mb-2">
            Titre
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:ring-4 focus:ring-blue-200"
            placeholder="Ex: Réparation ordinateur"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-lg font-extrabold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            rows="6"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:ring-4 focus:ring-blue-200"
            placeholder="Décrivez votre annonce..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Type */}
          <div>
            <label className="block text-lg font-extrabold text-gray-900 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:ring-4 focus:ring-blue-200"
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
            <label className="block text-lg font-extrabold text-gray-900 mb-2">
              Catégorie
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:ring-4 focus:ring-blue-200"
              placeholder="Ex: Informatique"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-lg font-extrabold text-gray-900 mb-2">
              Prix (€) (optionnel)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:ring-4 focus:ring-blue-200"
              placeholder="Optionnel"
            />
          </div>

          {/* Urgent */}
          <div className="flex items-center gap-4 mt-2 p-4 rounded-3xl border-2 border-gray-200 bg-gray-50">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={() => setIsUrgent(!isUrgent)}
              className="w-7 h-7"
              id="isUrgent"
            />
            <label htmlFor="isUrgent" className="text-lg font-extrabold text-gray-900">
              Marquer comme urgent
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-5 rounded-3xl font-extrabold text-lg text-white transition focus:outline-none focus:ring-4 focus:ring-blue-200 ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
          }`}
        >
          {loading ? "Publication..." : "✅ Publier l’annonce"}
        </button>
      </form>
    </div>
  );
}

export default CreateAnnonce;
