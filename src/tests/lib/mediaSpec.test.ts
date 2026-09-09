/**
 * @jest-environment node
 */
import { MEDIA_SPECS, checkAspect } from '@/lib/admin/mediaSpec';
import { RESOURCES } from '@/lib/admin/resources';

test('a 4:5 poster is rejected by the square why-us slot, and the message names the required size', () => {
  const r = checkAspect(1080, 1350, MEDIA_SPECS['home.whyUsImage']);
  expect(r.ok).toBe(false);
  if (r.ok) return;
  expect(r.message).toMatch(/1042×1042/);
  expect(r.message).toMatch(/4:5/);
});

test('±5 % passes', () => {
  expect(checkAspect(1080, 1040, MEDIA_SPECS['home.whyUsImage']).ok).toBe(true);
  expect(checkAspect(1080, 1020, MEDIA_SPECS['home.whyUsImage']).ok).toBe(false);
});

test('logo accepts any landscape ≥ 2:1 and rejects portrait, naming the real floor and a recommended size', () => {
  expect(checkAspect(600, 200, MEDIA_SPECS['settings.logo']).ok).toBe(true);
  expect(checkAspect(900, 200, MEDIA_SPECS['settings.logo']).ok).toBe(true);
  const r = checkAspect(1000, 1300, MEDIA_SPECS['settings.logo']);
  expect(r.ok).toBe(false);
  if (r.ok) return;
  // The floor is minAspect (2:1) — NOT the recommended size's own ratio (600×200 is
  // 3:1), which would tell the admin something narrower than what's actually allowed.
  expect(r.message).toMatch(/2:1/);
  expect(r.message).toMatch(/600×200/);
});

test('hero video outside 16:9…2:1 is rejected naming both ends of the band and a recommended size', () => {
  const r = checkAspect(1080, 1920, MEDIA_SPECS['home.heroVideo']);
  expect(r.ok).toBe(false);
  if (r.ok) return;
  expect(r.message).toMatch(/16:9/);
  expect(r.message).toMatch(/2:1/);
  expect(r.message).toMatch(/2200×1140/);
});

test('a correctly shaped file below the minimum size is rejected naming the minimum', () => {
  const spec = MEDIA_SPECS['home.whyUsImage'];
  const r = checkAspect(100, 100, spec);
  expect(r.ok).toBe(false);
  if (r.ok) return;
  expect(r.message).toMatch(new RegExp(`${spec.minWidth}×${spec.minHeight}`));
});

test('every image/images field in resources.ts names a spec', () => {
  for (const r of RESOURCES) {
    for (const f of r.fields) {
      if (f.type === 'image' || f.type === 'images' || f.rowImage) {
        expect(f.spec ?? f.rowImage?.spec).toBeDefined();
      }
    }
  }
});

test('every spec named by resources.ts exists in MEDIA_SPECS', () => {
  for (const r of RESOURCES) {
    for (const f of r.fields) {
      const key = f.spec ?? f.rowImage?.spec;
      if (key) expect(MEDIA_SPECS[key]).toBeDefined();
    }
  }
});
