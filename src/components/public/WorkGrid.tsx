import React, { useRef, useEffect } from 'react';
import { Project } from '../../data/workProjects';
import { ProjectCardV2 } from './ProjectCardV2';
import './WorkGrid.css';

interface WorkGridProps {
  projects: Project[];
  className?: string;
}

interface RowItem {
  project: Project;
  span: '7' | '5';
}

const WorkRow: React.FC<{
  rowIdx: number;
  items: RowItem[];
  variant: '7-5' | '5-7';
}> = ({ items, variant }) => {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const rowEl = rowRef.current;
    if (!rowEl || typeof ResizeObserver === 'undefined') return;

    // Find the 7-span card tile inside this row to sync height
    const wideTile = rowEl.querySelector<HTMLElement>('.dh-card-v2--span-7 .dh-card-v2__tile');
    if (!wideTile) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.round(entry.contentRect.height);
        if (height > 0) {
          rowEl.style.setProperty('--row-img-h', `${height}px`);
        }
      }
    });

    observer.observe(wideTile);

    // Initial measurement
    const initialH = Math.round(wideTile.getBoundingClientRect().height);
    if (initialH > 0) {
      rowEl.style.setProperty('--row-img-h', `${initialH}px`);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <div
      ref={rowRef}
      className={`dh-work-row dh-work-row--${variant} ${items.length === 1 ? 'dh-work-row--single' : ''}`}
    >
      {items.map(({ project, span }) => (
        <ProjectCardV2
          key={project.id || project.slug}
          project={project}
          span={span}
          className={`dh-work-grid__item dh-work-grid__item--span-${span}`}
        />
      ))}
    </div>
  );
};

export const WorkGrid: React.FC<WorkGridProps> = ({ projects, className = '' }) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  // Group into pairs with alternating 7/5 and 5/7 column spans
  const rows: Array<{
    items: RowItem[];
    variant: '7-5' | '5-7';
  }> = [];

  for (let i = 0; i < projects.length; i += 2) {
    const isEvenRow = (i / 2) % 2 === 0;
    const variant: '7-5' | '5-7' = isEvenRow ? '7-5' : '5-7';

    const items: RowItem[] = [];
    if (isEvenRow) {
      items.push({ project: projects[i], span: '7' });
      if (projects[i + 1]) {
        items.push({ project: projects[i + 1], span: '5' });
      }
    } else {
      items.push({ project: projects[i], span: '5' });
      if (projects[i + 1]) {
        items.push({ project: projects[i + 1], span: '7' });
      }
    }

    rows.push({ items, variant });
  }

  return (
    <div className={`dh-work-grid ${className}`}>
      {rows.map((row, idx) => (
        <WorkRow
          key={idx}
          rowIdx={idx}
          items={row.items}
          variant={row.variant}
        />
      ))}
    </div>
  );
};
