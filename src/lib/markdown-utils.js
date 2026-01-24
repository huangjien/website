export const sanitizeMarkdown = (markdown) => {
  if (!markdown) return "";
  return markdown
    .replace(/!\[([^\]]*)\]\(`([^`]*)`\)/g, "![$1]($2)")
    .replace(/`\s*(https:\/\/[^`\s]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\(\s*`(\s*)/g, "![$1](")
    .replace(/(\s*)`\s*\)/g, "$1)")
    .replace(/src=["']https:\/\/`/g, 'src="https://')
    .replace(
      /src=["']https:\/\/github\.com\/user-attachments\/assets\/([a-f0-9-]+)`/g,
      'src="https://github.com/user-attachments/assets/$1'
    )
    .replace(
      /!\[([^\]]*)\]\(https:\/\/github\.com\/user-attachments\/assets\/([a-f0-9-]+)\)/g,
      (match, alt, id) => `![${alt}](https://github.com/user-attachments/assets/${id})`
    );
};
