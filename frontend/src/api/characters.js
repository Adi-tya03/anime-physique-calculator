import api from "./axios";

export const getCharacters = async () => {
  const response = await api.get("/characters/");
  return response.data;
};