import axios from "axios";

export const BASE_URL = "https://prolinkedinconnect.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
