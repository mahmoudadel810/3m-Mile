import { getBranches } from '@/data/branches';
import { getPageCopy } from '@/data/settings';
import { site } from '@/data/site';
import { PageHero } from '@/components/layout/PageHero';
import { BranchPinMap } from '@/components/branches/BranchPinMap';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { jsonLdHtml, safeHref } from '@/lib/safe';

/**
 * Branches: an interactive pin map above a flat, centred row of branch cards.
 *
 * Both the pins and the cards read from the same `branches` array — never two copies of
 * the same data, which is how a pin ends up with a 9-digit phone number while its card
 * has the correct 10.
 *
 * Emits LocalBusiness structured data per branch, so each location can surface in local
 * search results.
 */
export async function BranchesPage() {
  const [branches, pageCopy] = await Promise.all([getBranches(), getPageCopy()]);

  const jsonLd = branches.map((b) => ({
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: `${site.name} — ${b.name}`,
    address: { '@type': 'PostalAddress', addressLocality: b.city, streetAddress: b.address, addressCountry: 'SA' },
    telephone: b.phone,
    url: `${site.url}/فروعنا`,
    hasMap: b.mapUrl,
    parentOrganization: { '@type': 'Organization', name: site.nameFull },
  }));

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <PageHero title="فروعنا" crumbs={[{ label: 'فروعنا' }]} />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <h2 className="mb-6 text-center text-xl leading-relaxed font-black md:text-2xl">
              {pageCopy.branchesHeading || 'مراكز 3M MILE المعتمدة'}
              <span className="mt-1 block text-base font-bold text-fg-muted">
                {pageCopy.branchesSub || 'في المملكة العربية السعودية'}
              </span>
            </h2>
          </Reveal>

          <BranchPinMap branches={branches} />
        </div>
      </section>

      <section className="bg-ink pb-12">
        {/* Flat wrapping row of equal-width cards. */}
        <ul className="mx-auto flex w-[95%] max-w-[var(--container)] flex-wrap justify-center gap-6 text-center sm:gap-[50px]">
          {branches.map((b, i) => (
            <Reveal
              as="li"
              key={b.id}
              delay={(i % 4) * 60}
              className="w-full max-w-[300px] rounded-[12px] border border-line bg-glass p-5 shadow-[0_4px_12px_rgb(0_0_0/0.2)] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_6px_18px_rgb(0_0_0/0.3)]"
            >
              <h3 className="mb-2 flex items-center justify-center gap-2 text-lg font-bold">
                <Icon name="pin" size={18} className="shrink-0 text-primary" />
                <a
                  href={safeHref(b.mapUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary transition-colors hover:text-white"
                >
                  {b.name}
                </a>
              </h3>
              <p className="my-2 text-[15px] leading-relaxed">{b.address}</p>
              <p className="flex items-center justify-center gap-1.5 text-[15px] font-bold">
                <Icon name="phone" size={15} className="shrink-0 text-primary" />
                <a href={`tel:${b.phone}`} dir="ltr" className="transition-colors hover:text-primary">
                  {b.phone}
                </a>
              </p>
            </Reveal>
          ))}
        </ul>
      </section>
    </main>
  );
}
