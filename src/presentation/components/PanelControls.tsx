import { errorMessage } from "@/shared/utils/panel-format";
import { useEffect, useRef, type ReactNode } from "react";
import type { Page } from "@/core/entities/operations.entity";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";

export function PanelPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <header>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="mt-1 text-base-content/65">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
export function QueryView<T>({
  query,
  children,
}: {
  query: {
    data: T | undefined;
    isPending: boolean;
    error: unknown;
    refetch: () => unknown;
  };
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return <LoadingState />;
  if (query.error)
    return (
      <ErrorState
        message={errorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  return query.data === undefined ? null : <>{children(query.data)}</>;
}
export function PanelTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
      <table className="table table-zebra">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function Pager({
  data,
  onPage,
}: {
  data: Page<unknown>;
  onPage: (page: number) => void;
}) {
  const { page, pages, total } = data.pagination;
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <button
        type="button"
        className="btn btn-sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Anterior
      </button>
      <span aria-live="polite">
        {total === 0
          ? "Sin resultados"
          : `Página ${page} de ${pages} · ${total} registros`}
      </span>
      <button
        type="button"
        className="btn btn-sm"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Siguiente
      </button>
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
export function Dialog({
  title,
  onClose,
  children,
  busy = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="modal-box max-w-2xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onClose}
            disabled={busy}
          >
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
