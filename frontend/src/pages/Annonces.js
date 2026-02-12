import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAnnonces, createConversation } from "../api/api";
import CreateAnnonce from "../components/CreateAnnonce";
import Filtres from "../components/Filtres";

function Annonces() {
  const [annonces, setAnnonces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const currentUserEmail = localStorage.getItem("user_email");

  const loadAnnonces = async (filters = {}) => {
    try {
      const data = await getAnnonces(filters);
      const allAnnonces = Array.isArray(data) ? data : data.results || [];

      // 🔥 Exclure mes annonces
      const autresAnnonces = allAnnonces.filter(
        (a) => a.user_email !== currentUserEmail
      );

      setAnnonces(autresAnnonces);
    } catch (error) {
      console.error("Erreur chargement annonces:", error);
    }
  };

  useEffect(() => {
    loadAnnonces();
  }, []);

  const handleContact = async (annonceId) => {
    try {
      const conversation = await createConversation(annonceId);
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      console.error("Erreur création conversation:", error);
      alert(error.message);
    }
  };

  const formatType = (type) => {
    const map = {
      service_offer: "Service proposé",
      service_request: "Service recherché",
      item_sale: "Objet à vendre",
      item_request: "Objet recherché",
      urgent_help: "Aide urgente",
    };
    return map[type] || type;
  };

  const formatStatus = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`text-xs px-3 py-1 rounded-full ${
          colors[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Annonces - Villemomble
        </h2>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/mes-annonces")}
            className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
          >
            Mes annonces
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            + Créer une annonce
          </button>
        </div>
      </div>

      {/* FILTRES */}
      <div className="mb-8">
        <Filtres onFilter={loadAnnonces} />
      </div>

      {/* LISTE */}
      {annonces.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow text-center text-gray-500">
          Aucune annonce disponible.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {annonces.map((a) => (
            <div
              key={a.id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition relative"
            >
              {/* Type */}
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                {formatType(a.type)}
              </span>

              {/* Urgent */}
              {a.is_urgent && (
                <span className="absolute top-4 right-4 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                  URGENT
                </span>
              )}

              <h3 className="font-semibold text-lg mt-3 mb-2">
                {a.title}
              </h3>

              <p className="text-gray-600 text-sm mb-3">
                {a.description}
              </p>

              <p className="text-sm text-gray-500">
                Catégorie : {a.category}
              </p>

              <p className="text-sm text-gray-500 mb-3">
                Prix : {a.price ?? "Non précisé"} €
              </p>

              <div className="flex justify-between items-center mt-3">
                {formatStatus(a.status)}
              </div>

              {/* Toujours bouton contacter (car ce sont les annonces des autres) */}
              <button
                onClick={() => handleContact(a.id)}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Contacter
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODALE CREATION */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 z-10">
            <CreateAnnonce
              onCreated={() => {
                loadAnnonces();
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Annonces;
