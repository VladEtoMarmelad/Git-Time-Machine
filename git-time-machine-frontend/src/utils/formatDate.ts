// Helper for formatting dates (from string to readable format)
export const formatDate = (dateString: string, full = false) => {
  const date = new Date(dateString);
  if (full) {
    // Full format for title
    return new Intl.DateTimeFormat("en-EN", {
      day: "numeric", month: "long", year: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric"
    }).format(date);
  }
  // Short format for labels
  return new Intl.DateTimeFormat("en-EN", {
    day: "2-digit", month: "short"
  }).format(date);
};