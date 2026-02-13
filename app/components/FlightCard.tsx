import { FaClock, FaChevronDown } from "react-icons/fa";

interface FlightSegment {
    departure: {
        iataCode: string;
        at: string;
        terminal?: string;
    };
    arrival: {
        iataCode: string;
        at: string;
        terminal?: string;
    };
    carrierCode: string;
    number: string;
    duration: string;
}

interface FlightItinerary {
    duration: string;
    segments: FlightSegment[];
}

interface FlightPrice {
    currency: string;
    total: string;
}

export interface FlightOffer {
    id: string;
    itineraries: FlightItinerary[];
    price: FlightPrice;
    validatingAirlineCodes: string[];
}

interface FlightCardProps {
    offer: FlightOffer;
    dictionaries?: any;
    onViewDetails: (offer: FlightOffer, tab: 'details' | 'seats' | 'meals') => void;
}

export default function FlightCard({ offer, dictionaries, onViewDetails }: FlightCardProps) {
    const itinerary = offer.itineraries[0];
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];

    // Resolve Carrier Name
    const carrierCode = offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode;
    const carrierName = dictionaries?.carriers?.[carrierCode] || `${carrierCode} Airlines`;

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const formatDuration = (isoDuration: string) => {
        return isoDuration.replace("PT", "").toLowerCase().replace("h", "h ").replace("m", "m");
    };

    const basePrice = parseFloat(offer.price.total);

    return (
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row mb-4">
            {/* Left: Flight Details */}
            <div className="flex-[1.5] p-6 flex flex-col justify-between border-r border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    {/* Departure */}
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-[#071C4B]">{formatTime(firstSegment.departure.at)}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">{firstSegment.departure.iataCode}</span>
                        <span className="text-[10px] text-gray-400 mt-1">Terminal {firstSegment.departure.terminal || '1'}</span>
                    </div>

                    {/* Path */}
                    <div className="flex-1 px-8 flex flex-col items-center relative">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-gray-400">{formatDuration(itinerary.duration)}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{firstSegment.carrierCode}</span>
                        </div>
                        <div className="w-full h-px bg-gray-300 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                    </div>

                    {/* Arrival */}
                    <div className="flex flex-col text-right">
                        <span className="text-2xl font-bold text-[#071C4B]">{formatTime(lastSegment.arrival.at)}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">{lastSegment.arrival.iataCode}</span>
                        <span className="text-[10px] text-gray-400 mt-1">Terminal {lastSegment.arrival.terminal || '1'}</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold">
                        <FaClock size={10} />
                        <span>Duration {formatDuration(itinerary.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold">
                        <span>✓</span>
                        <span>Operated by {carrierName}</span>
                    </div>
                    <div
                        onClick={() => onViewDetails(offer, 'details')}
                        className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline mt-2"
                    >
                        + See itinerary details
                    </div>
                </div>
            </div>

            {/* Right: Price & Action */}
            <div className="flex-1 flex flex-col bg-[#F8F9FA] p-6 justify-center items-center border-l border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Price</span>

                {(offer as any).adjustment !== 0 && (offer as any).basePrice && (
                    <div className="flex flex-col items-center mb-1">
                        <span className="text-[9px] text-gray-400 font-bold line-through">
                            {offer.price.currency} {(offer as any).basePrice.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[8px] font-black uppercase ${(offer as any).adjustment < 0 ? 'text-green-600' : 'text-orange-600'}`}>
                            {(offer as any).adjustment > 0 ? '+' : ''}{(offer as any).adjustment}%
                            {/* Show the added amount for clarity */}
                            &nbsp;({offer.price.currency} {(basePrice - (offer as any).basePrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                        </span>
                    </div>
                )}

                <div className="text-2xl font-black text-[#071C4B]">
                    {offer.price.currency} {basePrice.toLocaleString('en-IN')}
                </div>
                <button
                    onClick={() => onViewDetails(offer, 'details')}
                    className="mt-4 w-full bg-[#071C4B] text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition-colors shadow-md text-sm uppercase tracking-widest"
                >
                    Select Flight
                </button>
                <div
                    onClick={() => onViewDetails(offer, 'seats')}
                    className="mt-3 text-[10px] font-bold text-blue-600 cursor-pointer hover:underline uppercase tracking-tighter"
                >
                    + View extras (bags, seats)
                </div>
            </div>
        </div>
    );
}
