import apiClient from "./apiClient";
import { AxiosError } from "axios";

export interface HotelSearchParams {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
}

export interface HotelOffer {
    type: string;
    hotel: {
        hotelId: string;
        name: string;
        cityCode: string;
    };
    available: boolean;
    offers: {
        id: string;
        checkInDate: string;
        checkOutDate: string;
        room: {
            type: string;
            typeEstimated: {
                category: string;
                beds: number;
                bedType: string;
            };
            description: {
                text: string;
            }
        };
        guests: {
            adults: number;
        };
        price: {
            currency: string;
            total: string;
            totalTaxes?: string;
        };
    }[];
}

export const searchHotels = async (params: HotelSearchParams) => {
    try {
        const response = await apiClient.post("/hotels/offers-by-city", {
            cityCode: params.cityCode,
            checkInDate: params.checkInDate,
            checkOutDate: params.checkOutDate,
            adults: params.guests
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            // Pass the specific error response details for better toast handling
            const backendMessage = error.response?.data?.message;
            const errorMessage = backendMessage || error.message || "Failed to search hotels";
            throw new Error(errorMessage);
        }
        throw new Error("An unexpected error occurred");
    }
};

export const getHotelOffers = async () => {
    try {
        // Provide default dummy params to satisfy backend validation
        const response = await apiClient.post("/hotels/offers-by-city", {
            cityCode: "PAR",
            checkInDate: "2026-06-01",
            checkOutDate: "2026-06-05",
            adults: 1
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch hotel offers", error);
        return null; // Fail silently for initial load
    }
};
