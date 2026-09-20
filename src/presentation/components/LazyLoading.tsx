import { Loader2, ShieldCheck } from "lucide-react";

const LazyLoading = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-base-200 p-6">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-base-100 px-12 py-10 text-center shadow-xl">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-content">
          <ShieldCheck size={28} />
        </div>
        <Loader2 className="animate-spin text-primary" size={25} />
        <span className="text-sm font-semibold text-base-content/60">
          Cargando tu espacio...
        </span>
      </div>
    </div>
  );
};

export default LazyLoading;
