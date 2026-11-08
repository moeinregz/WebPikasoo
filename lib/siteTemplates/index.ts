import type { ImageSlot, SiteTemplate } from "./generate";
import cafeAdra from "./templates/cafe-adra.template.html";
import cafeSara from "./templates/cafe-sara.template.html";
import fastfoodSimen from "./templates/fastfood-simen.template.html";
import carpetMatin from "./templates/carpet-matin.template.html";
import travelPargar from "./templates/travel-pargar.template.html";
import gymPulad from "./templates/gym-pulad.template.html";
import upholsteryFarshad from "./templates/upholstery-farshad.template.html";
import movingKarvan from "./templates/moving-karvan.template.html";
import fashionRococo from "./templates/fashion-rococo.template.html";
import lawParsa from "./templates/law-parsa.template.html";
import languageZabankadeh from "./templates/language-zabankadeh.template.html";
import jewelryZarafshan from "./templates/jewelry-zarafshan.template.html";
import watchSaatkade from "./templates/watch-saatkade.template.html";
import cosmeticsGolgoon from "./templates/cosmetics-golgoon.template.html";
import icecreamShahd from "./templates/icecream-shahd.template.html";
import pastryZafaran from "./templates/pastry-zafaran.template.html";
import musicNava from "./templates/music-nava.template.html";
import realestateZomorod from "./templates/realestate-zomorod.template.html";
import kebabBistoon from "./templates/kebab-bistoon.template.html";
import restaurantEmber from "./templates/restaurant-ember.template.html";
import dentalNora from "./templates/dental-nora.template.html";
import cafePrime from "./templates/cafe-prime.template.html";
import jewelryPrime from "./templates/jewelry-prime.template.html";
import gymPrime from "./templates/gym-prime.template.html";
import kebabPrime from "./templates/kebab-prime.template.html";
import fastfoodPrime from "./templates/fastfood-prime.template.html";
import bakeryPrime from "./templates/bakery-prime.template.html";
import pastryPrime from "./templates/pastry-prime.template.html";
import icecreamPrime from "./templates/icecream-prime.template.html";
import shopPrime from "./templates/shop-prime.template.html";
import fashionPrime from "./templates/fashion-prime.template.html";
import watchPrime from "./templates/watch-prime.template.html";
import carpetPrime from "./templates/carpet-prime.template.html";
import cosmeticsPrime from "./templates/cosmetics-prime.template.html";
import perfumeNoir from "./templates/perfume-noir.template.html";
import boutiqueAtelier from "./templates/boutique-atelier.template.html";
import bookstoreBarg from "./templates/bookstore-barg.template.html";
import clinicPrime from "./templates/clinic-prime.template.html";
import upholsteryPrime from "./templates/upholstery-prime.template.html";
import movingPrime from "./templates/moving-prime.template.html";
import realestatePrime from "./templates/realestate-prime.template.html";
import lawPrime from "./templates/law-prime.template.html";
import languagePrime from "./templates/language-prime.template.html";
import musicPrime from "./templates/music-prime.template.html";
import travelPrime from "./templates/travel-prime.template.html";
import hotelPrime from "./templates/hotel-prime.template.html";
import restaurantMadaen from "./templates/restaurant-madaen.template.html";
import gardenWillow from "./templates/garden-willow.template.html";
import gardenGilas from "./templates/garden-gilas.template.html";


// ---------------------------------------------------------------------------
// Template registry. To add a template: put the HTML in ./templates as
// `<name>.template.html` (placeholder syntax: see generate.ts and
// EXAMPLE.template.html), import it here and add an entry.
//  - `trade` must match an id in ./trades.ts
//  - `palette` = the template's OWN signature colors. With no color chosen the
//    template keeps its look; a chosen color re-themes the matching hue family.
//    (Templates that derive everything from {{c:...}} expressions, like
//    cafe-adra, take the trade's default palette instead and need no `palette`.)
// ---------------------------------------------------------------------------

// <lux-imports>
import accessoriesLux from "./templates/accessories-lux.template.html";
import appliancesLux from "./templates/appliances-lux.template.html";
import autopartsLux from "./templates/autoparts-lux.template.html";
import bagsLux from "./templates/bags-lux.template.html";
import bakeryLux from "./templates/bakery-lux.template.html";
import beddingLux from "./templates/bedding-lux.template.html";
import bookstoreLux from "./templates/bookstore-lux.template.html";
import breakfastLux from "./templates/breakfast-lux.template.html";
import cafeLux from "./templates/cafe-lux.template.html";
import carpetLux from "./templates/carpet-lux.template.html";
import clinicLux from "./templates/clinic-lux.template.html";
import coffeedistLux from "./templates/coffeedist-lux.template.html";
import cosmeticsLux from "./templates/cosmetics-lux.template.html";
import dentalLux from "./templates/dental-lux.template.html";
import digitalLux from "./templates/digital-lux.template.html";
import fabricLux from "./templates/fabric-lux.template.html";
import fashionLux from "./templates/fashion-lux.template.html";
import fastfoodLux from "./templates/fastfood-lux.template.html";
import footwearLux from "./templates/footwear-lux.template.html";
import funcenterLux from "./templates/funcenter-lux.template.html";
import gardenLux from "./templates/garden-lux.template.html";
import gymLux from "./templates/gym-lux.template.html";
import hotelLux from "./templates/hotel-lux.template.html";
import icecreamLux from "./templates/icecream-lux.template.html";
import jewelryLux from "./templates/jewelry-lux.template.html";
import jigarLux from "./templates/jigar-lux.template.html";
import kebabLux from "./templates/kebab-lux.template.html";
import kidswearLux from "./templates/kidswear-lux.template.html";
import kitchenwareLux from "./templates/kitchenware-lux.template.html";
import languageLux from "./templates/language-lux.template.html";
import lawLux from "./templates/law-lux.template.html";
import lingerieLux from "./templates/lingerie-lux.template.html";
import melamineLux from "./templates/melamine-lux.template.html";
import menunderLux from "./templates/menunder-lux.template.html";
import mobileLux from "./templates/mobile-lux.template.html";
import movingLux from "./templates/moving-lux.template.html";
import musicLux from "./templates/music-lux.template.html";
import pastryLux from "./templates/pastry-lux.template.html";
import plasticsLux from "./templates/plastics-lux.template.html";
import realestateLux from "./templates/realestate-lux.template.html";
import restaurantLux from "./templates/restaurant-lux.template.html";
import schoolLux from "./templates/school-lux.template.html";
import shoesLux from "./templates/shoes-lux.template.html";
import shopLux from "./templates/shop-lux.template.html";
import stationeryLux from "./templates/stationery-lux.template.html";
import toolsLux from "./templates/tools-lux.template.html";
import travelLux from "./templates/travel-lux.template.html";
import upholsteryLux from "./templates/upholstery-lux.template.html";
import watchLux from "./templates/watch-lux.template.html";
// </lux-imports>

export const TEMPLATES: SiteTemplate[] = [
  // <lux-templates>
  {
    id: "accessories-lux",
    trade: "accessories",
    label: "اکسسوری و بدلیجات — رنگی و ترندی (لوکس)",
    html: accessoriesLux,
    palette: { primary: "#d9466f", secondary: "#2b2d42" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "اکسسوری شاخص روی زمینه‌ی ساده", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — کیف‌ها", hint: "کیف‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — عینک‌ها", hint: "عینک‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — بدلیجات", hint: "بدلیجات", ratio: "4:5" },
      { key: "g4", label: "گالری — شال و روسری", hint: "شال و روسری", ratio: "4:5" },
    ],
  },
  {
    id: "appliances-lux",
    trade: "appliances",
    label: "لوازم خانگی — روشن و تمیز (لوکس)",
    html: appliancesLux,
    palette: { primary: "#0e7c86", secondary: "#1d3557" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "یخچال یا لباسشویی شاخص", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "شوروم فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — یخچال‌ها", hint: "یخچال‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — لباسشویی‌ها", hint: "لباسشویی‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — لوازم کوچک", hint: "لوازم کوچک", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "autoparts-lux",
    trade: "autoparts",
    label: "لوازم یدکی — مسابقه‌ای و فنی (لوکس)",
    html: autopartsLux,
    palette: { primary: "#e10600", secondary: "#1b263b" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "قطعه‌ی شاخص روی زمینه‌ی تیره", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین یا انبار", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — قفسه‌ها", hint: "قفسه‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — روغن و فیلتر", hint: "روغن و فیلتر", ratio: "4:5" },
      { key: "g4", label: "گالری — انبار", hint: "انبار", ratio: "4:5" },
    ],
  },
  {
    id: "bags-lux",
    trade: "bags",
    label: "کیف‌فروشی — چرم کنیاکی (لوکس)",
    html: bagsLux,
    palette: { primary: "#7a4b2a", secondary: "#1f1b18" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "کیف چرم شاخص", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین گالری", ratio: "4:5" },
      { key: "g1", label: "گالری — کنیاکی", hint: "کنیاکی", ratio: "4:5" },
      { key: "g2", label: "گالری — مشکی", hint: "مشکی", ratio: "4:5" },
      { key: "g3", label: "گالری — عسلی", hint: "عسلی", ratio: "4:5" },
      { key: "g4", label: "گالری — زرشکی", hint: "زرشکی", ratio: "4:5" },
    ],
  },
  {
    id: "bakery-lux",
    trade: "bakery",
    label: "نانوایی — گرم و تنوری (لوکس)",
    html: bakeryLux,
    palette: { primary: "#c17f2b", secondary: "#7a4a1f" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "نان تازه از نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "تنور یا ویترین", ratio: "4:5" },
      { key: "g1", label: "گالری — تنور", hint: "تنور", ratio: "4:5" },
      { key: "g2", label: "گالری — خمیر", hint: "خمیر", ratio: "4:5" },
      { key: "g3", label: "گالری — سنگک", hint: "سنگک", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "bedding-lux",
    trade: "bedding",
    label: "کالای خواب — شبانه و آرام (لوکس)",
    html: beddingLux,
    palette: { primary: "#8fb8ff", secondary: "#c9a7ff" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "تشک یا اتاق خواب مرتب", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "شوروم", ratio: "4:5" },
      { key: "g1", label: "گالری — شوروم تشک", hint: "شوروم تشک", ratio: "4:5" },
      { key: "g2", label: "گالری — بالش‌ها", hint: "بالش‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — روتختی‌ها", hint: "روتختی‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — سرویس کودک", hint: "سرویس کودک", ratio: "4:5" },
    ],
  },
  {
    id: "bookstore-lux",
    trade: "bookstore",
    label: "کتاب‌فروشی — شبانه و دنج (لوکس)",
    html: bookstoreLux,
    palette: { primary: "#d9a441", secondary: "#2f5d50" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "قفسه یا جلد کتاب", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای کتاب‌فروشی", ratio: "4:5" },
      { key: "g1", label: "گالری — قفسه‌ها", hint: "قفسه‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — گوشه‌ی مطالعه", hint: "گوشه‌ی مطالعه", ratio: "4:5" },
      { key: "g3", label: "گالری — کتاب کودک", hint: "کتاب کودک", ratio: "4:5" },
      { key: "g4", label: "گالری — تازه‌ها", hint: "تازه‌ها", ratio: "4:5" },
    ],
  },
  {
    id: "breakfast-lux",
    trade: "breakfast",
    label: "صبحانه‌سرا — آفتابی و صبحگاهی (لوکس)",
    html: breakfastLux,
    palette: { primary: "#e8762b", secondary: "#7a3e1d" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "سفره یا بشقاب صبحانه از بالا", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای صبحانه‌سرا", ratio: "4:5" },
      { key: "g1", label: "گالری — سفره‌ی صبحانه", hint: "سفره‌ی صبحانه", ratio: "4:5" },
      { key: "g2", label: "گالری — آشپزخونه", hint: "آشپزخونه", ratio: "4:5" },
      { key: "g3", label: "گالری — چای آتیشی", hint: "چای آتیشی", ratio: "4:5" },
      { key: "g4", label: "گالری — فضای سالن", hint: "فضای سالن", ratio: "4:5" },
    ],
  },
  {
    id: "cafe-lux",
    trade: "cafe",
    label: "کافه — سینمایی و دنج (لوکس)",
    html: cafeLux,
    palette: { primary: "#a0522d", secondary: "#5b3a29" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "یه فنجون قهوه از بالا", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای داخلی کافه", ratio: "4:5" },
      { key: "g1", label: "گالری — بار قهوه", hint: "بار قهوه", ratio: "4:5" },
      { key: "g2", label: "گالری — گوشه‌ی دنج", hint: "گوشه‌ی دنج", ratio: "4:5" },
      { key: "g3", label: "گالری — کیک‌ها", hint: "کیک‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — فضای بیرون", hint: "فضای بیرون", ratio: "4:5" },
    ],
  },
  {
    id: "carpet-lux",
    trade: "carpet",
    label: "فرش‌فروشی — اصیل و هنری (لوکس)",
    html: carpetLux,
    palette: { primary: "#6e1423", secondary: "#1f3b5a" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "نمای نزدیک طرح فرش", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "گالری فرش", ratio: "4:5" },
      { key: "g1", label: "گالری — گالری فرش", hint: "گالری فرش", ratio: "4:5" },
      { key: "g2", label: "گالری — دستباف‌ها", hint: "دستباف‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — گلیم و گبه", hint: "گلیم و گبه", ratio: "4:5" },
      { key: "g4", label: "گالری — کارگاه", hint: "کارگاه", ratio: "4:5" },
    ],
  },
  {
    id: "clinic-lux",
    trade: "clinic",
    label: "کلینیک — آرام و قابل‌اعتماد (لوکس)",
    html: clinicLux,
    palette: { primary: "#2a9d8f", secondary: "#1f6f8b" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "پزشک یا فضای کلینیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "پذیرش کلینیک", ratio: "4:5" },
      { key: "g1", label: "گالری — پذیرش", hint: "پذیرش", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق معاینه", hint: "اتاق معاینه", ratio: "4:5" },
      { key: "g3", label: "گالری — فضای انتظار", hint: "فضای انتظار", ratio: "4:5" },
      { key: "g4", label: "گالری — تجهیزات", hint: "تجهیزات", ratio: "4:5" },
    ],
  },
  {
    id: "coffeedist-lux",
    trade: "coffeedist",
    label: "پخش قهوه — رُست تیره و عمده (لوکس)",
    html: coffeedistLux,
    palette: { primary: "#c8873a", secondary: "#6f3b1f" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "دانه‌ی قهوه یا کیسه‌ی رُست", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "دستگاه رُست یا انبار", ratio: "4:5" },
      { key: "g1", label: "گالری — دستگاه رُست", hint: "دستگاه رُست", ratio: "4:5" },
      { key: "g2", label: "گالری — دانه‌ی سبز", hint: "دانه‌ی سبز", ratio: "4:5" },
      { key: "g3", label: "گالری — بسته‌بندی", hint: "بسته‌بندی", ratio: "4:5" },
      { key: "g4", label: "گالری — انبار", hint: "انبار", ratio: "4:5" },
    ],
  },
  {
    id: "cosmetics-lux",
    trade: "cosmetics",
    label: "لوازم آرایشی — لطیف و شیک (لوکس)",
    html: cosmeticsLux,
    palette: { primary: "#c6455b", secondary: "#9e2f44" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "محصول آرایشی با نور ملایم", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — مراقبت پوست", hint: "مراقبت پوست", ratio: "4:5" },
      { key: "g3", label: "گالری — آرایشی", hint: "آرایشی", ratio: "4:5" },
      { key: "g4", label: "گالری — پک‌های هدیه", hint: "پک‌های هدیه", ratio: "4:5" },
    ],
  },
  {
    id: "dental-lux",
    trade: "dental",
    label: "دندانپزشکی — تمیز و مطمئن (لوکس)",
    html: dentalLux,
    palette: { primary: "#1f8fbf", secondary: "#2bb5a0" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "لبخند یا کلینیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای کلینیک", ratio: "4:5" },
      { key: "g1", label: "گالری — پذیرش", hint: "پذیرش", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق درمان", hint: "اتاق درمان", ratio: "4:5" },
      { key: "g3", label: "گالری — تجهیزات", hint: "تجهیزات", ratio: "4:5" },
      { key: "g4", label: "گالری — فضای انتظار", hint: "فضای انتظار", ratio: "4:5" },
    ],
  },
  {
    id: "digital-lux",
    trade: "digital",
    label: "کالای دیجیتال — نئونی و گیمینگ (لوکس)",
    html: digitalLux,
    palette: { primary: "#22d3ee", secondary: "#3b5bfd" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "هدفون یا گجت شاخص روی زمینه‌ی تیره", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — صوتی", hint: "صوتی", ratio: "4:5" },
      { key: "g2", label: "گالری — گیمینگ", hint: "گیمینگ", ratio: "4:5" },
      { key: "g3", label: "گالری — پوشیدنی", hint: "پوشیدنی", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "fabric-lux",
    trade: "fabric",
    label: "پارچه‌فروشی — طاقه‌های رنگی و گرم (لوکس)",
    html: fabricLux,
    palette: { primary: "#1f5c5a", secondary: "#b5542f" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "طاقه‌های پارچه‌ی رنگی", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "قفسه‌های فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — طاقه‌های مانتویی", hint: "طاقه‌های مانتویی", ratio: "4:5" },
      { key: "g2", label: "گالری — مجلسی و حریر", hint: "مجلسی و حریر", ratio: "4:5" },
      { key: "g3", label: "گالری — پرده‌ای", hint: "پرده‌ای", ratio: "4:5" },
      { key: "g4", label: "گالری — رومبلی", hint: "رومبلی", ratio: "4:5" },
    ],
  },
  {
    id: "fashion-lux",
    trade: "fashion",
    label: "لباس مردانه و بوتیک — مینیمال و جنتلمن (لوکس)",
    html: fashionLux,
    palette: { primary: "#1e5b3f", secondary: "#c6a35f" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "کت‌وشلوار یا مدل", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای بوتیک", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق پرو", hint: "اتاق پرو", ratio: "4:5" },
      { key: "g3", label: "گالری — پارچه‌ها", hint: "پارچه‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — جزئیات", hint: "جزئیات", ratio: "4:5" },
    ],
  },
  {
    id: "fastfood-lux",
    trade: "fastfood",
    label: "فست‌فود — پاپ و پرانرژی (لوکس)",
    html: fastfoodLux,
    palette: { primary: "#e63b1f", secondary: "#ffb000" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "برگر یا پیتزا از نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "سالن یا پیشخون", ratio: "4:5" },
      { key: "g1", label: "گالری — گریل", hint: "گریل", ratio: "4:5" },
      { key: "g2", label: "گالری — پیشخون", hint: "پیشخون", ratio: "4:5" },
      { key: "g3", label: "گالری — سالن", hint: "سالن", ratio: "4:5" },
      { key: "g4", label: "گالری — سفارش‌ها", hint: "سفارش‌ها", ratio: "4:5" },
    ],
  },
  {
    id: "footwear-lux",
    trade: "footwear",
    label: "کفش‌فروشی — شبانه و شیک (لوکس)",
    html: footwearLux,
    palette: { primary: "#e0a96d", secondary: "#6b2737" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "کفش شاخص روی زمینه‌ی تیره", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — مجلسی", hint: "مجلسی", ratio: "4:5" },
      { key: "g2", label: "گالری — رسمی", hint: "رسمی", ratio: "4:5" },
      { key: "g3", label: "گالری — اسپرت", hint: "اسپرت", ratio: "4:5" },
      { key: "g4", label: "گالری — بوت", hint: "بوت", ratio: "4:5" },
    ],
  },
  {
    id: "funcenter-lux",
    trade: "funcenter",
    label: "مرکز تفریحی — شهربازی و پرانرژی (لوکس)",
    html: funcenterLux,
    palette: { primary: "#ff4d5e", secondary: "#ffc23c" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "شهربازی یا خانه‌ی بازی", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای مجموعه", ratio: "4:5" },
      { key: "g1", label: "گالری — خانه‌ی بازی", hint: "خانه‌ی بازی", ratio: "4:5" },
      { key: "g2", label: "گالری — بولینگ", hint: "بولینگ", ratio: "4:5" },
      { key: "g3", label: "گالری — اتاق فرار", hint: "اتاق فرار", ratio: "4:5" },
      { key: "g4", label: "گالری — سالن تولد", hint: "سالن تولد", ratio: "4:5" },
    ],
  },
  {
    id: "garden-lux",
    trade: "garden",
    label: "باغ رستوران — شب‌های فانوسی (لوکس)",
    html: gardenLux,
    palette: { primary: "#f2a63b", secondary: "#d8294b" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "باغ یا آلاچیق در شب", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "نمای باغ", ratio: "4:5" },
      { key: "g1", label: "گالری — آلاچیق‌ها", hint: "آلاچیق‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — جوی آب", hint: "جوی آب", ratio: "4:5" },
      { key: "g3", label: "گالری — فانوس‌ها", hint: "فانوس‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — سفره‌ها", hint: "سفره‌ها", ratio: "4:5" },
    ],
  },
  {
    id: "gym-lux",
    trade: "gym",
    label: "باشگاه — پرانرژی و جسور (لوکس)",
    html: gymLux,
    palette: { primary: "#e4572e", secondary: "#f2b134" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "ورزشکار یا سالن باشگاه", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "سالن باشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — سالن وزنه", hint: "سالن وزنه", ratio: "4:5" },
      { key: "g2", label: "گالری — سالن هوازی", hint: "سالن هوازی", ratio: "4:5" },
      { key: "g3", label: "گالری — کلاس گروهی", hint: "کلاس گروهی", ratio: "4:5" },
      { key: "g4", label: "گالری — رختکن", hint: "رختکن", ratio: "4:5" },
    ],
  },
  {
    id: "hotel-lux",
    trade: "hotel",
    label: "هتل و اقامتگاه — آرام و مجلل (لوکس)",
    html: hotelLux,
    palette: { primary: "#c8b273", secondary: "#a67c37" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "اتاق یا نمای هتل", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "لابی یا حیاط", ratio: "4:5" },
      { key: "g1", label: "گالری — لابی", hint: "لابی", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق‌ها", hint: "اتاق‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — رستوران", hint: "رستوران", ratio: "4:5" },
      { key: "g4", label: "گالری — حیاط", hint: "حیاط", ratio: "4:5" },
    ],
  },
  {
    id: "icecream-lux",
    trade: "icecream",
    label: "بستنی و آبمیوه — رنگی و شاد (لوکس)",
    html: icecreamLux,
    palette: { primary: "#ff4d6d", secondary: "#ff8a3d" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "بستنی یا آبمیوه از نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین یا فضای مغازه", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین بستنی", hint: "ویترین بستنی", ratio: "4:5" },
      { key: "g2", label: "گالری — آبمیوه‌ها", hint: "آبمیوه‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — کیک بستنی", hint: "کیک بستنی", ratio: "4:5" },
      { key: "g4", label: "گالری — فضای بستنی‌فروشی", hint: "فضای بستنی‌فروشی", ratio: "4:5" },
    ],
  },
  {
    id: "jewelry-lux",
    trade: "jewelry",
    label: "طلا و جواهر — درخشان و سلطنتی (لوکس)",
    html: jewelryLux,
    palette: { primary: "#c9a13b", secondary: "#7a1f2b" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "انگشتر یا جواهر روی زمینه‌ی تیره", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین گالری", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — سرویس عروس", hint: "سرویس عروس", ratio: "4:5" },
      { key: "g3", label: "گالری — انگشترها", hint: "انگشترها", ratio: "4:5" },
      { key: "g4", label: "گالری — کارگاه", hint: "کارگاه", ratio: "4:5" },
    ],
  },
  {
    id: "jigar-lux",
    trade: "jigar",
    label: "جیگرسرا — دودی و شبانه (لوکس)",
    html: jigarLux,
    palette: { primary: "#ff7a1a", secondary: "#b3202a" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "سینی جیگر یا منقل", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "منقل یا سالن", ratio: "4:5" },
      { key: "g1", label: "گالری — منقل", hint: "منقل", ratio: "4:5" },
      { key: "g2", label: "گالری — سیخ‌ها", hint: "سیخ‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — سالن", hint: "سالن", ratio: "4:5" },
      { key: "g4", label: "گالری — شب", hint: "شب", ratio: "4:5" },
    ],
  },
  {
    id: "kebab-lux",
    trade: "kebab",
    label: "کبابی — آتشین و جسور (لوکس)",
    html: kebabLux,
    palette: { primary: "#e0461f", secondary: "#f2b632" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "سینی کباب از بالا", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "منقل یا سالن", ratio: "4:5" },
      { key: "g1", label: "گالری — منقل", hint: "منقل", ratio: "4:5" },
      { key: "g2", label: "گالری — سالن", hint: "سالن", ratio: "4:5" },
      { key: "g3", label: "گالری — سیخ‌ها", hint: "سیخ‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — سینی‌ها", hint: "سینی‌ها", ratio: "4:5" },
    ],
  },
  {
    id: "kidswear-lux",
    trade: "kidswear",
    label: "پوشاک بچگانه — پاستلی و شاد (لوکس)",
    html: kidswearLux,
    palette: { primary: "#f2777a", secondary: "#5aa9a3" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "لباس بچگانه یا نوزادی روی زمینه‌ی روشن", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — نوزادی", hint: "نوزادی", ratio: "4:5" },
      { key: "g2", label: "گالری — دخترانه", hint: "دخترانه", ratio: "4:5" },
      { key: "g3", label: "گالری — پسرانه", hint: "پسرانه", ratio: "4:5" },
      { key: "g4", label: "گالری — مجلسی", hint: "مجلسی", ratio: "4:5" },
    ],
  },
  {
    id: "kitchenware-lux",
    trade: "kitchenware",
    label: "ظروف و لوازم آشپزخانه — گرم و کاشی‌کاری (لوکس)",
    html: kitchenwareLux,
    palette: { primary: "#d1495b", secondary: "#2e4057" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "قابلمه یا سرویس شاخص", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — قابلمه‌ها", hint: "قابلمه‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — چینی و بلور", hint: "چینی و بلور", ratio: "4:5" },
      { key: "g3", label: "گالری — سرویس‌ها", hint: "سرویس‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "language-lux",
    trade: "language",
    label: "آموزشگاه زبان — جهانی و پرانرژی (لوکس)",
    html: languageLux,
    palette: { primary: "#1b2a4a", secondary: "#e8a33d" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "کلاس یا زبان‌آموزها", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای آموزشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — کلاس‌ها", hint: "کلاس‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — لابراتوار", hint: "لابراتوار", ratio: "4:5" },
      { key: "g3", label: "گالری — کلاب مکالمه", hint: "کلاب مکالمه", ratio: "4:5" },
      { key: "g4", label: "گالری — کتابخانه", hint: "کتابخانه", ratio: "4:5" },
    ],
  },
  {
    id: "law-lux",
    trade: "law",
    label: "دفتر وکالت — رسمی و معتبر (لوکس)",
    html: lawLux,
    palette: { primary: "#b8975a", secondary: "#3a4a7a" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "دفتر یا نماد عدالت", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "دفتر وکالت", ratio: "4:5" },
      { key: "g1", label: "گالری — دفتر", hint: "دفتر", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق جلسه", hint: "اتاق جلسه", ratio: "4:5" },
      { key: "g3", label: "گالری — کتابخانه‌ی حقوقی", hint: "کتابخانه‌ی حقوقی", ratio: "4:5" },
      { key: "g4", label: "گالری — پذیرش", hint: "پذیرش", ratio: "4:5" },
    ],
  },
  {
    id: "lingerie-lux",
    trade: "lingerie",
    label: "لباس زیر زنانه — گلبهی و ظریف (لوکس)",
    html: lingerieLux,
    palette: { primary: "#b03a5b", secondary: "#3c1f2b" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "ست لباس یا گل و پارچه‌ی لطیف", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین بوتیک", ratio: "4:5" },
      { key: "g1", label: "گالری — گلبهی", hint: "گلبهی", ratio: "4:5" },
      { key: "g2", label: "گالری — شرابی", hint: "شرابی", ratio: "4:5" },
      { key: "g3", label: "گالری — مشکی", hint: "مشکی", ratio: "4:5" },
      { key: "g4", label: "گالری — کرم", hint: "کرم", ratio: "4:5" },
    ],
  },
  {
    id: "melamine-lux",
    trade: "melamine",
    label: "ملامین عمده — بنکداری و حرفه‌ای (لوکس)",
    html: melamineLux,
    palette: { primary: "#1d3557", secondary: "#e63946" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "سرویس ملامین روی زمینه‌ی ساده", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "انبار یا ویترین", ratio: "4:5" },
      { key: "g1", label: "گالری — انبار", hint: "انبار", ratio: "4:5" },
      { key: "g2", label: "گالری — طرح‌ها", hint: "طرح‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — بسته‌بندی", hint: "بسته‌بندی", ratio: "4:5" },
      { key: "g4", label: "گالری — بارگیری", hint: "بارگیری", ratio: "4:5" },
    ],
  },
  {
    id: "menunder-lux",
    trade: "menunder",
    label: "زیرپوش مردانه — اسپرت و تمیز (لوکس)",
    html: menunderLux,
    palette: { primary: "#0b3d91", secondary: "#0d1b2e" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "زیرپوش تاشده یا بسته‌ها", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "قفسه‌ها", ratio: "4:5" },
      { key: "g1", label: "گالری — سفید", hint: "سفید", ratio: "4:5" },
      { key: "g2", label: "گالری — سرمه‌ای", hint: "سرمه‌ای", ratio: "4:5" },
      { key: "g3", label: "گالری — مشکی", hint: "مشکی", ratio: "4:5" },
      { key: "g4", label: "گالری — طوسی", hint: "طوسی", ratio: "4:5" },
    ],
  },
  {
    id: "mobile-lux",
    trade: "mobile",
    label: "گوشی، لپ‌تاپ و تبلت — مینیمال و اپل‌طور (لوکس)",
    html: mobileLux,
    palette: { primary: "#0a66ff", secondary: "#111114" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "گوشی یا لپ‌تاپ روی زمینه‌ی روشن", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — گوشی‌ها", hint: "گوشی‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — لپ‌تاپ‌ها", hint: "لپ‌تاپ‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — تبلت‌ها", hint: "تبلت‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — لوازم جانبی", hint: "لوازم جانبی", ratio: "4:5" },
    ],
  },
  {
    id: "moving-lux",
    trade: "moving",
    label: "باربری — سریع و مطمئن (لوکس)",
    html: movingLux,
    palette: { primary: "#ff5a2a", secondary: "#57666f" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "کامیون یا تیم باربری", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "تیم در حال بسته‌بندی", ratio: "4:5" },
      { key: "g1", label: "گالری — کامیون‌ها", hint: "کامیون‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — بسته‌بندی", hint: "بسته‌بندی", ratio: "4:5" },
      { key: "g3", label: "گالری — تیم", hint: "تیم", ratio: "4:5" },
      { key: "g4", label: "گالری — انبار", hint: "انبار", ratio: "4:5" },
    ],
  },
  {
    id: "music-lux",
    trade: "music",
    label: "آموزشگاه موسیقی — شبانه و هنری (لوکس)",
    html: musicLux,
    palette: { primary: "#cf9c4f", secondary: "#742642" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "ساز یا اجرا", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "کلاس موسیقی", ratio: "4:5" },
      { key: "g1", label: "گالری — کلاس پیانو", hint: "کلاس پیانو", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق تمرین", hint: "اتاق تمرین", ratio: "4:5" },
      { key: "g3", label: "گالری — کنسرت", hint: "کنسرت", ratio: "4:5" },
      { key: "g4", label: "گالری — استودیو", hint: "استودیو", ratio: "4:5" },
    ],
  },
  {
    id: "pastry-lux",
    trade: "pastry",
    label: "شیرینی‌فروشی — شیک و طلایی (لوکس)",
    html: pastryLux,
    palette: { primary: "#c0566e", secondary: "#c6942f" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "کیک یا شیرینی از نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین شیرینی‌فروشی", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — کیک‌ها", hint: "کیک‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — شیرینی خشک", hint: "شیرینی خشک", ratio: "4:5" },
      { key: "g4", label: "گالری — جعبه‌ها", hint: "جعبه‌ها", ratio: "4:5" },
    ],
  },
  {
    id: "plastics-lux",
    trade: "plastics",
    label: "پلاسکو — رنگی و خال‌خالی (لوکس)",
    html: plasticsLux,
    palette: { primary: "#00a6a6", secondary: "#ff6f59" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "ظروف رنگی پلاستیکی", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "قفسه‌های فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — قفسه‌ی رنگی", hint: "قفسه‌ی رنگی", ratio: "4:5" },
      { key: "g2", label: "گالری — ظروف نگهداری", hint: "ظروف نگهداری", ratio: "4:5" },
      { key: "g3", label: "گالری — سبدها", hint: "سبدها", ratio: "4:5" },
      { key: "g4", label: "گالری — انبار", hint: "انبار", ratio: "4:5" },
    ],
  },
  {
    id: "realestate-lux",
    trade: "realestate",
    label: "مشاور املاک — معتبر و شیک (لوکس)",
    html: realestateLux,
    palette: { primary: "#155c42", secondary: "#c9a227" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "نمای ساختمان یا ملک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "دفتر املاک", ratio: "4:5" },
      { key: "g1", label: "گالری — آپارتمان", hint: "آپارتمان", ratio: "4:5" },
      { key: "g2", label: "گالری — ویلا", hint: "ویلا", ratio: "4:5" },
      { key: "g3", label: "گالری — تجاری", hint: "تجاری", ratio: "4:5" },
      { key: "g4", label: "گالری — دفتر ما", hint: "دفتر ما", ratio: "4:5" },
    ],
  },
  {
    id: "restaurant-lux",
    trade: "restaurant",
    label: "رستوران — شبانه و مجلل (لوکس)",
    html: restaurantLux,
    palette: { primary: "#c8a25a", secondary: "#8b1e2d" },
    menu: true,
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "غذای شاخص از بالا", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "سالن رستوران", ratio: "4:5" },
      { key: "g1", label: "گالری — سالن اصلی", hint: "سالن اصلی", ratio: "4:5" },
      { key: "g2", label: "گالری — آشپزخانه", hint: "آشپزخانه", ratio: "4:5" },
      { key: "g3", label: "گالری — بشقاب‌ها", hint: "بشقاب‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — سالن مراسم", hint: "سالن مراسم", ratio: "4:5" },
    ],
  },
  {
    id: "school-lux",
    trade: "school",
    label: "مدرسه غیرانتفاعی — دفتر مشق و رنگی (لوکس)",
    html: schoolLux,
    palette: { primary: "#2b59c3", secondary: "#ff8c42" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "دانش‌آموزان یا ساختمان مدرسه", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "کلاس یا حیاط", ratio: "4:5" },
      { key: "g1", label: "گالری — کلاس", hint: "کلاس", ratio: "4:5" },
      { key: "g2", label: "گالری — حیاط", hint: "حیاط", ratio: "4:5" },
      { key: "g3", label: "گالری — کارگاه", hint: "کارگاه", ratio: "4:5" },
      { key: "g4", label: "گالری — جشن‌ها", hint: "جشن‌ها", ratio: "4:5" },
    ],
  },
  {
    id: "shoes-lux",
    trade: "shoes",
    label: "کیف و کفش — استریت و بیلبوردی (لوکس)",
    html: shoesLux,
    palette: { primary: "#ff5b1f", secondary: "#111111" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "یه کفش یا کیف شاخص روی زمینه‌ی ساده", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — کتونی‌ها", hint: "کتونی‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — کفش رسمی", hint: "کفش رسمی", ratio: "4:5" },
      { key: "g3", label: "گالری — کیف‌ها", hint: "کیف‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — فضای فروشگاه", hint: "فضای فروشگاه", ratio: "4:5" },
    ],
  },
  {
    id: "shop-lux",
    trade: "shop",
    label: "فروشگاه — مدرن و پرانرژی (لوکس)",
    html: shopLux,
    palette: { primary: "#2f4bd1", secondary: "#f2994a" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "محصول شاخص یا ویترین", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — قفسه‌ها", hint: "قفسه‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — بسته‌بندی", hint: "بسته‌بندی", ratio: "4:5" },
      { key: "g4", label: "گالری — ارسال", hint: "ارسال", ratio: "4:5" },
    ],
  },
  {
    id: "stationery-lux",
    trade: "stationery",
    label: "لوازم‌التحریر — دفترچه‌ای و رنگی (لوکس)",
    html: stationeryLux,
    palette: { primary: "#4c6ef5", secondary: "#ff8fab" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "لوازم‌التحریر از بالا", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "قفسه‌های فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — دفترها", hint: "دفترها", ratio: "4:5" },
      { key: "g2", label: "گالری — رنگ‌ها", hint: "رنگ‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — مدرسه", hint: "مدرسه", ratio: "4:5" },
      { key: "g4", label: "گالری — اداری", hint: "اداری", ratio: "4:5" },
    ],
  },
  {
    id: "tools-lux",
    trade: "tools",
    label: "ابزارآلات — صنعتی و محکم (لوکس)",
    html: toolsLux,
    palette: { primary: "#ffc400", secondary: "#ff7a00" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "ابزار شاخص روی زمینه‌ی تیره", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "قفسه‌های فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — ابزار برقی", hint: "ابزار برقی", ratio: "4:5" },
      { key: "g2", label: "گالری — ابزار دستی", hint: "ابزار دستی", ratio: "4:5" },
      { key: "g3", label: "گالری — یراق‌آلات", hint: "یراق‌آلات", ratio: "4:5" },
      { key: "g4", label: "گالری — انبار", hint: "انبار", ratio: "4:5" },
    ],
  },
  {
    id: "travel-lux",
    trade: "travel",
    label: "آژانس مسافرتی — ماجراجو و آفتابی (لوکس)",
    html: travelLux,
    palette: { primary: "#2c8db8", secondary: "#e3a857" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "منظره‌ی یه مقصد", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "دفتر آژانس", ratio: "4:5" },
      { key: "g1", label: "گالری — دریا", hint: "دریا", ratio: "4:5" },
      { key: "g2", label: "گالری — شهرها", hint: "شهرها", ratio: "4:5" },
      { key: "g3", label: "گالری — طبیعت", hint: "طبیعت", ratio: "4:5" },
      { key: "g4", label: "گالری — آژانس", hint: "آژانس", ratio: "4:5" },
    ],
  },
  {
    id: "upholstery-lux",
    trade: "upholstery",
    label: "مبل‌شویی — تمیز و براق (لوکس)",
    html: upholsteryLux,
    palette: { primary: "#0a2540", secondary: "#2bb5a0" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "مبل تمیز یا قبل/بعد", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "تیم یا تجهیزات", ratio: "4:5" },
      { key: "g1", label: "گالری — قبل و بعد مبل", hint: "قبل و بعد مبل", ratio: "4:5" },
      { key: "g2", label: "گالری — فرش در محل", hint: "فرش در محل", ratio: "4:5" },
      { key: "g3", label: "گالری — تجهیزات", hint: "تجهیزات", ratio: "4:5" },
      { key: "g4", label: "گالری — تیم ما", hint: "تیم ما", ratio: "4:5" },
    ],
  },
  {
    id: "watch-lux",
    trade: "watch",
    label: "ساعت‌فروشی — کلاسیک و دقیق (لوکس)",
    html: watchLux,
    palette: { primary: "#c9a24b", secondary: "#7a2e3a" },
    images: [
      { key: "hero", label: "عکس اصلی (دایره‌ی بالای صفحه)", hint: "ساعت روی زمینه‌ی تیره", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — کارگاه تعمیر", hint: "کارگاه تعمیر", ratio: "4:5" },
      { key: "g3", label: "گالری — ساعت‌های مردانه", hint: "ساعت‌های مردانه", ratio: "4:5" },
      { key: "g4", label: "گالری — ساعت‌های زنانه", hint: "ساعت‌های زنانه", ratio: "4:5" },
    ],
  },
  // </lux-templates>
  {
    id: "boutique-atelier",
    trade: "womenswear",
    label: "مزون زنانه — ادیتوریال و رمانتیک (آتلیه)",
    html: boutiqueAtelier,
    palette: { primary: "#b76e79", secondary: "#7d3c47" },
    images: [
      { key: "hero", label: "عکس اصلی (قاب وسط بالای صفحه)", hint: "مدل یا لباس شاخص، قاب کمانی بلند", ratio: "2:3" },
      { key: "g1", label: "گالری — ویترین کالکشن", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق پرو", hint: "اتاق پرو یا فضای داخلی", ratio: "7:5" },
      { key: "g3", label: "گالری — جزئیات دوخت", hint: "نمای نزدیک دوخت یا پارچه", ratio: "7:5" },
      { key: "g4", label: "گالری — بسته‌بندی", hint: "بسته‌بندی یا کیسه‌ی خرید", ratio: "4:5" },
    ],
  },
  {
    id: "bookstore-barg",
    trade: "bookstore",
    label: "کتاب‌فروشی — کاغذی و ادبی (برگ)",
    html: bookstoreBarg,
    palette: { primary: "#1f4d3a", secondary: "#b8862f" },
    images: [
      { key: "hero", label: "جلد کتاب سه‌بعدی (بالای صفحه)", hint: "طرح جلد یا لوگوی فروشگاه، عمودی", ratio: "2:3" },
      { key: "about", label: "داستان ما (داخل کتاب ورق‌خور)", hint: "نمای فروشگاه", ratio: "16:9" },
      { key: "g1", label: "گالری — ویترین کتاب‌ها", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — گوشه‌ی کتاب‌خوانی", hint: "فضای مطالعه", ratio: "4:3" },
      { key: "g3", label: "گالری — قفسه‌ی کودک", hint: "قفسه‌ی کتاب کودک", ratio: "4:3" },
      { key: "g4", label: "گالری — تازه‌ها", hint: "کتاب‌های تازه", ratio: "16:9" },
    ],
  },
  {
    id: "perfume-noir",
    trade: "perfume",
    label: "عطرفروشی — لوکس و سینمایی (نوآر)",
    html: perfumeNoir,
    palette: { primary: "#c9a25a", secondary: "#5b1f3a" },
    images: [
      { key: "hero", label: "عطر شاخص (بالای صفحه)", hint: "یک شیشه‌ی عطر روی زمینه‌ی تیره، قاب کمانی", ratio: "3:4" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین یا فضای فروشگاه", ratio: "4:5" },
      { key: "g1", label: "ویترین — عطرهای مردانه", hint: "عطرهای مردانه", ratio: "4:5" },
      { key: "g2", label: "ویترین — عطرهای زنانه", hint: "عطرهای زنانه", ratio: "4:5" },
      { key: "g3", label: "ویترین — دکانت و تستر", hint: "دکانت‌ها", ratio: "4:5" },
      { key: "g4", label: "ویترین — ست‌های هدیه", hint: "ست هدیه یا بسته‌بندی", ratio: "4:5" },
    ],
  },
  {
    id: "cafe-adra",
    trade: "cafe",
    label: "کافه — رنگارنگ و شاد",
    html: cafeAdra,
    menu: true,
  },
  {
    id: "cafe-sara",
    trade: "cafe",
    label: "کافه — گرم و دنج (سارا)",
    html: cafeSara,
    menu: true,
    palette: { primary: "#d9673f", secondary: "#1f5451" },
  },
  {
    id: "fastfood-simen",
    trade: "fastfood",
    label: "فست‌فود — آتشین و پرانرژی",
    html: fastfoodSimen,
    images: [
      { key: "about", label: "عکس درباره‌ی ما", hint: "پیتزا یا غذای شاخص. اگه چیزی آپلود نکنی همون عکس نمونه نمایش داده می‌شه", ratio: "4:5" },
    ],
    palette: { primary: "#e63329", secondary: "#f5a623" },
  },
  {
    id: "carpet-matin",
    trade: "carpet",
    label: "فرش‌فروشی — شرابی و طلایی",
    html: carpetMatin,
    palette: { primary: "#6E1423", secondary: "#C39A4B" },
  },
  {
    id: "travel-pargar",
    trade: "travel",
    label: "آژانس مسافرتی — سرمه‌ای و طلایی",
    html: travelPargar,
    palette: { primary: "#1B4A66", secondary: "#E3A857" },
  },
  {
    id: "gym-pulad",
    trade: "gym",
    label: "باشگاه — تیره و پرانرژی",
    html: gymPulad,
    palette: { primary: "#ff4419", secondary: "#d7ff4a" },
  },
  {
    id: "upholstery-farshad",
    trade: "upholstery",
    label: "مبل‌شویی — سرمه‌ای و طلایی",
    html: upholsteryFarshad,
    palette: { primary: "#0A2540", secondary: "#C9A227" },
  },
  {
    id: "moving-karvan",
    trade: "moving",
    label: "باربری — زرد و نارنجی",
    html: movingKarvan,
    palette: { primary: "#FFC530", secondary: "#FF5A2A" },
  },
  {
    id: "fashion-rococo",
    trade: "fashion",
    label: "لباس مردانه — سبز و طلایی",
    html: fashionRococo,
    palette: { primary: "#1e5b3f", secondary: "#c6a35f" },
  },
  {
    id: "law-parsa",
    trade: "law",
    label: "دفتر وکالت — کلاسیک",
    html: lawParsa,
    palette: { primary: "#b8925a", secondary: "#16263d" },
  },
  {
    id: "language-zabankadeh",
    trade: "language",
    label: "آموزشگاه زبان — پستی و گرم",
    html: languageZabankadeh,
    palette: { primary: "#E8A33D", secondary: "#1B2A4A" },
  },
  {
    id: "jewelry-zarafshan",
    trade: "jewelry",
    label: "طلافروشی — مخملی و طلایی",
    html: jewelryZarafshan,
    palette: { primary: "#c9a13b", secondary: "#2a1014" },
  },
  {
    id: "watch-saatkade",
    trade: "watch",
    label: "ساعت‌فروشی — لوکس تیره",
    html: watchSaatkade,
    palette: { primary: "#c9a24b", secondary: "#7a2e3a" },
  },
  {
    id: "cosmetics-golgoon",
    trade: "cosmetics",
    label: "لوازم آرایشی — رز و طلایی",
    html: cosmeticsGolgoon,
    palette: { primary: "#C6455B", secondary: "#C9A15A" },
  },
  {
    id: "icecream-shahd",
    trade: "icecream",
    label: "بستنی و آبمیوه — شاد و میوه‌ای",
    html: icecreamShahd,
    palette: { primary: "#FF4D6D", secondary: "#FF8A3D" },
  },
  {
    id: "pastry-zafaran",
    trade: "pastry",
    label: "شیرینی‌فروشی — سنتی و طلایی",
    html: pastryZafaran,
    palette: { primary: "#C6942F", secondary: "#4A2020" },
  },
  {
    id: "music-nava",
    trade: "music",
    label: "آموزشگاه موسیقی — شرابی و طلایی",
    html: musicNava,
    palette: { primary: "#742642", secondary: "#cf9c4f" },
  },
  {
    id: "realestate-zomorod",
    trade: "realestate",
    label: "املاک — زمردی و طلایی",
    html: realestateZomorod,
    palette: { primary: "#155c42", secondary: "#c9a227" },
  },
  {
    id: "dental-nora",
    trade: "dental",
    label: "دندانپزشکی — سینمایی و تعاملی",
    html: dentalNora,
    palette: { primary: "#0F766E" },
  },
  {
    id: "restaurant-ember",
    trade: "restaurant",
    label: "رستوران — مدرن و رنگارنگ",
    html: restaurantEmber,
    menu: true,
    palette: { primary: "#e4572e", secondary: "#1f6f5c" },
    images: [
      { key: "hero", label: "غذای شاخص (بالای صفحه)", hint: "قاب گرد بزرگ بالای صفحه — بهترین غذای رستوران، نمای نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "قاب قوسی بخش درباره — آشپزخانه، سرآشپز یا نمای اصلی رستوران", ratio: "4:5" },
      { key: "dish1", label: "پیشنهاد سرآشپز ۱", hint: "کارت اول بخش پیشنهاد سرآشپز — نمای نزدیک غذا", ratio: "4:5" },
      { key: "dish2", label: "پیشنهاد سرآشپز ۲", hint: "کارت دوم بخش پیشنهاد سرآشپز", ratio: "4:5" },
      { key: "dish3", label: "پیشنهاد سرآشپز ۳", hint: "کارت سوم بخش پیشنهاد سرآشپز", ratio: "4:5" },
      { key: "env1", label: "فضا — سالن اصلی", hint: "قاب بزرگ گالری فضای رستوران", ratio: "1:1" },
      { key: "env2", label: "فضا — گوشه‌ی دنج", hint: "گالری فضای رستوران", ratio: "4:5" },
      { key: "env3", label: "فضا — نور و جزئیات", hint: "گالری فضای رستوران", ratio: "4:5" },
      { key: "env4", label: "فضا — میز و چیدمان", hint: "گالری فضای رستوران", ratio: "4:5" },
      { key: "env5", label: "فضا — پذیرایی", hint: "گالری فضای رستوران", ratio: "4:5" },
    ],
  },
  {
    id: "restaurant-madaen",
    trade: "restaurant",
    label: "رستوران — شرقی و برنجی (مدائن)",
    html: restaurantMadaen,
    menu: true,
    images: [
      { key: "hall", label: "سالن اصلی", hint: "نمای اصلی بالای صفحه و گالری — یک عکس عمودی از سالن", ratio: "4:5" },
      { key: "dish", label: "غذای شاخص", hint: "بخش «غذای ویژه» — نمای نزدیک از بهترین غذای منو", ratio: "1:1" },
      { key: "table", label: "سالن دورهمی", hint: "گالری — میز بلند یا سالن پذیرایی گروهی", ratio: "4:5" },
      { key: "entrance", label: "ورودی", hint: "بخش درباره‌ما و گالری — در یا نمای ورودی", ratio: "3:4" },
      { key: "lounge", label: "سالن دوم", hint: "دایره‌ی کوچک بخش درباره‌ما و گالری", ratio: "1:1" },
    ],
    palette: { primary: "#8c1d36", secondary: "#c9a24f" },
  },
  {
    id: "kebab-bistoon",
    trade: "kebab",
    label: "کبابی — قرمز و شاد (بیستون)",
    html: kebabBistoon,
    palette: { primary: "#c8102e", secondary: "#2a1233" },
  },
  {
    id: "garden-willow",
    trade: "garden",
    label: "باغ رستوران — فانوس و سبز (بید مجنون)",
    html: gardenWillow,
    images: [
      { key: "about_main", label: "عکس اصلی درباره‌ی ما", hint: "بخش «درباره»، قاب بزرگ — فضای کلی باغ", ratio: "4:5" },
      { key: "about_small", label: "عکس کوچک درباره‌ی ما", hint: "بخش «درباره»، قاب کوچک — یک جزئیات جذاب", ratio: "1:1" },
      { key: "yard", label: "گالری — حیاط باغ", hint: "قاب بلند و بزرگ گالری", ratio: "3:4" },
      { key: "night", label: "گالری — حیاط در شب", hint: "نورپردازی شب", ratio: "4:3" },
      { key: "entrance", label: "گالری — ورودی و فانوس", hint: "ورودی یا فانوس‌ها", ratio: "4:3" },
      { key: "tables", label: "گالری — میزها", hint: "چیدمان میز و صندلی", ratio: "4:3" },
      { key: "roof", label: "گالری — سقف و نورپردازی", hint: "پرگولا یا سقف", ratio: "4:3" },
    ],
    palette: { primary: "#f2a63b", secondary: "#1f3d2b" },
  },
  {
    id: "garden-gilas",
    trade: "garden",
    label: "باغ رستوران — شب‌نشینی (گیلاس)",
    html: gardenGilas,
    palette: { primary: "#b01535", secondary: "#12392a" },
  },
  {
    id: "cafe-prime",
    trade: "cafe",
    label: "کافه — اسپرسو و کارامل",
    html: cafePrime,
    menu: true,
    palette: { primary: "#d38b45", secondary: "#8a5530" },
    images: [
      { key: "hero", label: "فنجان یا غذای شاخص (بالای صفحه)", hint: "قاب گرد بزرگ بالای صفحه — یک فنجان قهوه یا شیرینی از نمای نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "کانتر، باریستا یا نمای کلی کافه", ratio: "4:5" },
      { key: "g1", label: "گالری — کانتر قهوه", hint: "کانتر و دستگاه قهوه", ratio: "4:5" },
      { key: "g2", label: "گالری — گوشه‌ی دنج", hint: "گوشه‌ی نشیمن", ratio: "4:5" },
      { key: "g3", label: "گالری — دانه و دم‌آوری", hint: "دانه‌ها و دم‌آوری", ratio: "4:5" },
      { key: "g4", label: "گالری — شیرینی‌ها", hint: "ویترین شیرینی", ratio: "4:5" },
    ],
  },
  {
    id: "jewelry-prime",
    trade: "jewelry",
    label: "جواهر — شاهانه و درخشان",
    html: jewelryPrime,
    palette: { primary: "#c9a14a", secondary: "#7b5d22" },
    images: [
      { key: "hero", label: "جواهر شاخص (بالای صفحه)", hint: "قاب بزرگ پس‌زمینه — یک قطعه‌ی درخشان با نور خوب", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فضای فروشگاه یا استادکار در حال کار", ratio: "4:5" },
      { key: "g1", label: "گالری — انگشتر", hint: "انگشتر", ratio: "4:5" },
      { key: "g2", label: "گالری — گردنبند", hint: "گردنبند", ratio: "4:5" },
      { key: "g3", label: "گالری — سرویس", hint: "سرویس", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "gym-prime",
    trade: "gym",
    label: "باشگاه — قدرت و انرژی",
    html: gymPrime,
    palette: { primary: "#c6f23a", secondary: "#ff6a2b" },
    images: [
      { key: "hero", label: "قهرمان صفحه (بالای صفحه)", hint: "قاب بزرگ بالای صفحه — یک عکس پرانرژی از تمرین یا سالن", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "سالن اصلی یا مربی در حال تمرین", ratio: "4:5" },
      { key: "g1", label: "گالری — سالن بدنسازی", hint: "سالن بدنسازی", ratio: "4:5" },
      { key: "g2", label: "گالری — وزنه‌های آزاد", hint: "وزنه‌های آزاد", ratio: "4:5" },
      { key: "g3", label: "گالری — کاردیو", hint: "دستگاه‌های کاردیو", ratio: "4:5" },
      { key: "g4", label: "گالری — کلاس گروهی", hint: "کلاس گروهی", ratio: "4:5" },
    ],
  },
  {
    id: "kebab-prime",
    trade: "kebab",
    label: "کبابی — آتش و ذغال",
    html: kebabPrime,
    palette: { primary: "#e8541e", secondary: "#a8281a" },
    images: [
      { key: "hero", label: "سیخ یا غذای شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — کباب روی آتش یا یک سفره‌ی کامل", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "کبابی در حال کار یا نمای رستوران", ratio: "4:5" },
      { key: "g1", label: "گالری — آتش و ذغال", hint: "آتش و ذغال", ratio: "4:5" },
      { key: "g2", label: "گالری — سیخ‌ها", hint: "سیخ‌ها", ratio: "4:5" },
      { key: "g3", label: "گالری — سفره‌ی کامل", hint: "سفره‌ی کامل", ratio: "4:5" },
      { key: "g4", label: "گالری — سالن", hint: "سالن", ratio: "4:5" },
    ],
  },
  {
    id: "fastfood-prime",
    trade: "fastfood",
    label: "فست‌فود — داغ و پرانرژی",
    html: fastfoodPrime,
    palette: { primary: "#f23d1e", secondary: "#ffb400" },
    images: [
      { key: "hero", label: "غذای شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — برگر یا پیتزای شاخص از نمای نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "آشپزخونه یا نمای رستوران", ratio: "4:5" },
      { key: "g1", label: "گالری — برگر", hint: "برگر", ratio: "4:5" },
      { key: "g2", label: "گالری — پیتزا", hint: "پیتزا", ratio: "4:5" },
      { key: "g3", label: "گالری — سوخاری", hint: "سوخاری", ratio: "4:5" },
      { key: "g4", label: "گالری — فضای رستوران", hint: "فضای رستوران", ratio: "4:5" },
    ],
  },
  {
    id: "bakery-prime",
    trade: "bakery",
    label: "نانوایی — طلایی و گرم",
    html: bakeryPrime,
    palette: { primary: "#c98a2b", secondary: "#8d5a1b" },
    images: [
      { key: "hero", label: "نان شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — نان تازه از تنور", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "تنور، استادکار یا نمای نانوایی", ratio: "4:5" },
      { key: "g1", label: "گالری — تنور", hint: "تنور", ratio: "4:5" },
      { key: "g2", label: "گالری — نان‌های تازه", hint: "نان‌های تازه", ratio: "4:5" },
      { key: "g3", label: "گالری — استادکار", hint: "استادکار", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "pastry-prime",
    trade: "pastry",
    label: "شیرینی‌فروشی — پاستل و طلا",
    html: pastryPrime,
    palette: { primary: "#d9667f", secondary: "#b07a2c" },
    images: [
      { key: "hero", label: "شیرینی شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — کیک یا شیرینی از نمای نزدیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "شیرینی‌پز در حال کار یا ویترین", ratio: "4:5" },
      { key: "g1", label: "گالری — کیک", hint: "کیک", ratio: "4:5" },
      { key: "g2", label: "گالری — شیرینی تر", hint: "شیرینی تر", ratio: "4:5" },
      { key: "g3", label: "گالری — جعبه‌ی هدیه", hint: "جعبه‌ی هدیه", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "icecream-prime",
    trade: "icecream",
    label: "بستنی و آبمیوه — شاد و خنک",
    html: icecreamPrime,
    palette: { primary: "#ff5f9e", secondary: "#13b3c3" },
    images: [
      { key: "hero", label: "بستنی شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — بستنی یا آبمیوه‌ی رنگارنگ", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین بستنی یا نمای مغازه", ratio: "4:5" },
      { key: "g1", label: "گالری — بستنی قیفی", hint: "بستنی قیفی", ratio: "4:5" },
      { key: "g2", label: "گالری — آبمیوه", hint: "آبمیوه", ratio: "4:5" },
      { key: "g3", label: "گالری — شیک", hint: "شیک", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "shop-prime",
    trade: "shop",
    label: "فروشگاه — مدرن و رنگی",
    html: shopPrime,
    palette: { primary: "#3b5bfd", secondary: "#ff6b4a" },
    images: [
      { key: "hero", label: "محصول شاخص (بالای صفحه)", hint: "قاب بزرگ بالای صفحه — پرفروش‌ترین محصول یا ویترین", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "نمای فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g2", label: "گالری — محصولات تازه", hint: "محصولات تازه", ratio: "4:5" },
      { key: "g3", label: "گالری — قفسه‌ها", hint: "قفسه‌ها", ratio: "4:5" },
      { key: "g4", label: "گالری — پیشخوان", hint: "پیشخوان", ratio: "4:5" },
    ],
  },
  {
    id: "fashion-prime",
    trade: "fashion",
    label: "مد — مینیمال و ادیتوریال",
    html: fashionPrime,
    palette: { primary: "#1c1714", secondary: "#b9877a" },
    images: [
      { key: "hero", label: "مدل یا لباس شاخص (بالای صفحه)", hint: "قاب قوسی بزرگ — یک استایل کامل", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین یا فضای بوتیک", ratio: "4:5" },
      { key: "g1", label: "گالری — کالکشن", hint: "کالکشن", ratio: "4:5" },
      { key: "g2", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
      { key: "g3", label: "گالری — جزئیات پارچه", hint: "جزئیات پارچه", ratio: "4:5" },
      { key: "g4", label: "گالری — اکسسوری", hint: "اکسسوری", ratio: "4:5" },
    ],
  },
  {
    id: "watch-prime",
    trade: "watch",
    label: "ساعت — دقیق و لوکس",
    html: watchPrime,
    palette: { primary: "#c8b27a", secondary: "#5d6670" },
    images: [
      { key: "hero", label: "ساعت شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — یک ساعت با نور خوب", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "کارگاه تعمیر یا نمای فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — ساعت مچی", hint: "ساعت مچی", ratio: "4:5" },
      { key: "g2", label: "گالری — مکانیزم", hint: "مکانیزم", ratio: "4:5" },
      { key: "g3", label: "گالری — بندها", hint: "بندها", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "carpet-prime",
    trade: "carpet",
    label: "فرش — اصیل و ایرانی",
    html: carpetPrime,
    palette: { primary: "#8f1d2c", secondary: "#1f2a5c" },
    images: [
      { key: "hero", label: "فرش شاخص (بالای صفحه)", hint: "قاب قوسی بزرگ — یک فرش با نقش زیبا", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "فروشگاه یا نمای فرش‌ها", ratio: "4:5" },
      { key: "g1", label: "گالری — فرش دست‌باف", hint: "فرش دست‌باف", ratio: "4:5" },
      { key: "g2", label: "گالری — نقش و حاشیه", hint: "نقش و حاشیه", ratio: "4:5" },
      { key: "g3", label: "گالری — قالیچه", hint: "قالیچه", ratio: "4:5" },
      { key: "g4", label: "گالری — فروشگاه", hint: "فروشگاه", ratio: "4:5" },
    ],
  },
  {
    id: "cosmetics-prime",
    trade: "cosmetics",
    label: "لوازم آرایشی — لوکس و صورتی",
    html: cosmeticsPrime,
    palette: { primary: "#d6336c", secondary: "#7b2d5f" },
    images: [
      { key: "hero", label: "محصول شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — رژلب یا محصول با نور ملایم", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ویترین یا فضای فروشگاه", ratio: "4:5" },
      { key: "g1", label: "گالری — رژلب‌ها", hint: "رژلب‌ها", ratio: "4:5" },
      { key: "g2", label: "گالری — مراقبت پوست", hint: "مراقبت پوست", ratio: "4:5" },
      { key: "g3", label: "گالری — عطرها", hint: "عطرها", ratio: "4:5" },
      { key: "g4", label: "گالری — ویترین", hint: "ویترین", ratio: "4:5" },
    ],
  },
  {
    id: "clinic-prime",
    trade: "clinic",
    label: "کلینیک — پاک و مطمئن",
    html: clinicPrime,
    palette: { primary: "#0f8ea0", secondary: "#2563eb" },
    images: [
      { key: "hero", label: "تصویر شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — پزشک یا فضای کلینیک", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "ورودی یا پذیرش کلینیک", ratio: "4:5" },
      { key: "g1", label: "گالری — پذیرش", hint: "پذیرش", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق معاینه", hint: "اتاق معاینه", ratio: "4:5" },
      { key: "g3", label: "گالری — سالن انتظار", hint: "سالن انتظار", ratio: "4:5" },
      { key: "g4", label: "گالری — تجهیزات", hint: "تجهیزات", ratio: "4:5" },
    ],
  },
  {
    id: "upholstery-prime",
    trade: "upholstery",
    label: "مبل‌شویی — تازه و درخشان",
    html: upholsteryPrime,
    palette: { primary: "#1496d8", secondary: "#0b5ea8" },
    images: [
      { key: "hero", label: "مبل یا تصویر شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — یک مبل تمیز و درخشان", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "تیم یا دستگاه در حال کار", ratio: "4:5" },
      { key: "g1", label: "گالری — شست‌وشوی مبل", hint: "شست‌وشوی مبل", ratio: "4:5" },
      { key: "g2", label: "گالری — فرش", hint: "فرش", ratio: "4:5" },
      { key: "g3", label: "گالری — لکه‌بری", hint: "لکه‌بری", ratio: "4:5" },
      { key: "g4", label: "گالری — تجهیزات", hint: "تجهیزات", ratio: "4:5" },
    ],
  },
  {
    id: "moving-prime",
    trade: "moving",
    label: "باربری — مطمئن و سریع",
    html: movingPrime,
    palette: { primary: "#ff7a1a", secondary: "#2b4a8f" },
    images: [
      { key: "hero", label: "ناوگان شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — کامیونت یا تیم در حال بارگیری", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "تیم یا انبار", ratio: "4:5" },
      { key: "g1", label: "گالری — ناوگان", hint: "ناوگان", ratio: "4:5" },
      { key: "g2", label: "گالری — بسته‌بندی", hint: "بسته‌بندی", ratio: "4:5" },
      { key: "g3", label: "گالری — بارگیری", hint: "بارگیری", ratio: "4:5" },
      { key: "g4", label: "گالری — چیدمان", hint: "چیدمان", ratio: "4:5" },
    ],
  },
  {
    id: "realestate-prime",
    trade: "realestate",
    label: "املاک — اعتماد و ارتفاع",
    html: realestatePrime,
    palette: { primary: "#2fae8f", secondary: "#b8893a" },
    images: [
      { key: "hero", label: "ملک شاخص (بالای صفحه)", hint: "قاب قوسی بزرگ — نمای یک ساختمان یا ویلا", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "دفتر یا نمای ساختمان", ratio: "4:5" },
      { key: "g1", label: "گالری — آپارتمان", hint: "آپارتمان", ratio: "4:5" },
      { key: "g2", label: "گالری — ویلا", hint: "ویلا", ratio: "4:5" },
      { key: "g3", label: "گالری — نمای ساختمان", hint: "نمای ساختمان", ratio: "4:5" },
      { key: "g4", label: "گالری — دفتر", hint: "دفتر", ratio: "4:5" },
    ],
  },
  {
    id: "law-prime",
    trade: "law",
    label: "وکالت — وقار و اعتماد",
    html: lawPrime,
    palette: { primary: "#b08a4a", secondary: "#2a3b66" },
    images: [
      { key: "hero", label: "تصویر شاخص (بالای صفحه)", hint: "قاب قوسی بزرگ — دفتر یا کتابخانه", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "وکیل یا فضای دفتر", ratio: "4:5" },
      { key: "g1", label: "گالری — دفتر", hint: "دفتر", ratio: "4:5" },
      { key: "g2", label: "گالری — کتابخانه", hint: "کتابخانه", ratio: "4:5" },
      { key: "g3", label: "گالری — اتاق مشاوره", hint: "اتاق مشاوره", ratio: "4:5" },
      { key: "g4", label: "گالری — پذیرش", hint: "پذیرش", ratio: "4:5" },
    ],
  },
  {
    id: "language-prime",
    trade: "language",
    label: "آموزشگاه زبان — پویا و رنگارنگ",
    html: languagePrime,
    palette: { primary: "#5b4bff", secondary: "#ff6b6b" },
    images: [
      { key: "hero", label: "تصویر شاخص (بالای صفحه)", hint: "قاب بزرگ بالای صفحه — کلاس یا زبان‌آموزان", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "کلاس درس یا مدرس", ratio: "4:5" },
      { key: "g1", label: "گالری — کلاس", hint: "کلاس", ratio: "4:5" },
      { key: "g2", label: "گالری — مکالمه‌ی گروهی", hint: "مکالمه‌ی گروهی", ratio: "4:5" },
      { key: "g3", label: "گالری — کتابخانه", hint: "کتابخانه", ratio: "4:5" },
      { key: "g4", label: "گالری — پذیرش", hint: "پذیرش", ratio: "4:5" },
    ],
  },
  {
    id: "music-prime",
    trade: "music",
    label: "آموزشگاه موسیقی — گرم و الهام‌بخش",
    html: musicPrime,
    palette: { primary: "#f5a524", secondary: "#7c3aed" },
    images: [
      { key: "hero", label: "تصویر شاخص (بالای صفحه)", hint: "قاب گرد بزرگ — ساز یا هنرجو در حال نواختن", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "کلاس یا سالن تمرین", ratio: "4:5" },
      { key: "g1", label: "گالری — کلاس ساز", hint: "کلاس ساز", ratio: "4:5" },
      { key: "g2", label: "گالری — سالن تمرین", hint: "سالن تمرین", ratio: "4:5" },
      { key: "g3", label: "گالری — سازها", hint: "سازها", ratio: "4:5" },
      { key: "g4", label: "گالری — اجرا", hint: "اجرا", ratio: "4:5" },
    ],
  },
  {
    id: "travel-prime",
    trade: "travel",
    label: "تور و مسافرت — آسمان و افق",
    html: travelPrime,
    palette: { primary: "#ff7a3d", secondary: "#1d8fe6" },
    images: [
      { key: "hero", label: "مقصد شاخص (بالای صفحه)", hint: "قاب قوسی بزرگ — منظره‌ی یک مقصد دلنشین", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "دفتر یا تیم مشاوره", ratio: "4:5" },
      { key: "g1", label: "گالری — ساحل", hint: "ساحل", ratio: "4:5" },
      { key: "g2", label: "گالری — کوهستان", hint: "کوهستان", ratio: "4:5" },
      { key: "g3", label: "گالری — شهر تاریخی", hint: "شهر تاریخی", ratio: "4:5" },
      { key: "g4", label: "گالری — هتل", hint: "هتل", ratio: "4:5" },
    ],
  },
  {
    id: "hotel-prime",
    trade: "hotel",
    label: "هتل — آرام و لوکس",
    html: hotelPrime,
    palette: { primary: "#0e5a5f", secondary: "#b6914a" },
    images: [
      { key: "hero", label: "نمای شاخص (بالای صفحه)", hint: "قاب قوسی بزرگ — نمای هتل یا لابی", ratio: "1:1" },
      { key: "about", label: "درباره‌ی ما", hint: "لابی یا پذیرش", ratio: "4:5" },
      { key: "g1", label: "گالری — لابی", hint: "لابی", ratio: "4:5" },
      { key: "g2", label: "گالری — اتاق", hint: "اتاق", ratio: "4:5" },
      { key: "g3", label: "گالری — صبحانه", hint: "صبحانه", ratio: "4:5" },
      { key: "g4", label: "گالری — نما", hint: "نمای هتل", ratio: "4:5" },
    ],
  },
];

export function templatesForTrade(tradeId: string): SiteTemplate[] {
  return TEMPLATES.filter((t) => t.trade === tradeId);
}

/** A specific template, or a random one of the trade when none is chosen. */
export function pickTemplate(tradeId: string, templateId?: string): SiteTemplate | null {
  const list = templatesForTrade(tradeId);
  if (list.length === 0) return null;
  if (templateId) return list.find((t) => t.id === templateId) ?? null;
  return list[Math.floor(Math.random() * list.length)];
}

/** The cinematic templates (GSAP + Motion): the «lux» engine ones plus the
 *  three hand-built ones. Automatic site builds prefer these. */
const PREMIUM_IDS = new Set(["perfume-noir", "boutique-atelier", "bookstore-barg"]);
export function isPremiumTemplate(id: string): boolean {
  return id.endsWith("-lux") || PREMIUM_IDS.has(id);
}

/** A random template out of all templates of the given trades — a premium
 *  (cinematic) one whenever the trade has one. */
export function pickTemplateAmong(tradeIds: string[]): SiteTemplate | null {
  const list = TEMPLATES.filter((t) => tradeIds.includes(t.trade));
  if (list.length === 0) return null;
  const premium = list.filter((t) => isPremiumTemplate(t.id));
  const pool = premium.length ? premium : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** The trade id of a template (to know which features the site can have). */
export function tradeOfTemplate(templateId?: string | null): string | undefined {
  return TEMPLATES.find((t) => t.id === templateId)?.trade;
}

/** The template's own main color (what its buttons / add-ons should match). */
export function mainColorOfTemplate(templateId?: string | null): string | undefined {
  const t = TEMPLATES.find((x) => x.id === templateId);
  return t?.palette?.primary;
}

/** Templates whose menu can be edited from the «سایت‌های خصوصی» tab. */
export function hasMenuFor(templateId?: string | null): boolean {
  return !!TEMPLATES.find((t) => t.id === templateId)?.menu;
}

/** Which template a private site came from. Sites built before the template id
 *  was stored are recognised by the «label» their note always contains. */
export function templateIdOfSite(site: { template_id?: string; note?: string }): string | undefined {
  if (site.template_id) return site.template_id;
  const label = site.note?.match(/«([^»]+)»/)?.[1];
  return label ? TEMPLATES.find((tpl) => tpl.label === label)?.id : undefined;
}

/** The photo spots of a template (empty when it needs none). */
export function imageSlotsFor(templateId?: string | null): ImageSlot[] {
  return TEMPLATES.find((t) => t.id === templateId)?.images ?? [];
}

/** Metadata only (safe to hand to a client component). */
export function templateOptions() {
  return TEMPLATES.map((t) => ({
    id: t.id,
    trade: t.trade,
    label: t.label,
    primary: t.palette?.primary ?? null,
    secondary: t.palette?.secondary ?? null,
  }));
}
