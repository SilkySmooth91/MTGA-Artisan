import { runQueryWithRetry } from "./articles.js";
import { hasSupabaseEnv, supabase } from "./supabaseClient.js";

export const DECKS_PAGE_SIZE = 10;

export const DECK_FORMATS = [
  { slug: "historic", label: "Historic" },
  { slug: "standard", label: "Standard" },
  { slug: "timeless", label: "Timeless" },
];

const COLOR_ORDER = ["W", "U", "B", "R", "G"];
const FALLBACK_TIME_ZONE = "Europe/Rome";
const LOAD_ERROR_MESSAGE = "Unable to load decks. Please try again.";

function emptyPage(cutoff, error = "") {
  return {
    decks: [],
    hasMore: false,
    cutoff,
    error,
  };
}

function normalizeColors(colors = []) {
  const selected = new Set(colors);
  return COLOR_ORDER.filter((color) => selected.has(color));
}

function logDeckError(context, error) {
  const message = error?.message || String(error);
  console.error(`${context}:`, message);
}

/**
 * Fetch a filtered, deterministic page of decks.
 * One extra row is requested to determine whether another page exists.
 */
export async function getDecksPage({
  format = null,
  name = "",
  author = "",
  card = "",
  colors = [],
  exactColors = false,
  offset = 0,
  limit = DECKS_PAGE_SIZE,
  before = new Date().toISOString(),
} = {}) {
  if (!hasSupabaseEnv || !supabase) {
    return emptyPage(before, "Deck data is not configured.");
  }

  const pageLimit = Math.min(Math.max(Number(limit) || DECKS_PAGE_SIZE, 1), 20);
  const pageOffset = Math.max(Number(offset) || 0, 0);

  try {
    const { data, error } = await runQueryWithRetry(
      (signal) =>
        supabase
          .rpc("get_decks_page", {
            p_format: format,
            p_name: String(name).trim(),
            p_author: String(author).trim(),
            p_card: String(card).trim(),
            p_colors: normalizeColors(colors),
            p_exact_colors: Boolean(exactColors),
            p_before: before,
            p_offset: pageOffset,
            p_limit: pageLimit + 1,
          })
          .abortSignal(signal),
      "decks fetch",
    );

    if (error) {
      logDeckError("Error fetching decks", error);
      return emptyPage(before, LOAD_ERROR_MESSAGE);
    }

    const rows = data ?? [];
    return {
      decks: rows.slice(0, pageLimit),
      hasMore: rows.length > pageLimit,
      cutoff: before,
      error: "",
    };
  } catch (error) {
    logDeckError("Error fetching decks", error);
    return emptyPage(before, LOAD_ERROR_MESSAGE);
  }
}

function getFormatterDate(iso, { timeZone } = {}) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDeckDate(iso, options) {
  return getFormatterDate(iso, options) ?? "";
}

export function formatDeckDateFallback(iso) {
  return formatDeckDate(iso, { timeZone: FALLBACK_TIME_ZONE });
}

export function formatDeckRecord(deck) {
  return `${deck.wins}-${deck.losses}`;
}

export function formatDeckWinRate(deck) {
  const storedWinRate = Number(deck.win_rate_pct);
  if (
    Number.isFinite(storedWinRate) &&
    deck.win_rate_pct !== null &&
    deck.win_rate_pct !== undefined
  ) {
    return `${storedWinRate.toFixed(1)}%`;
  }

  const wins = Number(deck.wins);
  const losses = Number(deck.losses);
  const games = wins + losses;

  if (!Number.isFinite(games) || games <= 0) {
    return "N/A";
  }

  return `${((wins / games) * 100).toFixed(1)}%`;
}
