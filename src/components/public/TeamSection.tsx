import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type AnimationPlaybackControls,
} from 'framer-motion';
import { ArrowRight, ExternalLink, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { realtimeSync } from '../../lib/realtimeSync';
import { FounderBrainsShowcase } from './FounderBrainsShowcase';
import './TeamSection.css';

export type TeamTier = 'executive' | 'specialist' | 'intern';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  tier: TeamTier;
  category: 'Development' | 'Creative' | 'AI & Data' | 'Marketing' | 'Cybersecurity';
  bio: string;
  skills: string[];
  img: string;
  email?: string;
  phone?: string;
  digiskillBatch?: string;
  shortInfo?: string;
  portfolioUrl?: string;
  rating?: number;
  completedProjectsCount?: number;
  isCeoMaster?: boolean;
}

const SHORT_INFO_MAX = 90;

/** Cut text to max chars at a word boundary, adding "…" when shortened. */
const truncateAtWord = (text: string, max: number): string => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
};

const CATS = ['All', 'Development', 'Creative', 'AI & Data', 'Marketing', 'Cybersecurity'] as const;

export const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Development':
      return {
        text: 'text-cyan-700 dark:text-cyan-300',
        bg: 'bg-cyan-500/10 dark:bg-cyan-400/15',
        border: 'border-cyan-500/30',
        glow: '#22D3EE',
      };
    case 'Creative':
      return {
        text: 'text-purple-700 dark:text-purple-300',
        bg: 'bg-purple-500/10 dark:bg-purple-400/15',
        border: 'border-purple-500/30',
        glow: '#C084FC',
      };
    case 'AI & Data':
      return {
        text: 'text-sky-700 dark:text-sky-300',
        bg: 'bg-sky-500/10 dark:bg-sky-400/15',
        border: 'border-sky-500/30',
        glow: '#38BDF8',
      };
    case 'Marketing':
      return {
        text: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-500/10 dark:bg-amber-400/15',
        border: 'border-amber-500/30',
        glow: '#FBBF24',
      };
    case 'Cybersecurity':
      return {
        text: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-500/10 dark:bg-rose-400/15',
        border: 'border-rose-500/30',
        glow: '#FB7185',
      };
    default:
      return {
        text: 'text-[var(--brand-teal)] dark:text-cyan-300',
        bg: 'bg-[var(--brand-teal-subtle)]',
        border: 'border-[var(--brand-teal)]/30',
        glow: '#22A0B4',
      };
  }
};

/* ── Hanging card swing physics ─────────────────────────────────────────────
 * Low stiffness + low damping → underdamped pendulum (ζ ≈ 0.30): a push swings
 * the card out, then it oscillates back to rest over ~1.5s with 2–3 overshoots.
 * Pushes are impulses (velocity in deg/s) added to the current motion.
 * Peak angle ≈ 0.08 × velocity, so 85 → ~7°, 125 → ~10°.
 */
const SWING_SPRING = { type: 'spring' as const, stiffness: 70, damping: 5, mass: 1, restDelta: 0.01 };
const MAX_ANGLE = 10;
const ENTER_PUSH = 85;
const TOUCH_PUSH = 45;
const MAX_PUSH = 125;
const MOVE_THROTTLE_MS = 150;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/* ── Card photo mode ────────────────────────────────────────────────────────
 * cutout   transparent PNG → contain, standing on the bottom of the tinted zone
 * photo    old photo with a background → cover, fills the zone
 * fallback generated initials (ui-avatars) → centred disc
 * Detection reads the alpha of the image's top corners once it has loaded
 * (needs CORS; if that fails the image is reloaded without it as a photo).
 */
type AvatarMode = 'cutout' | 'photo' | 'fallback';
const avatarModeCache = new Map<string, AvatarMode>();
const isFallbackAvatar = (src: string) => src.includes('ui-avatars.com');

const detectAvatarMode = (img: HTMLImageElement): AvatarMode => {
  try {
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 'photo';
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, 1);
    const topLeftAlpha = data[3];
    const topRightAlpha = data[(size - 1) * 4 + 3];
    return topLeftAlpha < 128 || topRightAlpha < 128 ? 'cutout' : 'photo';
  } catch {
    // Tainted canvas (no CORS) → treat as a normal photo
    return 'photo';
  }
};

const useAvatarMode = (src: string) => {
  const known = isFallbackAvatar(src) ? 'fallback' : avatarModeCache.get(src);
  const [mode, setMode] = useState<AvatarMode | undefined>(known);
  const [useCors, setUseCors] = useState(known === undefined);

  useEffect(() => {
    const next = isFallbackAvatar(src) ? 'fallback' : avatarModeCache.get(src);
    setMode(next);
    setUseCors(next === undefined);
  }, [src]);

  const settle = (next: AvatarMode) => {
    avatarModeCache.set(src, next);
    setMode(next);
  };

  return {
    // Styled as a cutout until known; the zone has a fixed size so nothing shifts
    mode: mode ?? 'cutout',
    crossOrigin: useCors ? ('anonymous' as const) : undefined,
    onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (mode) return;
      settle(useCors ? detectAvatarMode(e.currentTarget) : 'photo');
    },
    onError: () => {
      if (useCors) {
        // Retry once without CORS; it can't be inspected, so show it as a photo
        setUseCors(false);
        return;
      }
      if (!mode) settle('photo');
    },
  };
};

interface HangingCardProps {
  member: TeamMember;
  variant: 'member' | 'intern';
  onOpen: (member: TeamMember) => void;
}

const HangingCard: React.FC<HangingCardProps> = ({ member, variant, onOpen }) => {
  const reduceMotion = useReducedMotion();
  const rawRotate = useMotionValue(0);
  const rotate = useTransform(rawRotate, (v) => clamp(v, -MAX_ANGLE, MAX_ANGLE));
  // Lift the swinging card above its neighbours so it is never clipped by them
  const zIndex = useTransform(rawRotate, (v) => (Math.abs(v) > 0.2 ? 2 : 1));
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const lastMovePushRef = useRef(0);
  const lastPointerTypeRef = useRef<string>('mouse');

  useEffect(() => () => controlsRef.current?.stop(), []);

  // Positive CSS rotation with a top pivot moves the card's bottom LEFT, so a push
  // "to the right" is a negative velocity.
  const push = (velocity: number) => {
    const current = rawRotate.getVelocity();
    controlsRef.current?.stop();
    controlsRef.current = animate(rawRotate, 0, {
      ...SWING_SPRING,
      velocity: clamp(current + velocity, -MAX_PUSH, MAX_PUSH),
    });
  };

  const directionFromCenter = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Pointer on the left half → card is pushed to the right (negative rotation)
    return e.clientX < rect.left + rect.width / 2 ? -1 : 1;
  };

  const swingHandlers = reduceMotion
    ? {}
    : {
        onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
          if (e.pointerType === 'touch') return;
          push(directionFromCenter(e) * ENTER_PUSH);
        },
        onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
          if (e.pointerType === 'touch') return;
          const now = performance.now();
          if (Math.abs(e.movementX) <= 3 || now - lastMovePushRef.current < MOVE_THROTTLE_MS) return;
          lastMovePushRef.current = now;
          push(clamp(-e.movementX * 5, -MAX_PUSH, MAX_PUSH));
        },
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
          if (e.pointerType !== 'touch') return;
          // Tapping the left side pushes the card right, and vice versa
          push(directionFromCenter(e) * TOUCH_PUSH);
        },
      };

  const handleCardClick = () => {
    // Mouse/pen: the whole card opens the profile. Touch: a tap on the card body
    // only swings it; the View Profile button opens the profile.
    if (lastPointerTypeRef.current === 'touch') return;
    onOpen(member);
  };

  const avatar = useAvatarMode(member.img);
  const isIntern = variant === 'intern';

  return (
    <motion.li className={`hc hc--${variant}`} style={{ zIndex }}>
      <motion.div
        className="hc__pendulum"
        style={reduceMotion ? undefined : { rotate, transformOrigin: '50% 0%' }}
        onPointerDownCapture={(e) => {
          lastPointerTypeRef.current = e.pointerType;
        }}
        {...swingHandlers}
      >
        <span className="hc__string" aria-hidden="true" />
        <span className="hc__clip" aria-hidden="true" />
        <article
          className={`hc__card hc__card--${variant} bg-[var(--bg-surface)] border border-[var(--border-subtle)]`}
          onClick={handleCardClick}
        >
          <div className="hc__photo" data-mode={avatar.mode}>
            {/* crossOrigin must precede src so the first request is made with CORS */}
            <img
              crossOrigin={avatar.crossOrigin}
              src={member.img}
              alt={member.name}
              loading="lazy"
              decoding="async"
              onLoad={avatar.onLoad}
              onError={avatar.onError}
            />
          </div>

          <h4
            className={`font-display font-semibold leading-snug text-[var(--text-heading)] mt-4 break-words ${
              isIntern ? 'text-[16px]' : 'text-[18px]'
            }`}
          >
            {member.name}
          </h4>
          <span className="hc__accent" aria-hidden="true" />
          <p className="text-sm text-[var(--text-body)] leading-snug">{member.role}</p>
          {member.shortInfo && (
            <p
              className={`text-xs leading-relaxed text-[var(--text-muted)] mt-1.5 ${
                isIntern ? 'line-clamp-2' : 'line-clamp-3'
              }`}
            >
              {member.shortInfo}
            </p>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(member);
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--brand-teal)] text-[var(--brand-teal)] text-xs font-bold hover:bg-[var(--brand-teal-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-teal)] transition-colors cursor-pointer"
            aria-label={`View profile of ${member.name}`}
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </article>
      </motion.div>
    </motion.li>
  );
};

/** Profile modal avatar: always a round tinted frame; cutouts stand on its bottom. */
const ModalAvatar: React.FC<{ src: string; name: string }> = ({ src, name }) => {
  const avatar = useAvatarMode(src);
  return (
    <div className="tm-modal__avatar" data-mode={avatar.mode}>
      <img
        crossOrigin={avatar.crossOrigin}
        src={src}
        alt={name}
        decoding="async"
        onLoad={avatar.onLoad}
        onError={avatar.onError}
      />
    </div>
  );
};

const SHEET_QUERY = '(max-width: 639.98px)';
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const isSafeUrl = (url?: string) => !!url && /^https?:\/\//i.test(url.trim());

export const TeamSection: React.FC = () => {
  const { siteContent, users } = useApp();
  const [filter, setFilter] = useState<string>('All');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // Phones get a bottom sheet; wider screens a centred dialog
  const [isSheet, setIsSheet] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(SHEET_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(SHEET_QUERY);
    const update = () => setIsSheet(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Real Pinned Member IDs directly from Supabase-backed siteContent
  const pinnedIds: string[] = useMemo(() => {
    return siteContent?.pinnedMemberIds || ['usr-1787949460689', 'usr-1788088620952', 'usr-1788119130873'];
  }, [siteContent?.pinnedMemberIds]);

  useEffect(() => {
    const unsub = realtimeSync.subscribe((_payload) => {
      // Real-time synchronization triggers re-render via Context
    });
    return unsub;
  }, []);

  // Close modal on Escape key; keep Tab inside the dialog; lock body scroll;
  // move focus into the dialog and restore it on close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = dialogRef.current.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    if (selectedMember) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      closeBtnRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMember]);

  const openMember = (member: TeamMember) => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setSelectedMember(member);
  };

  // Helper to identify CEO & Co-founders (Permanent Executive Tier)
  const isCeoOrFounder = (u: any) => {
    if (u.id === 'usr-ceo-1' || u.isCeoMaster || u.roleTier === 'ceo') return true;
    const t = (u.title || '').toLowerCase();
    const r = (u.role || '').toLowerCase();
    return t.includes('ceo') || t.includes('founder') || t.includes('co-founder') || r.includes('ceo');
  };

  // Map real team members from Supabase with their original roles, titles, and bios
  const teamMembers: TeamMember[] = useMemo(() => {
    if (!users || users.length === 0) return [];

    return users
      .filter((u) => u && u.status === 'active')
      .map((u) => {
        const isExec = isCeoOrFounder(u);
        const t = (u.title || '').trim();
        const r = (u.role || '').toLowerCase();

        // Categorize into real roles from Supabase: Executive, Specialist, or Intern
        const isIntern = !isExec && (r === 'intern' || u.roleTier === 'intern');
        const tier: TeamTier = isExec ? 'executive' : isIntern ? 'intern' : 'specialist';

        // Functional Category from user's groupId or title
        let category: TeamMember['category'] = 'Development';
        if (
          u.groupId === 'creative' ||
          t.toLowerCase().includes('design') ||
          t.toLowerCase().includes('brand') ||
          t.toLowerCase().includes('video') ||
          t.toLowerCase().includes('graphic') ||
          t.toLowerCase().includes('editor') ||
          t.toLowerCase().includes('creative')
        ) {
          category = 'Creative';
        } else if (
          u.groupId === 'data' ||
          t.toLowerCase().includes('ai') ||
          t.toLowerCase().includes('data') ||
          t.toLowerCase().includes('intelligence') ||
          t.toLowerCase().includes('analyst') ||
          t.toLowerCase().includes('machine learning')
        ) {
          category = 'AI & Data';
        } else if (
          u.groupId === 'growth' ||
          t.toLowerCase().includes('market') ||
          t.toLowerCase().includes('lead generator') ||
          t.toLowerCase().includes('growth') ||
          t.toLowerCase().includes('sales')
        ) {
          category = 'Marketing';
        } else if (t.toLowerCase().includes('security') || t.toLowerCase().includes('pen test')) {
          category = 'Cybersecurity';
        }

        // Original role title directly from Supabase record
        const role = t || (isExec ? 'Executive Leader' : isIntern ? 'Intern' : 'Specialist');

        // Original bio from Supabase record
        let bio = (u.bio || '').trim();
        if (!bio) {
          if (u.id === 'usr-ceo-1' || t.toLowerCase().includes('ceo') || (t.toLowerCase().includes('founder') && !t.toLowerCase().includes('co-founder'))) {
            bio = 'Founder & CEO of DigiHust. Leading strategic direction, enterprise client partnerships, and company-wide delivery governance at DigiHust.';
          } else if (t.toLowerCase().includes('co-founder') || u.id === 'usr-1788019490206') {
            bio = 'Passionate about building scalable digital solutions and driving business growth. Co-founder with experience in managing operations, client outreach, and digital strategy.';
          } else if (u.specialties && u.specialties.length > 0) {
            bio = `Specialist in ${u.specialties.join(', ')}.`;
          } else {
            bio = `Specialist in ${category} at DigiHust.`;
          }
        }

        // Authentic avatar URL from Supabase Storage with clean fallback
        const img = u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1F7A8C&color=fff&size=256`;

        return {
          id: u.id,
          name: u.name.trim(),
          role,
          tier,
          category,
          bio,
          skills: u.specialties && u.specialties.length > 0 ? u.specialties : ['Digital Delivery'],
          img,
          email: u.email,
          phone: u.phone,
          digiskillBatch: u.digiskillBatch || undefined,
          // Short info; falls back to the member's own bio (never the generated one above)
          shortInfo:
            (u.shortInfo || '').trim() ||
            ((u.bio || '').trim() ? truncateAtWord(u.bio as string, SHORT_INFO_MAX) : undefined),
          portfolioUrl: u.portfolioUrl || undefined,
          rating: u.rating || 5.0,
          completedProjectsCount: u.completedProjectsCount || 0,
          isCeoMaster: u.isCeoMaster,
        };
      });
  }, [users, pinnedIds]);

  // Sort helper: PINNED MEMBERS ALWAYS REMAIN ON TOP OF THEIR SECTION / CATEGORY
  const sortWithPinnedFirst = (list: TeamMember[]) => {
    return [...list].sort((a, b) => {
      const aPinned = pinnedIds.indexOf(a.id);
      const bPinned = pinnedIds.indexOf(b.id);
      if (aPinned !== -1 && bPinned === -1) return -1;
      if (aPinned === -1 && bPinned !== -1) return 1;
      if (aPinned !== -1 && bPinned !== -1) return aPinned - bPinned;
      return a.name.localeCompare(b.name);
    });
  };

  // Filter members by category
  const matchCat = (m: TeamMember) => filter === 'All' || m.category === filter;

  // Split into real role tiers with pinned members strictly on top
  const executives = teamMembers.filter((m) => m.tier === 'executive');

  const specialists = sortWithPinnedFirst(teamMembers.filter((m) => m.tier === 'specialist'));
  const filteredSpecialists = sortWithPinnedFirst(specialists.filter(matchCat));

  const interns = sortWithPinnedFirst(teamMembers.filter((m) => m.tier === 'intern'));
  const filteredInterns = sortWithPinnedFirst(interns.filter(matchCat));

  // Executive members instances (CEO and Co-Founder)
  const ceoMember = executives.find((m) => m.isCeoMaster || m.role.toLowerCase().includes('ceo') || m.id === 'usr-ceo-1') || executives[0];
  const coFounderMember = executives.find((m) => (m.role.toLowerCase().includes('co-founder') || m.role.toLowerCase().includes('cofounder') || m.id === 'usr-1788019490206') && m.id !== ceoMember?.id) || executives[1];

  return (
    <>
      {/* ── 1. EXECUTIVE LEADERSHIP (always visible across filters) ── */}
      <FounderBrainsShowcase
        onSelectMahad={() => ceoMember && openMember(ceoMember)}
        onSelectHaseeb={() => coFounderMember && openMember(coFounderMember)}
      />

      {/* ── 2. SECTION HEADING ── */}
      <div className="bg-[var(--bg-page)] py-14 sm:py-16 px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[var(--text-heading)] mb-4">
              Meet the Minds Behind DigiHust.
            </h2>
            <p className="text-base sm:text-lg text-[var(--text-body)] max-w-2xl leading-relaxed">
              Explore our core team: specialized engineers, designers, and emerging talent driving digital delivery.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── 3. CATEGORY FILTER ── */}
      <div className="bg-[var(--bg-page)] border-b border-[var(--border-subtle)] relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-4 overflow-x-auto no-scrollbar" role="group" aria-label="Filter team by category">
            {CATS.map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  aria-pressed={active}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[var(--brand-teal)] text-white shadow-md shadow-[var(--brand-teal)]/20'
                      : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. SPECIALISTS (pinned first) ── */}
      {filteredSpecialists.length > 0 && (
        <div className="bg-[var(--bg-page)] py-16 px-6 lg:px-8 border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-heading)]">
                  Specialists & Engineers
                </h3>
                <p className="text-sm text-[var(--text-body)] mt-1">
                  Experienced specialists driving production web architecture, UI/UX design, and client sprints.
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)] self-start sm:self-auto">
                {filteredSpecialists.length} Specialists Available
              </span>
            </div>

            <ul className="hc-grid hc-grid--member" role="list">
              {filteredSpecialists.map((member) => (
                <HangingCard key={member.id} member={member} variant="member" onOpen={openMember} />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── 5. INTERNS (pinned first) ── */}
      {filteredInterns.length > 0 && (
        <div className="bg-[var(--bg-subtle)] py-16 px-6 lg:px-8 border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-heading)]">
                  Interns & Apprentices
                </h3>
                <p className="text-sm text-[var(--text-body)] mt-1">
                  Active interns and graduates contributing to sprints across web, AI, design, and marketing.
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-surface)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)] self-start sm:self-auto">
                {filteredInterns.length} Interns Active
              </span>
            </div>

            <ul className="hc-grid hc-grid--intern" role="list">
              {filteredInterns.map((intern) => (
                <HangingCard key={intern.id} member={intern} variant="intern" onOpen={openMember} />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Detailed Member Profile Modal ──
          Portalled to <body> above the fixed navbar (z 9980) and FloatingCTA (z 9990).
          Header and footer stay put; only the body scrolls. <640px: bottom sheet. */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedMember && (
              <div className="fixed inset-0 z-[9995] flex items-end sm:items-center justify-center sm:p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedMember(null)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                />

                {/* Modal Card Window */}
                <motion.div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="team-member-modal-name"
                  {...(reduceMotion
                    ? {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                        transition: { duration: 0.15 },
                      }
                    : isSheet
                    ? {
                        initial: { y: '100%' },
                        animate: { y: 0 },
                        exit: { y: '100%' },
                        transition: { type: 'spring', damping: 34, stiffness: 320 },
                      }
                    : {
                        initial: { opacity: 0, scale: 0.94, y: 20 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        exit: { opacity: 0, scale: 0.94, y: 20 },
                        transition: { type: 'spring', damping: 25, stiffness: 350 },
                      })}
                  className="tm-modal relative z-10 bg-[var(--bg-surface)] shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header (fixed) */}
                  <div className="relative flex-shrink-0 p-5 sm:p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <button
                      ref={closeBtnRef}
                      type="button"
                      onClick={() => setSelectedMember(null)}
                      className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand-teal)] transition-colors cursor-pointer"
                      aria-label="Close profile"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
                      <ModalAvatar src={selectedMember.img} name={selectedMember.name} />
                      <div className="min-w-0 flex-1 sm:pr-8">
                        <h2
                          id="team-member-modal-name"
                          className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-heading)] leading-tight break-words"
                        >
                          {selectedMember.name}
                        </h2>
                        <p className="text-sm font-bold mt-1 text-[var(--brand-teal)]">
                          {selectedMember.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body (the only scrolling part) */}
                  <div className="tm-modal__body p-5 sm:p-8 space-y-6">
                    <div>
                      <h3 className="text-xs font-extrabold text-[var(--brand-teal)] uppercase tracking-wider mb-2.5">
                        Profile & Background
                      </h3>
                      <p className="text-sm sm:text-base text-[var(--text-body)] leading-relaxed whitespace-pre-line break-words">
                        {selectedMember.bio}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold text-[var(--brand-teal)] uppercase tracking-wider mb-3">
                        Specialties & Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-heading)] border border-[var(--border-subtle)] font-semibold shadow-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer (fixed) */}
                  <div className="tm-modal__footer flex-shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(null)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text-body)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-teal)] transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      {isSafeUrl(selectedMember.portfolioUrl) ? (
                        <a
                          href={selectedMember.portfolioUrl!.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--brand-teal)] text-[var(--brand-teal)] text-sm font-bold hover:bg-[var(--brand-teal-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-teal)] transition-colors cursor-pointer"
                        >
                          <span>View Portfolio</span>
                          <ExternalLink className="w-4 h-4" aria-hidden="true" />
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          title="Portfolio coming soon"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--brand-teal)] text-[var(--brand-teal)] text-sm font-bold opacity-50 cursor-not-allowed"
                        >
                          <span>View Portfolio</span>
                          <span className="text-[var(--text-muted)] font-semibold">· Soon</span>
                        </button>
                      )}
                      <Link
                        to={`/contact?inquiry=${encodeURIComponent(`Project Scope with ${selectedMember.name} (${selectedMember.role})`)}`}
                        onClick={() => setSelectedMember(null)}
                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/90 text-white text-sm font-bold shadow-md shadow-[var(--brand-teal)]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-teal)] transition-all cursor-pointer"
                      >
                        <span>Request Project</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
