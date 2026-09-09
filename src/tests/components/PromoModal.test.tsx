/**
 * `PromoModal` honours the CMS `Promo.delayMs` through `resolveDelay`. The clamping rules
 * are covered in `resolveDelay.test.ts`; this proves the component is wired to them.
 */
import { act, render, screen } from '@testing-library/react';
import { PromoModal } from '@/components/layout/PromoModal';
import { PROMO_DEFAULT_DELAY_MS } from '@/lib/promo/resolveDelay';
import type { Promo } from '@/data/promo';

let mockPathname = '/';
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }));

// next/image needs a configured loader and layout it cannot get in jsdom.
jest.mock('@/components/ui/CmsImage', () => ({
  CmsImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const promo = (delayMs: number): Promo => ({
  image: 'https://example.com/promo.png',
  width: 1600,
  height: 1067,
  alt: 'عرض الشهر',
  whatsappText: 'أرغب بالعرض',
  delayMs,
});

/** The full-screen overlay is `aria-hidden` until the timer opens it. */
const overlay = () => screen.getByRole('dialog', { hidden: true }).parentElement!;
const isOpen = () => overlay().getAttribute('aria-hidden') === 'false';

beforeEach(() => {
  jest.useFakeTimers();
  mockPathname = '/';
  sessionStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('P1: a small stored delayMs is honoured — closed before it elapses, open once it does', () => {
  render(<PromoModal promo={promo(1500)} whatsappNumber="966500000000" />);

  expect(isOpen()).toBe(false);
  act(() => jest.advanceTimersByTime(1400));
  expect(isOpen()).toBe(false);
  act(() => jest.advanceTimersByTime(100));
  expect(isOpen()).toBe(true);
});

test('P2: delayMs === 0 shows the modal immediately, NOT replaced by the default', () => {
  render(<PromoModal promo={promo(0)} whatsappNumber="966500000000" />);

  act(() => jest.advanceTimersByTime(0));
  expect(isOpen()).toBe(true);
});

test('P3: a missing delayMs falls back to the default, not zero and not 15000', () => {
  const missing = { ...promo(0), delayMs: undefined } as unknown as Promo;
  render(<PromoModal promo={missing} whatsappNumber="966500000000" />);

  act(() => jest.advanceTimersByTime(PROMO_DEFAULT_DELAY_MS - 1));
  expect(isOpen()).toBe(false);
  act(() => jest.advanceTimersByTime(1));
  expect(isOpen()).toBe(true);
});

test('the same delay applies on a non-home route (no per-path split)', () => {
  mockPathname = '/من-نحن';
  render(<PromoModal promo={promo(700)} whatsappNumber="966500000000" />);

  act(() => jest.advanceTimersByTime(699));
  expect(isOpen()).toBe(false);
  act(() => jest.advanceTimersByTime(1));
  expect(isOpen()).toBe(true);
});

test('never opens on a suppressed route (branches)', () => {
  mockPathname = '/فروعنا';
  render(<PromoModal promo={promo(0)} whatsappNumber="966500000000" />);

  act(() => jest.advanceTimersByTime(60_000));
  expect(isOpen()).toBe(false);
});

test('a dismissal is remembered for the session', () => {
  sessionStorage.setItem('cs-promo-dismissed', '1');
  render(<PromoModal promo={promo(0)} whatsappNumber="966500000000" />);

  act(() => jest.advanceTimersByTime(60_000));
  expect(isOpen()).toBe(false);
});

test('renders nothing at all when there is no campaign', () => {
  const { container } = render(<PromoModal promo={null} whatsappNumber="966500000000" />);
  expect(container).toBeEmptyDOMElement();
});

test('the offer link messages the number it was given', () => {
  render(<PromoModal promo={promo(0)} whatsappNumber="966511111111" />);
  act(() => jest.advanceTimersByTime(0));

  const link = screen.getByRole('link');
  expect(link).toHaveAttribute('href', expect.stringContaining('966511111111'));
});
