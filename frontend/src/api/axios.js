import axios from "axios";

const api = axios.create({
  baseURL: "https://anime-physique-calculator.onrender.com",
});

export default api;