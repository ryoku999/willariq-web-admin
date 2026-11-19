import {
  useEmbeddingProfileAction,
  useEmbeddingProfiles,
} from "@/infrastructure/hooks/use-embedding-profiles";
import { embeddingProfilesService as service } from "@/infrastructure/services/embedding-profiles.service";
import {
  Field,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";
import { errorMessage } from "@/shared/utils/panel-format";

export default function EmbeddingProfilesPanel() {
  const profiles = useEmbeddingProfiles();
  const save = useEmbeddingProfileAction(service.save);
  const reindex = useEmbeddingProfileAction(service.reindex);
  const activate = useEmbeddingProfileAction(service.activate);
  const busy = save.isPending || reindex.isPending || activate.isPending;
  const error = save.error ?? reindex.error ?? activate.error;

  return (
    <section className="space-y-4 rounded-2xl border border-base-300 p-4">
      <h2 className="text-xl font-bold">Embeddings de conocimiento</h2>
      <p className="text-sm">
        OpenRouter genera los vectores de los Markdown y de las preguntas. Para
        cambiar de modelo, guarda y valida el perfil, reindexa los documentos
        publicados y activa el perfil cuando terminen los trabajos.
      </p>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          reindex.reset();
          activate.reset();
          const data = new FormData(event.currentTarget);
          save.mutate({
            model: String(data.get("model") ?? "").trim(),
            dimensions: Number(data.get("dimensions")),
            timeoutMs: Number(data.get("timeoutMs")),
            batchSize: Number(data.get("batchSize")),
          });
        }}
      >
        <Field label="Modelo de OpenRouter">
          <input
            className="input w-full"
            name="model"
            required
            maxLength={180}
            placeholder="proveedor/modelo"
          />
        </Field>
        <Field label="Dimensiones">
          <input
            className="input w-28"
            type="number"
            name="dimensions"
            required
            min={1}
            max={4096}
            defaultValue={2048}
          />
        </Field>
        <Field label="Tiempo máximo (ms)">
          <input
            className="input w-32"
            type="number"
            name="timeoutMs"
            required
            min={1000}
            max={60000}
            defaultValue={30000}
          />
        </Field>
        <Field label="Tamaño de lote">
          <input
            className="input w-24"
            type="number"
            name="batchSize"
            required
            min={1}
            max={16}
            defaultValue={4}
          />
        </Field>
        <button className="btn btn-primary" disabled={busy}>
          {save.isPending ? "Validando…" : "Validar y guardar"}
        </button>
      </form>
      {error && (
        <p role="alert" className="alert alert-error">
          {errorMessage(error)}
        </p>
      )}
      {reindex.data && (
        <div role="status">
          <p>
            Documentos solicitados para reindexación: {reindex.data.requested}.
          </p>
          {reindex.data.failed.map(({ title, reason }, index) => (
            <p key={index}>
              {title} · {reason}
            </p>
          ))}
        </div>
      )}
      <QueryView query={profiles}>
        {(items) => (
          <PanelTable
            headers={[
              "Modelo",
              "Dimensiones",
              "Tiempo máximo",
              "Lote",
              "Estado",
              "Acciones",
            ]}
          >
            {items.map((profile) => (
              <tr key={profile.id}>
                <td>{profile.model}</td>
                <td>{profile.dimensions}</td>
                <td>{profile.timeoutMs} ms</td>
                <td>{profile.batchSize}</td>
                <td>{profile.active ? "Activo" : "Inactivo"}</td>
                <td className="space-x-2">
                  {!profile.active && (
                    <>
                      <button
                        className="btn btn-sm"
                        disabled={busy}
                        onClick={() => {
                          save.reset();
                          activate.reset();
                          reindex.mutate(profile.id);
                        }}
                      >
                        Reindexar publicados
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={busy}
                        onClick={() => {
                          save.reset();
                          reindex.reset();
                          activate.mutate(profile.id);
                        }}
                      >
                        Activar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </PanelTable>
        )}
      </QueryView>
    </section>
  );
}
