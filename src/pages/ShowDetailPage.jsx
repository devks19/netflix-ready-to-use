import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Plus, Check, Star, ThumbsUp, Calendar, Clock, Volume2, Film } from "lucide-react";
import { api } from "../services/api";

export default function ShowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(null);
  const [activeSeason, setActiveSeason] = useState(1);
  const [watchProgress, setWatchProgress] = useState(null);
  
  // Watchlist state
  const [myList, setMyList] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);

  // 1. Fetch Show details & load progress on ID change
  useEffect(() => {
    async function loadShowData() {
      setLoading(true);
      try {
        const data = await api.fetchDetails("tv", id);
        setShow(data);

        // Auto-select season based on saved history, if available
        const savedProgress = localStorage.getItem(`watch_progress_${id}`);
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          setWatchProgress(progress);
          if (progress.season) {
            setActiveSeason(progress.season);
          }
        } else {
          setWatchProgress(null);
          setActiveSeason(1);
        }
      } catch (err) {
        console.error("Failed to load show details on page", err);
      } finally {
        setLoading(false);
      }
    }
    loadShowData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // 2. Manage watchlists
  useEffect(() => {
    try {
      const savedList = localStorage.getItem("netflix_mylist");
      if (savedList) {
        const parsed = JSON.parse(savedList);
        setMyList(parsed);
        setIsBookmarked(parsed.includes(id));
      }
    } catch (e) {
      console.error("Failed to load bookmarks inside show details page", e);
    }
  }, [id]);

  const handleToggleMyList = (e) => {
    e.stopPropagation();
    let updated = [];
    if (myList.includes(id)) {
      updated = myList.filter((x) => x !== id);
      setIsBookmarked(false);
    } else {
      updated = [id, ...myList];
      setIsBookmarked(true);
    }
    setMyList(updated);
    localStorage.setItem("netflix_mylist", JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center gap-4">
        <span className="text-[#e50914] text-4xl font-black tracking-tighter uppercase animate-pulse select-none">
          NETFLIX
        </span>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#e50914] animate-spin" />
          Loading show workspace...
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center gap-6">
        <Film size={50} className="text-gray-500 animate-bounce" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Show Not Found</h2>
          <p className="text-xs text-gray-400 max-w-sm">We couldn't fetch details for this TV Show. It might have been removed or API limits were exceeded.</p>
        </div>
        <button 
          onClick={() => navigate("/")}
          className="px-6 py-2.5 bg-white text-black font-bold rounded hover:bg-white/80 transition duration-200 flex items-center gap-2 cursor-pointer text-sm"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    );
  }

  // Retrieve current season episode listing
  const currentSeasonEpisodes = show.seasons?.find(
    (s) => s.season_number === activeSeason
  )?.episodes || [];

  const handlePlayEpisode = (seasonNum, episodeNum) => {
    navigate(`/watch/tv/${show.id}/${seasonNum}/${episodeNum}`);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans select-none pb-24">
      {/* 1. Cinematic Billboard Banner */}
      <div className="relative h-[55vh] sm:h-[70vh] w-full overflow-hidden">
        <img 
          src={show.backdrop_path} 
          alt={show.title}
          className="w-full h-full object-cover brightness-[0.6] transform scale-102 transition duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/60" />
        
        {/* Floating Actions Header */}
        <div className="absolute top-0 left-0 right-0 p-6 sm:p-12 flex items-center justify-between z-30">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black/60 border border-white/10 hover:border-white rounded-full text-white hover:bg-black/95 transition duration-200 cursor-pointer shadow-md text-xs sm:text-sm font-semibold"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-[#e50914] text-xl sm:text-2xl font-black tracking-tighter uppercase cursor-pointer select-none" onClick={() => navigate("/")}>
            NETFLIX
          </span>
        </div>

        {/* Title and Play Banner */}
        <div className="absolute bottom-10 left-6 right-6 sm:left-12 sm:right-12 md:left-20 md:right-20 z-10 space-y-4 text-left">
          <span className="text-xs font-black tracking-widest bg-red-600 px-2 py-0.5 rounded uppercase select-none inline-block">
            TV SERIES
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight drop-shadow-xl max-w-2xl leading-none">
            {show.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Play Button (Auto launches latest watched or S1:E1) */}
            <button 
              onClick={() => handlePlayEpisode(watchProgress?.season || 1, watchProgress?.episode || 1)}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-black hover:bg-white/80 rounded font-black text-sm sm:text-base transition duration-200 shadow-lg cursor-pointer transform hover:scale-103"
            >
              <Play size={20} className="fill-black text-black ml-0.5" />
              {watchProgress ? `Resume S${watchProgress.season}:E${watchProgress.episode}` : "Play Season 1 Ep 1"}
            </button>

            {/* Watchlist Toggle */}
            <button 
              onClick={handleToggleMyList}
              className="w-11 h-11 rounded-full border border-white/40 bg-black/40 hover:bg-black/60 flex items-center justify-center hover:border-white transition duration-200 text-gray-200 hover:text-white"
              title={isBookmarked ? "Remove from List" : "Add to My List"}
            >
              {isBookmarked ? <Check size={22} className="text-green-500" /> : <Plus size={22} />}
            </button>

            {/* Like Toggle */}
            <button 
              onClick={() => setLiked(!liked)}
              className="w-11 h-11 rounded-full border border-white/40 bg-black/40 hover:bg-black/60 flex items-center justify-center hover:border-white transition duration-200 text-gray-200 hover:text-white"
              title="Like"
            >
              <ThumbsUp size={18} className={liked ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Structured Content Panel */}
      <div className="px-6 sm:px-12 md:px-20 mt-8 sm:mt-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Left Summary Details Column */}
          <div className="md:col-span-2 space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-3.5 text-xs sm:text-sm font-semibold">
              <span className="text-green-500 font-bold text-base">{show.match_percentage}% Match</span>
              <span className="text-gray-400 flex items-center gap-1">
                <Calendar size={14} />
                {show.release_date ? show.release_date.split("-")[0] : "2024"}
              </span>
              {show.age_rating && (
                <span className="text-[10px] border border-white/30 px-2 py-0.5 rounded text-gray-300 uppercase font-bold tracking-wide">
                  {show.age_rating}
                </span>
              )}
              {show.seasons_count > 0 && (
                <span className="text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px] font-bold">
                  {show.seasons_count} {show.seasons_count === 1 ? "Season" : "Seasons"}
                </span>
              )}
            </div>

            {/* Play progress warning */}
            {watchProgress && (
              <div className="bg-[#2f2f2f]/30 border border-white/10 rounded-lg p-4 text-xs sm:text-sm text-gray-300 flex justify-between items-center gap-6">
                <div>
                  <span className="font-bold text-white block text-sm mb-0.5">Continue Watching</span>
                  <span>Completed {Math.round(watchProgress.progress)}% of Season {watchProgress.season} Episode {watchProgress.episode}</span>
                </div>
                <div className="w-32 bg-gray-700 h-2 rounded overflow-hidden flex-shrink-0">
                  <div className="bg-[#e50914] h-full transition-all duration-300" style={{ width: `${watchProgress.progress}%` }} />
                </div>
              </div>
            )}

            {/* Overview */}
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-light">
              {show.overview}
            </p>
          </div>

          {/* Right Information Metadata Column */}
          <div className="space-y-5 text-left text-sm border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
            <div>
              <span className="text-gray-400 block text-xs uppercase font-bold tracking-wider mb-0.5">Genres</span>
              <span className="text-gray-200 font-semibold">{show.genres.join(", ")}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-xs uppercase font-bold tracking-wider mb-0.5">Rating</span>
              <span className="text-gray-200 font-bold flex items-center gap-1 mt-0.5 text-base">
                <Star size={16} className="fill-yellow-500 text-yellow-500" />
                {show.vote_average.toFixed(1)} <span className="text-xs text-gray-400 font-normal">/ 10</span>
              </span>
            </div>
            <div className="pt-2">
              <span className="text-[10px] bg-white/5 border border-white/5 text-gray-400 px-3 py-2 rounded block text-center font-bold tracking-wider uppercase select-none">
                Audio: English, Hindi, Spanish
              </span>
            </div>
          </div>
        </div>

        {/* 3. Seasons & Episode Section */}
        {show.seasons && show.seasons.length > 0 && (
          <div className="border-t border-white/10 pt-10 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">Episodes</h3>
              
              {/* Season Selection Dropdown */}
              <select
                value={activeSeason}
                onChange={(e) => setActiveSeason(Number(e.target.value))}
                className="bg-[#202020] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-md focus:outline-none border border-white/10 cursor-pointer hover:bg-[#303030] transition duration-200"
              >
                {show.seasons.map((season) => (
                  <option key={season.season_number} value={season.season_number}>
                    {season.name || `Season ${season.season_number}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Episode List Cards */}
            <div className="grid grid-cols-1 gap-4">
              {currentSeasonEpisodes.length === 0 ? (
                <p className="text-gray-500 text-xs italic">Loading episodes list...</p>
              ) : (
                currentSeasonEpisodes.map((episode) => (
                  <div 
                    key={episode.episode_number}
                    onClick={() => handlePlayEpisode(activeSeason, episode.episode_number)}
                    className="group flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-[#202020]/20 border border-white/5 hover:bg-[#202020]/60 transition duration-200 cursor-pointer"
                  >
                    {/* Thumbnail Picture */}
                    <div className="relative w-full sm:w-48 aspect-video bg-[#2f2f2f] rounded flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                      <img 
                        src={episode.still_path || show.backdrop_path} 
                        alt="" 
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play size={24} className="fill-white text-white transform scale-90 group-hover:scale-100 transition-transform duration-300" />
                      </div>
                      <span className="absolute bottom-2 left-2 text-[9px] font-black bg-black/75 px-2 py-0.5 rounded tracking-widest uppercase">
                        Ep {episode.episode_number}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-white text-sm sm:text-base font-bold group-hover:text-[#e50914] transition duration-200">
                          {episode.episode_number}. {episode.title}
                        </h4>
                        <span className="text-gray-400 text-xs font-semibold whitespace-nowrap">{episode.runtime}</span>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm font-light leading-relaxed line-clamp-3">
                        {episode.overview}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. More Like This Suggestions */}
        {show.similar && show.similar.length > 0 && (
          <div className="border-t border-white/10 pt-10 space-y-6 text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {show.similar.map((similarItem) => (
                <div 
                  key={similarItem.id}
                  onClick={() => navigate(`/show/${similarItem.id}`)}
                  className="group bg-[#1c1c1c] rounded-md overflow-hidden cursor-pointer shadow-md border border-white/5 hover:border-white/15 transition duration-200 flex flex-col h-full"
                >
                  <div className="relative aspect-video">
                    <img 
                      src={similarItem.backdrop_path || similarItem.poster_path} 
                      alt={similarItem.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition duration-200" />
                  </div>
                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-white text-xs sm:text-sm font-bold truncate group-hover:text-[#e50914] transition duration-200">
                        {similarItem.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] font-semibold text-green-500">
                        <span>{similarItem.match_percentage}% Match</span>
                        <span className="text-gray-400 font-normal">| {similarItem.release_date ? similarItem.release_date.split("-")[0] : "2024"}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-[10px] leading-relaxed line-clamp-3 font-light">
                      {similarItem.overview}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
