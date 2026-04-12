import { useAuth } from '../contexts/AuthContext';
import { Award, Map, User } from 'lucide-react';

export default function Passport() {
  const { user, userProfile } = useAuth();

  // Mock stamps for visual effect
  const stamps = [
    { country: 'JAPAN', date: '12 OCT 2025', color: 'text-stamp-red border-stamp-red', rotate: '-rotate-6' },
    { country: 'FRANCE', date: '05 MAY 2024', color: 'text-stamp-blue border-stamp-blue', rotate: 'rotate-3' },
    { country: 'ITALY', date: '18 AUG 2023', color: 'text-ink border-ink', rotate: '-rotate-2' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen flex items-center justify-center">
      
      {/* Passport Booklet */}
      <div className="w-full bg-[#1a2b4c] rounded-r-3xl rounded-l-md shadow-2xl p-2 md:p-4 flex relative overflow-hidden">
        {/* Spine */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-black/20 shadow-inner"></div>
        
        {/* Pages Container */}
        <div className="flex-1 bg-paper rounded-r-2xl rounded-l-sm shadow-inner flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Page Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
          
          {/* Left Page (Profile) */}
          <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-ink/10 relative">
            <div className="text-center mb-8 border-b-2 border-ink pb-4">
              <h2 className="font-serif text-2xl font-bold tracking-widest uppercase text-ink">Passport</h2>
              <p className="font-typewriter text-xs text-ink-light">THRU TRAVEL SYSTEM</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Photo placeholder */}
              <div className="w-32 h-40 bg-paper-dark border-2 border-ink/20 p-2 transform -rotate-2 relative">
                <div className="w-full h-full bg-ink/5 flex items-center justify-center">
                  <User size={48} className="text-ink/20" />
                </div>
                <div className="absolute -bottom-3 -right-3 stamp-effect text-stamp-blue border-stamp-blue text-[10px] transform rotate-12">
                  OFFICIAL
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <div className="text-[10px] font-typewriter text-ink-light uppercase">Surname / Given Name</div>
                  <div className="font-serif font-bold text-xl uppercase">{userProfile?.name || 'Traveler'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-typewriter text-ink-light uppercase">Nationality</div>
                  <div className="font-serif font-bold text-lg uppercase">Global Citizen</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-typewriter text-ink-light uppercase">Date of Issue</div>
                    <div className="font-typewriter font-bold text-sm">
                      {userProfile?.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'TODAY'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-typewriter text-ink-light uppercase">Authority</div>
                    <div className="font-typewriter font-bold text-sm">THRU AI</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Machine Readable Zone */}
            <div className="mt-12 font-typewriter text-sm tracking-widest text-ink break-all opacity-80">
              P&lt;GLOB{userProfile?.name?.replace(/\s/g, '&lt;').toUpperCase() || 'TRAVELER'}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br/>
              {user?.uid?.substring(0, 9).toUpperCase() || '123456789'}0GLOB8501010M3012319&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;08
            </div>
          </div>

          {/* Right Page (Stamps & Visas) */}
          <div className="flex-1 p-6 md:p-8 relative min-h-[400px]">
            <div className="text-center mb-6 opacity-30">
              <h2 className="font-serif text-xl font-bold tracking-widest uppercase text-ink">Visas</h2>
            </div>

            <div className="relative h-full w-full">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-4 opacity-10 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border border-ink border-dashed rounded"></div>
                ))}
              </div>

              {/* Stamps */}
              {stamps.map((stamp, idx) => (
                <div 
                  key={idx} 
                  className={`absolute stamp-effect ${stamp.color} ${stamp.rotate} p-4 border-4 rounded-full w-32 h-32 flex flex-col items-center justify-center text-center`}
                  style={{
                    top: `${10 + (idx * 25)}%`,
                    left: `${10 + (idx % 2 === 0 ? 0 : 40)}%`,
                  }}
                >
                  <div className="text-xs tracking-widest mb-1">ARRIVAL</div>
                  <div className="font-bold text-lg leading-none mb-1">{stamp.country}</div>
                  <div className="text-[10px] border-t border-current pt-1 w-full">{stamp.date}</div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
