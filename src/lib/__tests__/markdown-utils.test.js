import { sanitizeMarkdown } from "../markdown-utils";

describe("sanitizeMarkdown", () => {
  it("should return empty string if markdown is null or undefined", () => {
    expect(sanitizeMarkdown(null)).toBe("");
    expect(sanitizeMarkdown(undefined)).toBe("");
  });

  it("should remove backticks around image URLs", () => {
    const input = "![test](`https://example.com/image.png`)";
    const expected = "![test](https://example.com/image.png)";
    expect(sanitizeMarkdown(input)).toBe(expected);
  });

  it("should remove backticks around raw URLs", () => {
    const input = "Check this `https://example.com/image.png`";
    const expected = "Check this https://example.com/image.png";
    expect(sanitizeMarkdown(input)).toBe(expected);
  });

  it("should handle mixed content", () => {
    const input = "Here is an image: ![alt](`url`) and a link `https://link`";
    const expected = "Here is an image: ![alt](url) and a link https://link";
    expect(sanitizeMarkdown(input)).toBe(expected);
  });

  it("should handle GitHub user attachments with backticks", () => {
    const input =
      "![image](`https://github.com/user-attachments/assets/12345678-1234-1234-1234-1234567890ab`)";
    const expected =
      "![image](https://github.com/user-attachments/assets/12345678-1234-1234-1234-1234567890ab)";
    expect(sanitizeMarkdown(input)).toBe(expected);
  });

  it("should convert HTML img tags to Markdown syntax", () => {
    const input = '<img width="696" height="1284" alt="Image" src=" `https://github.com/user-attachments/assets/703be3d9-a2ce-495f-9656-ef38a53c5978` " />';
    const expected = "![Image](https://github.com/user-attachments/assets/703be3d9-a2ce-495f-9656-ef38a53c5978)";
    expect(sanitizeMarkdown(input)).toBe(expected);
  });
});
