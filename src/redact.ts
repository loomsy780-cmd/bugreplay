export function safeUrl(input: string): string {
  try {
    const url = new URL(input, window.location.href);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "[invalid-url]";
  }
}

export function selectorFor(element: Element): string {
  const id = element.getAttribute("id");
  if (id) return `#${CSS.escape(id)}`;

  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute("role");
  if (role) return `${tag}[role="${role}"]`;

  const classes = [...element.classList].slice(0, 2).map(CSS.escape).join(".");
  return classes ? `${tag}.${classes}` : tag;
}
