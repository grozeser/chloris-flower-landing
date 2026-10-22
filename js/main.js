const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Бургер-меню
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');

if (toggle && menu) {
  const label = toggle.querySelector('.sr-only');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open);
    label.textContent = open ? 'Закрыть меню' : 'Открыть меню';
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
}

// Фильтр каталога по поводу
const filter = document.querySelector('.filter');
const catalogItems = document.querySelectorAll('.catalog__item');
const catalogEmpty = document.querySelector('.catalog__empty');

filter?.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter__btn');
  if (!btn) return;
  filter.querySelectorAll('.filter__btn').forEach((b) => b.setAttribute('aria-pressed', b === btn));
  let shown = 0;
  catalogItems.forEach((item) => {
    const match = btn.dataset.filter === 'all' || item.dataset.occasion === btn.dataset.filter;
    item.hidden = !match;
    shown += match;
  });
  catalogEmpty.hidden = shown > 0;
});

// «Заказать» на карточке: подставляем букет в форму, к форме ведёт сама ссылка #order
const bouquetSelect = document.getElementById('order-bouquet');

document.querySelector('.catalog')?.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-bouquet]');
  if (link) bouquetSelect.value = link.dataset.bouquet;
});

// Форма заявки
const form = document.getElementById('order');

if (form) {
  const submitBtn = form.querySelector('[type="submit"]');
  const fail = form.querySelector('.order-form__fail');
  const success = document.querySelector('.order-success');
  const fields = [...form.elements].filter((el) => validators[el.name]);

  const check = (input) => {
    const message = validators[input.name](input.value);
    const error = document.getElementById(`${input.id}-error`);
    error.textContent = message;
    error.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !message;
  };

  // shortcut: демо, заявка никуда не уходит; для боевой формы заменить на fetch к Formspree или своему API
  const sendRequest = () => new Promise((resolve, reject) => {
    setTimeout(() => (navigator.onLine ? resolve() : reject(new Error('offline'))), 700);
  });

  form.noValidate = true; // свои сообщения вместо браузерных; без JS работает нативная проверка

  form.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) check(e.target);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    fail.hidden = true;
    const invalid = fields.filter((field) => !check(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';
    try {
      await sendRequest(new FormData(form));
      success.querySelector('[data-name]').textContent = form.elements.name.value.trim();
      success.querySelector('[data-phone]').textContent = form.elements.phone.value.trim();
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch {
      fail.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить заявку';
    }
  });
}

// Кнопки слайдера отзывов: листают на одну карточку, на краях выключаются
const reviews = document.querySelector('.reviews');

if (reviews) {
  const [prev, next] = document.querySelectorAll('.reviews__btn');
  const items = reviews.querySelectorAll('.reviews__item');
  const update = () => {
    prev.disabled = reviews.scrollLeft <= 1;
    next.disabled = reviews.scrollLeft + reviews.clientWidth >= reviews.scrollWidth - 1;
  };

  [prev, next].forEach((btn) => btn.addEventListener('click', () => {
    const step = items[1].offsetLeft - items[0].offsetLeft;
    reviews.scrollBy({ left: Number(btn.dataset.dir) * step, behavior: reducedMotion ? 'auto' : 'smooth' });
  }));
  reviews.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// Появление блоков при прокрутке. Класс .reveal получают только блоки ниже первого экрана,
// поэтому без JS или при ошибке скрипта ничего не прячется.
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

  document.querySelectorAll('.section__head, .benefit, .catalog__item, .catalog__custom, .step, .about__image, .about__content, .faq__item, .contacts__info, .contacts__form')
    .forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight) return;
      const index = [...el.parentElement.children].indexOf(el);
      el.style.transitionDelay = `${(index % 4) * 80}ms`;
      el.classList.add('reveal');
      observer.observe(el);
    });
}
