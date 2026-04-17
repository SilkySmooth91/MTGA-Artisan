import { supabase, hasSupabaseEnv } from './supabaseClient.js';
import { mapArticleToCard } from './mapArticleToCard.js';

const QUERY_TIMEOUT_MS = 8000;
const RETRY_DELAYS_MS = [400, 1200];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  if (!error) return false;

  const message = String(error.message || error).toLowerCase();
  return [
    'fetch failed',
    'failed to fetch',
    'networkerror',
    'network request failed',
    'timeout',
    'timed out',
    'aborted',
    'econnreset',
    'eai_again',
  ].some((token) => message.includes(token));
}

async function runQueryWithRetry(queryFactory, contextLabel) {
  let lastError = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS);

    try {
      const result = await queryFactory(controller.signal);
      clearTimeout(timeoutId);

      if (result?.error && isRetryableError(result.error) && attempt < RETRY_DELAYS_MS.length) {
        lastError = result.error;
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (isRetryableError(error) && attempt < RETRY_DELAYS_MS.length) {
        lastError = error;
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      throw error;
    }
  }

  return {
    data: null,
    error: lastError ?? new Error(`Unknown ${contextLabel} failure`),
  };
}

export async function getArticles({limit} = {}) {
    if(!hasSupabaseEnv || !supabase) {
        return [];
    }

    const { data, error } = await runQueryWithRetry((signal) => {
        let query = supabase
            .from('articles')
            .select("id, title, excerpt, img, author, category, body, created_at, updated_at")
            .order('created_at', { ascending: false })
            .abortSignal(signal);

        if (typeof limit === "number") {
            query = query.limit(limit);
        }

        return query;
    }, 'articles fetch');

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

  const { data, error } = await runQueryWithRetry((signal) => (
    supabase
      .from("articles")
      .select("id, title, excerpt, img, author, category, body, created_at, updated_at")
      .eq("id", articleId)
      .abortSignal(signal)
      .maybeSingle()
  ), 'article detail fetch');

  if (error) {
    console.error("Error fetching article detail:", error.message);
    return null;
  }

  return data ?? null;
}