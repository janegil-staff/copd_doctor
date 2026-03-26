export const CAT_COLOR = (score) => {
  if (score == null) return "#7a9a98";
  if (score <= 10) return "#0f8a6a";
  if (score <= 20) return "#d4a017";
  if (score <= 30) return "#f97316";
  return "#ef4444";
};

export const CAT_BG = (score) => {
  if (score == null) return "#f0f7f6";
  if (score <= 10) return "#edfaf6";
  if (score <= 20) return "#fefbe8";
  if (score <= 30) return "#fff4ed";
  return "#fff0f0";
};
