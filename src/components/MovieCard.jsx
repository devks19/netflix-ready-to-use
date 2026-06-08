import React, { useState, useEffect } from "react";
import { Play, Plus, Check, ChevronDown, ThumbsUp, X } from "lucide-react";

export default function MovieCard({ movie, onPlay, onOpenDetail, myList, onToggleMyList, isFirst, isLast, onRemoveFromContinueWatching }) {
  const [isHovered, setIsHovered] = useState(false);
  const [watchProgress, setWatchProgress] = useState(null);

  // Check watch progress in localStorage
  useEffect(() => {
    try {
      const historyKey = `watch_progress_${movie.id}`;
      const savedProgress = localStorage.getItem(historyKey);
      if (savedProgress) {
        const data = JSON.parse(savedProgress);
        if (data && data.progress > 0) {
          setWatchProgress(data);
        }
      }
    } catch (e) {
      console.error("Error reading progress for card", e);
    }
  }, [movie.id, isHovered]);

  const isBookmarked = myList.includes(movie.id);

  // Dynamically compute hover popover positioning to avoid horizontal boundary cropping
  let hoverPositionClass = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  let transformOrigin = "center";

  if (isFirst) {
    hoverPositionClass = "top-1/2 left-0 -translate-y-1/2";
    transformOrigin = "left center";
  } else if (isLast) {
    hoverPositionClass = "top-1/2 right-0 translate-x-0 -translate-y-1/2";
    transformOrigin = "right center";
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex-none w-[160px] sm:w-[220px] md:w-[260px] h-[90px] sm:h-[125px] md:h-[145px] rounded bg-[#181818] cursor-pointer movie-card-transition transition-transform duration-300"
    >
      {/* Primary Poster Image */}
      <img
        src={movie.backdrop_path || movie.poster_path}
        alt={movie.title}
        className="w-full h-full object-cover rounded shadow-md border border-white/5"
      />

      {/* Embedded Dynamic Red Progress Bar (Continue Watching) */}
      {watchProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 rounded-b">
          <div 
            className="h-full bg-[#e50914] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(2, watchProgress.progress))}%` }}
          />
        </div>
      )}

      {/* Expanded Hover Overlay Details Card */}
      {isHovered && (
        <div 
          className={`absolute bg-[#181818] rounded-md shadow-2xl z-20 border border-white/10 animate-zoom-in pointer-events-auto w-[220px] sm:w-[280px] md:w-[320px] ${hoverPositionClass}`}
          style={{ transformOrigin }}
        >
          {/* Zoom Image */}
          <div className="relative h-[120px] sm:h-[150px] md:h-[180px]" onClick={() => onPlay(movie)}>
            <img
              src={movie.backdrop_path || movie.poster_path}
              alt={movie.title}
              className="w-full h-full object-cover rounded-t-md"
            />
            <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition duration-300" />
            
            {/* Overlay progress inside hover */}
            {watchProgress && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700">
                <div 
                  className="h-full bg-[#e50914]"
                  style={{ width: `${Math.min(100, Math.max(2, watchProgress.progress))}%` }}
                />
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="p-4 space-y-3">
            {/* Quick Actions Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play action */}
                <button
                  onClick={() => onPlay(movie)}
                  className="w-9 h-9 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center transition duration-200"
                  title="Play"
                >
                  <Play size={18} className="fill-black text-black ml-0.5" />
                </button>

                {/* Bookmark List Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMyList(movie.id);
                  }}
                  className="w-9 h-9 rounded-full border border-white/40 hover:border-white flex items-center justify-center transition duration-200 text-gray-200 hover:text-white"
                  title={isBookmarked ? "Remove from List" : "Add to My List"}
                >
                  {isBookmarked ? <Check size={18} /> : <Plus size={18} />}
                </button>

                {/* Thumbs up */}
                <button
                  className="w-9 h-9 rounded-full border border-white/40 hover:border-white flex items-center justify-center transition duration-200 text-gray-200 hover:text-white"
                  title="Like"
                >
                  <ThumbsUp size={16} />
                </button>

                {/* Remove from Continue Watching */}
                {onRemoveFromContinueWatching && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromContinueWatching(movie.id);
                    }}
                    className="w-9 h-9 rounded-full border border-white/40 hover:border-[#e50914] hover:bg-[#e50914]/10 hover:text-[#e50914] flex items-center justify-center transition duration-200 text-gray-200"
                    title="Remove from Continue Watching"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Toggle Info Modal */}
              <button
                onClick={() => onOpenDetail(movie)}
                className="w-9 h-9 rounded-full border border-white/40 hover:border-white flex items-center justify-center transition duration-200 text-gray-200 hover:text-white"
                title="Episode details & More info"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Title & Metadata Info */}
            <div className="space-y-1 text-left">
              <h4 className="text-white text-sm font-bold truncate">{movie.title}</h4>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-green-500">{movie.match_percentage}% Match</span>
                <span className="text-gray-400">{movie.release_date ? movie.release_date.split("-")[0] : "2024"}</span>
                {movie.age_rating && (
                  <span className="text-[9px] border border-white/30 px-1 rounded text-gray-400 uppercase">
                    {movie.age_rating}
                  </span>
                )}
              </div>
            </div>

            {/* Genres Tag list */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {movie.genres.slice(0, 3).map((genre, idx) => (
                <span key={genre} className="text-[10px] text-gray-300 font-medium">
                  {genre}{idx < Math.min(movie.genres.length, 3) - 1 ? " • " : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
