import { getBranches, getBranchesByCity } from '@/data/branches';
import { site } from '@/data/site';
import { PageHero } from '@/components/layout/PageHero';
import { BranchPinMap } from '@/components/branches/BranchPinMap';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';

/**
 * Branches: an interactive pin map above a city-grouped list.
 *
 * Both the pins and the cards read from the same `branches` array. On the source these
 * are two hand-written copies of the same data, which is how one pin ended up with a
 * 9-digit phone number while its card had the correct 10.
 *
 * Adds LocalBusiness structured data per branch — the source publishes none, so none of
 * the twelve locations can surface in local search results.
 */
export async function BranchesPage() {
  const [branches, branchesByCity] = await Promise.all([getBranches(), getBranchesByCity()]);

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero title="فروعنا" crumbs={[{ label: 'فروعنا' }]} />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <h2 className="mb-6 text-center text-xl leading-relaxed font-black md:text-2xl">
              مراكز 3M MILE المعتمدة
              <span className="mt-1 block text-base font-bold text-fg-muted">
                في المملكة العربية السعودية
              </span>
            </h2>
          </Reveal>

          <BranchPinMap branches={branches} />
        </div>
      </section>

      <section className="bg-ink pb-12">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          {branchesByCity.map((group) => (
            <div key={group.city} className="mb-8 last:mb-0">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
                <Icon name="pin" size={20} className="text-primary" />
                {group.city}
                <span className="text-sm font-bold text-fg-dim">({group.items.length})</span>
              </h2>

              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((b, i) => (
                  <Reveal
                    as="li"
                    key={b.id}
                    delay={(i % 3) * 60}
                    className="rounded-[var(--radius-xl)] border border-line bg-glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary"
                  >
                    <h3 className="text-lg font-black">
                      <a
                        href={b.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-primary"
                      >
                        {b.name}
                      </a>
                    </h3>
                    <p className="mt-1.5 text-base text-fg-muted">{b.address}</p>
                    <p className="mt-3">
                      <a
                        href={`tel:${b.phone}`}
                        className="inline-flex items-center gap-2 font-bold text-primary"
                      >
                        <Icon name="phone" size={15} />
                        <span dir="ltr">{b.phone}</span>
                      </a>
                    </p>
                  </Reveal>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
