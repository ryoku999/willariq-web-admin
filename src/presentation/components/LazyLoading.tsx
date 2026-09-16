import { Loader2 } from "lucide-react";

const LazyLoading = () => {
  return (
    <div>
      <span>Cargando...</span>
      <Loader2 className="animate-spin" />
    </div>
  );
};

export default LazyLoading;
