"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCheckCircle, FaPrint, FaHome, FaPlane, FaDownload } from "react-icons/fa";
import Header from "../components/Header";

export default function BookingSuccessPage() {
    const [bookingData, setBookingData] = useState<any>(null);

    useEffect(() => {
        const data = localStorage.getItem("selectedFlight");
        if (data) {
            try {
                setBookingData(JSON.parse(data));
            } catch (e) {
                console.error("Error parsing booking data", e);
            }
        }
    }, []);

    const handleDownloadPDF = () => {
        window.print();
    };

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="animate-spin text-4xl text-[#071C4B]">...</div>
                        <h1 className="text-sm font-black text-[#071C4B] uppercase tracking-widest">Generating Ticket...</h1>
                    </div>
                </div>
            </div>
        );
    }

    const offer = bookingData.offer;
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    // Shared Data
    const pnr = "WFWMSE";
    const seat = "10A";
    const deptDate = new Date(firstSegment.departure.at);
    const arrDate = new Date(lastSegment.arrival.at);

    // E-Ticket Specific Data
    const agencyRef = "FKL28X";
    const ticketNumber = "098" + Math.floor(Math.random() * 10000000000);
    const dateOfIssue = new Date().toLocaleDateString('en-GB');
    const duration = itinerary.duration.replace("PT", "").toLowerCase().replace("h", "h ").replace("m", "m");

    return (
        <main className="min-h-screen bg-[#F8FAFC] font-sans pb-10 print:bg-white print:pb-0 print:pt-0">

            {/* =========================================================================
                SCREEN VIEW: BOARDING PASS DESIGN (Blue Card)
                Visible ONLY on Screen, HIDDEN during Print
               ========================================================================= */}
            <div className="print:hidden">
                <Header />

                <div className="max-w-md mx-auto px-4 py-8 flex flex-col items-center w-full">
                    {/* Status */}
                    <div className="flex items-center gap-3 mb-6 bg-green-50 px-6 py-2 rounded-full border border-green-100 shadow-sm">
                        <FaCheckCircle className="text-green-500 text-lg" />
                        <span className="text-xs font-black text-green-700 uppercase tracking-widest">Booking Confirmed</span>
                    </div>

                    {/* BOARDING PASS CARD */}
                    <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden relative">
                        {/* Blue Header Section */}
                        <div className="bg-[#000080] text-white p-6 relative">
                            {/* Decorations */}
                            <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-white/20 rounded-r-lg"></div>

                            <div className="flex justify-between items-start mb-8">
                                <span className="font-black italic text-sm text-white">HIFI <span className="text-red-400">Travels</span></span>
                            </div>

                            {/* Route */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <div className="text-[10px] font-medium text-white/70 uppercase mb-1">DELHI, T1</div>
                                    <div className="text-5xl font-normal tracking-tight text-[#4dff4d]">{firstSegment.departure.iataCode}</div>
                                </div>
                                <div className="text-center flex flex-col items-center">
                                    <div className="text-[10px] font-medium text-white/70">{itinerary.duration.replace('PT', '').toLowerCase()}</div>
                                    <div className="w-20 border-t border-dashed border-white/30 my-1"></div>
                                    <div className="text-[10px] text-white/70">Non - Stop</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-medium text-white/70 uppercase mb-1">LUCKNOW, T3</div>
                                    <div className="text-5xl font-normal tracking-tight text-[#4dff4d]">{lastSegment.arrival.iataCode}</div>
                                </div>
                            </div>

                            {/* Date/Time */}
                            <div className="grid grid-cols-2 gap-8 mb-6">
                                <div>
                                    <div className="text-[10px] text-white/70 uppercase mb-1">DEPARTS DATE</div>
                                    <div className="text-lg font-medium">{deptDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-white/70 uppercase mb-1">ARRIVES DATE</div>
                                    <div className="text-lg font-medium">{arrDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8 mb-4 relative z-10">
                                <div>
                                    <div className="text-[10px] text-white/70 uppercase mb-1">DEPARTS TIME</div>
                                    <div className="text-2xl font-bold">{deptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-white/70 uppercase mb-1">ARRIVES TIME</div>
                                    <div className="text-2xl font-bold">{arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                </div>
                            </div>

                            {/* Cutout circles */}
                            <div className="absolute -bottom-4 left-0 w-8 h-8 bg-[#F8FAFC] rounded-full"></div>
                            <div className="absolute -bottom-4 right-0 w-8 h-8 bg-[#F8FAFC] rounded-full"></div>
                        </div>

                        {/* QR Code */}
                        <div className="relative flex justify-center -mt-10 mb-6">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PNR:${pnr}`} alt="QR" className="w-28 h-28" />
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="px-6 pb-8">
                            <div className="mb-6"><div className="text-sm font-semibold text-gray-800">MR John Doe</div></div>
                            <div className="grid grid-cols-3 gap-y-6 text-left">
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase mb-1">PNR</div>
                                    <div className="text-sm font-bold text-gray-800">{pnr}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase mb-1">Flight</div>
                                    <div className="text-sm font-bold text-gray-800">{offer.validatingAirlineCodes[0]} {firstSegment.number}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase mb-1">Gate</div>
                                    <div className="text-sm font-bold text-gray-800">-</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase mb-1">Boarding</div>
                                    <div className="text-sm font-bold text-gray-800">{new Date(deptDate.getTime() - 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase mb-1">Departs Time</div>
                                    <div className="text-sm font-bold text-gray-800">{deptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase mb-1">Seat</div>
                                    <div className="text-sm font-bold text-gray-800">{seat}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 uppercase mb-1">Seq</div>
                                    <div className="text-sm font-bold text-gray-800">0005</div>
                                </div>
                            </div>
                            <div className="mt-8 pt-4 border-t border-dashed border-gray-200">
                                <div className="text-[10px] text-gray-400">Sp. Services</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-8 flex gap-4 w-full">
                        <button onClick={handleDownloadPDF} className="flex-1 bg-[#000080] text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-2">
                            <FaDownload /> Download Ticket
                        </button>
                        <Link href="/" className="flex-1 bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                            <FaHome /> Back Home
                        </Link>
                    </div>
                </div>
            </div>


            {/* =========================================================================
                PRINT VIEW: ELECTRONIC TICKET DESIGN (A4 White Paper)
                Hidden on Screen, Visible ONLY during Print
               ========================================================================= */}
            <div className="hidden print:block text-black bg-white relative">
                {/* WATERMARK */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                    <div className="text-[100px] font-black text-gray-100 -rotate-45 opacity-40 select-none transform scale-150 whitespace-nowrap border-8 border-gray-100 p-12 rounded-3xl">
                        HIFI TRAVELS
                    </div>
                </div>

                <div className="max-w-[210mm] mx-auto p-8 h-full bg-white relative z-10">

                    {/* 1. Header Logo & Title */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative w-48 h-16 mb-4">
                            <Image src="/logo.png" alt="HiFi Travels" width={200} height={80} className="object-contain" />
                        </div>
                        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">ELECTRONIC TICKET</h1>
                    </div>

                    {/* 2. Top Info Grid */}
                    <div className="border-t border-b border-gray-300 py-4 mb-8">
                        <div className="grid grid-cols-3 gap-y-4 gap-x-4 text-xs">
                            <div>
                                <div className="text-gray-500 font-semibold mb-1">Agency Reference:</div>
                                <div className="font-bold text-gray-900">{agencyRef}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 font-semibold mb-1">Check-in Reference:</div>
                                <div className="font-bold text-gray-900">{pnr}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 font-semibold mb-1">Travel Agency:</div>
                                <div className="font-bold text-gray-900 uppercase">HIFI TRAVELS PTY LTD</div>
                            </div>
                            <div>
                                <div className="text-gray-500 font-semibold mb-1">Passengers:</div>
                                <div className="font-bold text-gray-900 uppercase">MR JOHN DOE</div>
                            </div>
                            <div>
                                <div className="text-gray-500 font-semibold mb-1">Loyalty Program:</div>
                                <div className="font-bold text-gray-900">-</div>
                            </div>
                            <div>
                                <div className="text-gray-500 font-semibold mb-1">Electronic Ticket nbr:</div>
                                <div className="font-bold text-gray-900">{ticketNumber}</div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Flight Header */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            Flight: {firstSegment.departure.iataCode} to {lastSegment.arrival.iataCode} <span className="text-gray-500 font-normal">({offer.validatingAirlineCodes[0]} {firstSegment.number})</span>
                        </h2>
                    </div>

                    {/* 4. Flight Details Grid */}
                    <div className="mb-8">
                        <div className="grid grid-cols-4 gap-y-4 text-xs leading-relaxed">
                            <div className="col-span-1 text-gray-500 font-semibold">Date:</div>
                            <div className="col-span-1 font-bold">{deptDate.toLocaleDateString('en-GB', { day: 'numeric', month: '2-digit', year: 'numeric' })} ({deptDate.toLocaleDateString('en-GB', { weekday: 'short' })})</div>
                            <div className="col-span-1 text-gray-500 font-semibold">Departs:</div>
                            <div className="col-span-1 font-bold">{deptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>

                            <div className="col-span-1 text-gray-500 font-semibold">Airline:</div>
                            <div className="col-span-1 font-bold">{offer.validatingAirlineCodes[0]}</div>
                            <div className="col-span-1 text-gray-500 font-semibold">Arrives:</div>
                            <div className="col-span-1 font-bold">{arrDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>

                            <div className="col-span-1 text-gray-500 font-semibold">Flight:</div>
                            <div className="col-span-1 font-bold">{offer.validatingAirlineCodes[0]} {firstSegment.number}</div>
                            <div className="col-span-1 text-gray-500 font-semibold">Operated by:</div>
                            <div className="col-span-1 font-bold">{offer.validatingAirlineCodes[0]}</div>

                            <div className="col-span-1 text-gray-500 font-semibold">From:</div>
                            <div className="col-span-1 font-bold">{firstSegment.departure.iataCode} ({firstSegment.departure.terminal || 'Main'})</div>
                            <div className="col-span-1 text-gray-500 font-semibold">Duration:</div>
                            <div className="col-span-1 font-bold">{duration}</div>

                            <div className="col-span-1 text-gray-500 font-semibold">To:</div>
                            <div className="col-span-1 font-bold">{lastSegment.arrival.iataCode} ({lastSegment.arrival.terminal || 'Main'})</div>
                            <div className="col-span-1 text-gray-500 font-semibold">Stops:</div>
                            <div className="col-span-1 font-bold">{itinerary.segments.length > 1 ? `${itinerary.segments.length - 1} Stop(s)` : 'non-stop'}</div>

                            <div className="col-span-1 text-gray-500 font-semibold">Status:</div>
                            <div className="col-span-1 font-bold">Confirmed</div>
                            <div className="col-span-1 text-gray-500 font-semibold">Cabin:</div>
                            <div className="col-span-1 font-bold">Economy</div>

                            <div className="col-span-1 text-gray-500 font-semibold">Aircraft:</div>
                            <div className="col-span-1 font-bold">Boeing 737-800</div>
                            <div className="col-span-1 text-gray-500 font-semibold">Booking Class:</div>
                            <div className="col-span-1 font-bold">L</div>
                        </div>
                    </div>

                    {/* 5. Ticket Coupon Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8 pt-6 border-t border-gray-200">
                        <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Ticket / coupon number</div>
                            <div className="text-xs font-bold">{ticketNumber} / 1</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Date of issue</div>
                            <div className="text-xs font-bold">{dateOfIssue}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Passenger</div>
                            <div className="text-xs font-bold uppercase">DOE/JOHN MR</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-semibold mb-1">Issuing Agent</div>
                            <div className="text-xs font-bold">HIFI TRAVELS ONLINE</div>
                        </div>
                    </div>

                    {/* 6. Legal & Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-300 text-[10px] text-gray-500 leading-relaxed text-justify">
                        <p className="font-bold text-gray-800 mb-2">Itinerary Remarks:</p>
                        <ul className="list-disc pl-4 space-y-1 mb-4">
                            <li>Times shown are local times at each airport.</li>
                            <li>Please check in at least 3 hours before departure.</li>
                        </ul>
                        <p className="mb-2 font-bold">Data protection notice:</p>
                        <p>Your personal data will be processed in accordance with the applicable carrier's privacy policy.</p>
                    </div>
                </div>
            </div>

            {/* Print Specific CSS Override */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </main>
    );
}
