import { supabase, hasSupabaseEnv } from './supabaseClient.js';
import { mapArticleToCard } from './mapArticleToCard.js';

export async function getArticles({limit} = {}) {
    if(!hasSupabaseEnv || !supabase) {
        return [];
    }

    let query = supabase
        .from('articles')
        .select("id, title, excerpt, img, author, category, body, created_at, updated_at")
        .order('created_at', { ascending: false })
        
        
    if (typeof limit === "number") {
        query = query.limit(limit);
    };

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching articles:", error.message);
        return [];
    }

    const cards = (data ?? []).map(mapArticleToCard);
    return cards;
}

function extractArticleIdFromSlug(slug = "") {
  const match = String(slug).match(
    /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i
  );
  return match ? match[1] : null;
}

export async function getArticleBySlug(slug) {
  if (!hasSupabaseEnv || !supabase || !slug) {
    return null;
  }

  const articleId = extractArticleIdFromSlug(slug);
  if (!articleId) {
    return null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, excerpt, img, author, category, body, created_at, updated_at")
    .eq("id", articleId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching article detail:", error.message);
    return null;
  }

  return data ?? null;
}