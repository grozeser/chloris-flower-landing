const test = require('node:test');
const assert = require('node:assert/strict');
const cart = require('../js/cart.js');

const prices = { a: 3900, b: 1100, card: 150 };

test('add: новая позиция и увеличение количества', () => {
  let items = cart.add([], 'a');
  assert.deepEqual(items, [{ id: 'a', qty: 1 }]);
  items = cart.add(items, 'a');
  items = cart.add(items, 'b');
  assert.deepEqual(items, [{ id: 'a', qty: 2 }, { id: 'b', qty: 1 }]);
  assert.equal(cart.count(items), 3);
});

test('setQty: 0 убирает позицию, сверху ограничение', () => {
  const items = [{ id: 'a', qty: 2 }];
  assert.deepEqual(cart.setQty(items, 'a', 0), []);
  assert.deepEqual(cart.setQty(items, 'a', -3), []);
  assert.deepEqual(cart.setQty(items, 'a', 999), [{ id: 'a', qty: cart.MAX_QTY }]);
});

test('totals: доставка 350 ₽ до 5 000 ₽, дальше и при самовывозе бесплатно', () => {
  assert.deepEqual(cart.totals([], prices), { subtotal: 0, delivery: 0, total: 0, toFree: 5000 });
  assert.deepEqual(cart.totals([{ id: 'a', qty: 1 }], prices), { subtotal: 3900, delivery: 350, total: 4250, toFree: 1100 });
  assert.equal(cart.totals([{ id: 'a', qty: 1 }, { id: 'b', qty: 1 }], prices).delivery, 0); // ровно 5 000
  assert.equal(cart.totals([{ id: 'a', qty: 1 }], prices, 'pickup').delivery, 0);
});

test('sanitize: мусор, неизвестные товары и дубли отбрасываются', () => {
  assert.deepEqual(cart.sanitize('nope', prices), []);
  assert.deepEqual(cart.sanitize([null, { id: 'zzz', qty: 1 }, { id: '__proto__', qty: 1 }, { id: 'a', qty: 'x' }, { id: 'a', qty: 5 }, { id: 'card', qty: 50 }], prices),
    [{ id: 'a', qty: 1 }, { id: 'card', qty: cart.MAX_QTY }]);
});

test('price: разряды и рубль через неразрывный пробел', () => {
  assert.equal(cart.price(7300), '7 300 ₽');
});
