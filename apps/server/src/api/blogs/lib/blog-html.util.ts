import { BadRequestException } from '@nestjs/common';

const allowedTags = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'em',
  'h2',
  'h3',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'strong',
  'ul',
]);

const voidTags = new Set(['br', 'hr', 'img']);
const removableBlockTags = ['script', 'style', 'iframe', 'object', 'embed'];
const safeAlignmentValues = new Set(['left', 'center', 'right']);

type AttributeMap = Record<string, string>;

export function sanitizeBlogHtml(html: string): string {
  let sanitized = html.trim();

  for (const tag of removableBlockTags) {
    sanitized = sanitized.replace(
      new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'),
      '',
    );
  }

  return sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g, (match) => {
    const parsed = parseHtmlTag(match);

    if (!parsed || !allowedTags.has(parsed.name)) {
      return '';
    }

    if (parsed.isClosing) {
      return voidTags.has(parsed.name) ? '' : `</${parsed.name}>`;
    }

    const attributes = sanitizeAttributes(parsed.name, parsed.attributes);

    if (parsed.name === 'img' && !attributes.src) {
      return '';
    }

    const serializedAttributes = Object.entries(attributes)
      .map(([name, value]) => ` ${name}="${escapeHtmlAttribute(value)}"`)
      .join('');

    return `<${parsed.name}${serializedAttributes}>`;
  });
}

export function assertBlogHtmlHasVisibleText(html: string): void {
  if (!getVisibleTextFromHtml(html)) {
    throw new BadRequestException('Main blog content is required');
  }
}

export function getVisibleTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseHtmlTag(tag: string):
  | {
      name: string;
      attributes: string;
      isClosing: boolean;
    }
  | undefined {
  const match = /^<\s*(\/)?\s*([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>$/.exec(tag);

  if (!match) {
    return undefined;
  }

  return {
    isClosing: Boolean(match[1]),
    name: match[2].toLowerCase(),
    attributes: match[3],
  };
}

function sanitizeAttributes(
  tagName: string,
  rawAttributes: string,
): AttributeMap {
  const attributes = parseAttributes(rawAttributes);
  const sanitized: AttributeMap = {};

  if (tagName === 'a') {
    const href = attributes.href;

    if (href && isSafeUrl(href)) {
      sanitized.href = href;
      sanitized.rel = 'noopener noreferrer';
    }

    if (attributes.title) {
      sanitized.title = attributes.title;
    }

    if (attributes.target === '_blank') {
      sanitized.target = '_blank';
    }

    return sanitized;
  }

  if (tagName === 'img') {
    const src = attributes.src;

    if (src && isSafeImageUrl(src)) {
      sanitized.src = src;
    }

    if (attributes.alt) {
      sanitized.alt = attributes.alt;
    }

    if (attributes.title) {
      sanitized.title = attributes.title;
    }

    if (attributes.width && isPositiveInteger(attributes.width)) {
      sanitized.width = attributes.width;
    }

    if (attributes.height && isPositiveInteger(attributes.height)) {
      sanitized.height = attributes.height;
    }

    const alignment = attributes['data-align'] ?? attributes.align;

    if (alignment && safeAlignmentValues.has(alignment)) {
      sanitized['data-align'] = alignment;
    }

    return sanitized;
  }

  return sanitized;
}

function parseAttributes(rawAttributes: string): AttributeMap {
  const attributes: AttributeMap = {};
  const attributeRegex =
    /([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

  for (const match of rawAttributes.matchAll(attributeRegex)) {
    const attributeName = match[1].toLowerCase();

    if (attributeName.startsWith('on') || attributeName === 'style') {
      continue;
    }

    attributes[attributeName] = match[2] ?? match[3] ?? match[4] ?? '';
  }

  return attributes;
}

function isSafeUrl(value: string): boolean {
  const trimmedValue = value.trim();

  return (
    trimmedValue.startsWith('https://') ||
    trimmedValue.startsWith('http://') ||
    trimmedValue.startsWith('/') ||
    trimmedValue.startsWith('#') ||
    trimmedValue.startsWith('mailto:') ||
    trimmedValue.startsWith('tel:')
  );
}

function isSafeImageUrl(value: string): boolean {
  const trimmedValue = value.trim();

  return (
    trimmedValue.startsWith('https://') ||
    trimmedValue.startsWith('http://') ||
    trimmedValue.startsWith('/')
  );
}

function isPositiveInteger(value: string): boolean {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 && parsed <= 5000;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
