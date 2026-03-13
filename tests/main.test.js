// tests/main.test.js
import test from 'node:test';
import assert from 'node:assert';
import { applyConfig, CONFIG } from '../src/main.js';

test('applyConfig - parses JSON string', () => {
  const initialConfig = { ...CONFIG };
  const newConfig = JSON.stringify({ textSize: 10, mediaSize: 90 });

  applyConfig(newConfig);

  assert.strictEqual(CONFIG.textSize, 10);
  assert.strictEqual(CONFIG.mediaSize, 90);

  // Revert changes to CONFIG for other tests
  Object.assign(CONFIG, initialConfig);
});

test('applyConfig - merges object', () => {
  const initialConfig = { ...CONFIG };
  const newConfig = { pseudo: 'test-user', muted: true };

  applyConfig(newConfig);

  assert.strictEqual(CONFIG.pseudo, 'test-user');
  assert.strictEqual(CONFIG.muted, true);

  Object.assign(CONFIG, initialConfig);
});

test('applyConfig - updates CSS variables', () => {
  const initialConfig = { ...CONFIG };
  const newConfig = { textSize: 12, mediaSize: 75 };

  applyConfig(newConfig);

  assert.strictEqual(document.documentElement.style._props['--text-size'], '12vw');
  assert.strictEqual(document.documentElement.style._props['--media-size'], 75);

  Object.assign(CONFIG, initialConfig);
});

test('applyConfig - toggles muteBadge visibility', () => {
  const initialConfig = { ...CONFIG };
  const muteBadge = document.getElementById('mute-badge');

  // Test muted: true
  applyConfig({ muted: true });
  assert.ok(muteBadge.classList.contains('visible'), 'muteBadge should have visible class when muted is true');

  // Test muted: false
  applyConfig({ muted: false });
  assert.ok(!muteBadge.classList.contains('visible'), 'muteBadge should not have visible class when muted is false');

  Object.assign(CONFIG, initialConfig);
});

test('applyConfig - handles partial config', () => {
  const initialConfig = { ...CONFIG };
  const originalPseudo = CONFIG.pseudo;

  applyConfig({ textSize: 15 });

  assert.strictEqual(CONFIG.textSize, 15);
  assert.strictEqual(CONFIG.pseudo, originalPseudo, 'pseudo should remain unchanged');

  Object.assign(CONFIG, initialConfig);
});
