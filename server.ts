// server.ts
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { createServer as createViteServer } from "vite";
import { posterService } from "./src/services/PosterService";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client with mandatory User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Initialize Groq Client
const groqApiKey = process.env.GROQ_API_KEY || "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";
let groqClient: Groq | null = null;
if (groqApiKey) {
  groqClient = new Groq({ apiKey: groqApiKey });
}

const OMDB_API_KEY = process.env.OMDB_API_KEY;

// 🔍 Autocomplete endpoint using OMDb proxy
app.get("/api/search", async (req: express.Request, res: express.Response) => {
  try {
    const query = req.query.q;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    if (!OMDB_API_KEY) {
      return res.json({ suggestions: [] });
    }

    const omdbRes = await fetch(
      `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`
    );
    const data = await omdbRes.json();

    if (data.Response === "False" || !data.Search) {
      return res.json({ suggestions: [] });
    }

    const suggestions = data.Search.slice(0, 5).map((movie: any) => ({
      id: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster !== "N/A" ? movie.Poster : null,
    }));

    return res.json({ suggestions });
  } catch (error) {
    console.error("Search API Error:", error);
    return res.status(500).json({ error: "Failed to fetch movie suggestions" });
  }
});

// Helper function to resolve YouTube video ID for official trailers
async function resolveYoutubeTrailerId(title: string, year?: string | number, imdbId?: string): Promise<string | undefined> {
  // 1. Try KinoCheck with IMDb ID if present
  if (imdbId) {
    try {
      const kcRes = await fetch(`https://api.kinocheck.com/movies?imdb_id=${imdbId}`);
      if (kcRes.ok) {
        const kcData = await kcRes.json();
        const ytId = kcData.trailer?.youtube_video_id || (Array.isArray(kcData.videos) && kcData.videos[0]?.youtube_video_id);
        if (ytId) return ytId;
      }
    } catch (e) {
      // ignore
    }
    try {
      const kcRes = await fetch(`https://api.kinocheck.com/trailers?imdb_id=${imdbId}`);
      if (kcRes.ok) {
        const kcData = await kcRes.json();
        const ytId = Array.isArray(kcData) ? kcData[0]?.youtube_video_id : kcData?.youtube_video_id;
        if (ytId) return ytId;
      }
    } catch (e) {
      // ignore
    }
  }

  // 2. Direct YouTube search result scrape
  if (title) {
    try {
      const query = `${title} ${year || ''} official trailer`.trim();
      const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch (err) {
      console.warn(`YouTube search scrape error for ${title}:`, err);
    }
  }

  return undefined;
}

// 🎬 API endpoint to dynamically resolve YouTube trailer embed
app.get("/api/trailer", async (req: express.Request, res: express.Response) => {
  try {
    const title = (req.query.title as string) || "";
    const year = (req.query.year as string) || "";
    const imdbId = (req.query.imdbId as string) || "";

    if (!title && !imdbId) {
      return res.status(400).json({ error: "Missing title or imdbId parameter" });
    }

    const youtubeId = await resolveYoutubeTrailerId(title, year, imdbId);
    return res.json({
      youtube_id: youtubeId || null,
      embed_url: youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null
    });
  } catch (error) {
    console.error("Trailer API Error:", error);
    return res.status(500).json({ error: "Failed to resolve trailer" });
  }
});

// Fallback recommendations if Gemini is unavailable or fails
const FALLBACK_RECOMMENDATIONS = [
  {
    id: "f1",
    title: "Blade Runner 2049",
    year: 2017,
    director: "Denis Villeneuve",
    rating: 4.4,
    imdb_rating: "8.8/10",
    imdb_votes: "620,000",
    metascore: "81",
    runtime: "164 min",
    runtime_minutes: 164,
    category: "mainstream",
    genres: ["Sci-Fi", "Mystery", "Drama"],
    match_score: 99,
    plot: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    why_like_it: "Matches your taste for atmospheric, visually stunning sci-fi masterpieces with deep philosophical undertones.",
    trailer_url: "https://www.youtube.com/results?search_query=Blade+Runner+2049+official+trailer",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "f2",
    title: "Arrival",
    year: 2016,
    director: "Denis Villeneuve",
    rating: 4.0,
    imdb_rating: "7.9/10",
    imdb_votes: "750,000",
    metascore: "81",
    runtime: "116 min",
    runtime_minutes: 116,
    category: "mainstream",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    match_score: 96,
    plot: "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    why_like_it: "Thoughtful narrative structure and emotional sci-fi cinema grounded in profound human feeling.",
    trailer_url: "https://www.youtube.com/results?search_query=Arrival+2016+official+trailer",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "f3",
    title: "Drive",
    year: 2011,
    director: "Nicolas Winding Refn",
    rating: 3.9,
    imdb_rating: "7.8/10",
    imdb_votes: "680,000",
    metascore: "78",
    runtime: "100 min",
    runtime_minutes: 100,
    category: "mainstream",
    genres: ["Action", "Crime", "Drama"],
    match_score: 94,
    plot: "A mysterious Hollywood stuntman and mechanic moonlights as a getaway driver and finds himself in trouble when he helps out his neighbor.",
    why_like_it: "Cult favorite featuring hyper-stylized neon visuals, a hypnotic synth soundtrack, and incredible tension.",
    trailer_url: "https://www.youtube.com/results?search_query=Drive+2011+official+trailer",
    poster: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "f4",
    title: "Coherence",
    year: 2013,
    director: "James Ward Byrkit",
    rating: 3.6,
    imdb_rating: "7.2/10",
    imdb_votes: "145,000",
    metascore: "65",
    runtime: "89 min",
    runtime_minutes: 89,
    category: "niche",
    genres: ["Sci-Fi", "Mystery", "Thriller"],
    match_score: 93,
    plot: "Strange things begin to happen when a group of friends gather for a dinner party on the night an astronomical comet passes overhead.",
    why_like_it: "A mind-bending, low-budget indie masterpiece with relentless paranoia and clever quantum mechanics.",
    trailer_url: "https://www.youtube.com/results?search_query=Coherence+2013+official+trailer",
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "f5",
    title: "Nightcrawler",
    year: 2014,
    director: "Dan Gilroy",
    rating: 3.9,
    imdb_rating: "7.8/10",
    imdb_votes: "550,000",
    metascore: "76",
    runtime: "117 min",
    runtime_minutes: 117,
    category: "niche",
    genres: ["Crime", "Drama", "Thriller"],
    match_score: 90,
    plot: "When Louis Bloom, a driven man desperate for work, muscles into the world of L.A. crime journalism, he blurs the line between observer and participant.",
    why_like_it: "A dark, intense character study of ambition and obsession in nocturnal Los Angeles.",
    trailer_url: "https://www.youtube.com/results?search_query=Nightcrawler+2014+official+trailer",
    poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600&auto=format&fit=crop"
  }
];

// Core Recommendation Handler
async function handleRecommend(req: express.Request, res: express.Response) {
  const inputMovies: string[] = req.body?.movies || req.body?.favorites || [];
  const recommendNiche = Boolean(req.body?.recommendNiche);

  const cleanMovies = Array.isArray(inputMovies)
    ? inputMovies.map((m) => String(m).trim()).filter(Boolean)
    : [];

  const moviesListStr = cleanMovies.length > 0 ? cleanMovies.join(", ") : "Inception, Interstellar, The Dark Knight, Blade Runner 2049, Spirited Away";

  // Check available AI engines
  if (!aiClient && !groqClient) {
    console.warn("Neither GEMINI_API_KEY nor GROQ_API_KEY configured. Returning curated recommendations.");
    let fallback = FALLBACK_RECOMMENDATIONS;
    if (recommendNiche) {
      const nicheFallback = FALLBACK_RECOMMENDATIONS.filter((m) => {
        const v = parseInt((m.imdb_votes || "0").replace(/,/g, "").trim(), 10);
        return v < 500000;
      });
      if (nicheFallback.length > 0) fallback = nicheFallback;
    }
    return res.json({
      recommendations: fallback,
      input_movies: cleanMovies.length > 0 ? cleanMovies : ["Inception", "Interstellar", "Blade Runner 2049", "The Dark Knight", "Spirited Away"],
      total_recommendations: fallback.length,
      recommendation_source: "Curated CineMatch Vault",
    });
  }

  try {
    const candidateCount = recommendNiche ? 8 : 5;
    const prompt = recommendNiche
      ? `User's favorite movies: [${moviesListStr}]. Recommend ${candidateCount} distinct, lesser-known, niche, indie, or cult films for this user. CRITICAL: Recommend films that are hidden gems or indie/niche cinema (ideally under 500,000 total IMDb votes) that align strongly with the user's taste.`
      : `User's favorite movies: [${moviesListStr}]. Recommend 5 distinct, exceptional movies for this user. Prioritize the absolute best matches for the user's taste based on their favorite movies list.`;

    const systemPrompt = recommendNiche
      ? `You are CineMatch AI, an expert film critic specializing in hidden gems, niche cinema, and indie masterpieces.
Analyze the user's favorite movies for themes, tone, cinematography, and narrative style.
Recommend ${candidateCount} distinct niche/indie/cult movies (typically under 500,000 IMDb votes) that fans of the input list will love.

Return a valid JSON object containing a "recommendations" array of ${candidateCount} objects using this exact schema:
{
  "recommendations": [
    {
      "title": "Movie Title",
      "year": 2021,
      "director": "Director Name",
      "genres": ["Sci-Fi", "Drama"],
      "match_score": 98,
      "category": "niche",
      "runtime": "115 min",
      "plot": "Brief 2-3 sentence engaging synopsis.",
      "why_like_it": "Personalized explanation referencing why fans of input movies will appreciate this.",
      "trailer_search_query": "Movie Title 2021 trailer"
    }
  ]
}`
      : `You are CineMatch AI, an expert film critic and recommendation engine.
Analyze the user's favorite movies for themes, visual direction, tone, cinematography, narrative style, and character depth.
Recommend 5 top movies that the user would love, excluding any of the user's input movies.

Return a valid JSON object containing a "recommendations" array of 5 objects using this exact schema:
{
  "recommendations": [
    {
      "title": "Movie Title",
      "year": 2021,
      "director": "Director Name",
      "genres": ["Sci-Fi", "Drama"],
      "match_score": 98,
      "category": "mainstream",
      "runtime": "148 min",
      "plot": "Brief 2-3 sentence engaging synopsis.",
      "why_like_it": "Personalized explanation referencing why fans of input movies will appreciate this.",
      "trailer_search_query": "Movie Title 2021 trailer"
    }
  ]
}`;

    let responseText = "";
    let engineSource = "";

    if (groqClient) {
      engineSource = "Groq Engine + OMDb Enrichment";
      const modelCandidates = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
        "deepseek-r1-distill-llama-70b"
      ];

      for (const modelCandidate of modelCandidates) {
        try {
          const groqRes = await groqClient.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            model: modelCandidate,
            response_format: { type: "json_object" },
          });
          responseText = groqRes.choices[0]?.message?.content || "";
          if (responseText) {
            engineSource = `Groq (${modelCandidate}) + OMDb Enrichment`;
            break;
          }
        } catch (gErr) {
          console.warn(`Groq model ${modelCandidate} request failed, trying fallback...`, gErr);
        }
      }
    } else if (aiClient) {
      engineSource = "Gemini 3.6 Flash AI Engine + OMDb Enrichment";
      const response = await aiClient.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
      });
      responseText = response.text || "";
    }

    let rawRecommendations: any[] = [];

    try {
      const parsed = JSON.parse(responseText);
      rawRecommendations = Array.isArray(parsed) ? parsed : (parsed.movies || parsed.recommendations || []);
    } catch (parseErr) {
      console.error("JSON parsing error on AI response:", parseErr, "Text:", responseText);
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedCleaned = JSON.parse(cleaned);
      rawRecommendations = Array.isArray(parsedCleaned) ? parsedCleaned : (parsedCleaned.movies || parsedCleaned.recommendations || []);
    }

    if (!Array.isArray(rawRecommendations) || rawRecommendations.length === 0) {
      throw new Error("AI returned invalid or empty recommendations format");
    }

    // Enrich recommendations with OMDb real ratings, votes, runtime, metascore & posters
    const enrichedRecommendations = await Promise.all(
      rawRecommendations.slice(0, candidateCount).map(async (movie: any, idx: number) => {
        const title = movie.title || "Untitled Cinema";
        const year = movie.year || 2022;

        let posterUrl: string | null = null;
        let omdbData: any = null;

        // Try OMDb API for real ratings, votes, runtime, metascore, and poster
        if (OMDB_API_KEY) {
          try {
            const omdbRes = await fetch(
              `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}`
            );
            omdbData = await omdbRes.json();

            // If not found with year, search without year
            if (omdbData.Response === "False") {
              const retryRes = await fetch(
                `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`
              );
              omdbData = await retryRes.json();
            }

            if (omdbData && omdbData.Response !== "False") {
              if (omdbData.Poster && omdbData.Poster !== "N/A") {
                posterUrl = omdbData.Poster;
              }
            }
          } catch (e) {
            console.warn(`OMDb fetch error for ${title}:`, e);
          }
        }

        // Try Wikimedia / Wikipedia as poster fallback if OMDb poster unavailable
        if (!posterUrl) {
          try {
            posterUrl = await posterService.getPoster(title, year);
          } catch (e) {
            console.warn(`Poster fetch error for ${title}:`, e);
          }
        }

        // Default placeholder fallback poster
        if (!posterUrl) {
          posterUrl = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop`;
        }

        // Parse OMDb ratings & runtime
        let imdbRatingStr = "8.0/10";
        let imdbVotesStr = "250,000";
        let metascoreStr: string | undefined = undefined;
        let runtimeStr = movie.runtime || "120 min";
        let runtimeMins = 120;
        let starRating = 4.0;

        if (omdbData && omdbData.Response !== "False") {
          if (omdbData.imdbRating && omdbData.imdbRating !== "N/A") {
            const val = parseFloat(omdbData.imdbRating);
            if (!isNaN(val)) {
              imdbRatingStr = `${val.toFixed(1)}/10`;
              starRating = Math.round((val / 2) * 10) / 10; // Convert 10-point to 5-star rating
            }
          }
          if (omdbData.imdbVotes && omdbData.imdbVotes !== "N/A") {
            imdbVotesStr = omdbData.imdbVotes;
          }
          if (omdbData.Metascore && omdbData.Metascore !== "N/A") {
            metascoreStr = omdbData.Metascore;
          }
          if (omdbData.Runtime && omdbData.Runtime !== "N/A") {
            runtimeStr = omdbData.Runtime;
          }
        }

        // Parse numeric minutes from runtime string
        const parsedMins = parseInt(runtimeStr, 10);
        if (!isNaN(parsedMins)) {
          runtimeMins = parsedMins;
        }

        // Determine category: mainstream vs niche
        const category = movie.category === "niche" || (movie.category && movie.category.toLowerCase().includes("niche"))
          ? "niche"
          : (idx >= 3 ? "niche" : "mainstream");

        // Resolve official YouTube trailer video ID
        const youtubeVideoId = await resolveYoutubeTrailerId(title, year, omdbData?.imdbID);
        const trailerUrl = youtubeVideoId
          ? `https://www.youtube.com/embed/${youtubeVideoId}`
          : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} official trailer`)}`;

        return {
          id: `cm-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          title: (omdbData && omdbData.Title) ? omdbData.Title : title,
          year: (omdbData && omdbData.Year) ? parseInt(omdbData.Year, 10) || Number(year) : (Number(year) || 2020),
          director: (omdbData && omdbData.Director && omdbData.Director !== "N/A") ? omdbData.Director : (movie.director || "Acclaimed Director"),
          rating: starRating,
          imdb_rating: imdbRatingStr,
          imdb_votes: imdbVotesStr,
          metascore: metascoreStr,
          runtime: runtimeStr,
          runtime_minutes: runtimeMins,
          category: category,
          genres: (omdbData && omdbData.Genre && omdbData.Genre !== "N/A")
            ? omdbData.Genre.split(", ").map((g: string) => g.trim())
            : (Array.isArray(movie.genres) ? movie.genres : ["Drama"]),
          match_score: typeof movie.match_score === "number" ? movie.match_score : Math.floor(88 + Math.random() * 11),
          plot: (omdbData && omdbData.Plot && omdbData.Plot !== "N/A" && omdbData.Plot.length > 30) ? omdbData.Plot : (movie.plot || "A captivating film with compelling storytelling."),
          why_like_it: movie.why_like_it || `Fans of ${moviesListStr} will love the thematic depth and visual flair of this cinema piece.`,
          trailer_url: trailerUrl,
          youtube_id: youtubeVideoId,
          imdb_id: omdbData?.imdbID || undefined,
          poster: posterUrl,
        };
      })
    );

    const parseNumericVotes = (vStr?: string): number => {
      if (!vStr) return 0;
      const num = parseInt(vStr.replace(/,/g, "").trim(), 10);
      return isNaN(num) ? 0 : num;
    };

    let finalRecommendations = enrichedRecommendations;

    if (recommendNiche) {
      // Filter for films where IMDb votes < 500,000
      const nicheFiltered = enrichedRecommendations.filter((m) => {
        const v = parseNumericVotes(m.imdb_votes);
        return v > 0 && v < 500000;
      });

      if (nicheFiltered.length >= 5) {
        finalRecommendations = nicheFiltered.slice(0, 5);
      } else {
        // Sort by votes ascending so lesser-known films come first
        finalRecommendations = [...enrichedRecommendations].sort((a, b) => {
          const vA = parseNumericVotes(a.imdb_votes);
          const vB = parseNumericVotes(b.imdb_votes);
          const aUnder = vA > 0 && vA < 500000;
          const bUnder = vB > 0 && vB < 500000;
          if (aUnder && !bUnder) return -1;
          if (!aUnder && bUnder) return 1;
          return vA - vB;
        }).slice(0, 5);
      }
    } else {
      finalRecommendations = enrichedRecommendations.slice(0, 5);
    }

    return res.json({
      recommendations: finalRecommendations,
      input_movies: cleanMovies.length > 0 ? cleanMovies : ["User Favorites"],
      total_recommendations: finalRecommendations.length,
      recommendation_source: engineSource || "CineMatch AI Engine",
    });
  } catch (err: any) {
    console.error("Gemini Recommendation Error:", err);
    // Return graceful fallback on error
    return res.json({
      recommendations: FALLBACK_RECOMMENDATIONS,
      input_movies: cleanMovies.length > 0 ? cleanMovies : ["Selected Favorites"],
      total_recommendations: FALLBACK_RECOMMENDATIONS.length,
      recommendation_source: "CineMatch Fallback Engine (Error Recovery)",
    });
  }
}

// Support both endpoint paths
app.post("/recommend", handleRecommend);
app.post("/api/recommend", handleRecommend);

// Express and Vite startup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎬 CineMatch AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
