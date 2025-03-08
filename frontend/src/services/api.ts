import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

export const loginUser = async (username: string) => {
  return axios.post(`${API_BASE_URL}/login`, { username });
};

export const logoutUser = async () => {
  return axios.post(`${API_BASE_URL}/logout`);
};

export const registerUser = async (username: string) => {
  return axios.post(`${API_BASE_URL}/register-user`, { "name": username });
};

export const getTeas = async () => {
  return axios.get(`${API_BASE_URL}/teas`);
};

export const getRatings = async () => {
    return axios.get(`${API_BASE_URL}/ratings`);
};

export const getUserRatings = async (userId: number) => {
    console.log(userId);
    return axios.get(`${API_BASE_URL}/user-ratings/${userId}`);
};

export const getUser = async (userId: number) => {
    return axios.get(`${API_BASE_URL}/user/${userId}`);
};

export const submitRating = async (ratingData: object) => {
  return axios.post(`${API_BASE_URL}/submit`, { ...ratingData });
};

export const editRating = async (ratingId: number, ratingData: object) => {
  return axios.put(`${API_BASE_URL}/ratings/${ratingId}`, { ...ratingData });
};

export const getSummary = async () => {
  return axios.get(`${API_BASE_URL}/summary`);
};

export const getAdminData = async (token: string) => {
  return axios.get(`${API_BASE_URL}/dashboard`, {
    headers: { Authorization: token },
  });
};
