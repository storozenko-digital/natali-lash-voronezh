// Cal.com stores bookings and manages availability; this site does not reserve slots itself.
(() => {
  const calendar = document.querySelector('[data-booking-calendar]');
  const form = document.getElementById('booking-consents');
  if (!calendar || !form) return;
  const personal = document.getElementById('consent-personal');
  const marketing = document.getElementById('consent-marketing');
  const openButton = document.getElementById('open-booking');
  const summary = document.getElementById('consent-summary');
  const summaryText = document.getElementById('consent-summary-text');
  const fallback = document.getElementById('booking-fallback');
  const externalLink = fallback.querySelector('a');
  const originalUrl = externalLink.href;
  let attempt = 0;

  (function (C, A, L) {
    const p = (api, args) => api.q.push(args);
    const d = C.document;
    C.Cal = C.Cal || function () {
      const cal = C.Cal;
      const args = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        const script = d.createElement('script');
        script.src = A;
        script.async = true;
        script.onerror = () => {
          const status = document.querySelector('[data-booking-status]');
          if (status) status.textContent = 'Календарь не загрузился. Откройте запись по ссылке ниже.';
        };
        d.head.appendChild(script);
        cal.loaded = true;
      }
      if (args[0] === L) {
        const api = function () { p(api, arguments); };
        const namespace = args[1];
        api.q = api.q || [];
        if (typeof namespace === 'string') {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], args);
          p(cal, ['initNamespace', namespace]);
        } else p(cal, args);
        return;
      }
      p(cal, args);
    };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  // No embed request before the visitor's explicit choice. Metadata is
  // supported by Cal.com and accompanies the completed booking, not a
  // separate client-side "consent saved" record.
  personal.addEventListener('change', () => { openButton.disabled = !personal.checked; });
  openButton.disabled = !personal.checked;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!personal.checked || !form.reportValidity()) return;
    const clientStatus = form.querySelector('[name="client-status"]:checked').value;
    const clientLabel = clientStatus === 'new' ? 'Первый визит' : 'Повторный визит';
    const selectedAt = new Date().toISOString();
    const namespace = `nataliLash${++attempt}`;
    const config = {
      layout: 'month_view', theme: 'light', locale: 'ru',
      notes: clientLabel,
      'metadata[clientStatus]': clientStatus,
      'metadata[personalDataConsent]': 'accepted',
      'metadata[personalDataConsentVersion]': '2026-10-08',
      'metadata[consentSelectedAt]': selectedAt,
      'metadata[marketingConsent]': marketing.checked ? 'accepted' : 'declined',
      'metadata[marketingConsentVersion]': '2026-10-08'
    };
    const url = new URL(originalUrl);
    Object.entries(config).filter(([key]) => key.startsWith('metadata[') || key === 'notes')
      .forEach(([key, value]) => url.searchParams.set(key, value));
    externalLink.href = url.href;
    form.hidden = true;
    summaryText.textContent = `${clientLabel}. Обработка данных для записи: согласие дано. Рекламные сообщения: ${marketing.checked ? 'согласие дано' : 'согласие не дано'}.`;
    summary.hidden = false;
    calendar.hidden = false;
    fallback.hidden = false;
    Cal('init', namespace, { origin: 'https://cal.com' });
    Cal.ns[namespace]('inline', {
      elementOrSelector: '#natali-booking-calendar',
      calLink: 'nklimenk26/наращивание-ресниц-наталия', config
    });
    Cal.ns[namespace]('ui', {
      theme: 'light',
      cssVarsPerTheme: { light: { 'cal-brand': '#bf3d7d' } },
      hideEventTypeDetails: false,
      layout: 'month_view'
    });
  });
  document.getElementById('edit-consents').addEventListener('click', () => {
    calendar.replaceChildren();
    calendar.hidden = true;
    fallback.hidden = true;
    summary.hidden = true;
    form.hidden = false;
    externalLink.href = originalUrl;
    openButton.disabled = !personal.checked;
    personal.focus();
  });
})();
