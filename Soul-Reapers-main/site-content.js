document.addEventListener('DOMContentLoaded', async () => {
  try {
    let content = {};
    try {
      const response = await fetch('/api/content', { credentials: 'same-origin' });
      if (response.ok) content = (await response.json()).content || {};
    } catch (apiError) {
      // API not reachable (e.g. static hosting) — fall back to the exported snapshot.
      const fallback = await fetch('data-content.json', { cache: 'no-cache' });
      if (fallback.ok) content = (await fallback.json()).content || {};
    }
    document.querySelectorAll('[data-content]').forEach((element) => {
      const value = content[element.dataset.content];
      if (typeof value === 'string') element.textContent = value;
    });
    document.querySelectorAll('[data-content-href]').forEach((element) => {
      const value = content[element.dataset.contentHref];
      if (typeof value === 'string') {
        const href = element.dataset.contentHref.endsWith('_email') ? `mailto:${value}` : value;
        if (href.startsWith('https://') || href.startsWith('mailto:')) element.setAttribute('href', href);
      }
    });
  } catch (error) {
    console.warn('Site content could not be refreshed.', error);
  }
});
