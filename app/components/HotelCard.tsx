import { FaMapMarkerAlt, FaStar, FaBed, FaWifi, FaSwimmingPool } from "react-icons/fa";
import { HotelOffer } from "@/src/lib/hotels";

interface HotelCardProps {
    offer: HotelOffer;
}

export default function HotelCard({ offer }: HotelCardProps) {
    const price = offer.offers?.[0]?.price;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-0 overflow-hidden flex flex-col md:flex-row h-full md:h-56 group">

            {/* Image Placeholder - Dynamic gradient as fallback */}
            <div className="w-full md:w-72 bg-gradient-to-br from-gray-100 to-gray-200 relative shrink-0 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-500">
                    <span className="text-6xl">🏨</span>
                </div>
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-md text-xs font-bold text-gray-800 shadow-sm uppercase tracking-wide">
                    {offer.type}
                </div>
            </div>

            <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {offer.hotel.name}
                            </h3>
                            <div className="flex items-center text-gray-500 text-sm mt-1 mb-3">
                                <FaMapMarkerAlt className="mr-1 text-red-500" />
                                <span>{offer.hotel.cityCode} City Center</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex text-yellow-400 text-sm mb-1">
                                {[...Array(4)].map((_, i) => <FaStar key={i} />)}
                            </div>
                            <span className="text-xs text-gray-400">4.0/5 Reviews</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            <FaBed size={12} /> {offer.offers?.[0]?.room?.typeEstimated?.category || "Standard Room"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                            <FaWifi size={12} /> Free Wifi
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                            <FaSwimmingPool size={12} /> Pool
                        </span>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-4 md:mt-0 pt-4 border-t md:border-t-0 border-gray-100">
                    <div className="text-gray-500 text-xs hidden md:block">
                        {offer.offers?.[0]?.room?.description?.text ? (
                            <p className="line-clamp-2 max-w-[240px] leading-relaxed opacity-80">{offer.offers[0].room.description.text}</p>
                        ) : (
                            <p className="text-gray-400 italic">No room description available.</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <div className="text-xs text-gray-400">Per Night</div>
                            {price ? (
                                <div className="text-2xl font-extrabold text-blue-600">
                                    {price.currency} {price.total}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 font-semibold">Contact Hotel</div>
                            )}
                        </div>

                        <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md active:translate-y-0.5">
                            View Offers
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
