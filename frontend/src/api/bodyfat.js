import api from "./axios";

export const estimateBodyFat = async (data) => {

    const response = await api.post(
        "/calculator/estimate-bodyfat",
        data
    );

    return response.data;

};