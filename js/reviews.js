/* ============================================================
   تعليقات العملاء — Supabase (بدون سيرفر خلفي)
   ------------------------------------------------------------
   📌 القراءة: التعليقات المعتمدة فقط (approved = true)
   📌 الكتابة: أي زائر يضيف تعليق بقيمة approved = false
      ولا يمكنه تمرير approved = true من الواجهة.
   🛡️ الحماية: كل النصوص تُعرض بـ textContent (ضد XSS)
   ============================================================ */

const REVIEWS_API = "https://jkhifxghplbtqjemkqht.supabase.co/rest/v1/reviews";
const REVIEWS_KEY = "sb_publishable_uX0YrW-iQczI10TA8lD-ig_pUXP5ypS";
const REVIEWS_LIMIT = 50;

const rvForm    = document.getElementById("reviewForm");
const rvName    = document.getElementById("rvName");
const rvCountry = document.getElementById("rvCountry");
const rvGov     = document.getElementById("rvGov");
const rvComment = document.getElementById("rvComment");
const rvSubmit  = document.getElementById("rvSubmit");
const rvMsgEl   = document.getElementById("rvMsg");
const rvList    = document.getElementById("liveReviews");
const rvStatic  = document.getElementById("featuredReviews");

let rvBusy = false;

/* ---------- رسائل الحالة ---------- */
function setRvMsg(text, isError) {
  if (!rvMsgEl) return;
  rvMsgEl.textContent = text || "";
  rvMsgEl.classList.toggle("err", !!isError);
  rvMsgEl.classList.toggle("ok", !isError && !!text);
}

/* ---------- جلب التعليقات المعتمدة ---------- */
async function loadReviews() {
  if (!rvList) return;
  try {
    const res = await fetch(
      REVIEWS_API +
        "?select=name,comment,country,governorate,created_at" +
        "&approved=eq.true" +
        "&order=created_at.desc" +
        "&limit=" + REVIEWS_LIMIT,
      { headers: { apikey: REVIEWS_KEY, Accept: "application/json" }, cache: "no-store" }
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    renderReviews(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error("تعذر تحميل التعليقات:", err);
  }
}

/* ---------- عرض التعليقات بأمان (بدون HTML خام) ---------- */
function renderReviews(rows) {
  if (!rvList) return;
  rvList.textContent = "";

  if (!rows.length) {
    if (rvStatic) rvStatic.hidden = false;
    rvList.hidden = true;
    return;
  }
  if (rvStatic) rvStatic.hidden = true;
  rvList.hidden = false;

  rows.forEach(function (r) {
    const card = document.createElement("div");
    card.className = "review";

    const stars = document.createElement("div");
    stars.className = "stars";
    stars.textContent = "★★★★★";
    card.appendChild(stars);

    const text = document.createElement("p");
    text.textContent = r.comment || "";
    card.appendChild(text);

    const who = document.createElement("div");
    who.className = "who";

    const av = document.createElement("span");
    av.className = "av";
    const displayName = (r.name || "؟").trim();
    av.textContent = displayName.charAt(0);
    who.appendChild(av);

    const info = document.createElement("div");
    const b = document.createElement("b");
    b.textContent = displayName;
    info.appendChild(b);

    const place = [r.governorate, r.country].filter(Boolean).join("، ");
    if (place) {
      const loc = document.createElement("span");
      loc.textContent = place;
      info.appendChild(loc);
    }

    who.appendChild(info);
    card.appendChild(who);
    rvList.appendChild(card);
  });
}

/* ---------- إرسال تعليق جديد ---------- */
if (rvForm) {
  rvForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (rvBusy) return;

    const name    = (rvName.value || "").trim();
    const comment = (rvComment.value || "").trim();
    const country = (rvCountry.value || "").trim();
    const gov     = (rvGov.value || "").trim();

    if (name.length < 2 || name.length > 60) {
      setRvMsg("الاسم لازم يكون من 2 إلى 60 حرف.", true);
      rvName.focus();
      return;
    }
    if (comment.length < 3 || comment.length > 1000) {
      setRvMsg("التعليق لازم يكون من 3 إلى 1000 حرف.", true);
      rvComment.focus();
      return;
    }

    rvBusy = true;
    const originalLabel = rvSubmit.textContent;
    rvSubmit.disabled = true;
    rvSubmit.textContent = "جاري الإرسال...";
    setRvMsg("");

    try {
      const res = await fetch(REVIEWS_API, {
        method: "POST",
        headers: {
          apikey: REVIEWS_KEY,
          Authorization: "Bearer " + REVIEWS_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          name: name,
          comment: comment,
          country: country || null,
          governorate: gov || null,
          approved: false
        })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);

      rvForm.reset();
      setRvMsg("تم إرسال تعليقك، هيظهر بعد المراجعة", false);
      loadReviews();
    } catch (err) {
      console.error("تعذر إرسال التعليق:", err);
      setRvMsg("حصلت مشكلة في الإرسال، جربي تاني بعد شوية.", true);
    } finally {
      rvBusy = false;
      rvSubmit.disabled = false;
      rvSubmit.textContent = originalLabel;
    }
  });
}

/* ---------- التحديث التلقائي للزوار ---------- */
if (rvList) {
  loadReviews();
  setInterval(loadReviews, 60000);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) loadReviews();
  });
}
