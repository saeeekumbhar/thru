import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Compass, 
  Loader2, 
  MapPin, 
  Users, 
  User, 
  Heart, 
  Coffee, 
  Palmtree, 
  Building2, 
  Music, 
  ShoppingBag,
  Zap,
  TrendingDown,
  Sparkles,
  Search,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dropdown } from '../components/ui/Dropdown';
import { Slider } from '../components/ui/Slider';
import { OptionCard } from '../components/ui/OptionCard';
import { getCurrency } from '../lib/utils';

const MOCK_CITIES = ['Mumbai', 'Paris', 'Tokyo', 'London', 'New York', 'Dubai', 'Singapore', 'Rome', 'Barcelona', 'Bali'];

const INTEREST_OPTIONS = [
  { value: 'Food', label: 'Food', icon: <Coffee size={24} /> },
  { value: 'Culture', label: 'Culture', icon: <Building2 size={24} /> },
  { value: 'Nightlife', label: 'Nightlife', icon: <Music size={24} /> },
  { value: 'Nature', label: 'Nature', icon: <Palmtree size={24} /> },
  { value: 'Shopping', label: 'Shopping', icon: <ShoppingBag size={24} /> },
  { value: 'Adventure', label: 'Adventure', icon: <Zap size={24} /> },
];

export default function TripPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [destination, setDestination] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duration, setDuration] = useState('3');
  const [travelType, setTravelType] = useState('Solo');
  const [budget, setBudget] = useState(25000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  const currency = useMemo(() => getCurrency(destination), [destination]);

  // Live Preview Logic
  const estimatedCost = useMemo(() => {
    const basePerDay = budget / Number(duration || 1);
    const dailySpend = Math.round(basePerDay * (travelType === 'Solo' ? 1 : (travelType === 'Couple' ? 1.8 : 3.5)));
    return {
      daily: dailySpend,
      total: dailySpend * Number(duration || 1)
    };
  }, [budget, duration, travelType]);

  const numPlaces = useMemo(() => {
    return Math.round(Number(duration || 1) * 2.5 + selectedInterests.length * 1.5);
  }, [duration, selectedInterests]);

  const handlePreset = (type: 'weekend' | 'budget' | 'luxury') => {
    if (type === 'weekend') {
      setDuration('3');
      setBudget(15000);
      setSelectedInterests(['Food', 'Culture']);
    } else if (type === 'budget') {
      setDuration('7');
      setBudget(20000);
      setSelectedInterests(['Nature', 'Culture']);
    } else if (type === 'luxury') {
      setDuration('5');
      setBudget(150000);
      setSelectedInterests(['Shopping', 'Food', 'Culture', 'Nightlife']);
    }
  };

  const handleBuildTrip = async () => {
    if (!destination || loading) return;
    setLoading(true);
    
    try {
      // Collect all inputs
      const tripData = {
        user_id: user?.uid || 'guest-123',
        destination,
        duration,
        travelType,
        budget,
        interests: selectedInterests,
        status: 'planning',
        createdAt: serverTimestamp()
      };

      // Mock delay for effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const tripRef = await addDoc(collection(db, 'trips'), tripData);
      navigate(`/trips/${tripRef.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden bg-map-texture">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-circular-pattern pointer-events-none opacity-40 -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-circular-pattern pointer-events-none opacity-20 -ml-10 -mb-10" />

      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-8 max-w-7xl mx-auto w-full z-10">
        
        {/* Main Form Area */}
        <div className="flex-1 space-y-8">
          <header className="mb-10 text-left">
            <div className="stamp-effect text-stamp-red border-stamp-red text-[10px] uppercase mb-3">
              Planner No. 402
            </div>
            <h1 className="font-serif text-5xl font-bold text-ink mb-2">Plan Your Trip</h1>
            <p className="font-typewriter text-ink-light italic">Tell us your preferences. We’ll build your trip.</p>
          </header>

          <div className="bg-white/80 backdrop-blur-sm border border-ink/5 p-8 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stamp-red via-ink to-stamp-blue opacity-20" />
            
            <div className="space-y-12">
              {/* SECTION 1: DESTINATION */}
              <section className="relative">
                <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light mb-4 block">
                  01. Destination
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none text-ink/30 group-focus-within:text-stamp-red transition-colors">
                    <Search size={28} />
                  </div>
                  <input 
                    type="text"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Where to next? (e.g. Mumbai, Paris, Tokyo)"
                    className="w-full bg-transparent border-b-2 border-ink py-4 pl-12 pr-4 font-serif text-3xl md:text-4xl focus:outline-none focus:border-stamp-red transition-all placeholder:text-ink/10"
                  />
                  
                  <AnimatePresence>
                    {showSuggestions && destination.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-2xl border border-ink/10 mt-2 z-50 rounded-xl overflow-hidden"
                      >
                        {MOCK_CITIES.filter(c => c.toLowerCase().includes(destination.toLowerCase())).map(city => (
                          <button
                            key={city}
                            onClick={() => {
                              setDestination(city);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-6 py-4 hover:bg-paper transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center space-x-3">
                              <MapPin size={18} className="text-ink-light group-hover:text-stamp-red" />
                              <span className="font-serif text-lg">{city}</span>
                            </div>
                            <Clock size={14} className="text-ink/10" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* SECTION 2: BASIC DETAILS */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light block mb-2">
                    02. Duration
                  </label>
                  <Dropdown 
                    label="Days"
                    value={duration}
                    onChange={setDuration}
                    options={[
                      { value: '1', label: '1 Day' },
                      { value: '3', label: '2–3 Days' },
                      { value: '7', label: '4–7 Days' },
                      { value: '14', label: '1+ Week' },
                    ]}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light block mb-2">
                    03. Travel Mode
                  </label>
                  <div className="flex bg-paper p-1 rounded-lg border border-ink/5">
                    {[
                      { value: 'Solo', icon: <User size={16} /> },
                      { value: 'Couple', icon: <Heart size={16} /> },
                      { value: 'Friends', icon: <Users size={16} /> },
                      { value: 'Family', icon: <Users size={16} /> }
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setTravelType(mode.value)}
                        className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-all ${
                          travelType === mode.value 
                            ? 'bg-ink text-paper shadow-md' 
                            : 'text-ink-light hover:bg-ink/5'
                        }`}
                      >
                        {mode.icon}
                        <span className="text-[8px] uppercase font-typewriter mt-1">{mode.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION 3: BUDGET */}
              <section className="pt-4">
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light block">
                    04. Budget
                  </label>
                  <div className="text-right">
                    <span className="font-serif text-3xl font-bold text-ink">{currency}{budget.toLocaleString()}</span>
                    <p className="text-[10px] font-typewriter text-ink-light uppercase">Estimated daily spend: {currency}{estimatedCost.daily.toLocaleString()}</p>
                  </div>
                </div>
                <Slider 
                  label="Planned Budget"
                  min={1000}
                  max={250000}
                  step={1000}
                  value={budget}
                  onChange={setBudget}
                  formatValue={(v) => `${currency}${v.toLocaleString()}`}
                />
                <div className="flex justify-between mt-2 text-[10px] font-typewriter text-ink-light uppercase">
                  <span>Economic</span>
                  <span>Moderate</span>
                  <span>Premium</span>
                </div>
              </section>

              {/* SECTION 4: INTERESTS */}
              <section className="pt-4">
                <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light block mb-6">
                  05. Interests
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {INTEREST_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      type="interest"
                      title={opt.label}
                      icon={opt.icon}
                      onSelect={() => {
                        setSelectedInterests(prev => 
                          prev.includes(opt.value) 
                            ? prev.filter(v => v !== opt.value) 
                            : [...prev, opt.value]
                        );
                      }}
                      isSelected={selectedInterests.includes(opt.value)}
                    />
                  ))}
                </div>
              </section>

              {/* SECTION 5: QUICK PRESETS */}
              <section className="pt-8 border-t border-ink/5">
                 <div className="flex flex-wrap gap-3">
                   <button 
                     onClick={() => handlePreset('weekend')}
                     className="px-4 py-2 bg-paper-dark/50 border border-ink/10 rounded-full font-typewriter text-[10px] uppercase hover:bg-ink hover:text-paper transition-all flex items-center space-x-2"
                   >
                     <TrendingDown size={12} className="text-stamp-blue" />
                     <span>Weekend Trip</span>
                   </button>
                   <button 
                     onClick={() => handlePreset('budget')}
                     className="px-4 py-2 bg-paper-dark/50 border border-ink/10 rounded-full font-typewriter text-[10px] uppercase hover:bg-ink hover:text-paper transition-all flex items-center space-x-2"
                   >
                     <Sparkles size={12} className="text-mustard" />
                     <span>Budget Travel</span>
                   </button>
                   <button 
                     onClick={() => handlePreset('luxury')}
                     className="px-4 py-2 bg-paper-dark/50 border border-ink/10 rounded-full font-typewriter text-[10px] uppercase hover:bg-ink hover:text-paper transition-all flex items-center space-x-2"
                   >
                     <Sparkles size={12} className="text-stamp-red" />
                     <span>Luxury Escape</span>
                   </button>
                 </div>
              </section>
            </div>
          </div>
        </div>

        {/* Live Preview Side Panel */}
        <aside className="w-full lg:w-96 space-y-6">
          <div className="bg-ink text-paper p-8 rounded-2xl shadow-xl sticky top-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold">Trip Summary</h2>
              <div className="h-10 w-10 rounded-full border border-paper/20 flex items-center justify-center">
                <Compass size={20} className="text-paper/60 animate-[spin_10s_linear_infinite]" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex justify-between items-end border-b border-paper/10 pb-6">
                <div>
                  <p className="text-[10px] font-typewriter uppercase text-paper/60 mb-1">Total Estimated Cost</p>
                  <p className="font-serif text-4xl font-bold">{currency}{estimatedCost.total.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-typewriter uppercase text-paper/60 mb-1">Duration</p>
                  <p className="font-serif text-lg">{duration} Days</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-paper/10 rounded flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-typewriter uppercase text-paper/60">Places to Visit</p>
                    <p className="font-serif font-bold">{numPlaces}+ Handpicked spots</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-paper/10 rounded flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-typewriter uppercase text-paper/60">Highlights</p>
                    <p className="font-serif text-sm">Optimized routes & top attractions included</p>
                  </div>
                </div>
              </div>

              {/* Mini Itinerary Preview */}
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-typewriter uppercase text-paper/60">Quick Preview</p>
                <div className="space-y-3">
                  {[1, 2].map((day) => (
                    <div key={day} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-paper/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-paper" />
                        </div>
                        {day === 1 && <div className="w-0.5 h-full bg-paper/10 my-1" />}
                      </div>
                      <div className="pb-1">
                        <p className="font-serif text-xs font-bold">Day {day}</p>
                        <p className="text-[10px] text-paper/60">Arrival & local immersion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleBuildTrip}
              disabled={!destination || loading}
              className="w-full mt-10 bg-paper text-ink py-4 rounded-xl font-serif text-xl font-bold hover:bg-paper-dark transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-lg hover:shadow-paper/10"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Building Itinerary...</span>
                </>
              ) : (
                <>
                  <Compass size={24} />
                  <span>Build My Trip</span>
                  <ChevronRight size={18} className="opacity-40" />
                </>
              )}
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
