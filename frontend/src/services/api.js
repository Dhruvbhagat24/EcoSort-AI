import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use((req) => {

    const token = localStorage.getItem("token");

    if (token) {
        req.headers.Authorization =
            `Bearer ${token}`;
    }

    return req;
});

export const analyzeWaste = (formData) =>
    API.post("/waste/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const getWasteStats = () => API.get("/waste/stats");

export const getWasteHistory = () => API.get("/waste/history");

export const getRecentScans = () => API.get("/waste/recent");

export default API;