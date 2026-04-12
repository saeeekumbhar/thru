import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Compass, Loader2, MapPin, Plus, UserPlus } from 'lucide-react';
import { Dropdown } from '../components/ui/Dropdown';
import { Slider } from '../components/ui/Slider';
import { Chips } from '../components/ui/Chips';
import { getCurrency } from '../lib/utils';

const MOCK_ITINERARY = {
  title: "A Custom thru Expedition",
  summary: {
    totalCost: "Optimized for your budget",
    travelTime: "Flexible pace",
    highlights: ["Personalized routes", "Hidden gems", "Local experiences"]
  },
  days: [
    {
      day: 1,
      theme: "The Journey Begins",
      activities: [
        { time: "10:00 AM", place: "Local Landmark", description: "Start your adventure with a visit to a recommended historical site.", type: "sightseeing" },
        { time: "01:00 PM", place: "Authentic Bistro", description: "Enjoy a meal curated to your specific tastes.", type: "food" },
        { time: "04:00 PM", place: "Cultural District", description: "Explore the vibrant local scene and soak in the atmosphere.", type: "culture" }
      ]
    },
    {
      day: 2,
      theme: "Deeper Exploration",
      activities: [
        { time: "11:00 AM", place: "Artistic Alley", description: "Discover hidden street art and independent galleries.", type: "hidden gem" },
        { time: "02:00 PM", place: "Scenic Overlook", description: "Breathtaking views recommended by local guides.", type: "nature" },
        { time: "07:00 PM", place: "Twilight Market", description: "A bustling evening experience with regional specialties.", type: "food" }
      ]
    }
  ],
  options: {
    stays: [
      { title: "The Heritage Inn", price: "₹2,500/night", rating: 4.7, tags: ["Historic", "Quiet"] },
      { title: "Modern Studio", price: "₹1,800/night", rating: 4.5, tags: ["Minimalist", "City-view"] }
    ],
    food: [
      { title: "Old Town Cafe", price: "₹450 avg", rating: 4.8, tags: ["Cozy", "Local Coffee"] },
      { title: "Street Flavors", price: "₹200 avg", rating: 4.6, tags: ["Authentic", "Quick"] }
    ],
    places: [
      { title: "Ancient Library", price: "Free", rating: 4.9, tags: ["History", "Architecture"] },
      { title: "Botanical Garden", price: "₹100", rating: 4.7, tags: ["Nature", "Relaxing"] }
    ],
    transport: [
      { title: "Vintage Tram", price: "₹50", rating: 4.4, tags: ["Slower", "Scenic"] },
      { title: "Local TukTuk", price: "₹300", rating: 4.2, tags: ["Fast", "Flexible"] }
    ]
  },
  tips: ["Carry a reusable water bottle", "Local markets are best explored on foot"]
};

export default function TripPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [destination, setDestination] = useState('');
  const [currency, setCurrency] = useState('₹');

  useEffect(() => {
    setCurrency(getCurrency(destination));
  }, [destination]);
  
  // Duration
  const [duration, setDuration] = useState('3');
  const [customDuration, setCustomDuration] = useState('');
  
  // Travel Mode
  const [travelType, setTravelType] = useState('Solo');
  const [numPeople, setNumPeople] = useState('1');
  
  // Budget
  const [budget, setBudget] = useState(25000);
  const [customBudget, setCustomBudget] = useState('');
  
  // Interests
  const [interestOptions, setInterestOptions] = useState([
    { value: 'Food', label: 'Food 🍜' },
    { value: 'Culture', label: 'Culture 🏛️' },
    { value: 'Nightlife', label: 'Nightlife 🌃' },
    { value: 'Nature', label: 'Nature 🌿' },
    { value: 'Shopping', label: 'Shopping 🛍️' },
    { value: 'History', label: 'History 📜' },
  ]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [newInterestInput, setNewInterestInput] = useState('');
  
  // Stay
  const [stayPreference, setStayPreference] = useState('Hotel');

  // Specifics
  const [specifics, setSpecifics] = useState('');

  const finalDuration = duration === 'custom' ? customDuration : duration;
  const finalBudget = customBudget ? parseInt(customBudget) : budget;
  const finalPeople = travelType === 'custom' ? numPeople : (travelType === 'Solo' ? '1' : (travelType === 'Couple' ? '2' : '4'));

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (newInterestInput.trim()) {
      const newValue = newInterestInput.trim();
      if (!interestOptions.find(o => o.value === newValue)) {
        setInterestOptions(prev => [...prev, { value: newValue, label: `${newValue} ✨` }]);
      }
      if (!selectedInterests.includes(newValue)) {
        setSelectedInterests(prev => [...prev, newValue]);
      }
      setNewInterestInput('');
    }
  };

  const handleBuildTrip = async () => {
    if (!destination || loading) return;

    setLoading(true);
    const preferences = `${travelType} traveler (${finalPeople} people) interested in ${selectedInterests.join(', ')}. Preferring ${stayPreference} stays. Budget: ${currency}${finalBudget}. Additional notes: ${specifics}`;
    
    try {
      // Small delay for effect
      await new Promise(resolve => setTimeout(resolve, 1500));

      let itinerary;
      try {
        const response = await fetch('/api/generate-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            destination, 
            days: finalDuration, 
            preferences 
          })
        });

        if (!response.ok) throw new Error('API Unavailable');
        itinerary = await response.json();
      } catch (apiError) {
        console.warn("Using MOCK data fallback.");
        itinerary = { 
          ...MOCK_ITINERARY, 
          title: `Trip to ${destination}`,
          summary: { 
            ...MOCK_ITINERARY.summary, 
            totalCost: `${currency}${finalBudget.toLocaleString()}` 
          } 
        };
      }
      
      // Save to Firestore
      const tripData = {
        user_id: user?.uid || 'guest-123',
        destination: itinerary.title || destination,
        status: 'planning',
        itinerary: JSON.stringify(itinerary),
        budget: finalBudget,
        currency: currency,
        duration: finalDuration,
        num_people: finalPeople,
        createdAt: serverTimestamp()
      };

      const tripRef = await addDoc(collection(db, 'trips'), tripData);
      navigate(`/trips/${tripRef.id}`);
      
    } catch (error) {
      console.error(error);
      alert("Telegraph lines are down. Even the backup manifest failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center p-6 md:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')]"></div>
      
      <div className="max-w-2xl w-full bg-white border border-ink/10 shadow-xl rounded-lg p-8 md:p-12 relative z-10">
        <header className="text-center mb-12">
          <div className="inline-block stamp-effect text-stamp-blue border-stamp-blue mb-4 uppercase">
            planner no. 402
          </div>
          <h1 className="font-serif text-4xl font-bold text-ink">New Expedition</h1>
          <p className="font-typewriter text-ink-light mt-2 italic">- Go thru the world, the right way</p>
        </header>

        <div className="space-y-10">
          {/* Destination */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-typewriter uppercase text-ink-light tracking-wider flex items-center">
              <MapPin size={14} className="mr-1" /> Destination
            </label>
            <input 
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Mumbai, Paris, Tokyo"
              className="w-full bg-paper border-b-2 border-ink py-2 font-serif text-2xl focus:outline-none focus:border-stamp-red transition-colors placeholder:text-ink/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Duration */}
            <div className="space-y-4">
              <Dropdown 
                label="Duration"
                value={duration}
                onChange={setDuration}
                options={[
                  { value: '1', label: '1 Day' },
                  { value: '3', label: '2-3 Days' },
                  { value: '7', label: '4-7 Days' },
                  { value: '14', label: '1-2 Weeks' },
                  { value: 'custom', label: 'Custom...' },
                ]}
              />
              {duration === 'custom' && (
                <div className="flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-typewriter uppercase text-ink-light">Enter Days</label>
                  <input 
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Number of days"
                    className="w-full bg-paper border-b border-ink/30 py-1 font-serif text-lg focus:outline-none focus:border-ink"
                  />
                </div>
              )}
            </div>

            {/* Travel Mode (including custom people) */}
            <div className="space-y-4">
               <Dropdown 
                label="Travel Mode"
                value={travelType}
                onChange={setTravelType}
                options={[
                  { value: 'Solo', label: 'Solo 👤' },
                  { value: 'Couple', label: 'Couple 👩‍❤️‍👨' },
                  { value: 'Friends', label: 'With Friends 🍻' },
                  { value: 'Family', label: 'Family 👨‍👩‍👧‍👦' },
                  { value: 'custom', label: 'Custom... 👥' },
                ]}
              />
              {travelType === 'custom' && (
                <div className="flex flex-col space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-typewriter uppercase text-ink-light flex items-center">
                    <UserPlus size={10} className="mr-1" /> Number of People
                  </label>
                  <input 
                    type="number"
                    value={numPeople}
                    onChange={(e) => setNumPeople(e.target.value)}
                    className="w-full bg-paper border-b border-ink/30 py-1 font-serif text-lg focus:outline-none focus:border-ink"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Budget (with local currency) */}
          <div className="space-y-4">
            <Slider 
              label={`Planned Budget (${currency})`}
              min={500}
              max={500000}
              step={500}
              value={finalBudget}
              onChange={(v) => {
                setBudget(v);
                setCustomBudget('');
              }}
              formatValue={(v) => `${currency}${v.toLocaleString()}`}
            />
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-typewriter uppercase text-ink-light">Or enter custom amount</label>
              <input 
                type="number"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                placeholder={`${currency} Custom amount`}
                className="w-48 bg-paper border-b border-ink/30 py-1 font-serif text-lg focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <Chips 
              label="Interests"
              options={interestOptions}
              selectedValues={selectedInterests}
              onChange={setSelectedInterests}
            />
            <div className="flex items-end space-x-2">
              <div className="flex-1 flex flex-col space-y-2">
                <label className="text-[10px] font-typewriter uppercase text-ink-light italic">Type an interest to add it...</label>
                <input 
                  type="text"
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInterest(e)}
                  placeholder="e.g. Scuba, Jazz, Spices"
                  className="w-full bg-paper border-b border-ink/30 py-1 font-serif text-lg focus:outline-none focus:border-ink"
                />
              </div>
              <button 
                onClick={handleAddInterest}
                className="p-2 bg-ink text-paper rounded hover:bg-ink-light transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Specifics */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-typewriter uppercase text-ink-light tracking-wider border-b border-ink/5 pb-2">
              Specifics & Manifest Notes
            </label>
            <textarea 
              value={specifics}
              onChange={(e) => setSpecifics(e.target.value)}
              placeholder="Any dietary restrictions, accessibility needs, or specific landmarks you must see..."
              className="w-full bg-paper border-2 border-ink/10 rounded-lg p-4 font-sans text-sm h-24 focus:outline-none focus:border-ink transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleBuildTrip}
            disabled={!destination || loading}
            className="w-full bg-ink text-paper py-4 rounded-lg font-serif text-xl font-bold hover:bg-ink-light transition-all disabled:opacity-50 flex items-center justify-center space-x-3 shadow-lg hover:translate-y-[-2px]"
          >
            {loading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Consulting the Oracle...</span>
              </>
            ) : (
              <>
                <Compass size={24} />
                <span>Build My Trip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
