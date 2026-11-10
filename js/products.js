/* ============================================================
   ملف المنتجات — متجر ميراد mirad
   ------------------------------------------------------------
   ✏️ لإضافة منتج جديد: انسخ أي كتلة بين { } وعدّل بياناتها
   📸 الصورة: ضعها في مجلد images ثم اكتب اسمها في "image"
   🏷️ variants: الأوزان/الأحجام والأسعار — لو المنتج سعر واحد
      فقط سيب variants = null
   ⭐ featured: true = يظهر في الرئيسية
   🔖 badge: "الأكثر مبيعاً" / "جديد" / "خصم" ... أو ""
   ============================================================ */

const STORE = {
  name: "ميراد",
  nameEn: "Mirad",
  whatsapp: "201107125799", // رقم واتساب بصيغة دولية
  tagline: "الأعشاب الطبيعية الفاخرة",
};

/* ⚙️ إعدادات الشحن — عدّل الأرقام حسب رغبتك */
const SHIPPING = {
  cost: 100,        // سعر الشحن لكل المحافظات
  qalyubia: 60,     // سعر الشحن الخاص لمحافظة القليوبية
  freeOver: 1000,   // شحن مجاني للأوردرات فوق هذا المبلغ (0 = بدون مجاني)
};

const CATEGORIES = [
  { id: "hair", name: "العناية بالشعر" },
  { id: "body", name: "العناية بالبشرة والجسم" },
];

const PRODUCTS = [
  {
    id: "jodour",
    name: "خلطة جذور العشبية",
    cat: "hair",
    badge: "الأكثر طلباً",
    featured: true,
    image: "images/jodour.jpg",
    price: 60,
    oldPrice: null,
    variants: [{ size: "10جم", price: 60 }],
    desc: "تركيبة استثنائية مركزة من 22 عشبة مصرية وعربية وهندية، مخصصة لعلاج تساقط الشعر، تحفيز إنبات الفراغات، وتغذية الجذور.",
  },
  {
    id: "joasha",
    name: "جواشا الوجه الطبيعية",
    cat: "body",
    badge: "الأكثر مبيعاً",
    featured: true,
    image: "images/joasha.jpg",
    price: 500,
    oldPrice: null,
    variants: null,
    desc: "أداة تدليك وتنحيف الوجه المصنوعة من الأحجار الطبيعية، لتعزيز الدورة الدموية وتحفيز الكولاجين ونحت ملامح الوجه بطريقة آمنة.",
  },
  {
    id: "sidr",
    name: "عشبة السدر المصري الفاخر",
    cat: "hair",
    badge: "",
    featured: true,
    image: "images/sidr.jpg",
    price: 185,
    oldPrice: null,
    variants: [
      { size: "125جم", price: 185 },
      { size: "200جم", price: 300 },
      { size: "300جم", price: 450 },
    ],
    desc: "بديل طبيعي للشامبو يعمل على تطهير فروة الرأس من الدهون، تكثيف الشعر وتقوية جذوره، مع مكافحة القشرة والتقصف.",
  },
  {
    id: "mashat-brown",
    name: "المشاط البني الفاخر",
    cat: "hair",
    badge: "فاخر",
    featured: true,
    image: "images/mashat-brown.jpg",
    price: 280,
    oldPrice: null,
    variants: [
      { size: "125جم", price: 280 },
      { size: "200جم", price: 450 },
      { size: "300جم", price: 675 },
    ],
    desc: "خلطة أعشاب مركزة لتنعيم الشعر وفرد الهيشان طبيعياً، ترميم الأطراف المتقصفة وتكثيف البصيلات، وآمنة تماماً على الشعر المصبوغ.",
  },
  {
    id: "henna",
    name: "الحناء الأسواني الفاخرة",
    cat: "hair",
    badge: "",
    featured: true,
    image: "images/henna.jpg",
    price: 125,
    oldPrice: null,
    variants: [
      { size: "125جم", price: 125 },
      { size: "200جم", price: 200 },
      { size: "300جم", price: 300 },
    ],
    desc: "حناء سوداني/أسواني نقية 100% لتغذية وتقوية الشعر وتطهير الفروة، مع إعطاء لون نحاسي/أحمر دافئ بدون أي مواد كيميائية.",
  },
  {
    id: "zait",
    name: "زيت وهيبة الطبيعي للشعر",
    cat: "hair",
    badge: "",
    featured: true,
    image: "images/zait.jpg",
    price: 150,
    oldPrice: null,
    variants: null,
    desc: "زيت علاجي طبيعي لتغذية وتقوية الجذور، تثبيت البصيلات، وتحفيز نمو الشعر لملء الفراغات ومنح لمسة نعومة دون إثقال.",
  },
  {
    id: "mashat-green",
    name: "المشاط الأخضر الفاخر",
    cat: "hair",
    badge: "",
    featured: false,
    image: "images/mashat-green.jpg",
    price: 95,
    oldPrice: null,
    variants: [
      { size: "65جم", price: 95 },
      { size: "300جم", price: 450 },
    ],
    desc: "سر الشعر القوي والطويل؛ مزيج عشبي ينشط الفروة، يقلل التساقط والهيشان، ويغلف الشعر بعطر طبيعي هادئ ومميز.",
  },
  {
    id: "taj",
    name: "تاج الأعشاب الفاخر",
    cat: "hair",
    badge: "",
    featured: false,
    image: "images/taj.jpg",
    price: 90,
    oldPrice: null,
    variants: [
      { size: "50جم", price: 90 },
      { size: "100جم", price: 180 },
    ],
    desc: "المزيج الملكي من الأعشاب النادرة (نعناع فلفلي، ورد، عرق سوس) يُغلى ليُعجن به السدر أو الحناء لمضاعفة النتائج والتعطير.",
  },
  {
    id: "sigala",
    name: "الصقلة المصرية للجسم",
    cat: "body",
    badge: "جديد",
    featured: false,
    image: "images/sigala.jpg",
    price: 70,
    oldPrice: null,
    variants: [
      { size: "30جم", price: 70 },
      { size: "80جم", price: 120 },
    ],
    desc: "خلطة سرية فاخرة من الورد، الريحان، اليانسون وعرق السوس للتبريمة والتنظيف العميق للجلد، تمنح الجسم استرخاءً وعطراً يدوم.",
  },
];
