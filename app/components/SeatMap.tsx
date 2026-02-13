"use client";

import { useState } from "react";
import { FaUser } from "react-icons/fa";

interface SeatMapProps {
    data: any;
    onSeatSelect: (seat: any) => void;
}

export default function SeatMap({ data, onSeatSelect }: SeatMapProps) {
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

    // Parse decks from response
    const decks = data?.data?.[0]?.decks || [];

    const handleSelect = (seat: any) => {
        setSelectedSeat(seat.number);
        onSeatSelect(seat);
    };

    if (decks.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                Seatmap data not structured as expected.
            </div>
        );
    }

    // Flatten seats to find max/min for grid or just simple iteration?
    // Amadeus Seatmap usually provides explicit seats list.
    // We'll render a flex/grid layout per deck.

    return (
        <div className="space-y-8">
            {decks.map((deck: any, deckIndex: number) => (
                <div key={deckIndex} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h4 className="text-center font-bold text-gray-700 mb-4">
                        Deck {deckIndex + 1}
                    </h4>

                    <div className="flex flex-col items-center gap-2">
                        {/* Simple visualization: Group by Row (Y coordinate) if possible, else generic wrap */}
                        {/* Assuming 'seats' array exists in deck */}
                        <div className="grid grid-cols-6 gap-3 sm:gap-4">
                            {deck.seats?.map((seat: any) => {
                                const isSelected = selectedSeat === seat.number;
                                const isAvailable = seat.travelerPricing?.[0]?.seatAvailabilityStatus === "AVAILABLE";

                                return (
                                    <button
                                        key={seat.number}
                                        disabled={!isAvailable}
                                        onClick={() => handleSelect(seat)}
                                        className={`
                            relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xs font-bold transition-all
                            ${isSelected
                                                ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 scale-110"
                                                : isAvailable
                                                    ? "bg-white border border-gray-300 text-gray-700 hover:border-blue-400 hover:shadow-md"
                                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }
                        `}
                                        title={`Seat ${seat.number} - ${seat.characteristicsCodes?.join(", ")}`}
                                    >
                                        {seat.number}
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                                <FaUser size={8} className="text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}

            <div className="flex justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span>Occupied</span>
                </div>
            </div>
        </div>
    );
}
