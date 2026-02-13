import api from "./api";

export interface FlightSearchParams {
    from: string;
    to: string;
    date: string;
}

export const searchFlights = async (params: FlightSearchParams) => {
    const response = await api.post("/api/search", params);
    return response.data;
};
