import axios from "axios";
import { mockMovies, mockTVShows, allMockData, generateMockSeasons } from "./mockData";

// Dynamic Base URL selector (reads setting or defaults to unblocked subdomain api.tmdb.org)
export const getBaseUrl = () => {
  return localStorage.getItem("tmdb_base_url") || "https://api.tmdb.org/3";
};

// Helper to check and get TMDB API Key from localStorage
export const getApiKey = () => {
  return localStorage.getItem("tmdb_api_key") || "";
};

// Helper to check if we are in Live API Mode
export const isLiveMode = () => {
  return !!getApiKey();
};

// Universal Image proxy mapping (uses Cloudflare images.weserv.nl cache to bypass DNS/ISP blocks on image.tmdb.org)
export const getImageUrl = (path, size = "original") => {
  if (!path) return "";

  let fullUrl = "";
  if (String(path).startsWith("http")) {
    fullUrl = path;
  } else {
    const relativePath = String(path).startsWith("/") ? path : `/${path}`;
    fullUrl = `https://image.tmdb.org/t/p/${size}${relativePath}`;
  }

  const useProxy = localStorage.getItem("use_image_proxy") !== "false";

  if (useProxy && fullUrl.includes("image.tmdb.org")) {
    // CRITICAL FIX: weserv expects the URL parameter WITHOUT a protocol prefix (no http:// or https://)
    // Passing a protocol prefix causes a 400 Bad Request on weserv.nl!
    const cleanUrl = fullUrl.replace(/^https?:\/\//i, "");
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}`;
  }

  return fullUrl;
};

// Normalizes API structures so the frontend doesn't care if it's Live or Mock
const normalizeItem = (item, type) => {
  const mediaType = item.media_type || type || (item.first_air_date ? "tv" : "movie");

  const backdrop = item.backdrop_path ? getImageUrl(item.backdrop_path, "original") : "";
  const poster = item.poster_path ? getImageUrl(item.poster_path, "w500") : "";

  // Set fallback only if both are empty
  const defaultFallback = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1470";

  return {
    id: String(item.id),
    title: item.title || item.name || item.original_title || item.original_name,
    overview: item.overview || "No overview available.",
    backdrop_path: backdrop || poster || defaultFallback,
    poster_path: poster || backdrop || defaultFallback,
    media_type: mediaType,
    release_date: item.release_date || item.first_air_date || "",
    vote_average: item.vote_average || 0.0,
    match_percentage: Math.round((item.vote_average || 7.0) * 10 + Math.random() * 5), // Generate dynamic premium Netflix match %
    genres: item.genres ? item.genres.map(g => typeof g === "object" ? g.name : g) : ["Action", "Sci-Fi", "Drama"],
    duration: item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : (item.episode_run_time ? `${item.episode_run_time[0]}m` : ""),
    seasons_count: item.number_of_seasons || item.seasons_count || 1,
    age_rating: item.adult ? "NC-17" : "PG-13"
  };
};

export const api = {
  fetchTrending: async () => {
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const response = await axios.get(`${BASE_URL}/trending/all/week?api_key=${key}&language=en-US`);
        return response.data.results.map(item => normalizeItem(item));
      } catch (error) {
        console.error("Live TMDB Request failed, falling back to mock", error);
      }
    }
    return allMockData.map(item => normalizeItem(item));
  },

  fetchNetflixOriginals: async () => {
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const response = await axios.get(`${BASE_URL}/discover/tv?api_key=${key}&with_networks=213&language=en-US`);
        return response.data.results.map(item => normalizeItem(item, "tv"));
      } catch (error) {
        console.error("Live TMDB Request failed, falling back to mock", error);
      }
    }
    return mockTVShows.map(item => normalizeItem(item, "tv"));
  },

  fetchTopRatedMovies: async () => {
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const response = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${key}&language=en-US`);
        return response.data.results.map(item => normalizeItem(item, "movie"));
      } catch (error) {
        console.error("Live TMDB Request failed, falling back to mock", error);
      }
    }
    return mockMovies.map(item => normalizeItem(item, "movie"));
  },

  fetchActionMovies: async () => {
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const response = await axios.get(`${BASE_URL}/discover/movie?api_key=${key}&with_genres=28&language=en-US`);
        return response.data.results.map(item => normalizeItem(item, "movie"));
      } catch (error) {
        console.error("Live TMDB Request failed, falling back to mock", error);
      }
    }
    return mockMovies.filter(m => m.genres.includes("Action") || m.genres.includes("Science Fiction")).map(item => normalizeItem(item, "movie"));
  },

  fetchComedyMovies: async () => {
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const response = await axios.get(`${BASE_URL}/discover/movie?api_key=${key}&with_genres=35&language=en-US`);
        return response.data.results.map(item => normalizeItem(item, "movie"));
      } catch (error) {
        console.error("Live TMDB Request failed, falling back to mock", error);
      }
    }
    return mockMovies.filter(m => m.genres.includes("Comedy") || m.genres.includes("Adventure")).map(item => normalizeItem(item, "movie"));
  },

  fetchBollywoodMovies: async () => {
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const response = await axios.get(`${BASE_URL}/discover/movie?api_key=${key}&with_original_language=hi&language=en-US`);
        return response.data.results.map(item => normalizeItem(item, "movie"));
      } catch (error) {
        console.error("Live TMDB Request failed for Bollywood Movies, falling back to mock", error);
      }
    }
    return mockMovies.filter(m => m.industry === "bollywood" && m.media_type === "movie").map(item => normalizeItem(item, "movie"));
  },

  fetchBollywoodShows: async () => {
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const response = await axios.get(`${BASE_URL}/discover/tv?api_key=${key}&with_original_language=hi&language=en-US`);
        return response.data.results.map(item => normalizeItem(item, "tv"));
      } catch (error) {
        console.error("Live TMDB Request failed for Bollywood Shows, falling back to mock", error);
      }
    }
    return mockTVShows.filter(m => m.industry === "bollywood" && m.media_type === "tv").map(item => normalizeItem(item, "tv"));
  },

  fetchDetails: async (type, id) => {
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const detailsResponse = await axios.get(`${BASE_URL}/${type}/${id}?api_key=${key}&language=en-US&append_to_response=similar,credits`);
        const item = detailsResponse.data;

        let seasons = [];
        // If it's a TV show, fetch details for seasons
        if (type === "tv" && item.seasons) {
          seasons = await Promise.all(
            item.seasons.map(async (s) => {
              try {
                const sRes = await axios.get(`${BASE_URL}/tv/${id}/season/${s.season_number}?api_key=${key}&language=en-US`);
                return {
                  season_number: s.season_number,
                  name: s.name,
                  episodes: sRes.data.episodes.map(e => ({
                    episode_number: e.episode_number,
                    title: e.name,
                    runtime: e.runtime ? `${e.runtime}m` : "45m",
                    overview: e.overview || "No episode summary available.",
                    still_path: e.still_path ? getImageUrl(e.still_path, "w300") : "" // Correctly maps dynamic episode thumbnail
                  }))
                };
              } catch (e) {
                return {
                  season_number: s.season_number,
                  name: s.name,
                  episodes: []
                };
              }
            })
          );
          seasons = seasons.filter(s => s.episodes.length > 0);
        }

        const normalized = normalizeItem(item, type);
        normalized.seasons = seasons;
        if (item.similar && item.similar.results) {
          normalized.similar = item.similar.results.slice(0, 6).map(r => normalizeItem(r, type));
        }
        return normalized;
      } catch (error) {
        console.error("Live TMDB Request failed for details, falling back to mock", error);
      }
    }

    // Mock details fallback
    const matched = allMockData.find(item => String(item.id) === String(id) && item.media_type === type);
    if (matched) {
      const normalized = normalizeItem(matched, type);
      // Map mock episode pictures
      const rawSeasons = matched.seasons || (type === "tv" ? generateMockSeasons(matched) : []);
      normalized.seasons = rawSeasons.map(s => ({
        ...s,
        episodes: (s.episodes || []).map(e => ({
          ...e,
          still_path: getImageUrl(matched.backdrop_path, "w300") // Mock still maps to main backdrop
        }))
      }));
      // Recommended lists
      const rawSimilar = allMockData.filter(item => item.id !== id && item.media_type === type);
      normalized.similar = rawSimilar.slice(0, 6).map(r => normalizeItem(r, type));
      return normalized;
    }

    // Default emergency fallback
    return {
      id,
      title: type === "movie" ? "Stranger Movie" : "Stranger Show",
      overview: "Details could not be loaded. Please configure a valid TMDB key in Settings for access to millions of titles.",
      backdrop_path: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1470",
      poster_path: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1470",
      media_type: type,
      release_date: "2024",
      vote_average: 7.0,
      match_percentage: 90,
      genres: ["Drama", "Action"],
      seasons: [],
      similar: []
    };
  },

  searchContent: async (query) => {
    if (!query) return [];
    const key = getApiKey();
    const BASE_URL = getBaseUrl();
    if (key) {
      try {
        const response = await axios.get(`${BASE_URL}/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&language=en-US`);
        return response.data.results
          .filter(item => item.media_type !== "person" && (item.backdrop_path || item.poster_path))
          .map(item => normalizeItem(item));
      } catch (error) {
        console.error("Live TMDB Search failed, falling back to mock search", error);
      }
    }

    // Mock search filtering
    return allMockData
      .filter(item =>
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.overview?.toLowerCase().includes(query.toLowerCase())
      )
      .map(item => normalizeItem(item));
  }
};
