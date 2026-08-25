import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * Every CTA on the source site is one of four shapes. All of them invert on hover —
 * that colour flip is the brand's signature button behaviour, present on the header
 * book button, the hero CTA, the why-us pill, and the footer map button.
 */
const variants = {
  /** Header book button, form submits. Red fill -> white fill. */
  solid:
    'bg-primary text-white hover:bg-white hover:text-primary',
  /** Why-us CTA: red pill that hollows out and lifts. */
  pill:
    'bg-primary text-white border-2 border-primary rounded-[var(--radius-pill)] shadow-[var(--shadow-cta)] hover:bg-transparent hover:text-primary hover:-translate-y-0.5',
  /** Outline used by the branch popup actions. */
  outline:
    'bg-transparent text-white border border-line hover:bg-primary hover:border-primary',
  /** Bare text link with a colour shift. */
  ghost: 'bg-transparent text-white hover:text-primary',
} as const;

const sizes = {
  sm: 'text-sm px-4 py-2 gap-1.5',
  md: 'text-base px-[18px] py-2 gap-2',
  lg: 'text-lg px-[35px] py-2.5 gap-2',
} as const;

type BaseProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

type AnchorProps = BaseProps & {
  href: string;
  /** WhatsApp/tel/maps links leave the site; internal routes use next/link. */
  external?: boolean;
  'aria-label'?: string;
};

function classes(variant: keyof typeof variants, size: keyof typeof sizes, className?: string) {
  return cn(
    'inline-flex items-center justify-center font-bold no-underline',
    'rounded-[var(--radius-md)] transition-all duration-300',
    'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary',
    variants[variant],
    sizes[size],
    className
  );
}

export function Button(props: ButtonProps | AnchorProps) {
  const { variant = 'solid', size = 'md', className, children } = props;

  if ('href' in props && props.href !== undefined) {
    const { href, external, ...rest } = props as AnchorProps;
    const isExternal =
      external ?? /^(https?:|tel:|mailto:|wa\.me)/.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={classes(variant, size, className)}
          aria-label={rest['aria-label']}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes(variant, size, className)} aria-label={rest['aria-label']}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonProps;
  return (
    <button {...rest} className={classes(variant, size, className)}>
      {children}
    </button>
  );
}
