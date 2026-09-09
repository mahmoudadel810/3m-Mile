/**
 * @jest-environment node
 *
 * Dashboard config integrity, driven by the REAL resources.ts config. These are the
 * checks that need no running API: a resource that is malformed here renders as a
 * blank caption, an unfillable select, or a link the admin nav cannot resolve.
 */
import { RESOURCES, NAV_GROUPS, findResource } from '@/lib/admin/resources';

describe('dashboard config integrity', () => {
  test('every resource is well-formed', () => {
    for (const r of RESOURCES) {
      expect(r.key).toBeTruthy();
      expect(r.endpoint.startsWith('/')).toBe(true);
      expect(['collection', 'singleton']).toContain(r.kind);
      expect(r.fields.length).toBeGreaterThan(0);

      const names = r.fields.map((f) => f.name);
      expect(new Set(names).size).toBe(names.length);

      for (const f of r.fields) {
        expect(f.name).toBeTruthy();
        // No label means the admin sees a blank caption.
        expect(f.label).toBeTruthy();
      }
    }
  });

  test('resource keys are unique', () => {
    const keys = RESOURCES.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('every select field offers at least one option', () => {
    for (const r of RESOURCES) {
      for (const f of r.fields) {
        if (f.type === 'select') expect(f.options?.length).toBeGreaterThan(0);
        for (const sub of f.item ?? []) {
          if (sub.type === 'select') expect(sub.options?.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('every repeater declares a row shape with uniquely named sub-fields', () => {
    for (const r of RESOURCES) {
      for (const f of r.fields.filter((x) => x.type === 'repeater')) {
        expect(f.item?.length).toBeGreaterThan(0);
        const names = (f.item ?? []).map((s) => s.name);
        expect(new Set(names).size).toBe(names.length);
      }
    }
  });

  test('a repeater row floor never exceeds its ceiling', () => {
    for (const r of RESOURCES) {
      for (const f of r.fields) {
        if (f.minItems !== undefined && f.maxItems !== undefined) {
          expect(f.minItems).toBeLessThanOrEqual(f.maxItems);
        }
      }
    }
  });

  test('every nav group key resolves to a resource', () => {
    for (const g of NAV_GROUPS) {
      for (const key of g.keys) expect(findResource(key)).toBeDefined();
    }
  });

  test('every resource appears in exactly one nav group', () => {
    const navKeys = NAV_GROUPS.flatMap((g) => g.keys);
    for (const r of RESOURCES) {
      expect(navKeys.filter((k) => k === r.key)).toHaveLength(1);
    }
  });
});
