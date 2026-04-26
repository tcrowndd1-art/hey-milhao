import GithubSlugger from "github-slugger";

export type TocItem = {
  level: 2 | 3;
  text: string;
  id: string;
};

const HEADING_REGEX = /^(#{2,3})\s+(.+?)\s*$/gm;

export function extractToc(mdxSource: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  for (const match of mdxSource.matchAll(HEADING_REGEX)) {
    const level = match[1].length === 2 ? 2 : 3;
    const text = match[2].replace(/`/g, "").trim();
    const id = slugger.slug(text);
    items.push({ level, text, id });
  }
  return items;
}
