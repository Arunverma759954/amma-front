"use client";

import { useEffect, useState } from "react";
import { getFlightAncillaries, getFlightSeatmaps } from "@/src/lib/flights";
import { FaChair, FaUtensils, FaTimes, FaCheck, FaPlane, FaUser } from "react-icons/fa";
import { GiMeal } from "react-icons/gi";
import SeatMap from "./SeatMap";

interface FlightExtrasProps {
    flight: any;
    initialTab?: 'details' | 'seats' | 'meals' | 'passenger';
    onClose?: () => void;
}

export default function FlightExtras({ flight, initialTab = 'details', onClose }: FlightExtrasProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'seats' | 'meals' | 'passenger'>(initialTab);
    const [seatmap, setSeatmap] = useState<any>(null);
    const [ancillaries, setAncillaries] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Selections
    const [selectedSeat, setSelectedSeat] = useState<any>(null);
    const [selectedMeal, setSelectedMeal] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [seats, anc] = await Promise.all([
                    getFlightSeatmaps(flight),
                    getFlightAncillaries(flight)
                ]);
                setSeatmap(seats);
                setAncillaries(anc);
            } catch (e) {
                console.error("Failed to fetch details", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [flight]);

    return (
        <div className="flex flex-col h-full bg-gray-50/30">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-4 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'details' ? 'text-[#071C4B] bg-blue-50/50' : 'text-gray-400 hover:text-gray-700'}`}
                >
                    <FaPlane /> Flight Details
                    {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#071C4B]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('seats')}
                    className={`flex-1 py-4 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'seats' ? 'text-[#071C4B] bg-blue-50/50' : 'text-gray-400 hover:text-gray-700'
                        }`}
                >
                    <FaChair /> Aircraft Seating
                    {activeTab === 'seats' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#071C4B]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('meals')}
                    className={`flex-1 py-4 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'meals' ? 'text-[#071C4B] bg-blue-50/50' : 'text-gray-400 hover:text-gray-700'
                        }`}
                >
                    <FaUtensils /> Meal Plans
                    {activeTab === 'meals' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#071C4B]"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('passenger')}
                    className={`flex-1 py-4 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'passenger' ? 'text-[#071C4B] bg-blue-50/50' : 'text-gray-400 hover:text-gray-700'
                        }`}
                >
                    <FaUser /> Passenger
                    {activeTab === 'passenger' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#071C4B]"></div>}
                </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 animate-pulse">Initializing booking options...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'details' && (
                            <div className="animate-fade-in-up space-y-6">
                                {flight.itineraries.map((itin: any, iidx: number) => (
                                    <div key={iidx} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                                        <h4 className="text-xs font-black text-[#071C4B] uppercase tracking-widest mb-6 border-b pb-2">
                                            {iidx === 0 ? 'Outbound' : 'Inbound'} Journey
                                        </h4>
                                        <div className="space-y-0">
                                            {itin.segments.map((seg: any, sidx: number) => {
                                                const departureTime = new Date(seg.departure.at);
                                                const arrivalTime = new Date(seg.arrival.at);
                                                const nextSeg = itin.segments[sidx + 1];

                                                return (
                                                    <div key={sidx}>
                                                        {/* Segment */}
                                                        <div className="flex gap-6 relative">
                                                            {/* Line connection */}
                                                            {nextSeg && <div className="absolute left-[15px] top-6 bottom-[-24px] w-px bg-gray-200"></div>}

                                                            <div className="flex flex-col items-center z-10">
                                                                <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-[#071C4B] font-black text-[10px]">
                                                                    {sidx + 1}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 pb-10">
                                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
                                                                    <div className="flex gap-4 items-center">
                                                                        <div>
                                                                            <div className="text-xl font-black text-[#071C4B]">{departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{seg.departure.iataCode}</div>
                                                                        </div>
                                                                        <div className="flex flex-col items-center">
                                                                            <FaPlane className="text-gray-300 text-[10px] rotate-90" />
                                                                            <div className="w-12 h-[2px] bg-gray-100"></div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xl font-black text-[#071C4B]">{arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{seg.arrival.iataCode}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-left sm:text-right bg-gray-50/50 p-3 rounded-xl border border-gray-100 min-w-[140px] backdrop-blur-sm">
                                                                        <div className="text-[10px] font-black uppercase text-[#071C4B] tracking-wider">{seg.carrierCode} {seg.number}</div>
                                                                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">Terminal {seg.departure.terminal || '1'}</div>
                                                                        <div className="mt-2 flex gap-1.5 justify-start sm:justify-end">
                                                                            <span className="text-[8px] bg-white border border-gray-100 px-1.5 py-0.5 rounded font-black text-gray-500 uppercase tracking-widest shadow-sm">Coach</span>
                                                                            <span className="text-[8px] bg-white border border-gray-100 px-1.5 py-0.5 rounded font-black text-gray-500 uppercase tracking-widest shadow-sm">{seg.duration.replace('PT', '').toLowerCase()}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Baggage Info */}
                                                                <div className="mt-2 flex gap-4">
                                                                    {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[sidx] && (
                                                                        <div className="flex items-center gap-2 bg-green-50/50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100/50 backdrop-blur-sm">
                                                                            <span className="text-xs">🧳</span>
                                                                            <div className="text-[9px] font-black uppercase tracking-widest">
                                                                                Includes: {(() => {
                                                                                    const b = flight.travelerPricings[0].fareDetailsBySegment[sidx].includedCheckedBags;
                                                                                    return b ? (b.quantity ? `${b.quantity} Bag(s)` : b.weight + (b.weightUnit || 'kg')) : 'Hand baggage only';
                                                                                })()}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Layover */}
                                                        {nextSeg && (
                                                            <div className="ml-14 my-4 bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center gap-3">
                                                                <span className="text-lg">⏳</span>
                                                                <div className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">
                                                                    Wait {(() => {
                                                                        const diff = (new Date(nextSeg.departure.at).getTime() - arrivalTime.getTime()) / 1000 / 60;
                                                                        const h = Math.floor(diff / 60);
                                                                        const m = Math.floor(diff % 60);
                                                                        return `${h}h ${m}m`;
                                                                    })()} layover in {seg.arrival.iataCode}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Price Summary Card */}
                                <div className="bg-gradient-to-br from-[#071C4B] to-blue-900 rounded-2xl p-6 text-white shadow-xl">
                                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Price Summary</h4>
                                        <div className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {flight.price.currency}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70 font-bold uppercase tracking-tighter">Base Fare (1 Adult)</span>
                                            <span className="font-black">INR {parseFloat(flight.basePrice || flight.price.total).toLocaleString('en-IN')}</span>
                                        </div>
                                        {flight.adjustment !== 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="opacity-70 font-bold uppercase tracking-tighter">Markup ({flight.adjustment}%)</span>
                                                <span className="font-black">INR {(parseFloat(flight.price.total) - parseFloat(flight.basePrice || flight.price.total)).toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                            <div>
                                                <div className="text-[10px] font-black opacity-60 uppercase tracking-widest">Grand Total</div>
                                                <div className="text-3xl font-black">INR {parseFloat(flight.price.total).toLocaleString('en-IN')}</div>
                                            </div>
                                            <div className="text-[9px] font-bold opacity-60 uppercase tracking-tighter text-right">
                                                Includes all taxes <br /> & surcharges
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'seats' && (
                            <div className="animate-fade-in-up">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Select Your Seat</h3>
                                        <p className="text-sm text-gray-500">Choose your preferred spot on the aircraft.</p>
                                    </div>
                                    {selectedSeat && (
                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold animate-bounce-in">
                                            Selected: {selectedSeat.number}
                                        </div>
                                    )}
                                </div>

                                {seatmap && seatmap.data && seatmap.data.length > 0 ? (
                                    <SeatMap
                                        data={seatmap}
                                        onSeatSelect={setSelectedSeat}
                                    />
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <FaChair className="mx-auto text-4xl text-gray-300 mb-2" />
                                        <p className="text-gray-500">Seat selection is unavailable for this flight.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'meals' && (
                            <div className="animate-fade-in-up">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">In-Flight Dining</h3>

                                {ancillaries ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Mock list for UI demo */}
                                        {['Vegetarian Hindu Meal', 'Gluten Free Meal', 'Kosher Meal', 'Muslim Meal'].map((meal, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedMeal(meal)}
                                                className={`
                                                flex items-center gap-4 p-4 rounded-xl border transition-all text-left group
                                                ${selectedMeal === meal
                                                        ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500'
                                                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow'
                                                    }
                                            `}
                                            >
                                                <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 transition-colors
                                                ${selectedMeal === meal ? 'bg-blue-500 text-white' : 'bg-orange-100 text-orange-500 group-hover:bg-blue-100 group-hover:text-blue-500'}
                                            `}>
                                                    <GiMeal />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`font-bold ${selectedMeal === meal ? 'text-blue-900' : 'text-gray-800'}`}>{meal}</h4>
                                                    <p className="text-xs text-gray-500 mt-1">Special dietary option</p>
                                                </div>
                                                {selectedMeal === meal && <FaCheck className="text-blue-600" />}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500">No meal plans available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'passenger' && (
                            <div className="animate-fade-in-up space-y-6 max-w-2xl mx-auto">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-black text-[#071C4B] uppercase tracking-widest">Traveler Details</h3>
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-tighter mt-1">Please enter names as they appear on your passport/ID</p>
                                </div>

                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-8 space-y-6 shadow-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                            <input type="text" className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#071C4B] focus:ring-2 focus:ring-[#071C4B] focus:border-transparent transition-all outline-none" placeholder="Enter first name" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                            <input type="text" className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#071C4B] focus:ring-2 focus:ring-[#071C4B] focus:border-transparent transition-all outline-none" placeholder="Enter last name" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                            <input type="date" className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#071C4B] focus:ring-2 focus:ring-[#071C4B] focus:border-transparent transition-all outline-none" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Passport Number (Optional)</label>
                                            <input type="text" className="w-full bg-[#F8F9FA] border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#071C4B] focus:ring-2 focus:ring-[#071C4B] focus:border-transparent transition-all outline-none" placeholder="Enter passport number" />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                                        <input type="checkbox" id="save-traveler" className="w-4 h-4 text-[#071C4B] rounded border-gray-300" />
                                        <label htmlFor="save-traveler" className="text-xs font-bold text-gray-500 uppercase cursor-pointer">Save traveler details for future bookings</label>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#071C4B] text-white rounded-full flex items-center justify-center text-xl shadow-lg ring-4 ring-blue-50">
                                        🛡️
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-[#071C4B] uppercase tracking-widest">Travel Guarantee</div>
                                        <p className="text-[11px] text-gray-600 font-bold mt-0.5">Your booking is protected by HiFi Travels 24/7 support and security.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            {onClose && (
                <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center sticky bottom-0 z-10">
                    <div className="text-sm text-gray-500">
                        {(selectedSeat || selectedMeal) ? (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                                <FaCheck /> Changes saved locally
                            </span>
                        ) : (
                            <span>No extras selected</span>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            if (activeTab === 'passenger') {
                                // Final step - could trigger booking completion
                                alert('Booking inquiry sent! Our team will contact you shortly.');
                                onClose?.();
                            } else {
                                setActiveTab('passenger');
                            }
                        }}
                        className="px-12 py-3 bg-[#071C4B] text-white font-black rounded-xl hover:bg-black transition-all shadow-xl shadow-blue-900/10 transform active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                    >
                        {activeTab === 'passenger' ? 'Complete Booking' : 'Continue to Passenger'}
                    </button>
                </div>
            )}
        </div>
    );
}
