import { parseBlogAuthorEmails } from "../blogAuthor";

describe("blog author policy", () => {
  it("returns an empty list when no author email is configured", () => {
    expect(parseBlogAuthorEmails(undefined)).toEqual([]);
    expect(parseBlogAuthorEmails("")).toEqual([]);
  });

  it("normalizes configured emails", () => {
    expect(
      parseBlogAuthorEmails(" Owner@Example.com, second@example.com "),
    ).toEqual(["owner@example.com", "second@example.com"]);
  });

  it("drops empty entries and duplicates", () => {
    expect(
      parseBlogAuthorEmails("owner@example.com, ,owner@example.com"),
    ).toEqual(["owner@example.com"]);
  });
});
