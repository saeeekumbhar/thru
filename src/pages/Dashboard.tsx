import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Calendar, Plus, ArrowRight, Compass, User } from 'lucide-react';
import { format } from 'date-fns';
import { getCurrency } from '../lib/utils';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTrips = async () => {
      try {
        const q = query(
          collection(db, 'trips'),
          where('user_id', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrips(tripsData);
      } catch (error) {
        console.error("Error fetching trips:", error);
        // Fallback to dummy data for development/bypass
        if (user.uid.startsWith('guest-')) {
          setTrips([
            {
              id: 'sample-1',
              destination: 'Iceland',
              startDate: new Date(Date.now() - 3600000 * 24 * 30),
              status: 'Completed',
              budget: 2500,
              currency: '$'
            },
            {
              id: 'sample-2',
              destination: 'Mumbai, India',
              status: 'Planning',
              budget: 45000,
              currency: '₹'
            },
            {
              id: 'sample-3',
              destination: 'Kyoto',
              status: 'Exploring',
              budget: 1800,
              currency: '¥'
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <p className="font-typewriter text-ink-light mb-2">Welcome back,</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink">
            {userProfile?.name || 'Traveler'}
          </h1>
        </div>
        <div className="hidden md:block stamp-effect text-stamp-blue border-stamp-blue">
          {format(new Date(), 'dd MMM yyyy').toUpperCase()}
        </div>
      </header>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl font-bold text-ink">Your Journeys</h2>
          <button 
            onClick={() => navigate('/planner')}
            className="flex items-center space-x-2 text-sm font-medium bg-ink text-paper px-4 py-2 rounded hover:bg-ink-light transition-colors"
          >
            <Plus size={16} />
            <span>New Trip</span>
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="bg-paper-dark h-48 w-full md:w-1/3 rounded-lg"></div>
            <div className="bg-paper-dark h-48 w-full md:w-1/3 rounded-lg hidden md:block"></div>
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div 
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="bg-white p-6 rounded-lg shadow-sm border border-ink/10 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Vintage Ticket styling elements */}
                <div className="absolute top-0 left-0 w-2 h-full bg-stamp-red"></div>
                <div className="absolute top-4 -right-2 w-4 h-4 rounded-full bg-paper"></div>
                <div className="absolute bottom-4 -right-2 w-4 h-4 rounded-full bg-paper"></div>
                
                <div className="pl-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-paper-dark px-2 py-1 rounded text-xs font-typewriter uppercase text-ink-light">
                      {trip.status}
                    </div>
                    <ArrowRight size={16} className="text-ink-light group-hover:text-ink transition-colors" />
                  </div>
                  
                  <h3 className="font-serif text-2xl font-bold text-ink mb-2">{trip.destination}</h3>
                  
                  <div className="flex items-center text-ink-light text-sm mb-2">
                    <Calendar size={14} className="mr-2" />
                    <span>
                      {trip.startDate ? format(new Date(trip.startDate), 'MMM d, yyyy') : 'Dates TBD'}
                    </span>
                  </div>
                  
                  {trip.budget && (
                    <div className="mt-4 pt-4 border-t border-ink/10 border-dashed flex justify-between items-center">
                      <span className="text-xs text-ink-light uppercase tracking-wider">Budget</span>
                      <span className="font-typewriter font-bold">{trip.currency || getCurrency(trip.destination)}{trip.budget}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-paper-dark border border-ink/10 border-dashed rounded-lg p-12 text-center">
            <Compass size={48} className="mx-auto text-ink-light mb-4 opacity-50" />
            <h3 className="font-serif text-xl font-bold text-ink mb-2">No journeys yet</h3>
            <p className="text-ink-light mb-6">Your passport is waiting for its first stamp.</p>
            <button 
              onClick={() => navigate('/planner')}
              className="bg-ink text-paper px-6 py-2 rounded font-medium hover:bg-ink-light transition-colors"
            >
              Plan a Trip
            </button>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">Travel Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-ink/10 text-center">
            <div className="text-3xl font-serif font-bold text-stamp-blue mb-1">
              {userProfile?.visited_places?.length || 0}
            </div>
            <div className="text-xs font-typewriter text-ink-light uppercase tracking-wider">Places Visited</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-ink/10 text-center">
            <div className="text-3xl font-serif font-bold text-stamp-red mb-1">
              {trips.length}
            </div>
            <div className="text-xs font-typewriter text-ink-light uppercase tracking-wider">Total Trips</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-ink/10 text-center">
            <div className="text-3xl font-serif font-bold text-mustard mb-1">
              {userProfile?.travel_miles || 0}
            </div>
            <div className="text-xs font-typewriter text-ink-light uppercase tracking-wider">Travel Miles</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-ink/10 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-paper-dark transition-colors" onClick={() => navigate('/passport')}>
            <User size={24} className="text-ink mb-2" />
            <div className="text-xs font-typewriter text-ink uppercase tracking-wider">View Passport</div>
          </div>
        </div>
      </section>
    </div>
  );
}
