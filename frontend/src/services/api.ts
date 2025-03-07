import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export const loginUser = async (username: string) => {
  return axios.post(`${API_BASE_URL}/login`, { username });
};

export const getTeas = async () => {
  return axios.get(`${API_BASE_URL}/teas`);
};

export const getRatings = async () => {
    return axios.get(`${API_BASE_URL}/ratings`);
};


export const submitRating = async (userId: number, teaId: number, ratingData: object) => {
  return axios.post(`${API_BASE_URL}/submit`, { user_id: userId, tea_id: teaId, ...ratingData });
};

export const getSummary = async () => {
  return axios.get(`${API_BASE_URL}/summary`);
};

export const getAdminData = async (token: string) => {
  return axios.get(`${API_BASE_URL}/dashboard`, {
    headers: { Authorization: token },
  });
};
