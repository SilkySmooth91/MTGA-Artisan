import { supabase, hasSupabaseEnv } from './supabaseClient.js';
import { mapArticleToCard } from './mapArticleToCard.js';
import AboutCardSection from '../components/AboutCardSection.astro';

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