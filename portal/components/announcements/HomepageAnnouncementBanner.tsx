"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronLeft, ChevronRight, Megaphone, Pause, Play } from "lucide-react";
import type { Announcement } from "@/lib/announcements/announcement-types";

type HomepageAnnouncementBannerProps = {
  initialAnnouncements: Announcement[];
};

const ROTATION_INTERVAL_MS = 7000;
const REFRESH_INTERVAL_MS = 60000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export default function HomepageAnnouncementBanner({
  initialAnnouncements,
}: HomepageAnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const rotationPaused = paused || reducedMotion;

  const activeAnnouncement = announcements[activeIndex] ?? announcements[0];
  const hasMultiple = announcements.length > 1;

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      announcements.length ? (current + 1) % announcements.length : 0,
    );
  }, [announcements.length]);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      announcements.length
        ? (current - 1 + announcements.length) % announcements.length
        : 0,
    );
  }, [announcements.length]);

  useEffect(() => {
    if (!hasMultiple || rotationPaused) return;

    const interval = window.setInterval(showNext, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [hasMultiple, rotationPaused, showNext]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch("/api/announcements", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          announcements?: Announcement[];
        };
        if (!Array.isArray(payload.announcements)) return;
        setAnnouncements(payload.announcements);
        setActiveIndex((current) =>
          payload.announcements?.length
            ? Math.min(current, payload.announcements.length - 1)
            : 0,
        );
      } catch {
        // Keep the last successfully loaded announcements visible.
      }
    };

    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const priorityLabel = useMemo(() => {
    if (!activeAnnouncement) return "";
    if (activeAnnouncement.priority === "urgent") return "Urgent update";
    if (activeAnnouncement.priority === "important") return "Important update";
    return "Team update";
  }, [activeAnnouncement]);

  if (!activeAnnouncement) return null;

  return (
    <section
      className={`announcement-banner announcement-banner--${activeAnnouncement.priority}`}
      aria-label="501 Elite announcements"
      onMouseEnter={() => hasMultiple && setPaused(true)}
      onMouseLeave={() => hasMultiple && setPaused(false)}
      onFocus={() => hasMultiple && setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="announcement-banner__shell">
        <Megaphone aria-hidden="true" />

        <div className="announcement-banner__content" aria-live="polite">
          <span>{priorityLabel}</span>
          <strong>{activeAnnouncement.title}</strong>
          <p>{activeAnnouncement.message}</p>
        </div>

        {activeAnnouncement.button_text && activeAnnouncement.link_url ? (
          <a className="announcement-banner__link" href={activeAnnouncement.link_url}>
            {activeAnnouncement.button_text}
          </a>
        ) : null}

        {hasMultiple ? (
          <div className="announcement-banner__controls" aria-label="Announcement controls">
            <button type="button" onClick={showPrevious} aria-label="Previous announcement">
              <ChevronLeft aria-hidden="true" />
            </button>
            <span aria-label={`Announcement ${activeIndex + 1} of ${announcements.length}`}>
              {activeIndex + 1}/{announcements.length}
            </span>
            <button
              type="button"
              onClick={() => setPaused((current) => !current)}
              disabled={reducedMotion}
              aria-label={
                reducedMotion
                  ? "Automatic rotation disabled by reduced-motion preference"
                  : paused
                    ? "Resume announcements"
                    : "Pause announcements"
              }
            >
              {paused || reducedMotion ? (
                <Play aria-hidden="true" />
              ) : (
                <Pause aria-hidden="true" />
              )}
            </button>
            <button type="button" onClick={showNext} aria-label="Next announcement">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
