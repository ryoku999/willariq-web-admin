import { useLogout } from "@/infrastructure/hooks/use-auth";

const LogOutBtn = () => {
  const logout = useLogout();

  const onCloseSession = () => {
    logout.mutate();
  };

  return <button onClick={onCloseSession}>cerra sersion</button>;
};

export default LogOutBtn;
