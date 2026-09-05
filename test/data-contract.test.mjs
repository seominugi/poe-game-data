import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

function poe2BaseItems() {
  const index = readJson('poe2/_index.json');
  return Object.values(index.groups)
    .flatMap((classes) => Object.values(classes))
    .flatMap((entry) => readJson(path.join('poe2', entry.jsonPath)));
}

test('루트 스냅샷은 PoE1·PoE2를 한 태그로 고정한다', () => {
  const root = readJson('_index.json');
  assert.equal(root.schemaVersion, '1.1');
  assert.deepEqual(root.games, ['poe1', 'poe2']);
  assert.match(root.snapshot, /^v\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/);
  assert.equal(readJson('poe1/_index.json').snapshot, root.snapshot);
  assert.equal(readJson('poe2/_index.json').snapshot, root.snapshot);
});

test('PoE2 base item 4,892개는 기존 id와 별개인 안정 ID를 보존한다', () => {
  const items = poe2BaseItems();
  // 0.5.5(4.5.5.1): 신규 20종 — 영혼 핵 18 · 지도 조각 1(신성한 꽃) · 결전 1
  assert.equal(items.length, 4_892);
  assert.equal(new Set(items.map((item) => item.metadataId)).size, items.length);
  for (const item of items) {
    assert.equal(typeof item.id, 'string');
    assert.match(item.metadataId, /^Metadata\/Items\//i);
    assert.equal(typeof item.visualIdentityId, 'string');
    assert.equal(item.image, null);
  }
});

test('알두르의 영웅담과 고대 액체 절망 관계를 서로 다른 원본 자산으로 고정한다', () => {
  const items = poe2BaseItems();
  const aldur = items.find((item) => item.name.en === "Aldur's Saga");
  const despair = items.find((item) => item.name.en === 'Ancient Liquid Despair');
  assert.deepEqual({
    id: aldur.id,
    metadataId: aldur.metadataId,
    visualIdentityId: aldur.visualIdentityId,
    kr: aldur.name.kr,
  }, {
    id: 'aldurs-saga',
    metadataId: 'Metadata/Items/Expedition/Expedition2LogbookSpecial',
    visualIdentityId: 'ExpeditionLogbookSpecialEndgame',
    kr: '알두르의 영웅담',
  });
  assert.equal(despair.metadataId, 'Metadata/Items/Currency/DistilledEmotionTimeLost7');
  assert.equal(despair.visualIdentityId, 'CurrencyTimeLostDistilledDespair');

  const manifest = readJson('poe2/assets/item-icons-manifest.json');
  const relations = new Map(manifest.items.map((item) => [item.metadataId, item]));
  const aldurIcon = relations.get(aldur.metadataId);
  const despairIcon = relations.get(despair.metadataId);
  assert.equal(aldurIcon.status, 'ready');
  assert.equal(despairIcon.status, 'ready');
  assert.notEqual(aldurIcon.assetSha256, despairIcon.assetSha256);
});

test('PoE2 아이콘 매니페스트는 완전하고 PNG 바이너리는 Git에 포함하지 않는다', () => {
  const index = readJson('poe2/_index.json');
  const manifest = readJson(path.join('poe2', index.itemIcons.manifestPath));
  assert.equal(index.imageStrategy, 'derived-features');
  assert.equal(index.itemIcons.source, 'local-ggpk-build');
  assert.equal(index.itemIcons.distribution, 'poe-loot-overlay-derived-only');
  assert.equal('releaseAssetPattern' in index.itemIcons, false);
  assert.deepEqual(index.itemIcons.audience, ['poe-loot-overlay']);
  assert.deepEqual(manifest.summary, {
    totalItems: 4_892,
    ready: 4_892,
    noVisualIdentity: 0,
    noDds: 0,
    decodeFailed: 0,
    uniqueAssets: 2_633,
  });
  const referenced = new Set(manifest.items.map((item) => item.assetSha256));
  assert.equal(referenced.size, Object.keys(manifest.assets).length);
  for (const [hash, asset] of Object.entries(manifest.assets)) {
    assert.equal(asset.sha256, hash);
    assert.equal(asset.path, `item-icons/${hash}.png`);
    assert.match(hash, /^[a-f0-9]{64}$/);
  }
  assert.equal(fs.existsSync('poe2/assets/item-icons'), false);
});
