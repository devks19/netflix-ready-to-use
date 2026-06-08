import React, { useState, useEffect } from "react";
import { X, Play, Plus, Check, ThumbsUp, Volume2, Calendar, Star, Clock } from "lucide-react";

export default function DetailModal({ movie, isOpen, onClose, onPlay, myList, onToggleMyList }) {
  const [activeSeason, setActiveSeason] = useState(1);
  const [watchProgress, setWatchProgress] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setActiveSeason(1);
      // Fetch progress
      try {
        const progressData = localStorage.getItem(`watch_progress_${movie.id}`);
        if (progressData) {
          setWatchProgress(JSON.parse(progressData));
        } else {
          setWatchProgress(null);
        }
      } catch (e) {
        console.error("Error reading progress for modal", e);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, movie]);

  if (!isOpen || !movie) return null;

  const isBookmarked = myList.includes(movie.id);

  // Retrieve current season episode listing
  const currentSeasonEpisodes = movie.seasons?.find(
    (s) => s.season_number === activeSeason
  )?.episodes || [];

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center bg-black/80 backdrop-blur-sm overflow-y-auto px-4 py-8 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#181818] text-white rounded-lg overflow-hidden shadow-2xl animate-zoom-in my-auto self-start border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-black/70 rounded-full border border-white/10 hover:border-white text-white hover:bg-black/90 transition duration-200"
        >
          <X size={20} />
        </button>

        {/* Backdrop Banner */}
        <div className="relative h-[250px] sm:h-[400px] w-full">
          <img 
            src={movie.backdrop_path} 
            alt={movie.title}
            className="w-full h-full object-cover brightness-[0.7]" 
          />
          <div className="absolute inset-0 netflix-gradient-bottom" />
          
          {/* Headline and Buttons */}
          <div className="absolute bottom-6 left-6 right-6 md:left-12 md:right-12 z-10 space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight drop-shadow-md">
              {movie.title}
            </h1>
            
            <div className="flex items-center flex-wrap gap-3">
              {/* Play Button */}
              <button 
                onClick={() => onPlay(movie)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-white/80 rounded font-bold text-sm sm:text-base transition duration-200 shadow-md cursor-pointer"
              >
                <Play size={18} className="fill-black text-black ml-0.5" />
                Play {watchProgress && watchProgress.progress > 0 ? "Resume" : ""}
              </button>

              {/* Bookmark Add List */}
              <button 
                onClick={() => onToggleMyList(movie.id)}
                className="w-10 h-10 rounded-full border border-white/40 bg-black/40 hover:bg-black/60 flex items-center justify-center hover:border-white transition duration-200 text-gray-200 hover:text-white"
                title={isBookmarked ? "Remove from List" : "Add to My List"}
              >
                {isBookmarked ? <Check size={20} /> : <Plus size={20} />}
              </button>

              {/* Like */}
              <button className="w-10 h-10 rounded-full border border-white/40 bg-black/40 hover:bg-black/60 flex items-center justify-center hover:border-white transition duration-200 text-gray-200 hover:text-white">
                <ThumbsUp size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Info Container */}
        <div className="p-6 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
            {/* Left Description Column */}
            <div className="md:col-span-2 space-y-4 text-left">
              {/* Meta metrics */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                <span className="text-green-500 font-bold">{movie.match_percentage}% Match</span>
                <span className="text-gray-300 flex items-center gap-1">
                  <Calendar size={14} />
                  {movie.release_date ? movie.release_date.split("-")[0] : "2024"}
                </span>
                {movie.age_rating && (
                  <span className="text-xs border border-white/30 px-1.5 py-0.2 rounded text-gray-300 uppercase">
                    {movie.age_rating}
                  </span>
                )}
                {movie.duration && (
                  <span className="text-gray-300 flex items-center gap-1">
                    <Clock size={14} />
                    {movie.duration}
                  </span>
                )}
                {movie.seasons_count > 0 && (
                  <span className="text-gray-300">
                    {movie.seasons_count} {movie.seasons_count === 1 ? "Season" : "Seasons"}
                  </span>
                )}
              </div>

              {/* Display continue watching status */}
              {watchProgress && (
                <div className="bg-[#2f2f2f]/40 border border-white/10 rounded p-3 text-xs text-gray-300 flex justify-between items-center gap-4">
                  <div>
                    <span className="font-semibold text-white block">Continue Watching</span>
                    <span>Last active at: {watchProgress.season && watchProgress.episode ? `S${watchProgress.season}:E${watchProgress.episode}` : "Beginning"} ({Math.round(watchProgress.progress)}% completed)</span>
                  </div>
                  <div className="w-24 bg-gray-700 h-2 rounded overflow-hidden">
                    <div className="bg-[#e50914] h-full" style={{ width: `${watchProgress.progress}%` }} />
                  </div>
                </div>
              )}

              {/* Overview */}
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-light">
                {movie.overview}
              </p>
            </div>

            {/* Right Meta Column */}
            <div className="space-y-4 text-left text-sm border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
              <div>
                <span className="text-gray-400">Genres: </span>
                <span className="text-gray-200 font-medium">{movie.genres.join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-400">Rating: </span>
                <span className="text-gray-200 font-semibold flex items-center gap-1 mt-0.5">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  {movie.vote_average.toFixed(1)} / 10
                </span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] bg-white/10 border border-white/5 text-gray-300 px-2 py-1 rounded block text-center font-semibold">
                  Audio: English, Spanish, Hindi
                </span>
              </div>
            </div>
          </div>

          {/* Episode Section for TV Series */}
          {movie.media_type === "tv" && movie.seasons && movie.seasons.length > 0 && (
            <div className="border-t border-white/10 pt-8 space-y-6 text-left animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-2xl font-bold">Episodes</h3>
                
                {/* Season Dropdown */}
                <select
                  value={activeSeason}
                  onChange={(e) => setActiveSeason(Number(e.target.value))}
                  className="bg-[#2f2f2f] text-white font-semibold text-sm px-4 py-2 rounded focus:outline-none border border-white/10 cursor-pointer hover:bg-[#3f3f3f] transition duration-200"
                >
                  {movie.seasons.map((season) => (
                    <option key={season.season_number} value={season.season_number}>
                      {season.name || `Season ${season.season_number}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Episodes Grid List */}
              <div className="space-y-4">
                {currentSeasonEpisodes.length === 0 ? (
                  <p className="text-gray-500 text-xs italic">Loading episodes list...</p>
                ) : (
                  currentSeasonEpisodes.map((episode) => (
                    <div 
                      key={episode.episode_number}
                      onClick={() => onPlay(movie, activeSeason, episode.episode_number)}
                      className="group flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-[#2f2f2f]/10 border border-white/5 hover:bg-[#2f2f2f]/30 transition duration-200 cursor-pointer"
                    >
                      {/* Thumbnail with Play symbol */}
                      <div className="relative w-full sm:w-44 aspect-video bg-[#2f2f2f] rounded flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                        <img 
                          src={episode.still_path || movie.backdrop_path} 
                          alt="" 
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                        />

                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <Play size={20} className="fill-white text-white group-hover:scale-125 transition-transform duration-200" />
                        </div>
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/75 px-1.5 py-0.5 rounded tracking-wide">
                          Ep {episode.episode_number}
                        </span>
                      </div>

                      {/* Episode overview metadata */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-white text-base font-bold group-hover:text-[#e50914] transition duration-200">
                            {episode.episode_number}. {episode.title}
                          </h4>
                          <span className="text-gray-400 text-xs font-semibold whitespace-nowrap">{episode.runtime}</span>
                        </div>
                        <p className="text-gray-400 text-sm font-light leading-relaxed line-clamp-2 sm:line-clamp-3">
                          {episode.overview}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Similar Items Suggestions */}
          {movie.similar && movie.similar.length > 0 && (
            <div className="border-t border-white/10 pt-8 space-y-6 text-left">
              <h3 className="text-2xl font-bold">More Like This</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {movie.similar.map((similarItem) => (
                  <div 
                    key={similarItem.id}
                    onClick={() => {
                      onClose();
                      onPlay(similarItem);
                    }}
                    className="group bg-[#202020] rounded overflow-hidden cursor-pointer shadow border border-white/5 hover:border-white/20 transition duration-200 flex flex-col h-full"
                  >
                    <div className="relative aspect-video">
                      <img 
                        src={similarItem.backdrop_path || similarItem.poster_path} 
                        alt={similarItem.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition duration-200" />
                    </div>
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-white text-xs sm:text-sm font-bold truncate group-hover:text-[#e50914] transition duration-200">
                          {similarItem.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-green-500">
                          <span>{similarItem.match_percentage}% Match</span>
                          <span className="text-gray-400 font-normal">| {similarItem.release_date.split("-")[0]}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-3 font-light text-left">
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
    </div>
  );
}
