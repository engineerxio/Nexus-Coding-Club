import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, School, Users, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { auth, googleProvider, facebookProvider, db } from '../lib/firebase';
import { generateNexusId } from '../lib/idGenerator';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  isDark: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onRegister, isDark }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password' | 'forgot-password-success'>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    institute: '',
    gender: 'Male',
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (view === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const fbUser = userCredential.user;
        
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        const userData = userDoc.data();

        const user: User = {
          id: fbUser.uid,
          fullName: fbUser.displayName || formData.email.split('@')[0],
          email: fbUser.email || '',
          institute: userData?.institute || 'Nexus Member',
          gender: userData?.gender || 'Other',
          joinDate: userData?.joinDate || new Date().toLocaleDateString()
        };
        onLogin(user);
      } else if (view === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const fbUser = userCredential.user;

        await updateProfile(fbUser, {
          displayName: formData.fullName
        });

        // Generate unique Nexus ID
        let nexusId = generateNexusId();
        const membersSnapshot = await getDocs(collection(db, 'users'));
        const existingIds = membersSnapshot.docs.map(d => d.data().nexusId);
        while (existingIds.includes(nexusId)) {
          nexusId = generateNexusId();
        }

        const newUser: User = {
          id: fbUser.uid,
          nexusId: nexusId,
          fullName: formData.fullName,
          institute: formData.institute,
          gender: formData.gender,
          email: formData.email,
          joinDate: new Date().toLocaleDateString()
        };
        
        await setDoc(doc(db, 'users', fbUser.uid), {
          fullName: newUser.fullName,
          institute: newUser.institute,
          gender: newUser.gender,
          email: newUser.email,
          joinDate: newUser.joinDate,
          nexusId: newUser.nexusId
        });
        
        onRegister(newUser);
      } else if (view === 'forgot-password') {
        await sendPasswordResetEmail(auth, formData.email);
        setView('forgot-password-success');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      let userData = userDoc.data();

      if (!userData) {
        // Generate unique Nexus ID
        let nexusId = generateNexusId();
        const membersSnapshot = await getDocs(collection(db, 'users'));
        const existingIds = membersSnapshot.docs.map(d => d.data().nexusId);
        while (existingIds.includes(nexusId)) {
          nexusId = generateNexusId();
        }

        userData = {
          fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Nexus Member',
          email: fbUser.email || '',
          institute: 'Nexus Member',
          gender: 'Other',
          joinDate: new Date().toLocaleDateString(),
          nexusId
        };
        await setDoc(doc(db, 'users', fbUser.uid), userData);
      }

      const user: User = {
        id: fbUser.uid,
        nexusId: userData.nexusId,
        fullName: userData.fullName,
        email: userData.email,
        institute: userData.institute,
        gender: userData.gender,
        joinDate: userData.joinDate
      };

      onLogin(user);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const fbUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      let userData = userDoc.data();

      if (!userData) {
        // Generate unique Nexus ID
        let nexusId = generateNexusId();
        const membersSnapshot = await getDocs(collection(db, 'users'));
        const existingIds = membersSnapshot.docs.map(d => d.data().nexusId);
        while (existingIds.includes(nexusId)) {
          nexusId = generateNexusId();
        }

        userData = {
          fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Nexus Member',
          email: fbUser.email || '',
          institute: 'Nexus Member',
          gender: 'Other',
          joinDate: new Date().toLocaleDateString(),
          nexusId
        };
        await setDoc(doc(db, 'users', fbUser.uid), userData);
      }

      const user: User = {
        id: fbUser.uid,
        nexusId: userData.nexusId,
        fullName: userData.fullName,
        email: userData.email,
        institute: userData.institute,
        gender: userData.gender,
        joinDate: userData.joinDate
      };

      onLogin(user);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md glass rounded-2xl p-8 shadow-2xl overflow-hidden ${isDark ? '' : 'bg-white'}`}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nexus-indigo via-nexus-cyan to-nexus-violet" />
            
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-nexus-navy/5 text-nexus-navy/60'}`}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-nexus-navy'}`}>
                {view === 'login' && 'Welcome Back'}
                {view === 'register' && 'Join the Nexus'}
                {view === 'forgot-password' && 'Reset Password'}
                {view === 'forgot-password-success' && 'Check Your Email'}
              </h2>
              <p className={isDark ? 'text-white/60' : 'text-nexus-navy/60'}>
                {view === 'login' && 'Enter your credentials to access your dashboard'}
                {view === 'register' && 'Create an account to start your journey'}
                {view === 'forgot-password' && 'Enter your email to receive a reset link'}
                {view === 'forgot-password-success' && 'We have sent you instructions'}
              </p>
            </div>

            {view === 'forgot-password-success' ? (
              <div className="space-y-6">
                <div className={`rounded-xl p-6 text-center border ${isDark ? 'bg-nexus-indigo/10 border-nexus-indigo/20' : 'bg-nexus-indigo/5 border-nexus-indigo/10'}`}>
                  <Mail className="mx-auto text-nexus-indigo mb-4" size={48} />
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-nexus-navy/80'}`}>
                    We’ve sent a password reset link to your email address. If you don’t see it in your inbox, please check your spam or junk folder. The link will expire after a limited time for your security.
                  </p>
                </div>
                <button
                  onClick={() => setView('login')}
                  className={`w-full border font-bold py-3 rounded-xl transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-nexus-navy/5 border-nexus-navy/10 text-nexus-navy hover:bg-nexus-navy/10'}`}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'register' && (
                  <>
                    <div className="relative">
                      <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`} size={18} />
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        className={`w-full border rounded-xl py-3 pl-10 pr-4 transition-colors focus:outline-none focus:border-nexus-indigo ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-nexus-navy/5 border-nexus-navy/10 text-nexus-navy placeholder:text-nexus-navy/20'}`}
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <School className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`} size={18} />
                      <input
                        type="text"
                        placeholder="Institute"
                        required
                        className={`w-full border rounded-xl py-3 pl-10 pr-4 transition-colors focus:outline-none focus:border-nexus-indigo ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-nexus-navy/5 border-nexus-navy/10 text-nexus-navy placeholder:text-nexus-navy/20'}`}
                        value={formData.institute}
                        onChange={e => setFormData({ ...formData, institute: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <Users className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`} size={18} />
                      <select
                        className={`w-full border rounded-xl py-3 pl-10 pr-10 transition-colors focus:outline-none focus:border-nexus-indigo appearance-none cursor-pointer ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-nexus-navy/5 border-nexus-navy/10 text-nexus-navy'}`}
                        value={formData.gender}
                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="Male" className={isDark ? 'bg-nexus-navy' : 'bg-white'}>Male</option>
                        <option value="Female" className={isDark ? 'bg-nexus-navy' : 'bg-white'}>Female</option>
                        <option value="Others" className={isDark ? 'bg-nexus-navy' : 'bg-white'}>Others</option>
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`} size={18} />
                    </div>
                  </>
                )}
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`} size={18} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    className={`w-full border rounded-xl py-3 pl-10 pr-4 transition-colors focus:outline-none focus:border-nexus-indigo ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-nexus-navy/5 border-nexus-navy/10 text-nexus-navy placeholder:text-nexus-navy/20'}`}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {view !== 'forgot-password' && (
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-nexus-navy/40'}`} size={18} />
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      className={`w-full border rounded-xl py-3 pl-10 pr-4 transition-colors focus:outline-none focus:border-nexus-indigo ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-nexus-navy/5 border-nexus-navy/10 text-nexus-navy placeholder:text-nexus-navy/20'}`}
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                )}

                {view === 'login' && (
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-xs text-nexus-indigo hover:text-nexus-cyan transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-nexus-indigo to-nexus-violet text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : (
                    view === 'login' ? 'Login' : 
                    view === 'register' ? 'Register' : 
                    'Send Reset Link'
                  )}
                </button>
                
                {view === 'forgot-password' && (
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full text-white/40 hover:text-white transition-colors text-xs font-medium"
                  >
                    Back to Login
                  </button>
                )}
              </form>
            )}

            {view !== 'forgot-password-success' && (
              <>
                <div className="mt-6 flex items-center gap-4">
                  <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-nexus-navy/10'}`} />
                  <span className={`text-xs uppercase font-bold ${isDark ? 'text-white/20' : 'text-nexus-navy/20'}`}>Or continue with</span>
                  <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-nexus-navy/10'}`} />
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className={`w-full border font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-nexus-navy/5 border-nexus-navy/10 text-nexus-navy hover:bg-nexus-navy/10'}`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={handleFacebookSignIn}
                    disabled={isLoading}
                    className={`w-full border font-medium py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 ${isDark ? 'bg-[#1877F2]/10 border-[#1877F2]/30 text-white hover:bg-[#1877F2]/20' : 'bg-[#1877F2]/5 border-[#1877F2]/20 text-nexus-navy hover:bg-[#1877F2]/10'}`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView(view === 'login' ? 'register' : 'login')}
                    className={`transition-colors text-sm ${isDark ? 'text-white/60 hover:text-nexus-cyan' : 'text-nexus-navy/60 hover:text-nexus-indigo'}`}
                  >
                    {view === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
