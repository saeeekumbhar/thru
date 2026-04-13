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
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Dropdown } from '../components/ui/Dropdown';
import { Slider } from '../components/ui/Slider';
import { OptionCard } from '../components/ui/OptionCard';
import { Stepper } from '../components/ui/Stepper';
import { SegmentedSelector } from '../components/ui/SegmentedSelector';
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
  const [groupSize, setGroupSize] = useState(1);
  const [budget, setBudget] = useState(25000);
  const [isPerPerson, setIsPerPerson] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Update group size when travel mode changes
  useEffect(() => {
    if (travelType === 'Solo') setGroupSize(1);
    if (travelType === 'Couple') setGroupSize(2);
    if (travelType === 'Friends') setGroupSize(3);
    if (travelType === 'Family') setGroupSize(4);
  }, [travelType]);
  
  const currency = useMemo(() => getCurrency(destination), [destination]);

  // Live Preview Logic
  const estimatedCost = useMemo(() => {
    const totalBudget = isPerPerson ? budget * groupSize : budget;
    const basePerDay = totalBudget / Number(duration || 1);
    
    // Simple breakdown logic
    const stay = Math.round(totalBudget * 0.45);
    const food = Math.round(totalBudget * 0.30);
    const transport = Math.round(totalBudget * 0.25);

    return {
      daily: Math.round(basePerDay),
      total: totalBudget,
      breakdown: { stay, food, transport }
    };
  }, [budget, duration, groupSize, isPerPerson]);

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
              <section className="space-y-10 pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light block">
                      02. Duration
                    </label>
                    <span className="text-[10px] font-typewriter text-stamp-red italic">
                      {duration === '1' ? 'Perfect for a quick escape' : 
                       duration === '3' ? 'Ideal for exploring deeply' : 
                       'The grand expedition'}
                    </span>
                  </div>
                  <SegmentedSelector 
                    label=""
                    value={duration}
                    onChange={setDuration}
                    options={[
                      { value: '1', label: '1 Day', sublabel: 'Quick' },
                      { value: '3', label: '3 Days', sublabel: 'Ideal' },
                      { value: '7', label: '7 Days', sublabel: 'Week' },
                      { value: '14', label: '2 Weeks', sublabel: 'Grand' },
                    ]}
                  />
                </div>

                <div className="border-b border-ink/5 pb-10">
                  <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light block mb-6">
                    03. Travel Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex bg-paper p-1.5 rounded-xl border border-ink/5 h-16">
                      {[
                        { value: 'Solo', icon: <User size={16} /> },
                        { value: 'Couple', icon: <Heart size={16} /> },
                        { value: 'Friends', icon: <Users size={16} /> },
                        { value: 'Family', icon: <Users size={16} /> }
                      ].map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setTravelType(mode.value)}
                          className={`flex-1 flex flex-col items-center justify-center rounded-lg transition-all ${
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

                    <AnimatePresence mode="wait">
                      {(travelType === 'Friends' || travelType === 'Family') && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <Stepper 
                            label="Number of Travelers"
                            value={groupSize}
                            onChange={setGroupSize}
                            unit="People"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              {/* SECTION 3: BUDGET */}
              <section className="pt-4 border-b border-ink/5 pb-10">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light block">
                    04. Budget Preference
                  </label>
                  <div className="flex items-center space-x-2 bg-paper-dark/30 p-1 rounded-lg border border-ink/5">
                    <button 
                      onClick={() => setIsPerPerson(true)}
                      className={`px-3 py-1.5 rounded-md text-[8px] font-typewriter uppercase transition-all ${isPerPerson ? 'bg-ink text-paper shadow-sm' : 'text-ink-light'}`}
                    >
                      Per Person
                    </button>
                    <button 
                      onClick={() => setIsPerPerson(false)}
                      className={`px-3 py-1.5 rounded-md text-[8px] font-typewriter uppercase transition-all ${!isPerPerson ? 'bg-ink text-paper shadow-sm' : 'text-ink-light'}`}
                    >
                      Total Trip
                    </button>
                  </div>
                </div>
                
                <Slider 
                  label={isPerPerson ? "Budget Per Individual" : "Total Expedition Fund"}
                  min={isPerPerson ? 500 : 1000}
                  max={isPerPerson ? 50000 : 500000}
                  step={500}
                  value={budget}
                  onChange={setBudget}
                  currency={currency}
                />
                
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Stay', val: estimatedCost.breakdown.stay },
                    { label: 'Food', val: estimatedCost.breakdown.food },
                    { label: 'Transit', val: estimatedCost.breakdown.transport }
                  ].map((item) => (
                    <div key={item.label} className="bg-paper p-3 rounded-lg border border-ink/5">
                      <p className="text-[8px] font-typewriter uppercase text-ink/40 mb-1">{item.label}</p>
                      <p className="font-serif font-bold text-sm text-ink">{currency}{item.val.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION 4: INTERESTS */}
              <section className="pt-4">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-[10px] font-typewriter uppercase tracking-widest text-ink-light block">
                    05. Interests
                  </label>
                  <div className={`px-2 py-1 rounded border font-typewriter text-[9px] uppercase tracking-tighter ${selectedInterests.length >= 3 ? 'bg-ink text-paper' : 'bg-paper text-ink-light border-ink/10'}`}>
                    {selectedInterests.length} / 5 Selected
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {INTEREST_OPTIONS.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      type="interest"
                      title={opt.label}
                      icon={opt.icon}
                      onSelect={() => {
                        setSelectedInterests(prev => {
                          if (prev.includes(opt.value)) return prev.filter(v => v !== opt.value);
                          if (prev.length >= 5) return prev;
                          return [...prev, opt.value];
                        });
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
        <aside className="w-full lg:w-96">
          <div className="bg-ink text-paper p-8 rounded-2xl shadow-xl sticky top-8 space-y-8 overflow-hidden">
            {/* Background pattern for side panel */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-circular-pattern opacity-10 pointer-events-none -mr-10 -mt-10" />

            <div className="flex items-center justify-between relative z-10">
              <h2 className="font-serif text-2xl font-bold italic tracking-tight">Expedition Summary</h2>
              <div className="h-10 w-10 rounded-full border border-paper/20 flex items-center justify-center">
                <Compass size={20} className="text-paper/60 animate-[spin_10s_linear_infinite]" />
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="border-b border-paper/10 pb-6">
                <p className="text-[10px] font-typewriter uppercase text-paper/40 mb-2 tracking-widest">Selected Itinerary</p>
                <div className="flex flex-wrap gap-2">
                   <span className="bg-paper/10 px-2 py-1 rounded text-[9px] font-typewriter uppercase tracking-tighter">{duration} Days</span>
                   <span className="bg-paper/10 px-2 py-1 rounded text-[9px] font-typewriter uppercase tracking-tighter">{travelType}</span>
                   {groupSize > 1 && <span className="bg-paper/10 px-2 py-1 rounded text-[9px] font-typewriter uppercase tracking-tighter">{groupSize} Travelers</span>}
                </div>
              </div>

              <div className="flex justify-between items-end border-b border-paper/10 pb-6 text-paper">
                <div>
                  <p className="text-[10px] font-typewriter uppercase text-paper/40 mb-1">Total Trip Fund</p>
                  <p className="font-serif text-4xl font-bold">{currency}{estimatedCost.total.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-typewriter uppercase text-paper/40 mb-1">Daily Avg.</p>
                  <p className="font-serif text-lg text-paper/80">{currency}{estimatedCost.daily.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-typewriter uppercase text-paper/40 tracking-widest">Live Trip Insights</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-paper/5 p-3 rounded-lg border border-paper/10">
                       <p className="text-[8px] font-typewriter uppercase text-paper/40 mb-1">Weather</p>
                       <p className="text-xs font-serif font-bold">Sunny, 24°C</p>
                    </div>
                    <div className="bg-paper/5 p-3 rounded-lg border border-paper/10">
                       <p className="text-[8px] font-typewriter uppercase text-paper/40 mb-1">Crowd Level</p>
                       <p className="text-xs font-serif font-bold">Moderate</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-paper/10 rounded-lg flex items-center justify-center">
                      <MapPin size={16} className="text-paper/60" />
                    </div>
                    <div>
                      <p className="text-[10px] font-typewriter uppercase text-paper/40">Places to Visit</p>
                      <p className="font-serif font-bold text-sm tracking-wide">{numPlaces}+ Handpicked spots</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-paper/10 rounded-lg flex items-center justify-center">
                      <Sparkles size={16} className="text-paper/60" />
                    </div>
                    <div>
                      <p className="text-[10px] font-typewriter uppercase text-paper/40">Highlights</p>
                      <p className="font-serif text-[11px] text-paper/60 uppercase tracking-tighter">Optimized routes included</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Itinerary Preview */}
              <div className="space-y-4 pt-4 border-t border-paper/5">
                <p className="text-[10px] font-typewriter uppercase text-paper/40 tracking-widest">Expedition Preview</p>
                <div className="space-y-4">
                  {[1, 2].map((day) => (
                    <div key={day} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-paper/10 flex items-center justify-center border border-paper/20">
                          <span className="text-[8px] font-bold">{day}</span>
                        </div>
                        {day === 1 && <div className="w-px h-6 bg-paper/10 my-1" />}
                      </div>
                      <div>
                        <p className="font-serif text-xs font-bold text-paper/90">Day {day}</p>
                        <p className="text-[10px] font-typewriter text-paper/40 uppercase tracking-tighter">Arrival & immersion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuildTrip}
              disabled={!destination || loading}
              className="w-full mt-8 bg-paper text-ink py-4 rounded-xl font-serif text-xl font-bold hover:bg-paper-dark transition-all disabled:opacity-50 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-ink opacity-0 group-hover:opacity-5 transition-opacity" />
              {loading ? (
                <div className="flex items-center space-x-3">
                  <Loader2 size={24} className="animate-spin" />
                  <span>Calculating...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-2">
                    <Compass size={24} className="group-hover:rotate-12 transition-transform" />
                    <span>Build Expedition</span>
                  </div>
                  <span className="text-[8px] font-typewriter uppercase tracking-[0.2em] mt-1 opacity-40">Proceed to checkout</span>
                </div>
              )}
            </motion.button>
          </div>
        </aside>

      </div>
    </div>
  );
}
