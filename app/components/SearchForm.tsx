"use client";

import { useState, useRef, useEffect } from "react";
import { searchFlights, FlightSearchParams } from "@/src/lib/flights";
import { searchHotels, HotelSearchParams } from "@/src/lib/hotels";
import { FaPlane, FaHotel, FaShieldAlt, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { supabase } from "@/src/lib/supabase";

interface SearchFormProps {
    onResults: (data: any, type: 'flight' | 'hotel', params: any) => void;
    onSearchStart: () => void;
    onError: (msg: string) => void;
    autoSearchDate?: string;
}

export default function SearchForm({ onResults, onSearchStart, onError, autoSearchDate }: SearchFormProps) {
    const [activeTab, setActiveTab] = useState<'flight' | 'hotel' | 'insurance'>('flight');
    const [loading, setLoading] = useState(false);
    const [tripType, setTripType] = useState('round');

    // Flight State
    const [flightParams, setFlightParams] = useState<FlightSearchParams & { returnDate: string, children: number, infant: number, cabin: string, name: string, email: string, phone: string }>({
        origin: "DEL",
        destination: "BOM",
        departureDate: "2026-03-20",
        returnDate: "2026-03-25",
        adults: 1,
        children: 0,
        infant: 0,
        cabin: "Economy",
        name: "Arun",
        email: "arun@example.com",
        phone: "1234567890"
    });

    // Custom Date Picker State
    const [showDeparturePicker, setShowDeparturePicker] = useState(false);
    const [showReturnPicker, setShowReturnPicker] = useState(false);
    const departureRef = useRef<HTMLDivElement>(null);
    const returnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (departureRef.current && !departureRef.current.contains(event.target as Node)) setShowDeparturePicker(false);
            if (returnRef.current && !returnRef.current.contains(event.target as Node)) setShowReturnPicker(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Trigger search from external prop (e.g. Date Slider)
    useEffect(() => {
        if (autoSearchDate && autoSearchDate !== flightParams.departureDate) {
            setFlightParams(prev => ({ ...prev, departureDate: autoSearchDate }));
            // We use a small timeout to let state update before triggering submit logic
            setTimeout(() => {
                const btn = document.getElementById('search-submit-btn') as HTMLButtonElement;
                if (btn && !btn.disabled) btn.click();
            }, 100);
        }
    }, [autoSearchDate]);

    const handleFlightChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFlightParams(prev => ({
            ...prev,
            [name]: ["adults", "children", "infant"].includes(name)
                ? parseInt(value) || 0
                : (["origin", "destination"].includes(name) ? value.toUpperCase() : value),
        }));
    };

    const handleDateSelect = (date: string, type: 'departure' | 'return') => {
        setFlightParams(prev => ({
            ...prev,
            [type === 'departure' ? 'departureDate' : 'returnDate']: date
        }));
        if (type === 'departure') setShowDeparturePicker(false);
        else setShowReturnPicker(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onSearchStart();
        setLoading(true);

        try {
            if (activeTab === 'flight') {
                if (!flightParams.origin || !flightParams.destination || !flightParams.departureDate) {
                    throw new Error("Please fill in all required flight fields");
                }
                const data = await searchFlights(flightParams);

                // Real-time Analytics: Log search event
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    await supabase.from('search_logs').insert({
                        user_id: user?.id || null,
                        search_params: {
                            origin: flightParams.origin,
                            destination: flightParams.destination,
                            departureDate: flightParams.departureDate,
                            tripType: tripType,
                            adults: flightParams.adults
                        }
                    });
                } catch (logErr) {
                    console.error("Failed to log search", logErr);
                }

                onResults(data, 'flight', flightParams);
            } else {
                onError("Hotel search is currently being updated.");
                setLoading(false);
            }
        } catch (err: any) {
            onError(err.message || "An error occurred while searching");
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'flight', label: 'FLIGHTS', icon: <FaPlane /> },
        { id: 'hotel', label: 'HOTELS', icon: <FaHotel /> },
        { id: 'insurance', label: 'TRAVEL INSURANCE', icon: <FaShieldAlt /> },
    ];

    // Button enable condition – only core search fields required
    const isFormValid = !!(
        flightParams.origin &&
        flightParams.destination &&
        flightParams.departureDate &&
        (tripType === 'round' ? flightParams.returnDate : true)
    );

    return (
        <div className="w-full max-w-6xl mx-auto font-sans relative">
            {/* Card Container */}
            <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 overflow-hidden rounded-t-2xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 px-8 py-4 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all
                                ${activeTab === tab.id
                                    ? "bg-[#f6405f] text-white"
                                    : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <span className="text-xs">{tab.icon}</span>
                            <span className="uppercase">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-white px-8 md:px-10 pt-6 pb-8 rounded-b-2xl relative">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Trip Type */}
                        <div className="flex items-center gap-8 text-gray-800 text-sm font-semibold">
                            {['round', 'oneway'].map((type) => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${tripType === type ? 'border-[#f6405f]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                        {tripType === type && <div className="w-2 h-2 bg-[#f6405f] rounded-full"></div>}
                                    </div>
                                    <input type="radio" className="hidden" checked={tripType === type} onChange={() => setTripType(type)} />
                                    <span className="uppercase tracking-wide text-xs">{type === 'round' ? 'Round Trip' : 'One Way'}</span>
                                </label>
                            ))}
                        </div>

                        {/* Inputs Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <div className="relative">
                                <InputField
                                    icon={<FaMapMarkerAlt />}
                                    placeholder="FROM:  Origin (e.g. DEL)"
                                    name="origin"
                                    value={flightParams.origin}
                                    onChange={handleFlightChange}
                                    required={!flightParams.origin}
                                />
                            </div>
                            <div className="relative">
                                <InputField
                                    icon={<FaMapMarkerAlt />}
                                    placeholder="TO:  Destination (e.g. BOM)"
                                    name="destination"
                                    value={flightParams.destination}
                                    onChange={handleFlightChange}
                                />
                            </div>

                            {/* Custom Date Inputs */}
                            <div className="relative" ref={departureRef}>
                                <div
                                    onClick={() => setShowDeparturePicker(!showDeparturePicker)}
                                    className="w-full pl-12 pr-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-md text-sm cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <FaCalendarAlt className="text-gray-400" />
                                        <span className="truncate">{flightParams.departureDate || "Departure"}</span>
                                    </div>
                                    <FaChevronDown className="text-gray-300 text-[10px]" />
                                </div>
                                {showDeparturePicker && (
                                    <CalendarOverlay
                                        onSelect={(d) => handleDateSelect(d, 'departure')}
                                        selected={flightParams.departureDate}
                                        onClose={() => setShowDeparturePicker(false)}
                                    />
                                )}
                            </div>

                            <div className="relative" ref={returnRef}>
                                <div
                                    onClick={() => tripType === 'round' && setShowReturnPicker(!showReturnPicker)}
                                    className={`w-full pl-12 pr-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-md text-sm flex items-center justify-between ${tripType === 'oneway' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaCalendarAlt className="text-gray-400" />
                                        <span className="truncate">{flightParams.returnDate || "Return"}</span>
                                    </div>
                                    <FaChevronDown className="text-gray-300 text-[10px]" />
                                </div>
                                {showReturnPicker && (
                                    <CalendarOverlay
                                        onSelect={(d) => handleDateSelect(d, 'return')}
                                        selected={flightParams.returnDate}
                                        minDate={flightParams.departureDate}
                                        onClose={() => setShowReturnPicker(false)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Inputs Row 2: Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <SelectField name="adults" icon={<FaUserFriends />} label="Adult" value={flightParams.adults} onChange={handleFlightChange} options={[1, 2, 3, 4, 5, 6, 7, 8, 9]} />
                            <SelectField name="children" icon={<FaUserFriends />} label="Children" value={flightParams.children} onChange={handleFlightChange} options={[0, 1, 2, 3, 4, 5]} />
                            <SelectField name="infant" icon={<FaUserFriends size={12} />} label="Infants" value={flightParams.infant} onChange={handleFlightChange} options={[0, 1, 2]} />
                            <SelectField name="cabin" icon={<FaPlane />} label="Economy" value={flightParams.cabin} onChange={handleFlightChange} options={['Economy', 'Premium Economy', 'Business', 'First Class']} />
                        </div>

                        {/* Contact Info (hidden in compact UI but kept for logic) */}
                        <div className="hidden">
                            <input name="name" value={flightParams.name} onChange={handleFlightChange} />
                            <input name="email" value={flightParams.email} onChange={handleFlightChange} />
                            <input name="phone" value={flightParams.phone} onChange={handleFlightChange} />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                id="search-submit-btn"
                                type="submit"
                                disabled={loading || !isFormValid}
                                className={`px-10 py-3 rounded-full text-sm font-semibold uppercase tracking-wide shadow-md 
                                    ${loading || !isFormValid
                                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                        : "bg-[#f6405f] hover:bg-[#e33455] text-white"
                                    }`}
                            >
                                {loading ? "Searching..." : "Find a Deal"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function InputField({ icon, placeholder, name, value, onChange, required }: any) {
    return (
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10">{icon}</div>
            <input
                type="text" name={name} placeholder={placeholder} value={value} onChange={onChange}
                className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 shadow-lg outline-none font-bold text-sm uppercase placeholder:text-gray-300 focus:ring-4 focus:ring-black/5"
            />
            {required && <span className="absolute -bottom-5 left-0 text-[9px] text-white/60 font-black uppercase">Required Field</span>}
        </div>
    );
}

function SelectField({ name, icon, label, value, onChange, options }: any) {
    return (
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10">{icon}</div>
            <select
                name={name} value={value} onChange={onChange}
                className="w-full pl-12 pr-10 py-4 bg-white text-gray-900 shadow-lg outline-none font-bold text-sm uppercase appearance-none cursor-pointer focus:ring-4 focus:ring-black/5"
            >
                {options.map((opt: any) => <option key={opt} value={opt}>{opt} {typeof opt === 'number' ? label : ''}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"><FaChevronDown size={10} /></div>
        </div>
    );
}

function CalendarOverlay({ onSelect, selected, minDate, onClose }: { onSelect: (d: string) => void, selected: string, minDate?: string, onClose: () => void }) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDay = (month: number, year: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
    };

    const renderDays = () => {
        const totalDays = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDay(currentMonth, currentYear);
        const dayElements = [];

        for (let i = 0; i < firstDay; i++) {
            dayElements.push(<div key={`blank-${i}`} className="h-12 w-12"></div>);
        }

        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = selected === dateStr;
            const isToday = today.toISOString().split('T')[0] === dateStr;
            const isPast = new Date(dateStr) < new Date(today.setHours(0, 0, 0, 0));
            const isBeforeMin = minDate && new Date(dateStr) < new Date(minDate);

            dayElements.push(
                <div
                    key={d}
                    onClick={(e) => { e.stopPropagation(); if (!isPast && !isBeforeMin) onSelect(dateStr); }}
                    className={`h-12 w-12 flex items-center justify-center text-sm font-extrabold cursor-pointer transition-all duration-200 border-2 rounded-lg m-0.5
                        ${isSelected ? 'bg-[#071C4B] text-white border-[#071C4B] shadow-lg scale-110 z-10' : 'bg-transparent text-gray-700 hover:bg-gray-100 border-transparent'}
                        ${isToday && !isSelected ? 'text-[#C41E22] border-[#C41E22]/20' : ''}
                        ${(isPast || isBeforeMin) ? 'opacity-10 cursor-not-allowed grayscale' : ''}
                    `}
                >
                    {d}
                </div>
            );
        }
        return dayElements;
    };

    return (
        <div className="absolute top-[calc(100%+12px)] left-0 md:left-auto md:right-0 bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] z-[100] w-[calc(100vw-32px)] sm:w-[380px] border border-gray-100 p-4 sm:p-6 animate-in fade-in slide-in-from-top-4 duration-300 rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button type="button" onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                    <FaChevronLeft size={14} />
                </button>
                <div className="text-base font-black uppercase text-[#071C4B] tracking-[0.2em]">
                    {monthNames[currentMonth]} {currentYear}
                </div>
                <button type="button" onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                    <FaChevronRight size={14} />
                </button>
            </div>

            {/* Days Weekday */}
            <div className="grid grid-cols-7 mb-4 text-center">
                {days.map(d => (
                    <div key={d} className={`text-[11px] font-black uppercase tracking-wider ${d === 'Sun' ? 'text-red-400' : 'text-gray-400'}`}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 text-center">
                {renderDays()}
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center group">
                <div className="flex gap-4">
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(""); }} className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors">Clear</button>
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(today.toISOString().split('T')[0]); }} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors">Today</button>
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
                    className="bg-[#071C4B] text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#0A2665] transition-all"
                >
                    Done
                </button>
            </div>

            {/* Pointer Arrow */}
            <div className="absolute -top-2 left-10 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45"></div>
        </div>
    );
}
