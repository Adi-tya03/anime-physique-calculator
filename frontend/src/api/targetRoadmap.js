import api from "./axios";

export const getTargetPreview = async (data) => {
  const response = await api.post("/roadmap/target-preview", data);
  return response.data;
};

export const generateTargetRoadmap = async (data) => {
  const response = await api.post("/roadmap/generate", data);
  return response.data;
};