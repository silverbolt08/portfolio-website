export type SectionId =
  | 'hero'
  | 'manifesto'
  | 'stats'
  | 'skills'
  | 'work'
  | 'experience'
  | 'minor-works'
  | 'contact';

export interface Link {
  label: string;
  href: string;
  external?: boolean;
}

export type Motif =
  | 'agents'
  | 'layout'
  | 'telemetry'
  | 'brain'
  | 'aptamer'
  | 'cells'
  | 'network'
  | 'flame'
  | 'slingshot';

/** The single swap point for every asset on the site. */
export interface Media {
  /** 'drawing' is drawn in the site's palette from `motif`; 'image' and 'video' need a `src`. */
  kind: 'drawing' | 'image' | 'video';
  src?: string;
  poster?: string;
  alt: string;
  /** 'auto' keeps a real image's own proportions (nothing cropped). */
  aspect: '16/9' | '4/3' | '1/1' | '3/4' | 'auto';
  /** Intrinsic size of a real image, so the browser reserves its space before it loads. */
  width?: number;
  height?: number;
  motif?: Motif;
}

export interface CaseStudy {
  /** The picture at the top of the opened case study. Falls back to the card's visual. */
  cover?: Media;
  overview: string;
  approach: string[];
  stack: string[];
  outcome: string[];
  links: Link[];
}

export interface Project {
  id: string;
  index: string;
  title: string;
  year: string;
  tags: string[];
  outcome: string;
  facts: string[];
  visual: Media;
  caseStudy: CaseStudy;
}

export interface Stat {
  value: number;
  decimals: number;
  prefix?: string;
  suffix: string;
  label: string;
}

export interface ExperienceEntry {
  id: string;
  year: string;
  period: string;
  org: string;
  place?: string;
  role: string;
  supervisor?: string;
  summary: string;
  metrics: { figure: string; text: string }[];
}

export interface Achievement {
  title: string;
  detail: string;
  year?: string;
}

export interface MinorWork {
  id: string;
  title: string;
  year?: string;
  blurb: string;
  tags: string[];
  preview: Media;
  easterEgg?: 'slingshot';
}

export interface SiteContent {
  meta: { title: string; description: string };
  person: {
    /** Display name, in normal case. */
    name: string;
    first: string;
    last: string;
    monogram: string;
    role: string;
    city: string;
    timeZone: string;
    education: string;
  };
  contact: { email: string; github: Link; linkedin: Link; resume: Link };
  nav: { id: SectionId; label: string }[];
  /** Emphasis words are wrapped in *asterisks*. */
  manifesto: { heading: string; text: string };
  stats: { heading: string; items: Stat[] };
  skills: { heading: string; groups: { group: string; items: string[] }[]; marqueeRows: [string[], string[]] };
  work: { heading: string; intro: string; projects: Project[] };
  experience: { heading: string; entries: ExperienceEntry[]; achievementsHeading: string; achievements: Achievement[] };
  minorWorks: { heading: string; items: MinorWork[] };
  contactSection: { heading: string; headline: string[]; intro: string; footerMarquee: string[]; credit: string };
}
