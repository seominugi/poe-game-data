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
types/index.d.ts
```

## 사용 (jsDelivr CDN)
```js
const DATA = 'https://cdn.jsdelivr.net/gh/seominugi/poe-game-data@<tag>'
const idx = await fetch(`${DATA}/poe2/_index.json`).then(r => r.json())
const wands = await fetch(`${DATA}/poe2/${idx.groups.weapons.Wand.jsonPath}`).then(r => r.json())
const name = wands[0].name[locale] ?? wands[0].name.en   // uniques는 en/kr만 — 폴백 필요
```

## 데이터 범위 / 한계
- **poe2**: 베이스 5,038 · 스킬 920 · modifier 7,292 · 고유 449 (텍스트, 5언어)
- **poe1**: 베이스 4,921 (텍스트, 5언어). 고유·modifier·스킬은 후속. 무기 spec은 `attackTime`(초),
  방어구는 `{min,max}` 범위(poe1 dat 구조 차이).
- **이미지 미포함** — `image` 필드는 `null`(향후 확장 자리). 저작권상 GGG 아트는 재호스팅하지 않음.
- uniques: **en/kr만**, explicit mods·다국어는 향후 보강.
