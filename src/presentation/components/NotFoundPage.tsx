import { ArrowLeft, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <main className="grid min-h-screen place-items-center bg-base-200 p-6">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
          <Compass size={42} />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold">Página no encontrada</h1>
        <p className="mt-4 text-base-content/60">
          La ruta que buscas no existe o ya no está disponible.
        </p>
        <button
          className="btn btn-primary mt-8 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Volver atrás
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
