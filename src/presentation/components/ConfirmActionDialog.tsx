import { useEffect, useId, useRef } from "react";

export type Confirmation = {
  title: string;
  description: string;
  onAccept: () => void;
};

export function ConfirmActionDialog({
  title,
  description,
  onAccept,
  onCancel,
}: Confirmation & { onCancel: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    cancelRef.current?.focus();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div className="modal-box max-w-md space-y-4">
        <h2 id={titleId} className="text-lg font-bold">{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="modal-action">
          <button ref={cancelRef} type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onAccept}>
            Aceptar
          </button>
        </div>
      </div>
    </dialog>
  );
}
