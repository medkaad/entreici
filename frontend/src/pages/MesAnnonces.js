import { useEffect, useState } from "react";
import { getMyAnnonces, deleteAnnonce, updateAnnonce } from "../api/api";

function MesAnnonces() {
  const [annonces, setAnnonces] = useState([]);

  async function loadAnnonces() {
    try {
      const data = await getMyAnnonces();
      setAnnonces(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    }
  }

  useEffect(() => {
    loadAnnonces();
  }, []);

  async function handleDelete(id) {
    await deleteAnnonce(id);
    loadAnnonces();
  }

  async function handleStatusChange(id, status) {
    await updateAnnonce(id, { status });
    loadAnnonces();
  }

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">Mes Annonces</h2>

      {annonces.length === 0 && <p>Aucune annonce créée.</p>}

      {annonces.map((a) => (
        <div key={a.id} className="border p-6 mb-4 rounded-xl shadow">
          <h3 className="text-xl font-semibold">{a.title}</h3>
          <p>{a.description}</p>
          <p className="text-sm text-gray-500">
            Statut: {a.status}
          </p>

          <div className="flex gap-4 mt-4">
            <select
              value={a.status}
              onChange={(e) =>
                handleStatusChange(a.id, e.target.value)
              }
              className="border px-2 py-1 rounded"
            >
              <option value="active">Active</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>

            <button
              onClick={() => handleDelete(a.id)}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MesAnnonces;
