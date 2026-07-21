# poe-game-data

GGPK 원본에서 추출한 **Path of Exile 게임 데이터(JSON)**. 게임 버전별 디렉토리(`poe2/`, `poe1/`)로 관리한다.

> 데이터 저작권은 **Grinding Gear Games**에 있습니다. 비상업 목적이며, This product isn't affiliated with or endorsed by Grinding Gear Games in any way.

## 구조
```
_index.json            # { schemaVersion, games, generatedAt }
poe2/
  _index.json          # { gamePatch, langs, imageStrategy, generated, groups/skills/uniques/modifiers }
  json/<group>/<class>/*.json   # 베이스 아이템 (5언어)
  skills/json/ActiveSkills.json
  uniques/json/uniques.json
  modifiers/json/<class>.json
poe1/                  # 현재 베이스 아이템만 (skills/uniques/modifiers 는 후속)
  _index.json          # { gamePatch, langs, imageStrategy, generated, groups }
  json/<group>/<class>/*.json   # 베이스 아이템 (5언어)
<game>/names/<lang>.json        # 파생: 영문명 -> 표시명 사전 (kr/tw/ru/jp) — dict/ 와 같이 경로 규약
types/index.d.ts
```

## 사용 (jsDelivr CDN)
```js
const DATA = 'https://cdn.jsdelivr.net/gh/seominugi/poe-game-data@<tag>'
const idx = await fetch(`${DATA}/poe2/_index.json`).then(r => r.json())
const wands = await fetch(`${DATA}/poe2/${idx.groups.weapons.Wand.jsonPath}`).then(r => r.json())
const name = wands[0].name[locale] ?? wands[0].name.en   // uniques는 en/kr만 — 폴백 필요
```

**이름만 필요하면 클래스 JSON 대신 `names/` 사전을 쓴다** (poe1 6MB·poe2 5MB → 언어 파일 1개 ≈ 62KB gzip).
`dict/` 와 마찬가지로 `_index.json` 에 등록되지 않는 **경로 규약**이다 — 언어 목록은 `idx.langs` 로 얻는다:
```js
const names = await fetch(`${DATA}/poe1/names/kr.json`).then(r => r.json())
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ')   // 키 정규화 규칙 (필수)
names[norm('Crusader Chainmail')]   // '십자군 사슬 갑옷'  — 원본 표기 흔들림도 흡수
names[norm('Plate Vest')] ?? 'Plate Vest'   // 영문과 같은 값은 미수록 — 영문 폴백
```
스탯·드랍레벨·통화 설명 등이 필요하면 기존 `groups[*][*].jsonPath` 경로를 그대로 쓴다.

## 데이터 범위 / 한계
- **poe2**: 베이스 5,038 · 스킬 920 · modifier 7,292 · 고유 449 (텍스트, 5언어)
- **poe1**: 베이스 4,921 (텍스트, 5언어). 고유·modifier·스킬은 후속. 무기 spec은 `attackTime`(초),
  방어구는 `{min,max}` 범위(poe1 dat 구조 차이).
- **이미지 미포함** — `image` 필드는 `null`(향후 확장 자리). 저작권상 GGG 아트는 재호스팅하지 않음.
- uniques: **en/kr만**, explicit mods·다국어는 향후 보강.
- `names/`: 베이스+스킬의 영문명 기준 파생 사전(poe1 4,415 · poe2 4,968 고유명). 같은 영문명에 다른
  언어값을 가진 레거시·변형 행(poe1 18 · poe2 86)은 **`groups` 순회 순서상 처음 것이 이긴다**.
  데이터 갱신 후 poe-ggpk-extractor 에서 `npm run build:names` · `build:names:poe1` 로 재생성한다(멱등).
