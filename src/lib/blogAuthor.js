const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const parseBlogAuthorEmails = (value) => {
  if (typeof value !== "string") return [];

  return [...new Set(value.split(",").map(normalizeEmail).filter(Boolean))];
};

export const isBlogAuthor = (
  session,
  configuredEmails = process.env.BLOG_AUTHOR_EMAILS,
) => {
  const email = normalizeEmail(session?.user?.email);
  if (!email) return false;

  return parseBlogAuthorEmails(configuredEmails).includes(email);
};
