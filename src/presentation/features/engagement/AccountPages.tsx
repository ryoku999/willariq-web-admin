import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { endSession } from "@/config/http/auth-session";
import { useEngagementAction } from "@/infrastructure/hooks/use-engagement";
import { Field, PanelPage } from "@/presentation/components/PanelControls";
import { errorMessage } from "@/shared/utils/panel-format";

const value = (data: FormData, key: string) => String(data.get(key) ?? "");
export function AccountSettings({
  email,
  verified,
}: {
  email: string | null;
  verified: boolean;
}) {
  const navigate = useNavigate();
  const emailAction = useEngagementAction("setEmail");
  const verify = useEngagementAction("requestVerification");
  const password = useEngagementAction("changePassword");
  const logout = useEngagementAction("logoutAll");
  const leave = () => {
    endSession();
    void navigate("/login", { replace: true });
  };
  const error =
    emailAction.error ?? verify.error ?? password.error ?? logout.error;
  const busy =
    emailAction.isPending ||
    verify.isPending ||
    password.isPending ||
    logout.isPending;
  return (
    <section className="space-y-4 rounded-3xl border border-base-300 bg-base-100 p-5">
      <h2 className="text-lg font-bold">Correo y seguridad</h2>
      <p>
        {email ?? "Sin correo registrado"} ·{" "}
        {verified ? "Verificado" : "Pendiente de verificación"}
      </p>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fields = new FormData(form);
          emailAction.mutate(
            [
              {
                email: value(fields, "email").trim(),
                currentPassword: value(fields, "currentPassword"),
              },
            ],
            { onSuccess: () => form.reset() },
          );
        }}
      >
        <Field label="Nuevo correo">
          <input
            className="input"
            name="email"
            type="email"
            required
            maxLength={160}
          />
        </Field>
        <Field label="Contraseña actual">
          <input
            className="input"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            maxLength={72}
          />
        </Field>
        <button className="btn" disabled={busy}>
          Guardar correo
        </button>
      </form>
      <button
        className="btn btn-sm"
        disabled={busy || !email || verified}
        onClick={() => verify.mutate([])}
      >
        Enviar enlace de verificación
      </button>
      {verify.data && <p role="status">{verify.data.message}</p>}
      {emailAction.isSuccess && <p role="status">Correo guardado.</p>}
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fields = new FormData(e.currentTarget);
          password.mutate(
            [
              {
                currentPassword: value(fields, "currentPassword"),
                newPassword: value(fields, "newPassword"),
              },
            ],
            { onSuccess: leave },
          );
        }}
      >
        <Field label="Contraseña actual">
          <input
            className="input"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            maxLength={72}
          />
        </Field>
        <Field label="Nueva contraseña">
          <input
            className="input"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
          />
        </Field>
        <button className="btn" disabled={busy}>
          Cambiar contraseña
        </button>
      </form>
      <button
        className="btn btn-error btn-outline"
        disabled={busy}
        onClick={() => {
          if (window.confirm("¿Cerrar todas tus sesiones?"))
            logout.mutate([], { onSuccess: leave });
        }}
      >
        Cerrar todas las sesiones
      </button>
      {error && (
        <p className="alert alert-error" role="alert">
          {errorMessage(error)}
        </p>
      )}
    </section>
  );
}

export function PublicAccountPage({
  mode,
}: {
  mode: "forgot" | "reset" | "verify";
}) {
  const [params] = useSearchParams();
  const [token, setToken] = useState(() => params.get("token") ?? "");
  const forgot = useEngagementAction("forgotPassword");
  const reset = useEngagementAction("resetPassword");
  const verify = useEngagementAction("confirmEmail");
  const mutation =
    mode === "forgot" ? forgot : mode === "reset" ? reset : verify;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    if (mode === "forgot") forgot.mutate([value(fields, "email").trim()]);
    else if (mode === "reset")
      reset.mutate([token.trim(), value(fields, "newPassword")]);
    else verify.mutate([token.trim()]);
  }
  return (
    <PanelPage
      title={
        mode === "forgot"
          ? "Recuperar acceso"
          : mode === "reset"
            ? "Restablecer contraseña"
            : "Verificar correo"
      }
    >
      <form onSubmit={submit} className="grid gap-4 rounded-xl bg-base-100 p-5">
        {mode === "forgot" ? (
          <Field label="Correo verificado">
            <input
              className="input w-full"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </Field>
        ) : (
          <Field label="Token del enlace">
            <input
              className="input w-full"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoComplete="off"
            />
          </Field>
        )}
        {mode === "reset" && (
          <Field label="Nueva contraseña">
            <input
              className="input w-full"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />
          </Field>
        )}
        {mutation.error && (
          <p className="alert alert-error" role="alert">
            {errorMessage(mutation.error)}
          </p>
        )}
        {mutation.data && (
          <p className="alert alert-success" role="status">
            {mutation.data.message}
          </p>
        )}
        <button
          className="btn btn-primary"
          disabled={mutation.isPending || mutation.isSuccess}
        >
          Confirmar
        </button>
        <Link className="link" to="/login">
          Volver al inicio de sesión
        </Link>
      </form>
    </PanelPage>
  );
}
