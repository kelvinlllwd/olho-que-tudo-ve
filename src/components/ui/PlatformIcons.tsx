"use client";

import { SVGProps } from "react";

export const InstagramIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <path d="M4 8H2" />
    <path d="M20 8h-2" />
  </svg>
);

export const TikTokIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12z" />
    <path d="M8 12h8v8H8z" />
  </svg>
);
