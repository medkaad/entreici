import { useState } from "react";
import { createAnnonce } from "../api/api";
import { useToast } from "../ui/Toast";

function CreateAnnonce({ onCreated }) {
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("service_offer");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function validate() {
    if (!title.trim()) return "Merci d’indiquer un titre.";
    if (title.trim().length < 5) return "Le titre doit faire au moins 5 caractères.";
    if (!description.trim()) return "Merci d’écrire une description.";
    if (description.trim().length < 10) return "La description doit faire au moins 10 caractères.";
    if (!category.trim()) return "Merci d’indiquer une catégorie.";
    if (price !== "" && Number(price) < 0) return "Le prix ne peut pas être négatif.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const err = validate();
    if (err) {
      setError(err);
      toast.info(err);
      return;
    }

    try {
      setLoading(true);

      await createAnnonce({
        title: title.trim(),
        description: description.trim(),
        type,
        category: category.trim(),
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

      toast.success("Annonce publiée ✅");

      if (typeof onCreated === "function") onCreated();
    } catch (error) {
      console.error(error);
      const m = error?.message || "Erreur : impossible de publier l’annonce.";
      setError(m);
      toast.error(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="senior-card">
      <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
        ➕ Créer une annonce
      </h3>

      <p className="text-gray-700 text-lg mb-6">
        Remplissez les champs ci-dessous puis cliquez sur <b>Publier l’annonce</b>.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-5 rounded-3xl mb-6 text-lg">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
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
            className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            placeholder="Ex : Besoin d’aide pour les courses"
            disabled={loading}
          />
          <p className="mt-2 text-base text-gray-600 font-semibold">
            Exemple : “Réparation ordinateur”, “Cours de français”, “Vends vélo”.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-lg font-extrabold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            placeholder="Expliquez ce que vous proposez ou recherchez (où, quand, détails utiles)…"
            disabled={loading}
          />
          <p className="mt-2 text-base text-gray-600 font-semibold">
            Astuce : indiquez le lieu, la disponibilité, et ce qui est attendu.
          </p>
        </div>

        {/* Type / Catégorie / Prix */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Type */}
          <div>
            <label className="block text-lg font-extrabold text-gray-900 mb-2">
              Type d’annonce
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg bg-white focus:outline-none focus:ring-4 focus:ring-blue-200"
              disabled={loading}
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
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              placeholder="Ex : Informatique, Courses, Bricolage..."
              disabled={loading}
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
              className="w-full border-2 border-gray-300 rounded-3xl px-5 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              placeholder="Laissez vide si gratuit"
              disabled={loading}
              min="0"
            />
          </div>

          {/* Urgent */}
          <div className="flex items-center gap-4 md:mt-8">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={() => setIsUrgent(!isUrgent)}
              className="w-7 h-7"
              disabled={loading}
              id="urgent"
            />
            <label htmlFor="urgent" className="text-lg font-extrabold text-gray-900">
              ⚠ Marquer comme urgent
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-5 rounded-3xl font-extrabold text-lg transition shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-blue-700 text-white hover:bg-blue-800"
          }`}
        >
          {loading ? "Publication..." : "✅ Publier l’annonce"}
        </button>

        <div className="p-5 rounded-3xl bg-gray-50 border border-gray-200">
          <p className="text-base text-gray-800 font-semibold">
            Besoin d’aide ? Cliquez sur le bouton <b>❓ Aide</b> en bas à droite.
          </p>
        </div>
      </form>
    </div>
  );
}

export default CreateAnnonce;
