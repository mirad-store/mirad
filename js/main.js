/* ================= منطق الموقع — ميراد ================= */

const WA_NUMBER   = STORE.whatsapp;
const CART_KEY    = "mirad_cart_v1";
const money       = n => n.toLocaleString("en-US") + " ج.م";
const catName     = id => (CATEGORIES.find(c => c.id === id) || {}).name || "";
const getProduct  = id => PRODUCTS.find(p => p.id === id);
const minPrice    = p => p.variants ? Math.min(...p.variants.map(v => v.price)) : p.price;
const maxPrice    = p => p.variants ? Math.max(...p.variants.map(v => v.price)) : p.price;
const waLink      = txt => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(txt)}`;

/* ---------- المحافظات والشحن ---------- */
const GOVERNORATES = [
  "القليوبية", "القاهرة", "الجيزة", "الإسكندرية",
  "الشرقية", "الدقهلية", "الغربية", "المنوفية", "البحيرة", "كفر الشيخ",
  "دمياط", "بورسعيد", "الإسماعيلية", "السويس", "الفيوم", "بنى سويف",
  "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "الأسوان",
  "البحر الأحمر", "مطروح", "شمال سيناء", "جنوب سيناء", "الوادي الجديد",
];

function shippingFor(city, subtotal) {
  if (SHIPPING.freeOver > 0 && subtotal >= SHIPPING.freeOver) return 0;
  return city === "القليوبية" ? SHIPPING.qalyubia : SHIPPING.cost;
}

/* ---------- السلة (localStorage) ---------- */
function getCart()    { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(c)  { localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartBadge(); }
function cartCount()  { return getCart().reduce((s, i) => s + i.qty, 0); }
function cartTotal()  { return getCart().reduce((s, i) => s + i.price * i.qty, 0); }

function updateCartBadge() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const n = cartCount();
  el.textContent = n;
  el.classList.toggle("show", n > 0);
}

function addToCart(id, size, price, qty = 1) {
  const cart = getCart();
  const key  = p => p.id === id && p.size === size;
  const item = cart.find(key);
  item ? (item.qty += qty) : cart.push({ id, size, price, qty });
  saveCart(cart);
  toast(`✅ تم إضافة «${getProduct(id).name}» للسلة`);
}

function changeQty(id, size, delta) {
  let cart = getCart();
  const item = cart.find(p => p.id === id && p.size === size);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(p => !(p.id === id && p.size === size));
  saveCart(cart);
  if (location.pathname.includes("cart")) renderCartPage();
}

function removeItem(id, size) {
  saveCart(getCart().filter(p => !(p.id === id && p.size === size)));
  if (location.pathname.includes("cart")) renderCartPage();
}

/* ---------- إشعارات ---------- */
let toastTimer;
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- كروت المنتجات ---------- */
function productCard(p) {
  const old = p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : "";
  const badge = p.badge ? `<span class="badge">${p.badge}</span>` : "";
  const priceTxt = p.variants ? `يبدأ من ${money(minPrice(p))}` : money(p.price);
  return `
  <article class="p-card">
    <a href="product.html?id=${p.id}" class="p-img">
      ${badge}
      <img src="${p.image}" alt="${p.name}" loading="lazy">
    </a>
    <div class="p-body">
      <span class="p-cat">${catName(p.cat)}</span>
      <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <p class="p-desc">${p.desc.length > 78 ? p.desc.slice(0, 78) + "…" : p.desc}</p>
      <div class="p-foot">
        <div class="p-price">${priceTxt} ${old}</div>
        <div class="p-actions">
          <a class="icon-link" href="product.html?id=${p.id}" title="تفاصيل">👁</a>
          <button class="btn btn-sm" onclick="quickAdd('${p.id}')">+ أضف للسلة</button>
        </div>
      </div>
    </div>
  </article>`;
}

function quickAdd(id) {
  const p = getProduct(id);
  const v = p.variants ? p.variants[0] : null;
  addToCart(id, v ? v.size : "حجم واحد", v ? v.price : p.price, 1);
}

function renderProducts(selector, filter = null, limit = 0) {
  const el = document.querySelector(selector);
  if (!el) return;
  let items = PRODUCTS.filter(filter || (() => true));
  if (limit) items = items.slice(0, limit);
  el.innerHTML = items.map(productCard).join("") || `<p class="empty">لا توجد منتجات حالياً 🙂</p>`;
}

/* ---------- فلترة صفحة المتجر ---------- */
function filterShop(catId, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderProducts("#shopGrid", catId === "all" ? null : p => p.cat === catId);
}

/* ---------- صفحة المنتج الواحد ---------- */
function renderProductPage() {
  const wrap = document.getElementById("productPage");
  if (!wrap) return;
  const p = getProduct(new URLSearchParams(location.search).get("id"));
  if (!p) {
    wrap.innerHTML = `<div class="empty-page"><h2>المنتج غير موجود 😅</h2><a class="btn" href="shop.html">تصفح المنتجات</a></div>`;
    return;
  }
  document.title = `${p.name} | ميراد`;
  const old     = p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : "";
  const variants = p.variants
    ? p.variants.map((v, i) => `
        <label class="chip">
          <input type="radio" name="variant" value="${i}" ${i === 0 ? "checked" : ""}>
          <span>${v.size} — <b>${money(v.price)}</b></span>
        </label>`).join("")
    : "";

  wrap.innerHTML = `
    <div class="detail-gallery">
      <img src="${p.image}" alt="${p.name}">
    </div>
    <div class="detail-info">
      <span class="p-cat">${catName(p.cat)}</span>
      <h1>${p.name}</h1>
      <div class="detail-price"><span id="dPrice">${money(minPrice(p))}</span> ${old}</div>
      <p class="detail-desc">${p.desc}</p>
      ${variants ? `<div class="variants" id="dVariants">${variants}</div>` : ""}
      <div class="qty-row">
        <span>الكمية:</span>
        <div class="stepper">
          <button type="button" onclick="dQty(-1)">−</button>
          <input id="dQtyInput" type="number" value="1" min="1">
          <button type="button" onclick="dQty(1)">+</button>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn" onclick="detailAdd('${p.id}')">🛒 أضف للسلة</button>
        <button class="btn btn-wa" onclick="detailBuy('${p.id}')">طلب مباشر عبر واتساب</button>
      </div>
      <div class="trust-mini">
        ✅ دفع عند الاستلام &nbsp;·&nbsp; 🚚 شحن 100 ج.م (القليوبية 60 ج.م) &nbsp;·&nbsp; 🔄 استرجاع خلال 14 يوم
      </div>
    </div>`;
  if (p.variants) {
    wrap.querySelectorAll('input[name="variant"]').forEach(r =>
      r.addEventListener("change", e => {
        document.getElementById("dPrice").textContent = money(p.variants[e.target.value].price);
      })
    );
  }
}

function currentDetail(id) {
  const p    = getProduct(id);
  const qty  = Math.max(1, +document.getElementById("dQtyInput").value || 1);
  let size, price;
  if (p.variants) {
    const r = document.querySelector('input[name="variant"]:checked');
    ({ size, price } = p.variants[r ? r.value : 0]);
  } else { size = "حجم واحد"; price = p.price; }
  return { p, size, price, qty };
}

function detailAdd(id) {
  const { size, price, qty } = currentDetail(id);
  addToCart(id, size, price, qty);
}

function detailBuy(id) {
  const { p, size, price, qty } = currentDetail(id);
  const msg =
`🌿 طلب من متجر ميراد
━━━━━━━━
• ${p.name}${size !== "حجم واحد" ? ` (${size})` : ""} × ${qty} = ${money(price * qty)}
━━━━━━━━
الإجمالي: ${money(price * qty)} (يضاف الشحن)`;
  window.open(waLink(msg), "_blank");
}

/* ---------- صفحة السلة ---------- */
function renderCartPage() {
  const box = document.getElementById("cartBox");
  if (!box) return;
  const cart = getCart();

  if (!cart.length) {
    box.innerHTML = `<div class="empty-page"><p>🛒 سلتك فاضية دلوقتي</p><a class="btn" href="shop.html">ابدأ التسوق</a></div>`;
    document.getElementById("cartSummaryBox").innerHTML = "";
    const f = document.getElementById("checkoutForm");
    if (f) f.style.display = "none";
    return;
  }

  box.innerHTML = cart.map(i => {
    const p = getProduct(i.id);
    return `
    <div class="cart-item">
      <img src="${p.image}" alt="${p.name}">
      <div class="ci-info">
        <h4><a href="product.html?id=${p.id}">${p.name}</a></h4>
        ${i.size !== "حجم واحد" ? `<span class="ci-size">${i.size}</span>` : ""}
        <div class="ci-price">${money(i.price)}</div>
      </div>
      <div class="stepper">
        <button onclick="changeQty('${i.id}','${i.size}',-1)">−</button>
        <span>${i.qty}</span>
        <button onclick="changeQty('${i.id}','${i.size}',1)">+</button>
      </div>
      <div class="ci-total">${money(i.price * i.qty)}</div>
      <button class="ci-remove" onclick="removeItem('${i.id}','${i.size}')" title="إزالة">🗑</button>
    </div>`;
  }).join("");

  const total = cartTotal();
  const city  = document.getElementById("fCity") ? document.getElementById("fCity").value : "";
  const free  = SHIPPING.freeOver > 0 && total >= SHIPPING.freeOver;
  const ship  = shippingFor(city, total);
  const freeNote = SHIPPING.freeOver > 0
    ? (free ? `<div class="free-note">🎉 مبروك! شحنك مجاني</div>`
            : `<div class="free-note">أضف ${money(SHIPPING.freeOver - total)} المزيد واحصل على شحن مجاني 🚚</div>`)
    : "";

  document.getElementById("cartSummaryBox").innerHTML = `
    <div class="s-row"><span>المجموع</span><b>${money(total)}</b></div>
    <div class="s-row"><span>الشحن</span><b>${ship === 0 ? "مجاني" : money(ship)}</b></div>
    <div class="s-row total"><span>الإجمالي</span><b>${money(total + ship)}</b></div>
    ${freeNote}`;

  const form = document.getElementById("checkoutForm");
  if (form) form.style.display = "block";
}

function checkoutWA(ev) {
  ev.preventDefault();
  const cart = getCart();
  if (!cart.length) return toast("سلتك فاضية 🙂");

  const name    = document.getElementById("fName").value.trim();
  const phone   = document.getElementById("fPhone").value.trim();
  const city    = document.getElementById("fCity").value.trim();
  const address = document.getElementById("fAddress").value.trim();
  const notes   = document.getElementById("fNotes").value.trim();

  if (!name || !phone || !city || !address) return toast("من فضلك اكمل بيانات الشحن 🙏");

  const total = cartTotal();
  const free  = SHIPPING.freeOver > 0 && total >= SHIPPING.freeOver;
  const ship  = shippingFor(city, total);

  let msg = `🌿 طلب جديد — متجر ميراد\n━━━━━━━━━\n`;
  cart.forEach((i, n) => {
    msg += `${n + 1}) ${getProduct(i.id).name}${i.size !== "حجم واحد" ? ` (${i.size})` : ""} × ${i.qty} = ${money(i.price * i.qty)}\n`;
  });
  msg += `━━━━━━━━━\n`
      +  `المجموع: ${money(total)}\n`
      +  `الشحن: ${ship === 0 ? "مجاني 🎉" : money(ship)}\n`
      +  `*الإجمالي: ${money(total + ship)}*\n`
      +  `━━━━━━━━━\n`
      +  `👤 الاسم: ${name}\n📞 الهاتف: ${phone}\n🏙️ المحافظة: ${city}\n📍 العنوان: ${address}\n`
      +  (notes ? `📝 ملاحظات: ${notes}\n` : "");

  window.open(waLink(msg), "_blank");
  toast("جارِ فتح واتساب… أرسل الرسالة لتأكيد الطلب ✅");
}

/* ---------- قائمة المحافظات (صفحة السلة) ---------- */
function populateCities() {
  const sel = document.getElementById("fCity");
  if (!sel || sel.options.length) return;
  sel.innerHTML =
    `<option value="" disabled selected>اختر محافظتك…</option>` +
    GOVERNORATES.map(c => `<option value="${c}">${c}</option>`).join("");
  sel.addEventListener("change", () => {
    if (location.pathname.includes("cart")) renderCartPage();
  });
}

/* ---------- نموذج تواصل → واتساب ---------- */
function contactWA(ev) {
  ev.preventDefault();
  const name = document.getElementById("cName").value.trim();
  const body = document.getElementById("cMsg").value.trim();
  if (!body) return toast("اكتب رسالتك أولاً 🙂");
  const msg = `مرحباً ميراد 👋\n${name ? "أنا " + name + "\n" : ""}${body}`;
  window.open(waLink(msg), "_blank");
}

/* ---------- القائمة على الموبايل ---------- */
function toggleMenu() {
  document.getElementById("mainNav").classList.toggle("open");
}

/* ---------- عند تحميل أي صفحة ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderProductPage();
  if (location.pathname.includes("cart")) {
    populateCities();
    renderCartPage();
  }
  renderProducts("#featured", p => p.featured, 8);
  renderProducts("#shopGrid");
});
