# Хлорис — лендинг цветочной студии

Портфолио-проект: одностраничный сайт вымышленной цветочной студии «Хлорис».
Бренд, тексты и контакты выдуманные.

**Сайт:** https://grozeser.github.io/chloris-flower-landing/ · **Кейс:** [docs/case-study.md](docs/case-study.md)

![Первый экран на десктопе](docs/screenshots/desktop.jpg)

## Что умеет

- Каталог из 16 букетов и композиций: фильтры по поводу и виду, сортировка по цене, «Показать ещё».
- Корзина на нативном `<dialog>`: количество, дополнения (открытка, ваза, конфеты), бесплатная доставка от 5 000 ₽ с полосой прогресса, сохранение в `localStorage`.
- Форма заказа с составом корзины, выбором курьера или самовывоза и проверкой полей.
- Цветочная подписка с тремя тарифами, отзывы с оценками, FAQ, мобильное меню.
- Без JS сайт остаётся рабочим: все 16 карточек видны, кнопки ведут к форме.

## Стек

Чистые HTML, CSS и JS, без сборки и библиотек. Mobile-first, цель по доступности — WCAG AA.

## Запуск

```bash
python -m http.server 5500
```

Затем открыть http://localhost:5500.

Тесты логики корзины и проверки полей формы (Node 20+):

```bash
node --test
```

## Результаты

- Lighthouse: телефон — Performance 92–99, Accessibility, Best Practices и SEO 100; десктоп — 100 / 100 / 100 / 100.
- Контраст всех текстов не ниже WCAG AA, CLS 0, вёрстка без горизонтальной прокрутки от 320 px.
- JavaScript ≈ 21 КБ без библиотек, 9 автотестов на корзину и правила формы.

Подробности — в [кейсе](docs/case-study.md) и [отчёте о проверке](docs/testing.md).

## Авторы фото

Все фото с [Unsplash](https://unsplash.com) по [Unsplash License](https://unsplash.com/license). Обрезаны и переведены в WebP через CDN Unsplash.

| Файл | Фото | Автор |
|---|---|---|
| `hero-*.webp`, `og.jpg` | [Pink and white rose bouquet](https://unsplash.com/photos/pink-and-white-rose-bouquet-QLuleNy8LMM) | [jessie daniella](https://unsplash.com/@jessiedaniella) |
| `bouquet-1-*` «Нежное утро» | [White and beige rose flower bouquet](https://unsplash.com/photos/white-and-beige-rose-flower-bouquet-WCkWGoHHNOM) | [Alina Karpenko](https://unsplash.com/@alinasagirova) |
| `bouquet-2-*` «Летний луг» | [A hand holding a bunch of white and yellow flowers](https://unsplash.com/photos/a-hand-holding-a-bunch-of-white-and-yellow-flowers-zr_fUKmHm_U) | [nina .](https://unsplash.com/@ensme) |
| `bouquet-3-*` «Белое облако» | [White flower bouquet on white table](https://unsplash.com/photos/white-flower-bouquet-on-white-table-edhJkqFn7kI) | [Sixteen Miles Out](https://unsplash.com/@sixteenmilesout) |
| `bouquet-4-*` «Сливочный закат» | [A bouquet of flowers](https://unsplash.com/photos/a-bouquet-of-flowers-e9GLYaIwOlE) | [Viacheslav Volodin](https://unsplash.com/@volodin28) |
| `bouquet-5-*` «Тёмная вишня» | [A bouquet of red roses in a clear vase](https://unsplash.com/photos/a-bouquet-of-red-roses-in-a-clear-vase-NVko_vUA6AA) | [Thomas Franke](https://unsplash.com/@thomas094) |
| `bouquet-6-*` «Первый снег» | [Woman holding white roses bouquet](https://unsplash.com/photos/woman-holding-white-roses-bouquet-Hg1rGuu9qGw) | [James Bold](https://unsplash.com/@jamesbold) |
| `bouquet-7-*` «Лимонный чай» | [Beige rose bouquet](https://unsplash.com/photos/beige-rose-bouquet-gS_Wkzo1U8Y) | [Phix Nguyen](https://unsplash.com/@phix) |
| `bouquet-8-*` «Пудровый вечер» | [A bouquet of pink roses wrapped in pink paper](https://unsplash.com/photos/a-bouquet-of-pink-roses-wrapped-in-pink-paper-3h5kKCsa9us) | [Amelia Cui](https://unsplash.com/@ameliacui) |
| `bouquet-9-*` «Розовая шкатулка» | [A bouquet of flowers](https://unsplash.com/photos/a-bouquet-of-flowers-FuBahGDCi3s) | [Viacheslav Volodin](https://unsplash.com/@volodin28) |
| `bouquet-10-*` «Сад в коробке» | [Pink and yellow roses bouquet](https://unsplash.com/photos/pink-and-yellow-roses-bouquet-vRAllHdGgvE) | [Cloris Ying](https://unsplash.com/@clorisyy) |
| `bouquet-11-*` «Солнечный день» | [Person holding yellow sunflower bouquet](https://unsplash.com/photos/person-holding-yellow-sunflower-bouquet-nl5WAIXa9bs) | [Eugenia Clara](https://unsplash.com/@eugeniaclara) |
| `bouquet-12-*` «Весенние тюльпаны» | [Pink petaled flower centerpiece in clear glass vase](https://unsplash.com/photos/pink-petaled-flower-centerpiece-in-clear-glass-vase-NFj6pEUdmpY) | [Uljana Borodina](https://unsplash.com/@anajlu) |
| `bouquet-13-*` «Пионовый вальс» | [Pink flowers in clear glass vase](https://unsplash.com/photos/pink-flowers-in-clear-glass-vase-ti4M507Rac0) | [Patrick Langwallner](https://unsplash.com/@patresinger) |
| `bouquet-14-*` «Летняя корзина» | [Pink rose on wicker basket](https://unsplash.com/photos/pink-rose-on-wicker-basket-buUFEtmNnjc) | [Brigitte Tohm](https://unsplash.com/@brigittetohm) |
| `bouquet-15-*` «Вечный июль» | [White and red flower bouquet](https://unsplash.com/photos/white-and-red-flower-bouquet-5j4N82EXR0s) | [insung yoon](https://unsplash.com/@insungpandora) |
| `bouquet-16-*` «Утренний туман» | [Woman holding white roses](https://unsplash.com/photos/woman-holding-white-roses-8vsLtu3FyWA) | [Alex Lvrs](https://unsplash.com/@alexlvrs) |
| `hero-inset-400.webp` | [Pink clustered-petal flower](https://unsplash.com/photos/pink-clustered-petal-flower-0r5PprYjChg) | [Rebecca Orlov](https://unsplash.com/@epicplaydate) |
| `subscription-*.webp` | [Bags of colorful tulips displayed at a market](https://unsplash.com/photos/bags-of-colorful-tulips-displayed-at-a-market-7F7gK0YVTHA) | [Eugenia Pan'kiv](https://unsplash.com/@eugenivy_now) |
| `about-*.webp` | [Hands arranging pink hydrangea flowers and green stems](https://unsplash.com/photos/hands-arranging-pink-hydrangea-flowers-and-green-stems-kDeW2wMjiY8) | [Volodymyr Lymariev](https://unsplash.com/@vlmrv) |
