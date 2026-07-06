export type Lang = 'en' | 'kr' | 'tw' | 'ru' | 'jp';
export type LocalizedString = Partial<Record<Lang, string>>;

export interface RootIndex {
  schemaVersion: string;
  games: string[];
  generatedAt: string;
}

export interface ClassEntry { jsonPath: string; count: number; sampleName: string; }
export interface FlatEntry { jsonPath: string; count: number; }
export interface ModifierEntry {
  jsonPath: string;
  className: LocalizedString;
  prefixCount: number;
  suffixCount: number;
  totalCount: number;
  buckets: string[];
}
export interface GameIndex {
  gamePatch: string;
  langs: Lang[];
  imageStrategy: 'none' | 'cdn' | 'bundled';
  generated: string;
  groups: Record<string, Record<string, ClassEntry>>;
  // Optional — a game may ship base items only for now (e.g. poe1 currently omits these).
  skills?: FlatEntry;
  uniques?: FlatEntry;
  modifiers?: Record<string, ModifierEntry>;
}

export interface BaseItem {
  id: string;
  classId: string;
  className: LocalizedString;
  name: LocalizedString;
  dropLevel: number;
  image: string | null;
  spec: unknown | null;
  currency: unknown | null;
  flavour: LocalizedString | null;
  implicits: unknown | null;
}
export interface Skill {
  id: string;
  grantedEffect: string;
  name: LocalizedString;
  description: LocalizedString;
  image: string | null;
}
export interface Unique {
  id: string;
  name: LocalizedString;
  baseItem: { category: LocalizedString; categoryId: string };
  art: { ivId?: string; dds: string } | null;
  image: string | null;
  flavour: LocalizedString | null;
  mods: unknown | null;
}
