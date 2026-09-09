/**
 * A section with nothing to show renders nothing.
 *
 * The CMS ships empty: no partners, no reviews, no posts on a fresh install. Each
 * collection-backed home section must not render its chrome (heading/arrows/dots/empty
 * boxes) around zero items — and must render normally once there is something to show.
 */
import { render, screen } from '@testing-library/react';
import { PartnerStrip } from '@/components/home/PartnerStrip';
import { ReviewCarousel } from '@/components/home/ReviewCarousel';
import { LatestPosts } from '@/components/home/LatestPosts';
import type { PostSummary } from '@/lib/posts';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={String(src)} />,
}));
jest.mock('@/components/ui/CmsImage', () => ({
  CmsImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const rating = { score: '4.9', reviewCount: 120 };

describe('PartnerStrip', () => {
  test('renders nothing with no partners', () => {
    const { container } = render(<PartnerStrip partners={[]} heading="شركاؤنا" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the section once there is a partner', () => {
    render(<PartnerStrip partners={[{ name: 'شريك', src: 'https://example.com/p.png' }]} heading="شركاؤنا" />);
    expect(screen.getByRole('heading', { name: 'شركاؤنا' })).toBeInTheDocument();
  });
});

describe('ReviewCarousel', () => {
  test('renders nothing with no review screenshots', () => {
    const { container } = render(
      <ReviewCarousel reviews={{ heading: 'آراء العملاء', description: '', images: [] }} rating={rating} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the section once there is a review', () => {
    render(
      <ReviewCarousel
        reviews={{ heading: 'آراء العملاء', description: '', images: [{ src: 'https://example.com/r.png', alt: 'تقييم' }] }}
        rating={rating}
      />,
    );
    expect(screen.getByRole('heading', { name: 'آراء العملاء' })).toBeInTheDocument();
  });
});

describe('LatestPosts', () => {
  const post: PostSummary = {
    id: '1',
    slug: 'first',
    title: 'أول مقال',
    date: '2026-01-01',
  } as PostSummary;

  test('renders nothing with no posts', () => {
    const { container } = render(<LatestPosts posts={[]} heading="أحدث المقالات" />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the rail once there is a post', () => {
    render(<LatestPosts posts={[post]} heading="أحدث المقالات" />);
    expect(screen.getByRole('heading', { name: 'أحدث المقالات' })).toBeInTheDocument();
    expect(screen.getByText('أول مقال')).toBeInTheDocument();
  });
});
