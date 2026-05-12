import React, { useState } from 'react';
import {
  Music,
  User,
  MessageSquare,
  Send,
  MapPin,
  LayoutDashboard,
  ListMusic,
  Settings,
  Globe,
  MessageCircle,
  ExternalLink,
  Trash2,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  MoreVertical,
  MoreHorizontal,
  ArrowLeft,
  Share2,
  Bookmark,
  Square,
  Disc,
  Home,
  Plus,
  Bell,
  Radio,
  Calendar,
  Clock,
  Save,
  Code,
  Lock,
  ChevronRight,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';

// --- Components ---

const Button = ({
  children,
  className,
  variant = 'secondary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }) => {
  const variants = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-white/10',
    secondary: 'bg-[#151921] text-brand-light border border-white/5 hover:bg-[#1c222d] transition-colors',
    outline: 'border border-brand-primary/30 text-brand-light hover:bg-brand-primary/10'
  };

  return (
    <button
      className={cn(
        'px-6 py-3.5 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2.5',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: any }) => (
  <div className="space-y-2 group">
    <label className="text-[11px] font-bold text-brand-light/40 uppercase tracking-widest px-1 block text-center">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-light/30 group-focus-within:text-brand-primary transition-colors" />}
      <input
        className={cn(
          "w-full bg-[#0d1016] border border-white/5 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all placeholder:text-zinc-600 text-center",
          Icon && "pl-11 pr-11"
        )}
        {...props}
      />
    </div>
  </div>
);

const TextArea = ({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-brand-light/40 uppercase tracking-widest px-1 block text-center">{label}</label>
    <textarea
      className="w-full bg-[#0d1016] border border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all placeholder:text-zinc-600 min-h-[140px] resize-none text-center"
      {...props}
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({
    songTitle: '',
    artistName: '',
    requesterName: '',
    message: ''
  });

  // Settings State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songToDelete, setSongToDelete] = useState<number | null>(null);
  const [highlightedSongId, setHighlightedSongId] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<{ message: string; requester: string } | null>(null);

  // Change Password State
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordStatus, setChangePasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSecurityExpanded, setIsSecurityExpanded] = useState(false);

  const [nextLiveConfig, setNextLiveConfig] = useState({
    show: true,
    date: 'Hari ini',
    time: '9:00 Malam',
    type: 'Live Dengar Lagu'
  });

  const [queueList, setQueueList] = useState<{ id: number; songTitle: string; artistName: string; requesterName: string; message?: string; coverUrl?: string; isMyRequest?: boolean; isPlayed?: boolean }[]>([]);

  useEffect(() => {
    fetchQueue();
    fetchSettings();

    const songRequestsChannel = supabase
      .channel('song_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'song_requests' }, () => {
        fetchQueue();
      })
      .subscribe();

    const settingsChannel = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(songRequestsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('app_settings').select('*');
    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      const liveStatus = data.find(s => s.id === 'live_status');
      const nextLive = data.find(s => s.id === 'next_live_config');
      const playStatus = data.find(s => s.id === 'play_status');
      if (liveStatus) setShowLiveIndicator(liveStatus.value.show);
      if (nextLive) setNextLiveConfig(nextLive.value);
      if (playStatus) setIsPlaying(playStatus.value.playing);
    }
  };

  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('song_requests')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching queue:', error);
    } else if (data) {
      setQueueList(data.map(item => ({
        id: item.id,
        songTitle: item.song_title,
        artistName: item.artist_name,
        requesterName: item.requester_name,
        message: item.message,
        coverUrl: item.cover_url,
        isPlayed: item.is_played
      })));
    }
  };

  const fetchAlbumArtwork = async (title: string, artist: string) => {
    try {
      const query = encodeURIComponent(`${title} ${artist}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
      }
    } catch (e) {
      console.error('Error fetching artwork:', e);
    }
    return `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop`; // fallback default
  };

  const loadSampleData = async () => {
    const sampleData = [
      { song_title: 'Bunga', artist_name: 'Ara Johari', requester_name: 'Ali', message: 'Lagu ni untuk someone yang special.' },
      { song_title: 'Kau Ilhamku', artist_name: 'Man Bai', requester_name: 'Sarah', message: 'Inspirasi hidup saya!' },
      { song_title: 'Sumpah', artist_name: 'Naim Daniel', requester_name: 'Ahmad', message: 'Sedih teringat ex.' },
      { song_title: 'Isabella', artist_name: 'Search', requester_name: 'Zul', message: 'Lagu legend sepanjang zaman.' },
      { song_title: 'Peluang Kedua', artist_name: 'Nabila Razali', requester_name: 'Siti', message: 'Semua orang layak dapat peluang kedua.' },
      { song_title: 'Mewangi', artist_name: 'Akim & The Magistrate', requester_name: 'Amin', message: 'Sweet sangat lagu ni.' },
      { song_title: 'Terlalu Istimewa', artist_name: 'Adibah Noor', requester_name: 'Bella', message: 'Al-Fatihah buat arwah.' },
      { song_title: 'Belaian Jiwa', artist_name: 'Innuendo', requester_name: 'Johan', message: 'Lagu ni layan tengah malam best.' },
      { song_title: 'Suci Dalam Debu', artist_name: 'Iklim', requester_name: 'Razak', message: 'Zapin sikit!' },
      { song_title: 'Aku Bidadari Syurgamu', artist_name: 'Siti Nurhaliza', requester_name: 'Farah', message: 'Suara TokTi memang mantap.' }
    ];

    for (const item of sampleData) {
      const coverUrl = await fetchAlbumArtwork(item.song_title, item.artist_name);
      await supabase.from('song_requests').insert([
        { ...item, cover_url: coverUrl }
      ]);
    }
  };

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { songTitle, artistName, requesterName, message } = formData;
    
    // Fetch cover first to store in DB
    const coverUrl = await fetchAlbumArtwork(songTitle, artistName);

    const { data, error } = await supabase
      .from('song_requests')
      .insert([
        { 
          song_title: capitalizeWords(songTitle), 
          artist_name: capitalizeWords(artistName), 
          requester_name: capitalizeWords(requesterName), 
          message,
          cover_url: coverUrl 
        }
      ])
      .select();

    if (error) {
      alert('Gagal menghantar permintaan. Sila cuba lagi.');
      console.error(error);
    } else {
      setFormData({ songTitle: '', artistName: '', requesterName: '', message: '' });
      setActiveTab('queue');
      if (data && data[0]) {
        setHighlightedSongId(data[0].id);
        setTimeout(() => setHighlightedSongId(null), 3000);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.rpc('verify_admin', {
      p_id: loginForm.id,
      p_password: loginForm.password
    });

    if (error) {
      console.error('Login RPC error:', error);
      alert('Ralat semasa log masuk. Sila cuba lagi.');
      return;
    }

    if (data === true) {
      setLoggedInUsername(loginForm.id);
      setIsLoggedIn(true);
      setLoginForm({ id: '', password: '' });
    } else {
      alert('ID atau Password salah!');
    }
  };

  const handleDeleteQueue = async (id: number) => {
    const { error } = await supabase
      .from('song_requests')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Gagal memadam lagu.');
      console.error(error);
    } else {
      setSongToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] flex justify-center selection:bg-brand-primary selection:text-white">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[440px] bg-[#0f1118] min-h-screen relative flex flex-col shadow-2xl overflow-hidden border-x border-white/5">

        {/* Background Atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none -z-0" />

        <main className="flex-1 overflow-y-auto pb-28 relative z-10 no-scrollbar">

          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 px-4 flex flex-col items-center">
              {/* Hero Section - Boxed Banner */}
              <section className="relative w-full max-w-sm">
                <div className="relative h-[240px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src="/images/banner.jpeg"
                    alt="DJ Studio"
                    className="w-full h-full object-cover brightness-[0.7]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Profile Picture - Floating Overlap */}
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-20">
                  <div className="relative group">
                    <div className="w-25 h-25 rounded-full border-[6px] border-[#0f1118] bg-[#1e293b] p-1 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 duration-300">
                      <img
                        src="/images/dp.jpeg"
                        alt="Sofie Luthor"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    {showLiveIndicator && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-600 text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xl border-[2.5px] border-[#0f1118] tracking-widest text-white whitespace-nowrap z-30"
                      >
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                        LIVE
                      </motion.div>
                    )}
                  </div>
                </div>
              </section>

              {/* Identity Section */}
              <section className="mt-20 px-4 text-center space-y-2 w-full">
                <h1 className="text-4xl font-semibold tracking-tight text-emerald-400 drop-shadow-sm">Sofie Luthor</h1>
                <div className="flex items-center justify-center gap-2 text-emerald-500 text-xs font-light tracking-widest uppercase mb-1">
                  <span>Live Streamer</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                  <span>Content Creator</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-brand-light/30 text-sm font-medium tracking-wide">
                  <MapPin className="w-4 h-4" />
                  <span>WP Labuan, M'sia</span>
                </div>

                {/* Social Quick Links */}
                <div className="flex flex-col gap-3 pt-8 w-full max-w-[280px] mx-auto">
                  <a
                    href="https://www.tiktok.com/@sofieluthor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full py-1.5 px-2 bg-[#1f222a] hover:bg-[#2a2d36] border border-white/5 transition-colors rounded-xl flex items-center shadow-lg active:scale-95"
                  >
                    <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-zinc-900" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" /></svg>
                    </div>
                    <span className="flex-1 text-center text-xs font-semibold text-white tracking-wide">TikTok Main</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0 mr-1.5" />
                  </a>

                  <a
                    href="https://www.tiktok.com/@sofieluthor.live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full py-1.5 px-2 bg-[#1f222a] hover:bg-[#2a2d36] border border-white/5 transition-colors rounded-xl flex items-center shadow-lg active:scale-95"
                  >
                    <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-zinc-900" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" /></svg>
                    </div>
                    <span className="flex-1 text-center text-xs font-semibold text-white tracking-wide">TikTok 2nd - SLFC</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0 mr-1.5" />
                  </a>

                  <a
                    href="https://t.me/DengarLaguBersamaSofie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full py-1.5 px-2 bg-[#1f222a] hover:bg-[#2a2d36] border border-white/5 transition-colors rounded-xl flex items-center shadow-lg active:scale-95"
                  >
                    <div className="bg-white rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-[#0088cc]" viewBox="0 0 496 512" xmlns="http://www.w3.org/2000/svg"><path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z" /></svg>
                    </div>
                    <span className="flex-1 text-center text-xs font-semibold text-white tracking-wide">Group Telegram</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0 mr-1.5" />
                  </a>
                </div>
              </section>

              {/* Song Request Form Section */}
              <section className="mt-12 px-4 w-full">
                <div className="bg-[#11141b]/50 border border-white/5 rounded-[20px] p-5">
                  <div className="flex items-center gap-2.5 text-white mb-5">
                    <Music className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-[15px] font-bold tracking-wide">Permintaan Lagu</h3>
                  </div>

                  {!showLiveIndicator && (
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-[12px] text-center">
                      <p className="text-xs text-amber-400/80 font-medium leading-relaxed">
                        Host sedang offline. Permintaan lagu ditutup dan akan dibuka semula apabila siaran langsung bermula.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Tajuk Lagu</label>
                      <input
                        placeholder="Masukkan nama lagu..."
                        required
                        disabled={!showLiveIndicator}
                        value={formData.songTitle}
                        onChange={(e) => setFormData({ ...formData, songTitle: capitalizeWords(e.target.value) })}
                        className={cn(
                          "w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm transition-all text-white placeholder:text-zinc-600",
                          showLiveIndicator
                            ? "focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20"
                            : "opacity-50 cursor-not-allowed"
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Nama Artis</label>
                        <input
                          placeholder="Siapa artisnya?"
                          required
                          disabled={!showLiveIndicator}
                          value={formData.artistName}
                          onChange={(e) => setFormData({ ...formData, artistName: capitalizeWords(e.target.value) })}
                          className={cn(
                            "w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm transition-all text-white placeholder:text-zinc-600",
                            showLiveIndicator
                              ? "focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20"
                              : "opacity-50 cursor-not-allowed"
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Nama Peminta</label>
                        <input
                          placeholder="Nama anda"
                          required
                          disabled={!showLiveIndicator}
                          value={formData.requesterName}
                          onChange={(e) => setFormData({ ...formData, requesterName: capitalizeWords(e.target.value) })}
                          className={cn(
                            "w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm transition-all text-white placeholder:text-zinc-600",
                            showLiveIndicator
                              ? "focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20"
                              : "opacity-50 cursor-not-allowed"
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Mesej Dedikasi (Pilihan)</label>
                      <textarea
                        placeholder="Tulis apa-apa mesej di sini..."
                        disabled={!showLiveIndicator}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={cn(
                          "w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm transition-all text-white placeholder:text-zinc-600 min-h-[100px] resize-none",
                          showLiveIndicator
                            ? "focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20"
                            : "opacity-50 cursor-not-allowed"
                        )}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!showLiveIndicator}
                      className={cn(
                        "w-full mt-2 py-3.5 font-bold text-[13px] rounded-[14px] flex items-center justify-center gap-2 transition-all",
                        showLiveIndicator
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 active:scale-95"
                          : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                      )}
                    >
                      <Send className="w-4 h-4" />
                      Hantar Permintaan
                    </button>
                  </form>
                </div>
              </section>

              {/* Footer Info */}
              <footer className="mt-16 px-6 pb-8 text-center opacity-30">
                <p className="text-[10px] text-brand-light uppercase tracking-[0.4em] font-black">
                  {/* Removed */}
                </p>
              </footer>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="animate-in fade-in duration-500 min-h-full pb-8">
              {queueList.length === 0 ? (
                <div className="pt-10 px-4">
                  <div className="mb-8">
                    <h2 className="text-[26px] font-extrabold tracking-tight text-white leading-tight">Queue Lagu</h2>
                    <p className="text-xs text-brand-light/50 mt-1 font-medium">Senarai permintaan lagu dari penonton</p>
                  </div>
                  <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-8 text-center text-brand-light/40 text-sm leading-relaxed tracking-wide">
                    Masih belum ada permintaan.<br />Tunggu sehingga host buka form permintaan lagu untuk masukkan lagu anda.
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={cn(
                      "w-full mt-6 py-4 font-bold text-[13px] rounded-[14px] flex items-center justify-center gap-2 transition-all",
                      showLiveIndicator
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 active:scale-95"
                        : "bg-white/5 text-white/30 border border-white/10"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Lagu Anda
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Top Hero / Player */}
                  <div className="relative w-full h-[450px]">
                    <img
                      src={queueList[0].coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop"}
                      alt="Now Playing Cover"
                      className="w-full h-full object-cover transition-transform duration-1000"
                    />
                    {/* Gradient overlay top -> bottom: clear at top, blurred at bottom */}
                    <div
                      className="absolute inset-0 backdrop-blur-2xl z-0 pointer-events-none"
                      style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 80%, black 100%)',
                        maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, black 80%, black 100%)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/95 pointer-events-none z-0" />

                    {/* Top Bar inside Player */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 text-white">
                      <button onClick={() => setActiveTab('dashboard')} className="hover:text-white/80 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                      </button>
                      <div className="flex flex-col gap-4">
                        <button className="hover:text-white/80 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Now Playing Info & Controls */}
                    <div className="absolute bottom-6 left-0 right-0 px-8 z-10 text-center">
                      <h2 className="text-[28px] tracking-tight leading-tight mb-1">
                        <span className="font-bold text-white">{queueList[0].songTitle}</span>
                        <span className="text-white/40 mx-2">-</span>
                        <span className="font-medium text-white/90">{queueList[0].artistName}</span>
                      </h2>
                      <div className="flex flex-col gap-1 mb-4">
                        <p className="text-white/40 text-[11px] font-medium uppercase tracking-[0.2em] antialiased">
                          Oleh: <span className="text-white/50">{queueList[0].requesterName}</span>
                        </p>
                        {queueList[0].message && (
                          <p className="text-white/40 text-[13px] font-light">
                            Mesej: <span className="italic">"{queueList[0].message}"</span>
                          </p>
                        )}
                      </div>

                      {/* Play Controls - Admin sahaja nampak butang, User nampak indicator */}
                      <div className="flex-col gap-2">
                        {isLoggedIn ? (
                          /* Admin View: Butang Play & Next */
                          <div className="flex items-center gap-3 pb-2 pt-2">
                            <button
                              onClick={async () => {
                                const newPlaying = !isPlaying;
                                setIsPlaying(newPlaying);
                                await supabase
                                  .from('app_settings')
                                  .update({ value: { playing: newPlaying } })
                                  .eq('id', 'play_status');
                              }}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-2 text-white text-sm font-bold tracking-wide uppercase py-3.5 rounded-[16px] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer",
                                isPlaying
                                  ? "bg-emerald-600 animate-pulse shadow-lg shadow-emerald-600/30"
                                  : "bg-emerald-500/30 border border-emerald-500/50 hover:bg-emerald-500/40"
                              )}
                            >
                              {isPlaying ? (
                                <><Square className="w-4 h-4 fill-current" /> Stop</>
                              ) : (
                                <><Play className="w-4 h-4 fill-current ml-0.5" /> Play Now</>
                              )}
                            </button>
                            <button
                              onClick={async () => {
                                if (queueList[0]) {
                                  await supabase
                                    .from('song_requests')
                                    .delete()
                                    .eq('id', queueList[0].id);
                                  // Reset playing status
                                  setIsPlaying(false);
                                  await supabase
                                    .from('app_settings')
                                    .update({ value: { playing: false } })
                                    .eq('id', 'play_status');
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white text-sm font-bold tracking-wide uppercase py-3.5 rounded-[16px] transition-all border border-white/5 hover:bg-white/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
                            >
                              Next
                              <SkipForward className="w-4 h-4 fill-current ml-0.5" />
                            </button>
                          </div>
                        ) : (
                          /* User View: Blink indicator bila ada lagu sedang dimainkan */
                          <div className="pb-2 pt-2">
                            {isPlaying ? (
                              <div className="flex items-center justify-center gap-2.5 bg-emerald-600/20 border border-emerald-500/40 py-3.5 rounded-[16px] animate-pulse">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <span className="text-emerald-400 text-sm font-bold tracking-widest uppercase">Sedang Dimainkan</span>
                                <Music className="w-4 h-4 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3.5 rounded-[16px]">
                                <span className="text-white/30 text-sm font-medium tracking-wide">Menunggu Host...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Queue List */}
                  <div className="px-5 pt-4 pb-4 space-y-4">
                    {queueList.slice(1).map((item, index) => (
                      <div
                        key={item.id}
                        className={cn(
                          "bg-[#11141b]/50 rounded-[18px] p-4 flex items-center gap-4 border-2 shadow-sm hover:border-white/10 transition-colors group relative",
                          highlightedSongId === item.id
                            ? "border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                            : "border-transparent"
                        )}
                        >
                          <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-emerald-500/30 rounded-full" />
                          <div className="w-[58px] h-[58px] rounded-xl bg-black/40 overflow-hidden shrink-0 relative shadow-inner">
                          <img src={item.coverUrl || `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop&random=${item.id}`} alt="cover" className="w-full h-full object-cover opacity-80 mix-blend-screen" />
                        </div>
                        <div className="flex-1 min-w-0 pr-12">
                          {index === 0 && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                              <span className="text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider">Lagu Seterusnya</span>
                            </div>
                          )}
                          <h3 className="text-[16px] font-bold text-white truncate drop-shadow-sm">{item.songTitle}</h3>
                          <p className="text-sm text-white/60 truncate mt-0.5 tracking-wide">{item.artistName}</p>
                          <p className="text-[9px] text-white/50 font-medium truncate uppercase tracking-[0.2em] absolute bottom-4 right-4 pointer-events-none antialiased">
                            Oleh: <span className="text-white/70">{item.requesterName}</span>
                          </p>
                        </div>
                        {/* Action Dropdown */}
                        <div className="absolute top-2 right-2 shrink-0">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                            className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white rounded-full transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {activeDropdown === item.id && (
                            <div className="absolute right-0 top-full mt-1 bg-[#1e1a21] border border-white/10 rounded-xl shadow-2xl p-1 z-50 w-36 overflow-hidden">
                              <button
                                className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-white hover:bg-white/10 rounded-lg w-full transition-colors"
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setSelectedMessage({ message: item.message || "Tiada mesej dedikasi disertakan.", requester: item.requesterName });
                                }}
                              >
                                <MessageCircle className="w-4 h-4 text-brand-primary shrink-0" /> <span className="truncate">Mesej</span>
                              </button>
                              <button
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium rounded-lg w-full transition-colors",
                                  (item.isMyRequest || isLoggedIn) ? "text-red-400 hover:bg-red-400/10" : "opacity-30 cursor-not-allowed hidden"
                                )}
                                onClick={() => {
                                  if (item.isMyRequest || isLoggedIn) {
                                    setActiveDropdown(null);
                                    setSongToDelete(item.id);
                                  }
                                }}
                                disabled={!item.isMyRequest && !isLoggedIn}
                              >
                                <Trash2 className="w-4 h-4 text-red-400 shrink-0" /> <span className="truncate">Padam</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {queueList.length === 1 && (
                      <div className="text-center text-white/30 text-xs py-8 font-medium tracking-wide">
                        Tiada lagu seterusnya di dalam queue.
                      </div>
                    )}
                  </div>
                  <div className="px-5 pt-2 pb-6">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={cn(
                        "w-full py-4 font-bold text-[13px] rounded-[14px] flex items-center justify-center gap-2 transition-all",
                        showLiveIndicator
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 active:scale-95"
                          : "bg-white/5 text-white/30 border border-white/10"
                      )}
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Lagu Anda
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 px-4 min-h-full">
              <div className="mb-8">
                <h2 className="text-[26px] font-extrabold tracking-tight text-white leading-tight">Notifikasi</h2>
                <p className="text-xs text-brand-light/50 mt-1 font-medium">Pengumuman dan pemberitahuan terkini</p>
              </div>
              
              <div className="space-y-4 pb-8">
                {/* Dynamic Next Live Notification */}
                {nextLiveConfig.show && (
                  <div className="bg-[#11141b]/50 border border-brand-primary/30 rounded-2xl p-5 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-brand-primary"></div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-white mb-1">Siaran Langsung Seterusnya</h3>
                        <p className="text-sm text-brand-light/70 leading-relaxed">
                          Sesi <strong>{nextLiveConfig.type}</strong> seterusnya akan bermula pada <strong>{nextLiveConfig.date}</strong> jam <strong>{nextLiveConfig.time}</strong>. Jangan lupa sedia dengan request lagu anda!
                        </p>
                        <span className="inline-block mt-3 text-[10px] uppercase tracking-widest text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md">
                          Pengumuman
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dummy Notification 2 */}
                <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-white/50" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-white mb-1">Sistem Request Berwajah Baru</h3>
                      <p className="text-sm text-brand-light/70 leading-relaxed">
                        Sistem request lagu kini berwajah baru! Anda boleh menghantar mesej dedikasi untuk host dan rakan-rakan viewer.
                      </p>
                      <span className="inline-block mt-3 text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                        Sistem
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 px-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[26px] font-extrabold tracking-tight text-white leading-tight">Admin Panel</h2>
                  <p className="text-xs text-brand-light/50 mt-1 font-medium">Manage live, notifications & security</p>
                </div>
                {isLoggedIn && (
                  <div className="flex items-center gap-3 bg-[#11141b]/50 border border-white/5 pl-4 pr-1.5 py-1.5 rounded-full shadow-lg">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-brand-light/50 uppercase tracking-widest font-bold">Admin</p>
                      <p className="text-xs font-bold text-emerald-400">{loggedInUsername}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-emerald-500/30 overflow-hidden bg-emerald-500/10 p-0.5">
                      <img src="/images/dp.jpeg" alt="Admin" className="w-full h-full rounded-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {!isLoggedIn ? (
                <div className="bg-[#11141b]/50 border border-white/5 rounded-[20px] p-5">
                  <div className="flex items-center gap-2.5 text-white mb-5">
                    <Lock className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-[15px] font-bold tracking-wide">Admin Login</h3>
                  </div>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Admin ID</label>
                      <input
                        placeholder="Masukkan ID"
                        required
                        value={loginForm.id}
                        onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
                        className="w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••"
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-2 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-[13px] rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Masuk
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Live Settings Section */}
                  <div className="bg-[#11141b]/50 border border-white/5 rounded-[20px] p-5 space-y-4">
                    <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                      <Radio className="w-5 h-5" />
                      <h3 className="text-[15px] font-bold tracking-wide text-white">Live Settings</h3>
                    </div>
                    
                    <div className="space-y-1">
                      {/* Live Indicator Toggle */}
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <Radio className="w-4 h-4 text-brand-light/40" />
                          <div>
                            <p className="text-sm text-brand-light/90 font-medium">Live Indicator</p>
                            <p className="text-[10px] text-brand-light/40 mt-0.5">Show LIVE status on profile</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const newStatus = !showLiveIndicator;
                            setShowLiveIndicator(newStatus);
                            await supabase.from('app_settings').update({ value: { show: newStatus } }).eq('id', 'live_status');
                            if (!newStatus) {
                              const { error } = await supabase.from('song_requests').delete().neq('id', 0);
                              if (error) console.error('Gagal memadam queue:', error);
                            }
                          }}
                          className={cn(
                            "w-11 h-6 rounded-full transition-colors relative shadow-inner",
                            showLiveIndicator ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white/10"
                          )}
                        >
                          <span className={cn(
                            "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md",
                            showLiveIndicator ? "translate-x-5" : "translate-x-0"
                          )} />
                        </button>
                      </div>

                      {/* Notifikasi Next Live Toggle */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-brand-light/40" />
                          <div>
                            <p className="text-sm text-brand-light/90 font-medium">Notifikasi Next Live</p>
                            <p className="text-[10px] text-brand-light/40 mt-0.5">Announce next broadcast</p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            const newConfig = { ...nextLiveConfig, show: !nextLiveConfig.show };
                            setNextLiveConfig(newConfig);
                            await supabase.from('app_settings').update({ value: newConfig }).eq('id', 'next_live_config');
                          }}
                          className={cn(
                            "w-11 h-6 rounded-full transition-colors relative shadow-inner",
                            nextLiveConfig.show ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white/10"
                          )}
                        >
                          <span className={cn(
                            "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md",
                            nextLiveConfig.show ? "translate-x-5" : "translate-x-0"
                          )} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Schedule Section */}
                  <div className="bg-[#11141b]/50 border border-white/5 rounded-[20px] p-5">
                    <div className="flex items-center gap-2.5 text-white mb-5">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-[15px] font-bold tracking-wide">Live Schedule</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Tarikh Live</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={nextLiveConfig.date}
                              onChange={(e) => setNextLiveConfig({...nextLiveConfig, date: e.target.value})}
                              placeholder="Contoh: Hari ini"
                              className="w-full bg-[#181c25] border border-transparent rounded-[14px] pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-light/30 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Masa Live</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={nextLiveConfig.time}
                              onChange={(e) => setNextLiveConfig({...nextLiveConfig, time: e.target.value})}
                              placeholder="Contoh: 9:00 PM"
                              className="w-full bg-[#181c25] border border-transparent rounded-[14px] pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                            />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-light/30 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Jenis Live</label>
                        <div className="relative">
                          <select
                            value={nextLiveConfig.type}
                            onChange={(e) => setNextLiveConfig({...nextLiveConfig, type: e.target.value})}
                            className="w-full bg-[#181c25] border border-transparent rounded-[14px] pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white appearance-none"
                          >
                            <option value="Live PK">Live PK</option>
                            <option value="Live Dengar Lagu">Live Dengar Lagu</option>
                            <option value="Lain-lain">Lain-lain</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-light/30 pointer-events-none" />
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const { error } = await supabase.from('app_settings').update({ value: nextLiveConfig }).eq('id', 'next_live_config');
                          if (error) alert('Gagal menyimpan tetapan.');
                          else alert('Tetapan disimpan!');
                        }}
                        className="w-full mt-2 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-[13px] rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Save className="w-4 h-4" />
                        Simpan Tetapan Live
                      </button>
                    </div>
                  </div>

                  {/* System Section */}
                  <div className="bg-[#11141b]/50 border border-white/5 rounded-[20px] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-white">
                        <Code className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h3 className="text-[15px] font-bold tracking-wide">Dev Mode</h3>
                          <p className="text-[10px] text-brand-light/40 mt-0.5">Enable advanced debugging tools</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsDevMode(!isDevMode);
                          if (!isDevMode) loadSampleData();
                        }}
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors relative shadow-inner",
                          isDevMode ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white/10"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md",
                          isDevMode ? "translate-x-5" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-[#11141b]/50 border border-white/5 rounded-[20px] overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => setIsSecurityExpanded(!isSecurityExpanded)}
                      className="w-full p-5 flex items-center justify-between bg-transparent hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 text-white">
                        <Lock className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-[15px] font-bold tracking-wide">Security</h3>
                      </div>
                      {isSecurityExpanded ? <ChevronDown className="w-5 h-5 text-brand-light/40" /> : <ChevronRight className="w-5 h-5 text-brand-light/40" />}
                    </button>
                    <AnimatePresence>
                      {isSecurityExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-2 border-t border-white/5">
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
                                  setChangePasswordStatus({ type: 'error', message: 'Kata laluan baharu tidak sepadan.' });
                                  return;
                                }
                                if (changePasswordForm.newPassword.length < 6) {
                                  setChangePasswordStatus({ type: 'error', message: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.' });
                                  return;
                                }
                                setIsChangingPassword(true);
                                setChangePasswordStatus(null);
                                const { data, error } = await supabase.rpc('change_admin_password', {
                                  p_id: loggedInUsername,
                                  p_old_password: changePasswordForm.currentPassword,
                                  p_new_password: changePasswordForm.newPassword
                                });
                                setIsChangingPassword(false);
                                if (error) {
                                  console.error('Change password error:', error);
                                  setChangePasswordStatus({ type: 'error', message: 'Ralat sistem. Sila cuba lagi.' });
                                } else if (data === true) {
                                  setChangePasswordStatus({ type: 'success', message: 'Kata laluan berjaya ditukar!' });
                                  setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                } else {
                                  setChangePasswordStatus({ type: 'error', message: 'Kata laluan semasa tidak betul.' });
                                }
                              }}
                              className="space-y-3"
                            >
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Kata Laluan Semasa</label>
                                <input
                                  type="password"
                                  value={changePasswordForm.currentPassword}
                                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                                  placeholder="••••••"
                                  required
                                  className="w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Kata Laluan Baharu</label>
                                <input
                                  type="password"
                                  value={changePasswordForm.newPassword}
                                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                                  placeholder="Min. 6 aksara"
                                  required
                                  className="w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-brand-light/40 uppercase tracking-widest px-1">Sahkan Kata Laluan Baharu</label>
                                <input
                                  type="password"
                                  value={changePasswordForm.confirmPassword}
                                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                                  placeholder="Taip semula kata laluan baharu"
                                  required
                                  className="w-full bg-[#181c25] border border-transparent rounded-[14px] px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                                />
                              </div>
                              {changePasswordStatus && (
                                <div className={cn(
                                  "text-xs font-medium px-3 py-2.5 rounded-[14px] text-center",
                                  changePasswordStatus.type === 'success'
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                )}>
                                  {changePasswordStatus.message}
                                </div>
                              )}
                              <button
                                className="w-full py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-[13px] rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-95"
                                type="submit"
                                disabled={isChangingPassword}
                              >
                                {isChangingPassword ? 'Menyimpan...' : 'Simpan Kata Laluan Baharu'}
                              </button>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Account Section */}
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setActiveTab('dashboard');
                      setChangePasswordStatus(null);
                      setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="w-full py-4 border border-white/5 rounded-[20px] text-brand-light hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2 font-semibold text-[13px] active:scale-95"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[380px] z-[100]">
          <nav className="bg-[#11141b]/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <NavButton
              active={activeTab === 'dashboard'}
              icon={Home}
              label="Utama"
              onClick={() => setActiveTab('dashboard')}
            />
            <NavButton
              active={activeTab === 'queue'}
              icon={ListMusic}
              label="Queue"
              onClick={() => setActiveTab('queue')}
            />
            <NavButton
              active={activeTab === 'notifications'}
              icon={Bell}
              label="Notifikasi"
              onClick={() => setActiveTab('notifications')}
            />
            <NavButton
              active={activeTab === 'settings'}
              icon={User}
              label="Admin Panel"
              onClick={() => setActiveTab('settings')}
            />
          </nav>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {songToDelete !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#11141b] border border-white/10 rounded-2xl p-6 w-full max-w-[320px] shadow-2xl flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Padam Lagu?</h3>
                <p className="text-sm text-brand-light/70 mb-6">
                  Adakah anda pasti mahu memadamkan lagu ini dari queue? Tindakan ini tidak boleh diundurkan.
                </p>
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={() => setSongToDelete(null)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleDeleteQueue(songToDelete)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    Padam
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Message Modal */}
          {selectedMessage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedMessage(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-[#1e1a21] border border-brand-primary/20 rounded-2xl p-6 w-full max-w-[320px] shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4 text-brand-primary">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="text-sm font-bold tracking-widest uppercase">Mesej Dedikasi</h3>
                </div>
                <div className="bg-[#11141b]/50 rounded-xl p-4 mb-5 border border-white/5">
                  <p className="text-[15px] text-white leading-relaxed italic">
                    "{selectedMessage.message}"
                  </p>
                </div>
                <p className="text-xs font-medium text-brand-light/60 uppercase tracking-[0.15em] text-center mb-6">
                  Daripada: <span className="text-emerald-400 font-bold">{selectedMessage.requester}</span>
                </p>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="w-full py-3.5 px-4 rounded-xl font-bold tracking-wide text-sm text-white bg-brand-primary hover:bg-emerald-600 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Tutup
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center transition-all duration-300 rounded-full",
        active ? "bg-emerald-500/15 text-emerald-400 px-5 py-2.5 gap-2" : "text-white/40 hover:text-white/60 p-2.5"
      )}
    >
      <Icon className={cn("w-[22px] h-[22px] transition-all duration-300 shrink-0", active ? "stroke-[2.5px] drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "stroke-[2px]")} />
      <span 
        className={cn(
          "text-[13px] font-bold whitespace-nowrap overflow-hidden transition-all duration-300",
          active ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0 hidden sm:block"
        )}
        style={{ display: active ? 'block' : undefined }}
      >
        {label}
      </span>
    </button>
  );
}


