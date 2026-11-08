import { isAxiosError } from "axios";
import { Link } from "react-router-dom";
import { useLogin } from "@/infrastructure/hooks/use-auth";
import type { LoginT } from "../schemas/login.schema";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { roleBasedRedirection } from "@/shared/utils/role-based-redirection";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/login.schema";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react";

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
        navigate(roleBasedRedirection(data.role));
      },
    });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-base-200 px-4 py-8 text-base-content">
      <section className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-6 shadow-lg sm:p-8">
        <div className="mb-8 text-center">
          <img
            src="/logo-v2.jpeg"
            alt="Willariq"
            className="mx-auto mb-4 size-16 rounded-xl object-contain"
          />
          <h1 className="text-3xl font-bold tracking-tight">Inicia sesión</h1>
        </div>

        {login.isError && (
          <div role="alert" className="alert alert-error mb-6 text-sm">
            <span>
              {isAxiosError(login.error) &&
              login.error.response?.data?.code === "AUTH_CHANNEL_ROLE_FORBIDDEN"
                ? "Esta cuenta es ciudadana. Inicia sesión en la app móvil."
                : "No pudimos iniciar sesión. Revisa tus credenciales e inténtalo nuevamente."}
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
          <Link
            className="link link-primary text-sm"
            to="/recuperar-contrasena"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
