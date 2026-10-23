const test = require('node:test');
const assert = require('node:assert/strict');
const validators = require('../js/validate.js');

test('name: пустое и из пробелов — ошибка', () => {
  assert.ok(validators.name(''));
  assert.ok(validators.name('   '));
  assert.equal(validators.name('Анна'), '');
});

test('phone: нужны 11 цифр, первая 7 или 8, формат не важен', () => {
  assert.match(validators.phone(''), /Укажите телефон/);
  assert.match(validators.phone('+7 000 000'), /Проверьте номер/);
  assert.match(validators.phone('+1 000 000-00-00'), /Проверьте номер/);
  assert.match(validators.phone('+7 000 000-00-000'), /Проверьте номер/);
  assert.equal(validators.phone('+7 (900) 123-45-67'), '');
  assert.equal(validators.phone('89001234567'), '');
});

test('emptyOrder: нужен букет в корзине или комментарий', () => {
  assert.match(validators.emptyOrder(0, '  '), /Добавьте букет/);
  assert.equal(validators.emptyOrder(2, ''), '');
  assert.equal(validators.emptyOrder(0, 'Соберите белый букет'), '');
});

test('comment: до 500 знаков включительно', () => {
  assert.equal(validators.comment(''), '');
  assert.equal(validators.comment('а'.repeat(500)), '');
  assert.match(validators.comment('а'.repeat(501)), /сейчас 501/);
});
