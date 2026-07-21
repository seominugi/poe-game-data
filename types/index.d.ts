export type Lang = 'en' | 'kr' | 'tw' | 'ru' | 'jp';
export type LocalizedString = Partial<Record<Lang, string>>;

export interface RootIndex {
  schemaVersion: string;
  games: string[];
  generatedAt: string;
}

export interface ClassEntry { jsonPath: string; count: number; sampleName: string; className?: LocalizedString; }
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

/**
 * `<game>/names/<lang>.json` — normalized English name -> localized display name.
 * Derived artifact built by poe-ggpk-extractor (`npm run build:names[:poe1]`).
 *
 * Like `dict/`, it is addressed by path convention and is NOT listed in `_index.json`
 * (that file is regenerated wholesale by gen-index/export, so a registered node would be
 * silently dropped on the next refresh). Enumerate languages from `GameIndex.langs`.
 *
 * Key: `en.trim().toLowerCase().replace(/\s+/g, ' ')` — consumers must normalize lookups the
 * same way. Entries whose localized value equals the English name are omitted; fall back to it.
 */
export type NameDictionary = Record<string, string>;

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
