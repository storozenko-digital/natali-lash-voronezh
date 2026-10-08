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
  const clientStatus = form.querySelectorAll('[name="client-status"]');
  const contactMethod = document.getElementById('contact-method');
  const contact = document.getElementById('client-contact');
  const contactLabel = document.getElementById('client-contact-label');
  const contactHelp = document.getElementById('contact-help');
  const contactError = document.getElementById('contact-error');
  const isNewClient = () => form.querySelector('[name="client-status"]:checked')?.value === 'new';
  const clearContactError = () => {
    contact.setCustomValidity('');
    contact.removeAttribute('aria-invalid');
    contactError.hidden = true;
    contactError.textContent = '';
  };
  const updateContact = () => {
    const phone = contactMethod.value === 'phone';
    contact.required = isNewClient();
    contact.type = phone ? 'tel' : 'text';
    contact.inputMode = phone ? 'tel' : 'url';
    contact.autocomplete = phone ? 'tel' : 'off';
    contact.placeholder = phone ? '+7 (999) 123-45-67' : 'https://max.ru/u/…';
    contactLabel.textContent = (phone ? 'Номер телефона' : 'Ссылка на личный профиль MAX') + (isNewClient() ? ' — обязательно' : ' — необязательно');
    contactHelp.textContent = isNewClient()
      ? 'Для первого визита обязательно оставьте телефон или ссылку на ваш личный профиль в MAX. Наталия свяжется с вами для подтверждения записи.'
      : 'Для повторного визита контакт оставлять необязательно. Если он изменился, укажите новый телефон или личный профиль MAX.';
    clearContactError();
  };
  clientStatus.forEach(input => input.addEventListener('change', updateContact));
  contactMethod.addEventListener('change', () => { contact.value = ''; updateContact(); });
  contact.addEventListener('input', clearContactError);
  updateContact();
  const readContact = () => {
    const value = contact.value.trim();
    if (!value && !isNewClient()) return { value: '', error: '' };
    if (contactMethod.value === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (!/^[+\d\s().-]+$/.test(value) || digits.length < 10 || digits.length > 15)
        return { error: 'Укажите номер телефона с кодом страны: от 10 до 15 цифр.' };
      return { value, error: '' };
    }
    try {
      const url = new URL(value.startsWith('https://') ? value : `https://${value}`);
      if (url.protocol !== 'https:' || url.hostname !== 'max.ru' || !/^\/u\/[^/]+\/?$/.test(url.pathname) || url.username || url.password)
        throw new Error('Not a personal MAX profile');
      return { value: url.href, error: '' };
    } catch {
      return { error: 'Вставьте ссылку на ваш личный профиль MAX вида https://max.ru/u/… . Ссылка на канал не подойдёт.' };
    }
  };

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
    const result = readContact();
    if (result.error) {
      contact.setCustomValidity(result.error);
      contact.setAttribute('aria-invalid', 'true');
      contactError.textContent = result.error;
      contactError.hidden = false;
      contact.reportValidity();
      contact.focus();
      return;
    }
    const clientLabel = isNewClient() ? 'Первый визит' : 'Повторный визит';
    const methodLabel = contactMethod.value === 'phone' ? 'Телефон' : 'MAX';
    const bookingNotes = result.value
      ? `${clientLabel}. Контакт для подтверждения записи — ${methodLabel}: ${result.value}`
      : `${clientLabel}. Контакт уже известен Наталии.`;
    const selectedAt = new Date().toISOString();
    const namespace = `nataliLash${++attempt}`;
    const config = {
      layout: 'month_view', theme: 'light', locale: 'ru',
      notes: bookingNotes,
      'metadata[clientStatus]': isNewClient() ? 'new' : 'returning',
      'metadata[personalDataConsent]': 'accepted',
      'metadata[personalDataConsentVersion]': '2026-10-08',
      'metadata[consentSelectedAt]': selectedAt,
      'metadata[marketingConsent]': marketing.checked ? 'accepted' : 'declined',
      'metadata[marketingConsentVersion]': '2026-10-08'
    };
    if (result.value) {
      config['metadata[confirmationContactMethod]'] = contactMethod.value;
      config['metadata[confirmationContact]'] = result.value;
    }
    const url = new URL(originalUrl);
    Object.entries(config).filter(([key]) => key.startsWith('metadata[') || key === 'notes')
      .forEach(([key, value]) => url.searchParams.set(key, value));
    externalLink.href = url.href;
    form.hidden = true;
    summaryText.textContent = `${bookingNotes} Обработка данных для записи: согласие дано. Рекламные сообщения: ${marketing.checked ? 'согласие дано' : 'согласие не дано'}.`;
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
