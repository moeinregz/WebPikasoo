// English stock-photo search phrases for each image slot of the seed
// articles, in the same order as the `![alt](/blog-placeholder.svg)` lines
// in each article. Each phrase describes the same thing as that image's alt
// text. fillSeedArticlePhotos (lib/db.ts) swaps the placeholders for Pexels
// photos once PEXELS_API_KEY is set; slots without a match keep the placeholder.
export const PHOTO_QUERIES: Record<string, string[]> = {
  "هزینه-طراحی-سایت": ["website design budget calculator desk", "responsive website on laptop and phone", "small business owner planning budget laptop", "comparing price quotes documents"],
  "ساخت-سایت-رایگان": ["website builder drag and drop laptop", "comparing website templates on screen", "professional business website on laptop", "moving boxes office upgrade"],
  "چگونه-سایت-بسازیم": ["web design sketch wireframe notebook", "ui designer working on website layout", "web developer fixing website laptop"],
  "سئو-سایت-چیست": ["google search results on laptop", "mobile website speed smartphone", "website analytics dashboard charts"],
  "آموزش-سئو": ["learning seo notebook laptop", "website page structure headings screen", "seo report graph growth"],
  "خرید-دامنه": ["domain name brainstorming notebook", "website address bar browser", "typing on laptop registration form"],
  "خرید-هاست": ["server room data center", "data backup security server", "fast internet server network cables"],
  "وردپرس-چیست": ["wordpress dashboard laptop", "blogger writing on laptop cafe", "custom web development code screen"],
  "آموزش-وردپرس": ["beginner learning computer at home", "writing blog post editor laptop", "website performance optimization laptop"],
  "راه-اندازی-فروشگاه-اینترنتی": ["online store shopping on laptop", "product photography small business", "packing online orders boxes"],
  "درگاه-پرداخت-اینترنتی": ["online payment credit card laptop", "mobile payment smartphone checkout", "cafe owner card payment terminal"],
  "نماد-اعتماد-الکترونیکی": ["online shopping trust secure checkout", "business documents registration desk", "happy customer online shopping"],
  "سایت-شرکتی": ["corporate office team meeting", "company website on desktop monitor", "accessible web design laptop office"],
  "انتخاب-شرکت-طراحی-سایت": ["web design agency team meeting", "designer showing portfolio on tablet", "signing contract business handshake"],
  "سایت-ساز": ["no code website builder screen", "frustrated person laptop limitation", "website migration planning team"],
  "طراحی-سایت-ریسپانسیو": ["responsive design devices phone tablet laptop", "mobile first design smartphone sketch", "optimizing images on smartphone screen"],
  "طراحی-رابط-کاربری": ["ui ux designer working on interface", "user interface layout design screen", "usability testing user with laptop"],
  "افزایش-سرعت-سایت": ["fast loading website speedometer laptop", "website cache optimization code", "project roadmap planning sticky notes"],
  "تحقیق-کلمات-کلیدی": ["keyword research on laptop notes", "competitor analysis charts desk", "topic cluster mind map"],
  "ثبت-مکان-در-گوگل-مپ": ["local shop storefront map smartphone", "smartphone map location business", "business insights analytics phone"],
  "بک-لینک": ["chain links connection concept", "networking collaboration websites concept", "link analysis report laptop"],
  "تولید-محتوا": ["content writing laptop coffee", "blog article layout reading tablet", "writer editing article draft"],
  "کسب-و-کار-اینترنتی": ["online business entrepreneur laptop home", "startup planning whiteboard", "customer data security lock laptop"],
  "منوی-دیجیتال": ["restaurant table qr code menu", "cafe customer looking at phone menu", "restaurant food plate photography"],
  "نوبت-دهی-اینترنتی": ["clinic reception appointment", "booking appointment on smartphone", "online calendar scheduling laptop"],
  "پشتیبانی-سایت": ["it support technician computer", "cloud backup data storage", "cyber security monitoring screens"],
  "گواهی-ssl": ["https padlock browser security", "digital certificate security concept", "server security configuration code"],
  "سرچ-کنسول": ["website performance report analytics laptop", "website pages indexing spreadsheet", "seo keyword ranking chart"],
  "دیجیتال-مارکتینگ": ["digital marketing team planning", "social media marketing smartphone", "brand identity color palette design"],
  "طراحی-سایت-با-هوش-مصنوعی": ["artificial intelligence computer screen", "person reviewing ai generated design", "creative team working together office"],
};
