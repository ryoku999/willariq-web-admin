import { ConfirmActionButton } from "@/presentation/components/ConfirmActionButton";
import { useLogout } from "@/infrastructure/hooks/use-auth";

const LogOutBtn = () => {
  const logout = useLogout();

  return (
    <ConfirmActionButton
      disabled={logout.isPending}
      confirmation={{
        title: "¿Cerrar sesión?",
        description: "Tendrás que iniciar sesión de nuevo para acceder al panel.",
        onAccept: () => logout.mutate(),
      }}
    >
      Cerrar sesión
    </ConfirmActionButton>
  );
};

export default LogOutBtn;
