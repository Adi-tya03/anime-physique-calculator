import api from "./axios";

export const generateRoadmap = async (data) => {
  const response = await api.post("/roadmap/generate", data);
  return response.data;
};