import { useCallback, useEffect, useRef, useState } from "react";
import {
  DECKS_PAGE_SIZE,
  formatDeckDate,
  formatDeckDateFallback,
  formatDeckRecord,
  formatDeckWinRate,
  getDecksPage,
} from "../lib/decks.js";

const SEARCH_DEBOUNCE_MS = 300;

const COLOR_OPTIONS = [
  { code: "W", label: "White", className: "bg-white" },
  { code: "U", label: "Blue", className: "bg-sky-500" },
  { code: "B", label: "Black", className: "bg-neutral-900" },
  { code: "R", label: "Red", className: "bg-red-500" },
  { code: "G", label: "Green", className: "bg-green-600" },
];

function createEmptyFilters() {
  return {
    name: "",
    author: "",
    card: "",
    colors: [],
    exactColors: false,
  };
}

function DeckColorBar({ colors }) {
  const visibleColors = COLOR_OPTIONS.filter((option) =>
    colors.includes(option.code),
  );
  const label = visibleColors.length
    ? visibleColors.map((option) => option.label).join(", ")
    : "Colorless";

  return (
    <div
      className="deck-color-bar"
      role="img"
      aria-label={`Deck colors: ${label}`}
      title={label}
    >
      {visibleColors.length ? (
        visibleColors.map((color) => (
          <span
            key={color.code}
            className={`deck-color-segment ${color.className}`}
          />
        ))
      ) : (
        <span className="deck-color-segment bg-neutral-500" />
      )}
    </div>
  );
}

function DeckRow({ deck, localTime }) {
  const dateText = localTime
    ? formatDeckDate(deck.last_played_at)
    : formatDeckDateFallback(deck.last_played_at);

  return (
    <li className="deck-list-row group">
      <span aria-hidden="true" className="deck-row-hover" />

      <div className="deck-row-cell">
        <DeckColorBar colors={deck.colors} />
      </div>
      <div className="deck-row-cell min-w-0">
        <strong className="truncate font-heading text-lg tracking-wide text-text md:text-xl">
          {deck.name}
        </strong>
      </div>
      <div className="deck-row-cell min-w-0 text-xs text-nav-link group-hover:text-text md:text-sm">
        <span className="truncate">by {deck.author}</span>
      </div>
      <div className="deck-row-cell text-xs font-semibold capitalize text-nav-link group-hover:text-text md:text-sm">
        {deck.format}
      </div>
      <div className="deck-row-cell deck-row-number">
        {formatDeckRecord(deck)}
      </div>
      <div className="deck-row-cell deck-row-number">
        {formatDeckWinRate(deck)}
      </div>
      <div className="deck-row-cell justify-end text-right text-xs text-nav-link group-hover:text-text md:text-sm">
        <time dateTime={deck.last_played_at}>{dateText}</time>
      </div>
    </li>
  );
}

function DeckFilters({
  open,
  filters,
  onChange,
  onToggleColor,
  onToggleOpen,
}) {
  return (
    <div className="deck-filters-wrap">
      <button
        type="button"
        className="big-button deck-filters-toggle"
        aria-expanded={open}
        aria-controls="deck-filters-panel"
        onClick={onToggleOpen}
      >
        Filters
      </button>

      {open && (
        <form
          id="deck-filters-panel"
          className="deck-filters-panel"
          aria-label="Filter decks"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="sr-only" htmlFor="deck-filter-name">
            Deck name
          </label>
          <input
            id="deck-filter-name"
            type="search"
            value={filters.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Name"
            autoComplete="off"
            className="deck-filter-input"
          />

          <label className="sr-only" htmlFor="deck-filter-author">
            Author
          </label>
          <input
            id="deck-filter-author"
            type="search"
            value={filters.author}
            onChange={(event) => onChange({ author: event.target.value })}
            placeholder="Author"
            autoComplete="off"
            className="deck-filter-input"
          />

          <fieldset className="deck-color-filters">
            <legend className="sr-only">Deck colors</legend>
            {COLOR_OPTIONS.map((color) => (
              <label key={color.code} className="deck-color-option">
                <input
                  type="checkbox"
                  checked={filters.colors.includes(color.code)}
                  onChange={() => onToggleColor(color.code)}
                />
                <span>{color.label}</span>
              </label>
            ))}
            <label className="deck-color-option deck-exact-color-option">
              <input
                type="checkbox"
                checked={filters.exactColors}
                onChange={(event) =>
                  onChange({ exactColors: event.target.checked })
                }
              />
              <span>Exact colors</span>
            </label>
          </fieldset>

          <label className="sr-only" htmlFor="deck-filter-card">
            Contains card name
          </label>
          <input
            id="deck-filter-card"
            type="search"
            value={filters.card}
            onChange={(event) => onChange({ card: event.target.value })}
            placeholder="Contains card name"
            autoComplete="off"
            className="deck-filter-input deck-card-filter"
          />
        </form>
      )}
    </div>
  );
}

export default function DecksList({ format = null, initialPage }) {
  const [localTime, setLocalTime] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(createEmptyFilters);
  const [decks, setDecks] = useState(initialPage?.decks ?? []);
  const [hasMore, setHasMore] = useState(initialPage?.hasMore ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialPage?.error ?? "");

  const requestRef = useRef(0);
  const deckCountRef = useRef(decks.length);
  const cutoffRef = useRef(initialPage?.cutoff ?? new Date().toISOString());
  const activeFiltersRef = useRef(createEmptyFilters());
  const skipFirstFilterRef = useRef(true);

  deckCountRef.current = decks.length;

  const loadDecks = useCallback(
    async ({ nextFilters, reset }) => {
      const requestId = ++requestRef.current;
      setLoading(true);
      setError("");

      const page = await getDecksPage({
        format,
        name: nextFilters.name,
        author: nextFilters.author,
        card: nextFilters.card,
        colors: nextFilters.colors,
        exactColors: nextFilters.exactColors,
        offset: reset ? 0 : deckCountRef.current,
        before: cutoffRef.current,
      });

      if (requestId !== requestRef.current) return;

      setLoading(false);

      if (page.error) {
        setError(page.error);
        if (reset) {
          setDecks([]);
          setHasMore(false);
        }
        return;
      }

      setDecks((current) =>
        reset ? page.decks : [...current, ...page.decks],
      );
      setHasMore(page.hasMore);
    },
    [format],
  );

  useEffect(() => {
    setLocalTime(true);
    cutoffRef.current = new Date().toISOString();

    const defaultFilters = createEmptyFilters();
    activeFiltersRef.current = defaultFilters;
    loadDecks({ nextFilters: defaultFilters, reset: true });
  }, [loadDecks]);

  useEffect(() => {
    if (skipFirstFilterRef.current) {
      skipFirstFilterRef.current = false;
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      activeFiltersRef.current = filters;
      loadDecks({ nextFilters: filters, reset: true });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [filters, loadDecks]);

  const updateFilters = (patch) => {
    setHasMore(false);
    setFilters((current) => ({ ...current, ...patch }));
  };

  const toggleColor = (color) => {
    setHasMore(false);
    setFilters((current) => ({
      ...current,
      colors: current.colors.includes(color)
        ? current.colors.filter((selected) => selected !== color)
        : [...current.colors, color],
    }));
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    loadDecks({
      nextFilters: activeFiltersRef.current,
      reset: false,
    });
  };

  return (
    <section aria-labelledby="deck-list-heading">
      <h2 id="deck-list-heading" className="sr-only">
        Recent decklists
      </h2>

      <DeckFilters
        open={filtersOpen}
        filters={filters}
        onChange={updateFilters}
        onToggleColor={toggleColor}
        onToggleOpen={() => setFiltersOpen((current) => !current)}
      />

      <div className="deck-list-scroll" aria-live="polite">
        {decks.length > 0 && (
          <ul className="deck-list">
            {decks.map((deck) => (
              <DeckRow key={deck.id} deck={deck} localTime={localTime} />
            ))}
          </ul>
        )}

        {loading && !decks.length && (
          <p className="deck-list-message">Loading decks...</p>
        )}

        {!loading && !error && !decks.length && (
          <p className="deck-list-message">
            No decks match the selected filters.
          </p>
        )}
      </div>

      {error && (
        <div className="deck-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="big-button deck-retry-button"
            disabled={loading}
            onClick={() =>
              loadDecks({
                nextFilters: activeFiltersRef.current,
                reset: true,
              })
            }
          >
            Try again
          </button>
        </div>
      )}

      {hasMore && (
        <div className="deck-load-more">
          <button
            type="button"
            className="big-button deck-load-more-button"
            disabled={loading}
            onClick={loadMore}
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {decks.length
          ? `Showing ${decks.length} decks in groups of ${DECKS_PAGE_SIZE}.`
          : ""}
      </span>
    </section>
  );
}
