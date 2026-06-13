import type { SVGProps } from "react";

export function DailyQuestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <path d="M32 4 38 14l11-2-3 11 10 6-11 5 3 11-11-3-5 10-5-10-11 3 3-11-11-5 10-6-3-11 11 2 6-10Z" fill="currentColor" opacity="0.12" />
      <path d="M18 39h27l-3 15H21l-3-15Z" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M17 39c0-4 3.2-7.2 7.2-7.2h15.6c4 0 7.2 3.2 7.2 7.2" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M35 10 28 52" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M25 52c4.7 2.1 9.5 2.1 14.4 0M27 46c4 1.3 8.1 1.3 12.2 0M29 40c3.2.8 6.5.8 9.6 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M47 24h5M45 19l4-4M17 25h-5" stroke="currentColor" strokeWidth="2.7" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
