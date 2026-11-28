const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const parseBlogAuthorEmails = (value) => {
  if (typeof value !== "string") return [];

  return [...new Set(value.split(",").map(normalizeEmail).filter(Boolean))];
};
