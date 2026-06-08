import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { api } from "../services/api";

export default function WatchPage() {
  const { type, id, season: routeSeason, episode: routeEpisode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  
  // Player settings from localStorage
  const color = localStorage.getItem("player_color") || "e50914";
  const autoPlay = localStorage.getItem("player_autoplay") !== "false";
  const nextEpisode = localStorage.getItem("player_nextepisode") !== "false";
  const episodeSelector = localStorage.getItem("player_episodeselector") !== "false";

  // Check saved progress to resume playback
  const [initialProgress, setInitialProgress] = useState(0);

  useEffect(() => {
    // Load metadata and calculate resume timing
    async function loadContent() {
      setLoading(true);
      try {
        const item = await api.fetchDetails(type, id);
        setDetails(item);

        // Fetch resume position in seconds
        const savedProgress = localStorage.getItem(`watch_progress_${id}`);
        if (savedProgress) {
          const data = JSON.parse(savedProgress);
          // If TV show, only resume if we are playing the same season/episode
          if (type === "tv") {
            const curS = Number(routeSeason || 1);
            const curE = Number(routeEpisode || 1);
            if (data.season === curS && data.episode === curE && data.currentTime > 5) {
              // Deduct 3 seconds to give a nice rewind feel, ensure it doesn't go negative
              setInitialProgress(Math.max(0, Math.floor(data.currentTime - 3)));
            }
          } else if (data.currentTime > 5) {
            setInitialProgress(Math.max(0, Math.floor(data.currentTime - 3)));
          }
        }
      } catch (err) {
        console.error("Error loading watch details", err);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, [type, id, routeSeason, routeEpisode]);

  // Capture IFrame Messages & Write Progress to LocalStorage
  useEffect(() => {
    const handlePlayerMessage = (event) => {
      // Security note: In a real app we might check event.origin, but here we process all messages
      try {
        if (!event.data) return;

        let payload = null;
        if (typeof event.data === "string") {
          // Check if string contains standard JSON
          if (event.data.trim().startsWith("{")) {
            payload = JSON.parse(event.data);
          } else {
            return;
          }
        } else if (typeof event.data === "object") {
          payload = event.data;
        }

        // Validate player event signature
        if (payload && payload.type === "PLAYER_EVENT") {
          const eventData = payload.data;
          const currentEvent = eventData.event;
          const currentTime = eventData.currentTime;
          const duration = eventData.duration;
          const progressPercentage = eventData.progress;

          const activeSeasonNum = type === "tv" ? Number(routeSeason || 1) : undefined;
          const activeEpisodeNum = type === "tv" ? Number(routeEpisode || 1) : undefined;

          // Record playback
          const progressRecord = {
            id,
            type,
            progress: progressPercentage,
            currentTime,
            duration,
            season: activeSeasonNum,
            episode: activeEpisodeNum,
            timestamp: Date.now()
          };

          // Save to LocalStorage under generic progress
          localStorage.setItem(`watch_progress_${id}`, JSON.stringify(progressRecord));
          
          // Save general history index list
          const historyIndexRaw = localStorage.getItem("watch_history_index") || "[]";
          const historyIndex = JSON.parse(historyIndexRaw);
          if (!historyIndex.includes(id)) {
            historyIndex.unshift(id); // Place at top
            localStorage.setItem("watch_history_index", JSON.stringify(historyIndex.slice(0, 20))); // Limit to latest 20 items
          } else {
            // Move to top of history list
            const filtered = historyIndex.filter(x => x !== id);
            filtered.unshift(id);
            localStorage.setItem("watch_history_index", JSON.stringify(filtered));
          }

          console.log(`[Watch Progress] ${movieTitle} Saved - Time: ${currentTime}s / ${duration}s (${progressPercentage}%)`);
          
          // If video ended, clear progress so it starts over next time
          if (currentEvent === "ended") {
            localStorage.removeItem(`watch_progress_${id}`);
          }
        }
      } catch (e) {
        // Safe fail for message events from browser plugins or tools
      }
    };

    window.addEventListener("message", handlePlayerMessage);
    return () => window.removeEventListener("message", handlePlayerMessage);
  }, [id, type, routeSeason, routeEpisode, details]);

  const movieTitle = details?.title || (type === "movie" ? "Movie" : "TV Show");

  // Construct iframe embed URL
  let embedUrl = "";
  if (type === "movie") {
    embedUrl = `https://www.vidking.net/embed/movie/${id}?color=${color}&autoPlay=${autoPlay}`;
    if (initialProgress > 0) {
      embedUrl += `&progress=${initialProgress}`;
    }
  } else {
    const s = routeSeason || 1;
    const e = routeEpisode || 1;
    embedUrl = `https://www.vidking.net/embed/tv/${id}/${s}/${e}?color=${color}&autoPlay=${autoPlay}&nextEpisode=${nextEpisode}&episodeSelector=${episodeSelector}`;
    if (initialProgress > 0) {
      embedUrl += `&progress=${initialProgress}`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between animate-fade-in select-none">
      {/* Floating Header (Fades out when mouse is idle in full players) */}
      <div className="absolute top-0 left-0 right-0 z-30 p-6 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4 transition-opacity duration-300 hover:opacity-100 opacity-100 group">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-black/60 border border-white/10 hover:border-white rounded-full text-white hover:bg-black/90 transition duration-200 cursor-pointer flex items-center justify-center"
          title="Back to Browse"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="text-white text-base md:text-lg font-black tracking-tight flex items-center gap-2 drop-shadow">
            {movieTitle}
            {type === "tv" && (
              <span className="text-xs bg-[#e50914] text-white px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                S{routeSeason || 1} : E{routeEpisode || 1}
              </span>
            )}
          </h2>
          {initialProgress > 0 && (
            <p className="text-xs text-gray-400 font-medium">Resuming playback from {Math.floor(initialProgress / 60)}m {initialProgress % 60}s...</p>
          )}
        </div>
      </div>

      {/* Primary Video Embed Frame */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white gap-4 bg-[#141414]">
          <Loader2 className="animate-spin text-[#e50914]" size={40} />
          <p className="text-sm font-semibold tracking-wide">Loading Netflix Secure Stream Player...</p>
        </div>
      ) : (
        <div className="relative flex-1 w-full h-full bg-black">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title={movieTitle}
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
