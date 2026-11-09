export interface HeroMessage {
  id: number;
  headKey: string;
  subKey: string;
}

export type HeadSegment = {
  text: string;
  mark: boolean;
};

export type HeadLine = HeadSegment[];

export const HERO_MESSAGES: HeroMessage[] = [
  {
    id: 1,
    headKey: 'hero_msg_1_head',
    subKey: 'hero_msg_1_sub',
  },
  {
    id: 2,
    headKey: 'hero_msg_2_head',
    subKey: 'hero_msg_2_sub',
  },
  {
    id: 3,
    headKey: 'hero_msg_3_head',
    subKey: 'hero_msg_3_sub',
  },
  {
    id: 4,
    headKey: 'hero_msg_4_head',
    subKey: 'hero_msg_4_sub',
  },
  {
    id: 5,
    headKey: 'hero_msg_5_head',
    subKey: 'hero_msg_5_sub',
  },
];

/**
 * Parses a headline string using "|" for line breaks and [[ ... ]] for highlighted phrases.
 * Returns an array of lines, each containing segments with text and mark flag.
 */
export function parseHead(str: string): HeadLine[] {
  if (!str) return [];
  const rawLines = str.split('|');
  return rawLines.map((line) => {
    const segments: HeadSegment[] = [];
    const regex = /\[\[(.*?)\]\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: line.slice(lastIndex, match.index),
          mark: false,
        });
      }
      segments.push({
        text: match[1],
        mark: true,
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      segments.push({
        text: line.slice(lastIndex),
        mark: false,
      });
    }

    return segments;
  });
}

