import { isBlogAuthor, parseBlogAuthorEmails } from "../blogAuthor";

describe("blog author policy", () => {
  it("fails closed when no author email is configured", () => {
    expect(parseBlogAuthorEmails(undefined)).toEqual([]);
    expect(isBlogAuthor({ user: { email: "owner@example.com" } }, "")).toBe(
      false,
    );
  });

  it("normalizes configured emails", () => {
    expect(
      parseBlogAuthorEmails(" Owner@Example.com, second@example.com "),
    ).toEqual(["owner@example.com", "second@example.com"]);
  });

  it("authorizes only an exact normalized session email", () => {
    const configured = "owner@example.com,second@example.com";

    expect(
      isBlogAuthor({ user: { email: " OWNER@example.com " } }, configured),
    ).toBe(true);
    expect(
      isBlogAuthor({ user: { email: "other@example.com" } }, configured),
    ).toBe(false);
    expect(isBlogAuthor({ user: {} }, configured)).toBe(false);
    expect(isBlogAuthor(null, configured)).toBe(false);
  });
});
