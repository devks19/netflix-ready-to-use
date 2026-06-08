import React, { useState, useEffect } from "react";
import { Search, Settings, Film, Menu, X } from "lucide-react";

export default function Navbar({ onOpenSettings, searchQuery, onSearchChange, activeTab, onTabChange }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "movies", label: "Movies" },
    { id: "tv", label: "TV Shows" },
    { id: "mylist", label: "My List" },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 md:px-12 transition-all duration-500 ${
        isScrolled ? "navbar-blur shadow-lg" : "bg-transparent netflix-nav-fade"
      }`}
    >
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-6 md:gap-12">
        {/* Logo */}
        <div 
          onClick={() => onTabChange("home")}
          className="flex items-center gap-1.5 cursor-pointer select-none group"
        >
          <span className="text-[#e50914] text-2xl md:text-3xl font-black tracking-tighter uppercase group-hover:scale-105 transition-transform duration-300">
            NETFLIX
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => onTabChange(link.id)}
                className={`transition duration-300 ${
                  activeTab === link.id 
                    ? "text-white font-bold" 
                    : "text-gray-300 hover:text-gray-400 font-medium"
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Search & Controls */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Interactive Search */}
        <div 
          className={`relative flex items-center h-9 transition-all duration-300 ${
            isSearchExpanded 
              ? "w-48 md:w-72 px-2.5 rounded bg-[#121212]/90 border border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.05)]" 
              : "w-9 justify-center rounded-full bg-transparent border border-transparent cursor-pointer hover:bg-white/10"
          }`}
          onClick={() => { if(!isSearchExpanded) setIsSearchExpanded(true); }}
        >
          <Search 
            size={18} 
            className={`text-gray-300 hover:text-white transition duration-200 transform hover:scale-110 flex-shrink-0 cursor-pointer ${
              isSearchExpanded ? "mr-1" : ""
            }`} 
            onClick={(e) => {
              if (isSearchExpanded && !searchQuery) {
                e.stopPropagation();
                setIsSearchExpanded(false);
              }
            }}
          />
          <input
            type="text"
            placeholder="Titles, genres, shows..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full bg-transparent text-white pl-1.5 pr-6 focus:outline-none text-xs transition-opacity duration-300 placeholder-gray-500 font-medium ${
              isSearchExpanded ? "opacity-100" : "opacity-0 pointer-events-none w-0 p-0"
            }`}
            autoFocus={isSearchExpanded}
          />
          {/* Quick Clear Reset Button */}
          {isSearchExpanded && searchQuery && (
            <X
              size={14}
              className="absolute right-2.5 text-gray-400 hover:text-white cursor-pointer transition duration-150 transform hover:scale-115"
              onClick={(e) => {
                e.stopPropagation();
                onSearchChange("");
              }}
            />
          )}
        </div>



        {/* Settings button */}
        <button 
          onClick={onOpenSettings}
          className="text-gray-300 hover:text-white transition duration-200"
          title="Settings"
        >
          <Settings size={20} className="hover:rotate-45 transition-transform duration-300" />
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-300 hover:text-white transition duration-200"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#141414] border-b border-white/10 px-6 py-4 flex flex-col gap-4 animate-fade-in z-30 md:hidden">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => {
                    onTabChange(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`text-base font-semibold w-full text-left py-1 ${
                    activeTab === link.id ? "text-[#e50914]" : "text-gray-300"
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
