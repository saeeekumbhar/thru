import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Compass, Loader2, MapPin, Users, User, Heart, Coffee, Palmtree, 
  Building2, Music, ShoppingBag, Zap, Search, Clock, Sun, 
  TrendingDown, Sparkles, Navigation, Users2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '../components/ui/Slider';
import { OptionCard } from '../components/ui/OptionCard';
import { Stepper } from '../components/ui/Stepper';
import { SegmentedSelector } from '../components/ui/SegmentedSelector';
import { getCurrency } from '../lib/utils';

const MOCK_CITIES = [
  { id: 'mumbai', name: 'Mumbai', country: 'India', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop', bestTime: 'Oct - Mar', tags: ['Street Food', 'Bollywood', 'Heritage'], description: 'The city of dreams and contrasts.' },
  { id: 'paris', name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602881462-8c9769213158?w=400&h=300&fit=crop', bestTime: 'Apr - Jun', tags: ['Art', 'Romance', 'Cafes'], description: 'The global center for art and culture.' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop', bestTime: 'Mar - May', tags: ['Tech', 'Culture', 'Food'], description: 'Ultramodern and traditional perfectly blended.' },
  { id: 'london', name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop', bestTime: 'May - Sep', tags: ['History', 'Pubs', 'Museums'], description: 'A 21st-century city with history stretching back to Roman times.' },
  { id: 'newyork', name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop', bestTime: 'Sep - Nov', tags: ['Skyline', 'Broadway', 'Shopping'], description: 'The city that never sleeps.' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop', bestTime: 'Nov - Mar', tags: ['Luxury', 'Desert', 'Shopping'], description: 'High-tech luxury in the middle of the desert.' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=300&fit=crop', bestTime: 'Feb - Apr', tags: ['Clean', 'Food', 'Gardens'], description: 'A pristine island city-state in maritime Southeast Asia.' },
  { id: 'rome', name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop', bestTime: 'Sep - Nov', tags: ['History', 'Pasta', 'Art'], description: 'The heart of a sweeping ancient empire.' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop', bestTime: 'May - Jun', tags: ['Gaudí', 'Beach', 'Tapas'], description: 'A vibrant seaside city dripping with surreal architecture.' },
  { id: 'bali', name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop', bestTime: 'Apr - Oct', tags: ['Beaches', 'Temples', 'Relax'], description: 'A forested volcanic island, known for beaches and temples.' },
];

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
  
  // Step State
  const [activeStep, setActiveStep] = useState(1);
  const stepRefs = {
    1: useRef<HTMLElement>(null),
    2: useRef<HTMLElement>(null),
    3: useRef<HTMLElement>(null),
    4: useRef<HTMLElement>(null),
    5: useRef<HTMLElement>(null),
  };
  
  const scrollToStep = (step: number) => {
    setActiveStep(Math.max(activeStep, step));
    setTimeout(() => {
      // Small delay to allow state update to render
      stepRefs[step as keyof typeof stepRefs].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  // Form State
  const [destinationObj, setDestinationObj] = useState<typeof MOCK_CITIES[0] | null>(null);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [duration, setDuration] = useState('3');
  const [travelType, setTravelType] = useState('Solo');
  const [groupSize, setGroupSize] = useState(1);
  const [budget, setBudget] = useState(25000);
  const [isPerPerson, setIsPerPerson] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Update group size when travel mode changes
  useEffect(() => {
    if (travelType === 'Solo') setGroupSize(1);
    if (travelType === 'Couple') setGroupSize(2);
    if (travelType === 'Friends' && groupSize < 3) setGroupSize(3);
    if (travelType === 'Family' && groupSize < 4) setGroupSize(4);
    
    // Auto advance to travel mode specific step
    if (activeStep >= 3) scrollToStep(4);
  }, [travelType]);
  
  // Also watch duration to advance
  useEffect(() => {
    if (activeStep >= 2 && duration) scrollToStep(3);
  }, [duration]);

  const currency = useMemo(() => getCurrency(destinationObj?.name || ''), [destinationObj]);

  // Live Preview Logic & Budget Breakdown
  const estimatedCost = useMemo(() => {
    const totalBudget = isPerPerson ? budget * groupSize : budget;
    const basePerDay = totalBudget / Number(duration || 1);
    
    const stay = Math.round(totalBudget * 0.45);
    const food = Math.round(totalBudget * 0.30);
    const transport = Math.round(totalBudget * 0.25);

    return {
      daily: Math.round(basePerDay),
      total: totalBudget,
      breakdown: { stay, food, transport }
    };
  }, [budget, duration, groupSize, isPerPerson]);

  const stayPct = (estimatedCost.breakdown.stay / estimatedCost.total) * 100 || 0;
  const foodPct = (estimatedCost.breakdown.food / estimatedCost.total) * 100 || 0;
  const transportPct = (estimatedCost.breakdown.transport / estimatedCost.total) * 100 || 0;

  const minBudget = useMemo(() => {
    return Math.max(500, Number(duration) * 500 * (isPerPerson ? 1 : groupSize));
  }, [duration, groupSize, isPerPerson]);

  // Make sure current budget never drops below minBudget if bounds change dynamically
  useEffect(() => {
    if (budget < minBudget) setBudget(minBudget);
  }, [minBudget]);

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN').format(val);

  const budgetFeedback = useMemo(() => {
    const val = (isPerPerson ? budget : budget / groupSize) / Number(duration);
    if (val < 2500) return "Budget-conscious trip — ideal for hostels & local food";
    if (val < 8000) return "Balanced trip — comfort stays with curated experiences";
    return "Premium trip — boutique stays & premium activities";
  }, [budget, isPerPerson, groupSize, duration]);

  const handleBuildTrip = async () => {
    if (!destinationObj || loading) return;
    setLoading(true);
    
    try {
      const tripData = {
        user_id: user?.uid || 'guest-123',
        destination: destinationObj.name,
        duration,
        travelType,
        budget: isPerPerson ? budget * groupSize : budget,
        interests: selectedInterests,
        status: 'planning',
        createdAt: serverTimestamp()
      };

      await new Promise(resolve => setTimeout(resolve, 2000));
      const tripRef = await addDoc(collection(db, 'trips'), tripData);
      navigate(`/trips/${tripRef.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDayPreview = (day: number) => {
    if (day === 1) return 'Arrival & Local Exploration';
    if (day === Number(duration)) return 'Departure & Last Minute Shopping';
    const int = selectedInterests[(day - 2) % selectedInterests.length];
    return int ? `${int} & Discoveries` : 'Sightseeing & Relaxation';
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden bg-map-texture selection:bg-stamp-red/20">
      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-6 max-w-[1400px] mx-auto w-full z-10 pt-8">
        
        {/* Main Form Area */}
        <div className="flex-1 space-y-8 pb-32">
          <header className="mb-6 text-left max-w-2xl">
            <div className="stamp-effect text-stamp-red border-stamp-red text-[10px] uppercase mb-4 inline-block transform -rotate-2">
              Planner No. 402
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-ink mb-3 tracking-tight">Design Your Expedition</h1>
          </header>

          <div className="space-y-8">
            {/* STEP 1: DESTINATION */}
            <section ref={stepRefs[1]} className={`transition-all duration-500 bg-white/60 backdrop-blur-md border border-ink/10 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden ${activeStep >= 1 ? 'opacity-100 ring-4 ring-ink/5' : 'opacity-40 grayscale-[0.3]'}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stamp-red via-ink to-stamp-blue opacity-30" />
              <label className="text-[11px] font-typewriter uppercase tracking-widest text-ink/50 mb-4 block flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-ink/10 flex items-center justify-center text-ink font-bold">1</span> 
                Select Destination
              </label>
              
              <div className="relative group z-50">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-ink/30 group-focus-within:text-stamp-red transition-colors">
                  <Search size={28} />
                </div>
                <input 
                  type="text"
                  value={destinationQuery}
                  onChange={(e) => {
                    setDestinationQuery(e.target.value);
                    setShowSuggestions(true);
                    if (!e.target.value) setDestinationObj(null);
                  }}
                  onFocus={() => {
                    setShowSuggestions(true);
                    setActiveStep(1);
                  }}
                  placeholder="Where to next?"
                  className="w-full bg-paper/50 border-2 border-transparent hover:border-ink/10 py-5 pl-14 pr-4 rounded-2xl font-serif text-3xl md:text-4xl focus:outline-none focus:border-stamp-red/50 focus:bg-white transition-all placeholder:text-ink/20 shadow-inner"
                />
                
                <AnimatePresence>
                  {showSuggestions && destinationQuery.length > 0 && !destinationObj && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white shadow-2xl border border-ink/10 rounded-2xl overflow-hidden max-h-96 overflow-y-auto"
                    >
                      {MOCK_CITIES.filter(c => c.name.toLowerCase().includes(destinationQuery.toLowerCase()) || c.country.toLowerCase().includes(destinationQuery.toLowerCase())).map(city => (
                        <button
                          key={city.id}
                          onClick={() => {
                            setDestinationObj(city);
                            setDestinationQuery(`${city.name}, ${city.country}`);
                            setShowSuggestions(false);
                            scrollToStep(2);
                          }}
                          className="w-full text-left p-3 hover:bg-paper/80 transition-colors flex items-center gap-4 group border-b border-ink/5 last:border-0"
                        >
                          <img src={city.image} alt={city.name} className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif text-xl font-bold text-ink mb-1 group-hover:text-stamp-red transition-colors">{city.name}</h4>
                            <div className="flex items-center gap-2 text-[10px] font-typewriter uppercase text-ink-light">
                              <span className="flex items-center gap-1"><Sun size={12}/> {city.bestTime}</span>
                              <span className="w-1 h-1 rounded-full bg-ink/20" />
                              <span className="truncate">{city.tags.join(' • ')}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected Preview */}
              <AnimatePresence>
                {destinationObj && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 bg-ink text-paper rounded-2xl overflow-hidden flex flex-col md:flex-row relative"
                  >
                    <div className="md:w-1/3 relative h-48 md:h-auto">
                      <img src={destinationObj.image} alt={destinationObj.name} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-6 md:w-2/3 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-mustard mb-2">
                        <Navigation size={14} />
                        <span className="text-[10px] font-typewriter uppercase tracking-widest">Selected</span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold mb-2">{destinationObj.name}, <span className="text-paper/60 italic">{destinationObj.country}</span></h3>
                      <p className="text-sm text-paper/80 mb-4">{destinationObj.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {destinationObj.tags.map(t => (
                          <span key={t} className="bg-paper/10 px-2 py-1 rounded text-[10px] font-typewriter uppercase tracking-wider">{t}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* STEP 2: DURATION */}
            <section ref={stepRefs[2]} onClick={() => activeStep < 2 && scrollToStep(2)} className={`transition-all duration-500 bg-white/60 backdrop-blur-md border border-ink/10 p-6 md:p-8 rounded-[2rem] shadow-sm ${activeStep >= 2 ? 'opacity-100 cursor-default ring-4 ring-ink/5' : 'opacity-40 grayscale-[0.3] cursor-pointer hover:opacity-60'}`}>
              <label className="text-[11px] font-typewriter uppercase tracking-widest text-ink/50 mb-6 block flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-ink/10 flex items-center justify-center text-ink font-bold">2</span> 
                Trip Duration
              </label>
              <SegmentedSelector 
                label=""
                value={duration}
                onChange={(val) => { setDuration(val); scrollToStep(3); }}
                options={[
                  { value: '1', label: '1 Day', sublabel: 'Quick getaway' },
                  { value: '3', label: '3 Days', sublabel: 'Ideal for exploring deeply' },
                  { value: '7', label: '7 Days', sublabel: 'A full week escape' },
                  { value: '14', label: '2 Weeks', sublabel: 'The grand expedition' },
                ]}
              />
            </section>

            {/* STEP 3: TRAVEL MODE */}
            <section ref={stepRefs[3]} onClick={() => activeStep < 3 && scrollToStep(3)} className={`transition-all duration-500 bg-white/60 backdrop-blur-md border border-ink/10 p-6 md:p-8 rounded-[2rem] shadow-sm ${activeStep >= 3 ? 'opacity-100 cursor-default ring-4 ring-ink/5' : 'opacity-40 grayscale-[0.3] cursor-pointer hover:opacity-60'}`}>
              <label className="text-[11px] font-typewriter uppercase tracking-widest text-ink/50 mb-6 block flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-ink/10 flex items-center justify-center text-ink font-bold">3</span> 
                Who's going?
              </label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-paper/50 p-2 rounded-2xl border border-ink/5">
                <div className="flex bg-white shadow-sm p-1.5 rounded-xl border border-ink/5 h-[88px]">
                  {[
                    { value: 'Solo', icon: <User size={20} /> },
                    { value: 'Couple', icon: <Heart size={20} /> },
                    { value: 'Friends', icon: <Users size={20} /> },
                    { value: 'Family', icon: <Users2 size={20} /> }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => { setTravelType(mode.value); scrollToStep(4); }}
                      className={`flex-1 flex flex-col items-center justify-center rounded-lg transition-all transform ${
                        travelType === mode.value 
                          ? 'bg-ink text-paper shadow-lg scale-105 z-10' 
                          : 'text-ink-light hover:bg-ink/5 hover:text-ink'
                      }`}
                    >
                      {mode.icon}
                      <span className="text-[10px] uppercase font-typewriter mt-2 font-bold tracking-widest">{mode.value}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {(travelType === 'Friends' || travelType === 'Family') ? (
                    <motion.div
                      key="stepper"
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="px-4 pb-2 lg:pb-0"
                    >
                      <Stepper 
                        label="Number of Travelers"
                        value={groupSize}
                        onChange={setGroupSize}
                        unit="People"
                      />
                    </motion.div>
                  ) : (
                     <motion.div key="empty" className="hidden lg:block text-center text-ink/20 font-typewriter text-xs uppercase" />
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* STEP 4: BUDGET */}
            <section ref={stepRefs[4]} onClick={() => activeStep < 4 && scrollToStep(4)} className={`transition-all duration-500 bg-white/60 backdrop-blur-md border border-ink/10 p-6 md:p-8 rounded-[2rem] shadow-sm ${activeStep >= 4 ? 'opacity-100 cursor-default ring-4 ring-ink/5' : 'opacity-40 grayscale-[0.3] cursor-pointer hover:opacity-60'}`}>
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <label className="text-[11px] font-typewriter uppercase tracking-widest text-ink/50 block flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-ink/10 flex items-center justify-center text-ink font-bold">4</span> 
                    Trip Budget
                  </label>
               </div>

               <div className="bg-paper/30 p-6 md:p-8 rounded-2xl border border-ink/5 space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <Slider 
                        label=""
                        min={minBudget}
                        max={isPerPerson ? 200000 : 1000000}
                        step={100}
                        value={budget}
                        onChange={setBudget}
                        currency=""
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0 bg-white px-4 py-3 rounded-xl border border-ink/10 shadow-inner w-full md:w-36">
                      <span className="font-serif text-xl text-ink/50">{currency}</span>
                      <input 
                        type="number" 
                        value={budget} 
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full bg-transparent font-serif text-2xl font-bold text-ink focus:outline-none text-right"
                      />
                    </div>
                    <div className="flex items-center p-1 bg-ink/5 rounded-xl self-start md:self-auto shrink-0">
                       <button
                         onClick={() => setIsPerPerson(true)}
                         className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${isPerPerson ? 'bg-white shadow text-ink' : 'text-ink-light hover:text-ink'}`}
                       >
                         Per Person
                       </button>
                       <button
                         onClick={() => setIsPerPerson(false)}
                         className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${!isPerPerson ? 'bg-white shadow text-ink' : 'text-ink-light hover:text-ink'}`}
                       >
                         Total Trip
                       </button>
                    </div>
                 </div>

                 {/* Bar Distribution */}
                 <div className="pt-6 border-t border-ink/10">
                   <div className="flex justify-between items-end mb-3">
                     <h4 className="text-xs font-typewriter uppercase text-ink-light font-bold">Budget Distribution</h4>
                     <span className="text-[10px] text-stamp-blue font-bold px-2 py-1 bg-stamp-blue/10 rounded uppercase">Smart Estimate</span>
                   </div>
                   
                   <div className="h-4 w-full flex rounded-full overflow-hidden shadow-inner gap-1">
                      <div className="bg-ink h-full transition-all duration-500 ease-out" style={{ width: `${stayPct}%` }} title={`Stay: ${currency}${formatINR(estimatedCost.breakdown.stay)}`} />
                      <div className="bg-mustard h-full transition-all duration-500 ease-out" style={{ width: `${foodPct}%` }} title={`Food: ${currency}${formatINR(estimatedCost.breakdown.food)}`} />
                      <div className="bg-stamp-red h-full transition-all duration-500 ease-out" style={{ width: `${transportPct}%` }} title={`Transport: ${currency}${formatINR(estimatedCost.breakdown.transport)}`} />
                   </div>
                   
                   <div className="flex justify-between mt-4 text-[10px] sm:text-xs font-bold font-serif text-ink">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="w-3 h-3 rounded-sm bg-ink" /> Stay ({Math.round(stayPct)}%)
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="w-3 h-3 rounded-sm bg-mustard" /> Food ({Math.round(foodPct)}%)
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="w-3 h-3 rounded-sm bg-stamp-red" /> Transport ({Math.round(transportPct)}%)
                      </div>
                   </div>
                 </div>

                 {/* Smart Feedback */}
                 <div className="bg-white/80 p-4 border border-ink/10 rounded-xl flex items-start gap-3">
                    <Info size={18} className="text-stamp-red shrink-0 mt-0.5" />
                    <p className="text-sm font-serif italic text-ink">{budgetFeedback}</p>
                 </div>
               </div>
            </section>

            {/* STEP 5: INTERESTS */}
            <section ref={stepRefs[5]} onClick={() => activeStep < 5 && scrollToStep(5)} className={`transition-all duration-500 bg-white/60 backdrop-blur-md border border-ink/10 p-6 md:p-8 rounded-[2rem] shadow-sm ${activeStep >= 5 ? 'opacity-100 ring-4 ring-ink/5' : 'opacity-40 grayscale-[0.3] cursor-pointer hover:opacity-60'}`}>
              <div className="flex justify-between items-center mb-8">
                <label className="text-[11px] font-typewriter uppercase tracking-widest text-ink/50 block flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-ink/10 flex items-center justify-center text-ink font-bold">5</span> 
                  Interests
                </label>
                <div className={`px-3 py-1.5 rounded-lg border font-bold text-xs uppercase transition-colors ${selectedInterests.length >= 5 ? 'bg-stamp-red text-white border-stamp-red' : 'bg-white text-ink border-ink/10'}`}>
                  {selectedInterests.length} / 5 Selected
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {INTEREST_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    type="interest"
                    title={opt.label}
                    icon={opt.icon}
                    onSelect={() => {
                      if (activeStep < 5) scrollToStep(5);
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
          </div>
        </div>

        {/* Right Panel - Live Assistant */}
        <aside className="w-full lg:w-[400px] shrink-0">
          <div className="bg-ink text-paper p-6 md:p-8 rounded-[2.5rem] shadow-2xl lg:sticky lg:top-8 space-y-8 overflow-hidden h-fit transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-circular-pattern opacity-5 pointer-events-none -mr-20 -mt-20" />
            
            <div className="flex items-center justify-between border-b border-paper/10 pb-6 relative z-10">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Sparkles size={20} className="text-mustard" /> Live Planner
              </h2>
            </div>

            {/* Section 1: Trip So Far */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-typewriter uppercase text-paper/40 tracking-widest">Your Trip So Far</h3>
              {destinationObj ? (
                <div className="bg-paper/5 p-4 rounded-2xl border border-paper/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-paper/10 flex shrink-0 items-center justify-center text-xl font-bold border border-paper/20">
                    🌍
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white">{destinationObj.name}</h4>
                    <p className="text-[10px] uppercase font-typewriter text-paper/60">
                      {duration} Days • {travelType} {groupSize > 1 ? `(${groupSize})` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-paper/5 p-4 rounded-2xl border border-paper/10 border-dashed text-center">
                  <p className="text-xs text-paper/40 font-typewriter uppercase">Destination pending...</p>
                </div>
              )}
            </div>

            {/* Section 2: Budget Summary */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-typewriter uppercase text-paper/40 tracking-widest">Budget Estimate</h3>
              <div className="bg-paper/5 p-4 rounded-2xl border border-paper/10 flex justify-between items-end">
                <div>
                  <p className="text-xs text-paper/60 mb-1">Total Fund</p>
                  <p className="font-serif text-3xl font-bold text-white max-w-[120px] truncate">{currency}{formatINR(estimatedCost.total)}</p>
                </div>
                <div className="text-right pb-1">
                   <p className="text-[10px] text-paper/60 uppercase font-typewriter mb-1">Avg / Day</p>
                   <p className="font-bold text-paper text-sm">{currency}{formatINR(estimatedCost.daily)}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Live Insights */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-typewriter uppercase text-paper/40 tracking-widest">Live Insights</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper/5 p-3 rounded-2xl border border-paper/10 flex flex-col gap-2">
                  <Sun size={14} className="text-mustard" />
                  <div>
                    <p className="text-[9px] uppercase font-typewriter text-paper/40">Best Time</p>
                    <p className="text-sm font-bold text-white">{destinationObj ? destinationObj.bestTime : '---'}</p>
                  </div>
                </div>
                <div className="bg-paper/5 p-3 rounded-2xl border border-paper/10 flex flex-col gap-2">
                  <Users size={14} className="text-stamp-blue" />
                  <div>
                    <p className="text-[9px] uppercase font-typewriter text-paper/40">Crowd Level</p>
                    <p className="text-sm font-bold text-white">{destinationObj ? 'Moderate' : '---'}</p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {selectedInterests.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-paper/5 p-3 rounded-2xl border border-paper/10 overflow-hidden"
                  >
                    <p className="text-[9px] uppercase font-typewriter text-paper/40 mb-2">Curated Spots Added</p>
                    <div className="flex flex-col gap-1.5 ">
                      {selectedInterests.map(int => (
                        <div key={int} className="flex items-center gap-2 text-sm font-bold text-white tracking-wide">
                          <span className="text-stamp-red">+</span> {(int.length % 3) + 2} {int.toLowerCase()} {int === 'Food' ? 'spots' : 'activities'}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Section 4: Dynamic Preview */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-typewriter uppercase text-paper/40 tracking-widest flex items-center justify-between">
                 Trip Timeline
                 {selectedInterests.length > 0 && <span className="text-stamp-red font-bold">+{selectedInterests.length} Interests</span>}
               </h3>
               <div className="bg-paper/5 p-5 rounded-2xl border border-paper/10 space-y-4">
                  {[1, Math.min(2, Number(duration)), Math.min(3, Number(duration))].filter((v, i, a) => a.indexOf(v) === i).map((day) => (
                    <div key={day} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-paper/10 flex items-center justify-center border border-paper/20 text-[10px] font-bold text-white group-hover:bg-stamp-red transition-colors">
                          {day}
                        </div>
                        {day < Number(duration) && <div className="w-px h-6 bg-paper/10 my-1 group-hover:bg-stamp-red/50 transition-colors" />}
                      </div>
                      <div className="pt-1">
                        <p className="font-serif text-sm font-bold text-white leading-none mb-1">Day {day}</p>
                        <p className="text-[11px] text-paper/60">{getDayPreview(day)}</p>
                      </div>
                    </div>
                  ))}
                  {Number(duration) > 3 && (
                    <div className="text-center text-xs text-paper/40 font-bold border-t border-paper/10 pt-3 mt-2">
                      + {Number(duration) - 3} more days
                    </div>
                  )}
               </div>
            </div>
            
            {/* CTA */}
            <motion.button
              whileHover={{ scale: destinationObj ? 1.02 : 1 }}
              whileTap={{ scale: destinationObj ? 0.98 : 1 }}
              onClick={handleBuildTrip}
              disabled={!destinationObj || loading}
              className="w-full bg-white text-ink py-5 rounded-[1.5rem] font-serif text-xl font-bold hover:bg-paper transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin text-stamp-red" />
                  <span>Building Trip...</span>
                </>
              ) : (
                <>
                  <span>Build My Trip</span>
                  <Compass size={20} className="text-stamp-red" />
                </>
              )}
            </motion.button>
          </div>
        </aside>

      </div>
    </div>
  );
}
