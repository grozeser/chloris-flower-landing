// Логика корзины без DOM: состав, количество, суммы и доставка.
// Позиции хранятся как { id, qty }, цены берутся из каталога, а не из localStorage.
// Подключается в браузере и в тесте (node --test).
const cartLogic = {
  FREE_DELIVERY_FROM: 5000,
  DELIVERY_PRICE: 350,
  MAX_QTY: 20,

  add(items, id) {
    const found = items.find((item) => item.id === id);
    return found ? cartLogic.setQty(items, id, found.qty + 1) : [...items, { id, qty: 1 }];
  },

  // qty <= 0 убирает позицию, сверху ограничено MAX_QTY
  setQty(items, id, qty) {
    const n = Math.min(Math.max(0, Math.trunc(qty) || 0), cartLogic.MAX_QTY);
    return n ? items.map((item) => (item.id === id ? { ...item, qty: n } : item)) : items.filter((item) => item.id !== id);
  },

  count(items) {
    return items.reduce((sum, item) => sum + item.qty, 0);
  },

  totals(items, prices, method = 'delivery') {
    const subtotal = items.reduce((sum, item) => sum + (prices[item.id] ?? 0) * item.qty, 0);
    const free = method === 'pickup' || subtotal === 0 || subtotal >= cartLogic.FREE_DELIVERY_FROM;
    const delivery = free ? 0 : cartLogic.DELIVERY_PRICE;
    return { subtotal, delivery, total: subtotal + delivery, toFree: Math.max(0, cartLogic.FREE_DELIVERY_FROM - subtotal) };
  },

  // Данные из localStorage — чужой ввод: оставляем только известные товары без дублей
  sanitize(raw, prices) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    return raw.filter((item) => item && typeof item.id === 'string' && Object.hasOwn(prices, item.id) && !seen.has(item.id) && seen.add(item.id))
      .map((item) => ({ id: item.id, qty: Math.min(Math.max(1, Math.trunc(item.qty) || 1), cartLogic.MAX_QTY) }));
  },

  price(n) {
    return `${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
  },
};

if (typeof module !== 'undefined') module.exports = cartLogic;
