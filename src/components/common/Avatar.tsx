import React, { useState } from 'react';
import './Avatar.css';

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface TonalPalette {
  bgLight: string;
  textLight: string;
  bgDark: string;
  textDark: string;
}

const TONAL_PALETTES: TonalPalette[] = [
  {
    bgLight: 'rgba(31, 122, 140, 0.14)',
    textLight: '#1F7A8C',
    bgDark: 'rgba(46, 196, 214, 0.16)',
    textDark: '#2EC4D6',
  },
  {
    bgLight: 'rgba(10, 31, 43, 0.08)',
    textLight: '#0A1F2B',
    bgDark: 'rgba(255, 255, 255, 0.12)',
    textDark: '#E2E8F0',
  },
  {
    bgLight: 'rgba(31, 122, 140, 0.22)',
    textLight: '#165B68',
    bgDark: 'rgba(46, 196, 214, 0.22)',
    textDark: '#5EEAD4',
  },
  {
    bgLight: 'rgba(21, 50, 67, 0.12)',
    textLight: '#153243',
    bgDark: 'rgba(46, 196, 214, 0.18)',
    textDark: '#2EC4D6',
  },
];

function getTonalPalette(name: string): TonalPalette {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TONAL_PALETTES.length;
  return TONAL_PALETTES[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 40,
  className = '',
  style = {},
}) => {
  const [imgError, setImgError] = useState(false);

  const trimmed = (name || '').trim();
  // Array.from handles full Unicode codepoints including Arabic, emoji, accented characters
  const firstLetter = trimmed ? Array.from(trimmed)[0].toUpperCase() : '?';
  const fontSize = Math.max(10, Math.round(size * 0.42));

  const palette = getTonalPalette(trimmed);
  const showImage = Boolean(src) && !imgError;

  return (
    <div
      className={`dh-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ['--avatar-bg-light' as string]: palette.bgLight,
        ['--avatar-text-light' as string]: palette.textLight,
        ['--avatar-bg-dark' as string]: palette.bgDark,
        ['--avatar-text-dark' as string]: palette.textDark,
        ...style,
      }}
      title={name}
      aria-label={name}
      role="img"
    >
      {showImage ? (
        <img
          src={src!}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="dh-avatar__img"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="dh-avatar__fallback"
          style={{ fontSize: `${fontSize}px` }}
          aria-hidden="true"
        >
          {firstLetter}
        </span>
      )}
    </div>
  );
};

export default Avatar;
