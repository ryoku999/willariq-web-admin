import { useEffect, useRef, useState } from "react";
import type { Evidence } from "@/core/entities/operations.entity";
import { useEvidenceContent } from "@/infrastructure/hooks/use-operations";
import { Dialog } from "@/presentation/components/PanelControls";
import { enumLabel } from "@/shared/utils/enum-labels";
import { downloadBlob } from "@/shared/utils/panel-format";

function EvidenceImage({
  blob,
  name,
  className,
}: {
  blob: Blob;
  name: string;
  className: string;
}) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    const image = ref.current;
    if (image) image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return <img ref={ref} alt={name} className={className} />;
}

function EvidenceCard({
  incidentId,
  evidence,
}: {
  incidentId: string;
  evidence: Evidence;
}) {
  const available = evidence.status === "AVAILABLE";
  const content = useEvidenceContent(incidentId, evidence.id, available);
  const [expanded, setExpanded] = useState(false);
  const name = evidence.fileName || "Evidencia";
  const blob = available ? content.data : undefined;

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-base-300 bg-base-100">
      {blob ? (
        <button
          type="button"
          aria-label={`Ampliar ${name}`}
          onClick={() => setExpanded(true)}
          className="block w-full bg-base-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        >
          <EvidenceImage
            blob={blob}
            name={name}
            className="aspect-video w-full object-cover"
          />
        </button>
      ) : (
        <div className="grid aspect-video place-items-center bg-base-200 p-3 text-center text-sm">
          {available && content.isError ? (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => void content.refetch()}
            >
              Reintentar carga
            </button>
          ) : available ? (
            "Cargando imagen…"
          ) : (
            enumLabel(evidence.status)
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3">
        <p className="min-w-0 break-all text-sm font-medium">{name}</p>
        <button
          type="button"
          className="btn btn-sm"
          disabled={!blob}
          onClick={() => blob && downloadBlob(blob, name)}
        >
          Descargar
        </button>
      </div>
      {expanded && blob && (
        <Dialog title={name} onClose={() => setExpanded(false)}>
          <EvidenceImage
            blob={blob}
            name={name}
            className="max-h-[70vh] w-full rounded-lg bg-base-200 object-contain"
          />
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => downloadBlob(blob, name)}
          >
            Descargar
          </button>
        </Dialog>
      )}
    </article>
  );
}

export function EvidenceGallery({
  incidentId,
  items,
}: {
  incidentId: string;
  items: Evidence[];
}) {
  if (!items.length)
    return (
      <p className="text-sm text-base-content/60">
        Esta incidencia todavía no tiene evidencias.
      </p>
    );
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((evidence) => (
        <EvidenceCard
          key={evidence.id}
          incidentId={incidentId}
          evidence={evidence}
        />
      ))}
    </div>
  );
}
