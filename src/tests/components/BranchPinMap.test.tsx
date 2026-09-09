/**
 * Public branch map: one pin per city, projected from the city table.
 *
 * Pins must use the physical `left`, not `insetInlineStart`, or the RTL document mirrors
 * the map. jsdom does no layout, so this asserts the inline `left`/`top` a pin carries.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { BranchPinMap } from '@/components/branches/BranchPinMap';
import { projectToMap } from '@/lib/geo';
import { findCity } from '@/lib/ksaCities';
import type { Branch } from '@/data/branches';

const branch = (id: string, city: string, name = `فرع ${id}`): Branch => ({
  id,
  name,
  city,
  address: `عنوان ${id}`,
  phone: `96650000000${id}`,
  mapUrl: `https://maps.google.com/?q=${id}`,
  pin: null,
  location: null,
});

const RIYADH = 'الرياض';
const JEDDAH = 'جدة';
const DAMMAM = 'الدمام';
const UNKNOWN = 'مدينة غير مدرجة';

const pins = () => screen.getAllByRole('button').filter((b) => b.style.left !== '');

test('exactly the three known cities get a pin; the unknown city stays unplotted', () => {
  render(
    <BranchPinMap
      branches={[branch('1', RIYADH), branch('2', JEDDAH), branch('3', DAMMAM), branch('4', UNKNOWN)]}
    />,
  );
  expect(pins()).toHaveLength(3);
});

test.each([RIYADH, JEDDAH, DAMMAM])(
  '%s: pin uses physical left/top matching projectToMap, never a logical inset',
  (cityName) => {
    render(<BranchPinMap branches={[branch('1', cityName)]} />);
    const city = findCity(cityName)!;
    const { xPct, yPct } = projectToMap(city.lat, city.lng);

    const [pin] = pins();
    expect(pin).toBeDefined();
    expect(pin!.style.left).toBe(`${xPct}%`);
    expect(pin!.style.top).toBe(`${yPct}%`);
    expect(pin!.style.insetInlineStart).toBe('');
    expect(pin!.style.right).toBe('');
  },
);

test('Jeddah (west) and Dammam (east) land on opposite sides — a mirrored map cannot pass both', () => {
  render(<BranchPinMap branches={[branch('1', JEDDAH), branch('2', DAMMAM)]} />);
  const [jeddah, dammam] = pins();
  expect(parseFloat(jeddah!.style.left)).toBeLessThan(30);
  expect(parseFloat(dammam!.style.left)).toBeGreaterThan(70);
});

test('several branches in one city share ONE pin, and the pin says how many', () => {
  render(
    <BranchPinMap branches={[branch('1', RIYADH), branch('2', RIYADH), branch('3', 'رياض')]} />,
  );
  const all = pins();
  expect(all).toHaveLength(1);
  expect(all[0]).toHaveAccessibleName(/3 فروع/);
});

test('a single-branch pin is named after the branch and its city', () => {
  render(<BranchPinMap branches={[branch('1', RIYADH, 'فرع العليا')]} />);
  expect(pins()[0]).toHaveAccessibleName('فرع العليا — الرياض');
});

test('clicking a pin opens a dialog listing every branch in that city, with call and map links', () => {
  render(
    <BranchPinMap branches={[branch('1', RIYADH, 'فرع العليا'), branch('2', RIYADH, 'فرع النخيل')]} />,
  );
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  fireEvent.click(pins()[0]!);

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAccessibleName(/الرياض/);
  expect(dialog).toHaveAccessibleName(/2 فروع/);
  expect(within(dialog).getByText('فرع العليا')).toBeInTheDocument();
  expect(within(dialog).getByText('فرع النخيل')).toBeInTheDocument();
  expect(within(dialog).getAllByRole('link', { name: /اتصال/ })).toHaveLength(2);
  expect(within(dialog).getAllByRole('link', { name: /الخريطة/ })[0]).toHaveAttribute(
    'href',
    'https://maps.google.com/?q=1',
  );
});

test('the dialog closes on its close button and on Escape', () => {
  render(<BranchPinMap branches={[branch('1', RIYADH)]} />);

  fireEvent.click(pins()[0]!);
  fireEvent.click(screen.getByRole('button', { name: 'إغلاق' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  fireEvent.click(pins()[0]!);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
