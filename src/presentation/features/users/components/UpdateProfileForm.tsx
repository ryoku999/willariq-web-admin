import type {
  UpdateProfileReq,
  UserProfile,
} from "@/core/entities/users.entity";
import { useUpdateProfile } from "@/infrastructure/hooks/use-users";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Pencil, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().trim().min(2, "Ingresa tus nombres"),
  lastName: z.string().trim().min(2, "Ingresa tus apellidos"),
  phone: z.string().trim().min(7, "Ingresa un teléfono válido"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type UpdateProfileFormProps = {
  user: UserProfile;
};

const UpdateProfileForm = ({ user }: UpdateProfileFormProps) => {
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
    },
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    const payload: UpdateProfileReq = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
    };
    updateProfile.mutate(payload, {
      onSuccess: (updatedUser) =>
        reset({
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone ?? "",
        }),
    });
  };

  return (
    <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Pencil size={19} />
        </div>
        <div>
          <h2 className="text-lg font-bold">Editar información</h2>
          <p className="mt-1 text-sm text-base-content/55">
            Actualiza los datos visibles de tu perfil.
          </p>
        </div>
      </div>

      {updateProfile.isError && (
        <div className="alert alert-error mb-5 text-sm">
          No pudimos actualizar tu perfil. Revisa los datos e inténtalo
          nuevamente.
        </div>
      )}

      {updateProfile.isSuccess && !isDirty && (
        <div className="alert alert-success mb-5 text-sm">
          <Check size={17} /> Tus datos se actualizaron correctamente.
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-control">
            <span className="label pb-2 font-semibold">Nombres</span>
            <input
              {...register("firstName")}
              className={`input input-bordered w-full focus:input-primary ${errors.firstName ? "input-error" : ""}`}
              autoComplete="given-name"
            />
            {errors.firstName && (
              <span className="label-text-alt mt-1 text-error">
                {errors.firstName.message}
              </span>
            )}
          </label>
          <label className="form-control">
            <span className="label pb-2 font-semibold">Apellidos</span>
            <input
              {...register("lastName")}
              className={`input input-bordered w-full focus:input-primary ${errors.lastName ? "input-error" : ""}`}
              autoComplete="family-name"
            />
            {errors.lastName && (
              <span className="label-text-alt mt-1 text-error">
                {errors.lastName.message}
              </span>
            )}
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="form-control">
            <span className="label pb-2 font-semibold">Teléfono</span>
            <input
              {...register("phone")}
              className={`input input-bordered w-full focus:input-primary ${errors.phone ? "input-error" : ""}`}
              autoComplete="tel"
            />
            {errors.phone && (
              <span className="label-text-alt mt-1 text-error">
                {errors.phone.message}
              </span>
            )}
          </label>
          <div className="form-control">
            <span className="label pb-2 font-semibold">DNI</span>
            <div className="input input-bordered flex items-center gap-2 bg-base-200/60 text-base-content/55">
              <UserRound size={17} /> {user.dni}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-base-300 pt-5">
          <button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
            className="btn btn-primary gap-2"
          >
            {updateProfile.isPending && (
              <Loader2 size={17} className="animate-spin" />
            )}
            {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default UpdateProfileForm;
