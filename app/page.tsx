"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import HeroSlider from "./components/HeroSlider";
import SearchForm from "./components/SearchForm";
import FlightCard, { FlightOffer } from "./components/FlightCard";
import DetailsModal from "./components/DetailsModal";
import SearchingOverlay from "./components/SearchingOverlay";
import { supabase } from "@/src/lib/supabase";
import { searchFlights } from "@/src/lib/flights";
import { FaChevronDown, FaWhatsapp, FaPhoneAlt, FaCheckCircle, FaStar, FaGoogle, FaChevronLeft, FaChevronRight, FaDollarSign, FaThumbsUp, FaMedal, FaArrowLeft, FaPlane, FaSearch } from "react-icons/fa";

export default function Home() {
    const [results, setResults] = useState<any | null>(null);
    const [dictionaries, setDictionaries] = useState<any>(null);
    const [selectedFlight, setSelectedFlight] = useState<{ offer: FlightOffer, tab: 'details' | 'seats' | 'meals' } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorToast, setErrorToast] = useState<string | null>(null);
    const [resultType, setResultType] = useState<'flight' | 'hotel'>('flight');
    const [user, setUser] = useState<any>(null);
    const [pricingAdjustment, setPricingAdjustment] = useState(130); // Default to 130% if not set
    const [sortBy, setSortBy] = useState<'recommendation' | 'price' | 'duration'>('recommendation');
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
    const [maxStops, setMaxStops] = useState<number | null>(null);
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [refundableOnly, setRefundableOnly] = useState(false);
    const [baggageOnly, setBaggageOnly] = useState(false);
    const [maxPrice, setMaxPrice] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [searchParams, setSearchParams] = useState<any>(null); // Store current search params for slider use
    const searchCache = useRef<Record<string, any>>({});

    // Fetch user and offers
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch pricing settings
    useEffect(() => {
        const fetchPricing = async () => {
            const { data } = await supabase
                .from('pricing_settings')
                .select('markup_value')
                .single();
            if (data) {
                console.log("💰 [PRICING] Syncing Markup:", data.markup_value + "%");
                setPricingAdjustment(data.markup_value);
            }
        };

        // 1. Initial Fetch
        fetchPricing();

        // 2. Realtime Subscription (Best for Speed)
        const channel = supabase
            .channel('pricing_changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pricing_settings' },
                (payload) => {
                    console.log("💰 [PRICING] Instant Update Received:", payload.new.markup_value + "%");
                    setPricingAdjustment(payload.new.markup_value);
                })
            .subscribe();

        // 3. Polling Fallback (Every 10 seconds - Just in case Realtime fails)
        const pollInterval = setInterval(fetchPricing, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, []);

    const handleSearchStart = () => {
        setLoading(true);
        setResults(null);
        setErrorToast(null);
    };

    const handleBack = () => {
        setResults(null);
        setLoading(false);
    };

    const handleResults = (data: any, type: 'flight' | 'hotel', params?: any) => {
        const flights = data?.data || [];
        setResults(flights);
        if (type === 'flight') setDictionaries(data?.dictionaries);
        setResultType(type);
        setLoading(false);
        setIsRefreshing(false);
        if (params) setSearchParams(params);

        // Auto-set max price based on new results (including markup)
        if (flights.length > 0) {
            const high = Math.max(...flights.map((r: any) => parseFloat(r.price.total)));
            const adjustedHigh = high * (1 + (pricingAdjustment / 100));
            setMaxPrice(Math.ceil(adjustedHigh));
        }
    };

    const handleError = (msg: string) => {
        console.error("❌ Search Error:", msg);
        setLoading(false);
        setIsRefreshing(false);
        setErrorToast(msg);
        alert("Search Error: " + msg);
    };

    const handleDateChange = async (newDate: string) => {
        if (!searchParams) return;
        setIsRefreshing(true);
        const updatedParams = { ...searchParams, departureDate: newDate };
        setSearchParams(updatedParams);

        try {
            const data = await searchFlights(updatedParams);
            handleResults(data, 'flight', updatedParams);
        } catch (err: any) {
            handleError(err.message || "Date update failed");
        } finally {
            setIsRefreshing(false);
        }
    };

    const router = useRouter();

    const handleBookingClick = async (offer: FlightOffer, tab: 'details' | 'seats' | 'meals' = 'details') => {
        setSelectedFlight({ offer, tab });

        // Save to localStorage for the payment page to consume
        localStorage.setItem("selectedFlight", JSON.stringify({ offer, tab }));

        // Navigate to payment page
        router.push("/payment");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('bookings').insert({
                user_id: user?.id || null,
                flight_details: {
                    id: offer.id,
                    airline: dictionaries?.carriers?.[offer.itineraries[0].segments[0].carrierCode] || offer.itineraries[0].segments[0].carrierCode,
                    origin: offer.itineraries[0].segments[0].departure.iataCode,
                    destination: offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode,
                    price: offer.price.total,
                    currency: offer.price.currency
                },
                status: 'Pending'
            });
        } catch (err) {
            console.error("Booking log failed", err);
        }
    };

    // --- Memoized Filter Logic for "Instant" Filter Experience ---
    const filteredResults = useMemo(() => {
        if (!results) return [];
        let fr = [...results];

        // 1. Filter by Airlines
        if (selectedAirlines.length > 0) {
            fr = fr.filter(item => selectedAirlines.includes(item.itineraries[0].segments[0].carrierCode));
        }

        // 2. Filter by Stops
        if (maxStops !== null) {
            fr = fr.filter(item => (item.itineraries[0].segments.length - 1) <= maxStops);
        }

        // 3. Filter by Time Slots
        if (timeSlots.length > 0) {
            fr = fr.filter(item => {
                const hour = new Date(item.itineraries[0].segments[0].departure.at).getHours();
                if (timeSlots.includes('morning') && hour >= 6 && hour < 12) return true;
                if (timeSlots.includes('afternoon') && hour >= 12 && hour < 18) return true;
                if (timeSlots.includes('evening') && hour >= 18 && hour < 24) return true;
                if (timeSlots.includes('night') && (hour >= 0 && hour < 6)) return true;
                return false;
            });
        }

        // 4. Filter by Baggage
        if (baggageOnly) {
            fr = fr.filter(item => {
                const baggage = item.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags;
                return baggage && (baggage.quantity > 0 || baggage.weight > 0);
            });
        }

        // 5. Filter by Max Price
        if (maxPrice !== null) {
            fr = fr.filter(item => {
                const adjusted = parseFloat(item.price.total) * (1 + (pricingAdjustment / 100));
                return adjusted <= maxPrice;
            });
        }

        // 6. Sort
        if (sortBy === 'price') {
            fr.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
        } else if (sortBy === 'duration') {
            fr.sort((a, b) => {
                const getDur = (iso: string) => {
                    const matches = iso.match(/PT(\d+H)?(\d+M)?/);
                    const h = parseInt(matches?.[1]?.replace('H', '') || '0');
                    const m = parseInt(matches?.[2]?.replace('M', '') || '0');
                    return h * 60 + m;
                };
                return getDur(a.itineraries[0].duration) - getDur(b.itineraries[0].duration);
            });
        }

        return fr;
    }, [results, selectedAirlines, maxStops, timeSlots, baggageOnly, maxPrice, sortBy, pricingAdjustment]);

    // Results View
    if (loading) return <SearchingOverlay />;

    if (results) {
        return (
            <main className="min-h-screen bg-[#F8FAFC] font-sans">
                <Header />

                {/* Summary Header - Sticky & Premium */}
                <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-[#071C4B] hover:bg-gray-50 transition-all shadow-sm"
                            >
                                <FaArrowLeft size={14} />
                            </button>
                            <div className="hidden sm:block h-10 w-px bg-gray-100"></div>
                            {results && results.length > 0 ? (
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-black text-[#071C4B] uppercase tracking-tighter">
                                            {results[0].itineraries[0].segments[0].departure.iataCode}
                                        </span>
                                        <FaPlane className="text-gray-300 text-xs rotate-90" />
                                        <span className="text-lg font-black text-[#071C4B] uppercase tracking-tighter">
                                            {results[0].itineraries[0].segments[results[0].itineraries[0].segments.length - 1].arrival.iataCode}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">
                                        {results[0].itineraries?.length > 1 ? 'Round Trip' : 'One Way'} • {results[0].travelerPricings?.length || 1} Adult
                                    </div>
                                </div>
                            ) : (
                                <span className="font-black text-[#071C4B] uppercase tracking-widest">Searching...</span>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex flex-col text-right cursor-pointer group" onClick={() => window.location.reload()}>
                                <span className="text-[9px] font-black text-gray-400 uppercase group-hover:text-blue-600">Current Markup: {pricingAdjustment}%</span>
                                <span className="text-[11px] font-black text-green-600 uppercase flex items-center gap-1">
                                    Live Pricing Enabled <span className="animate-pulse">●</span>
                                </span>
                            </div>
                            <button
                                onClick={handleBack}
                                className="bg-[#071C4B] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-black transition-all"
                            >
                                Change Search
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* LEFT: Sidebar Filters */}
                        <aside className="hidden lg:block w-72 shrink-0 space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-[11px] font-black text-[#071C4B] uppercase tracking-[0.2em]">Refine Search</h2>
                                    <button
                                        onClick={() => {
                                            setSelectedAirlines([]);
                                            setMaxStops(null);
                                            setTimeSlots([]);
                                            setRefundableOnly(false);
                                            setBaggageOnly(false);
                                            setMaxPrice(null);
                                        }}
                                        className="text-[9px] font-black text-blue-600 hover:underline uppercase"
                                    >
                                        Reset
                                    </button>
                                </div>

                                <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar">
                                    {/* Stops */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Stops</h4>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Direct Only', value: 0 },
                                                { label: '1 Stop or less', value: 1 },
                                                { label: 'Any Stops', value: null },
                                            ].map((stop) => (
                                                <label key={stop.label} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100/50">
                                                    <input
                                                        type="radio"
                                                        name="stops-side"
                                                        checked={maxStops === stop.value}
                                                        onChange={() => setMaxStops(stop.value)}
                                                        className="w-4 h-4 accent-[#071C4B]"
                                                    />
                                                    <span className={`text-[11px] font-bold ${maxStops === stop.value ? 'text-[#071C4B]' : 'text-gray-500'}`}>
                                                        {stop.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Budget</h4>
                                            <span className="text-[10px] font-black text-[#071C4B] bg-blue-50 px-2 py-0.5 rounded">
                                                ₹{(maxPrice || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={maxPrice ? Math.max(maxPrice, 500000) : 500000}
                                            step="5000"
                                            value={maxPrice || 500000}
                                            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#071C4B]"
                                        />
                                    </div>

                                    {/* Time Slots */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Departure Time</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'morning', label: 'Morning', icon: '🌅' },
                                                { id: 'afternoon', label: 'Afternoon', icon: '☀️' },
                                                { id: 'evening', label: 'Evening', icon: '🌆' },
                                                { id: 'night', label: 'Night', icon: '🌙' },
                                            ].map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setTimeSlots(prev => prev.includes(slot.id) ? prev.filter(s => s !== slot.id) : [...prev, slot.id])}
                                                    className={`py-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${timeSlots.includes(slot.id) ? 'bg-[#071C4B] text-white border-[#071C4B] shadow-md shadow-blue-900/20' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className="text-sm">{slot.icon}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">{slot.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Airlines */}
                                    {dictionaries?.carriers && (
                                        <div className="space-y-4 pt-4 border-t border-gray-50">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferred Airlines</h4>
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                                                {Object.entries(dictionaries.carriers).map(([code, name]: any) => (
                                                    <label key={code} className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-gray-50 transition-all">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAirlines.includes(code)}
                                                            onChange={() => setSelectedAirlines(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])}
                                                            className="w-3.5 h-3.5 accent-[#071C4B]"
                                                        />
                                                        <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700 truncate">{name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* RIGHT: Results & Sorting */}
                        <div className="flex-1 space-y-6">
                            {/* Date Selector Slider - Premium Lufthansa Style */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2 overflow-hidden flex items-center">
                                <div className="flex-1 flex gap-2">
                                    {(() => {
                                        const baseDate = searchParams?.departureDate ? new Date(searchParams.departureDate) : new Date();
                                        return Array.from({ length: 7 }).map((_, i) => {
                                            const date = new Date(baseDate);
                                            date.setDate(baseDate.getDate() + (i - 3));
                                            const ds = date.toISOString().split('T')[0];
                                            const isSelected = ds === (searchParams?.departureDate);

                                            // Mock/Estimate price if possible
                                            const baseP = results?.length > 0 ? Math.min(...results.map((r: any) => parseFloat(r.price.total))) : 50000;
                                            const estP = Math.round(baseP * (1 + (pricingAdjustment / 100)) * (1 + (Math.random() * 0.1 - 0.05)));

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleDateChange(ds)}
                                                    className={`flex-1 py-4 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${isSelected ? 'bg-[#071C4B] text-white shadow-xl shadow-blue-900/20 scale-[1.05] z-10' : 'hover:bg-gray-50 text-gray-500'
                                                        }`}
                                                >
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter mb-1 ${isSelected ? 'opacity-60' : 'text-gray-400'}`}>
                                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                    </span>
                                                    <span className="text-lg font-black leading-none mb-1">{date.getDate()}</span>
                                                    <span className={`text-[8px] font-bold ${isSelected ? 'text-white/80' : 'text-green-600'}`}>
                                                        ₹{(estP / 1000).toFixed(1)}k
                                                    </span>
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>

                            {/* Sort Actions */}
                            <div className="flex items-center justify-between pb-2">
                                <h1 className="text-lg font-black text-[#071C4B] uppercase tracking-widest flex items-center gap-3">
                                    Departure Flights
                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black border border-blue-100">
                                        {filteredResults.length} / {results?.length || 0} Found
                                    </span>
                                </h1>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSortBy('price')}
                                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${sortBy === 'price' ? 'bg-[#071C4B] text-white border-[#071C4B]' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                                            }`}
                                    >
                                        Cheapest
                                    </button>
                                    <button
                                        onClick={() => setSortBy('duration')}
                                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${sortBy === 'duration' ? 'bg-[#071C4B] text-white border-[#071C4B]' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                                            }`}
                                    >
                                        Fastest
                                    </button>
                                </div>
                            </div>

                            {/* Main List Container */}
                            <div className="relative min-h-[400px]">
                                {isRefreshing && (
                                    <div className="absolute top-0 left-0 right-0 z-50 h-1.5 overflow-hidden rounded-t-[2rem]">
                                        <div className="h-full bg-gradient-to-r from-red-600 via-blue-900 to-red-600 w-full animate-loading-bar shadow-[0_0_10px_rgba(196,30,34,0.5)]"></div>
                                    </div>
                                )}
                                {isRefreshing && (
                                    <div className="absolute inset-0 z-30 bg-white/20 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center animate-in fade-in duration-300">
                                        <div className="bg-white/90 px-6 py-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-4">
                                            <div className="w-5 h-5 border-2 border-blue-900/10 border-t-red-600 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black text-[#071C4B] uppercase tracking-widest">Live Pricing...</span>
                                        </div>
                                    </div>
                                )}

                                <div className={`space-y-6 transition-all duration-500 ${isRefreshing ? 'opacity-30 blur-sm pointer-events-none' : 'opacity-100'}`}>
                                    {filteredResults.length === 0 ? (
                                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2rem] p-20 flex flex-col items-center text-center">
                                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-30">✈️</div>
                                            <h3 className="text-xl font-black text-[#071C4B] uppercase tracking-widest">No Flights Found</h3>
                                            <p className="text-sm text-gray-400 font-medium max-w-xs mt-2">We couldn't find any flights matching your current filters. Try resetting them.</p>
                                            <button
                                                onClick={() => {
                                                    setSelectedAirlines([]);
                                                    setMaxStops(null);
                                                    setTimeSlots([]);
                                                    setMaxPrice(null);
                                                }}
                                                className="mt-8 px-8 py-3 bg-[#071C4B] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/10"
                                            >
                                                Clear All Filters
                                            </button>
                                        </div>
                                    ) : (
                                        filteredResults.map((item: any, index: number) => {
                                            const originalPrice = parseFloat(item.price.total);
                                            const adjustedPrice = originalPrice * (1 + (pricingAdjustment / 100));

                                            const adjustedOffer = {
                                                ...item,
                                                price: {
                                                    ...item.price,
                                                    total: adjustedPrice.toString()
                                                }
                                            };

                                            return (
                                                <FlightCard
                                                    key={index}
                                                    offer={{
                                                        ...adjustedOffer,
                                                        basePrice: originalPrice,
                                                        adjustment: pricingAdjustment
                                                    } as any}
                                                    dictionaries={dictionaries}
                                                    onViewDetails={handleBookingClick}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 relative font-sans">
            <Header />

            {/* Hero */}
            <section className="relative z-50">
                <HeroSlider />
                <div className="absolute bottom-0 left-0 w-full z-[100] translate-y-1/2 px-4">
                    <div className="max-w-7xl mx-auto">
                        <SearchForm
                            onResults={handleResults}
                            onSearchStart={handleSearchStart}
                            onError={handleError}
                            autoSearchDate={searchParams?.departureDate}
                        />
                    </div>
                </div>
            </section>

            {/* Info Section */}
            <section className="bg-[#f7f7f7] py-16 md:py-20 mt-40 md:mt-48">
                <div className="max-w-6xl mx-auto px-4 md:px-0 space-y-12">
                    <h2 className="text-4xl md:text-5xl font-handwriting text-[#111827] text-center mb-8">
                        Fly Safe with HiFi Travels Hassle-free
                    </h2>
                    {/* Row 1: Image LEFT, Text RIGHT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        <div className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-3">
                            <img src="/10.jpg" alt="Friendly travel assistance" className="w-full h-64 md:h-72 object-cover" />
                        </div>
                        <div className="text-left text-gray-700 text-sm md:text-base leading-relaxed">
                            <p className="mb-3">
                                Booking a trip should be exciting, and not overwhelming. Whether you are
                                planning a holiday, work trip, or quick getaway, we know you want a hassle-free
                                experience. Welcome to HiFi Travels, your only flight booking destination that
                                makes the process simple and stress-free.
                            </p>
                            <p className="mb-3">
                                Our experienced travel booking experts help you secure the right flights at the
                                best prices without the usual confusion or hidden costs.
                            </p>
                            <p className="mb-3">
                                Need a quote? Just reach out to us without any pressure and obligation. We’ll
                                understand your requirements and guide you through the best options as per your
                                demand. You focus on the destination and leave the rest to us.
                            </p>
                            <p>
                                Want us to ask you a few questions before you proceed? Our agents are just one
                                step away.
                            </p>
                        </div>
                    </div>

                    {/* Row 2: Text LEFT, Image RIGHT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="text-left">
                            <h3 className="text-xl md:text-2xl font-semibold text-[#111827] mb-4">
                                Why We are the Best Flight Booking Service Providers?
                            </h3>
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                                At HiFi Travels, we believe in offering best-in-class services that give you
                                peace of mind and do not burden you. Though our pricing is best in the market,
                                if you find a good quote elsewhere, send us the details, we’ll match it and give
                                you even more value on your next booking.
                            </p>
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                All we need is a copy of your fare details including base fare info, and we’ll
                                take care of the rest. We don’t just promise value but we also deliver it.
                            </p>
                        </div>
                        <div className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] p-3">
                            <img src="/8.jpg" alt="Best flight service" className="w-full h-64 md:h-72 object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Have Questions Section (CTA) */}
            <section
                className="py-10 md:py-14 bg-gradient-to-r from-[#0044a7] via-[#5b3cae] to-[#e03737] relative overflow-hidden"
                style={{
                    backgroundImage: `
                        radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
                        radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
                        linear-gradient(to right, #0044a7, #5b3cae, #e03737)
                    `,
                    backgroundSize: '550px 550px, 350px 350px, cover',
                    backgroundPosition: '0 0, 40px 60px, center'
                }}
            >
                <div className="max-w-5xl mx-auto px-4 md:px-0 flex flex-col md:flex-row items-center justify-between gap-6 text-white relative z-10">
                    <div className="text-left">
                        <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2 tracking-wide">
                            Have Questions?
                        </h3>
                        <p className="text-sm md:text-base text-white/90 max-w-xl font-light leading-relaxed">
                            Drop us a message anytime and our team will help you figure out the best route,
                            fare, or destination that suits your budget and plans.
                        </p>
                    </div>
                    <a
                        href="#contact"
                        className="inline-flex items-center justify-center px-8 md:px-10 py-3 md:py-3.5 rounded bg-[#0056b3] hover:bg-[#004494] text-white text-sm md:text-base font-bold shadow-lg transition-all hover:scale-105 whitespace-nowrap"
                    >
                        Get In Touch Now!
                    </a>
                </div>
            </section>

            {/* Top Recommended Destinations */}
            <section className="bg-white py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-4 md:px-0">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
                        Top Recommended Destinations
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { city: "London, United States", price: "From $339 r/t", image: "/1.jpg" },
                            { city: "Paris, France", price: "From $477 r/t", image: "/2.jpg" },
                            { city: "Rome, Italy", price: "From $479 r/t", image: "/3.jpg" },
                            { city: "Frankfurt, Germany", price: "From $545 r/t", image: "/4.jpg" },
                            { city: "London, United States", price: "From $339 r/t", image: "/1.jpg" },
                            { city: "Paris, France", price: "From $477 r/t", image: "/2.jpg" },
                            { city: "Rome, Italy", price: "From $479 r/t", image: "/3.jpg" },
                            { city: "Frankfurt, Germany", price: "From $545 r/t", image: "/4.jpg" },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="relative group overflow-hidden rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.2)] cursor-pointer"
                            >
                                <img
                                    src={item.image}
                                    alt={item.city}
                                    className="w-full h-72 md:h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors duration-300 flex flex-col items-center justify-center text-white text-center px-3">
                                    <span className="text-sm md:text-base font-semibold mb-1">
                                        {item.city}
                                    </span>
                                    <span className="text-xs md:text-sm opacity-90">
                                        {item.price}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials - What Our Customers Say */}
            <section className="bg-white py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-4 md:px-0">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
                        What Our Customers Say
                    </h2>

                    <div className="flex flex-col md:flex-row gap-10 items-center">
                        {/* Left rating block */}
                        <div className="w-full md:w-1/4 text-center md:text-left space-y-2 md:pl-6">
                            <div className="text-sm uppercase tracking-wide text-gray-700">
                                EXCELLENT
                            </div>
                            <div className="flex justify-center md:justify-start gap-1 text-[#fbbf24] text-xl">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <FaStar key={i} />
                                ))}
                            </div>
                            <div className="text-xs text-gray-600">
                                Based on 409 reviews
                            </div>
                            <div className="mt-2 flex justify-center md:justify-start items-center gap-2 text-[#4285F4]">
                                <FaGoogle className="text-2xl" />
                                <span className="text-lg font-semibold">Google</span>
                            </div>
                        </div>

                        {/* Right testimonials slider mock */}
                        <div className="w-full md:w-3/4 relative">
                            <button className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md items-center justify-center text-gray-500 hover:bg-gray-50">
                                <FaChevronLeft size={14} />
                            </button>
                            <button className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md items-center justify-center text-gray-500 hover:bg-gray-50">
                                <FaChevronRight size={14} />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    {
                                        name: "Atif",
                                        time: "2 weeks ago",
                                        text: "Paid $200 deposit on 19 November for a flight booking. No booking was provided. Refund was refused and voucher offered instead...",
                                    },
                                    {
                                        name: "Manpreet Sandhu",
                                        time: "2 weeks ago",
                                        text: "I had a great experience with HiFi Travel. I would especially like to mention Sandy—she helped me get the right-priced ticket and was very...",
                                    },
                                    {
                                        name: "Lovepreet",
                                        time: "2 weeks ago",
                                        text: "I would like to share my excellent experience with Nisha. She provided outstanding support with my ticket booking and guided me at every step...",
                                    },
                                ].map((t, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-semibold">
                                                    {t.name.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                                                    <div className="text-[11px] text-gray-500">{t.time}</div>
                                                </div>
                                            </div>
                                            <FaGoogle className="text-[#4285F4]" />
                                        </div>

                                        <div className="flex gap-1 text-[#fbbf24] text-xs">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <FaStar key={i} />
                                            ))}
                                        </div>

                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {t.text}
                                        </p>
                                        <button className="text-[11px] font-semibold text-[#0b4ba8] hover:underline">
                                            Read more
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Airlines Partners */}
            <section className="bg-white py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-4 md:px-0 text-center">
                    <h2 className="text-2xl md:text-3xl font-semibold mb-10">
                        Our Airlines Partners
                    </h2>

                    {/* Airline logos row */}
                    <div className="flex items-center justify-center gap-8 md:gap-12 mb-10">
                        <button className="hidden md:flex w-8 h-8 rounded-full border border-gray-200 items-center justify-center text-gray-500 hover:bg-gray-50">
                            <FaChevronLeft size={14} />
                        </button>

                        <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center">
                            <span className="text-lg font-semibold text-gray-700">QANTAS</span>
                            <span className="text-lg font-semibold text-purple-700">THAI</span>
                            <span className="text-lg font-semibold text-gray-700">Air Canada</span>
                            <span className="text-lg font-semibold text-red-700">Air China</span>
                            <span className="text-lg font-semibold text-red-600">Hong Kong Airlines</span>
                            <span className="text-lg font-semibold text-green-700">Cathay Pacific</span>
                        </div>

                        <button className="hidden md:flex w-8 h-8 rounded-full border border-gray-200 items-center justify-center text-gray-500 hover:bg-gray-50">
                            <FaChevronRight size={14} />
                        </button>
                    </div>

                    {/* Feature row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-6 text-left md:text-center text-gray-700 text-sm md:text-base">
                        <div className="flex flex-col items-start md:items-center gap-3">
                            <div className="text-[#0b4ba8] text-3xl">
                                <FaDollarSign />
                            </div>
                            <h3 className="font-semibold text-[#111827]">
                                Guaranteed Affordable Pricing
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We believe everyone deserves to travel without breaking the bank. Our flexible fare options
                                fit your budget, whether you&apos;re planning months in advance or booking last minute.
                            </p>
                        </div>

                        <div className="flex flex-col items-start md:items-center gap-3">
                            <div className="text-[#0b4ba8] text-3xl">
                                <FaThumbsUp />
                            </div>
                            <h3 className="font-semibold text-[#111827]">
                                Safe &amp; Secure Booking
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Your safety and privacy matter. We never share your information with third parties, and your
                                travel details are handled with the utmost confidentiality.
                            </p>
                        </div>

                        <div className="flex flex-col items-start md:items-center gap-3">
                            <div className="text-[#0b4ba8] text-3xl">
                                <FaMedal />
                            </div>
                            <h3 className="font-semibold text-[#111827]">
                                Reliable Support (9 AM to 10 PM AEST)
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Travel questions can come up anytime. Our dedicated experts are available daily between
                                9 AM and 10 PM AEST to assist you.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="bg-[#f7f7f7] py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-4 md:px-0">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
                        Popular Destinations
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
                        {[
                            "Adelaide",
                            "Brisbane",
                            "Cairns",
                            "Canberra",
                            "Darwin",
                            "Gold Coast",
                            "Hobart",
                            "Melbourne",
                            "Perth",
                            "Sydney",
                            "India",
                            "Pakistan",
                            "Sri Lanka",
                            "Nepal",
                            "Bangladesh",
                        ].map((city, idx) => (
                            <div key={city + idx} className="bg-white rounded-md shadow-[0_6px_18px_rgba(0,0,0,0.12)] overflow-hidden">
                                <div className="h-28 md:h-32 bg-gray-200">
                                    <img
                                        src={`/dest-${(idx % 5) + 1}.jpg`}
                                        alt={city}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>
                                <div className="bg-[#0b72e7] text-white text-center py-2 text-xs md:text-sm font-semibold">
                                    {city}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer - Flight routes grid (dark blue) */}
            <section className="bg-[#00308F] text-white py-12 md:py-16">
                <div className="max-w-6xl mx-auto px-4 md:px-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-xs md:text-sm leading-relaxed">
                    {[
                        {
                            title: "Australia Flight Tickets",
                            items: [
                                "Flights from Sydney",
                                "Flights from Melbourne",
                                "Flights from Brisbane",
                                "Flights from Perth",
                                "Flights from Adelaide",
                            ],
                        },
                        {
                            title: "India Flight Tickets",
                            items: [
                                "Flights to Delhi",
                                "Flights to Mumbai",
                                "Flights to Amritsar",
                                "Flights to Hyderabad",
                                "Flights to Ahmedabad",
                            ],
                        },
                        {
                            title: "Sri Lanka Flight Tickets",
                            items: [
                                "Flights to Colombo",
                                "Flights to Jaffna",
                                "Flights from Sydney",
                                "Flights from Melbourne",
                                "Flights from Perth",
                            ],
                        },
                        {
                            title: "Nepal Flight Tickets",
                            items: [
                                "Flights to Kathmandu",
                                "Flights from Sydney",
                                "Flights from Melbourne",
                                "Flights from Brisbane",
                                "Flights from Adelaide",
                            ],
                        },
                        {
                            title: "Bangladesh Flight Tickets",
                            items: [
                                "Flights to Dhaka",
                                "Flights from Sydney",
                                "Flights from Melbourne",
                                "Flights from Perth",
                                "Flights from Brisbane",
                            ],
                        },
                    ].map((col) => (
                        <div key={col.title}>
                            <h4 className="font-semibold mb-2">{col.title}</h4>
                            <ul className="space-y-1 text-white/80">
                                {col.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Footer Info (lighter blue) */}
            <footer className="bg-[#0b4ba8] text-white py-12 md:py-14">
                <div className="max-w-6xl mx-auto px-4 md:px-0 grid grid-cols-1 md:grid-cols-[2fr,1fr,1.3fr] gap-10 text-sm">
                    {/* Logo & description */}
                    <div>
                        <div className="text-2xl font-bold mb-3">
                            HiFi <span className="font-normal">Travels</span>
                        </div>
                        <p className="text-white/80 leading-relaxed text-xs md:text-sm">
                            For years, HiFi Travels has been renowned for offering exceptional flight deals,
                            flexible fare options and transparent pricing. With expert travel consultants and
                            personalised service, we&apos;ve earned the trust of thousands of travellers.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-3 text-sm md:text-base">Quick Links</h4>
                        <ul className="space-y-1 text-white/80 text-xs md:text-sm">
                            <li>Home</li>
                            <li>Deals &amp; Promotions</li>
                            <li>Travel Insurance</li>
                            <li>Contact Us</li>
                        </ul>
                    </div>

                    {/* Get in Touch */}
                    <div>
                        <h4 className="font-semibold mb-3 text-sm md:text-base">Get In Touch</h4>
                        <p className="text-white/80 text-xs md:text-sm mb-2">
                            LEVEL 10, 3 PARRAMATTA SQ<br />
                            PARRAMATTA, NSW 2150
                        </p>
                        <p className="text-white/80  text-xs md:text-sm mb-1">
                            TEL: +61 2 9067 0888
                        </p>
                        <p className="text-white/80 text-xs md:text-sm">
                            Email: info@hifitravels.com.au
                        </p>
                    </div>
                </div>

                <div className="mt-8 border-t border-white/20 pt-4 text-center text-[11px] text-white/80">
                    FAQ&apos;s | Privacy Policy | Terms &amp; Conditions
                </div>
            </footer>

            {/* Global Sticky WhatsApp / Call Now bar (fixed at bottom) */}
            <div className="sticky bottom-0 z-[1000]">
                <div className="w-full flex h-10 md:h-12">
                    <div className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center relative cursor-pointer group transition-colors">
                        <div className="absolute left-8 hidden md:flex items-center justify-center w-8 h-8 bg-[#0056b3] rounded-full border-2 border-white shadow-lg">
                            <FaCheckCircle className="text-white text-sm" />
                        </div>
                        <a href="https://wa.me/61412345678" className="flex items-center gap-2 font-bold text-lg md:text-xl uppercase tracking-widest">
                            <FaWhatsapp size={20} />
                            WhatsApp
                        </a>
                    </div>
                    <a
                        href="tel:+61730678999"
                        className="flex-1 bg-[#C41E22] hover:bg-[#a0181b] text-white flex items-center justify-center gap-2 font-bold text-lg md:text-xl uppercase tracking-widest transition-colors cursor-pointer"
                    >
                        <FaPhoneAlt size={18} />
                        Call Now
                    </a>
                </div>
            </div>

            {selectedFlight && (
                <DetailsModal
                    flight={selectedFlight.offer}
                    initialTab={selectedFlight.tab}
                    onClose={() => setSelectedFlight(null)}
                />
            )}
        </main>
    );
}
