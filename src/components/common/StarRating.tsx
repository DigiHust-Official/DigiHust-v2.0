import React, { useId } from 'react';

export interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  className?: string;
  ariaLabel?: string;
}

const STAR_POINTS = '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2';

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  size = 18,
  color = '#1F7A8C',
  emptyColor = 'rgba(10,31,43,0.25)',
  className = '',
  ariaLabel,
}) => {
  const uid = useId().replace(/:/g, '');
  const stars = Array.from({ length: max }, (_, i) => i);
  const defaultLabel = `Rated ${value} out of ${max}`;

  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={ariaLabel || defaultLabel}
    >
      {stars.map((index) => {
        const fraction = Math.max(0, Math.min(1, value - index));
        const fillPercent = Math.round(fraction * 100);

        if (fraction >= 1) {
          return (
            <svg
              key={index}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={color}
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <polygon points={STAR_POINTS} />
            </svg>
          );
        }

        if (fraction <= 0) {
          return (
            <svg
              key={index}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke={emptyColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <polygon points={STAR_POINTS} />
            </svg>
          );
        }

        // Fractional star with exact SVG clipPath
        const clipId = `dh-star-clip-${uid}-${index}`;
        const rectWidth = (24 * fillPercent) / 100;
        const rectX = isRTL ? 24 - rectWidth : 0;

        return (
          <svg
            key={index}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <defs>
              <clipPath id={clipId}>
                <rect x={rectX} y="0" width={rectWidth} height="24" />
              </clipPath>
            </defs>
            {/* Empty base star */}
            <polygon
              points={STAR_POINTS}
              fill="none"
              stroke={emptyColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Clipped filled overlay */}
            <polygon
              points={STAR_POINTS}
              fill={color}
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              clipPath={`url(#${clipId})`}
            />
          </svg>
        );
      })}
    </div>
  );
};

export default StarRating;
