"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../components/Header";
import { FaLock, FaPlane, FaArrowLeft, FaCreditCard, FaRegQuestionCircle } from "react-icons/fa";

export default function PaymentPage() {
    const router = useRouter();
    const [selectedFlight, setSelectedFlight] = useState<any>(null);

    useEffect(() => {
        const data = localStorage.getItem("selectedFlight");
        if (data) {
            try {
                setSelectedFlight(JSON.parse(data));
            } catch (e) {
                console.error("Error parsing flight data", e);
            }
        }
    }, []);

    const handlePayNow = (e: React.FormEvent) => {
        e.preventDefault();
        router.push("/booking-success");
    };

    if (!selectedFlight) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#071C4B]"></div>
                </div>
            </div>
        );
    }

    const offer = selectedFlight.offer;
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    const baseFare = parseFloat(offer.price.total);
    const taxes = baseFare * 0.265;
    const total = baseFare + taxes;

    return (
        <main className="min-h-screen bg-[#F8FAFC] font-sans pb-10">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#071C4B] font-bold mb-4 hover:text-red-600 transition-colors uppercase text-[10px] tracking-widest"
                >
                    <FaArrowLeft size={10} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)] min-h-[500px]">
                    {/* LEFT: Payment Form */}
                    <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                                <FaCreditCard size={14} />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#071C4B] uppercase tracking-tight">Secure Payment</h1>
                            </div>
                        </div>

                        <form onSubmit={handlePayNow} className="p-6 flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cardholder Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-900/5 focus:border-[#071C4B] outline-none transition-all text-xs font-bold text-[#071C4B] placeholder:text-gray-300"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Card Number</label>
                                    <div className="relative group">
                                        <input
                                            required
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-900/5 focus:border-[#071C4B] outline-none transition-all text-xs font-bold text-[#071C4B] tracking-widest placeholder:tracking-normal placeholder:text-gray-300"
                                        />
                                        <FaCreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-900/5 focus:border-[#071C4B] outline-none transition-all text-xs font-bold text-[#071C4B] placeholder:text-gray-300"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                                            CVV
                                            <FaRegQuestionCircle className="text-gray-300" />
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="123"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-900/5 focus:border-[#071C4B] outline-none transition-all text-xs font-bold text-[#071C4B] placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer group py-2">
                                    <input type="checkbox" defaultChecked className="accent-[#071C4B]" />
                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 uppercase">Billing address same as contact</span>
                                </label>
                            </div>

                            <div className="mt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-[#C41E22] hover:bg-[#A0181B] text-white font-black py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-widest flex items-center justify-center gap-3 text-sm"
                                >
                                    PAY INR {total.toLocaleString('en-IN')}
                                </button>
                                <div className="flex items-center justify-center gap-1.5 mt-3 opacity-50">
                                    <FaLock size={8} className="text-[#071C4B]" />
                                    <span className="text-[8px] font-black text-[#071C4B] uppercase tracking-widest">SSL Encrypted Transaction</span>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT: Trip Summary */}
                    <div className="lg:col-span-4 bg-[#071C4B] rounded-3xl p-6 text-white flex flex-col justify-between shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                        {/* Decorative Circle */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-10 left-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="relative w-28 h-8">
                                    <Image src="/logo.png" alt="HiFi Logo" fill className="object-contain object-left brightness-0 invert opacity-60" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded">Trip Summary</span>
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <div className="text-center">
                                    <div className="text-4xl font-black tracking-tighter">{firstSegment.departure.iataCode}</div>
                                    <div className="text-xs font-bold text-white/40 uppercase mt-1">Origin</div>
                                </div>
                                <FaPlane className="text-xl text-white/20" />
                                <div className="text-center">
                                    <div className="text-4xl font-black tracking-tighter">{lastSegment.arrival.iataCode}</div>
                                    <div className="text-xs font-bold text-white/40 uppercase mt-1">Dest</div>
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5 flex-1 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-white/50 uppercase">Date</span>
                                    <span className="text-[10px] font-bold">{new Date(firstSegment.departure.at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-white/50 uppercase">Airline</span>
                                    <span className="text-[10px] font-bold">{offer.validatingAirlineCodes[0]}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-bold text-white/50 uppercase">Class</span>
                                    <span className="text-[10px] font-bold">Economy</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-white/60">
                                    <span>Base Fare</span>
                                    <span>₹{baseFare.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-white/60">
                                    <span>Taxes</span>
                                    <span>₹{taxes.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/10">
                                    <span className="text-xs font-black uppercase tracking-widest">Total</span>
                                    <span className="text-2xl font-black text-white tracking-tighter">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
