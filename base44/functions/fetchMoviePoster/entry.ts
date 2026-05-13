import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, year } = await req.json();
    if (!title) {
      return Response.json({ poster_url: null, tmdb_id: null });
    }

    const tmdbKey = Deno.env.get('TMDB_API_KEY');
    if (!tmdbKey) {
      return Response.json({ error: 'TMDB_API_KEY is not configured' }, { status: 500 });
    }

    const query = encodeURIComponent(title.trim());
    const yearParam = year ? `&year=${encodeURIComponent(String(year))}` : '';
    const isBearerToken = tmdbKey.startsWith('ey');
    const url = isBearerToken
      ? `https://api.themoviedb.org/3/search/movie?query=${query}${yearParam}&language=en-US&page=1&include_adult=false`
      : `https://api.themoviedb.org/3/search/movie?api_key=${encodeURIComponent(tmdbKey)}&query=${query}${yearParam}&language=en-US&page=1&include_adult=false`;

    const res = await fetch(url, {
      headers: isBearerToken ? { Authorization: `Bearer ${tmdbKey}` } : {}
    });

    if (!res.ok) {
      return Response.json({ poster_url: null, tmdb_id: null });
    }

    const data = await res.json();
    const results = data.results || [];
    const movie = results.find((m) => String(m.release_date?.split('-')[0]) === String(year)) || results[0];

    if (!movie?.poster_path) {
      return Response.json({ poster_url: null, tmdb_id: movie?.id || null });
    }

    return Response.json({
      poster_url: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
      tmdb_id: movie.id || null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});