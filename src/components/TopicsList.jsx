import { useMemo, useState } from "react";

/**
 * @param {{
 *   topics?: string[];
 *   activeTopic?: string;
 *   onTopicChange?: (topic: string) => void;
 *   pagePath?: string;
 *   queryKey?: string;
 * }} props
 */
export default function TopicsList({
  topics = [],
  activeTopic = "",
  onTopicChange,
  pagePath = "/news",
  queryKey = "category",
} = {}) {
  const initialTopic = useMemo(
    () => activeTopic || topics[0] || "",
    [activeTopic, topics],
  );

  const [localActive, setLocalActive] = useState(() => {
    if (typeof window === "undefined") return initialTopic;
    return new URLSearchParams(window.location.search).get(queryKey) || initialTopic;
  });
  const currentActive = onTopicChange ? activeTopic : localActive;

  // Updates the URL without a full page reload, then notifies the article list to re-filter.
  const navigateWithCategory = (topic) => {
    if (typeof window === "undefined") return;

    const nextUrl = new URL(pagePath, window.location.origin);
    if (topic) {
      nextUrl.searchParams.set(queryKey, topic);
    } else {
      nextUrl.searchParams.delete(queryKey);
    }

    window.history.pushState(null, "", nextUrl.toString());
    window.dispatchEvent(
      new CustomEvent("articles:filter", { detail: { category: topic } }),
    );
  };

  return (
    <div className="topics">
      <ul className="topics_list flex flex-col justify-center items-center md:items-start gap-4 md:mr-20">
        {topics.map((topic) => {
          const isActive = topic === currentActive;

          return (
            <li
              key={topic}
              className="text-[20px] text-nav-link hover:text-text transition-all ease-in-out"
            >
              <button
                type="button"
                className={`topics_item cursor-pointer ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  if (onTopicChange) {
                    onTopicChange(topic);
                    return;
                  }

                  setLocalActive(topic);
                  navigateWithCategory(topic);
                }}
              >
                {topic}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
