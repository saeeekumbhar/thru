import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, Clock, ArrowLeft, Ticket, 
  Trash2, Plus, Save, ExternalLink, 
  Hotel, Utensils, Compass, Bus 
} from 'lucide-react';
import { OptionCard } from '../components/ui/OptionCard';
import { getCurrency } from '../lib/utils';

export default function TripDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchTrip = async () => {
      try {
        const docRef = doc(db, 'trips', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTrip({ id: docSnap.id, ...data });
          if (data.itinerary) {
            setItinerary(JSON.parse(data.itinerary));
          }
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleSavePlan = async () => {
    if (!id || !itinerary) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'trips', id);
      await updateDoc(docRef, {
        itinerary: JSON.stringify(itinerary)
      });
    } catch (error) {
      console.error("Error saving trip:", error);
    } finally {
      setSaving(false);
    }
  };

  const removeActivity = (dayIdx: number, actIdx: number) => {
    const updated = { ...itinerary };
    updated.days[dayIdx].activities.splice(actIdx, 1);
    setItinerary(updated);
  };

  const addOptionToPlan = (type: string, option: any) => {
    const updated = { ...itinerary };
    // Simple logic: add to the first day or based on type
    const newActivity = {
      time: "Evening",
      place: option.title,
      description: `Added from recommendations: ${option.tags?.join(', ') || ''}`,
      type: type === 'stays' ? 'accommodation' : (type === 'food' ? 'food' : 'sightseeing')
    };
    updated.days[0].activities.push(newActivity);
    setItinerary(updated);
  };

  if (loading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink"></div>
    </div>;
  }

  if (!trip) return <div className="p-8 text-center font-serif text-xl">Expedition not found.</div>;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Top Header & Summary Bar */}
      <header className="bg-white border-b border-ink/10 sticky top-0 z-40 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-paper rounded-full transition-colors">
              <ArrowLeft size={20} className="text-ink" />
            </button>
            <div>
              <h1 className="font-serif text-2xl font-bold text-ink">{itinerary?.title || trip.destination}</h1>
              <p className="text-xs font-typewriter text-ink-light uppercase tracking-widest">Digital Manifest {id?.substring(0, 6)}</p>
            </div>
          </div>

          {/* Summary Bar Metrics */}
          <div className="flex items-center space-x-6 bg-paper-dark/30 px-6 py-3 rounded-lg border border-ink/5">
            <div className="text-center">
              <p className="text-[10px] font-typewriter uppercase text-ink-light opacity-60">Estimated Cost</p>
              <p className="font-serif font-bold text-ink">{itinerary?.summary?.totalCost || `${trip.currency || getCurrency(trip.destination)}${trip.budget || 0}`}</p>
            </div>
            <div className="w-px h-8 bg-ink/10"></div>
            <div className="text-center">
              <p className="text-[10px] font-typewriter uppercase text-ink-light opacity-60">Travel Time</p>
              <p className="font-serif font-bold text-ink">{itinerary?.summary?.travelTime || '8h 20m'}</p>
            </div>
            <div className="w-px h-8 bg-ink/10"></div>
            <div className="hidden lg:block">
              <p className="text-[10px] font-typewriter uppercase text-ink-light opacity-60">Highlights</p>
              <div className="flex space-x-2 mt-1">
                {itinerary?.summary?.highlights?.map((h: string, i: number) => (
                  <span key={i} className="text-[9px] bg-ink text-paper px-1.5 py-0.5 rounded uppercase">{h}</span>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSavePlan}
            disabled={saving}
            className="flex items-center space-x-2 bg-stamp-red text-white px-6 py-2 rounded font-medium hover:bg-opacity-90 transition-all shadow-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Plan</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Itinerary Timeline */}
        <div className="flex-1 space-y-12">
          {itinerary?.days?.map((day: any, dayIdx: number) => (
            <div key={dayIdx} className="relative pl-6 border-l-2 border-ink/10 space-y-6">
              <div className="absolute -left-[11px] top-0 w-5 h-5 bg-ink text-paper rounded-full flex items-center justify-center text-[10px] font-bold">
                {day.day}
              </div>
              
              <div className="mb-4">
                <h2 className="font-serif text-2xl font-bold text-ink inline-block border-b-2 border-stamp-blue">
                  Day {day.day}: {day.theme}
                </h2>
              </div>

              <div className="space-y-4">
                {day.activities?.map((activity: any, actIdx: number) => (
                  <div key={actIdx} className="group bg-white p-5 rounded-lg border border-ink/10 shadow-sm hover:shadow-md transition-all relative">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-lg font-bold text-ink">{activity.place}</h3>
                      <div className="flex items-center space-x-3">
                         <span className="text-[10px] font-typewriter bg-paper-dark px-2 py-1 rounded text-ink-light flex items-center">
                          <Clock size={10} className="mr-1" /> {activity.time}
                        </span>
                        <button 
                          onClick={() => removeActivity(dayIdx, actIdx)}
                          className="text-ink/10 group-hover:text-stamp-red transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-ink-light text-sm line-clamp-2 md:line-clamp-none">{activity.description}</p>
                    <div className="mt-4 flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-typewriter text-stamp-blue border border-stamp-blue/30 px-2 py-0.5 rounded">
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 border-2 border-dashed border-ink/10 rounded-lg text-ink-light hover:border-ink/30 hover:bg-white transition-all flex items-center justify-center space-x-2 text-sm font-typewriter">
                  <Plus size={16} />
                  <span>Insert Activity</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Map Panel (Placeholder for now) */}
        <div className="lg:w-[400px] h-fit sticky top-28 space-y-6">
          <div className="bg-paper-dark h-[500px] rounded-lg border border-ink/20 relative overflow-hidden shadow-inner group">
            {/* Fake Map Grid */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10"></div>
            <div className="absolute inset-0 flex flex-col">
              {[...Array(10)].map((_, i) => <div key={i} className="flex-1 border-b border-ink/5 flex">
                {[...Array(8)].map((_, j) => <div key={j} className="flex-1 border-r border-ink/5"></div>)}
              </div>)}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center text-center p-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border border-ink/10 shadow-xl max-w-[250px]">
                <MapPin size={32} className="mx-auto text-stamp-red mb-3" />
                <h3 className="font-serif font-bold text-ink mb-2">Interactive Map</h3>
                <p className="text-xs text-ink-light leading-relaxed">Locations for <b>{trip.destination}</b> are being plotted on your chart.</p>
                <button className="mt-4 text-[10px] font-typewriter uppercase tracking-widest text-stamp-blue border-b border-stamp-blue/30 pb-0.5 hover:border-stamp-blue transition-all">
                  Switch to Google Maps
                </button>
              </div>
            </div>

            {/* Floating Zoom controls */}
            <div className="absolute bottom-4 right-4 flex flex-col space-y-1">
              <button className="w-8 h-8 bg-white border border-ink/10 rounded shadow-sm flex items-center justify-center text-lg font-bold">+</button>
              <button className="w-8 h-8 bg-white border border-ink/10 rounded shadow-sm flex items-center justify-center text-lg font-bold">-</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-ink/10">
            <h4 className="font-serif font-bold text-sm text-ink mb-3 flex items-center">
              <Compass size={14} className="mr-2 text-stamp-blue" />
              Navigation Insight
            </h4>
            <div className="bg-paper p-3 rounded text-xs font-serif italic text-ink-light leading-relaxed">
              "Travel between sites in {trip.destination} is mostly efficient via local transit. Day 2 requires an early start for optimal lighting."
            </div>
          </div>
        </div>
      </main>

      {/* Options Cards Section Below */}
      <section className="bg-white border-t border-ink/10 py-12 px-4 md:px-8 mt-12 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center">
            <div className="inline-block bg-mustard/20 text-mustard border border-mustard/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Smart Suggestions
            </div>
            <h2 className="font-serif text-3xl font-bold text-ink italic">Refine Your Expedition</h2>
          </div>

          {/* Stay Options */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-ink text-paper rounded"><Hotel size={18} /></div>
              <h3 className="font-serif text-xl font-bold text-ink underline decoration-ink/10 underline-offset-8">Selected Stays</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {itinerary?.options?.stays?.map((opt: any, i: number) => (
                <OptionCard 
                  key={i} 
                  type="stay" 
                  title={opt.title} 
                  price={opt.price} 
                  rating={opt.rating} 
                  tags={opt.tags}
                  onSelect={() => addOptionToPlan('stays', opt)}
                />
              ))}
            </div>
          </div>

          {/* Food Options */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-ink text-paper rounded"><Utensils size={18} /></div>
              <h3 className="font-serif text-xl font-bold text-ink underline decoration-ink/10 underline-offset-8">Local Dining</h3>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {itinerary?.options?.food?.map((opt: any, i: number) => (
                <OptionCard 
                  key={i} 
                  type="food" 
                  title={opt.title} 
                  price={opt.price} 
                  rating={opt.rating} 
                  tags={opt.tags}
                  onSelect={() => addOptionToPlan('food', opt)}
                />
              ))}
            </div>
          </div>

          {/* Transport */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-ink text-paper rounded"><Bus size={18} /></div>
              <h3 className="font-serif text-xl font-bold text-ink underline decoration-ink/10 underline-offset-8">Transport Routes</h3>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {itinerary?.options?.transport?.map((opt: any, i: number) => (
                <OptionCard 
                  key={i} 
                  type="transport" 
                  title={opt.title} 
                  price={opt.price} 
                  rating={opt.rating} 
                  tags={opt.tags}
                  onSelect={() => addOptionToPlan('transport', opt)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Loader2({ size, className }: { size: number, className: string }) {
  return <div className={`w-${size} h-${size} ${className}`}>...</div>;
}
