import api from "./axios";

export const calculateMatch = async (data) => {

  const response = await api.post(

    "/calculator/match",

    data

  );

  return response.data;

};