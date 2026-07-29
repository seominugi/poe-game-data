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
/**
 * 킹스마치(Settlers) 분해 먼지 **계수**. 최종 먼지량이 아니다.
 * 아이템 레벨 84 기준 먼지 = `value * 2000`, 퀄리티는 1당 +2%(20% -> *1.4).
 *   dustAtIlvl84 = value * 2000 * (1 + quality * 0.02)
 * **ilvl 84 기준 참고값**이다 — 다른 레벨의 곡선은 dat 에 없다(2026-07-27 결정, 실측은 범위 밖).
 * poe1 전용. 분해 대상이 아닌 소수 유니크는 null.
 */
export interface UniqueDust {
  /** 일반 리그 계수 */
  value: number;
  /** 무자비(Ruthless) 리그 계수 */
  ruthless: number;
}
export interface Unique {
  id: string;
  name: LocalizedString;
  baseItem: { category: LocalizedString; categoryId: string };
  art: { ivId?: string; dds: string } | null;
  image: string | null;
  flavour: LocalizedString | null;
  mods: unknown | null;
  /** poe1 전용 — poe2 배출본에는 이 필드가 없다 */
  dust?: UniqueDust | null;
}
