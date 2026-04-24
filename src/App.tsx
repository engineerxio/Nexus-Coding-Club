import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'motion/react';
import { 
  ArrowRight, 
  ChevronDown, 
  Code, 
  Cpu, 
  Rocket, 
  Facebook, 
  Linkedin, 
  Mail, 
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  User as UserIcon,
  Image as ImageIcon,
  ArrowUpRight
} from 'lucide-react';
import { MatrixRain } from './components/MatrixRain';
import { NeuralOrb } from './components/NeuralOrb';
import { Terminal } from './components/Terminal';
import { Navbar, Drawer } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { AmbassadorsPage } from './components/AmbassadorsPage';
import { HeroSkeleton } from './components/Skeleton';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User } from './types';
import { auth, db } from './lib/firebase';
import { generateNexusId, getStableNexusId } from './lib/idGenerator';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, setDoc } from 'firebase/firestore';

const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export default function App() {
  const [isDark, setIsDark] = useLocalStorage('nexus_theme', true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('nexus_current_user', null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAmbassadorsPageOpen, setIsAmbassadorsPageOpen] = useState(false);
  const [registeredMembers, setRegisteredMembers] = useState<User[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        
        let nexusId = userData?.nexusId;
        
        // Ensure every user has a unique short Nexus ID
        if (!nexusId) {
          nexusId = generateNexusId();
          // Check for collision (optional but good)
          const membersSnapshot = await getDocs(collection(db, 'users'));
          const existingIds = membersSnapshot.docs.map(d => d.data().nexusId);
          while (existingIds.includes(nexusId)) {
            nexusId = generateNexusId();
          }

          if (userDoc.exists()) {
            await updateDoc(userRef, { nexusId });
          } else {
            // This case handles external providers on first login if setDoc hasn't run yet
            await setDoc(userRef, {
              fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Nexus Member',
              email: fbUser.email || '',
              institute: 'Nexus Member',
              gender: 'Other',
              joinDate: new Date().toLocaleDateString(),
              nexusId
            });
          }
        }
        
        const user: User = {
          id: fbUser.uid,
          nexusId: nexusId,
          fullName: userData?.fullName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Nexus Member',
          email: fbUser.email || '',
          institute: userData?.institute || 'Nexus Member',
          gender: userData?.gender || 'Other',
          joinDate: userData?.joinDate || new Date().toLocaleDateString()
        };
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsAuthModalOpen(false);
        setIsDashboardOpen(false);
        setIsAmbassadorsPageOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const members: User[] = [];
        querySnapshot.forEach((doc) => {
          members.push({ id: doc.id, ...doc.data() } as User);
        });
        setRegisteredMembers(members);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchMembers();
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setIsDashboardOpen(true);
  };

  const handleRegister = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setIsDashboardOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsDashboardOpen(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-nexus-navy text-white' : 'bg-[#f0f6ff] text-nexus-navy'} selection:bg-nexus-indigo selection:text-white`}>
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-nexus-indigo z-[100] origin-left" style={{ scaleX }} />
      
      <Navbar 
        isDark={isDark} 
        toggleTheme={() => setIsDark(!isDark)} 
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onLoginClick={() => setIsAuthModalOpen(true)}
        isLoggedIn={!!currentUser}
        onDashboardClick={() => setIsDashboardOpen(true)}
      />

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onRegisterClick={() => setIsAuthModalOpen(true)}
        isLoggedIn={!!currentUser}
        onDashboardClick={() => setIsDashboardOpen(true)}
        isDark={isDark}
        onOpenAmbassadors={() => setIsAmbassadorsPageOpen(true)}
      />

      <AmbassadorsPage 
        isOpen={isAmbassadorsPageOpen} 
        onClose={() => setIsAmbassadorsPageOpen(false)} 
        isDark={isDark}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        isDark={isDark}
      />

      <AnimatePresence>
        {isDashboardOpen && currentUser && (
          <Dashboard 
            user={currentUser} 
            onLogout={handleLogout} 
            onClose={() => setIsDashboardOpen(false)} 
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-0">
        <MatrixRain color={isDark ? '#6366f1' : '#818cf8'} isDark={isDark} />
        
        {isInitialLoading ? (
          <HeroSkeleton />
        ) : (
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 py-12 lg:py-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              {/* Badge moved inside flow for better mobile layout */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-nexus-indigo/30 mb-8 mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-nexus-indigo animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-nexus-indigo uppercase">✦ Est. 2026 · Programming Enthusiasts</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
                Where Humans <br />
                <span className="text-nexus-indigo">Meet Machines</span> <br />
                to Build Tomorrow.
              </h1>
              
              <p className="text-base sm:text-lg text-nexus-navy/60 dark:text-white/60 mb-10 max-w-lg mx-auto lg:mx-0">
                Join the leading community of developers, designers, and tech enthusiasts in Bangladesh. We push the boundaries of what's possible.
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-nexus-indigo to-nexus-violet text-white font-bold hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-2 group"
                >
                  Join the Club <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#about"
                  className="px-8 py-4 rounded-xl glass border-white/10 text-white font-bold hover:bg-white/5 transition-all transform hover:-translate-y-1"
                >
                  Explore More
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="hidden lg:block"
            >
              <NeuralOrb />
            </motion.div>
          </div>
        )}

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] font-mono uppercase tracking-widest">Scroll to explore</span>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-5 h-8 rounded-full border border-white/30 flex justify-center p-1"
          >
            <div className="w-1 h-1 bg-white rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">More Than Just a Club.</h2>
                <p className="text-white/60 max-w-xl">
                  Nexus Coding Club is a hub for innovation and collaboration. We provide the resources, mentorship, and community you need to excel in the world of technology.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { title: 'Competitive Programming', icon: Code, desc: 'Master algorithms and data structures to dominate in national and international contests.' },
                  { title: 'AI & Machine Learning', icon: Cpu, desc: 'Explore the future of intelligence through hands-on projects and expert-led workshops.' },
                  { title: 'Hackathons & Projects', icon: Rocket, desc: 'Build real-world solutions and showcase your skills in high-stakes coding marathons.' }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="p-6 glass rounded-2xl border-white/5 hover:border-nexus-indigo/30 transition-all flex gap-6 group"
                  >
                    <div className="p-4 rounded-xl bg-nexus-indigo/10 text-nexus-indigo group-hover:bg-nexus-indigo group-hover:text-white transition-colors">
                      <feature.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-nexus-navy/40 dark:text-white/40">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-nexus-indigo/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
          {[
            { label: 'Active Members', value: 20 + registeredMembers.length, suffix: '+' },
            { label: 'Expert Mentors', value: 5, suffix: '+' },
            { label: 'Events Hosted', value: 0, suffix: '', isComingSoon: true },
            { label: 'Contest Wins', value: 0, suffix: '', isComingSoon: true },
            { label: 'Projects Launched', value: 0, suffix: '', isComingSoon: true },
            { label: 'Years Running', value: 1, suffix: '' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="text-4xl font-bold text-nexus-indigo">
                {stat.isComingSoon ? (
                  <span className="text-lg uppercase tracking-tighter opacity-50">Coming Soon</span>
                ) : (
                  <CountUp end={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-xs text-nexus-navy/40 dark:text-white/40 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-4">Events</h2>
              <p className="text-nexus-navy/60 dark:text-white/60">Stay tuned for our upcoming workshops, contests, and meetups.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl overflow-hidden glass border-white/5 shadow-xl"
            >
              <div className="aspect-square bg-black/40 overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/d/1KoLg7b9gfx1i1OBIONTMqZlyeqD_lqrm" 
                  alt="Nexus Intellect Clash"
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-nexus-navy via-nexus-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 text-left">
                <div className="bg-nexus-navy/90 backdrop-blur-md p-4 rounded-xl border border-white/10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-nexus-indigo transition-colors uppercase tracking-tight">Nexus Intellect Clash</h4>
                  <p className="text-nexus-cyan font-medium text-[10px] mb-2 leading-tight">The Olympiad of Complex Thinkers</p>
                  <div className="flex items-center gap-2 text-white/70 text-[10px] font-mono">
                    <Calendar size={12} className="text-nexus-indigo" />
                    <span>24 April - 27 May</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Coming Soon placeholder */}
            <div className="aspect-square p-6 glass rounded-2xl border-white/5 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-12 h-12 bg-nexus-indigo/10 rounded-full flex items-center justify-center text-nexus-indigo mb-4">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">More Events Soon</h3>
              <p className="text-xs text-nexus-navy/40 dark:text-white/40">We are planning more exciting competitions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">Captured Moments</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative aspect-video rounded-3xl overflow-hidden glass border-white/5"
            >
              <img 
                src="https://lh3.googleusercontent.com/d/1881PfQp7e-64muTwpTKFY9m0Pme5l0Eo" 
                alt="Nexus Core Team Meeting"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nexus-navy via-nexus-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 text-left">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="text-lg font-bold text-white mb-2 leading-tight">Strategic Leadership Convergence</h4>
                  <p className="text-nexus-cyan text-[10px] uppercase tracking-widest font-bold">The Nexus Core Leadership Team defining vision and operational objectives for upcoming flagship initiatives.</p>
                </div>
              </div>
            </motion.div>

            {/* Placeholder for more moments */}
            <div className="aspect-video glass rounded-3xl border-white/5 flex flex-col items-center justify-center text-center opacity-40">
              <ImageIcon size={32} className="text-nexus-indigo mb-4" />
              <p className="text-xs uppercase tracking-widest font-bold">More Moments Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">The Minds Behind Nexus</h2>
            <p className="text-nexus-navy/60 dark:text-white/60">Meet the visionaries leading our community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24 max-w-4xl mx-auto">
            {[
              { 
                name: 'Osrat Nower Tasnia', 
                role: 'Founder & President',
                bio: 'Passionate programmer and community builder. President of Nexus Coding Club. Leads day-to-day operations, coordinates events, and manages member engagement.'
              },
              { 
                name: 'S M Tanjimul Hoque Tajim', 
                role: 'Co-Founder & VP',
                bio: 'Tech enthusiast and competitive programmer. Established the club’s foundation, vision, and strategy, and oversees its programs, workshops, and contests.'
              }
            ].map((leader, i) => (
              <div key={i} className="glass p-8 rounded-3xl border-white/5 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nexus-indigo to-nexus-violet" />
                <div className="w-24 h-24 rounded-full bg-nexus-indigo/20 mx-auto mb-6 flex items-center justify-center text-nexus-indigo text-3xl font-bold group-hover:scale-110 transition-transform">
                  {leader.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold mb-1">{leader.name}</h3>
                <div className="text-nexus-cyan font-medium text-sm mb-4">{leader.role}</div>
                <p className="text-xs text-nexus-navy/60 dark:text-white/60 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>

          <div className="mb-24">
            <h3 className="text-xl font-bold mb-12 text-center text-nexus-navy/40 dark:text-white/40 uppercase tracking-[0.3em]">Advisors & Mentors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
              {[
                'Osrat Nower Tasnia', 
                'S M Tanjimul Hoque Tajim', 
                'Karim Uddin', 
                'Sabrina Islam', 
                'Tanvir Ahmed', 
                'Farhan Hossain', 
                'Mentor 5'
              ].map((name, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-nexus-indigo/5 dark:bg-white/5 mx-auto mb-4 flex items-center justify-center text-nexus-navy/40 dark:text-white/40 font-bold">
                    {name.charAt(0)}
                  </div>
                  <div className="font-bold text-sm">{name}</div>
                  <div className="text-[10px] text-nexus-navy/20 dark:text-white/20 uppercase">Mentor</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-24">
            <h3 className="text-xl font-bold mb-12 text-center text-nexus-navy/40 dark:text-white/40 uppercase tracking-[0.3em]">Campus Ambassadors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                {
                  name: "Ishrat Jahan Rupsha",
                  nexusId: "NXS-A4R2",
                  institute: "BGC Trust University",
                  bio: "Passionate about tech and community building. Representing Nexus at BGC Trust University.",
                  email: "rupsha619@gmail.com",
                  image: "https://lh3.googleusercontent.com/d/1KyB6HFh-jpI_S0oEeFME2H0veXjUriIi"
                },
                {
                  name: "MD. Mahadi Hasan Fahim",
                  nexusId: "NXS-K9L5",
                  institute: "International Islamic University Chittagong",
                  bio: "Competitive programmer and tech enthusiast. Leading the Nexus wave at IIUC.",
                  email: "immahadihasanfahim@gmail.com",
                  image: "https://lh3.googleusercontent.com/d/1p6ExAOFusUuyKRgMnOl1fpivqjbwh0nD"
                },
                {
                  name: "Aksa Arshad",
                  nexusId: "NXS-M2P7",
                  institute: "Al hidaayah International school",
                  bio: "Community lead and tech enthusiast. Bringing creative minds together at Al hidaayah International school.",
                  email: "aksaarshad45@gmail.com",
                  image: "https://lh3.googleusercontent.com/d/1eNeRP7fvEwD2gmCBVOlo7pTWA7aZgO52"
                }
              ].map((ambassador, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden glass border-white/5"
                >
                  <img 
                    src={ambassador.image} 
                    alt={ambassador.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nexus-navy via-nexus-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 text-left">
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-lg font-bold text-white group-hover:text-nexus-indigo transition-colors">{ambassador.name}</h4>
                        <span className="text-[8px] text-nexus-indigo font-mono bg-nexus-indigo/20 px-1 py-0.5 rounded border border-nexus-indigo/30">
                          {ambassador.nexusId}
                        </span>
                      </div>
                      <p className="text-nexus-cyan font-mono text-[10px] mb-2 uppercase tracking-wider font-bold">{ambassador.institute}</p>
                      <p className="text-white/70 text-[10px] leading-relaxed line-clamp-2 mb-2">{ambassador.bio}</p>
                      {'email' in ambassador && (
                        <p className="text-nexus-indigo text-[9px] font-mono">{ambassador.email}</p>
                      )}
                    </motion.div>
                  </div>
                  {/* Default indicator */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity">
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-white font-bold text-center text-xs">{ambassador.name}</p>
                      <span className="text-[8px] text-nexus-indigo font-mono bg-nexus-indigo/20 px-1 py-0.5 rounded border border-nexus-indigo/30">
                        {ambassador.nexusId}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* See More Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                onClick={() => setIsAmbassadorsPageOpen(true)}
                className="group relative aspect-square rounded-2xl overflow-hidden glass border-nexus-indigo/20 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-nexus-indigo/50 transition-all bg-nexus-indigo/5"
              >
                <div className="w-12 h-12 rounded-xl bg-nexus-indigo/10 flex items-center justify-center text-nexus-indigo mb-4 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-nexus-indigo/20">
                  <ArrowRight size={24} />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">See More</h4>
                <p className="text-white/60 dark:text-white/40 text-[10px] leading-tight">Explore our full network of ambassadors.</p>
                <div className="absolute inset-0 bg-nexus-indigo/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
          </div>

          <div id="members">
            <h3 className="text-xl font-bold mb-12 text-center text-nexus-navy/40 dark:text-white/40 uppercase tracking-[0.3em]">Registered Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredMembers.length > 0 ? (
                registeredMembers.map((member, i) => (
                  <div key={i} className="glass p-6 rounded-2xl border-white/5 flex items-center gap-4 relative group overflow-hidden">
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="text-[7px] font-bold text-nexus-indigo/60 uppercase tracking-tighter">Nexus ID</span>
                      <span className="text-[9px] text-nexus-indigo font-mono bg-nexus-indigo/5 px-2 py-0.5 rounded-full border border-nexus-indigo/10">
                        {member.nexusId || getStableNexusId(member.id)}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-nexus-indigo/10 flex items-center justify-center text-nexus-indigo font-bold shrink-0">
                      {member.fullName.charAt(0)}
                    </div>
                    <div className="pr-12">
                      <div className="font-bold text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                        {member.fullName}
                      </div>
                      <div className="text-[10px] text-nexus-navy/40 dark:text-white/40">{member.institute}</div>
                      <div className="text-[10px] text-nexus-cyan mt-1">{member.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 glass rounded-2xl border-white/5 text-white/20 italic">
                  No members registered yet. Be the first to join!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section id="connect" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-nexus-navy'}`}>
              Connect with <span className="text-nexus-indigo text-glow">Nexus</span>
            </h2>
            <p className={`max-w-2xl mx-auto text-lg ${isDark ? 'text-white/60' : 'text-nexus-navy/60'}`}>
              Join our growing community of developers and innovators. Stay updated with our latest events, projects, and opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                name: 'Facebook', 
                icon: Facebook, 
                label: 'Community Group', 
                href: 'https://www.facebook.com/nexuscodingclub',
                displayLink: 'facebook.com/nexuscodingclub',
                color: 'text-blue-500',
                bg: 'bg-blue-500/5'
              },
              { 
                name: 'LinkedIn', 
                icon: Linkedin, 
                label: 'Official Page', 
                href: 'https://www.linkedin.com/company/112765134',
                displayLink: 'linkedin.com/company/nexus',
                color: 'text-blue-600',
                bg: 'bg-blue-600/5'
              },
              { 
                name: 'Email', 
                icon: Mail, 
                label: 'Official Inquiry', 
                href: 'mailto:nexuscodingclub.official@gmail.com',
                displayLink: 'nexuscodingclub.official@gmail.com',
                color: 'text-nexus-indigo',
                bg: 'bg-nexus-indigo/5'
              }
            ].map((platform, i) => (
              <motion.a
                key={i}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5 }}
                className={`group p-8 rounded-[32px] border transition-all duration-500 flex flex-col items-center text-center ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:border-nexus-indigo/50 hover:bg-white/[0.08]' 
                    : 'bg-white border-nexus-navy/5 hover:border-nexus-indigo/30 hover:shadow-xl shadow-nexus-navy/5'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl ${platform.bg} flex items-center justify-center ${platform.color} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <platform.icon size={32} />
                </div>
                <div className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-2 ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`}>
                  {platform.label}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-nexus-navy'}`}>
                  {platform.name}
                </h3>
                <div className={`text-sm mb-6 break-all font-medium ${isDark ? 'text-white/60' : 'text-nexus-navy/60'}`}>
                  {platform.displayLink}
                </div>
                <div className="mt-auto flex items-center gap-2 text-nexus-indigo font-bold text-sm group-hover:gap-3 transition-all duration-300">
                  Visit Platform <ArrowUpRight size={16} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <img 
                src="https://lh3.googleusercontent.com/d/17IacH_MVoQrCAld0_V90X6j9DgS5Ntpe" 
                alt="Nexus Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-2xl md:text-3xl font-bold max-w-3xl mb-4 italic">
              "The best code is not written by those who know the most — it's written by those who never stop learning and never stop trying."
            </p>
            <div className="text-nexus-indigo font-mono text-sm">— Nexus Coding Club · Est. 2026</div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src="https://lh3.googleusercontent.com/d/17IacH_MVoQrCAld0_V90X6j9DgS5Ntpe" 
                  alt="Nexus Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs text-nexus-navy/40 dark:text-white/40">© 2026 Nexus Coding Club. All rights reserved.</span>
            </div>
            
            <div className="flex gap-8">
              {['Privacy', 'Terms', 'Contact'].map((link) => (
                <a key={link} href="#" className="text-xs text-nexus-navy/40 dark:text-white/40 hover:text-nexus-indigo dark:hover:text-white transition-colors uppercase tracking-widest font-bold">{link}</a>
              ))}
            </div>

            <div className="flex gap-4">
              <a href="https://www.facebook.com/nexuscodingclub" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-nexus-indigo/10 dark:hover:bg-white/10 transition-colors text-nexus-navy/40 dark:text-white/40 hover:text-nexus-indigo dark:hover:text-white"><Facebook size={18} /></a>
              <a href="https://www.linkedin.com/company/112765134" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass hover:bg-nexus-indigo/10 dark:hover:bg-white/10 transition-colors text-nexus-navy/40 dark:text-white/40 hover:text-nexus-indigo dark:hover:text-white"><Linkedin size={18} /></a>
              <a href="mailto:nexuscodingclub.official@gmail.com" className="p-2 rounded-full glass hover:bg-nexus-indigo/10 dark:hover:bg-white/10 transition-colors text-nexus-navy/40 dark:text-white/40 hover:text-nexus-indigo dark:hover:text-white"><Mail size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
