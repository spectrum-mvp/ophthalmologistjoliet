const htmlEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  copy: "©",
  ldquo: "“",
  lsaquo: "‹",
  lsquo: "‘",
  mdash: "—",
  middot: "·",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  rdquo: "”",
  reg: "®",
  rsaquo: "›",
  rsquo: "’",
};

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&([a-z]+);/gi, (entity, name: string) => {
    return htmlEntities[name.toLowerCase()] ?? entity;
  });
}

export function extractProseArticle(html: string, source: string): string {
  const article = html.match(/<article class="prose">([\s\S]*?)<\/article>/);
  if (!article) {
    throw new Error(`Could not find a prose article in ${source}`);
  }
  return article[1].trim();
}
