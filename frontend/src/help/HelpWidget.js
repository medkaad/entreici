import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function helpFor(pathname) {
  if (pathname.startsWith("/login")) return "Entrez votre email et votre mot de passe, puis cliquez sur Se connecter.";
  if (pathname.startsWith("/register")) return "Remplissez le formulaire puis cliquez sur Créer mon compte.";
  if (pathname.startsWith("/annonces/")) return "Pour discuter, cliquez sur Contacter. Pour revenir, cliquez sur Retour.";
  if (pathname.startsWith("/conversations")) return "Cliquez sur une conversation pour ouvrir le chat.";
  if (pathname.startsWith("/chat/")) return "Écrivez un message puis cliquez sur Envoyer.";
  if (pathname.startsWith("/mes-annonces")) return "Vous pouvez modifier, supprimer, ou gérer une réservation.";
  if (pathname.startsWith("/profile")) return "Vous pouvez modifier votre profil puis enregistrer.";
  return "Utilisez le menu : Annonces, Conversations, Mes annonces. Besoin d’aide ? Cliquez ici.";
}

export default function HelpWidget() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const text = useMemo(() => helpFor(pathname), [pathname]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {open && (
        <div className="senior-card mb-3 w-[340px] max-w-[92vw] rounded-3xl border bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xl font-extrabold">❓ Aide</div>
              <p className="mt-2 text-base text-gray-800">{text}</p>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-3 rounded-2xl bg-gray-900 text-white font-extrabold hover:bg-black transition focus:ring-4 focus:ring-gray-200"
                >
                  🏠 Accueil
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-2xl border-2 border-gray-300 bg-white font-extrabold hover:bg-gray-50 transition focus:ring-4 focus:ring-gray-200"
                >
                  Fermer
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-2xl border-2 border-gray-200 hover:bg-gray-50 font-extrabold"
              aria-label="Fermer l'aide"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-6 py-4 rounded-3xl bg-blue-700 text-white font-extrabold shadow-xl hover:bg-blue-800 transition focus:ring-4 focus:ring-blue-200"
        aria-expanded={open}
        aria-label="Ouvrir l'aide"
      >
        ❓ Aide
      </button>
    </div>
  );
}
