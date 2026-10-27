import { supabase, hasSupabaseEnv } from './supabaseClient.js';
import { runQueryWithRetry } from './articles.js';

export const EVENTS_PAGE_SIZE = 5;

const EVENT_COLUMNS = 'id, name, starts_at, event_url';
const FALLBACK_TIME_ZONE = 'Europe/Rome';

// Escape LIKE wildcards so user input is matched literally.
function escapeLike(term) {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function emptyPage() {
  return { events: [], hasMore: false };
}

/** Next events in chronological order (default: next 5). */
export async function getUpcomingEvents({ limit = EVENTS_PAGE_SIZE } = {}) {
  if (!hasSupabaseEnv || !supabase) {
    return [];
  }

  const nowIso = new Date().toISOString();

  const { data, error } = await runQueryWithRetry((signal) => (
    supabase
      .from('events')
      .select(EVENT_COLUMNS)
      .gte('starts_at', nowIso)
      .order('starts_at', { ascending: true })
      .limit(limit)
      .abortSignal(signal)
  ), 'upcoming events fetch');

  if (error) {
    console.error('Error fetching upcoming events:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Past events, newest first, paginated.
 * Requests one extra row to know whether another page exists.
 * `before` pins the "now" cutoff so paginated pages stay consistent.
 */
export async function getPastEvents({
  offset = 0,
  limit = EVENTS_PAGE_SIZE,
  search = '',
  before = new Date().toISOString(),
} = {}) {
  if (!hasSupabaseEnv || !supabase) {
    return emptyPage();
  }

  const term = String(search).trim();

  const { data, error } = await runQueryWithRetry((signal) => {
    let query = supabase
      .from('events')
      .select(EVENT_COLUMNS)
      .lt('starts_at', before)
      .order('starts_at', { ascending: false })
      .range(offset, offset + limit)
      .abortSignal(signal);

    if (term) {
      query = query.ilike('name', `%${escapeLike(term)}%`);
    }

    return query;
  }, 'past events fetch');

  if (error) {
    console.error('Error fetching past events:', error.message);
    return emptyPage();
  }

  const rows = data ?? [];
  return { events: rows.slice(0, limit), hasMore: rows.length > limit };
}

function getTimeZoneName(date, locale, timeZone) {
  const part = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? '';
}

/**
 * Formats an event date as "10/18/2026 at 2:00 PM CEST".
 * Without `timeZone` it uses the viewer's local zone (browser only);
 * on the server pass a zone (see formatEventDateFallback) for a deterministic result.
 */
export function formatEventDate(iso, { timeZone } = {}) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  const time = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  // en-GB yields "CEST"; en-US yields "GMT+2" for European zones.
  const zone = getTimeZoneName(date, timeZone ? 'en-GB' : 'en-US', timeZone);

  return `${day} at ${time} ${zone}`.trim();
}

/** Server-side / no-JS text: fixed Europe/Rome zone. The client replaces it with local time. */
export function formatEventDateFallback(iso) {
  return formatEventDate(iso, { timeZone: FALLBACK_TIME_ZONE });
}

/** Replaces the text of every `<time data-event-time datetime="...">` with the viewer's local time. */
export function localizeEventTimes(root = document) {
  root.querySelectorAll('time[data-event-time]').forEach((el) => {
    const text = formatEventDate(el.getAttribute('datetime'));
    if (text) {
      el.textContent = text;
    }
  });
}
