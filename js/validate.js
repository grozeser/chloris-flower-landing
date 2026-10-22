// Правила проверки полей заявки: возвращают текст ошибки или '' для верного значения.
// Подключается в браузере и в тесте (node --test).
const validators = {
  name: (value) => (value.trim() ? '' : 'Укажите имя, чтобы мы знали, как к вам обращаться'),
  phone: (value) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Укажите телефон, чтобы мы могли подтвердить заказ';
    return /^[78]\d{10}$/.test(digits) ? '' : 'Проверьте номер: нужны 11 цифр, например +7 000 000-00-00';
  },
  comment: (value) => (value.length <= 500 ? '' : `Сократите комментарий до 500 символов, сейчас ${value.length}`),
};

if (typeof module !== 'undefined') module.exports = validators;
