// Adds the DOM matchers (`toBeInTheDocument`, `toHaveAttribute`, …) to every test file.
import '@testing-library/jest-dom';

// jsdom has no `matchMedia`; `useCarousel` reads the reduced-motion query on mount.
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
