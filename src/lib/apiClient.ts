import axios from "axios";

const apiClient = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

apiClient.interceptors.request.use(config => {
    console.log(`📡 [API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params || "");
    return config;
});

apiClient.interceptors.response.use(
    response => {
        console.log(`✅ [API RESPONSE] ${response.status} from ${response.config.url}`);
        return response;
    },
    error => {
        console.error(`❌ [API ERROR] ${error.response?.status} from ${error.config?.url}`, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
