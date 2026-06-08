import React, { useState } from "react";
import { X, Key, Palette, Sliders, Play, Check } from "lucide-react";

export default function SettingsModal({ isOpen, onClose, onSave }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem("tmdb_api_key") || "");
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem("tmdb_base_url") || "https://api.tmdb.org/3");
  const [useImageProxy, setUseImageProxy] = useState(localStorage.getItem("use_image_proxy") !== "false");
  const [playerColor, setPlayerColor] = useState(localStorage.getItem("player_color") || "e50914");
  const [autoPlay, setAutoPlay] = useState(localStorage.getItem("player_autoplay") !== "false");
  const [nextEpisode, setNextEpisode] = useState(localStorage.getItem("player_nextepisode") !== "false");
  const [episodeSelector, setEpisodeSelector] = useState(localStorage.getItem("player_episodeselector") !== "false");
  
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("tmdb_api_key", apiKey.trim());
    localStorage.setItem("tmdb_base_url", baseUrl.trim());
    localStorage.setItem("use_image_proxy", String(useImageProxy));
    localStorage.setItem("player_color", playerColor.trim().replace("#", ""));
    localStorage.setItem("player_autoplay", String(autoPlay));
    localStorage.setItem("player_nextepisode", String(nextEpisode));
    localStorage.setItem("player_episodeselector", String(episodeSelector));

    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onSave();
      onClose();
    }, 1000);
  };


  const presetColors = [
    { name: "Netflix Red", hex: "e50914" },
    { name: "Twitch Purple", hex: "9146ff" },
    { name: "Spotify Green", hex: "1db954" },
    { name: "Cyberpunk Cyan", hex: "00f0ff" },
    { name: "Gold", hex: "ffb800" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div 
        className="relative w-full max-w-lg bg-[#181818] border border-white/10 text-white rounded-lg overflow-hidden shadow-2xl animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sliders className="text-[#e50914]" size={24} />
            Player & API Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* TMDB API Key */}
          <div className="space-y-2">
            <label className="text-sm font-semibold tracking-wide uppercase text-gray-400 flex items-center gap-2">
              <Key size={16} />
              TMDB API Key (Optional)
            </label>
            <input 
              type="password"
              placeholder="Paste TMDB API Key (v3 auth)..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#2f2f2f] text-white px-4 py-3 rounded border border-transparent focus:border-white/20 focus:outline-none transition duration-200 text-sm font-mono"
            />
            <p className="text-xs text-gray-500 leading-relaxed">
              Unlock the massive database of millions of live movies, TV series, real-time search, and season/episode meta. Get a free developer key at{" "}
              <a 
                href="https://www.themoviedb.org/" 
                target="_blank" 
                rel="noreferrer"
                className="text-[#e50914] hover:underline"
              >
                themoviedb.org
              </a>. Leaving this empty runs our high-quality hand-curated catalog!
            </p>
          </div>

          {/* TMDB API Base URL (For bypassing ISP blocks in India!) */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-sm font-semibold tracking-wide uppercase text-gray-400 flex items-center gap-2">
              <Sliders size={16} />
              API Server Base URL
            </label>
            <input 
              type="text"
              placeholder="https://api.tmdb.org/3"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-[#2f2f2f] text-white px-4 py-2.5 rounded border border-transparent focus:border-white/20 focus:outline-none transition duration-200 text-xs font-mono"
            />
            <p className="text-xs text-gray-500 leading-relaxed">
              If TMDB is blocked in your region (e.g. India), the default unblocked subdomain <span className="font-semibold text-gray-300">api.tmdb.org</span> is used to load all dynamic libraries successfully. You can also specify any custom TMDB reverse proxy base.
            </p>
          </div>

          {/* Image Proxy (For bypassing ISP blocks on TMDB image CDN!) */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <h4 className="text-sm font-medium">Bypass TMDB Image Blocks</h4>
              <p className="text-xs text-gray-500">Bypasses ISP image blocking using Cloudflare cache proxy (weserv)</p>
            </div>
            <input
              type="checkbox"
              checked={useImageProxy}
              onChange={(e) => setUseImageProxy(e.target.checked)}
              className="w-5 h-5 rounded accent-[#e50914] cursor-pointer bg-[#2f2f2f] border-transparent"
            />
          </div>


          {/* Player Custom Color */}
          <div className="space-y-3">
            <label className="text-sm font-semibold tracking-wide uppercase text-gray-400 flex items-center gap-2">
              <Palette size={16} />
              Player Accent Color
            </label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setPlayerColor(color.hex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition duration-200 ${
                    playerColor.toLowerCase() === color.hex.toLowerCase()
                      ? "bg-white text-black border-white"
                      : "bg-[#2f2f2f] text-gray-300 border-white/5 hover:border-white/20"
                  }`}
                >
                  <span 
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: `#${color.hex}` }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Custom Hex:</span>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-500 font-mono">#</span>
                <input
                  type="text"
                  maxLength={6}
                  value={playerColor}
                  onChange={(e) => setPlayerColor(e.target.value.replace(/[^a-fA-F0-9]/g, ""))}
                  className="w-28 bg-[#2f2f2f] text-white pl-6 pr-3 py-1.5 rounded border border-transparent focus:border-white/20 focus:outline-none transition duration-200 text-xs font-mono"
                  placeholder="e50914"
                />
              </div>
            </div>
          </div>

          {/* VidKing Parameters */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <label className="text-sm font-semibold tracking-wide uppercase text-gray-400 flex items-center gap-2">
              <Play size={16} />
              Player Features (VidKing)
            </label>
            
            <div className="space-y-3">
              {/* Autoplay */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Auto-Play</h4>
                  <p className="text-xs text-gray-500">Enable videos to start automatically on load</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#e50914] cursor-pointer bg-[#2f2f2f] border-transparent"
                />
              </div>

              {/* Next Episode overlay */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Show Next Episode Button</h4>
                  <p className="text-xs text-gray-500">Quick play overlay for TV shows inside player</p>
                </div>
                <input
                  type="checkbox"
                  checked={nextEpisode}
                  onChange={(e) => setNextEpisode(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#e50914] cursor-pointer bg-[#2f2f2f] border-transparent"
                />
              </div>

              {/* Episode Selector menu */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Enable Player Episode Selector</h4>
                  <p className="text-xs text-gray-500">VidKing built-in episode list drawer</p>
                </div>
                <input
                  type="checkbox"
                  checked={episodeSelector}
                  onChange={(e) => setEpisodeSelector(e.target.checked)}
                  className="w-5 h-5 rounded accent-[#e50914] cursor-pointer bg-[#2f2f2f] border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#121212]">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-transparent border border-white/20 rounded font-semibold text-sm text-gray-300 hover:text-white hover:border-white/40 transition duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#e50914] hover:bg-[#b80710] text-white rounded font-semibold text-sm transition duration-200"
          >
            Save Settings
          </button>
        </div>

        {/* Saved Confirmation Toast */}
        {showSavedToast && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center animate-fade-in z-55">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
              <Check size={28} className="text-white" />
            </div>
            <p className="text-lg font-bold">Settings Saved Successfully!</p>
            <p className="text-xs text-gray-400 mt-1">Applying and updating catalogs...</p>
          </div>
        )}
      </div>
    </div>
  );
}
