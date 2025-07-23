// utils/ApiService.js
import axios from "axios";

class ApiService {
    constructor(token) {
        this.api = axios.create({
            baseURL: "https://backend.outlinekerala.com/admin_app/api",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async getTags() {
        const response = await this.api.get("/tags/");
        return response.data;
    }

    async getCategories() {
        const response = await this.api.get("/subcategories/");
        return response.data;
    }

    async getNewsById(id) {
        const response = await this.api.get(`/news/${id}/`);
        return response.data;
    }

    async createNews(formData) {
        return this.api.post("/news/create/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }

    async updateNews(id, formData) {
        return this.api.put(`/news/${id}/update/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }

    
    
}

export default ApiService;
