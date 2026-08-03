const ALLOWED_TAG_ATTRIBUTES: ReadonlyMap<string, readonly string[]> = new Map([
  ['blockquote', []],
  ['br', []],
  ['code', []],
  ['div', []],
  ['em', []],
  ['h2', []],
  ['h3', []],
  ['hr', []],
  ['img', ['alt', 'src', 'title']],
  ['li', []],
  ['ol', []],
  ['p', []],
  ['pre', []],
  ['s', []],
  ['strong', []],
  ['ul', []],
]);

const SAFE_IMAGE_PROTOCOLS = new Set(['http:', 'https:']);

export function sanitizeBlogContentHtml(html: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  const sanitized = window.document.createElement('div');

  document.body.childNodes.forEach((node) => {
    sanitized.append(sanitizeNode(node));
  });

  return sanitized.innerHTML;
}

function sanitizeNode(node: Node): Node {
  if (node.nodeType === Node.TEXT_NODE) {
    return window.document.createTextNode(node.textContent ?? '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return window.document.createDocumentFragment();
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const allowedAttributes = ALLOWED_TAG_ATTRIBUTES.get(tagName);

  if (!allowedAttributes) {
    const fragment = window.document.createDocumentFragment();

    element.childNodes.forEach((childNode) => {
      fragment.append(sanitizeNode(childNode));
    });

    return fragment;
  }

  const sanitizedElement = window.document.createElement(tagName);

  allowedAttributes.forEach((attribute) => {
    const value = element.getAttribute(attribute);

    if (!value) {
      return;
    }

    if (attribute === 'src' && !isSafeImageSource(value)) {
      return;
    }

    sanitizedElement.setAttribute(attribute, value);
  });

  element.childNodes.forEach((childNode) => {
    sanitizedElement.append(sanitizeNode(childNode));
  });

  return sanitizedElement;
}

function isSafeImageSource(value: string): boolean {
  try {
    const url = new URL(value, window.location.origin);

    return SAFE_IMAGE_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}
