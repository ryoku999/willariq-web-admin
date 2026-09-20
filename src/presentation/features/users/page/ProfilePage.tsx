import { useUserProfile } from "@/infrastructure/hooks/use-users";
import ErrorState from "@/presentation/components/ErrorState";
import LoadingState from "@/presentation/components/LoadingState";

const ProfilePage = () => {
  const { refetch, isError, isLoading } = useUserProfile();

  if (isLoading) {
    return <LoadingState message="Cargndo datosj" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Error al cargar los datos del perfil"
        title="Error"
        onRetry={refetch}
      />
    );
  }

  return (
    <div>
      <h1>profile</h1>
    </div>
  );
};

export default ProfilePage;
