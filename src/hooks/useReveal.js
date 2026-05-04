import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const initReveals = () => {
      const reveals = document.querySelectorAll('.reveal:not(.visible)');
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08 }
      );
      reveals.forEach((r) => obs.observe(r));
      return obs;
    };

    const obs = initReveals();
    return () => obs.disconnect();
  }, []);
}
