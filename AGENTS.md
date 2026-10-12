# poe-game-data — AGENTS.md

> **이 파일이 유일한 프로젝트 지침이다** (Claude Code·Codex 공통, 2026-09-24 `CLAUDE.md` 에서 옮김 — 그 전까지 Codex 는 이 지침을 읽지 못했다). Claude Code(2.1.277+)는 저장소에 `CLAUDE.md` 가 없으면 이 파일을 읽는다 — **`CLAUDE.md` 를 다시 만들지 않는다.**

전역 지침(공통 정본 `D:/github/dev-ref-docs/agent-instructions/AGENTS.md`)을 따른다. 본 문서는 프로젝트 특화 최소 선언만 담는다 (2026-07-07 생성, 작업 축적 시 보강).

## 브랜치 전략 (BLOCKING)

| 브랜치 | 역할 |
|---|---|
| `develop` | **통합 브랜치 — 모든 작업의 기준.** PR 은 여기로 낸다 |
| `master` | 릴리즈 기준선. develop → master 머지로만 반영한다 |
| `claude/*`·`codex/*`·`data/*` | 작업 브랜치. develop 에서 분기해 develop 으로 PR |

**`master` 를 기준으로 작업하거나 PR base 로 잡지 않는다.** 2026-09-04 이전에는 이 저장소에
`develop` 이 없어 작업이 곧장 `master` 로 갔다 — 전역 §4.7 이 금지하는 형태다. 이날 develop 을
`origin/master` 에서 신설했고, 로컬 `origin/HEAD` 도 develop 을 가리키게 맞췄다
(`git remote set-head origin develop`).

> ⚠️ 이 저장소의 트렁크 이름은 `main` 이 아니라 **`master`** 다. 그리고 GitHub 쪽 기본
> 브랜치는 아직 `master` 일 수 있어 `gh pr create` 가 base 를 그쪽으로 잡는다 —
> **`--base develop` 을 명시**한다.

**소비처가 보는 것은 태그다.** jsDelivr 은 이 저장소를 태그로 고정해 받아 가므로, develop 에
머지하는 것만으로는 소비처에 아무 영향이 없다. 배포는 별도 태그 생성 시점에 일어난다.

**태그는 손으로 붙이지 않는다** — poe-ggpk-extractor `npm run release:tag -- <tag>` 가 세
`_index.json` snapshot 이 태그와 같은지 보고 붙인다. 개별 빌더(용병·이름 사전 등)가 여기에 직접 쓴
변경도 `release:all --snapshot <새 태그>` 로 snapshot 을 다시 찍은 뒤 태그한다. `v2026.09.03` 은 이
규칙 없이 붙어 snapshot 이 `v2026.08.30.1` 로 남은 태그다(2026-10-12 확인) — 소비자 lock 에 쓰지 않고,
체크아웃이 이 태그에 있으면 사전 저장소·pricer 가 커밋 불일치 경고를 낸다.

## 하나의 기준 데이터 (BLOCKING, 2026-10-13 사용자 원칙)

이 저장소의 데이터는 **항상 하나의 GGPK 추출에서 나온 하나의 스냅샷**이어야 한다. 번역(사전·확장·아이템
번역기)이든 빌드 도구든 모든 소비처는 그 기준점(lock 한 태그)만 쓴다.

**배포 쪽 계약은 2026-08-30 에 이미 정했다** — 정본은 poe-loot-overlay
`docs/superpowers/specs/2026-08-30-poe2-inventory-ocr-data-unification-design.md` §2·§4, 구현은 poe-ggpk-extractor
README 「단일 snapshot과 소비자 레지스트리」: PoE1·PoE2 를 한 commit·한 태그로 내고(한 게임만 성공한 부분 릴리스 금지),
모든 직접 소비자는 같은 태그 하나를 `poe-game-data.lock.json` 으로 고정한다(게임별 태그 핀은 계약 위반). 소비처
목록은 extractor `consumer-registry.json`, 갱신은 `npm run bump:consumers`. 아래는 그 계약이 다루지 않던 **추출
원천 쪽**을 더한 것이다(2026-10-12: 한 태그 안에서 테이블은 9월 패치 판, 스탯 설명은 6~7월 판이었다).

- 새 데이터 층·파생 파일은 기존 스냅샷과 **같은 GGPK 추출**에서 나올 때만 싣는다. 판이 다르면 섞어 내지 않고
  다음 패치 재추출 때 함께 낸다.
- 스탯 설명은 poe-ggpk-extractor `extract-statdesc --all` 이 출처 표식(GGPK 색인 해시 + 파일별 해시)을 남기고,
  `build-stat-dict` 가 입력이 모두 그 표식과 같을 때만 보조 층(`{game}/stats-extra.json`)과 출처 기록
  (`{game}/stat-source.json`)을 쓴다. 다르면 아무것도 쓰기 전에 멈춘다.
- 결함은 소비처 층에서 손으로 덮기 전에 이 저장소의 원천(GGPK 재추출·빌더 규칙)에서 고칠 수 있는지 먼저 본다.

## 멀티 페르소나 도메인 (전역 §14)

- **도메인**: Data Generator
- **핵심 페르소나**: Product Strategist (데이터 품질) + QA (스키마·다국어 정합성)
- **체크리스트**: `D:\github\multi-persona-domain-review-framework\domains\data-generator\`

## 프로젝트 개요

- GGPK 파일에서 추출한 PoE1/PoE2 게임 데이터 JSON 저장소 — 다국어(5개 언어), jsDelivr CDN 으로 배포.
- **스키마 무결성 우선**: 구조 변경 전 `JSON_SCHEMA.md`·`UNIQUE_JSON_SCHEMA.md` 를 먼저 확인하고, 스키마 변경은 소비처(나랏말싸미 등) 호환성 검토와 함께 진행.
