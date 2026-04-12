import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userProfile: any | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, userProfile: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch or create user profile in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            const newProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Traveler',
              email: currentUser.email || '',
              preferences: [],
              travel_miles: 0,
              visited_places: [],
              createdAt: serverTimestamp()
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
        }
      } else {
        // MOCK AUTH BYPASS FOR LOCAL DEVELOPMENT
        const mockUser = {
          uid: 'guest-123',
          displayName: 'Guest Traveler',
          email: 'guest@example.com',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky'
        };
        const mockProfile = {
          uid: 'guest-123',
          name: 'Guest Traveler',
          email: 'guest@example.com',
          preferences: ['Mountains', 'Museums', 'Street Food'],
          travel_miles: 1250,
          visited_places: ['Mumbai', 'Paris', 'Tokyo'],
          createdAt: new Date()
        };
        
        setUser(mockUser);
        setUserProfile(mockProfile);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
