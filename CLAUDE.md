# poe-game-data — CLAUDE.md

전역 지침(`~/.claude/CLAUDE.md`)을 따른다. 본 문서는 프로젝트 특화 최소 선언만 담는다 (2026-07-07 생성, 작업 축적 시 보강).

## 멀티 페르소나 도메인 (전역 §14)

- **도메인**: Data Generator
- **핵심 페르소나**: Product Strategist (데이터 품질) + QA (스키마·다국어 정합성)
- **체크리스트**: `D:\github\multi-persona-domain-review-framework\domains\data-generator\`

## 프로젝트 개요

- GGPK 파일에서 추출한 PoE1/PoE2 게임 데이터 JSON 저장소 — 다국어(5개 언어), jsDelivr CDN 으로 배포.
- **스키마 무결성 우선**: 구조 변경 전 `JSON_SCHEMA.md`·`UNIQUE_JSON_SCHEMA.md` 를 먼저 확인하고, 스키마 변경은 소비처(나랏말싸미 등) 호환성 검토와 함께 진행.
