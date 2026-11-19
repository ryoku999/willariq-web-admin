import { enumLabel } from "@/shared/utils/enum-labels";
import { useState, type FormEvent } from "react";
import type { MuniAreasListItems } from "@/core/entities/muni-areas.entity";
import {
  useAreaMembers,
  useAreaMemberCandidates,
  useAreaMutation,
  useAreas,
} from "@/infrastructure/hooks/use-municipal-areas";
import { useSummary } from "@/infrastructure/hooks/use-operations";
import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import {
  Dialog,
  Field,
  Pager,
  PanelPage,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";
import { errorMessage, personName } from "@/shared/utils/panel-format";

function AreaForm({
  area,
  onClose,
}: {
  area?: MuniAreasListItems;
  onClose: () => void;
}) {
  const mutation = useAreaMutation();
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    const payload = {
      name: text("name"),
      description: text("description"),
      phone: text("phone") || null,
      email: text("email") || null,
    };
    if (area)
      mutation.mutate(
        { type: "update", data: { muniAreaId: area.id, payload } },
        { onSuccess: onClose },
      );
    else
      mutation.mutate(
        { type: "create", data: { code: text("code"), ...payload } },
        { onSuccess: onClose },
      );
  }
  return (
    <Dialog
      title={area ? "Editar área" : "Nueva área"}
      onClose={onClose}
      busy={mutation.isPending}
    >
      <form className="grid gap-3" onSubmit={submit}>
        {!area && (
          <Field label="Código">
            <input
              className="input w-full"
              name="code"
              required
              maxLength={30}
            />
          </Field>
        )}
        <Field label="Nombre">
          <input
            className="input w-full"
            name="name"
            required
            maxLength={120}
            defaultValue={area?.name}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            className="textarea w-full"
            name="description"
            maxLength={2000}
            defaultValue={area?.description ?? ""}
          />
        </Field>
        <Field label="Teléfono">
          <input
            className="input w-full"
            name="phone"
            maxLength={30}
            defaultValue={area?.phone ?? ""}
          />
        </Field>
        <Field label="Correo">
          <input
            className="input w-full"
            name="email"
            type="email"
            maxLength={160}
            defaultValue={area?.email ?? ""}
          />
        </Field>
        {mutation.error && (
          <p role="alert" className="alert alert-error">
            {errorMessage(mutation.error)}
          </p>
        )}
        <button className="btn btn-primary" disabled={mutation.isPending}>
          Guardar
        </button>
      </form>
    </Dialog>
  );
}
function Members({
  area,
  editable,
  onClose,
}: {
  area: MuniAreasListItems;
  editable: boolean;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const [active, setActive] = useState(true);
  const [search, setSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const canAdd = editable && area.status === "ACTIVE";
  const candidates = useAreaMemberCandidates(area.id, candidateSearch, canAdd);
  const selectedCandidate = candidates.data?.find(
    (person) => person.id === candidateId,
  );
  const query = useAreaMembers(area.id, page, active);
  const mutation = useAreaMutation();
  return (
    <Dialog
      title={`Miembros · ${area.name}`}
      onClose={onClose}
      busy={mutation.isPending}
    >
      {canAdd && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setCandidateSearch(search.trim());
            setCandidateId("");
          }}
        >
          <Field label="Buscar personal por nombre o correo">
            <input
              className="input"
              value={search}
              maxLength={160}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Field>
          <button
            className="btn"
            disabled={search.trim().length < 2 || mutation.isPending}
          >
            Buscar
          </button>
        </form>
      )}
      <button
        type="button"
        className="btn btn-sm w-fit"
        onClick={() => {
          setSearch("");
          setCandidateSearch("");
          setCandidateId("");
          setActive(true);
          setPage(1);
        }}
      >
        Limpiar filtros
      </button>
      {canAdd && candidateSearch && (
        <QueryView query={candidates}>
          {(people) =>
            people.length ? (
              <form
                className="flex flex-wrap items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedCandidate) return;
                  const form = e.currentTarget;
                  const fields = new FormData(form);
                  mutation.mutate(
                    {
                      type: "add",
                      data: {
                        muniAreaId: area.id,
                        payload: {
                          userId: selectedCandidate.id,
                          role:
                            fields.get("role") === "MANAGER"
                              ? "MANAGER"
                              : "OPERATOR",
                        },
                      },
                    },
                    {
                      onSuccess: () => {
                        form.reset();
                        setCandidateId("");
                        setCandidateSearch("");
                        setSearch("");
                        setActive(true);
                        setPage(1);
                      },
                    },
                  );
                }}
              >
                <Field label="Persona">
                  <select
                    className="select w-full"
                    required
                    value={selectedCandidate?.id ?? ""}
                    onChange={(e) => setCandidateId(e.target.value)}
                  >
                    <option value="">Selecciona una persona</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {personName(person)} · {person.email}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Función en el área">
                  <select className="select" name="role">
                    <option value="OPERATOR">{enumLabel("OPERATOR")}</option>
                    <option value="MANAGER">{enumLabel("MANAGER")}</option>
                  </select>
                </Field>
                <button
                  className="btn btn-primary"
                  disabled={!selectedCandidate || mutation.isPending}
                >
                  Agregar o reactivar
                </button>
              </form>
            ) : (
              <p>No se encontró personal disponible para esta área.</p>
            )
          }
        </QueryView>
      )}
      <label className="flex items-center gap-2">
        <input
          className="checkbox checkbox-sm"
          type="checkbox"
          checked={active}
          onChange={(e) => {
            setActive(e.target.checked);
            setPage(1);
          }}
        />{" "}
        Ver miembros activos
      </label>
      {mutation.error && (
        <p role="alert" className="alert alert-error">
          {errorMessage(mutation.error)}
        </p>
      )}
      <QueryView query={query}>
        {(data) => (
          <>
            <PanelTable headers={["Usuario", "Función en el área", "Acción"]}>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.user.firstName} {row.user.lastName}
                  </td>
                  <td>{enumLabel(row.role)}</td>
                  <td>
                    {editable && row.active && (
                      <button
                        className="btn btn-sm"
                        disabled={mutation.isPending}
                        onClick={() => {
                          if (window.confirm("¿Desactivar esta membresía?"))
                            mutation.mutate({
                              type: "remove",
                              data: {
                                muniAreaId: area.id,
                                memberId: row.userId,
                              },
                            });
                        }}
                      >
                        Quitar
                      </button>
                    )}
                  </td>
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
export default function MuniAreasListPage() {
  const role = useAuthStore((s) => s.user?.role);
  const summary = useSummary();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState<MuniAreasListItems | "new" | null>(null);
  const [members, setMembers] = useState<MuniAreasListItems | null>(null);
  const query = useAreas(page, filter || undefined);
  const mutation = useAreaMutation();
  return (
    <PanelPage title="Áreas municipales">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setFilter(search.trim());
          setPage(1);
        }}
      >
        <input
          className="input"
          placeholder="Nombre o código"
          aria-label="Buscar área"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn">Buscar</button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setSearch("");
            setFilter("");
            setPage(1);
          }}
        >
          Limpiar filtros
        </button>
        {role === "ADMIN" && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setForm("new")}
          >
            Nueva área
          </button>
        )}
      </form>
      {mutation.error && (
        <p className="alert alert-error" role="alert">
          {errorMessage(mutation.error)}
        </p>
      )}
      <QueryView query={query}>
        {(data) => (
          <>
            <PanelTable headers={["Código", "Área", "Estado", "Acciones"]}>
              {data.items.map((area) => (
                <tr key={area.id}>
                  <td>{area.code}</td>
                  <td>{area.name}</td>
                  <td>{enumLabel(area.status, "area")}</td>
                  <td className="space-x-2">
                    {(role !== "OPERATOR" ||
                      summary.data?.managedAreaIds.includes(area.id)) && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setMembers(area)}
                      >
                        Miembros
                      </button>
                    )}
                    {role === "ADMIN" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setForm(area)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm"
                          disabled={mutation.isPending}
                          onClick={() => {
                            if (window.confirm("¿Cambiar estado del área?"))
                              mutation.mutate({
                                type: "status",
                                data: {
                                  muniAreasId: area.id,
                                  payload: {
                                    status:
                                      area.status === "ACTIVE"
                                        ? "INACTIVE"
                                        : "ACTIVE",
                                  },
                                },
                              });
                          }}
                        >
                          {area.status === "ACTIVE" ? "Desactivar" : "Activar"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </PanelTable>
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </QueryView>
      {form && (
        <AreaForm
          area={form === "new" ? undefined : form}
          onClose={() => setForm(null)}
        />
      )}
      {members && (
        <Members
          area={members}
          editable={
            role === "ADMIN" ||
            !!summary.data?.managedAreaIds.includes(members.id)
          }
          onClose={() => setMembers(null)}
        />
      )}
    </PanelPage>
  );
}
