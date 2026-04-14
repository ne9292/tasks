import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

axios.defaults.baseURL ="https://authserver-74p8.onrender.com/api";

axios.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const service = {
    //קבלת כל המשימות
    getTasks: async () => {
        const result = await axios.get("/items");
        return result.data;
    },

    // הוספת משימה
  addTask: async (name) => {
    const result = await axios.post("/items", { 
        name: name, 
        isComplete: false 
    });
    return result.data;
},
//עדכון המשימה
 setCompleted: async (id, name, isComplete) => {
    const result = await axios.put(`/items/${id}`, { 
        id: id,
        name: name, 
        isComplete: isComplete 
    });
    return result.data;
},
//מחיקת משימה
    deleteTask: async (id) => {
        await axios.delete(`/items/${id}`);
    },
    //הרשמה
    login: async (username, password) => {
        const result = await axios.post("/login", { username, password });
        localStorage.setItem("token", result.data.token);
        return result.data;
    },
    //כניסה
    register: async (username, password) => {
        await axios.post("/register", { username, password });
    },
    getUserInfo: () => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try { return jwtDecode(token); } catch { return null; }
    },
    logout: () => { localStorage.removeItem("token"); }
};

export default service;