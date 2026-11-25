import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { ConfirmActionButton } from "@/presentation/components/ConfirmActionButton";
import {
  useEmbeddingProfileAction,
  useEmbeddingProfiles,
} from "@/infrastructure/hooks/use-embedding-profiles";
import { embeddingProfilesService as service } from "@/infrastructure/services/embedding-profiles.service";
import {
  Dialog,
  Field,
  QueryView,
} from "@/presentation/components/PanelControls";
import { errorMessage } from "@/shared/utils/panel-format";

export default function EmbeddingProfilesPanel() {
  const profiles = useEmbeddingProfiles();
  const save = useEmbeddingProfileAction(
    service.save,
    "Perfil de embeddings guardado.",
  );
  const reindex = useEmbeddingProfileAction(
    service.reindex,
    "Solicitud de reindexación enviada.",
  );
  const activate = useEmbeddingProfileAction(
    service.activate,
    "Perfil de embeddings activado.",
  );
  const [adding, setAdding] = useState(false);
  const busy = save.isPending || reindex.isPending || activate.isPending;
  const error = reindex.error ?? activate.error;

  return (
    <div className="space-y-5">
      <section className="flex gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6">
        <Search
          size={22}
          className="mt-0.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="space-y-2">
          <h2 className="text-lg font-bold">Búsqueda en documentos</h2>
          <p className="text-sm text-base-content/75">
            OpenRouter convierte las preguntas y los fragmentos de documentos en
            vectores. Así el chatbot encuentra contenido relacionado aunque el
            ciudadano use otras palabras.
          </p>
          <Link to="/knowledge" className="link link-primary text-sm">
            Administrar documentos
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Perfiles de OpenRouter</h2>
            <p className="mt-1 text-sm text-base-content/70">
              Para cambiar de modelo, valida y guarda un perfil, reindexa los
              documentos publicados y actívalo cuando finalice el procesamiento.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={() => {
              save.reset();
              setAdding(true);
            }}
          >
            <Plus size={16} aria-hidden="true" /> Registrar perfil
          </button>
        </div>
        {error && (
          <p role="alert" className="alert alert-error">
            {errorMessage(error)}
          </p>
        )}
        {reindex.data && (
          <div role="status" className="rounded-xl bg-base-200 p-4 text-sm">
            <p>
              Documentos solicitados para reindexación: {reindex.data.requested}
              .
            </p>
            {reindex.data.failed.length > 0 && (
              <ul className="mt-2 ml-4 list-disc">
                {reindex.data.failed.map(({ title, reason }, index) => (
                  <li key={index}>
                    {title} · {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <QueryView query={profiles}>
          {(items) => {
            const active = items.find((profile) => profile.active);
            return (
              <>
                <div className="rounded-xl bg-base-200 px-4 py-3">
                  <p className="text-sm font-semibold">Modelo en uso</p>
                  <p className="mt-1 text-sm [overflow-wrap:anywhere] text-base-content/75">
                    {active
                      ? active.model +
                        " · " +
                        active.dimensions +
                        " dimensiones"
                      : "Todavía no hay un perfil activo."}
                  </p>
                </div>
                {items.length ? (
                  <ul
                    aria-label="Perfiles registrados"
                    className="divide-y divide-base-300 rounded-xl border border-base-300"
                  >
                    {items.map((profile) => (
                      <li
                        key={profile.id}
                        className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,auto)] sm:items-center"
                      >
                        <div className="min-w-0">
                          <div className="font-medium [overflow-wrap:anywhere]">
                            {profile.model}
                          </div>
                          <div className="mt-1 text-xs text-base-content/70">
                            {profile.dimensions} dimensiones ·{" "}
                            {profile.timeoutMs / 1000} s · Lote de{" "}
                            {profile.batchSize}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span
                            className={
                              profile.active
                                ? "badge badge-success badge-soft"
                                : "badge badge-ghost"
                            }
                          >
                            {profile.active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          {!profile.active && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-sm h-auto min-h-8 whitespace-normal py-1"
                                disabled={busy}
                                onClick={() => {
                                  save.reset();
                                  activate.reset();
                                  reindex.mutate(profile.id);
                                }}
                              >
                                Reindexar documentos
                              </button>
                              <ConfirmActionButton
                                className="btn btn-sm btn-outline"
                                disabled={busy}
                                confirmation={{
                                  title: "¿Activar este perfil de embeddings?",
                                  description:
                                    "Este perfil se usará para las búsquedas de conocimiento.",
                                  onAccept: () => {
                                    save.reset();
                                    reindex.reset();
                                    activate.mutate(profile.id);
                                  },
                                }}
                              >
                                Activar
                              </ConfirmActionButton>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-base-300 p-5 text-sm text-base-content/70">
                    Registra un modelo de embeddings de OpenRouter para
                    configurar la búsqueda.
                  </p>
                )}
              </>
            );
          }}
        </QueryView>
      </section>

      {adding && (
        <Dialog
          title="Registrar perfil de vectores"
          onClose={() => setAdding(false)}
          busy={save.isPending}
          closeLabel="Cancelar"
        >
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              reindex.reset();
              activate.reset();
              const data = new FormData(event.currentTarget);
              save.mutate(
                {
                  model: String(data.get("model") ?? "").trim(),
                  dimensions: Number(data.get("dimensions")),
                  timeoutMs: Number(data.get("timeoutMs")),
                  batchSize: Number(data.get("batchSize")),
                },
                { onSuccess: () => setAdding(false) },
              );
            }}
          >
            <Field label="Identificador del modelo de OpenRouter">
              <input
                className="input w-full"
                name="model"
                required
                maxLength={180}
                placeholder="proveedor/modelo"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Dimensiones">
                <input
                  className="input w-full"
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
                  className="input w-full"
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
                  className="input w-full"
                  type="number"
                  name="batchSize"
                  required
                  min={1}
                  max={16}
                  defaultValue={4}
                />
              </Field>
            </div>
            {save.error && (
              <p role="alert" className="alert alert-error">
                {errorMessage(save.error)}
              </p>
            )}
            <button
              className="btn btn-primary justify-self-end"
              disabled={save.isPending}
            >
              {save.isPending ? "Validando…" : "Validar y guardar"}
            </button>
          </form>
        </Dialog>
      )}
    </div>
  );
}
