import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-primary', props.className)}
      {...props}
    >
      <path d="M6 17H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v4" />
      <path d="M16 17H2" />
      <path d="M18 17H6" />
      <path d="M11 5h2" />
      <path d="M19 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z" />
      <path d="M6.5 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z" />
      <path d="M16 5.13a2.5 2.5 0 0 1 5 0" />
      <path d="M18.5 5H18" />
    </svg>
  );
}
