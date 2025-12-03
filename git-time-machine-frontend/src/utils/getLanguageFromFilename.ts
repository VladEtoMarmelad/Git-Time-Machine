export const getLanguageFromFilename = (filename: string | null): string => {
  if (!filename) return "text";
  
  const extension = filename.split(".").pop()?.toLowerCase();

  const map: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    css: "css",
    html: "html",
    json: "json",
    py: "python",
    java: "java",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    sh: "bash",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    sql: "sql"
  };

  return extension ? (map[extension] || "text") : "text";
};