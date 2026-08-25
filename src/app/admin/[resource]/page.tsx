import { notFound } from 'next/navigation';
import { RESOURCES, findResource } from '@/lib/admin/resources';
import { ResourceManager } from '@/components/admin/ResourceManager';

/**
 * One route for every CMS entity.
 *
 * Each screen is fully described by its entry in `resources.ts`, so seventeen admin
 * pages are this one file rather than seventeen near-identical ones. Adding a new
 * managed entity means adding a config entry — no new route, no new component.
 */
export function generateStaticParams() {
  return RESOURCES.map((r) => ({ resource: r.key }));
}

export default async function AdminResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const config = findResource(resource);

  // An unknown key is a genuine 404 rather than an empty dashboard screen.
  if (!config) notFound();

  return (
    <>
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-fg">{config.label}</h1>
        {config.description && (
          <p className="mt-1 max-w-2xl text-sm text-fg-muted">{config.description}</p>
        )}
        <p className="mt-1 text-xs text-fg-dim">
          {config.kind === 'singleton'
            ? 'قسم واحد في الموقع — عدّل الحقول ثم اضغط حفظ.'
            : 'التغييرات تظهر على الموقع خلال دقيقة من الحفظ.'}
        </p>
      </header>
      {/* The key, not the config: it holds RegExps, which cannot cross to a client component. */}
      <ResourceManager resourceKey={resource} />
    </>
  );
}
