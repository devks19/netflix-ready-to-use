import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Loader2, Plus, Play, Sparkles, History, HeartCrack } from "lucide-react";

import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import MovieRow from "./components/MovieRow";
import DetailModal from "./components/DetailModal";
import SettingsModal from "./components/SettingsModal";
import WatchPage from "./pages/WatchPage";
import ShowDetailPage from "./pages/ShowDetailPage";
import { api, getApiKey, isLiveMode } from "./services/api";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab & Search States
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [liveMode, setLiveMode] = useState(isLiveMode());

  // Bookmark My List & History Progress States
  const [myList, setMyList] = useState([]);
  const [myListItems, setMyListItems] = useState([]);
  const [continueWatchingItems, setContinueWatchingItems] = useState([]);

  // Active modal details
  const [activeDetailItem, setActiveDetailItem] = useState(null);

  // Rows and Loader States
  const [loading, setLoading] = useState(true);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [rows, setRows] = useState({
    trending: [],
    originals: [],
    topRated: [],
    action: [],
    comedy: [],
    bollywoodMovies: [],
    bollywoodShows: [],
  });

  // 1. Initial State Load (Bookmarks & History Indexes)
  useEffect(() => {
    try {
      const savedList = localStorage.getItem("netflix_mylist");
      if (savedList) {
        setMyList(JSON.parse(savedList));
      }
    } catch (e) {
      console.error("Failed to load My List bookmarks", e);
    }
  }, []);

  // 2. Fetch Movie Collections (Fired on launch & Settings saved)
  const fetchMovieData = async () => {
    setLoading(true);
    try {
      const [trending, originals, topRated, action, comedy, bollywoodMovies, bollywoodShows] = await Promise.all([
        api.fetchTrending(),
        api.fetchNetflixOriginals(),
        api.fetchTopRatedMovies(),
        api.fetchActionMovies(),
        api.fetchComedyMovies(),
        api.fetchBollywoodMovies(),
        api.fetchBollywoodShows(),
      ]);

      setRows({
        trending: trending || [],
        originals: originals || [],
        topRated: topRated || [],
        action: action || [],
        comedy: comedy || [],
        bollywoodMovies: bollywoodMovies || [],
        bollywoodShows: bollywoodShows || [],
      });

      // Set Featured Hero Billboard Movie (Take first item in trending or originals)
      const listToPick = originals.length > 0 ? originals : trending;
      if (listToPick.length > 0) {
        // Pick a nice random index or first item
        setFeaturedMovie(listToPick[0]);
      }
    } catch (err) {
      console.error("Error loading movie catalog rows", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieData();
  }, [liveMode]);

  // 3. Load Continue Watching & My List detailed lists
  const loadCustomCollections = async () => {
    try {
      // A. Load Bookmarks Details
      if (myList.length > 0) {
        const items = await Promise.all(
          myList.map(async (id) => {
            // Find in mock first or search through current row memories
            const allCurrentInMemory = [
              ...rows.trending,
              ...rows.originals,
              ...rows.topRated,
              ...rows.action,
              ...rows.comedy,
              ...rows.bollywoodMovies,
              ...rows.bollywoodShows,
            ];
            const matchedMemory = allCurrentInMemory.find((m) => String(m.id) === String(id));
            if (matchedMemory) return matchedMemory;

            // Otherwise, fetch fresh details
            const isMovieId = isNaN(Number(id)) || Number(id) > 200000; // rough heuristic
            return await api.fetchDetails(isMovieId ? "movie" : "tv", id);
          })
        );
        setMyListItems(items.filter(Boolean));
      } else {
        setMyListItems([]);
      }

      // B. Load Continue Watching History details
      const historyIndexRaw = localStorage.getItem("watch_history_index") || "[]";
      const historyIndex = JSON.parse(historyIndexRaw);

      if (historyIndex.length > 0) {
        const items = await Promise.all(
          historyIndex.map(async (id) => {
            const savedProgress = localStorage.getItem(`watch_progress_${id}`);
            if (!savedProgress) return null;

            const progressData = JSON.parse(savedProgress);
            const allCurrentInMemory = [
              ...rows.trending,
              ...rows.originals,
              ...rows.topRated,
              ...rows.action,
              ...rows.comedy,
              ...rows.bollywoodMovies,
              ...rows.bollywoodShows,
            ];

            let matched = allCurrentInMemory.find((m) => String(m.id) === String(id));
            if (!matched) {
              matched = await api.fetchDetails(progressData.type, id);
            }
            return {
              ...matched,
              // Attach latest active season/episode details if TV
              watchData: progressData,
            };
          })
        );
        setContinueWatchingItems(items.filter(Boolean));
      } else {
        setContinueWatchingItems([]);
      }
    } catch (e) {
      console.error("Error loading customized lists details", e);
    }
  };

  useEffect(() => {
    loadCustomCollections();
  }, [myList, rows, location]); // reload when bookmarks change or route navigations complete

  // 4. Live Search Handler
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const results = await api.searchContent(searchQuery.trim());
          setSearchResults(results);
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // 5. Actions Handlers
  const handlePlayContent = (movie, seasonNum, episodeNum) => {
    setActiveDetailItem(null);
    if (movie.media_type === "tv") {
      // TV Play routing
      const s = seasonNum || movie.watchData?.season || 1;
      const e = episodeNum || movie.watchData?.episode || 1;
      navigate(`/watch/tv/${movie.id}/${s}/${e}`);
    } else {
      // Movie Play routing
      navigate(`/watch/movie/${movie.id}`);
    }
  };

  const handleToggleMyList = (id) => {
    let updated = [];
    if (myList.includes(id)) {
      updated = myList.filter((x) => x !== id);
    } else {
      updated = [id, ...myList];
    }
    setMyList(updated);
    localStorage.setItem("netflix_mylist", JSON.stringify(updated));
  };

  const handleRemoveFromContinueWatching = (id) => {
    try {
      const historyIndexRaw = localStorage.getItem("watch_history_index") || "[]";
      let historyIndex = JSON.parse(historyIndexRaw);
      historyIndex = historyIndex.filter((x) => String(x) !== String(id));
      localStorage.setItem("watch_history_index", JSON.stringify(historyIndex));
      localStorage.removeItem(`watch_progress_${id}`);
      loadCustomCollections();
    } catch (e) {
      console.error("Failed to remove item from continue watching history", e);
    }
  };

  const handleOpenDetail = (item) => {
    if (!item) return;
    if (item.media_type === "tv") {
      navigate(`/show/${item.id}`);
    } else {
      setActiveDetailItem(item);
    }
  };

  const handleSettingsSave = () => {
    setLiveMode(isLiveMode());
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans">
      {/* Top Glassmorphic Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery(""); // Clear search on tab switch
        }}
      />

      {/* Main view container */}
      <main className="flex-1 w-full pb-20">
        {loading ? (
          /* Mega Cinematic Loading Screen */
          <div className="fixed inset-0 bg-[#141414] flex flex-col items-center justify-center gap-4 z-40">
            <span className="text-[#e50914] text-5xl font-black tracking-tighter uppercase animate-pulse select-none">
              NETFLIX
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
              <Loader2 className="animate-spin text-[#e50914]" size={16} />
              Loading catalogs...
            </div>
          </div>
        ) : searchQuery.trim().length > 1 ? (
          /* Search Results View grid */
          <div className="pt-24 px-4 md:px-12 space-y-8 animate-fade-in">
            <div className="text-left">
              <h1 className="text-xl md:text-3xl font-extrabold tracking-wide text-white">
                Search Results for "{searchQuery}"
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {isSearching ? "Searching TMDB..." : `Found ${searchResults.length} matches`}
              </p>
            </div>

            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                <HeartCrack size={48} className="text-[#e50914]/60" />
                <p className="text-base font-semibold">No movies or TV shows matches found.</p>
                <p className="text-xs text-gray-500 max-w-sm text-center leading-relaxed">
                  Try typing correct names, or activate Developer mode in Settings for access to millions of TMDB titles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="group flex flex-col cursor-pointer bg-[#181818] rounded overflow-hidden shadow border border-white/5 hover:border-white/20 transition duration-200"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={item.backdrop_path || item.poster_path}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition duration-200 flex items-center justify-center">
                        <Play size={20} className="fill-white text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <div className="p-3 text-left space-y-1">
                      <h4 className="text-white text-xs sm:text-sm font-bold truncate group-hover:text-[#e50914] transition duration-200">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-green-500">
                        <span>{item.match_percentage}% Match</span>
                        <span className="text-gray-400 font-normal uppercase">
                          | {item.media_type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "home" ? (
          /* Standard dashboard home browse */
          <div className="space-y-8 pb-10">
            {/* Top Billboard Hero */}
            <HeroBanner
              movie={featuredMovie}
              onPlay={handlePlayContent}
              onOpenDetail={handleOpenDetail}
            />

            {/* Continue Watching Row (Always on top if history exists!) */}
            {continueWatchingItems.length > 0 && (
              <div className="-mt-12 sm:-mt-20 md:-mt-28 relative z-20">
                <MovieRow
                  title="Continue Watching"
                  movies={continueWatchingItems}
                  onPlay={handlePlayContent}
                  onOpenDetail={handleOpenDetail}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                  onRemoveFromContinueWatching={handleRemoveFromContinueWatching}
                />
              </div>
            )}

            {/* Movie Category Rows */}
            <div className={continueWatchingItems.length > 0 ? "space-y-8" : "-mt-12 sm:-mt-20 md:-mt-28 relative z-20 space-y-8"}>
              <MovieRow
                title="Trending Now"
                movies={rows.trending}
                onPlay={handlePlayContent}
                onOpenDetail={handleOpenDetail}
                myList={myList}
                onToggleMyList={handleToggleMyList}
              />
              <MovieRow
                title="Netflix Originals"
                movies={rows.originals}
                onPlay={handlePlayContent}
                onOpenDetail={handleOpenDetail}
                myList={myList}
                onToggleMyList={handleToggleMyList}
              />
              <MovieRow
                title="Bollywood Blockbuster Movies"
                movies={rows.bollywoodMovies}
                onPlay={handlePlayContent}
                onOpenDetail={handleOpenDetail}
                myList={myList}
                onToggleMyList={handleToggleMyList}
              />
              <MovieRow
                title="Bollywood Hit Shows"
                movies={rows.bollywoodShows}
                onPlay={handlePlayContent}
                onOpenDetail={handleOpenDetail}
                myList={myList}
                onToggleMyList={handleToggleMyList}
              />
              <MovieRow
                title="Top Rated Blockbusters"
                movies={rows.topRated}
                onPlay={handlePlayContent}
                onOpenDetail={handleOpenDetail}
                myList={myList}
                onToggleMyList={handleToggleMyList}
              />
              <MovieRow
                title="Action & Thrillers"
                movies={rows.action}
                onPlay={handlePlayContent}
                onOpenDetail={handleOpenDetail}
                myList={myList}
                onToggleMyList={handleToggleMyList}
              />
              <MovieRow
                title="Comedies & Adventures"
                movies={rows.comedy}
                onPlay={handlePlayContent}
                onOpenDetail={handleOpenDetail}
                myList={myList}
                onToggleMyList={handleToggleMyList}
              />
            </div>
          </div>
        ) : activeTab === "movies" ? (
          /* Movie filters row */
          <div className="pt-24 space-y-8">
            <div className="px-4 md:px-12 text-left">
              <h1 className="text-3xl font-extrabold tracking-wide">Movies</h1>
              <p className="text-xs text-gray-400 mt-1">Cinematic award-winners, documentaries, and hits.</p>
            </div>
            <MovieRow
              title="Bollywood Blockbusters"
              movies={rows.bollywoodMovies}
              onPlay={handlePlayContent}
              onOpenDetail={handleOpenDetail}
              myList={myList}
              onToggleMyList={handleToggleMyList}
            />
            <MovieRow
              title="Top Rated Movies"
              movies={rows.topRated}
              onPlay={handlePlayContent}
              onOpenDetail={handleOpenDetail}
              myList={myList}
              onToggleMyList={handleToggleMyList}
            />
            <MovieRow
              title="Action & Suspense"
              movies={rows.action}
              onPlay={handlePlayContent}
              onOpenDetail={handleOpenDetail}
              myList={myList}
              onToggleMyList={handleToggleMyList}
            />
            <MovieRow
              title="Hilarious Comedies"
              movies={rows.comedy}
              onPlay={handlePlayContent}
              onOpenDetail={handleOpenDetail}
              myList={myList}
              onToggleMyList={handleToggleMyList}
            />
          </div>
        ) : activeTab === "tv" ? (
          /* TV Shows filter */
          <div className="pt-24 space-y-8">
            <div className="px-4 md:px-12 text-left">
              <h1 className="text-3xl font-extrabold tracking-wide">TV Shows</h1>
              <p className="text-xs text-gray-400 mt-1">Binge-worthy drama series, reality TV, and talk shows.</p>
            </div>
            <MovieRow
              title="Bollywood Hit Shows"
              movies={rows.bollywoodShows}
              onPlay={handlePlayContent}
              onOpenDetail={handleOpenDetail}
              myList={myList}
              onToggleMyList={handleToggleMyList}
            />
            <MovieRow
              title="Popular Shows"
              movies={rows.originals}
              onPlay={handlePlayContent}
              onOpenDetail={handleOpenDetail}
              myList={myList}
              onToggleMyList={handleToggleMyList}
            />
            <MovieRow
              title="Trending Shows this Week"
              movies={rows.trending.filter(x => x.media_type === "tv")}
              onPlay={handlePlayContent}
              onOpenDetail={handleOpenDetail}
              myList={myList}
              onToggleMyList={handleToggleMyList}
            />
          </div>
        ) : (
          /* My List (Bookmarked Items) */
          <div className="pt-24 px-4 md:px-12 space-y-8 animate-fade-in">
            <div className="text-left">
              <h1 className="text-3xl font-extrabold tracking-wide">My List</h1>
              <p className="text-xs text-gray-400 mt-1">Your bookmarked movies and shows for quick access.</p>
            </div>

            {myListItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500 gap-4 border border-dashed border-white/10 rounded-lg">
                <Plus size={44} className="text-gray-600" />
                <p className="text-base font-semibold text-gray-400">Your List is Empty</p>
                <p className="text-xs text-gray-500 max-w-sm text-center leading-relaxed">
                  Hover over cards and click the "+" icon to add your favorite titles to My List for viewing later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                {myListItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="group flex flex-col cursor-pointer bg-[#181818] rounded overflow-hidden shadow border border-white/5 hover:border-white/20 transition duration-200"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={item.backdrop_path || item.poster_path}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition duration-200 flex items-center justify-center">
                        <Play size={20} className="fill-white text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <div className="p-3 text-left space-y-1">
                      <h4 className="text-white text-xs sm:text-sm font-bold truncate group-hover:text-[#e50914] transition duration-200">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-green-500">
                        <span>{item.match_percentage}% Match</span>
                        <span className="text-gray-400 font-normal uppercase">
                          | {item.media_type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal Toggle */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
      />

      {/* Detailed Informational Modal */}
      <DetailModal
        movie={activeDetailItem}
        isOpen={!!activeDetailItem}
        onClose={() => setActiveDetailItem(null)}
        onPlay={handlePlayContent}
        myList={myList}
        onToggleMyList={handleToggleMyList}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/browse" element={<AppContent />} />
      {/* Dedicated Show details Page */}
      <Route path="/show/:id" element={<ShowDetailPage />} />
      {/* Fullscreen Video Player Route paths */}
      <Route path="/watch/:type/:id" element={<WatchPage />} />
      <Route path="/watch/tv/:id/:season/:episode" element={<WatchPage />} />
      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
