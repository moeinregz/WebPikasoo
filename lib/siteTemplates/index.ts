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

export const TEMPLATES: SiteTemplate[] = [
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

/** A random template out of all templates of the given trades. */
export function pickTemplateAmong(tradeIds: string[]): SiteTemplate | null {
  const list = TEMPLATES.filter((t) => tradeIds.includes(t.trade));
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
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
