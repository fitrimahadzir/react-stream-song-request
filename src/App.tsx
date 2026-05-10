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
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

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
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songToDelete, setSongToDelete] = useState<number | null>(null);
  const [highlightedSongId, setHighlightedSongId] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<{ message: string; requester: string } | null>(null);

  const [nextLiveConfig, setNextLiveConfig] = useState({
    show: true,
    date: 'Hari ini',
    time: '9:00 Malam',
    type: 'Live Dengar Lagu'
  });

  const [queueList, setQueueList] = useState<{ id: number; songTitle: string; artistName: string; requesterName: string; message?: string; coverUrl?: string; isMyRequest?: boolean }[]>([]);

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
      { id: Date.now() + 1, songTitle: 'Bunga', artistName: 'Ara Johari', requesterName: 'Ali', message: 'Lagu ni untuk someone yang special.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 2, songTitle: 'Kau Ilhamku', artistName: 'Man Bai', requesterName: 'Sarah', message: 'Inspirasi hidup saya!', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 3, songTitle: 'Sumpah', artistName: 'Naim Daniel', requesterName: 'Ahmad', message: 'Sedih teringat ex.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 4, songTitle: 'Isabella', artistName: 'Search', requesterName: 'Zul', message: 'Lagu legend sepanjang zaman.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 5, songTitle: 'Peluang Kedua', artistName: 'Nabila Razali', requesterName: 'Siti', message: 'Semua orang layak dapat peluang kedua.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 6, songTitle: 'Mewangi', artistName: 'Akim & The Magistrate', requesterName: 'Amin', message: 'Sweet sangat lagu ni.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 7, songTitle: 'Terlalu Istimewa', artistName: 'Adibah Noor', requesterName: 'Bella', message: 'Al-Fatihah buat arwah.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 8, songTitle: 'Belaian Jiwa', artistName: 'Innuendo', requesterName: 'Johan', message: 'Lagu ni layan tengah malam best.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 9, songTitle: 'Suci Dalam Debu', artistName: 'Iklim', requesterName: 'Razak', message: 'Zapin sikit!', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' },
      { id: Date.now() + 10, songTitle: 'Aku Bidadari Syurgamu', artistName: 'Siti Nurhaliza', requesterName: 'Farah', message: 'Suara TokTi memang mantap.', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop' }
    ];
    setQueueList(prev => [...prev, ...sampleData]);

    // Async fetch real album arts
    for (let i = 0; i < sampleData.length; i++) {
      const coverUrl = await fetchAlbumArtwork(sampleData[i].songTitle, sampleData[i].artistName);
      setQueueList(prev => prev.map(item => item.id === sampleData[i].id ? { ...item, coverUrl } : item));
    }
  };

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Request Sent:', formData);

    const newId = Date.now();
    const { songTitle, artistName, requesterName, message } = formData;

    setQueueList(prev => [...prev, {
      id: newId,
      songTitle: capitalizeWords(songTitle),
      artistName: capitalizeWords(artistName),
      requesterName: capitalizeWords(requesterName),
      message,
      isMyRequest: true,
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop'
    }]);

    setFormData({ songTitle: '', artistName: '', requesterName: '', message: '' });
    setActiveTab('queue');
    setHighlightedSongId(newId);
    setTimeout(() => setHighlightedSongId(null), 3000);

    // Fetch cover in background
    const coverUrl = await fetchAlbumArtwork(songTitle, artistName);
    setQueueList(prev => prev.map(item => item.id === newId ? { ...item, coverUrl } : item));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.id === 'admin' && loginForm.password === '123456') {
      setIsLoggedIn(true);
      setLoginForm({ id: '', password: '' });
    } else {
      alert('ID atau Password salah!');
    }
  };

  const handleDeleteQueue = (id: number) => {
    setQueueList(prev => prev.filter(item => item.id !== id));
    setSongToDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#020203] flex justify-center selection:bg-brand-primary selection:text-white">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[440px] bg-[#0f1118] min-h-screen relative flex flex-col shadow-2xl overflow-hidden border-x border-white/5">

        {/* Background Atmosphere */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none -z-0" />

        <main className="flex-1 overflow-y-auto pb-28 relative z-10 no-scrollbar">

          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
              {/* Hero Section - Boxed Banner */}
              <section className="relative px-4 pt-6 w-full max-w-sm">
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
              <section className="mt-12 px-4 w-full max-w-sm">
                <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-8 space-y-8 flex flex-col items-center">
                  <div className="space-y-2 text-center">
                    <h2 className="text-lg font-semibold text-brand-light/40 tracking-tight">
                      Form Permintaan Lagu
                    </h2>
                  </div>

                  {showLiveIndicator ? (
                    <form onSubmit={handleSubmit} className="space-y-6 w-full">
                      <Input
                        label="Tajuk Lagu"
                        placeholder="Masukkan nama lagu..."
                        icon={Music}
                        required
                        value={formData.songTitle}
                        onChange={(e) => setFormData({ ...formData, songTitle: capitalizeWords(e.target.value) })}
                      />
                      <Input
                        label="Nama Artis"
                        placeholder="Siapa artisnya?"
                        icon={User}
                        required
                        value={formData.artistName}
                        onChange={(e) => setFormData({ ...formData, artistName: capitalizeWords(e.target.value) })}
                      />
                      <Input
                        label="Nama Peminta"
                        placeholder="Nama atau gelaran anda"
                        icon={MessageSquare}
                        required
                        value={formData.requesterName}
                        onChange={(e) => setFormData({ ...formData, requesterName: capitalizeWords(e.target.value) })}
                      />
                      <TextArea
                        label="Mesej Dedikasi (Pilihan)"
                        placeholder="Sebarang mesej khas untuk host?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />

                      <Button variant="primary" className="w-fit mx-auto px-8 py-4 mt-6 text-sm font-light uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95" type="submit">
                        Hantar Permintaan
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  ) : (
                    <div className="py-8 text-center text-brand-light/50 text-sm leading-relaxed tracking-wide">
                      Maaf, borang permintaan lagu ditutup buat sementara waktu kerana host sedang tidak bersiaran secara langsung (offline).
                    </div>
                  )}
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
                  <h2 className="text-2xl font-semibold tracking-tight text-white mb-8 text-center uppercase tracking-widest">Queue Lagu</h2>
                  <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-8 text-center text-brand-light/40 text-sm leading-relaxed tracking-wide">
                    Masih belum ada permintaan. Sila mohon di homepage jika host buka permintaan lagu.
                  </div>
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

                      {/* Play Controls (Host or Viewer) */}
                      <div className="flex-col gap-2">
                        <div className="flex items-center gap-3 pb-2 pt-2">
                          <button
                            onClick={() => isLoggedIn && setIsPlaying(!isPlaying)}
                            disabled={!isLoggedIn}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 text-white text-sm font-bold tracking-wide uppercase py-3.5 rounded-[16px] transition-all",
                              isLoggedIn ? "hover:scale-[1.02] active:scale-95 cursor-pointer" : "cursor-not-allowed opacity-80",
                              isPlaying
                                ? "bg-emerald-600 animate-pulse shadow-lg shadow-emerald-600/30"
                                : "bg-emerald-500/30 border border-emerald-500/50 hover:bg-emerald-500/40"
                            )}
                          >
                            {isPlaying ? (
                              <>
                                <Square className="w-4 h-4 fill-current" />
                                Playing
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                                Play Now
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              if (isLoggedIn) {
                                setQueueList(prev => prev.slice(1));
                                setIsPlaying(false);
                              }
                            }}
                            disabled={!isLoggedIn}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 bg-white/10 text-white text-sm font-bold tracking-wide uppercase py-3.5 rounded-[16px] transition-all border border-white/5",
                              isLoggedIn ? "hover:bg-white/20 hover:scale-[1.02] active:scale-95 cursor-pointer" : "cursor-not-allowed opacity-80"
                            )}
                          >
                            Next
                            <SkipForward className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Queue List */}
                  <div className="px-5 pt-4 pb-4 space-y-4">
                    {queueList.slice(1).map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "bg-[#2a262e] rounded-[18px] p-4 flex items-center gap-4 border-2 shadow-sm hover:border-white/10 transition-colors group relative",
                          highlightedSongId === item.id
                            ? "border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                            : "border-transparent"
                        )}
                      >
                        <div className="w-[58px] h-[58px] rounded-xl bg-black/40 overflow-hidden shrink-0 relative shadow-inner">
                          <img src={item.coverUrl || `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=150&auto=format&fit=crop&random=${item.id}`} alt="cover" className="w-full h-full object-cover opacity-80 mix-blend-screen" />
                        </div>
                        <div className="flex-1 min-w-0 pr-12">
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
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 px-4 min-h-full">
              <h2 className="text-2xl font-semibold tracking-tight text-white mb-8 text-center uppercase tracking-widest">Notifikasi</h2>
              
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
              <h2 className="text-2xl font-semibold tracking-tight text-white mb-8 text-center uppercase tracking-widest">Settings Admin</h2>

              {!isLoggedIn ? (
                <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-8 space-y-6">
                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-medium text-brand-light">Admin Login</h3>
                    <p className="text-xs text-brand-light/50">Sila masukkan ID dan Password untuk mengakses tetapan.</p>
                  </div>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <Input
                      label="Admin ID"
                      placeholder="Masukkan ID"
                      icon={User}
                      required
                      value={loginForm.id}
                      onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
                    />
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••"
                      icon={Settings}
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                    <Button variant="primary" className="w-fit mx-auto px-10 py-4 text-sm" type="submit">
                      Log Masuk
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-white">Live Indicator</h3>
                      <p className="text-[11px] text-brand-light/50">Paparkan status LIVE pada gambar profil</p>
                    </div>
                    <button
                      onClick={() => setShowLiveIndicator(!showLiveIndicator)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        showLiveIndicator ? "bg-emerald-600" : "bg-white/10"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                        showLiveIndicator ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  {/* Tetapan Notifikasi Next Live */}
                  <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-white">Notifikasi Next Live</h3>
                        <p className="text-[11px] text-brand-light/50">Kawal pengumuman live seterusnya</p>
                      </div>
                      <button
                        onClick={() => setNextLiveConfig({ ...nextLiveConfig, show: !nextLiveConfig.show })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          nextLiveConfig.show ? "bg-emerald-600" : "bg-white/10"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                          nextLiveConfig.show ? "translate-x-6" : "translate-x-0"
                        )} />
                      </button>
                    </div>

                    {nextLiveConfig.show && (
                      <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-brand-light/40 uppercase tracking-widest px-1">Tarikh Live</label>
                          <input
                            type="text"
                            value={nextLiveConfig.date}
                            onChange={(e) => setNextLiveConfig({...nextLiveConfig, date: e.target.value})}
                            placeholder="Contoh: Hari ini, Esok, 25 Nov"
                            className="w-full bg-[#0d1016] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-brand-light/40 uppercase tracking-widest px-1">Masa Live</label>
                          <input
                            type="text"
                            value={nextLiveConfig.time}
                            onChange={(e) => setNextLiveConfig({...nextLiveConfig, time: e.target.value})}
                            placeholder="Contoh: 9:00 Malam"
                            className="w-full bg-[#0d1016] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white placeholder:text-zinc-600"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-brand-light/40 uppercase tracking-widest px-1">Jenis Live</label>
                          <select
                            value={nextLiveConfig.type}
                            onChange={(e) => setNextLiveConfig({...nextLiveConfig, type: e.target.value})}
                            className="w-full bg-[#0d1016] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all text-white appearance-none"
                          >
                            <option value="Live PK">Live PK</option>
                            <option value="Live Dengar Lagu">Live Dengar Lagu</option>
                            <option value="Lain-lain">Lain-lain</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-white">Dev Mode</h3>
                      <p className="text-[11px] text-brand-light/50">Muatkan 10 contoh lagu ke dalam queue</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsDevMode(!isDevMode);
                        if (!isDevMode) loadSampleData();
                      }}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        isDevMode ? "bg-emerald-500" : "bg-white/10"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform",
                        isDevMode ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>

                  <div className="bg-[#11141b]/50 border border-white/5 rounded-2xl p-6">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsLoggedIn(false);
                        setActiveTab('dashboard');
                      }}
                    >
                      Log Keluar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[320px] z-[100]">
          <nav className="bg-[#11141b]/90 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-[32px] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <NavButton
              active={activeTab === 'dashboard'}
              icon={Home}
              onClick={() => setActiveTab('dashboard')}
            />
            <NavButton
              active={activeTab === 'queue'}
              icon={ListMusic}
              onClick={() => setActiveTab('queue')}
            />
            <NavButton
              active={activeTab === 'notifications'}
              icon={Bell}
              onClick={() => setActiveTab('notifications')}
            />
            <NavButton
              active={activeTab === 'settings'}
              icon={User}
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

function NavButton({ icon: Icon, active, onClick }: { icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 relative rounded-full",
        active ? "text-emerald-400" : "text-white/20 hover:text-white/40"
      )}
    >
      <Icon className={cn("w-6 h-6", active && "stroke-[2.5px] drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]")} />
      {active && (
        <motion.div
          layoutId="nav-dot"
          className="absolute -bottom-1.5 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]"
        />
      )}
    </button>
  );
}


