import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

const ErrorState = ({
  title = "Algo salió mal",
  message = "Ocurrió un error inesperado al cargar esta vista.",
  onRetry,
}: ErrorStateProps) => (
  <main className="grid min-h-[60vh] place-items-center p-6">
    <div className="max-w-md rounded-3xl bg-base-100 p-10 text-center shadow-xl">
      <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-error/10 text-error">
        <AlertTriangle size={30} />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-base-content/60">{message}</p>
      {onRetry && (
        <button className="btn btn-primary mt-7 gap-2" onClick={onRetry}>
          <RefreshCw size={17} />
          Intentar nuevamente
        </button>
      )}
    </div>
  </main>
);
export default ErrorState;
