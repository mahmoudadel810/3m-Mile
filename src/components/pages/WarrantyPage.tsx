import { getWarrantyGroups } from '@/data/warranty';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { WarrantyTabs } from '@/components/warranty/WarrantyTabs';

export async function WarrantyPage() {
  const warrantyGroups = await getWarrantyGroups();

  return (
    <main id="main">
      <PageHero title="سياسة الضمان" crumbs={[{ label: 'سياسة الضمان' }]} />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <WarrantyTabs groups={warrantyGroups} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
