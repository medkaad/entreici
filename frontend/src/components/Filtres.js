import { useState } from "react";

function Filtres({ onFilter }) {
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    const filters = {};

    if (type) filters.type = type;
    if (category) filters.category = category;
    if (urgentOnly) filters.is_urgent = true;

    onFilter(filters);
  }

  function handleReset() {
    setType("");
    setCategory("");
    setUrgentOnly(false);

    onFilter({});
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8">

      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Filtres
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-3 gap-4 items-end"
      >

        {/* Type */}
        <div>
          <label className="block text-sm mb-1">Type</label>
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
          <label className="block text-sm mb-1">Catégorie</label>
          <input
            type="text"
            placeholder="Ex: Informatique"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Urgent */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={urgentOnly}
            onChange={(e) => setUrgentOnly(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-sm">
            Urgent uniquement
          </label>
        </div>

        {/* Buttons */}
        <div className="md:col-span-3 flex gap-4 mt-4">
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
