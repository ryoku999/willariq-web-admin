import { useState, type FormEvent } from "react";
import {
  capabilities,
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

const chatSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string", minLength: 1, maxLength: 4000 },
    citations: {
      type: "array",
      maxItems: 20,
      items: { type: "integer", minimum: 1 },
    },
  },
  required: ["answer", "citations"],
};

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
  const contract = useAdminAction("classificationSchema");
  const [schema, setSchema] = useState(
    capability === "CHATBOT" ? JSON.stringify(chatSchema, null, 2) : "",
  );
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
            responseSchema: schema.trim() ? jsonObject(schema) : undefined,
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
        {capability === "INCIDENT_CLASSIFICATION" && (
          <button
            type="button"
            className="btn btn-sm"
            disabled={contract.isPending}
            onClick={() =>
              contract.mutate([], {
                onSuccess: (value) =>
                  setSchema(JSON.stringify(value.responseSchema, null, 2)),
              })
            }
          >
            Cargar contrato de clasificación
          </button>
        )}
        <Field label="JSON Schema de respuesta">
          <textarea
            className="textarea w-full font-mono"
            rows={7}
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder={
              capability === "INCIDENT_CLASSIFICATION"
                ? "Vacío usa el contrato canónico"
                : ""
            }
            required={capability !== "INCIDENT_CLASSIFICATION"}
          />
        </Field>
        {(error || save.error || contract.error) && (
          <p role="alert" className="alert alert-error">
            {error || errorMessage(save.error ?? contract.error)}
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
            <button
              className="btn"
              disabled={activate.isPending}
              onClick={() => activate.mutate([prompt.id, !prompt.active])}
            >
              {prompt.active ? "Desactivar" : "Activar"}
            </button>
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
  return (
    <Dialog
      title={route ? "Editar ruta" : "Nueva ruta"}
      onClose={onClose}
      busy={busy}
    >
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
          if (route) edit.mutate([route.id, payload], { onSuccess: onClose });
          else
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
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Prioridad">
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
        <Field label="Modelo">
          <input
            className="input w-full"
            name="model"
            defaultValue={route?.model}
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
export default function AiConfigurationPage() {
  const [capability, setCapability] = useState<Capability>(
    "INCIDENT_CLASSIFICATION",
  );
  const [page, setPage] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [newPrompt, setNewPrompt] = useState(false);
  const [route, setRoute] = useState<AiRoute | "new" | null>(null);
  const prompts = usePrompts(capability, page);
  const routes = useRoutes(capability);
  const statuses = useProviders();
  const check = useAdminAction("check");
  const reorder = useAdminAction("reorderRoutes");
  function move(items: AiRoute[], index: number, direction: number) {
    const ids = items.map((x) => x.id);
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    reorder.mutate([capability, ids]);
  }
  return (
    <PanelPage
      title="Configuración de IA"
      description="Administra versiones de prompts, modelos y orden de proveedores."
    >
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Capacidad">
          <select
            className="select"
            value={capability}
            onChange={(e) => {
              setCapability(e.target.value as Capability);
              setPage(1);
              check.reset();
              reorder.reset();
            }}
          >
            {capabilities.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <button
          className="btn"
          disabled={check.isPending}
          onClick={() => check.mutate([capability])}
        >
          Comprobar configuración
        </button>
      </div>
      <QueryView query={statuses}>
        {(data) => (
          <div className="flex flex-wrap gap-3">
            {data.items.map((x) => (
              <span className="badge" key={x.provider}>
                {x.provider} ·{" "}
                {x.credentialConfigured
                  ? "Credencial configurada"
                  : "Sin credencial"}
              </span>
            ))}
          </div>
        )}
      </QueryView>
      {(check.error || reorder.error) && (
        <p className="alert alert-error" role="alert">
          {errorMessage(check.error ?? reorder.error)}
        </p>
      )}
      {check.data !== undefined && (
        <pre className="overflow-auto rounded bg-base-100 p-3">
          {JSON.stringify(check.data, null, 2)}
        </pre>
      )}
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Prompts</h2>
        <button className="btn btn-primary" onClick={() => setNewPrompt(true)}>
          Nuevo prompt
        </button>
      </div>
      <QueryView query={prompts}>
        {(data) => (
          <>
            <PanelTable headers={["Nombre", "Versión", "Estado", "Acción"]}>
              {data.items.map((x) => (
                <tr key={x.id}>
                  <td>{x.name}</td>
                  <td>{x.version}</td>
                  <td>{x.active ? "Activo" : "Inactivo"}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => setPrompt(x.id)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </PanelTable>
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </QueryView>
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Rutas</h2>
        <button className="btn btn-primary" onClick={() => setRoute("new")}>
          Nueva ruta
        </button>
      </div>
      <QueryView query={routes}>
        {(data) => (
          <PanelTable
            headers={["Prioridad", "Proveedor", "Modelo", "Estado", "Acciones"]}
          >
            {data.items.map((x, index) => (
              <tr key={x.id}>
                <td>{x.priority}</td>
                <td>{x.provider}</td>
                <td>{x.model}</td>
                <td>{x.enabled ? "Habilitada" : "Deshabilitada"}</td>
                <td className="space-x-1">
                  <button className="btn btn-sm" onClick={() => setRoute(x)}>
                    Editar
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={reorder.isPending || index === 0}
                    onClick={() => move(data.items, index, -1)}
                    aria-label={`Subir prioridad de ${x.model}`}
                  >
                    ↑
                  </button>
                  <button
                    className="btn btn-sm"
                    disabled={
                      reorder.isPending || index === data.items.length - 1
                    }
                    onClick={() => move(data.items, index, 1)}
                    aria-label={`Bajar prioridad de ${x.model}`}
                  >
                    ↓
                  </button>
                </td>
              </tr>
            ))}
          </PanelTable>
        )}
      </QueryView>
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
    </PanelPage>
  );
}
