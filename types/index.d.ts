export type Lang = 'en' | 'kr' | 'tw' | 'ru' | 'jp';
export type LocalizedString = Partial<Record<Lang, string>>;

export interface RootIndex {
  schemaVersion: string;
  games: string[];
  generatedAt: string;
  /** PoE1·PoE2 및 모든 파생 데이터가 함께 고정되는 단일 전역 태그 */
  snapshot: string;
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
export interface ItemIconSummary {
  totalItems: number;
  ready: number;
  noVisualIdentity: number;
  noDds: number;
  decodeFailed: number;
  uniqueAssets: number;
}
export interface ItemIconIndexEntry {
  manifestPath: string;
  releaseAssetPattern: 'poe2-item-icons-{tag}.zip';
  /** 제품 배선 정책이며 공개 저장소의 다운로드 접근 제어가 아니다. */
  audience: ['poe-loot-overlay'];
  summary: ItemIconSummary;
}
export interface GameIndex {
  gamePatch: string;
  langs: Lang[];
  /** 루트와 반드시 같은 PoE1·PoE2 공통 snapshot */
  snapshot: string;
  imageStrategy: 'none' | 'cdn' | 'bundled' | 'release-asset';
  generated: string;
  groups: Record<string, Record<string, ClassEntry>>;
  // Optional — a game may ship base items only for now (e.g. poe1 currently omits these).
  skills?: FlatEntry;
  supportGems?: FlatEntry;
  uniques?: FlatEntry;
  modifiers?: Record<string, ModifierEntry>;
  /** poe2 전용. PNG는 같은 snapshot 태그의 GitHub Release asset에만 있다. */
  itemIcons?: ItemIconIndexEntry;
}

export type ItemIconStatus = 'ready' | 'no-visual-identity' | 'no-dds' | 'decode-failed';
export interface ItemIconRelation {
  itemId: string;
  metadataId: string;
  visualIdentityId: string | null;
  names: { en: string; kr: string | null };
  sourceDds: string | null;
  assetSha256: string | null;
  status: ItemIconStatus;
}
export interface ItemIconAsset {
  path: string;
  sha256: string;
  width: number;
  height: number;
  bytes: number;
}
export interface Poe2ItemIconManifest {
  schemaVersion: 1;
  game: 'poe2';
  audience: ['poe-loot-overlay'];
  gamePatch: string;
  summary: ItemIconSummary;
  items: ItemIconRelation[];
  assets: Record<string, ItemIconAsset>;
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

/**
 * `poe1/mercenaries/*.json` — 용병(Mercenary) 해시 사전. poe1 전용.
 *
 * 거래 API 가 용병 매물을 `mercenarySkills: [{hash, supports: [{hash, tier}]}]` 형태로만 주고
 * `Build` 속성은 영문 빌드명이라, 사람이 읽으려면 이 사전이 필요하다. 키의 근거는 GGPK
 * `MercenarySkills.HASH16` / `MercenarySupports.HASH16` 이 GGG 거래 stat id 와 1:1 이라는 것이며,
 * `MercenarySupports.Variant` 가 곧 거래 응답의 `tier` 다.
 *
 * `dict/`·`names/` 와 같이 **경로 규약**이고 `_index.json` 에 등록되지 않는다.
 * poe-ggpk-extractor 의 `npm run build:merc:poe1` 이 생성한다.
 */
export interface MercenarySkillEntry {
  name: LocalizedString;
  /** 보조젬 슬롯 **등급** (`Low`/`Medium`/`High`/`None`) — 실제 개수는 `MercenaryMeta` 참조 */
  supportCount: 'Low' | 'Medium' | 'High' | 'None';
  /** GGPK MercenarySkillFamilies.Id. 대부분 null */
  family: string | null;
  /** 이 스킬에 붙을 수 있는 보조젬 해시 (`supports.json` 키) */
  possibleSupports: number[];
}
export interface MercenarySupportEntry {
  /** GGPK MercenarySupports.Id (예: "EleDamageWithAttacksHigh") */
  id: string;
  name: LocalizedString;
  /** 거래 응답의 `tier` 와 같은 값 (1~3) */
  tier: 1 | 2 | 3;
  /**
   * 계열. **한 스킬에 같은 계열이 두 번 붙지 않는다** — 아트가 달라도 계열이 같으면 배타다
   * (예: Multiple Projectiles I 과 Greater Multiple Projectiles III). null 은 각자 독립 계열.
   */
  family: string | null;
  /** GGPK 내부 DDS 경로. 이미지 자체는 저작권상 배포하지 않는다 */
  gemIcon: string | null;
  stats: Array<{ id: string; value: number }>;
}
export interface MercenaryBuildEntry {
  /** GGPK MercenaryBuilds.Id (예: "EleBowRangerClones") */
  archetype: string;
  hash: number;
  name: LocalizedString;
  /** GGPK MercenaryClasses.Id */
  class: string;
  /** GGPK MercenaryAttributes.Id (예: "Dex", "StrInt") */
  attribute: string;
  infamous: boolean;
  /**
   * `skill1` 은 항상 전부 부여되고, `skill2`/`skill3` 에서 각각 `pick2`/`pick3` 개를 뽑는다.
   * 합계는 65개 빌드 중 63개가 6이고 예외는 Frost Ambusher(5)·Bladereach(1) 뿐이다.
   * 값은 `skills.json` 의 키(해시).
   */
  skillPools: { skill1: number[]; skill2: number[]; skill3: number[]; pick2: number; pick3: number };
  /** 착용 가능 아이템 클래스 (ItemClasses.Id) */
  wieldableTypes: string[];
}
export interface MercenaryMeta {
  gamePatch: string | null;
  generated: string;
  langs: Lang[];
  source: string;
  hashKey: string;
  counts: { builds: number; skills: number; supports: number };
  /**
   * **GGPK 추출값이 아니라 거래 매물 실측치다.** `MercenarySupportCounts` 는 등급 문자열만 담고
   * 실제 슬롯 개수는 클라이언트 하드코딩이라 dat 에 없다.
   *
   * **`max` 는 상한이지 개수가 아니다** — Medium 의 32% · High 의 27% 가 최빈값보다 적게 채워져
   * 있었고, 같은 용병 안에서도 스킬마다 달랐다(스킬 단위 개체차). "이 등급이면 N개"라는 기대값으로
   * 쓰면 안 된다. 실제 분포는 `observed`(슬롯 수 → 건수)를 볼 것.
   */
  supportCountSlots: {
    source: 'observed-estimate';
    semantics: 'upper-bound';
    note: string;
    observedAt: string;
    observedFrom: string;
    values: Record<string, { max: number; mode: number; observed: Record<string, number> }>;
  };
}
/** `mercenaries/skills.json` · `supports.json` — 키는 해시(문자열화된 정수) */
export type MercenarySkillDictionary = Record<string, MercenarySkillEntry>;
export type MercenarySupportDictionary = Record<string, MercenarySupportEntry>;
/** `mercenaries/builds.json` — 키는 거래 아이템의 `Build` 속성값(영문 BuildName) */
export type MercenaryBuildDictionary = Record<string, MercenaryBuildEntry>;

export interface BaseItem {
  id: string;
  /** poe2 base item에 보존되는 BaseItemTypes.Id. poe1에는 아직 없을 수 있다. */
  metadataId?: string;
  /** poe2 base item의 ItemVisualIdentity.Id. 연결이 없으면 null. */
  visualIdentityId?: string | null;
  classId: string;
  className: LocalizedString;
  name: LocalizedString;
  dropLevel: number;
  image: string | null;
  spec: unknown | null;
  currency: unknown | null;
  flavour: LocalizedString | null;
  implicits: unknown | null;
  /** GGPK Tags.Id 목록 (예: "str_armour"). 태그가 없으면 빈 배열 — poe1 5,213개 중 2,992개 보유 */
  tags?: string[];
  /** 젬 계열만 non-null (poe1 835개). 그 외 아이템은 null */
  gem?: { colour: string; isSupport: boolean; isVaal: boolean } | null;
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
