import { useLogin } from "@/infrastructure/hooks/use-auth";
import type { LoginT } from "../schemas/login.schema";
import { ZodError } from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { roleBasedRedirection } from "@/shared/utils/role-based-redirection";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/login.schema";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const LoginPage = () => {
  const login = useLogin();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginT>({
    resolver: zodResolver(loginSchema),
    defaultValues: { dni: "", password: "" },
  });

  const onSubmit = (values: LoginT) => {
    login.mutate(values, {
      onSuccess: (data) => {
        navigate(roleBasedRedirection(data.data.role));
      },
      onError: (err) => {
        if (err instanceof ZodError) {
          console.error("zod error", err);
        } else {
          console.error("any error", err);
        }
      },
    });
  };

  return (
    <main className="min-h-screen bg-base-200 px-4 py-6 text-base-content sm:px-8 lg:px-12">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-4xl border border-base-300 bg-base-100 shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-content lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-primary-content/10" />
          <div className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full border-[3rem] border-primary-content/5" />

          <div className="relative">
            <div className="mb-16 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-primary-content text-primary shadow-lg">
                <ShieldCheck size={25} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight">Willariq</span>
            </div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-primary-content/70">
              Panel administrativo
            </p>
            <h1 className="max-w-md text-4xl font-bold leading-tight xl:text-5xl">
              Todo el control de tu operación, en un solo lugar.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-primary-content/75">
              Gestiona tus procesos de forma simple, segura y eficiente desde la
              plataforma Willariq.
            </p>
          </div>

          <div className="relative flex items-center gap-3 text-sm text-primary-content/70">
            <span className="size-2 rounded-full bg-success" />
            Plataforma segura y disponible
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <div className="mb-6 flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-content shadow-lg">
                  <ShieldCheck size={25} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  Willariq
                </span>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Bienvenido
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                Inicia sesión
              </h2>
              <p className="mt-3 text-sm text-base-content/60">
                Ingresa tus datos para continuar al panel.
              </p>
            </div>

            {login.isError && (
              <div role="alert" className="alert alert-error mb-6 text-sm">
                <span>
                  No pudimos iniciar sesión. Revisa tus credenciales e inténtalo
                  nuevamente.
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <label className="form-control w-full">
                <span className="label pb-2">
                  <span className="label-text font-semibold">DNI</span>
                </span>
                <div className="relative">
                  <UserRound
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
                    size={18}
                  />
                  <input
                    {...register("dni")}
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    placeholder="Ingresa tu DNI"
                    className={`input input-bordered w-full pl-11 focus:input-primary ${errors.dni ? "input-error" : ""}`}
                  />
                </div>
                {errors.dni && (
                  <span className="label-text-alt mt-1 text-error">
                    {errors.dni.message}
                  </span>
                )}
              </label>

              <label className="form-control w-full">
                <span className="label pb-2">
                  <span className="label-text font-semibold">Contraseña</span>
                </span>
                <div className="relative">
                  <LockKeyhole
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
                    size={18}
                  />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    className={`input input-bordered w-full pl-11 pr-12 focus:input-primary ${errors.password ? "input-error" : ""}`}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="btn btn-ghost btn-sm absolute right-1 top-1/2 -translate-y-1/2 text-base-content/50"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="label-text-alt mt-1 text-error">
                    {errors.password.message}
                  </span>
                )}
              </label>

              <button
                type="submit"
                disabled={login.isPending}
                className="btn btn-primary mt-3 w-full shadow-lg shadow-primary/20"
              >
                {login.isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <LogIn size={18} />
                )}
                {login.isPending ? "Ingresando..." : "Ingresar al panel"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-base-content/45">
              © {new Date().getFullYear()} Willariq · Acceso protegido
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
