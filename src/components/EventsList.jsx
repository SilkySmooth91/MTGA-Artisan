import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatEventDate,
  formatEventDateFallback,
  getPastEvents,
  getUpcomingEvents,
} from "../lib/events.js";

const SEARCH_DEBOUNCE_MS = 300;

function EventRow({ event, localTime }) {
  const timeText = localTime
    ? formatEventDate(event.starts_at)
    : formatEventDateFallback(event.starts_at);

  return (
    <li className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-md bg-linear-to-b from-transparent via-transparent to-primary/15 px-5 py-6 md:px-12 md:py-10">
      {/* Hover layer: same red, fading out towards the top. Opacity is animated because gradients can't transition. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-primary/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <div className="relative min-w-0">
        <h3 className="font-heading text-lg tracking-wide text-text wrap-break-word md:text-2xl">
          {event.name}
        </h3>
        <time
          dateTime={event.starts_at}
          className="mt-1 block text-xs font-semibold md:mt-2 md:text-sm text-nav-link group-hover:text-text"
        >
          {timeText}
        </time>
      </div>
      <a
        href={event.event_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Event page: ${event.name}`}
        className="big-button relative shrink-0 rounded-full bg-background px-5 py-2 text-xs font-semibold text-text md:px-8 md:py-3 md:text-sm"
      >
        Event page
      </a>
    </li>
  );
}

function EventList({ events, localTime }) {
  return (
    <ul className="flex flex-col gap-3">
      {events.map((event) => (
        <EventRow key={event.id} event={event} localTime={localTime} />
      ))}
    </ul>
  );
}

export default function EventsList({ initialUpcoming = [], initialPast }) {
  const [localTime, setLocalTime] = useState(false);
  const [upcoming, setUpcoming] = useState(initialUpcoming);

  const [past, setPast] = useState(initialPast?.events ?? []);
  const [hasMore, setHasMore] = useState(initialPast?.hasMore ?? false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Pins the past/upcoming cutoff so "load more" stays consistent between pages.
  const cutoffRef = useRef(new Date().toISOString());
  const requestRef = useRef(0);
  const skipFirstSearchRef = useRef(true);
  const pastCountRef = useRef(past.length);
  pastCountRef.current = past.length;

  const loadPast = useCallback(async ({ term, reset }) => {
    const requestId = ++requestRef.current;
    setLoading(true);

    const page = await getPastEvents({
      offset: reset ? 0 : pastCountRef.current,
      search: term,
      before: cutoffRef.current,
    });

    // A newer request superseded this one.
    if (requestId !== requestRef.current) return;

    setPast((current) => (reset ? page.events : [...current, ...page.events]));
    setHasMore(page.hasMore);
    setLoading(false);
  }, []);

  // The site is statically built: refresh data on mount and switch to the viewer's timezone.
  useEffect(() => {
    setLocalTime(true);
    cutoffRef.current = new Date().toISOString();

    getUpcomingEvents().then(setUpcoming);
    loadPast({ term: "", reset: true });
  }, [loadPast]);

  useEffect(() => {
    if (skipFirstSearchRef.current) {
      skipFirstSearchRef.current = false;
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      const term = search.trim();
      setActiveSearch(term);
      loadPast({ term, reset: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [search, loadPast]);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = search.trim();
    setActiveSearch(term);
    loadPast({ term, reset: true });
  };

  return (
    <div className="flex flex-col gap-20">
      <section aria-labelledby="upcoming-heading">
        <h2
          id="upcoming-heading"
          className="mb-6 text-2xl font-semibold text-nav-link"
        >
          Upcoming
        </h2>
        {upcoming.length ? (
          <EventList events={upcoming} localTime={localTime} />
        ) : (
          <p className="text-nav-link">
            No upcoming events right now.{" "}
            <a
              href="https://discord.gg/waDh4j62Yp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Join our Discord
            </a>{" "}
            to stay tuned.
          </p>
        )}
      </section>

      <section aria-labelledby="past-heading">
        <h2
          id="past-heading"
          className="mb-6 text-2xl font-semibold text-nav-link"
        >
          Past Events
        </h2>

        <form
          onSubmit={submitSearch}
          role="search"
          className="mb-6 flex items-center gap-3"
        >
          <label htmlFor="events-filter" className="sr-only">
            Filter by name
          </label>
          <input
            id="events-filter"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name"
            autoComplete="off"
            className="big-button w-full max-w-xs rounded-full bg-background px-5 py-2 h-12 text-s text-text placeholder:text-nav-link"
          />
          <button
            type="submit"
            className="big-button h-12 cursor-pointer rounded-full bg-background px-6 font-semibold text-text"
          >
            Filter
          </button>
        </form>

        <div aria-live="polite">
          {past.length ? (
            <EventList events={past} localTime={localTime} />
          ) : (
            !loading && (
              <p className="text-nav-link">
                {activeSearch
                  ? `No past events found for "${activeSearch}".`
                  : "No past events yet."}
              </p>
            )
          )}
          {loading && !past.length && (
            <p className="text-nav-link">Loading...</p>
          )}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => loadPast({ term: activeSearch, reset: false })}
              className="big-button cursor-pointer rounded-full bg-background px-8 py-3 text-sm font-semibold text-text disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
