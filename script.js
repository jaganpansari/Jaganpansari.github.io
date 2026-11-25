import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const fbApp = initializeApp({
  apiKey: "AIzaSyCKehFeTicictV33BDMrdAy_f_o020ol38",
  authDomain: "ratelist-3daf3.firebaseapp.com",
  projectId: "ratelist-3daf3",
  storageBucket: "ratelist-3daf3.firebasestorage.app",
  messagingSenderId: "968621759586",
  appId: "1:968621759586:web:2a091da0c431f99afb453b"
});
const auth = getAuth(fbApp);
const db = initializeFirestore(fbApp, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

/* ===== सेटिंग और भाषा ===== */
const $ = (id) => document.getElementById(id);
const S = Object.assign({ theme: "orange", dark: false, cur: "₹", font: 16, bold: false, showPct: true, dual: false, sort: "az", shop: "मेरी दुकान", pin: "", lang: "hi" }, JSON.parse(localStorage.getItem("rlS") || "{}"));
const saveS = () => localStorage.setItem("rlS", JSON.stringify(S));
const L = (h, e) => (S.lang === "en" ? e : h);
const THEMES = { orange: ["#f57c00", "#bf360c"], green: ["#2e7d32", "#1b5e20"], blue: ["#1565c0", "#0d47a1"], purple: ["#6a1b9a", "#4a148c"], red: ["#d32f2f", "#8e0000"] };
const UNITS = [["किलो", "Kg"], ["ग्राम", "Gram"], ["लीटर", "Litre"], ["पीस", "Piece"], ["पैकेट", "Packet"], ["दर्जन", "Dozen"], ["डिब्बा", "Box"], ["बोरी", "Bag"]];
const unitShow = (u) => { const f = UNITS.find((x) => x[0] === u); return f ? L(f[0], f[1]) : u; };
const shopShow = (n) => (n === "मेरी दुकान" ? L("मेरी दुकान", "My Shop") : n);

/* ===== डिज़ाइन ===== */
const css = document.createElement("style");
css.textContent = `
:root{--acc:#f57c00;--acc2:#bf360c;--bg:#f3f4f8;--card:#fff;--tx:#1d1d1f;--mut:#777;--fs:16px}
.dark{--bg:#121417;--card:#1e2126;--tx:#f1f1f1;--mut:#9a9a9a}
*{box-sizing:border-box;font-family:system-ui,sans-serif}
body{margin:0;background:var(--bg);color:var(--tx);font-size:var(--fs);padding-bottom:85px}
body.bold{font-weight:600}
header{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;padding:14px 16px 18px;border-radius:0 0 22px 22px;box-shadow:0 6px 18px #0003}
header h1{margin:0 0 8px;font-size:1.4em}
select,input,textarea{font-size:1em;padding:11px 12px;border-radius:12px;border:1px solid #9995;background:var(--card);color:var(--tx);width:100%}
header select{width:auto;background:#fff3;color:#fff;border:0}
header select option{color:#000}
.page{display:none;padding:12px}.page.on{display:block}
.row{display:flex;gap:8px;align-items:center}
.ibtn{flex:none;width:46px;height:46px;border-radius:12px;border:0;background:var(--card);box-shadow:0 1px 4px #0002;display:flex;align-items:center;justify-content:center;color:var(--acc)}
.micb{border-radius:50%}
.micb.sun{background:var(--acc);color:#fff;animation:pl 1s infinite}
@keyframes pl{0%{box-shadow:0 0 0 0 var(--acc)}100%{box-shadow:0 0 0 12px transparent}}
.pills{display:flex;gap:8px;overflow-x:auto;padding:10px 0}
.pill{flex:none;padding:7px 14px;border-radius:20px;border:1.5px solid #9996;background:var(--card);color:var(--tx);font-weight:600}
.pill.on{background:var(--acc);color:#fff;border-color:var(--acc);transform:scale(1.06);box-shadow:0 3px 10px #0003}
.card{background:var(--card);border-radius:18px;padding:14px 16px;margin:10px 0;box-shadow:0 2px 10px #0001;display:flex;justify-content:space-between;gap:10px;animation:up .3s}
@keyframes up{from{opacity:0;transform:translateY(8px)}}
.nm{font-size:1.15em;font-weight:700}
.tag{display:inline-block;color:#fff;padding:2px 10px;border-radius:12px;font-size:.8em;margin:4px 4px 0 0}
.size{background:#8883;color:var(--tx)}
.mut{color:var(--mut);font-size:.85em}
.sell{color:var(--acc);font-size:1.35em;font-weight:800;text-align:right;white-space:nowrap}
.pro{color:#2e7d32;font-weight:600}.loss{color:#d32f2f;font-weight:600}
.cheap{background:linear-gradient(90deg,#ffb300,#ff6f00);color:#fff;border-radius:12px;padding:2px 8px;font-size:.75em}
.btn{width:100%;padding:13px;border:0;border-radius:14px;background:var(--acc);color:#fff;font-size:1.05em;font-weight:700;margin-top:10px}
.btn2{background:var(--card);color:var(--tx);border:1.5px solid #9996}
label{display:block;margin:12px 0 5px;font-weight:600;color:var(--acc)}
.box{background:var(--card);border-radius:18px;padding:14px;margin:12px 0;box-shadow:0 2px 10px #0001}
nav{position:fixed;bottom:0;left:0;right:0;display:flex;background:var(--card);box-shadow:0 -2px 12px #0002;border-radius:20px 20px 0 0;z-index:50}
nav button{flex:1;border:0;background:none;padding:14px 0;font-size:1em;color:var(--mut);font-weight:600}
nav button.on{color:var(--acc)}
.ov{position:fixed;inset:0;background:#0008;display:none;align-items:center;justify-content:center;z-index:99}
.ov.on{display:flex}
.mbox{background:var(--card);color:var(--tx);border-radius:20px;padding:18px;width:90%;max-width:480px;max-height:85vh;overflow:auto}
.sheet{align-items:flex-end}.sheet .mbox{border-radius:22px 22px 0 0;width:100%;max-width:none}
.tarazu{font-size:64px;display:inline-block;animation:sw 1s ease-in-out infinite alternate}
@keyframes sw{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
#printArea{display:none}
@media print{body>*{display:none!important}#printArea{display:block!important;color:#000;background:#fff;padding:10px}#printArea table{width:100%;border-collapse:collapse}#printArea td,#printArea th{border:1px solid #999;padding:6px;text-align:left}}
`;
document.head.appendChild(css);

/* ===== निशान ===== */
const IC = {
  mic: '',
  scan: '',
  wa: '',
  pdf: ''
};

/* ===== पन्ने ===== */
const fld = (id, h, e, type) => ` `;
document.body.innerHTML = `
⚖️ ${L("लोड हो रहा है...", "Loading...")}

 ⚖️ Rate List
 
 
 <input id="otp" type="number" placeholder="${L("OTP डालें", "Enter OTP")}" style="margin-top:10px;display:none">
 
 

 
  
  
  
  
  
 
 
 
 
 




`;

/* ===== छोटे काम ===== */
function E(t, cls, txt, st) {
  const e = document.createElement(t);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  if (st) e.style.cssText = st;
  return e;
}
function applyS() {
  const t = THEMES[S.theme] || THEMES.orange;
  document.documentElement.style.setProperty("--acc", t[0]);
  document.documentElement.style.setProperty("--acc2", t[1]);
  document.documentElement.style.setProperty("--fs", S.font + "px");
  document.body.classList.toggle("dark", S.dark);
  document.body.classList.toggle("bold", S.bold);
}
applyS();
function closeAll() {
  let any = false;
  document.querySelectorAll("#sheet,#modal").forEach((o) => { if (o.classList.contains("on")) any = true; o.classList.remove("on"); });
  return any;
}
function go(p) {
  document.querySelectorAll(".page").forEach((x) => x.classList.toggle("on", x.id === p));
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.p === p));
  window.scrollTo(0, 0);
}
history.pushState({ rl: 1 }, "");
window.addEventListener("popstate", () => { if (!closeAll()) go("pList"); history.pushState({ rl: 1 }, ""); });
document.querySelectorAll("nav button").forEach((b) => (b.onclick = () => { if (b.dataset.p === "pAdd") clearForm(); go(b.dataset.p); }));
document.querySelectorAll(".ov").forEach((o) => o.addEventListener("click", (e) => { if (e.target === o && o.id !== "lock" && o.id !== "loader") o.classList.remove("on"); }));

let ITEMS = [], VEN = {}, CATS = [], curVen = "", curCat = "", started = false, confRes = null, filled = false;
const PAL = ["#e53935", "#8e24aa", "#1e88e5", "#00897b", "#f4511e", "#6d4c41", "#3949ab", "#7cb342", "#d81b60", "#fb8c00"];
function vColor(v) {
  if (VEN[v]) return VEN[v];
  let h = 0;
  for (const c of v || "") h = (h * 31 + c.charCodeAt(0)) % 997;
  return PAL[h % PAL.length];
}
const nm = (x) => x.Item || "";
const unitOf = (x) => unitShow(x.unit || "किलो");
const mine = (x) => (x.shop || "मेरी दुकान") === S.shop;
const money = (n) => S.cur + " " + Math.round((Number(n) || 0) * 100) / 100;
const keyOf = (x) => (nm(x) + "|" + (x.size || "") + "|" + (x.unit || "किलो")).toLowerCase();
const fullName = (x) => nm(x) + (S.dual && x.alt ? " (" + x.alt + ")" : "");

/* ===== लॉगिन ===== */
onAuthStateChanged(auth, (u) => {
  $("loader").classList.remove("on");
  if (!u) { $("app").style.display = "none"; $("login").classList.add("on"); return; }
  $("login").classList.remove("on");
  $("app").style.display = "block";
  if (S.pin) $("lock").classList.add("on");
  startData();
});
$("sendOtp").onclick = async () => {
  const n = $("phone").value.replace(/\D/g, "").replace(/^0+/, "");
  if (n.length < 6) return alert(L("सही नंबर डालें", "Enter a valid number"));
  try {
    window.rv = window.rv || new RecaptchaVerifier(auth, "recap", { size: "invisible" });
    confRes = await signInWithPhoneNumber(auth, $("cc").value + n, window.rv);
    $("otp").style.display = "block";
    $("verOtp").style.display = "block";
    alert(L("OTP भेज दिया", "OTP sent"));
  } catch (e) { alert("Error: " + e.message); }
};
$("verOtp").onclick = async () => { try { await confRes.confirm($("otp").value.trim()); } catch (e) { alert(L("OTP गलत है", "Wrong OTP")); } };
$("pinOk").onclick = () => {
  if ($("pinIn").value === S.pin) { $("lock").classList.remove("on"); $("pinIn").value = ""; }
  else alert(L("PIN गलत है", "Wrong PIN"));
};
function net() { $("net").textContent = navigator.onLine ? "🟢 " + L("ऑनलाइन", "Online") : "🔴 " + L("ऑफ़लाइन", "Offline"); }
window.addEventListener("online", net);
window.addEventListener("offline", net);
net();

/* ===== डेटा ===== */
function startData() {
  if (started) return;
  started = true;
  onSnapshot(collection(db, "shops"), (s) => {
    const names = ["मेरी दुकान", ...s.docs.map((d) => d.data().name).filter((n) => n && n !== "मेरी दुकान")];
    const sel = $("shopSel");
    sel.innerHTML = "";
    names.forEach((n) => { const o = E("option", "", shopShow(n)); o.value = n; if (n === S.shop) o.selected = true; sel.append(o); });
    const o = E("option", "", L("➕ नई दुकान", "➕ New shop")); o.value = "__new"; sel.append(o);
  });
  onSnapshot(collection(db, "vendors"), (s) => {
    VEN = {};
    s.docs.forEach((d) => { if (d.data().clr) VEN[d.id] = d.data().clr; });
    render();
  });
  onSnapshot(collection(db, "items"), (s) => {
    ITEMS = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    fillVenList();
    render();
    backfill();
  });
  onSnapshot(collection(db, "cats"), (s) => {
    CATS = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    drawCats();
    render();
  });
}
$("shopSel").onchange = async () => {
  if ($("shopSel").value === "__new") {
    const n = prompt(L("नई दुकान का नाम", "New shop name"));
    if (n && n.trim()) { S.shop = n.trim(); saveS(); await addDoc(collection(db, "shops"), { name: n.trim() }); }
    else $("shopSel").value = S.shop;
  } else { S.shop = $("shopSel").value; saveS(); }
  curVen = ""; curCat = "";
  drawCats();
  render();
};

/* ===== लिस्ट ===== */
function filtered() {
  const q = $("q").value.trim().toLowerCase();
  let a = ITEMS.filter(mine);
  if (curVen) a = a.filter((x) => (x.vendor || "—") === curVen);
  const c = CATS.find((k) => k.id === curCat);
  if (c) a = a.filter((x) => (c.items || []).includes(x.id));
  if (q) a = a.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "") + " " + (x.size || "")).toLowerCase().includes(q));
  const srt = { az: (p, r) => nm(p).localeCompare(nm(r)), new: (p, r) => (r.t || 0) - (p.t || 0), old: (p, r) => (p.t || 0) - (r.t || 0) };
  return a.sort(srt[S.sort] || srt.az);
}
function render() {
  const all = ITEMS.filter(mine);
  const vens = {}, best = {};
  all.forEach((x) => {
    const v = x.vendor || "—";
    vens[v] = (vens[v] || 0) + 1;
    (best[keyOf(x)] = best[keyOf(x)] || []).push(Number(x.buyPrice) || 0);
  });
  const vb = $("venBar");
  vb.innerHTML = "";
  const allB = E("button", "pill " + (curVen ? "" : "on"), L("सब होलसेलर", "All wholesalers") + " (" + all.length + ")");
  allB.onclick = () => { curVen = ""; render(); };
  vb.append(allB);
  Object.keys(vens).sort().forEach((v) => {
    const b = E("button", "pill " + (curVen === v ? "on" : ""));
    b.append(E("span", "", "●", "color:" + vColor(v)), " " + v + " (" + vens[v] + ")");
    b.onclick = () => { curVen = v; render(); };
    vb.append(b);
  });
  $("sortSel").value = S.sort;
  const arr = filtered();
  const Lst = $("list");
  Lst.innerHTML = "";
  if (!arr.length) Lst.append(E("div", "box", L("कोई सामान नहीं मिला", "No items found"), "text-align:center"));
  arr.forEach((x) => {
    const g = best[keyOf(x)] || [];
    const b = Number(x.buyPrice) || 0, s = Number(x.sellPrice) || 0, p = s - b;
    const cheap = g.length > 1 && b === Math.min(...g);
    const pct = b ? ((p / b) * 100).toFixed(1) : 0;
    const good = p >= 0;
    const left = E("div");
    const nmD = E("div", "nm", nm(x));
    if (S.dual && x.alt) nmD.append(" ", E("span", "mut", "(" + x.alt + ")"));
    if (cheap) nmD.append(" ", E("span", "cheap", "✨ " + L("सबसे सस्ता", "Cheapest")));
    left.append(nmD, E("span", "tag", x.vendor || "—", "background:" + vColor(x.vendor)));
    if (x.size) left.append(E("span", "tag size", x.size));
    left.append(E("div", "mut", L("ख़रीद", "Buy"), "margin-top:6px"), E("div", "", money(b) + " /" + unitOf(x)));
    if (S.showPct) left.append(E("div", good ? "pro" : "loss", (good ? L("मुनाफ़ा", "Profit") : L("घाटा", "Loss")) + ": " + money(Math.abs(p)) + " (" + pct + "%)"));
    const right = E("div");
    right.append(E("div", "mut", L("बेच", "Sell"), "text-align:right"), E("div", "sell", money(s)), E("div", "mut", "/" + unitOf(x), "text-align:right"));
    const c = E("div", "card");
    c.append(left, right);
    c.onclick = () => openSheet(x);
    Lst.append(c);
  });
}
$("q").addEventListener("input", () => render());
$("sortSel").onchange = () => { S.sort = $("sortSel").value; saveS(); render(); };

/* ===== हिंदी ↔ English नाम ===== */
function toEng(t) {
  const V = { "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri" };
  const M = { "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ृ": "ri" };
  const C = {};
  "क:k,ख:kh,ग:g,घ:gh,ङ:n,च:ch,छ:chh,ज:j,झ:jh,ञ:n,ट:t,ठ:th,ड:d,ढ:dh,ण:n,त:t,थ:th,द:d,ध:dh,न:n,प:p,फ:ph,ब:b,भ:bh,म:m,य:y,र:r,ल:l,व:v,श:sh,ष:sh,स:s,ह:h"
    .split(",").forEach((p) => { const [a, b] = p.split(":"); C[a] = b; });
  const NUK = { "क": "q", "ख": "kh", "ग": "g", "ज": "z", "ड": "r", "ढ": "rh", "फ": "f" };
  const ch = [...t];
  let out = "", i = 0;
  while (i < ch.length) {
    const c = ch[i];
    if (C[c]) {
      let base = C[c];
      if (ch[i + 1] === "़") { base = NUK[c] || base; i++; }
      out += base;
      const n = ch[i + 1];
      if (M[n]) { out += M[n]; i++; }
      else if (n === "्") i++;
      else if (n && n !== " " && !"ंँः".includes(n)) out += "a";
    } else if (V[c]) out += V[c];
    else if ("ंँ".includes(c)) out += "n";
    else if (c === "ः") out += "h";
    else if (c !== "़") out += c;
    i++;
  }
  return out.replace(/\b\w/g, (m) => m.toUpperCase());
}
async function toHindi(t) {
  try {
    const r = await fetch("https://inputtools.google.com/request?itc=hi-t-i0-und&num=1&text=" + encodeURIComponent(t));
    const j = await r.json();
    return j[1].map((w) => w[1][0]).join(" ") || "";
  } catch (e) { return ""; }
}
const makeAlt = async (name) => (/[\u0900-\u097F]/.test(name) ? toEng(name) : await toHindi(name));
async function backfill() {
  if (filled) return;
  filled = true;
  for (const x of ITEMS.filter((i) => !i.alt && nm(i))) {
    const alt = await makeAlt(nm(x));
    if (alt) updateDoc(doc(db, "items", x.id), { alt }).catch(() => {});
  }
}

/* ===== जोड़ना और बदलना ===== */
let editId = null, editOld = null;
const dl = E("datalist");
dl.id = "venList";
document.body.append(dl);
$("fVen").setAttribute("list", "venList");
function fillVenList() {
  dl.innerHTML = "";
  [...new Set(ITEMS.map((x) => x.vendor).filter(Boolean))].forEach((v) => { const o = E("option"); o.value = v; dl.append(o); });
}
function clearForm() {
  ["fName", "fVen", "fSize", "fBuy", "fSell"].forEach((i) => ($(i).value = ""));
  $("fUnit").value = UNITS[0][0];
  editId = null;
  editOld = null;
  $("addTitle").textContent = L("नया सामान जोड़ें", "Add new item");
}
clearForm();
$("backAdd").onclick = () => { clearForm(); go("pList"); };
$("saveItem").onclick = async () => {
  const name = $("fName").value.trim();
  if (!name) return alert(L("सामान का नाम डालें", "Enter item name"));
  const data = {
    Item: name, vendor: $("fVen").value.trim(), size: $("fSize").value.trim(), unit: $("fUnit").value,
    buyPrice: Number($("fBuy").value) || 0, sellPrice: Number($("fSell").value) || 0, shop: S.shop
  };
  data.alt = await makeAlt(name);
  const err = (e) => alert("Error: " + e.message);
  if (editId) {
    updateDoc(doc(db, "items", editId), data).catch(err);
    if (editOld && (editOld.b !== data.buyPrice || editOld.s !== data.sellPrice)) {
      addDoc(collection(db, "history"), {
        Item: name, vendor: data.vendor, unit: data.unit, size: data.size, shop: S.shop,
        oldBuy: editOld.b, newBuy: data.buyPrice, oldSell: editOld.s, newSell: data.sellPrice, t: Date.now()
      }).catch(err);
    }
  } else {
    data.t = Date.now();
    addDoc(collection(db, "items"), data).catch(err);
  }
  clearForm();
  go("pList");
};

/* ===== एक सामान पर दबाने से ===== */
const hk = (x) => ((x.Item || "") + "|" + (x.vendor || "") + "|" + (x.shop || "मेरी दुकान")).toLowerCase();
async function cleanHistory(only) {
  const snap = await getDocs(collection(db, "history"));
  const live = new Set(ITEMS.map(hk));
  let n = 0;
  for (const d of snap.docs) {
    const r = d.data();
    if (only ? hk(r) === only : !live.has(hk(r))) { await deleteDoc(d.ref); n++; }
  }
  return n;
}
function openSheet(x) {
  const box = $("sheetBox");
  box.innerHTML = "";
  const bShare = E("button", "btn", "📲 " + L("WhatsApp पर भेजें", "Send on WhatsApp"));
  const bEdit = E("button", "btn btn2", "✏️ " + L("बदलें", "Edit"));
  const bCode = E("button", "btn btn2", "▥ " + L("बारकोड जोड़ें", "Add barcode"));
  const bDel = E("button", "btn btn2", "🗑️ " + L("हटाएँ", "Delete"), "color:#d32f2f");
  box.append(E("div", "nm", nm(x) + (x.alt ? " (" + x.alt + ")" : "")), E("div", "mut", (x.vendor || "") + " " + (x.size || "")), bShare, bEdit, bCode, bDel);
  $("sheet").classList.add("on");
  bShare.onclick = () => {
    const m = "*" + fullName(x) + "*" + (x.size ? " (" + x.size + ")" : "") + "\n" + L("भाव", "Rate") + ": " + money(x.sellPrice) + "/" + unitOf(x) + "\n- " + shopShow(S.shop);
    window.open("https://wa.me/?text=" + encodeURIComponent(m), "_blank");
  };
  bEdit.onclick = () => {
    $("sheet").classList.remove("on");
    clearForm();
    editId = x.id;
    editOld = { b: Number(x.buyPrice) || 0, s: Number(x.sellPrice) || 0 };
    $("fName").value = nm(x);
    $("fVen").value = x.vendor || "";
    $("fSize").value = x.size || "";
    $("fUnit").value = UNITS.some((u) => u[0] === x.unit) ? x.unit : UNITS[0][0];
    $("fBuy").value = x.buyPrice || "";
    $("fSell").value = x.sellPrice || "";
    $("addTitle").textContent = "✏️ " + L("सामान बदलें", "Edit item");
    go("pAdd");
  };
  bCode.onclick = () => {
    $("sheet").classList.remove("on");
    scan((code) => { updateDoc(doc(db, "items", x.id), { code }); alert("✔️ " + L("बारकोड जुड़ गया", "Barcode added")); });
  };
  bDel.onclick = () => {
    if (!confirm(nm(x) + " " + L("हटाएँ?", "delete?"))) return;
    deleteDoc(doc(db, "items", x.id));
    cleanHistory(hk(x));
    $("sheet").classList.remove("on");
  };
}

/* ===== माइक ===== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listen(inp, btn) {
  if (!SR) return alert(L("इस फ़ोन में आवाज़ से लिखना नहीं चलता", "Voice typing not supported"));
  const r = new SR();
  r.lang = inp.type === "number" ? "en-IN" : L("hi-IN", "en-IN");
  btn.classList.add("sun");
  r.onend = () => btn.classList.remove("sun");
  r.onresult = (e) => {
    let t = e.results[0][0].transcript.trim();
    if (inp.type === "number") t = (t.replace(/,/g, "").match(/[\d.]+/) || [""])[0];
    inp.value = t;
    if (inp.id === "q") render();
  };
  r.onerror = (e) => { btn.classList.remove("sun"); if (e.error !== "no-speech") alert(L("माइक: ", "Mic: ") + e.error); };
  r.start();
}
$("qMic").onclick = () => listen($("q"), $("qMic"));
document.querySelectorAll(".micb[data-for]").forEach((b) => (b.onclick = (e) => { e.preventDefault(); listen($(b.dataset.for), b); }));

/* ===== स्कैनर ===== */
async function scan(done) {
  if (!("BarcodeDetector" in window)) return alert(L("इस फ़ोन में स्कैनर नहीं चलता", "Scanner not supported on this phone"));
  const box = $("modalBox");
  box.innerHTML = "";
  const v = E("video", "", null, "width:100%;border-radius:12px");
  v.setAttribute("playsinline", "");
  v.muted = true;
  const c = E("button", "btn btn2", "✖ " + L("बंद करें", "Close"));
  box.append(E("h3", "", "📷 " + L("बारकोड स्कैन करें", "Scan barcode")), v, c);
  $("modal").classList.add("on");
  let st, on = true;
  const stop = () => { on = false; if (st) st.getTracks().forEach((t) => t.stop()); $("modal").classList.remove("on"); };
  c.onclick = stop;
  try {
    st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    v.srcObject = st;
    await v.play();
  } catch (e) { stop(); return alert(L("कैमरा नहीं खुला: ", "Camera error: ") + e.message); }
  const det = new BarcodeDetector();
  const loop = async () => {
    if (!on || !$("modal").classList.contains("on")) return stop();
    try {
      const r = await det.detect(v);
      if (r.length) { stop(); return done(r[0].rawValue); }
    } catch (e) {}
    setTimeout(loop, 300);
  };
  loop();
}
$("qScan").onclick = () => scan((code) => {
  const hit = ITEMS.find((x) => x.code === code);
  if (hit) openSheet(hit);
  else alert(L("यह बारकोड किसी सामान से नहीं जुड़ा: ", "No item has this barcode: ") + code);
});

/* ===== WhatsApp पर पूरी लिस्ट ===== */
$("waBtn").onclick = () => {
  const a = filtered();
  if (!a.length) return alert(L("लिस्ट ख़ाली है", "List is empty"));
  const m = "*" + shopShow(S.shop) + " – " + L("रेट लिस्ट", "Rate List") + "*\n" + a.map((x) => "• " + fullName(x) + (x.size ? " (" + x.size + ")" : "") + ": " + money(x.sellPrice) + "/" + unitOf(x)).join("\n");
  window.open("https://wa.me/?text=" + encodeURIComponent(m), "_blank");
};

/* ===== PDF (ऐप के अंदर) ===== */
$("pdfBtn").onclick = () => {
  const a = filtered();
  if (!a.length) return alert(L("लिस्ट ख़ाली है", "List is empty"));
  const pa = $("printArea");
  pa.innerHTML = "";
  pa.append(E("h2", "", shopShow(S.shop) + " – " + L("रेट लिस्ट", "Rate List")), E("div", "", new Date().toLocaleDateString("hi-IN"), "margin-bottom:8px"));
  const t = E("table"), h = E("tr");
  ["#", L("सामान", "Item"), L("भाव", "Rate")].forEach((s) => h.append(E("th", "", s)));
  t.append(h);
  a.forEach((x, i) => {
    const r = E("tr");
    r.append(E("td", "", String(i + 1)), E("td", "", fullName(x) + (x.size ? " – " + x.size : "")), E("td", "", money(x.sellPrice) + "/" + unitOf(x)));
    t.append(r);
  });
  pa.append(t);
  setTimeout(() => window.print(), 200);
};

/* ===== सेटिंग ===== */
(function () {
  const P = $("pSet");
  P.innerHTML = "";
  const sec = (t) => { const b = E("div", "box"); b.append(E("h3", "", t, "margin:0 0 8px")); P.append(b); return b; };
  const tog = (box, label, key) => {
    const r = E("div", "row", null, "justify-content:space-between;padding:8px 0");
    const b = E("button", "");
    const paint = () => { b.className = "pill " + (S[key] ? "on" : ""); b.textContent = S[key] ? L("चालू ✔️", "On ✔️") : L("बंद", "Off"); };
    paint();
    b.onclick = () => { S[key] = !S[key]; saveS(); applyS(); render(); paint(); };
    r.append(E("span", "", label), b);
    box.append(r);
  };

  const lg = sec("🌐 " + L("भाषा", "Language"));
  const ls = E("select");
  [["hi", "हिंदी"], ["en", "English"]].forEach(([v, t]) => { const o = E("option", "", t); o.value = v; if (S.lang === v) o.selected = true; ls.append(o); });
  ls.onchange = () => { S.lang = ls.value; saveS(); location.reload(); };
  lg.append(ls);

  const a = sec("👁️ " + L("दिखावट", "Display"));
  tog(a, L("मुनाफ़ा / घाटा % दिखाएँ", "Show profit / loss %"), "showPct");
  tog(a, L("नाम के साथ ब्रैकेट में दूसरी भाषा", "Other language name in brackets"), "dual");
  tog(a, "🌙 " + L("डार्क मोड", "Dark mode"), "dark");
  tog(a, L("मोटे अक्षर", "Bold text"), "bold");
  const fr = E("div", "row", null, "justify-content:space-between;padding:8px 0");
  const fm = E("button", "pill", "A−"), fp = E("button", "pill", "A+");
  fm.onclick = () => { S.font = Math.max(12, S.font - 1); saveS(); applyS(); };
  fp.onclick = () => { S.font = Math.min(24, S.font + 1); saveS(); applyS(); };
  const fg = E("div", "row");
  fg.append(fm, fp);
  fr.append(E("span", "", L("अक्षरों का आकार", "Text size")), fg);
  a.append(fr);
  const th = E("div", "row", null, "gap:12px;padding:8px 0");
  Object.keys(THEMES).forEach((k) => {
    const b = E("button", "", "", "width:40px;height:40px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px #0004;background:" + THEMES[k][0]);
    b.onclick = () => { S.theme = k; saveS(); applyS(); };
    th.append(b);
  });
  a.append(E("div", "mut", L("रंग चुनें", "Choose colour")), th);
  const cu = E("select");
  ["₹", "Rs", "$", "AED", "रु"].forEach((c) => { const o = E("option", "", c); if (c === S.cur) o.selected = true; cu.append(o); });
  cu.onchange = () => { S.cur = cu.value; saveS(); render(); };
  a.append(E("div", "mut", L("मुद्रा", "Currency"), "margin-top:8px"), cu);

  const pb = sec("🔒 " + L("PIN लॉक", "PIN lock"));
  const pinB = E("button", "btn btn2");
  const pinTxt = () => (pinB.textContent = S.pin ? L("PIN बदलें / हटाएँ", "Change / remove PIN") : L("PIN लगाएँ", "Set PIN"));
  pinTxt();
  pinB.onclick = () => {
    const n = prompt(L("नया 4 अंक का PIN डालें (हटाना हो तो ख़ाली छोड़ें)", "New 4-digit PIN (leave empty to remove)"), "");
    if (n === null) return;
    S.pin = n.trim();
    saveS();
    pinTxt();
    alert(S.pin ? L("✔️ PIN लग गया", "✔️ PIN set") : L("PIN हटा दिया", "PIN removed"));
  };
  pb.append(pinB);

  const ex = sec("📥 " + L("Excel से सामान", "Import from Excel"));
  ex.append(E("div", "mut", L("कॉलम क्रम: सामान, होलसेलर, साइज़, यूनिट, ख़रीद, बेच", "Columns: Item, Wholesaler, Size, Unit, Buy, Sell")));
  const fi = E("input");
  fi.type = "file";
  const sam = E("button", "btn btn2", "⬇️ " + L("नमूना फ़ाइल", "Sample file"));
  sam.onclick = () => {
    const csv = "\uFEFFसामान,होलसेलर,साइज़,यूनिट,ख़रीद,बेच\nचावल,राहुल,1 किलो पैकेट,पैकेट,60,70\nब्रेड,साहिल,,पीस,15,20";
    const l = E("a");
    l.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    l.download = "namuna.csv";
    l.click();
  };
  fi.onchange = async () => {
    const f = fi.files[0];
    if (!f) return;
    try {
      const X = await import("https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs");
      const wb = X.read(await f.arrayBuffer());
      const rows = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      const have = new Set(ITEMS.filter(mine).map((x) => (nm(x) + "|" + (x.vendor || "") + "|" + (x.size || "")).toLowerCase()));
      let n = 0;
      rows.slice(1).forEach((r) => {
        if (!r || !r[0]) return;
        const d = { Item: String(r[0]).trim(), vendor: String(r[1] || "").trim(), size: String(r[2] || "").trim(), unit: String(r[3] || "किलो").trim(), buyPrice: Number(r[4]) || 0, sellPrice: Number(r[5]) || 0, shop: S.shop, t: Date.now() };
        const k = (d.Item + "|" + d.vendor + "|" + d.size).toLowerCase();
        if (have.has(k)) return;
        have.add(k);
        addDoc(collection(db, "items"), d);
        n++;
      });
      alert("✔️ " + n + " " + L("नए सामान जुड़े (डबल वाले छोड़ दिए)", "new items added (duplicates skipped)"));
      fi.value = "";
    } catch (e) { alert(L("फ़ाइल नहीं पढ़ी गई: ", "Could not read file: ") + e.message); }
  };
  ex.append(fi, sam);

  const hi = sec("📈 " + L("भाव का इतिहास", "Price history"));
  const hb = E("button", "btn", L("इतिहास देखें", "View history"));
  const tir = (o, n) => ["🔻", "➖", "🔺"][Math.sign(n - o) + 1];
  hb.onclick = async () => {
    const snap = await getDocs(collection(db, "history"));
    const rows = snap.docs.map((d) => d.data()).filter((r) => (r.shop || "मेरी दुकान") === S.shop).sort((p, q) => q.t - p.t);
    const m = $("modalBox");
    m.innerHTML = "";
    const q = E("input");
    q.placeholder = "🔍 " + L("सामान या होलसेलर खोजें", "Search item or wholesaler");
    const list = E("div", "", null, "margin-top:8px");
    const close = E("button", "btn btn2", "✖ " + L("बंद करें", "Close"));
    m.append(E("h3", "", "📈 " + L("भाव का इतिहास", "Price history")), q, list, close);
    const draw = () => {
      list.innerHTML = "";
      const t = q.value.trim().toLowerCase();
      const f = rows.filter((r) => !t || ((r.Item || "") + " " + (r.vendor || "")).toLowerCase().includes(t));
      if (!f.length) list.append(E("div", "mut", L("अभी कोई बदलाव नहीं मिला", "No changes yet")));
      f.forEach((r) => {
        const d = new Date(r.t);
        const c = E("div", "card", null, "display:block;padding:10px 12px;margin:6px 0");
        c.append(
          E("div", "nm", (r.Item || "") + (r.size ? " (" + r.size + ")" : "")),
          E("span", "tag", r.vendor || "—", "background:" + vColor(r.vendor)),
          E("div", "", L("ख़रीद", "Buy") + ": " + money(r.oldBuy) + " → " + money(r.newBuy) + " " + tir(r.oldBuy, r.newBuy)),
          E("div", "", L("बेच", "Sell") + ": " + money(r.oldSell) + " → " + money(r.newSell) + " " + tir(r.oldSell, r.newSell)),
          E("div", "mut", "📅 " + d.toLocaleDateString("hi-IN") + "  ⏰ " + d.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }))
        );
        list.append(c);
      });
    };
    q.oninput = draw;
    close.onclick = () => $("modal").classList.remove("on");
    draw();
    $("modal").classList.add("on");
  };
  const hc = E("button", "btn btn2", "🧹 " + L("हटाए गए सामान का इतिहास साफ़ करें", "Clear history of deleted items"));
  hc.onclick = async () => alert("✔️ " + (await cleanHistory()) + " " + L("पुरानी एंट्री हटाईं", "old entries removed"));
  hi.append(hb, hc);

  const fb = sec("💬 " + L("सुझाव दें", "Feedback"));
  fb.append(E("div", "mut", L("ऐप में कोई कमी लगे या नया फ़ीचर चाहिए, तो लिखिए", "Tell us what to improve")));
  const ta = E("textarea");
  ta.rows = 3;
  const sb = E("button", "btn", "📧 " + L("भेजें", "Send"));
  sb.onclick = () => {
    if (!ta.value.trim()) return alert(L("पहले कुछ लिखिए", "Write something first"));
    location.href = "mailto:rgoyal83556@gmail.com?subject=" + encodeURIComponent("Rate List सुझाव") + "&body=" + encodeURIComponent(ta.value);
  };
  fb.append(ta, sb);

  const lo = E("button", "btn btn2", "🚪 " + L("लॉगआउट", "Logout"), "color:#d32f2f");
  lo.onclick = () => { if (confirm(L("लॉगआउट करें?", "Logout?"))) signOut(auth).then(() => location.reload()); };
  P.append(lo);
})();

/* ===== कैटेगरी ===== */
const myCats = () => CATS.filter((c) => (c.shop || "मेरी दुकान") === S.shop);
function hold(el, fn) {
  let t;
  el.addEventListener("touchstart", () => { t = setTimeout(() => { el.dataset.held = "1"; fn(); }, 600); });
  ["touchend", "touchmove"].forEach((ev) => el.addEventListener(ev, () => clearTimeout(t)));
  el.addEventListener("contextmenu", (e) => { e.preventDefault(); el.dataset.held = "1"; fn(); });
}
function drawCats() {
  const bar = $("catBar");
  bar.innerHTML = "";
  myCats().forEach((c) => {
    const b = E("button", "pill" + (curCat === c.id ? " on" : ""), "🏷️ " + c.name + " (" + (c.items || []).length + ")");
    b.onclick = () => {
      if (b.dataset.held) { delete b.dataset.held; return; }
      curCat = curCat === c.id ? "" : c.id;
      drawCats();
      render();
    };
    hold(b, () => editCat(c));
    bar.append(b);
  });
  const add = E("button", "pill", "➕ " + L("कैटेगरी", "Category"));
  add.onclick = async () => {
    const n = prompt(L("नई कैटेगरी का नाम (जैसे तेल)", "New category name (e.g. Oil)"));
    if (!n || !n.trim()) return;
    const r = await addDoc(collection(db, "cats"), { name: n.trim(), shop: S.shop, items: [] });
    editCat({ id: r.id, name: n.trim(), items: [] });
  };
  bar.append(add);
  if (myCats().length) bar.append(E("span", "mut", L("बदलने के लिए देर तक दबाएँ", "Long-press to edit"), "flex:none;align-self:center"));
}
function editCat(c) {
  const sel = new Set(c.items || []);
  const box = $("modalBox");
  box.innerHTML = "";
  const q = E("input");
  q.placeholder = "🔍 " + L("सामान का नाम लिखिए", "Type item name");
  const list = E("div", "", null, "margin-top:8px");
  const ok = E("button", "btn", "✔️ " + L("हो गया", "Done"));
  const del = E("button", "btn btn2", "🗑️ " + L("कैटेगरी हटाएँ", "Delete category"), "color:#d32f2f");
  box.append(E("h3", "", "🏷️ " + c.name), q, list, ok, del);
  const draw = () => {
    list.innerHTML = "";
    const t = q.value.trim().toLowerCase();
    let arr = ITEMS.filter(mine);
    arr = t ? arr.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "")).toLowerCase().includes(t)) : arr.filter((x) => sel.has(x.id));
    if (!arr.length) list.append(E("div", "mut", t ? L("कुछ नहीं मिला", "Nothing found") : L("ऊपर नाम लिखिए, सामान भाव के साथ दिखेगा, दबाकर जोड़िए", "Type a name above, tap an item to add it")));
    arr.forEach((x) => {
      const on = sel.has(x.id);
      const r = E("div", "card", null, "padding:10px 12px;margin:6px 0;align-items:center" + (on ? ";outline:2px solid var(--acc)" : ""));
      const l = E("div");
      l.append(E("div", "nm", fullName(x) + (x.size ? " (" + x.size + ")" : "")), E("div", "mut", (x.vendor || "—") + " • " + money(x.sellPrice) + "/" + unitOf(x)));
      r.append(l, E("div", "", on ? "✅" : "➕", "font-size:24px"));
      r.onclick = () => { on ? sel.delete(x.id) : sel.add(x.id); draw(); };
      list.append(r);
    });
  };
  q.oninput = draw;
  draw();
  ok.onclick = () => { updateDoc(doc(db, "cats", c.id), { items: [...sel] }); $("modal").classList.remove("on"); };
  del.onclick = () => {
    if (!confirm(c.name + " " + L("हटाएँ?", "delete?"))) return;
    deleteDoc(doc(db, "cats", c.id));
    if (curCat === c.id) curCat = "";
    $("modal").classList.remove("on");
  };
  $("modal").classList.add("on");
}
drawCats();
render();
