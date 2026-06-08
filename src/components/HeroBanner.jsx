import React from "react";
import { Play, Info, ThumbsUp, Plus } from "lucide-react";

export default function HeroBanner({ movie, onPlay, onOpenDetail }) {
  if (!movie) return null;

  return (
    <div className="relative h-[56.25vw] md:h-[80vh] w-full bg-black select-none overflow-hidden animate-fade-in">
      {/* Background HD Image */}
      <img
        src={movie.backdrop_path}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover brightness-[0.6] scale-105 transition-all duration-1000 ease-out"
      />

      {/* Cinematic Dark Overlays */}
      <div className="absolute inset-0 netflix-gradient-left" />
      <div className="absolute inset-0 netflix-gradient-bottom" />

      {/* Meta Content */}
      <div className="absolute bottom-[24%] md:bottom-[30%] left-4 md:left-12 max-w-2xl space-y-4 md:space-y-6 z-10">
        {/* Category Label */}
        <span className="inline-block text-[10px] md:text-xs font-bold tracking-widest text-[#e50914] uppercase border border-[#e50914]/40 px-2 py-0.5 rounded bg-black/40">
          Featured {movie.media_type === "tv" ? "TV Series" : "Movie"}
        </span>

        {/* Title */}
        <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
          {movie.title}
        </h1>

        {/* Dynamic Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-semibold">
          <span className="text-green-500 font-black">{movie.match_percentage}% Match</span>
          <span className="text-gray-300">{movie.release_date.split("-")[0]}</span>
          {movie.age_rating && (
            <span className="text-[10px] md:text-xs border border-white/30 px-1.5 py-0.2 rounded text-gray-300">
              {movie.age_rating}
            </span>
          )}
          {movie.duration && <span className="text-gray-300">{movie.duration}</span>}
          {movie.seasons_count > 0 && <span className="text-gray-300">{movie.seasons_count} {movie.seasons_count === 1 ? "Season" : "Seasons"}</span>}
        </div>

        {/* Overview */}
        <p className="hidden sm:block text-sm md:text-base text-gray-200 leading-relaxed font-normal drop-shadow max-w-xl md:max-w-2xl line-clamp-3 md:line-clamp-4">
          {movie.overview}
        </p>

        {/* Actions Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {/* Play CTA */}
          <button
            onClick={() => onPlay(movie)}
            className="flex items-center justify-center gap-2 px-5 md:px-8 py-2 md:py-3.5 bg-white text-black hover:bg-white/80 rounded font-bold text-sm md:text-base transition duration-300 shadow-lg cursor-pointer transform hover:scale-[1.03]"
          >
            <Play size={20} className="fill-black" />
            Play
          </button>

          {/* More Info CTA */}
          <button
            onClick={() => onOpenDetail(movie)}
            className="flex items-center justify-center gap-2 px-5 md:px-7 py-2 md:py-3.5 bg-gray-500/40 text-white hover:bg-gray-500/60 rounded font-bold text-sm md:text-base transition duration-300 backdrop-blur-sm cursor-pointer border border-white/5 transform hover:scale-[1.03]"
          >
            <Info size={20} />
            More Info
          </button>
        </div>
      </div>

      {/* Dynamic Sidebar Accent Indicator */}
      <div className="absolute right-0 bottom-[24%] md:bottom-[30%] bg-black/60 border-l-4 border-[#e50914] px-4 py-1.5 hidden md:flex items-center text-xs font-bold text-gray-300 z-10 backdrop-blur-md">
        <span>Dolby Atmos | Ultra HD 4K</span>
      </div>
    </div>
  );
}
