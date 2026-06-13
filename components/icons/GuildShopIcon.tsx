import type { SVGProps } from "react";

export function GuildShopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <path d="M8 29 32 10l24 19v24a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V29Z" fill="currentColor" opacity="0.13" />
      <path d="M6 30 32 9l26 21M12 28v25h40V28" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 27h30l-3 10H20l-3-10ZM20 37c0 3 2.5 5 5.5 5s5.5-2 5.5-5M31 37c0 3 2.5 5 5.5 5s5.5-2 5.5-5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 56V44h16v12M28 22h8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M32 13 35 19l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
