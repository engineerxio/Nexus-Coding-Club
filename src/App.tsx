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
  Send,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  User as UserIcon,
  Image as ImageIcon
} from 'lucide-react';
import { MatrixRain } from './components/MatrixRain';
import { NeuralOrb } from './components/NeuralOrb';
import { Terminal } from './components/Terminal';
import { Navbar, Drawer } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { HeroSkeleton } from './components/Skeleton';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

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
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        const userData = userDoc.data();
        
        const user: User = {
          id: fbUser.uid,
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
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <AnimatePresence>
        {isDashboardOpen && currentUser && (
          <Dashboard 
            user={currentUser} 
            onLogout={handleLogout} 
            onClose={() => setIsDashboardOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-0">
        <MatrixRain color={isDark ? '#6366f1' : '#818cf8'} />
        
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
              
              <p className="text-base sm:text-lg text-white/60 dark:text-white/60 mb-10 max-w-lg mx-auto lg:mx-0">
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
                      <p className="text-sm text-white/40">{feature.desc}</p>
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
              <div className="text-xs text-white/40 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
              <p className="text-white/60">Stay tuned for our upcoming workshops, contests, and meetups.</p>
            </div>
          </div>

          <div className="glass p-20 rounded-3xl border-white/5 text-center">
            <div className="w-20 h-20 bg-nexus-indigo/10 rounded-full flex items-center justify-center text-nexus-indigo mx-auto mb-8">
              <Calendar size={40} />
            </div>
            <h3 className="text-3xl font-bold mb-4">Coming Soon</h3>
            <p className="text-white/40 max-w-md mx-auto">We are currently planning some exciting events for our community. Check back soon for updates!</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">Captured Moments</h2>
          
          <div className="glass p-20 rounded-3xl border-white/5 text-center">
            <div className="w-20 h-20 bg-nexus-indigo/10 rounded-full flex items-center justify-center text-nexus-indigo mx-auto mb-8">
              <ImageIcon size={40} />
            </div>
            <h3 className="text-3xl font-bold mb-4">Coming Soon</h3>
            <p className="text-white/40 max-w-md mx-auto">We are capturing the best moments of our club. Stay tuned to see our journey!</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">The Minds Behind Nexus</h2>
            <p className="text-white/60">Meet the visionaries leading our community.</p>
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
                <p className="text-xs text-white/60 leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>

          <div className="mb-24">
            <h3 className="text-xl font-bold mb-12 text-center text-white/40 uppercase tracking-[0.3em]">Advisors & Mentors</h3>
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
                  <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center text-white/40 font-bold">
                    {name.charAt(0)}
                  </div>
                  <div className="font-bold text-sm">{name}</div>
                  <div className="text-[10px] text-white/20 uppercase">Mentor</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-12 text-center text-white/40 uppercase tracking-[0.3em]">Registered Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredMembers.length > 0 ? (
                registeredMembers.map((member, i) => (
                  <div key={i} className="glass p-6 rounded-2xl border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-nexus-indigo/10 flex items-center justify-center text-nexus-indigo font-bold">
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{member.fullName}</div>
                      <div className="text-[10px] text-white/40">{member.institute}</div>
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

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-nexus-indigo/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-4xl font-bold mb-8">Get in Touch.</h2>
              <p className="text-white/60 mb-12">Have questions? We'd love to hear from you. Reach out to us through any of these channels.</p>
              
              <div className="space-y-6">
                {[
                  { icon: Facebook, label: 'Facebook', value: 'Coming soon', color: 'text-blue-500' },
                  { icon: Linkedin, label: 'LinkedIn', value: 'Coming soon', color: 'text-blue-400' },
                  { icon: Mail, label: 'Email', value: 'nexuscodingclub.official@gmail.com', color: 'text-nexus-indigo' }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="p-6 glass rounded-2xl border-white/5 flex items-center gap-6 group"
                  >
                    <div className={`p-4 rounded-xl bg-white/5 ${item.color}`}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">{item.label}</div>
                      <div className="text-white font-medium">{item.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass p-10 rounded-3xl border-white/5">
              <form 
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    subject: formData.get('subject'),
                    message: formData.get('message')
                  };

                  try {
                    const response = await fetch('/api/contact', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });

                    if (response.ok) {
                      alert('Message sent successfully! We will get back to you soon.');
                      form.reset();
                    } else {
                      alert('Failed to send message. Please try again later.');
                    }
                  } catch (error) {
                    console.error('Error sending message:', error);
                    alert('An error occurred. Please try again later.');
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Full Name</label>
                    <input name="name" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-nexus-indigo transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Email Address</label>
                    <input name="email" type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-nexus-indigo transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Subject</label>
                  <input name="subject" type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-nexus-indigo transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Message</label>
                  <textarea name="message" rows={4} required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-nexus-indigo transition-colors resize-none" />
                </div>
                <button type="submit" className="w-full py-4 rounded-xl bg-nexus-indigo text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                  Send Message <Send size={18} />
                </button>
              </form>
            </div>
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
              <span className="text-xs text-white/40">© 2026 Nexus Coding Club. All rights reserved.</span>
            </div>
            
            <div className="flex gap-8">
              {['Privacy', 'Terms', 'Contact'].map((link) => (
                <a key={link} href="#" className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest font-bold">{link}</a>
              ))}
            </div>

            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white/40 hover:text-white"><Facebook size={18} /></a>
              <a href="#" className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white/40 hover:text-white"><Linkedin size={18} /></a>
              <a href="#" className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-white/40 hover:text-white"><Mail size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
