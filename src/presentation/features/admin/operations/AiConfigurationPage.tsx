import { ConfirmActionButton } from "@/presentation/components/ConfirmActionButton";
import { useConfirmAction } from "@/presentation/components/useConfirmAction";
import EmbeddingProfilesPanel from "./EmbeddingProfilesPanel";
import { enumLabel } from "@/shared/utils/enum-labels";
import { useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ClipboardCheck,
  Database,
  MessagesSquare,
  Plus,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  providers,
  type AiRoute,
  type Capability,
} from "@/core/entities/administration.entity";
import {
  useAdminAction,
  usePrompt,
  usePrompts,
  useProviders,
  useRoutes,
} from "@/infrastructure/hooks/use-administration";
import {
  Dialog,
  Field,
  Pager,
  PanelPage,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";
import { errorMessage } from "@/shared/utils/panel-format";

function jsonObject(text: string): object {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Ingresa un objeto JSON.");
  return value;
}
const field = (form: FormData, name: string) =>
  String(form.get(name) ?? "").trim();

function NewPrompt({
  capability,
  onClose,
}: {
  capability: Capability;
  onClose: () => void;
}) {
  const save = useAdminAction("createPrompt");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      save.mutate(
        [
          {
            name: field(form, "name"),
            version: Number(form.get("version")),
            capability,
            systemPrompt: field(form, "prompt"),
            responseSchema: jsonObject(field(form, "responseSchema")),
          },
        ],
        { onSuccess: onClose },
      );
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <Dialog
      title="Nueva versión de prompt"
      onClose={onClose}
      busy={save.isPending}
    >
      <form className="grid gap-3" onSubmit={submit}>
        <Field label="Nombre (slug)">
          <input
            className="input w-full"
            name="name"
            required
            pattern="[a-z0-9][a-z0-9\-]*"
            maxLength={120}
          />
        </Field>
        <Field label="Versión">
          <input
            type="number"
            className="input"
            name="version"
            min={1}
            defaultValue={1}
            required
          />
        </Field>
        <Field label="Prompt del sistema">
          <textarea
            className="textarea w-full"
            name="prompt"
            rows={6}
            maxLength={20000}
            required
          />
        </Field>
        <Field label="JSON Schema de respuesta">
          <textarea
            className="textarea w-full font-mono"
            rows={7}
            name="responseSchema"
            placeholder="Pega el contrato JSON de esta sección"
            required
          />
        </Field>
        {(error || save.error) && (
          <p role="alert" className="alert alert-error">
            {error || errorMessage(save.error)}
          </p>
        )}
        <button className="btn btn-primary" disabled={save.isPending}>
          Crear versión
        </button>
      </form>
    </Dialog>
  );
}
function PromptDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const query = usePrompt(id);
  const activate = useAdminAction("activatePrompt");
  const validate = useAdminAction("validatePrompt");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  return (
    <Dialog
      title="Detalle de prompt"
      onClose={onClose}
      busy={activate.isPending || validate.isPending}
    >
      <QueryView query={query}>
        {(prompt) => (
          <>
            <h3 className="font-semibold">
              {prompt.name} · v{prompt.version} ·{" "}
              {prompt.active ? "Activo" : "Inactivo"}
            </h3>
            <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded bg-base-200 p-3">
              {prompt.systemPrompt}
            </pre>
            <details>
              <summary>JSON Schema</summary>
              <pre className="overflow-auto text-xs">
                {JSON.stringify(prompt.responseSchema, null, 2)}
              </pre>
            </details>
            <ConfirmActionButton
              className="btn"
              disabled={activate.isPending}
              confirmation={{
                title: prompt.active
                  ? "¿Desactivar el prompt?"
                  : "¿Activar el prompt?",
                description: prompt.active
                  ? "Esta versión dejará de estar activa para la capacidad."
                  : "Esta versión quedará activa para la capacidad.",
                onAccept: () => activate.mutate([prompt.id, !prompt.active]),
              }}
            >
              {prompt.active ? "Desactivar" : "Activar"}
            </ConfirmActionButton>
            <form
              className="grid gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                try {
                  validate.mutate([prompt.id, jsonObject(input)]);
                } catch (err) {
                  setError(errorMessage(err));
                }
              }}
            >
              <Field label="Salida JSON de ejemplo">
                <textarea
                  className="textarea w-full font-mono"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required
                />
              </Field>
              <button className="btn" disabled={validate.isPending}>
                Validar salida
              </button>
            </form>
            {(error || activate.error || validate.error) && (
              <p className="alert alert-error" role="alert">
                {error || errorMessage(activate.error ?? validate.error)}
              </p>
            )}
            {validate.data !== undefined && (
              <pre className="max-h-48 overflow-auto bg-base-200 p-3">
                {JSON.stringify(validate.data, null, 2)}
              </pre>
            )}
          </>
        )}
      </QueryView>
    </Dialog>
  );
}
function RouteForm({
  capability,
  route,
  onClose,
}: {
  capability: Capability;
  route?: AiRoute;
  onClose: () => void;
}) {
  const create = useAdminAction("createRoute");
  const edit = useAdminAction("updateRoute");
  const busy = create.isPending || edit.isPending;
  const { confirm, dialog } = useConfirmAction();
  return (
    <Dialog
      title={
        (route ? "Editar ruta de " : "Registrar ruta de ") +
        (capability === "CHATBOT" ? "chatbot" : "incidencias")
      }
      onClose={onClose}
      busy={busy}
    >
      {dialog}
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const payload = {
            model: field(f, "model"),
            timeoutMs: Number(f.get("timeoutMs")),
            enabled: f.has("enabled"),
          };
          if (route) {
            const save = () =>
              edit.mutate([route.id, payload], { onSuccess: onClose });
            if (route.enabled && !payload.enabled) {
              confirm({
                title: "¿Desactivar esta ruta?",
                description:
                  "La ruta dejará de estar disponible para esta capacidad.",
                onAccept: save,
              });
            } else {
              save();
            }
          } else
            create.mutate(
              [
                {
                  ...payload,
                  capability,
                  provider: field(f, "provider") as AiRoute["provider"],
                  priority: Number(f.get("priority")),
                },
              ],
              { onSuccess: onClose },
            );
        }}
      >
        {!route && (
          <>
            <Field label="Proveedor">
              <select name="provider" className="select">
                {providers.map((x) => (
                  <option key={x} value={x}>
                    {enumLabel(x)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prioridad (1 se intenta primero)">
              <input
                type="number"
                className="input"
                name="priority"
                required
                min={1}
                max={1000000}
                defaultValue={1}
              />
            </Field>
          </>
        )}
        <Field label="Identificador del modelo">
          <input
            className="input w-full"
            name="model"
            defaultValue={route?.model}
            placeholder="proveedor/modelo"
            required
            maxLength={180}
          />
        </Field>
        <Field label="Tiempo máximo (ms)">
          <input
            type="number"
            className="input"
            name="timeoutMs"
            required
            min={1000}
            max={120000}
            defaultValue={route?.timeoutMs ?? 30000}
          />
        </Field>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox"
            name="enabled"
            defaultChecked={route?.enabled ?? false}
          />{" "}
          Habilitar ruta
        </label>
        {(create.error || edit.error) && (
          <p className="alert alert-error" role="alert">
            {errorMessage(create.error ?? edit.error)}
          </p>
        )}
        <button className="btn btn-primary" disabled={busy}>
          Guardar ruta
        </button>
      </form>
    </Dialog>
  );
}

const sections = [
  {
    id: "incidencias",
    title: "Clasificación de incidencias",
    description:
      "Clasifica los reportes y propone su urgencia, categoría y acción recomendada.",
    icon: ClipboardCheck,
    capability: "INCIDENT_CLASSIFICATION",
  },
  {
    id: "chatbot",
    title: "Chatbot municipal",
    description:
      "Genera respuestas a partir de los documentos municipales publicados.",
    icon: MessagesSquare,
    capability: "CHATBOT",
  },
  {
    id: "vectores",
    title: "Vectores de conocimiento",
    description:
      "Encuentra los fragmentos de documentos relacionados con cada pregunta.",
    icon: Database,
    capability: null,
  },
] as const;

type ModelSection = (typeof sections)[0 | 1];

function issueLabel(issue: string) {
  switch (issue) {
    case "ACTIVE_PROMPT_REQUIRED":
      return "Activa una versión de prompt.";
    case "ACTIVE_PROMPT_SCHEMA_INVALID":
      return "Revisa el esquema de respuesta del prompt activo.";
    case "ENABLED_ROUTE_REQUIRED":
      return "Habilita al menos una ruta de modelo.";
  }
  const prefix = "PROVIDER_KEY_MISSING:";
  return issue.startsWith(prefix)
    ? "Falta la credencial de " + enumLabel(issue.slice(prefix.length)) + "."
    : enumLabel(issue);
}

function ModelConfiguration({ section }: { section: ModelSection }) {
  const { capability } = section;
  const [page, setPage] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [newPrompt, setNewPrompt] = useState(false);
  const [route, setRoute] = useState<AiRoute | "new" | null>(null);
  const prompts = usePrompts(capability, page);
  const routes = useRoutes(capability);
  const statuses = useProviders();
  const check = useAdminAction("check");
  const reorder = useAdminAction("reorderRoutes");
  const diagnostic = check.data?.items.find(
    (item) => item.capability === capability,
  );

  function move(items: AiRoute[], index: number, direction: number) {
    const ids = items.map((x) => x.id);
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    reorder.mutate([capability, ids]);
  }

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Rutas y modelos</h2>
            <p className="mt-1 text-sm text-base-content/70">
              Las rutas habilitadas se prueban en orden, empezando por el número
              de prioridad más bajo.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setRoute("new")}
          >
            <Plus size={16} aria-hidden="true" /> Registrar ruta
          </button>
        </div>
        {reorder.error && (
          <p className="alert alert-error" role="alert">
            {errorMessage(reorder.error)}
          </p>
        )}
        <QueryView query={routes}>
          {(data) =>
            data.items.length ? (
              <ul
                aria-label="Rutas registradas"
                className="divide-y divide-base-300 rounded-xl border border-base-300"
              >
                {data.items.map((item, index) => (
                  <li
                    key={item.id}
                    className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 text-xs text-base-content/70">
                        Prioridad {item.priority}
                      </div>
                      <div className="font-medium [overflow-wrap:anywhere]">
                        {item.model}
                      </div>
                      <div className="mt-1 text-xs text-base-content/70">
                        {enumLabel(item.provider)} · {item.timeoutMs / 1000} s
                        de espera
                      </div>
                    </div>
                    <div>
                      <span
                        className={
                          item.enabled
                            ? "badge badge-success badge-soft"
                            : "badge badge-ghost"
                        }
                      >
                        {item.enabled ? "Habilitada" : "Deshabilitada"}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setRoute(item)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-square btn-ghost btn-sm"
                          disabled={reorder.isPending || index === 0}
                          onClick={() => move(data.items, index, -1)}
                          aria-label={"Subir prioridad de " + item.model}
                        >
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-square btn-ghost btn-sm"
                          disabled={
                            reorder.isPending || index === data.items.length - 1
                          }
                          onClick={() => move(data.items, index, 1)}
                          aria-label={"Bajar prioridad de " + item.model}
                        >
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-base-300 p-5 text-sm text-base-content/70">
                Todavía no hay rutas. Registra un proveedor y el identificador
                de su modelo.
              </p>
            )
          }
        </QueryView>
      </section>

      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Instrucciones del modelo</h2>
            <p className="mt-1 text-sm text-base-content/70">
              Activa una versión del prompt antes de habilitar una ruta.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setNewPrompt(true)}
          >
            <Plus size={16} aria-hidden="true" /> Nuevo prompt
          </button>
        </div>
        <QueryView query={prompts}>
          {(data) =>
            data.items.length ? (
              <>
                <PanelTable headers={["Nombre", "Versión", "Estado", "Acción"]}>
                  {data.items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium [overflow-wrap:anywhere]">
                        {item.name}
                      </td>
                      <td>v{item.version}</td>
                      <td>
                        <span
                          className={
                            item.active
                              ? "badge badge-success badge-soft"
                              : "badge badge-ghost"
                          }
                        >
                          {item.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setPrompt(item.id)}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </PanelTable>
                <Pager data={data} onPage={setPage} />
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-base-300 p-5 text-sm text-base-content/70">
                Todavía no hay versiones. Crea un prompt y actívalo desde su
                detalle.
              </p>
            )
          }
        </QueryView>
      </section>

      <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Diagnóstico</h2>
            <p className="mt-1 text-sm text-base-content/70">
              Revisa credenciales, rutas habilitadas y el prompt activo.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            disabled={check.isPending}
            onClick={() => check.mutate([capability])}
          >
            {check.isPending ? "Comprobando…" : "Comprobar configuración"}
          </button>
        </div>
        <QueryView query={statuses}>
          {(data) => (
            <ul className="flex flex-wrap gap-2">
              {data.items.map((item) => (
                <li
                  className="badge badge-ghost h-auto whitespace-normal py-1"
                  key={item.provider}
                >
                  {enumLabel(item.provider)} ·{" "}
                  {item.credentialConfigured
                    ? "Credencial configurada"
                    : "Sin credencial"}
                </li>
              ))}
            </ul>
          )}
        </QueryView>
        {check.error && (
          <p className="alert alert-error" role="alert">
            {errorMessage(check.error)}
          </p>
        )}
        {diagnostic && (
          <div
            className={
              diagnostic.configurationReady
                ? "alert alert-success alert-soft"
                : "alert alert-warning alert-soft"
            }
            role="status"
          >
            <div>
              <p className="font-semibold">
                {diagnostic.configurationReady
                  ? "Configuración completa"
                  : "Falta completar la configuración"}
              </p>
              {diagnostic.issues.length > 0 && (
                <ul className="ml-4 list-disc">
                  {diagnostic.issues.map((issue) => (
                    <li key={issue}>{issueLabel(issue)}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
      {newPrompt && (
        <NewPrompt
          capability={capability}
          onClose={() => setNewPrompt(false)}
        />
      )}
      {prompt && <PromptDetail id={prompt} onClose={() => setPrompt("")} />}
      {route && (
        <RouteForm
          capability={capability}
          route={route === "new" ? undefined : route}
          onClose={() => setRoute(null)}
        />
      )}
    </div>
  );
}

export default function AiConfigurationPage() {
  const [params, setParams] = useSearchParams();
  const section =
    sections.find((item) => item.id === params.get("seccion")) ?? sections[0];
  return (
    <PanelPage
      title="Configuración de IA"
      description="Elige la función que quieres configurar."
    >
      <nav aria-label="Funciones de IA" className="grid gap-3 sm:grid-cols-3">
        {sections.map((item) => {
          const Icon = item.icon;
          const selected = section.id === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("seccion", item.id);
                setParams(next, { preventScrollReset: true });
              }}
              className={
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
                (selected
                  ? "border-primary bg-primary/8"
                  : "border-base-300 bg-base-100 hover:border-primary/50")
              }
            >
              <span
                className={
                  "rounded-xl p-2.5 " +
                  (selected
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content")
                }
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{item.title}</span>
                <span className="mt-1 block text-sm text-base-content/70">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
      {section.capability ? (
        <ModelConfiguration key={section.id} section={section} />
      ) : (
        <EmbeddingProfilesPanel />
      )}
    </PanelPage>
  );
}
