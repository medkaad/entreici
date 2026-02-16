import { useEffect, useState } from "react";
import { getQuartiers } from "../api/api";

function Filtres({ onFilter }) {
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);

  const [ville, setVille] = useState("");
  const [quartiers, setQuartiers] = useState([]);
  const [quartier, setQuartier] = useState("");

  // ✅ charge quartiers de la ville du user (backend renvoie ville + quartiers)
  useEffect(() => {
    async function loadQuartiers() {
      try {
        const res = await getQuartiers();
        setVille(res.ville || "");
        setQuartiers(res.quartiers || []);
      } catch (e) {
        console.error("Erreur quartiers:", e);
        setQuartiers([]);
      }
    }
    loadQuartiers();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    const filters = {};
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (urgentOnly) filters.is_urgent = true;
    if (quartier) filters.quartier = quartier;

    onFilter(filters);
  }

  function handleReset() {
    setType("");
    setCategory("");
    setUrgentOnly(false);
    setQuartier("");
    onFilter({});
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8 border border-gray-100">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Filtres</h3>

        {/* ✅ Ville forcée (pro UX) */}
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border">
          📍 Ville : <span className="font-semibold text-gray-900">{ville || "—"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4 items-end">
        {/* Type */}
        <div>
          <label className="block text-sm mb-1 text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            <option value="service_offer">Service proposé</option>
            <option value="service_request">Service recherché</option>
            <option value="item_sale">Objet à vendre</option>
            <option value="item_request">Objet recherché</option>
            <option value="urgent_help">Aide urgente</option>
          </select>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm mb-1 text-gray-700">Catégorie</label>
          <input
            type="text"
            placeholder="Ex: Informatique"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quartier (dynamique) */}
        <div>
          <label className="block text-sm mb-1 text-gray-700">Quartier</label>
          <select
            value={quartier}
            onChange={(e) => setQuartier(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous</option>
            {quartiers.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Quartiers disponibles pour ta ville.
          </p>
        </div>

        {/* Urgent */}
        <div className="flex items-center gap-2 md:justify-end">
          <input
            type="checkbox"
            checked={urgentOnly}
            onChange={(e) => setUrgentOnly(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-sm text-gray-700">Urgent uniquement</label>
        </div>

        {/* Buttons */}
        <div className="md:col-span-4 flex gap-4 mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Appliquer
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default Filtres;
