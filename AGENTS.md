# poe-game-data — CLAUDE.md

전역 지침(`~/.claude/CLAUDE.md`)을 따른다. 본 문서는 프로젝트 특화 최소 선언만 담는다 (2026-07-07 생성, 작업 축적 시 보강).

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

## 멀티 페르소나 도메인 (전역 §14)

- **도메인**: Data Generator
- **핵심 페르소나**: Product Strategist (데이터 품질) + QA (스키마·다국어 정합성)
- **체크리스트**: `D:\github\multi-persona-domain-review-framework\domains\data-generator\`

## 프로젝트 개요

- GGPK 파일에서 추출한 PoE1/PoE2 게임 데이터 JSON 저장소 — 다국어(5개 언어), jsDelivr CDN 으로 배포.
- **스키마 무결성 우선**: 구조 변경 전 `JSON_SCHEMA.md`·`UNIQUE_JSON_SCHEMA.md` 를 먼저 확인하고, 스키마 변경은 소비처(나랏말싸미 등) 호환성 검토와 함께 진행.
