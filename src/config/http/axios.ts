import { create } from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const http = create({
  baseURL,
  withCredentials: true,
});

export default http;
