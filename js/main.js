const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ruPlural = new Intl.PluralRules('ru');
const plural = (n, forms) => forms[ruPlural.select(n)] ?? forms.many;
const bouquetWord = { one: 'букет', few: 'букета', many: 'букетов' };
const itemWord = { one: 'товар', few: 'товара', many: 'товаров' };
const price = (n) => cartLogic.price(n);

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

// Тень у шапки после начала прокрутки; бегущая строка движется только вместе с прокруткой,
// поэтому сама по себе не отвлекает и не требует кнопки паузы
// Ширину строки меряем только при первой прокрутке: замер при загрузке стоил ~100 мс принудительной раскладки
const header = document.querySelector('.site-header');
const tickerTrack = document.querySelector('.ticker__track');
let tickerHalf = 0;
let scrollQueued = false;
const onScroll = () => {
  scrollQueued = false;
  header.classList.toggle('is-scrolled', scrollY > 8);
  if (!tickerTrack || reducedMotion) return;
  tickerHalf ||= tickerTrack.scrollWidth / 2;
  tickerTrack.style.transform = `translateX(${-(scrollY * 0.35) % tickerHalf}px)`;
};
addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); }
}, { passive: true });
addEventListener('resize', () => { tickerHalf = 0; });
document.fonts.ready.then(() => { tickerHalf = 0; }); // после загрузки шрифтов ширина меняется

// Каталог: фильтры по поводу и виду, сортировка по цене, «Показать ещё»
const catalog = document.querySelector('.catalog');
const catalogItems = catalog ? [...catalog.children] : [];
const catalogEmpty = document.querySelector('.catalog__empty');
const catalogStatus = document.querySelector('[data-catalog-status]');
const moreBtn = document.querySelector('[data-more]');
const PAGE_SIZE = 8;
const view = { occasion: 'all', type: 'all', sort: 'popular', limit: PAGE_SIZE };

const renderCatalog = () => {
  const byPrice = (a, b) => (a.dataset.price - b.dataset.price) * (view.sort === 'asc' ? 1 : -1);
  const ordered = view.sort === 'popular' ? catalogItems : [...catalogItems].sort(byPrice);
  catalog.append(...ordered); // порядок в DOM = порядок на экране, чтобы Tab шёл так же, как видно
  const matched = ordered.filter((li) => (view.occasion === 'all' || li.dataset.occasion === view.occasion)
    && (view.type === 'all' || li.dataset.type === view.type));
  catalogItems.forEach((li) => {
    const index = matched.indexOf(li);
    li.hidden = index < 0 || index >= view.limit;
  });
  const shown = Math.min(matched.length, view.limit);
  moreBtn.hidden = matched.length <= shown;
  moreBtn.textContent = `Показать ещё ${matched.length - shown}`;
  catalogEmpty.hidden = matched.length > 0;
  return { matched, shown };
};

const announceCatalog = ({ matched, shown }) => {
  // для экранных читалок: сколько букетов осталось после фильтра
  catalogStatus.textContent = shown
    ? `Показано ${shown} ${plural(shown, bouquetWord)}${matched.length > shown ? ` из ${matched.length}` : ''}`
    : catalogEmpty.textContent;
};

if (catalog) {
  renderCatalog();

  document.querySelector('.catalog__tools')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter__btn');
    if (!btn) return;
    btn.parentElement.querySelectorAll('.filter__btn').forEach((b) => b.setAttribute('aria-pressed', b === btn));
    view[btn.dataset.group] = btn.dataset.value;
    view.limit = PAGE_SIZE;
    announceCatalog(renderCatalog());
  });

  document.querySelector('[data-sort]')?.addEventListener('change', (e) => {
    view.sort = e.target.value;
    announceCatalog(renderCatalog());
  });

  moreBtn.addEventListener('click', () => {
    const firstNew = view.limit;
    view.limit = Infinity;
    const result = renderCatalog();
    announceCatalog(result);
    result.matched[firstNew]?.querySelector('[data-add]').focus(); // кнопка исчезла — фокус на первую новую карточку
  });
}

// Корзина: позиции { id, qty } в localStorage, цены и названия берутся из разметки
const cartDialog = document.getElementById('cart');
const orderForm = document.getElementById('order');
const products = {};
document.querySelectorAll('[data-product]').forEach((el) => {
  const img = el.querySelector('img');
  products[el.dataset.product] = { name: el.dataset.name, price: Number(el.dataset.price), thumb: img?.srcset.split(' ')[0] };
});
const prices = Object.fromEntries(Object.entries(products).map(([id, p]) => [id, p.price]));
const isAddon = (id) => id.startsWith('addon-');
const STORAGE_KEY = 'chloris-cart';

const loadCart = () => {
  try { return cartLogic.sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)), prices); } catch { return []; }
};
const saveCart = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems)); } catch { /* приватный режим: корзина живёт до перезагрузки */ }
};
let cartItems = loadCart();
const deliveryMethod = () => orderForm?.elements.delivery.value || 'delivery';

const toastEl = document.querySelector('[data-toast]');
let toastTimer;
const toast = (text) => {
  toastEl.textContent = text;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2500);
};

const renderSummary = () => {
  const box = document.querySelector('[data-order-summary]');
  if (!box) return;
  const t = cartLogic.totals(cartItems, prices, deliveryMethod());
  const filled = cartItems.length > 0;
  box.querySelector('[data-summary-list]').replaceChildren(...cartItems.map((item) => {
    const li = document.createElement('li');
    const name = document.createElement('span');
    const sum = document.createElement('span');
    name.textContent = item.qty > 1 ? `${products[item.id].name} × ${item.qty}` : products[item.id].name;
    sum.textContent = price(prices[item.id] * item.qty);
    li.append(name, sum);
    return li;
  }));
  box.querySelector('[data-summary-empty]').hidden = filled;
  box.querySelectorAll('[data-summary-list], [data-summary-totals], .link-btn').forEach((el) => { el.hidden = !filled; });
  box.querySelector('[data-summary-subtotal]').textContent = price(t.subtotal);
  box.querySelector('[data-summary-delivery]').textContent = t.delivery ? price(t.delivery) : 'бесплатно';
  box.querySelector('[data-summary-total]').textContent = price(t.total);
  const comment = orderForm.elements.comment;
  if (comment.hasAttribute('aria-invalid')) checkField(comment); // корзина пополнилась — ошибка «пустой заказ» снимается
};

const renderCart = () => {
  const count = cartLogic.count(cartItems);
  const countEl = document.querySelector('[data-cart-count]');
  countEl.textContent = count;
  countEl.hidden = !count;
  document.querySelector('.cart-btn').setAttribute('aria-label', count ? `Корзина, ${count} ${plural(count, itemWord)}` : 'Корзина, пусто');

  const template = document.getElementById('cart-row');
  cartDialog.querySelector('[data-cart-list]').replaceChildren(...cartItems.filter((item) => !isAddon(item.id)).map((item) => {
    const { name, thumb } = products[item.id];
    const row = template.content.firstElementChild.cloneNode(true);
    row.dataset.id = item.id;
    row.querySelector('.cart-row__img').src = thumb;
    row.querySelector('.cart-row__name').textContent = name;
    row.querySelector('.cart-row__price').textContent = price(prices[item.id] * item.qty);
    row.querySelector('.qty').setAttribute('aria-label', `Количество «${name}»`);
    row.querySelector('.qty__value').textContent = item.qty;
    const [minus, plus] = row.querySelectorAll('.qty__btn');
    minus.setAttribute('aria-label', `Убрать один «${name}»`);
    plus.setAttribute('aria-label', `Добавить ещё один «${name}»`);
    plus.disabled = item.qty >= cartLogic.MAX_QTY;
    row.querySelector('.cart-row__remove').setAttribute('aria-label', `Удалить «${name}» из корзины`);
    return row;
  }));
  cartDialog.querySelectorAll('.addon input').forEach((box) => { box.checked = cartItems.some((item) => item.id === box.dataset.product); });
  const filled = cartItems.length > 0;
  cartDialog.querySelectorAll('[data-cart-empty]').forEach((el) => { el.hidden = filled; });
  cartDialog.querySelectorAll('[data-cart-filled]').forEach((el) => { el.hidden = !filled; });

  const t = cartLogic.totals(cartItems, prices);
  cartDialog.querySelector('[data-cart-subtotal]').textContent = price(t.subtotal);
  cartDialog.querySelector('[data-cart-delivery]').textContent = t.delivery ? price(t.delivery) : 'бесплатно';
  cartDialog.querySelector('[data-cart-total]').textContent = price(t.total);
  cartDialog.querySelector('[data-cart-free]').textContent = t.toFree ? `До бесплатной доставки — ${price(t.toFree)}` : 'Доставка курьером бесплатная';
  cartDialog.querySelector('[data-cart-progress]').style.width = `${Math.min(100, (t.subtotal / cartLogic.FREE_DELIVERY_FROM) * 100)}%`;
  renderSummary();
};

// Дополнения без букета не продаём: когда букетов не осталось, корзина очищается целиком
const updateCart = (next) => {
  cartItems = next.some((item) => !isAddon(item.id)) ? next : [];
  saveCart();
  renderCart();
};

if (cartDialog) {
  const cartBtn = document.querySelector('.cart-btn');

  catalog.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const id = btn.closest('[data-product]').dataset.product;
    updateCart(cartLogic.add(cartItems, id));
    toast(`«${products[id].name}» в корзине`);
    cartBtn.classList.remove('is-bumped');
    void cartBtn.offsetWidth; // перезапуск анимации
    cartBtn.classList.add('is-bumped');
  });

  document.querySelectorAll('[data-open-cart]').forEach((btn) => btn.addEventListener('click', () => cartDialog.showModal()));
  cartDialog.addEventListener('click', (e) => {
    if (e.target === cartDialog || e.target.closest('[data-close-cart]')) cartDialog.close(); // клик по затемнению или по ссылке
  });

  cartDialog.querySelector('[data-cart-list]').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const { id } = btn.closest('.cart-row').dataset;
    const qty = cartItems.find((item) => item.id === id).qty;
    const step = Number(btn.dataset.step || -qty);
    updateCart(cartLogic.setQty(cartItems, id, qty + step));
    // строки перерисованы — возвращаем фокус на ту же кнопку или на закрытие, если строки больше нет
    const row = cartDialog.querySelector(`.cart-row[data-id="${CSS.escape(id)}"]`);
    const same = row?.querySelector(btn.dataset.step ? `[data-step="${btn.dataset.step}"]` : '.cart-row__remove');
    (same && !same.disabled ? same : row?.querySelector('[data-step="-1"]') ?? cartDialog.querySelector('.cart__close')).focus();
  });

  cartDialog.querySelector('.cart__addons').addEventListener('change', (e) => {
    const id = e.target.dataset.product;
    updateCart(e.target.checked ? cartLogic.add(cartItems, id) : cartLogic.setQty(cartItems, id, 0));
  });

  renderCart();
}

// Подписка: тариф попадает в комментарий заявки
document.querySelectorAll('[data-plan]').forEach((link) => link.addEventListener('click', () => {
  const comment = orderForm.elements.comment;
  if (!comment.value.trim() || comment.value.startsWith('Подписка:')) comment.value = `Подписка: ${link.dataset.plan}`;
  if (comment.hasAttribute('aria-invalid')) checkField(comment);
}));

// Форма заявки
function checkField(input) {
  const emptyOrder = input.name === 'comment' ? validators.emptyOrder(cartLogic.count(cartItems), input.value) : '';
  const message = validators[input.name](input.value) || emptyOrder;
  const error = document.getElementById(`${input.id}-error`);
  error.textContent = message;
  error.hidden = !message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  return !message;
}

if (orderForm) {
  const submitBtn = orderForm.querySelector('[type="submit"]');
  const fail = orderForm.querySelector('.order-form__fail');
  const success = document.querySelector('.order-success');
  const fields = [...orderForm.elements].filter((el) => validators[el.name]);

  // shortcut: демо, заявка никуда не уходит; для боевой формы заменить на fetch к Formspree или своему API
  const sendRequest = () => new Promise((resolve, reject) => {
    setTimeout(() => (navigator.onLine ? resolve() : reject(new Error('offline'))), 700);
  });

  orderForm.noValidate = true; // свои сообщения вместо браузерных; без JS работает нативная проверка

  orderForm.addEventListener('input', (e) => {
    if (e.target.hasAttribute('aria-invalid')) checkField(e.target);
  });
  orderForm.addEventListener('change', (e) => {
    if (e.target.name === 'delivery') renderSummary();
  });

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    fail.hidden = true;
    const invalid = fields.filter((field) => !checkField(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';
    try {
      const data = new FormData(orderForm);
      data.append('cart', JSON.stringify(cartItems));
      await sendRequest(data);
      const t = cartLogic.totals(cartItems, prices, deliveryMethod());
      success.querySelector('[data-name]').textContent = orderForm.elements.name.value.trim();
      success.querySelector('[data-phone]').textContent = orderForm.elements.phone.value.trim();
      success.querySelector('[data-success-title]').textContent = cartItems.length ? 'Заказ принят' : 'Заявка принята';
      const totalEl = success.querySelector('[data-success-total]');
      totalEl.hidden = !cartItems.length;
      totalEl.textContent = `Сумма заказа — ${price(t.total)}${deliveryMethod() === 'pickup' ? ', самовывоз' : ''}. Оплата после подтверждения.`;
      updateCart([]);
      orderForm.reset();
      orderForm.hidden = true;
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

  const targets = [...document.querySelectorAll('.section__head, .benefit, .catalog__item, .catalog__custom, .plan, .subscription__image, .step, .about__image, .about__content, .faq__item, .contacts__info, .contacts__form')];
  // сначала все замеры, потом все записи: иначе каждая итерация заставляет браузер пересчитывать раскладку
  targets.filter((el) => el.getBoundingClientRect().top >= innerHeight).forEach((el) => {
    const index = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = `${(index % 4) * 80}ms`;
    el.classList.add('reveal');
    observer.observe(el);
  });
}
