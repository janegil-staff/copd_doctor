"use client";

import { useLang } from "@/context/LangContext";
import styles from "./AdviceCard.module.css";

const SEVERITY_COLORS = {
  high: "#c0392b",
  medium: "#e67e22",
  low: "#4a7ab5",
};

function formatDate(dateStr, lang) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const locale = lang === "no" ? "nb-NO" : lang || "en-US";
    return d.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AdviceCard({ advice }) {
  const { lang, t } = useLang();
  const { category, title, text, date, severity, source } = advice;

  const severityColor = severity ? SEVERITY_COLORS[severity] : null;

  return (
    <article
      className={styles.card}
      style={severityColor ? { borderLeftColor: severityColor } : undefined}
    >
      <div className={styles.topRow}>
        <span className={styles.category}>
          {t(`advice.category.${category}`, category)}
        </span>
        {date && (
          <time className={styles.date} dateTime={date}>
            {formatDate(date, lang)}
          </time>
        )}
      </div>

      {title && <h3 className={styles.title}>{title}</h3>}
      {text && <p className={styles.text}>{text}</p>}

      {source && (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.source}
        >
          {t("advice.readMore", "Read more")} →
        </a>
      )}
    </article>
  );
}