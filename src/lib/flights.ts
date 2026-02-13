import apiClient from "./apiClient";
import { AxiosError } from "axios";

export interface FlightSearchParams {
    origin: string;
    destination: string;
    departureDate: string;
    adults: number;
}

import { supabase } from "@/src/lib/supabase";

export const searchFlights = async (params: FlightSearchParams) => {
    try {
        console.log("🚀 [FLIGHT SEARCH] Invoking Edge Function:", params);

        const { data, error } = await supabase.functions.invoke('search-flights', {
            body: params
        });

        if (error) {
            console.error("❌ [EDGE FUNCTION ERROR]", error);
            throw new Error(error.message || "Edge Function failed");
        }

        console.log("✅ [FLIGHT SEARCH] Results received:", data?.data?.length || 0);
        return data;
    } catch (error: any) {
        console.error("❌ [FLIGHT SEARCH] Error:", error);
        throw new Error(error.message || "Failed to search flights");
    }
};

export const getFlightAncillaries = async (flightOffer: any) => {
    try {
        // Amadeus Pricing API expectation for ancillaries check
        const response = await apiClient.post("/flights/ancillaries", {
            data: {
                type: "flight-offers-pricing",
                flightOffers: [flightOffer]
            }
        });
        return response.data;
    } catch (error) {
        // If complex structure fails, try fallback or just log
        console.error("Ancillary fetch error", error);
        return null;
    }
};

export const getFlightSeatmaps = async (flightOffer: any) => {
    try {
        // Use pricing context structure for better compatibility
        const response = await apiClient.post("/flights/seatmaps", {
            data: {
                type: "flight-offers-pricing",
                flightOffers: [flightOffer]
            }
        });
        return response.data;
    } catch (error) {
        console.error("Seatmap fetch error", error);
        return null;
    }
};
