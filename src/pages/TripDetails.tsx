import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, DollarSign, Clock, ArrowLeft, Image as ImageIcon, Ticket } from 'lucide-react';

export default function TripDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'scrapbook'>('itinerary');

  useEffect(() => {
    if (!user || !id) return;

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
  }, [user, id]);

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div></div>;
  }

  if (!trip) {
    return <div className="p-8 text-center font-serif text-xl">Trip not found.</div>;
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* Header */}
      <header className="bg-white border-b border-ink/10 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-paper rounded-full transition-colors">
              <ArrowLeft size={20} className="text-ink" />
            </button>
            <div>
              <h1 className="font-serif text-2xl font-bold text-ink">{trip.destination}</h1>
              <div className="flex items-center space-x-4 text-xs font-typewriter text-ink-light">
                <span className="uppercase bg-paper-dark px-2 py-0.5 rounded">{trip.status}</span>
                {trip.budget && <span>Budget: ${trip.budget}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('itinerary')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'itinerary' ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-paper-dark'}`}
            >
              Itinerary
            </button>
            <button 
              onClick={() => setActiveTab('scrapbook')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'scrapbook' ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-paper-dark'}`}
            >
              Scrapbook
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {activeTab === 'itinerary' ? (
          <div className="space-y-12">
            {/* Ticket Header */}
            <div className="bg-white border-2 border-ink border-dashed rounded-lg p-6 relative overflow-hidden">
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-paper rounded-full -translate-y-1/2 border-r-2 border-ink border-dashed"></div>
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-paper rounded-full -translate-y-1/2 border-l-2 border-ink border-dashed"></div>
              
              <div className="flex justify-between items-center border-b-2 border-ink pb-4 mb-4">
                <div className="font-serif text-3xl font-bold text-ink tracking-widest uppercase">BOARDING PASS</div>
                <Ticket size={32} className="text-stamp-red opacity-50" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs font-typewriter text-ink-light uppercase">Passenger</div>
                  <div className="font-bold font-sans text-lg">{user?.displayName || 'Traveler'}</div>
                </div>
                <div>
                  <div className="text-xs font-typewriter text-ink-light uppercase">Destination</div>
                  <div className="font-bold font-sans text-lg">{trip.destination}</div>
                </div>
                <div>
                  <div className="text-xs font-typewriter text-ink-light uppercase">Class</div>
                  <div className="font-bold font-sans text-lg">First Class</div>
                </div>
                <div>
                  <div className="text-xs font-typewriter text-ink-light uppercase">Status</div>
                  <div className="font-bold font-sans text-lg text-stamp-blue uppercase">{trip.status}</div>
                </div>
              </div>
            </div>

            {/* Days */}
            {itinerary?.days?.map((day: any, idx: number) => (
              <div key={idx} className="relative pl-8 md:pl-0">
                {/* Timeline line */}
                <div className="absolute left-[15px] md:left-[50%] top-0 bottom-0 w-px bg-ink/20 -translate-x-1/2"></div>
                
                <div className="md:flex items-center justify-center mb-8 relative z-10">
                  <div className="bg-ink text-paper font-serif font-bold px-6 py-2 rounded-full border-4 border-paper shadow-sm inline-block">
                    Day {day.day}: {day.theme}
                  </div>
                </div>

                <div className="space-y-6">
                  {day.activities?.map((activity: any, actIdx: number) => (
                    <div key={actIdx} className={`md:w-1/2 ${actIdx % 2 === 0 ? 'md:pr-12 md:ml-0' : 'md:pl-12 md:ml-auto'} relative`}>
                      {/* Timeline dot */}
                      <div className="absolute left-[-33px] md:left-auto md:right-[-6px] top-6 w-3 h-3 bg-stamp-red rounded-full border-2 border-paper z-10 shadow-sm"></div>
                      
                      <div className="bg-white p-6 rounded-lg border border-ink/10 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-serif text-xl font-bold text-ink">{activity.place}</h3>
                          <span className="text-xs font-typewriter bg-paper-dark px-2 py-1 rounded text-ink-light flex items-center">
                            <Clock size={12} className="mr-1" />
                            {activity.time}
                          </span>
                        </div>
                        <p className="text-ink-light text-sm mb-4">{activity.description}</p>
                        <div className="inline-block text-xs font-typewriter text-stamp-blue border border-stamp-blue/30 px-2 py-1 rounded uppercase">
                          {activity.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white min-h-[600px] border border-ink/10 shadow-xl rounded-sm p-8 relative texture-paper">
            {/* Scrapbook styling */}
            <div className="absolute top-4 left-4 w-12 h-4 bg-ink/10 transform -rotate-6"></div>
            <div className="absolute top-4 right-4 w-12 h-4 bg-ink/10 transform rotate-3"></div>
            
            <h2 className="font-serif text-4xl font-bold text-ink text-center mb-12 border-b-2 border-ink pb-4 inline-block mx-auto w-full">
              Memories of {trip.destination}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Placeholder for photos */}
              <div className="bg-paper-dark p-4 pb-12 transform -rotate-2 shadow-md border border-ink/5 relative">
                <div className="aspect-video bg-ink/5 flex items-center justify-center mb-4 border border-ink/10 border-dashed">
                  <ImageIcon size={32} className="text-ink/30" />
                </div>
                <p className="font-typewriter text-ink text-center text-sm">Add a photo...</p>
                <div className="absolute bottom-2 right-2 stamp-effect text-stamp-red border-stamp-red text-xs transform rotate-12">
                  {trip.destination.substring(0, 3).toUpperCase()}
                </div>
              </div>

              {/* Placeholder for notes */}
              <div className="bg-[#fdfbf7] p-6 shadow-sm border border-ink/10 relative torn-edge">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-20 pointer-events-none"></div>
                <h3 className="font-serif text-xl font-bold mb-4 text-ink">Journal Entry</h3>
                <textarea 
                  className="w-full h-48 bg-transparent border-none focus:ring-0 resize-none font-sans text-ink leading-relaxed"
                  placeholder="Write about your experiences here..."
                ></textarea>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
