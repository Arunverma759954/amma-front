"use client";

import { FaTimes } from "react-icons/fa";
import FlightExtras from "./FlightExtras";

interface DetailsModalProps {
    flight: any;
    onClose: () => void;
    initialTab?: 'details' | 'seats' | 'meals';
}

export default function DetailsModal({ flight, onClose, initialTab = 'seats' }: DetailsModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Flight Extras</h2>
                        <p className="text-sm text-gray-500">
                            Customize your journey for Flight {flight.itineraries?.[0]?.segments?.[0]?.carrierCode} {flight.itineraries?.[0]?.segments?.[0]?.number}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Use the new FlightExtras component for the body */}
                <FlightExtras
                    flight={flight}
                    initialTab={initialTab}
                    onClose={onClose}
                />

            </div>
        </div>
    );
}
