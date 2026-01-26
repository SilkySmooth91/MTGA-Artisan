import { useMemo, useState } from "react";

/**
 * @param {{ topics?: string[]; activeTopic?: string; onTopicChange?: (topic: string) => void }} props
 */
export default function TopicsList({
  topics = [],
  activeTopic = "",
  onTopicChange,
} = {}) {
  const initialTopic = useMemo(
    () => activeTopic || topics[0] || "",
    [activeTopic, topics],
  );
  const [localActive, setLocalActive] = useState(initialTopic);
  const currentActive = onTopicChange ? activeTopic : localActive;
  return (
    <div className="topics">
      <h3 className="topics_title font-body font-semibold text-3xl mb-4">Topics</h3>

      <ul className="topics_list flex flex-col gap-4">
        {topics.map((topic) => {
          const isActive = topic === currentActive;

          return (
            <li key={topic} className="text-[20px] text-nav-link hover:text-text transition-all ease-in-out"> 
              <button
                type="button"
                className={`topics_item cursor-pointer ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  if (onTopicChange) {
                    onTopicChange(topic);
                  } else {
                    setLocalActive(topic);
                  }
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
