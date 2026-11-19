import { enumLabel } from "@/shared/utils/enum-labels";
import { useState } from "react";
import {
  useAdminAction,
  useDocument,
  useDocumentJobs,
  useDocuments,
} from "@/infrastructure/hooks/use-administration";
import {
  Dialog,
  Field,
  Pager,
  PanelPage,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";
import {
  downloadBlob,
  errorMessage,
  formatDate,
} from "@/shared/utils/panel-format";

function DocumentDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const query = useDocument(id);
  const jobs = useDocumentJobs(id, page);
  const action = useAdminAction("documentAction");
  const download = useAdminAction("documentContent");
  return (
    <Dialog
      title="Documento y trabajos"
      onClose={onClose}
      busy={action.isPending || download.isPending}
    >
      <QueryView query={query}>
        {(doc) => (
          <>
            <p className="font-semibold">
              {doc.title} · {enumLabel(doc.status)} · v{doc.version}
            </p>
            <ul>
              {doc.publications.map((x) => (
                <li key={x.jobId}>
                  Publicado · {x.model} · {x.dimensions} dimensiones ·{" "}
                  {formatDate(x.publishedAt)}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-sm"
                disabled={download.isPending}
                onClick={() =>
                  download.mutate([id], {
                    onSuccess: (blob) => downloadBlob(blob, `${doc.title}.md`),
                  })
                }
              >
                Descargar Markdown
              </button>
              {doc.status !== "ARCHIVED" && (
                <>
                  <button
                    className="btn btn-sm"
                    disabled={action.isPending}
                    onClick={() => action.mutate([id, "process"])}
                  >
                    {doc.status === "PROCESSING"
                      ? "Comprobar o reactivar despacho"
                      : "Procesar"}
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={action.isPending || doc.status !== "READY"}
                    onClick={() => action.mutate([id, "publish"])}
                  >
                    Publicar
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={action.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Archivar y retirar este documento de la búsqueda?",
                        )
                      )
                        action.mutate([id, "archive"]);
                    }}
                  >
                    Archivar
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </QueryView>
      {(action.error || download.error) && (
        <p className="alert alert-error" role="alert">
          {errorMessage(action.error ?? download.error)}
        </p>
      )}
      <QueryView query={jobs}>
        {(data) => (
          <>
            <PanelTable headers={["Fecha", "Estado", "Progreso", "Error"]}>
              {data.items.map((job) => (
                <tr key={job.id}>
                  <td>{formatDate(job.createdAt)}</td>
                  <td>
                    {enumLabel(job.status, "job")}{" "}
                    {job.dispatchStatus === "DEAD" ? "· Despacho fallido" : ""}
                  </td>
                  <td>
                    {job.finalOutput?.total
                      ? `${job.finalOutput.embedded}/${job.finalOutput.total}`
                      : "—"}
                  </td>
                  <td>{enumLabel(job.errorSummary)}</td>
                </tr>
              ))}
            </PanelTable>
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </QueryView>
    </Dialog>
  );
}
export default function KnowledgePage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const [uploading, setUploading] = useState(false);
  const query = useDocuments(page);
  const upload = useAdminAction("uploadDocument");
  return (
    <PanelPage
      title="Conocimiento municipal"
      description="Carga Markdown, procesa embeddings y publica las fuentes del chatbot."
    >
      <button
        className="btn btn-primary"
        onClick={() => {
          upload.reset();
          setUploading(true);
        }}
      >
        Cargar Markdown
      </button>
      <QueryView query={query}>
        {(data) => (
          <>
            <PanelTable
              headers={["Título", "Tipo", "Estado", "Publicaciones", "Acción"]}
            >
              {data.items.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{enumLabel(doc.sourceType)}</td>
                  <td>{enumLabel(doc.status)}</td>
                  <td>{doc.publications.length}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => setSelected(doc.id)}
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </PanelTable>
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </QueryView>
      {uploading && (
        <Dialog
          title="Cargar documento"
          onClose={() => setUploading(false)}
          busy={upload.isPending}
        >
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const file = form.get("file");
              if (file instanceof File && file.size)
                upload.mutate(
                  [
                    file,
                    String(form.get("title")).trim(),
                    String(form.get("sourceType")),
                  ],
                  {
                    onSuccess: (doc) => {
                      setPage(1);
                      setUploading(false);
                      setSelected(doc.id);
                    },
                  },
                );
            }}
          >
            <Field label="Título">
              <input
                className="input w-full"
                name="title"
                required
                maxLength={250}
              />
            </Field>
            <Field label="Tipo de fuente">
              <select className="select" name="sourceType">
                {[
                  "MANUAL",
                  "MUNICIPAL_REGULATION",
                  "FAQ",
                  "PROCEDURE",
                  "OTHER",
                ].map((x) => (
                  <option key={x} value={x}>
                    {enumLabel(x)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Archivo Markdown (.md)">
              <input
                className="file-input w-full"
                type="file"
                name="file"
                accept=".md,text/markdown"
                required
              />
            </Field>
            {upload.error && (
              <p className="alert alert-error" role="alert">
                {errorMessage(upload.error)}
              </p>
            )}
            <button className="btn btn-primary" disabled={upload.isPending}>
              Subir
            </button>
          </form>
        </Dialog>
      )}
      {selected && (
        <DocumentDetail
          id={selected}
          onClose={() => {
            setSelected("");
            void query.refetch();
          }}
        />
      )}
    </PanelPage>
  );
}
