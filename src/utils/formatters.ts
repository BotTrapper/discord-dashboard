export const formatDate = (dateString: string, locale = "de-DE"): string => {
  return new Date(dateString).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateShort = (
  dateString: string,
  locale = "de-DE",
): string => {
  return new Date(dateString).toLocaleDateString(locale);
};
