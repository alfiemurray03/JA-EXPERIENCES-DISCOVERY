import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const component = await readFile(new URL('../src/components/AccessibilityBubble.tsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles/accessibility-controls.css', import.meta.url), 'utf8');
const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');

test('accessibility settings are connected to global styles', () => {
  const attributes = ['data-a11y-contrast', 'data-a11y-motion', 'data-a11y-font', 'data-a11y-links', 'data-a11y-grayscale'];
  for (const attribute of attributes) {
    assert.ok(component.includes(attribute));
    assert.ok(styles.includes(attribute));
  }
});

test('accessibility styles implement each visible effect', () => {
  assert.ok(main.includes('accessibility-controls.css'));
  assert.ok(styles.includes('Atkinson Hyperlegible'));
  assert.ok(styles.includes('text-decoration-thickness'));
  assert.ok(styles.includes('animation-duration: 0.001ms'));
  assert.ok(styles.includes('filter: grayscale(1)'));
  assert.ok(styles.includes('--background: 0 0% 0%'));
  assert.ok(styles.includes('outline: 4px solid #00ffff'));
});
