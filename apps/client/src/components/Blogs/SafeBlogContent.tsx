'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';

const ALLOWED_TAGS = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
  'EM',
  'H2',
  'H3',
  'H4',
  'I',
  'IMG',
  'LI',
  'OL',
  'P',
  'STRONG',
  'UL',
]);

function renderNode(node: ChildNode, key: string): React.ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const children = Array.from(element.childNodes).map((child, index) =>
    renderNode(child, `${key}-${index}`),
  );

  if (!ALLOWED_TAGS.has(element.tagName)) {
    return <React.Fragment key={key}>{children}</React.Fragment>;
  }

  switch (element.tagName) {
    case 'H2':
      return (
        <h2
          key={key}
          className='text-2xl md:text-3xl font-semibold text-white mt-10 mb-4'
        >
          {children}
        </h2>
      );
    case 'H3':
    case 'H4':
      return (
        <h3
          key={key}
          className='text-xl md:text-2xl font-semibold text-white mt-8 mb-3'
        >
          {children}
        </h3>
      );
    case 'P':
      return (
        <p
          key={key}
          className='text-sm sm:text-base text-[#b4b7b8] leading-7 mb-4'
        >
          {children}
        </p>
      );
    case 'UL':
      return (
        <ul
          key={key}
          className='list-disc pl-6 text-sm sm:text-base text-[#898D8E] leading-7 mb-4'
        >
          {children}
        </ul>
      );
    case 'OL':
      return (
        <ol
          key={key}
          className='list-decimal pl-6 text-sm sm:text-base text-[#898D8E] leading-7 mb-4'
        >
          {children}
        </ol>
      );
    case 'LI':
      return <li key={key}>{children}</li>;
    case 'BLOCKQUOTE':
      return (
        <blockquote
          key={key}
          className='border-l border-[#3B82F6] pl-4 text-[#B8BFC1] my-6'
        >
          {children}
        </blockquote>
      );
    case 'A': {
      const href = element.getAttribute('href') ?? '';
      const isSafeHref =
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('/');

      return (
        <a
          key={key}
          href={isSafeHref ? href : undefined}
          className='text-[#f7f5f5] underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1012]'
          rel={href.startsWith('http') ? 'noreferrer' : undefined}
          target={href.startsWith('http') ? '_blank' : undefined}
        >
          {children}
        </a>
      );
    }
    case 'BR':
      return <br key={key} />;
    case 'IMG': {
      const src = element.getAttribute('src') ?? '';
      const alt = element.getAttribute('alt') ?? '';
      const isSafeSrc = src.startsWith('http://') || src.startsWith('https://');

      if (!isSafeSrc) {
        return null;
      }

      return (
        <Image
          key={key}
          src={src}
          alt={alt}
          width={1200}
          height={675}
          sizes='(min-width: 860px) 860px, 100vw'
          className='my-8 h-auto w-full rounded-[8px] border border-[#18181B] bg-[#0C1013] object-cover'
        />
      );
    }
    case 'STRONG':
      return (
        <strong key={key} className='font-bold text-white'>
          {children}
        </strong>
      );
    case 'B':
      return (
        <strong key={key} className='font-bold'>
          {children}
        </strong>
      );
    case 'EM':
    case 'I':
      return (
        <em key={key} className='italic'>
          {children}
        </em>
      );
    default:
      return <React.Fragment key={key}>{children}</React.Fragment>;
  }
}

export function SafeBlogContent({ html }: { html: string }) {
  const content = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const document = new DOMParser().parseFromString(html, 'text/html');

    return Array.from(document.body.childNodes).map((node, index) =>
      renderNode(node, String(index)),
    );
  }, [html]);

  if (!html.trim()) {
    return null;
  }

  return <div>{content ?? <p className='text-[#cdd3d4]'>{html}</p>}</div>;
}
