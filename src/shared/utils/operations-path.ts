export const roleBase = (role?: string) =>
  role === "ADMIN" ? "" : role === "SUPERVISOR" ? "/supervisor" : "/operator";
