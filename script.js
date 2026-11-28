/* ===== टुकड़ा 1 ===== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const $ = (id) => document.getElementById(id);
const S = Object.assign({ theme: "orange", dark: false, cur: "₹", font: 16, bold: false, showPct: true, dual: false, sort: "az", shop: "मेरी दुकान", pin: "" }, JSON.parse(localStorage.getItem("rlS") || "{}"));
const saveS = () => localStorage.setItem("rlS", JSON.stringify(S));
const THEMES = { orange: ["#f57c00", "#bf360c"], green: ["#2e7d32", "#1b5e20"], blue: ["#1565c0", "#0d47a1"], purple: ["#6a1b9a", "#4a148c"], red: ["#d32f2f", "#8e0000"] };
const UNITS = ["किलो", "ग्राम", "लीटर", "पीस", "पैकेट", "दर्जन", "डिब्बा", "बोरी"];


/* ===== टुकड़ा 2 ===== */
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
.page{display:none;padding:12px}
.page.on{display:block}
.row{display:flex;gap:8px;align-items:center}
.ibtn{flex:none;width:46px;height:46px;border-radius:12px;border:0;background:var(--card);font-size:20px;box-shadow:0 1px 4px #0002}
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
.pro{color:#2e7d32;font-weight:600}
.loss{color:#d32f2f;font-weight:600}
.cheap{background:linear-gradient(90deg,#ffb300,#ff6f00);color:#fff;border-radius:12px;padding:2px 8px;font-size:.75em;animation:glow 1.2s infinite alternate}
@keyframes glow{to{box-shadow:0 0 12px #ffb300}}
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
.sheet{align-items:flex-end}
.sheet .mbox{border-radius:22px 22px 0 0;width:100%;max-width:none}
.tarazu{font-size:64px;display:inline-block;animation:sw 1s ease-in-out infinite alternate}
@keyframes sw{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
`;
document.head.appendChild(css);
/* ===== टुकड़ा 3 ===== */
function fld(id, t, type) {
  return `<label>${t}</label><div class="row"><input id="${id}" type="${type}" ${type === "number" ? 'inputmode="decimal"' : ""}><button class="ibtn mic" data-for="${id}">🎤</button></div>`;
}
document.body.innerHTML = `
<div id="loader" class="ov on"><div style="text-align:center;color:#fff"><div class="tarazu">⚖️</div><div>लोड हो रहा है...</div></div></div>
<div id="login" class="page" style="max-width:420px;margin:auto">
 <div class="box" style="text-align:center;margin-top:40px"><div class="tarazu">⚖️</div><h2>Rate List</h2>
 <div class="row"><select id="cc" style="width:125px">
  <option value="+91" selected>🇮🇳 +91</option><option value="+977">🇳🇵 +977</option><option value="+880">🇧🇩 +880</option>
  <option value="+971">🇦🇪 +971</option><option value="+966">🇸🇦 +966</option><option value="+1">🇺🇸 +1</option><option value="+44">🇬🇧 +44</option>
 </select><input id="phone" type="tel" placeholder="सिर्फ़ अपना मोबाइल नंबर"></div>
 <button class="btn" id="sendOtp">OTP भेजें</button>
 <input id="otp" type="number" placeholder="OTP डालें" style="margin-top:10px;display:none">
 <button class="btn" id="verOtp" style="display:none">लॉगिन करें</button>
 <div id="recap"></div></div></div>
<div id="app" style="display:none">
 <header><h1>📋 Rate List</h1><div class="row"><select id="shopSel"></select><span id="net" style="margin-left:auto">🟢 ऑनलाइन</span></div></header>
 <div id="pList" class="page on">
  <div class="pills" id="catBar"></div>
  <div class="row"><input id="q" placeholder="🔍 सामान या होलसेलर खोजें"><button class="ibtn" id="qMic">🎤</button><button class="ibtn" id="qScan">📷</button></div>
  <div class="pills" id="venBar"></div>
  <div class="row"><select id="sortSel"><option value="az">🔤 A से Z</option><option value="new">🆕 नया पहले</option><option value="old">📜 पुराना पहले</option></select><button class="ibtn" id="waBtn">📲</button><button class="ibtn" id="pdfBtn">📄</button></div>
  <div id="list"></div>
 </div>
 <div id="pAdd" class="page">
  <button class="btn btn2" id="backAdd" style="width:auto;margin:0;padding:10px 18px">← वापस</button>
  <div class="box"><h3 id="addTitle" style="margin:0">नया सामान जोड़ें</h3>
  ${fld("fName", "सामान का नाम", "text")}
  ${fld("fVen", "होलसेलर का नाम", "text")}
  ${fld("fSize", "मात्रा / साइज़ (जैसे 1 किलो पैकेट, 6 पीस)", "text")}
  <label>यूनिट</label><select id="fUnit">${UNITS.map((u) => `<option>${u}</option>`).join("")}</select>
  ${fld("fBuy", "ख़रीद भाव", "number")}
  ${fld("fSell", "बेच भाव", "number")}
  <button class="btn" id="saveItem">✔️ सेव करें</button></div>
 </div>
 <div id="pSet" class="page"></div>
 <nav><button data-p="pList" class="on">📋 लिस्ट</button><button data-p="pAdd">➕ जोड़ें</button><button data-p="pSet">⚙️ सेटिंग</button></nav>
</div>
<div id="lock" class="ov"><div class="mbox" style="text-align:center"><h2>🔒 PIN डालें</h2><input id="pinIn" type="password" inputmode="numeric"><button class="btn" id="pinOk">खोलें</button></div></div>
<div id="sheet" class="ov sheet"><div class="mbox" id="sheetBox"></div></div>
<div id="modal" class="ov"><div class="mbox" id="modalBox"></div></div>`;



/* ===== टुकड़ा 4 ===== */
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
  document.querySelectorAll("#sheet,#modal").forEach((o) => {
    if (o.classList.contains("on")) any = true;
    o.classList.remove("on");
  });
  return any;
}
function go(p) {
  document.querySelectorAll(".page").forEach((x) => x.classList.toggle("on", x.id === p));
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.p === p));
  window.scrollTo(0, 0);
}
history.pushState({ rl: 1 }, "");
window.addEventListener("popstate", () => {
  if (!closeAll()) go("pList");
  history.pushState({ rl: 1 }, "");
});
document.querySelectorAll("nav button").forEach((b) => (b.onclick = () => go(b.dataset.p)));
document.querySelectorAll(".ov").forEach((o) =>
  o.addEventListener("click", (e) => {
    if (e.target === o && o.id !== "lock" && o.id !== "loader") o.classList.remove("on");
  })
);


/* ===== टुकड़ा 5 ===== */
let ITEMS = [], VEN = {}, curVen = "", started = false, confRes = null;
const PAL = ["#e53935", "#8e24aa", "#1e88e5", "#00897b", "#f4511e", "#6d4c41", "#3949ab", "#7cb342", "#d81b60", "#fb8c00"];
function vColor(v) {
  if (VEN[v]) return VEN[v];
  let h = 0;
  for (const c of v || "") h = (h * 31 + c.charCodeAt(0)) % 997;
  return PAL[h % PAL.length];
}
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
  if (n.length < 6) return alert("सही नंबर डालें");
  try {
    window.rv = window.rv || new RecaptchaVerifier(auth, "recap", { size: "invisible" });
    confRes = await signInWithPhoneNumber(auth, $("cc").value + n, window.rv);
    $("otp").style.display = "block";
    $("verOtp").style.display = "block";
    alert("OTP भेज दिया");
  } catch (e) { alert("Error: " + e.message); }
};
$("verOtp").onclick = async () => {
  try { await confRes.confirm($("otp").value.trim()); } catch (e) { alert("OTP गलत है"); }
};
$("pinOk").onclick = () => {
  if ($("pinIn").value === S.pin) { $("lock").classList.remove("on"); $("pinIn").value = ""; }
  else alert("PIN गलत है");
};
function net() { $("net").textContent = navigator.onLine ? "🟢 ऑनलाइन" : "🔴 ऑफ़लाइन"; }
window.addEventListener("online", net);
window.addEventListener("offline", net);
net();


/* ===== टुकड़ा 6 ===== */
function startData() {
  if (started) return;
  started = true;
  onSnapshot(collection(db, "shops"), (s) => {
    const names = ["मेरी दुकान", ...s.docs.map((d) => d.data().name).filter((n) => n && n !== "मेरी दुकान")];
    $("shopSel").innerHTML = names.map((n) => `<option ${n === S.shop ? "selected" : ""}>${n}</option>`).join("") + `<option value="__new">➕ नई दुकान</option>`;
  });
  onSnapshot(collection(db, "vendors"), (s) => {
    VEN = {};
    s.docs.forEach((d) => { if (d.data().clr) VEN[d.id] = d.data().clr; });
    render();
  });
  onSnapshot(collection(db, "items"), (s) => {
    ITEMS = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
    if (window.onItems) window.onItems(s);
  });
}
$("shopSel").onchange = async () => {
  if ($("shopSel").value === "__new") {
    const n = prompt("नई दुकान का नाम");
    if (n && n.trim()) { S.shop = n.trim(); saveS(); await addDoc(collection(db, "shops"), { name: n.trim() }); }
    else $("shopSel").value = S.shop;
  } else { S.shop = $("shopSel").value; saveS(); }
  curVen = "";
  render();
};
const nm = (x) => x.Item || "";
const unitOf = (x) => x.unit || "किलो";
const mine = (x) => (x.shop || "मेरी दुकान") === S.shop;
const money = (n) => S.cur + " " + Math.round(n * 100) / 100;
const keyOf = (x) => (nm(x) + "|" + (x.size || "") + "|" + unitOf(x)).toLowerCase();
function showName(x) { return nm(x) + (S.dual && x.alt ? ` <span class="mut">(${x.alt})</span>` : ""); }


/* ===== टुकड़ा 7 ===== */
function render() {
  const q = $("q").value.trim().toLowerCase();
  let arr = ITEMS.filter(mine);
  const vens = {}, best = {};
  arr.forEach((x) => {
    const v = x.vendor || "—";
    vens[v] = (vens[v] || 0) + 1;
    (best[keyOf(x)] = best[keyOf(x)] || []).push(Number(x.buyPrice) || 0);
  });
  $("venBar").innerHTML = `` +
    Object.keys(vens).sort().map((v) => ``).join("");
  $("venBar").querySelectorAll(".pill").forEach((b) => (b.onclick = () => { curVen = b.dataset.v; render(); }));
  if (curVen) arr = arr.filter((x) => (x.vendor || "—") === curVen);
  if (window.catFilter) arr = window.catFilter(arr);
  if (q) arr = arr.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "") + " " + (x.size || "")).toLowerCase().includes(q));
  const srt = { az: (a, b) => nm(a).localeCompare(nm(b)), new: (a, b) => (b.t || 0) - (a.t || 0), old: (a, b) => (a.t || 0) - (b.t || 0) };
  arr.sort(srt[S.sort] || srt.az);
  $("sortSel").value = S.sort;
  $("list").innerHTML = arr.length ? "" : ` कोई सामान नहीं मिला `;
  arr.forEach((x) => {
    const g = best[keyOf(x)];
    const b = Number(x.buyPrice) || 0, s = Number(x.sellPrice) || 0, p = s - b;
    const cheap = g.length > 1 && b === Math.min(...g);
    const pct = b ? ((p / b) * 100).toFixed(1) : 0;
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = ` ${showName(x)} ${cheap ? '✨ सबसे सस्ता' : ""}
      ${x.vendor || "—"}${x.size ? `${x.size}` : ""}
      ख़रीद ${money(b)} /${unitOf(x)}
      ${S.showPct ? ` = 0 ? "pro" : "loss"}">${p >= 0 ? "मुनाफ़ा" : "घाटा"}: ${money(Math.abs(p))} (${pct}%) ` : ""}
      बेच ${money(s)} /${unitOf(x)} `;
    c.onclick = () => window.openSheet && window.openSheet(x);
    $("list").appendChild(c);
  });
}
$("q").oninput = render;
$("sortSel").onchange = () => { S.sort = $("sortSel").value; saveS(); render(); };

/* ===== टुकड़ा 7 सुधार ===== */
render = function () {
  const q = $("q").value.trim().toLowerCase();
  let arr = ITEMS.filter(mine);
  const vens = {}, best = {};
  arr.forEach((x) => {
    const v = x.vendor || "—";
    vens[v] = (vens[v] || 0) + 1;
    (best[keyOf(x)] = best[keyOf(x)] || []).push(Number(x.buyPrice) || 0);
  });
  const allOn = curVen ? "" : "on";
  let vb = ``;
  Object.keys(vens).sort().forEach((v) => {
    const on = curVen === v ? "on" : "";
    vb += ``;
  });
  $("venBar").innerHTML = vb;
  $("venBar").querySelectorAll(".pill").forEach((b) => (b.onclick = () => { curVen = b.dataset.v; render(); }));
  if (curVen) arr = arr.filter((x) => (x.vendor || "—") === curVen);
  if (window.catFilter) arr = window.catFilter(arr);
  if (q) arr = arr.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "") + " " + (x.size || "")).toLowerCase().includes(q));
  const srt = { az: (a, b) => nm(a).localeCompare(nm(b)), new: (a, b) => (b.t || 0) - (a.t || 0), old: (a, b) => (a.t || 0) - (b.t || 0) };
  arr.sort(srt[S.sort] || srt.az);
  $("sortSel").value = S.sort;
  $("list").innerHTML = arr.length ? "" : ` कोई सामान नहीं मिला `;
  arr.forEach((x) => {
    const g = best[keyOf(x)];
    const b = Number(x.buyPrice) || 0, s = Number(x.sellPrice) || 0, p = s - b;
    const cheap = g.length > 1 && b === Math.min(...g);
    const pct = b ? ((p / b) * 100).toFixed(1) : 0;
    const good = p >= 0;
    const cls = good ? "pro" : "loss";
    const word = good ? "मुनाफ़ा" : "घाटा";
    const badge = cheap ? `✨ सबसे सस्ता` : "";
    const sz = x.size ? `${x.size}` : "";
    const pr = S.showPct ? ` ${word}: ${money(Math.abs(p))} (${pct}%) ` : "";
    const c = document.createElement("div");
    c.className = "card";
    c.innerHTML = ` ${showName(x)} ${badge}
      ${x.vendor || "—"}${sz}
      ख़रीद ${money(b)} /${unitOf(x)} ${pr}
      बेच ${money(s)} /${unitOf(x)} `;
    c.onclick = () => window.openSheet && window.openSheet(x);
    $("list").appendChild(c);
  });
};
render();


/* ===== टुकड़ा 7 सुधार 2 ===== */
function E(t, cls, txt, st) {
  const e = document.createElement(t);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  if (st) e.style.cssText = st;
  return e;
}
render = function () {
  const q = $("q").value.trim().toLowerCase();
  let arr = ITEMS.filter(mine);
  const vens = {}, best = {};
  arr.forEach((x) => {
    const v = x.vendor || "—";
    vens[v] = (vens[v] || 0) + 1;
    (best[keyOf(x)] = best[keyOf(x)] || []).push(Number(x.buyPrice) || 0);
  });
  const vb = $("venBar");
  vb.innerHTML = "";
  const all = E("button", "pill " + (curVen ? "" : "on"), "सब होलसेलर (" + arr.length + ")");
  all.onclick = () => { curVen = ""; render(); };
  vb.append(all);
  Object.keys(vens).sort().forEach((v) => {
    const b = E("button", "pill " + (curVen === v ? "on" : ""));
    b.append(E("span", "", "●", "color:" + vColor(v)), " " + v + " (" + vens[v] + ")");
    b.onclick = () => { curVen = v; render(); };
    vb.append(b);
  });
  if (curVen) arr = arr.filter((x) => (x.vendor || "—") === curVen);
  if (window.catFilter) arr = window.catFilter(arr);
  if (q) arr = arr.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "") + " " + (x.size || "")).toLowerCase().includes(q));
  const srt = { az: (a, b) => nm(a).localeCompare(nm(b)), new: (a, b) => (b.t || 0) - (a.t || 0), old: (a, b) => (a.t || 0) - (b.t || 0) };
  arr.sort(srt[S.sort] || srt.az);
  $("sortSel").value = S.sort;
  const L = $("list");
  L.innerHTML = "";
  if (!arr.length) L.append(E("div", "box", "कोई सामान नहीं मिला", "text-align:center"));
  arr.forEach((x) => {
    const g = best[keyOf(x)];
    const b = Number(x.buyPrice) || 0, s = Number(x.sellPrice) || 0, p = s - b;
    const cheap = g.length > 1 && b === Math.min(...g);
    const pct = b ? ((p / b) * 100).toFixed(1) : 0;
    const left = E("div");
    const nmD = E("div", "nm", nm(x));
    if (S.dual && x.alt) nmD.append(" ", E("span", "mut", "(" + x.alt + ")"));
    if (cheap) nmD.append(" ", E("span", "cheap", "✨ सबसे सस्ता"));
    left.append(nmD, E("span", "tag", x.vendor || "—", "background:" + vColor(x.vendor)));
    if (x.size) left.append(E("span", "tag size", x.size));
    left.append(E("div", "mut", "ख़रीद", "margin-top:6px"), E("div", "", money(b) + " /" + unitOf(x)));
    if (S.showPct) left.append(E("div", p >= 0 ? "pro" : "loss", (p >= 0 ? "मुनाफ़ा" : "घाटा") + ": " + money(Math.abs(p)) + " (" + pct + "%)"));
    const right = E("div");
    right.append(E("div", "mut", "बेच", "text-align:right"), E("div", "sell", money(s)), E("div", "mut", "/" + unitOf(x), "text-align:right"));
    const c = E("div", "card");
    c.append(left, right);
    c.onclick = () => window.openSheet && window.openSheet(x);
    L.append(c);
  });
};
render();


/* ===== टुकड़ा 9 नया: जोड़ना, बदलना, हटाना ===== */
let editId = null, editOld = null;
window.hooks = window.hooks || [];
window.onItems = (s) => window.hooks.forEach((h) => h(s));
const dl = document.createElement("datalist");
dl.id = "venList";
document.body.append(dl);
$("fVen").setAttribute("list", "venList");
window.hooks.push(() => {
  dl.innerHTML = "";
  [...new Set(ITEMS.map((x) => x.vendor).filter(Boolean))].forEach((v) => {
    const o = document.createElement("option");
    o.value = v;
    dl.append(o);
  });
});

function toEng(t) {
  const V = { "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऋ": "ri" };
  const M = { "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ृ": "ri" };
  const C = {};
  "क:k,ख:kh,ग:g,घ:gh,ङ:n,च:ch,छ:chh,ज:j,झ:jh,ञ:n,ट:t,ठ:th,ड:d,ढ:dh,ण:n,त:t,थ:th,द:d,ध:dh,न:n,प:p,फ:ph,ब:b,भ:bh,म:m,य:y,र:r,ल:l,व:v,श:sh,ष:sh,स:s,ह:h"
    .split(",").forEach((p) => { const [a, b] = p.split(":"); C[a] = b; });
  const NUK = { "क": "q", "ख": "kh", "ग": "g", "ज": "z", "ड": "r", "ढ": "rh", "फ": "f" };
  const ch = [...t];
  let out = "", i = 0;
  while (ch.length - i > 0) {
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
    return j[1][0][1][0] || "";
  } catch (e) { return ""; }
}

function clearForm() {
  ["fName", "fVen", "fSize", "fBuy", "fSell"].forEach((i) => ($(i).value = ""));
  $("fUnit").value = UNITS[0];
  editId = null;
  editOld = null;
  $("addTitle").textContent = "नया सामान जोड़ें";
}
$("backAdd").onclick = () => { clearForm(); go("pList"); };
document.querySelector('nav button[data-p="pAdd"]').addEventListener("click", clearForm);

$("saveItem").onclick = async () => {
  const name = $("fName").value.trim();
  if (!name) return alert("सामान का नाम डालें");
  const data = {
    Item: name, vendor: $("fVen").value.trim(), size: $("fSize").value.trim(), unit: $("fUnit").value,
    buyPrice: Number($("fBuy").value) || 0, sellPrice: Number($("fSell").value) || 0, shop: S.shop
  };
  data.alt = /[\u0900-\u097F]/.test(name) ? toEng(name) : await toHindi(name);
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

window.openSheet = (x) => {
  const box = $("sheetBox");
  box.innerHTML = "";
  const t = E("div", "nm", nm(x) + (x.alt ? " (" + x.alt + ")" : ""));
  const sub = E("div", "mut", (x.vendor || "") + " " + (x.size || ""));
  const bShare = E("button", "btn", "📲 WhatsApp पर भेजें");
  const bEdit = E("button", "btn btn2", "✏️ बदलें");
  const bCode = E("button", "btn btn2", "▥ बारकोड जोड़ें");
  const bDel = E("button", "btn btn2", "🗑️ हटाएँ", "color:#d32f2f");
  box.append(t, sub, bShare, bEdit, bCode, bDel);
  $("sheet").classList.add("on");
  bShare.onclick = () => {
    const m = "*" + nm(x) + "*" + (x.size ? " (" + x.size + ")" : "") + "\nभाव: " + money(Number(x.sellPrice) || 0) + "/" + unitOf(x) + "\n- " + S.shop;
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
    $("fUnit").value = UNITS.includes(x.unit) ? x.unit : UNITS[0];
    $("fBuy").value = x.buyPrice || "";
    $("fSell").value = x.sellPrice || "";
    $("addTitle").textContent = "✏️ सामान बदलें";
    go("pAdd");
  };
  bCode.onclick = () => {
    $("sheet").classList.remove("on");
    window.scanTarget = (code) => { updateDoc(doc(db, "items", x.id), { code }); alert("✔️ बारकोड जुड़ गया"); };
    $("qScan").click();
  };
  bDel.onclick = () => {
    if (confirm(nm(x) + " हटाएँ?")) { deleteDoc(doc(db, "items", x.id)); $("sheet").classList.remove("on"); }
  };
};

/* ===== नया माइक ===== */
(function () {
  const ns = "http://www.w3.org/2000/svg";
  function micIcon() {
    const s = document.createElementNS(ns, "svg");
    s.setAttribute("width", "22");
    s.setAttribute("height", "22");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "2");
    s.setAttribute("stroke-linecap", "round");
    ["M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z", "M19 11a7 7 0 0 1-14 0", "M12 18v3"].forEach((d) => {
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", d);
      s.append(p);
    });
    return s;
  }
  const st = document.createElement("style");
  st.textContent = ".micb{border-radius:50%!important;color:var(--acc)!important;display:flex;align-items:center;justify-content:center}.micb.sun{background:var(--acc)!important;color:#fff!important;animation:pl 1s infinite}@keyframes pl{0%{box-shadow:0 0 0 0 var(--acc)}100%{box-shadow:0 0 0 12px transparent}}";
  document.head.append(st);
  document.querySelectorAll("#qMic,.mic").forEach((b) => {
    b.textContent = "";
    b.classList.add("micb");
    b.append(micIcon());
  });
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (R) {
    const old = R.prototype.start;
    R.prototype.start = function () {
      const btn = document.activeElement;
      if (btn && btn.classList.contains("micb")) {
        btn.classList.add("sun");
        this.addEventListener("end", () => btn.classList.remove("sun"));
      }
      return old.call(this);
    };
  }
})();

/* ===== टुकड़ा 10: सेटिंग ===== */
(function () {
  const P = $("pSet");
  P.innerHTML = "";
  function sec(t) { const b = E("div", "box"); b.append(E("h3", "", t, "margin:0 0 8px")); P.append(b); return b; }
  function tog(box, label, key) {
    const r = E("div", "row", null, "justify-content:space-between;padding:8px 0");
    const b = E("button", "pill " + (S[key] ? "on" : ""), S[key] ? "चालू ✔️" : "बंद");
    b.onclick = () => { S[key] = !S[key]; saveS(); applyS(); render(); b.className = "pill " + (S[key] ? "on" : ""); b.textContent = S[key] ? "चालू ✔️" : "बंद"; };
    r.append(E("span", "", label), b);
    box.append(r);
  }

  const a = sec("👁️ दिखावट");
  tog(a, "मुनाफ़ा / घाटा % दिखाएँ", "showPct");
  tog(a, "नाम के साथ ब्रैकेट में दूसरी भाषा", "dual");
  tog(a, "🌙 डार्क मोड", "dark");
  tog(a, "मोटे अक्षर", "bold");
  const fr = E("div", "row", null, "justify-content:space-between;padding:8px 0");
  const fm = E("button", "pill", "A−"), fp = E("button", "pill", "A+");
  fm.onclick = () => { S.font = Math.max(12, S.font - 1); saveS(); applyS(); };
  fp.onclick = () => { S.font = Math.min(24, S.font + 1); saveS(); applyS(); };
  const fg = E("div", "row"); fg.append(fm, fp);
  fr.append(E("span", "", "अक्षरों का आकार"), fg);
  a.append(fr);
  const th = E("div", "row", null, "gap:12px;padding:8px 0");
  Object.keys(THEMES).forEach((k) => {
    const b = E("button", "", "", "width:40px;height:40px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px #0004;background:" + THEMES[k][0]);
    b.onclick = () => { S.theme = k; saveS(); applyS(); };
    th.append(b);
  });
  a.append(E("div", "mut", "रंग चुनें"), th);
  const cu = E("select");
  ["₹", "Rs", "$", "AED", "रु"].forEach((c) => { const o = E("option", "", c); if (c === S.cur) o.selected = true; cu.append(o); });
  cu.onchange = () => { S.cur = cu.value; saveS(); render(); };
  a.append(E("div", "mut", "मुद्रा", "margin-top:8px"), cu);

  const pb = sec("🔒 PIN लॉक");
  const pinB = E("button", "btn btn2", S.pin ? "PIN बदलें / हटाएँ" : "PIN लगाएँ");
  pinB.onclick = () => {
    const n = prompt("नया 4 अंक का PIN डालें (हटाना हो तो ख़ाली छोड़ें)", "");
    if (n === null) return;
    S.pin = n.trim(); saveS();
    pinB.textContent = S.pin ? "PIN बदलें / हटाएँ" : "PIN लगाएँ";
    alert(S.pin ? "✔️ PIN लग गया" : "PIN हटा दिया");
  };
  pb.append(pinB);

  const ex = sec("📥 Excel से सामान");
  ex.append(E("div", "mut", "कॉलम क्रम: सामान, होलसेलर, साइज़, यूनिट, ख़रीद, बेच"));
  const fi = E("input"); fi.type = "file";
  const sam = E("button", "btn btn2", "⬇️ नमूना फ़ाइल");
  sam.onclick = () => {
    const csv = "\uFEFFसामान,होलसेलर,साइज़,यूनिट,ख़रीद,बेच\nचावल,राहुल,1 किलो पैकेट,पैकेट,60,70\nब्रेड,साहिल,,पीस,15,20";
    const l = E("a"); l.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); l.download = "namuna.csv"; l.click();
  };
  fi.onchange = async () => {
    const f = fi.files[0]; if (!f) return;
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
      alert("✔️ " + n + " नए सामान जुड़े (डबल वाले छोड़ दिए)");
      fi.value = "";
    } catch (e) { alert("फ़ाइल नहीं पढ़ी गई: " + e.message); }
  };
  ex.append(fi, sam);

  const hi = sec("📈 भाव का इतिहास");
  const hb = E("button", "btn btn2", "इतिहास देखें");
  hb.onclick = async () => {
    const s = await getDocs(collection(db, "history"));
    const rows = s.docs.map((d) => d.data()).filter((r) => (r.shop || "मेरी दुकान") === S.shop).sort((p, q) => q.t - p.t);
    const box = $("modalBox"); box.innerHTML = "";
    box.append(E("h3", "", "📈 भाव का इतिहास"));
    const k = E("input"); k.placeholder = "🔍 सामान खोजें";
    const L = E("div");
    const fill = () => {
      L.innerHTML = "";
      const w = k.value.trim().toLowerCase();
      const f = rows.filter((r) => !w || (r.Item + " " + r.vendor).toLowerCase().includes(w));
      if (!f.length) L.append(E("div", "mut", "अभी कोई बदलाव नहीं"));
      f.forEach((r) => {
        const ar = (o, n) => (n > o ? "🔺" : n === o ? "➖" : "🔻");
        const d = E("div", "", null, "border-bottom:1px solid #8884;padding:8px 0");
        d.append(E("b", "", r.Item + " (" + r.vendor + ")"), E("div", "", "ख़रीद: " + r.oldBuy + " → " + r.newBuy + " " + ar(r.oldBuy, r.newBuy) + " | बेच: " + r.oldSell + " → " + r.newSell + " " + ar(r.oldSell, r.newSell)), E("div", "mut", new Date(r.t).toLocaleString("hi-IN")));
        L.append(d);
      });
    };
    k.oninput = fill;
    const c = E("button", "btn", "✖ बंद करें"); c.onclick = () => $("modal").classList.remove("on");
    box.append(k, L, c);
    $("modal").classList.add("on");
    fill();
  };
  hi.append(hb);

  const fb = sec("💬 सुझाव दें");
  fb.append(E("div", "mut", "ऐप में कोई कमी लगे या नया फ़ीचर चाहिए, तो लिखिए"));
  const ta = E("textarea"); ta.rows = 3;
  const sb = E("button", "btn", "📧 भेजें");
  sb.onclick = () => {
    if (!ta.value.trim()) return alert("पहले कुछ लिखिए");
    location.href = "mailto:rgoyal83556@gmail.com?subject=" + encodeURIComponent("Rate List सुझाव") + "&body=" + encodeURIComponent(ta.value);
  };
  fb.append(ta, sb);

  const lo = E("button", "btn btn2", "🚪 लॉगआउट", "color:#d32f2f");
  lo.onclick = () => { if (confirm("लॉगआउट करें?")) signOut(auth).then(() => location.reload()); };
  P.append(lo);
})();


/* ===== टुकड़ा 11: कैटेगरी ===== */
let ALLCATS = [], curCat = "";
const myCats = () => ALLCATS.filter((c) => (c.shop || "मेरी दुकान") === S.shop);
onSnapshot(collection(db, "cats"), (s) => {
  ALLCATS = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  drawCats();
  render();
});
window.catFilter = (arr) => {
  const c = ALLCATS.find((k) => k.id === curCat);
  return c ? arr.filter((x) => (c.items || []).includes(x.id)) : arr;
};
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
  const add = E("button", "pill", "➕ कैटेगरी");
  add.onclick = async () => {
    const n = prompt("नई कैटेगरी का नाम (जैसे तेल)");
    if (!n || !n.trim()) return;
    const r = await addDoc(collection(db, "cats"), { name: n.trim(), shop: S.shop, items: [] });
    editCat({ id: r.id, name: n.trim(), items: [] });
  };
  bar.append(add);
  if (myCats().length) bar.append(E("span", "mut", "बदलने के लिए देर तक दबाएँ", "flex:none;align-self:center"));
}
function editCat(c) {
  const sel = new Set(c.items || []);
  const box = $("modalBox");
  box.innerHTML = "";
  const q = E("input");
  q.placeholder = "🔍 सामान का नाम लिखिए";
  const list = E("div", "", null, "margin-top:8px");
  const ok = E("button", "btn", "✔️ हो गया");
  const del = E("button", "btn btn2", "🗑️ कैटेगरी हटाएँ", "color:#d32f2f");
  box.append(E("h3", "", "🏷️ " + c.name), q, list, ok, del);
  function draw() {
    list.innerHTML = "";
    const t = q.value.trim().toLowerCase();
    let arr = ITEMS.filter(mine);
    arr = t ? arr.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "")).toLowerCase().includes(t)) : arr.filter((x) => sel.has(x.id));
    if (!arr.length) list.append(E("div", "mut", t ? "कुछ नहीं मिला" : "ऊपर नाम लिखिए, सामान भाव के साथ दिखेगा, दबाकर जोड़िए"));
    arr.forEach((x) => {
      const on = sel.has(x.id);
      const r = E("div", "card", null, "padding:10px 12px;margin:6px 0;align-items:center" + (on ? ";outline:2px solid var(--acc)" : ""));
      const l = E("div");
      l.append(E("div", "nm", nm(x) + (x.size ? " (" + x.size + ")" : "")), E("div", "mut", (x.vendor || "—") + " • " + money(Number(x.sellPrice) || 0) + "/" + unitOf(x)));
      r.append(l, E("div", "", on ? "✅" : "➕", "font-size:24px"));
      r.onclick = () => { on ? sel.delete(x.id) : sel.add(x.id); draw(); };
      list.append(r);
    });
  }
  q.oninput = draw;
  draw();
  ok.onclick = () => { updateDoc(doc(db, "cats", c.id), { items: [...sel] }); $("modal").classList.remove("on"); };
  del.onclick = () => {
    if (!confirm(c.name + " हटाएँ?")) return;
    deleteDoc(doc(db, "cats", c.id));
    if (curCat === c.id) curCat = "";
    $("modal").classList.remove("on");
  };
  $("modal").classList.add("on");
}
$("shopSel").addEventListener("change", () => { curCat = ""; drawCats(); });
drawCats();

/* ===== लिस्ट का डिज़ाइन (हमेशा सबसे आख़िर में) ===== */
render = function () {
  const q = $("q").value.trim().toLowerCase();
  let arr = ITEMS.filter(mine);
  const vens = {}, best = {};
  arr.forEach((x) => {
    const v = x.vendor || "—";
    vens[v] = (vens[v] || 0) + 1;
    (best[keyOf(x)] = best[keyOf(x)] || []).push(Number(x.buyPrice) || 0);
  });
  const vb = $("venBar");
  vb.innerHTML = "";
  const all = E("button", "pill " + (curVen ? "" : "on"), "सब होलसेलर (" + arr.length + ")");
  all.onclick = () => { curVen = ""; render(); };
  vb.append(all);
  Object.keys(vens).sort().forEach((v) => {
    const b = E("button", "pill " + (curVen === v ? "on" : ""));
    b.append(E("span", "", "●", "color:" + vColor(v)), " " + v + " (" + vens[v] + ")");
    b.onclick = () => { curVen = v; render(); };
    vb.append(b);
  });
  if (curVen) arr = arr.filter((x) => (x.vendor || "—") === curVen);
  if (window.catFilter) arr = window.catFilter(arr);
  if (q) arr = arr.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "") + " " + (x.size || "")).toLowerCase().includes(q));
  const srt = { az: (a, b) => nm(a).localeCompare(nm(b)), new: (a, b) => (b.t || 0) - (a.t || 0), old: (a, b) => (a.t || 0) - (b.t || 0) };
  arr.sort(srt[S.sort] || srt.az);
  $("sortSel").value = S.sort;
  const L = $("list");
  L.innerHTML = "";
  if (!arr.length) L.append(E("div", "box", "कोई सामान नहीं मिला", "text-align:center"));
  arr.forEach((x) => {
    const g = best[keyOf(x)];
    const b = Number(x.buyPrice) || 0, s = Number(x.sellPrice) || 0, p = s - b;
    const cheap = g.length - 1 && b === Math.min(...g);
    const pct = b ? ((p / b) * 100).toFixed(1) : 0;
    const good = !(p < 0);
    const left = E("div");
    const nmD = E("div", "nm", nm(x));
    if (S.dual && x.alt) nmD.append(" ", E("span", "mut", "(" + x.alt + ")"));
    if (cheap) nmD.append(" ", E("span", "cheap", "✨ सबसे सस्ता"));
    left.append(nmD, E("span", "tag", x.vendor || "—", "background:" + vColor(x.vendor)));
    if (x.size) left.append(E("span", "tag size", x.size));
    left.append(E("div", "mut", "ख़रीद", "margin-top:6px"), E("div", "", money(b) + " /" + unitOf(x)));
    if (S.showPct) left.append(E("div", good ? "pro" : "loss", (good ? "मुनाफ़ा" : "घाटा") + ": " + money(Math.abs(p)) + " (" + pct + "%)"));
    const right = E("div");
    right.append(E("div", "mut", "बेच", "text-align:right"), E("div", "sell", money(s)), E("div", "mut", "/" + unitOf(x), "text-align:right"));
    const c = E("div", "card");
    c.append(left, right);
    c.onclick = () => window.openSheet && window.openSheet(x);
    L.append(c);
  });
};
render();


/* ===== टुकड़ा 12: भाव का इतिहास ===== */
(function () {
  const box = E("div", "box");
  const btn = E("button", "btn", "📈 भाव का इतिहास");
  box.append(E("h3", "", "📈 भाव का इतिहास", "margin:0"), E("div", "mut", "किस सामान का भाव कब बदला"), btn);
  $("pSet").append(box);
  const tir = (a, b) => ["🔻", "➖", "🔺"][Math.sign(b - a) + 1];
  btn.onclick = async () => {
    const snap = await getDocs(collection(db, "history"));
    const rows = snap.docs.map((d) => d.data()).filter((r) => (r.shop || "मेरी दुकान") === S.shop).sort((a, b) => b.t - a.t);
    const m = $("modalBox");
    m.innerHTML = "";
    const q = E("input");
    q.placeholder = "🔍 सामान या होलसेलर खोजें";
    const list = E("div", "", null, "margin-top:8px");
    const close = E("button", "btn btn2", "✖ बंद करें");
    m.append(E("h3", "", "📈 भाव का इतिहास"), q, list, close);
    function draw() {
      list.innerHTML = "";
      const t = q.value.trim().toLowerCase();
      const f = rows.filter((r) => !t || ((r.Item || "") + " " + (r.vendor || "")).toLowerCase().includes(t));
      if (!f.length) list.append(E("div", "mut", "अभी कोई बदलाव नहीं मिला। किसी सामान का भाव बदलेंगे, तो यहाँ दिखेगा।"));
      f.forEach((r) => {
        const d = new Date(r.t);
        const c = E("div", "card", null, "display:block;padding:10px 12px;margin:6px 0");
        c.append(
          E("div", "nm", (r.Item || "") + (r.size ? " (" + r.size + ")" : "")),
          E("span", "tag", r.vendor || "—", "background:" + vColor(r.vendor)),
          E("div", "", "ख़रीद: " + money(r.oldBuy) + " → " + money(r.newBuy) + " " + tir(r.oldBuy, r.newBuy)),
          E("div", "", "बेच: " + money(r.oldSell) + " → " + money(r.newSell) + " " + tir(r.oldSell, r.newSell)),
          E("div", "mut", "📅 " + d.toLocaleDateString("hi-IN") + "  ⏰ " + d.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }))
        );
        list.append(c);
      });
    }
    q.oninput = draw;
    close.onclick = () => $("modal").classList.remove("on");
    draw();
    $("modal").classList.add("on");
  };
})();

/* ===== इतिहास साफ़ करना ===== */
(function () {
  const hk = (x) => ((x.Item || "") + "|" + (x.vendor || "") + "|" + (x.shop || "मेरी दुकान")).toLowerCase();
  async function saaf(only) {
    const snap = await getDocs(collection(db, "history"));
    const live = new Set(ITEMS.map(hk));
    let n = 0;
    for (const d of snap.docs) {
      const r = d.data();
      if (only ? hk(r) === only : !live.has(hk(r))) { await deleteDoc(d.ref); n++; }
    }
    return n;
  }
  const b = E("button", "btn btn2", "🧹 हटाए गए सामान का इतिहास साफ़ करें");
  b.onclick = async () => alert("✔️ " + (await saaf()) + " पुरानी एंट्री हटाईं");
  $("pSet").append(b);
  const old = window.openSheet;
  window.openSheet = (x) => {
    old(x);
    const del = [...$("sheetBox").querySelectorAll("button")].find((k) => k.textContent.includes("हटाएँ"));
    if (!del) return;
    del.onclick = () => {
      if (!confirm(nm(x) + " हटाएँ?")) return;
      deleteDoc(doc(db, "items", x.id));
      saaf(hk(x));
      $("sheet").classList.remove("on");
    };
  };
})();


/* ===== डबल बटन हटाओ (सबसे नीचे) ===== */
(function () {
  const seen = {};
  $("pSet").querySelectorAll("button").forEach((b) => {
    const t = b.textContent;
    let k = "";
    if (t.includes("भाव का इतिहास") && !t.includes("साफ़")) k = "his";
    if (t.includes("Excel")) k = "xls";
    if (!k) return;
    if (!seen[k]) { seen[k] = 1; return; }
    const bx = b.closest(".box");
    (bx && bx.parentElement === $("pSet") ? bx : b).style.display = "none";
  });
})();


/* ===== नीचे वाला डबल इतिहास हटाओ ===== */
$("pSet").querySelectorAll("button").forEach((b) => {
  if (b.textContent.trim() !== "📈 भाव का इतिहास") return;
  const bx = b.closest(".box");
  (bx && bx.parentElement === $("pSet") ? bx : b).style.display = "none";
});

/* ===== स्कैनर का निशान ===== */
(function () {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "26");
  svg.setAttribute("height", "26");
  const add = (tag, at) => {
    const e = document.createElementNS(ns, tag);
    Object.entries(at).forEach(([k, v]) => e.setAttribute(k, v));
    svg.append(e);
  };
  const st = { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round" };
  add("path", { d: "M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3", ...st });
  [[6, 2], [9, 1], [11, 2], [14, 1], [16, 2]].forEach(([x, w]) =>
    add("rect", { x: x, y: 8, width: w, height: 8, fill: "currentColor" })
  );
  add("line", { x1: 4, y1: 12, x2: 20, y2: 12, stroke: "#e53935", "stroke-width": "1.5" });
  const b = $("qScan");
  b.textContent = "";
  b.append(svg);
  b.style.color = "var(--acc)";
})();


/* ===== छोटा A से Z डिब्बा ===== */
(function () {
  const s = $("sortSel");
  s.style.flex = "0 0 auto";
  s.style.width = "auto";
  s.style.maxWidth = "140px";
  s.style.padding = "8px 10px";
  s.style.fontSize = "14px";
})();

/* ===== WhatsApp और PDF के निशान ===== */
(function () {
  const ns = "http://www.w3.org/2000/svg";
  const mk = (kids) => {
    const s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("width", "28");
    s.setAttribute("height", "28");
    kids.forEach(([tag, at, txt]) => {
      const e = document.createElementNS(ns, tag);
      Object.entries(at).forEach(([k, v]) => e.setAttribute(k, v));
      if (txt) e.textContent = txt;
      s.append(e);
    });
    return s;
  };
  const wa = mk([
    ["path", { d: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z", fill: "#25D366" }],
    ["path", { d: "M8.5 7.5c.3-.6.6-.6 1-.6h.6c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.1.7l-.6.7c-.1.2-.1.3 0 .5a7 7 0 0 0 3.3 2.9c.2.1.4.1.5-.1l.8-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.3.3.6-.2 1.1-1.2 1.9-2.3 1.9A8 8 0 0 1 8 10c-.1-.9.1-1.8.5-2.5z", fill: "#fff" }]
  ]);
  const pdf = mk([
    ["path", { d: "M6 2h9l5 5v15H6z", fill: "#e53935" }],
    ["path", { d: "M15 2v5h5", fill: "#ffcdd2" }],
    ["text", { x: "13", y: "18", "font-size": "6.5", "font-weight": "bold", fill: "#fff", "text-anchor": "middle", "font-family": "Arial" }, "PDF"]
  ]);
  $("waBtn").textContent = "";
  $("waBtn").append(wa);
  $("pdfBtn").textContent = "";
  $("pdfBtn").append(pdf);
})();
/* ===== छोटा सुधार: WhatsApp, PDF, माइक, स्कैनर ===== */
(function () {
  const all = () => {
    let a = ITEMS.filter(mine);
    if (curVen) a = a.filter((x) => (x.vendor || "—") === curVen);
    if (window.catFilter) a = window.catFilter(a);
    const q = $("q").value.trim().toLowerCase();
    if (q) a = a.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "") + " " + (x.size || "")).toLowerCase().includes(q));
    return a.sort((p, r) => nm(p).localeCompare(nm(r)));
  };
  const line = (x) => nm(x) + (S.dual && x.alt ? " (" + x.alt + ")" : "") + (x.size ? " - " + x.size : "");
  $("waBtn").onclick = () => {
    const a = all();
    if (!a.length) return alert("लिस्ट ख़ाली है");
    const m = "*" + S.shop + " - रेट लिस्ट*\n" + a.map((x) => "• " + line(x) + ": " + money(Number(x.sellPrice) || 0) + "/" + unitOf(x)).join("\n");
    window.open("https://wa.me/?text=" + encodeURIComponent(m), "_blank");
  };
  const pst = document.createElement("style");
  pst.textContent = "#printArea{display:none}@media print{body>*{display:none!important}#printArea{display:block!important;color:#000;background:#fff;padding:10px}#printArea table{width:100%;border-collapse:collapse}#printArea td,#printArea th{border:1px solid #999;padding:6px;text-align:left}}";
  document.head.append(pst);
  const pa = E("div");
  pa.id = "printArea";
  document.body.append(pa);
  $("pdfBtn").onclick = () => {
    const a = all();
    if (!a.length) return alert("लिस्ट ख़ाली है");
    pa.innerHTML = "";
    pa.append(E("h2", "", S.shop + " - रेट लिस्ट"), E("div", "", new Date().toLocaleDateString("hi-IN")));
    const t = E("table"), h = E("tr");
    ["#", "सामान", "भाव"].forEach((s) => h.append(E("th", "", s)));
    t.append(h);
    a.forEach((x, i) => {
      const r = E("tr");
      r.append(E("td", "", String(i + 1)), E("td", "", line(x)), E("td", "", money(Number(x.sellPrice) || 0) + "/" + unitOf(x)));
      t.append(r);
    });
    pa.append(t);
    setTimeout(() => window.print(), 200);
  };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const listen = (inp, btn) => {
    if (!SR) return alert("इस फ़ोन में आवाज़ से लिखना नहीं चलता");
    const r = new SR();
    r.lang = inp.type === "number" ? "en-IN" : "hi-IN";
    btn.classList.add("sun");
    r.onend = () => btn.classList.remove("sun");
    r.onresult = (e) => {
      let t = e.results[0][0].transcript.trim();
      if (inp.type === "number") t = (t.replace(/,/g, "").match(/[\d.]+/) || [""])[0];
      inp.value = t;
      if (inp.id === "q") render();
    };
    r.onerror = (e) => { btn.classList.remove("sun"); if (e.error !== "no-speech") alert("माइक: " + e.error); };
    r.start();
  };
  $("qMic").onclick = () => listen($("q"), $("qMic"));
  document.querySelectorAll(".mic[data-for]").forEach((b) => (b.onclick = (e) => { e.preventDefault(); listen($(b.dataset.for), b); }));
  $("qScan").onclick = async () => {
    const done = window.scanTarget || ((code) => {
      const hit = ITEMS.find((x) => x.code === code);
      if (hit) window.openSheet(hit); else alert("यह बारकोड किसी सामान से नहीं जुड़ा: " + code);
    });
    window.scanTarget = null;
    if (!("BarcodeDetector" in window)) return alert("इस फ़ोन में स्कैनर नहीं चलता");
    const box = $("modalBox");
    box.innerHTML = "";
    const v = E("video", "", null, "width:100%;border-radius:12px");
    v.setAttribute("playsinline", "");
    v.muted = true;
    const c = E("button", "btn btn2", "✖ बंद करें");
    box.append(E("h3", "", "📷 बारकोड स्कैन करें"), v, c);
    $("modal").classList.add("on");
    let st, on = true;
    const stop = () => { on = false; if (st) st.getTracks().forEach((t) => t.stop()); $("modal").classList.remove("on"); };
    c.onclick = stop;
    try {
      st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      v.srcObject = st;
      await v.play();
    } catch (e) { stop(); return alert("कैमरा नहीं खुला: " + e.message); }
    const det = new BarcodeDetector();
    const loop = async () => {
      if (!on || !$("modal").classList.contains("on")) return stop();
      try { const r = await det.detect(v); if (r.length) { stop(); return done(r[0].rawValue); } } catch (e) {}
      setTimeout(loop, 300);
    };
    loop();
  };
})();
/* ===== दुकान का नाम बदलना (पेंसिल) ===== */
(function () {
  const DEF = "मेरी दुकान";
  const sel = $("shopSel");
  const pen = E("button", "ibtn", "✏️", "width:40px;height:40px;background:#fff3;color:#fff;margin-left:6px");
  sel.after(pen);
  const hideDef = () => {
    if (!S.defGone) return;
    [...sel.options].forEach((o) => { if (o.value === DEF) o.remove(); });
  };
  new MutationObserver(hideDef).observe(sel, { childList: true });
  hideDef();
  pen.onclick = async () => {
    const old = S.shop;
    const n = (prompt("दुकान का नया नाम लिखिए", old) || "").trim();
    if (!n || n === old) return;
    if ([...sel.options].some((o) => o.value === n)) return alert("इस नाम की दुकान पहले से है");
    pen.disabled = true;
    try {
      const same = (x) => (x.shop || DEF) === old;
      for (const c of ["items", "cats", "history"]) {
        const s = await getDocs(collection(db, c));
        for (const d of s.docs) if (same(d.data())) await updateDoc(d.ref, { shop: n });
      }
      const sh = await getDocs(collection(db, "shops"));
      const f = sh.docs.find((d) => d.data().name === old);
      if (f) await updateDoc(f.ref, { name: n });
      else await addDoc(collection(db, "shops"), { name: n });
      if (old === DEF) S.defGone = true;
      S.shop = n;
      saveS();
      alert("✔️ दुकान का नाम बदल गया: " + n);
      location.reload();
    } catch (e) {
      alert("नाम नहीं बदला: " + e.message);
    }
    pen.disabled = false;
  };
})();
/* ===== भाषा: हिंदी / English ===== */
(function () {
  const D = {
    "लोड हो रहा है...": "Loading...", "सिर्फ़ अपना मोबाइल नंबर": "Your mobile number", "OTP भेजें": "Send OTP",
    "OTP डालें": "Enter OTP", "लॉगिन करें": "Login", "ऑनलाइन": "Online", "ऑफ़लाइन": "Offline",
    "सामान या होलसेलर खोजें": "Search item or wholesaler", "A से Z": "A to Z", "नया पहले": "Newest first",
    "पुराना पहले": "Oldest first", "वापस": "Back", "नया सामान जोड़ें": "Add new item", "होलसेलर का नाम": "Wholesaler name",
    "मात्रा / साइज़ (जैसे 1 किलो पैकेट, 6 पीस)": "Quantity / size (e.g. 1 kg packet, 6 pieces)",
    "ख़रीद भाव": "Buy price", "बेच भाव": "Sell price", "सेव करें": "Save", "लिस्ट": "List", "सेटिंग": "Settings",
    "PIN डालें": "Enter PIN", "खोलें": "Unlock", "सब होलसेलर": "All wholesalers", "कोई सामान नहीं मिला": "No items found",
    "सबसे सस्ता": "Cheapest", "मुनाफ़ा / घाटा % दिखाएँ": "Show profit / loss %", "मुनाफ़ा": "Profit", "घाटा": "Loss",
    "नई दुकान का नाम": "New shop name", "नई दुकान": "New shop", "मेरी दुकान": "My shop", "सामान बदलें": "Edit item",
    "WhatsApp पर भेजें": "Send on WhatsApp", "बारकोड जोड़ें": "Add barcode", "बारकोड जुड़ गया": "Barcode added",
    "कैटेगरी हटाएँ": "Delete category", "PIN बदलें / हटाएँ": "Change / remove PIN", "बदलें": "Edit", "हटाएँ": "Delete",
    "दिखावट": "Display", "नाम के साथ ब्रैकेट में दूसरी भाषा": "Other language name in brackets", "डार्क मोड": "Dark mode",
    "मोटे अक्षर": "Bold text", "अक्षरों का आकार": "Text size", "रंग चुनें": "Choose colour", "मुद्रा": "Currency",
    "चालू": "On", "बंद करें": "Close", "बंद": "Off", "PIN लॉक": "PIN lock", "PIN लगाएँ": "Set PIN",
    "नया 4 अंक का PIN डालें (हटाना हो तो ख़ाली छोड़ें)": "New 4-digit PIN (leave empty to remove)",
    "PIN लग गया": "PIN set", "PIN हटा दिया": "PIN removed", "PIN गलत है": "Wrong PIN", "Excel से सामान": "Import from Excel",
    "कॉलम क्रम: सामान, होलसेलर, साइज़, यूनिट, ख़रीद, बेच": "Columns: Item, Wholesaler, Size, Unit, Buy, Sell",
    "नमूना फ़ाइल": "Sample file", "नए सामान जुड़े (डबल वाले छोड़ दिए)": "new items added (duplicates skipped)",
    "फ़ाइल नहीं पढ़ी गई": "Could not read file", "भाव का इतिहास": "Price history", "इतिहास देखें": "View history",
    "किस सामान का भाव कब बदला": "When each item's price changed",
    "अभी कोई बदलाव नहीं मिला। किसी सामान का भाव बदलेंगे, तो यहाँ दिखेगा।": "No changes yet. Change an item's price and it will show here.",
    "अभी कोई बदलाव नहीं": "No changes yet", "हटाए गए सामान का इतिहास साफ़ करें": "Clear history of deleted items",
    "पुरानी एंट्री हटाईं": "old entries removed", "सुझाव दें": "Feedback",
    "ऐप में कोई कमी लगे या नया फ़ीचर चाहिए, तो लिखिए": "Tell us what to improve or which feature you need",
    "पहले कुछ लिखिए": "Write something first", "भेजें": "Send", "लॉगआउट करें?": "Logout?", "लॉगआउट": "Logout",
    "नई कैटेगरी का नाम (जैसे तेल)": "New category name (e.g. Oil)", "कैटेगरी": "Category",
    "बदलने के लिए देर तक दबाएँ": "Long-press to edit", "सामान का नाम लिखिए": "Type item name", "कुछ नहीं मिला": "Nothing found",
    "ऊपर नाम लिखिए, सामान भाव के साथ दिखेगा, दबाकर जोड़िए": "Type a name above, tap an item to add it",
    "हो गया": "Done", "सही नंबर डालें": "Enter a valid number", "OTP भेज दिया": "OTP sent", "OTP गलत है": "Wrong OTP",
    "सामान का नाम डालें": "Enter item name", "सामान का नाम": "Item name", "रेट लिस्ट": "Rate List", "लिस्ट ख़ाली है": "List is empty",
    "इस फ़ोन में आवाज़ से लिखना नहीं चलता": "Voice typing does not work on this phone", "माइक": "Mic",
    "यह बारकोड किसी सामान से नहीं जुड़ा": "No item has this barcode", "इस फ़ोन में स्कैनर नहीं चलता": "Scanner does not work on this phone",
    "बारकोड स्कैन करें": "Scan barcode", "कैमरा नहीं खुला": "Camera error", "दुकान का नया नाम लिखिए": "Type the new shop name",
    "इस नाम की दुकान पहले से है": "A shop with this name already exists", "दुकान का नाम बदल गया": "Shop name changed",
    "नाम नहीं बदला": "Name not changed", "सामान खोजें": "Search item", "भाषा": "Language",
    "ख़रीद": "Buy", "बेच": "Sell", "भाव": "Rate", "जोड़ें": "Add", "यूनिट": "Unit", "सामान": "Item", "होलसेलर": "Wholesaler",
    "किलो": "Kg", "ग्राम": "Gram", "लीटर": "Litre", "पीस": "Piece", "पैकेट": "Packet", "दर्जन": "Dozen", "डिब्बा": "Box", "बोरी": "Bag"
  };
  const KEYS = Object.keys(D).sort((a, b) => b.length - a.length);
  const tr = (s) => { if (!s || !/[\u0900-\u097F]/.test(s)) return s; for (const k of KEYS) if (s.includes(k)) s = s.split(k).join(D[k]); return s; };

  const pick = (box, before) => {
    const r = E("div", "row", null, "margin:8px 0 12px");
    [["hi", "हिंदी"], ["en", "English"]].forEach(([v, t]) => {
      const b = E("button", "pill" + ((S.lang || "hi") === v ? " on" : ""), t, "flex:1");
      b.dataset.keep = "1";
      b.onclick = () => { if ((S.lang || "hi") !== v) { S.lang = v; saveS(); location.reload(); } };
      r.append(b);
    });
    before ? box.insertBefore(r, before) : box.append(r);
  };
  const lb = E("div", "box");
  const lh = E("h3", "", "🌐 भाषा / Language", "margin:0 0 8px");
  lh.dataset.keep = "1";
  lb.append(lh);
  pick(lb);
  $("pSet").prepend(lb);
  const lg = $("login").querySelector(".box");
  if (lg) pick(lg, lg.querySelector(".row"));

  if (S.lang !== "en") return;
  const exactOnly = (el) => el && !el.closest(".cheap") && el.closest(".nm, .tag, [data-keep]");
  const fix = (n) => {
    if (n.nodeType === 3) {
      const p = n.parentElement;
      if (p && p.closest("#shopSel")) { if (D[n.data.trim()]) n.data = D[n.data.trim()]; return; }
      if (exactOnly(p)) return;
      const v = tr(n.data);
      if (v !== n.data) n.data = v;
      return;
    }
    if (n.nodeType !== 1) return;
    if (n.tagName === "OPTION" && !n.hasAttribute("value")) n.value = n.textContent;
    if (n.placeholder) n.placeholder = tr(n.placeholder);
    n.querySelectorAll("option:not([value])").forEach((o) => (o.value = o.textContent));
    n.querySelectorAll("[placeholder]").forEach((x) => (x.placeholder = tr(x.placeholder)));
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    const list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(fix);
  };
  fix(document.body);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(fix))).observe(document.body, { childList: true, subtree: true });
  const a = window.alert, c = window.confirm, p = window.prompt, o = window.open;
  window.alert = (m) => a(tr(String(m)));
  window.confirm = (m) => c(tr(String(m)));
  window.prompt = (m, d) => p(tr(String(m)), d);
  window.open = (u, ...r) => {
    if (String(u).includes("wa.me/?text=")) { const [h, t] = String(u).split("text="); u = h + "text=" + encodeURIComponent(tr(decodeURIComponent(t))); }
    return o(u, ...r);
  };
})();
/* ===== तीन सुधार: खोज, माइक की भाषा, WhatsApp लिस्ट ===== */
(function () {
  $("q").oninput = () => render();

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    const st = SR.prototype.start;
    SR.prototype.start = function () {
      if (S.lang === "en" && this.lang === "hi-IN") this.lang = "en-IN";
      return st.call(this);
    };
  }

  $("waBtn").onclick = () => {
    let a = ITEMS.filter(mine);
    if (curVen) a = a.filter((x) => (x.vendor || "—") === curVen);
    if (window.catFilter) a = window.catFilter(a);
    const q = $("q").value.trim().toLowerCase();
    if (q) a = a.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "") + " " + (x.size || "")).toLowerCase().includes(q));
    const srt = { az: (p, r) => nm(p).localeCompare(nm(r)), new: (p, r) => (r.t || 0) - (p.t || 0), old: (p, r) => (p.t || 0) - (r.t || 0) };
    a.sort(srt[S.sort] || srt.az);
    if (!a.length) return alert("लिस्ट ख़ाली है");
    const rows = a.map((x, i) =>
      (i + 1) + ". " + nm(x) + (S.dual && x.alt ? " (" + x.alt + ")" : "") + (x.size ? " [" + x.size + "]" : "") +
      " - *" + money(Number(x.sellPrice) || 0) + "*/" + unitOf(x));
    const m = "*" + S.shop + " - रेट लिस्ट*\n📅 " + new Date().toLocaleDateString("en-IN") + "\n\n" + rows.join("\n");
    window.open("https://wa.me/?text=" + encodeURIComponent(m), "_blank");
  };
})();
/* ===== दुकान हटाना + पूरा रंग बदलना ===== */
(function () {
  const DEF = "मेरी दुकान";
  const sel = $("shopSel");
  const del = E("button", "ibtn", "🗑️", "width:40px;height:40px;background:#fff3;color:#fff;margin-left:6px");
  const pen = sel.parentElement.querySelector("button.ibtn");
  (pen || sel).after(del);
  del.onclick = async () => {
    const name = S.shop;
    const others = [...sel.options].map((o) => o.value).filter((v) => v && v !== "__new" && v !== name);
    if (!others.length) return alert("कम से कम एक दुकान रहनी चाहिए, इसे नहीं हटा सकते");
    const same = (x) => (x.shop || DEF) === name;
    const n = ITEMS.filter(same).length;
    if (!confirm('"' + name + '" दुकान हटाएँ?')) return;
    if (n && !confirm("⚠️ इस दुकान में " + n + " सामान हैं। ये सब भी हमेशा के लिए मिट जाएँगे। पक्का हटाएँ?")) return;
    del.disabled = true;
    try {
      for (const c of ["items", "cats", "history"]) {
        const s = await getDocs(collection(db, c));
        for (const d of s.docs) if (same(d.data())) await deleteDoc(d.ref);
      }
      const sh = await getDocs(collection(db, "shops"));
      for (const d of sh.docs) if (d.data().name === name) await deleteDoc(d.ref);
      if (name === DEF) S.defGone = true;
      S.shop = others[0];
      saveS();
      alert("✔️ दुकान हटा दी");
      location.reload();
    } catch (e) {
      alert("दुकान नहीं हटी: " + e.message);
    }
    del.disabled = false;
  };

  const st = document.createElement("style");
  st.textContent = ".cheap{background:linear-gradient(90deg,var(--acc),var(--acc2))!important}.cheap{animation:none!important}";
  document.head.append(st);
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.append(meta); }
  const sync = () => { meta.content = (THEMES[S.theme] || THEMES.orange)[0]; };
  sync();
  document.addEventListener("click", () => setTimeout(sync, 50));
})();
/* ===== पहले से सेव सामान की चेतावनी ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const k = (s) => String(s || "").trim().toLowerCase();
  const find = () => {
    const n = k($("fName").value), v = k($("fVen").value), z = k($("fSize").value);
    if (!n) return null;
    return ITEMS.filter(mine).find((x) => k(nm(x)) === n && k(x.vendor) === v && k(x.size) === z) || null;
  };
  const hint = E("div", "", null, "display:none;margin-top:10px;padding:10px 12px;border-radius:12px;background:#fff3e0;color:#8a4b00;font-weight:600");
  $("saveItem").before(hint);
  const show = () => {
    const m = editId ? null : find();
    if (!m) { hint.style.display = "none"; return; }
    hint.textContent = "⚠️ " + T("ये सामान पहले से सेव है", "Already saved") + ": " + nm(m) + (m.vendor ? " (" + m.vendor + ")" : "") + " • " +
      T("ख़रीद", "Buy") + " " + money(Number(m.buyPrice) || 0) + " • " + T("बेच", "Sell") + " " + money(Number(m.sellPrice) || 0);
    hint.style.display = "block";
  };
  ["fName", "fVen", "fSize"].forEach((id) => { $(id).addEventListener("input", show); $(id).addEventListener("change", show); });
  document.querySelectorAll(".mic[data-for]").forEach((b) => b.addEventListener("click", () => setTimeout(show, 4000)));
  document.querySelector('nav button[data-p="pAdd"]').addEventListener("click", () => setTimeout(show, 50));

  const orig = $("saveItem").onclick;
  $("saveItem").onclick = () => {
    const m = editId ? null : find();
    if (!m) { hint.style.display = "none"; return orig(); }
    const box = $("modalBox");
    box.innerHTML = "";
    const b1 = E("button", "btn", "✏️ " + T("पुराने का भाव बदलें", "Update the saved one"));
    const b2 = E("button", "btn btn2", "➕ " + T("फिर भी नया जोड़ें", "Add as new anyway"));
    const b3 = E("button", "btn btn2", "✖ " + T("रहने दें", "Cancel"));
    box.append(
      E("h3", "", "⚠️ " + T("ये सामान पहले से सेव है", "This item is already saved"), "margin:0 0 8px"),
      E("div", "nm", nm(m) + (m.size ? " (" + m.size + ")" : "")),
      E("div", "mut", (m.vendor || "—") + " • " + T("ख़रीद", "Buy") + " " + money(Number(m.buyPrice) || 0) + " • " + T("बेच", "Sell") + " " + money(Number(m.sellPrice) || 0) + "/" + unitOf(m)),
      b1, b2, b3
    );
    $("modal").classList.add("on");
    b1.onclick = () => {
      $("modal").classList.remove("on");
      if ($("fUnit").value === UNITS[0] && m.unit) $("fUnit").value = m.unit;
      if (!$("fBuy").value) $("fBuy").value = m.buyPrice || "";
      if (!$("fSell").value) $("fSell").value = m.sellPrice || "";
      editId = m.id; editOld = { b: Number(m.buyPrice) || 0, s: Number(m.sellPrice) || 0 }; hint.style.display = "none"; orig(); };
    b2.onclick = () => { $("modal").classList.remove("on"); hint.style.display = "none"; orig(); };
    b3.onclick = () => $("modal").classList.remove("on");
  };
})();
/* ===== फ़ोटो से भरें (AI) ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const KEY = () => localStorage.getItem("rlKey") || "";
  const k = (s) => String(s || "").trim().toLowerCase();
  const API = "https://generativelanguage.googleapis.com/v1beta/";

  const sb = E("div", "box");
  sb.append(E("h3", "", "🤖 " + T("AI चाबी (फ़ोटो से भरने के लिए)", "AI key (for fill from photo)"), "margin:0 0 8px"));
  const st = E("div", "mut");
  const ki = E("input");
  ki.type = "password";
  ki.placeholder = T("यहाँ चाबी पेस्ट करें (AIza...)", "Paste key here (AIza...)");
  const kb = E("button", "btn", "💾 " + T("चाबी सेव करें", "Save key"));
  const paint = () => (st.textContent = KEY() ? "✔️ " + T("चाबी लगी है (...", "Key saved (...") + KEY().slice(-4) + ")" : T("अभी कोई चाबी नहीं लगी", "No key yet"));
  kb.onclick = () => { localStorage.setItem("rlKey", ki.value.trim()); ki.value = ""; paint(); alert(KEY() ? "✔️ " + T("चाबी सेव हो गई", "Key saved") : T("चाबी हटा दी", "Key removed")); };
  paint();
  sb.append(st, ki, kb);
  $("pSet").append(sb);

  const fb = E("button", "btn", "📷 " + T("फ़ोटो से भरें", "Fill from photo"), "margin:10px 0 0");
  $("backAdd").after(fb);
  const fi = E("input");
  fi.type = "file";
  fi.accept = "image/*";
  fi.style.display = "none";
  document.body.append(fi);

  const small = (file) => new Promise((ok, bad) => {
    const img = new Image();
    img.onload = () => {
      const m = 1600, r = Math.min(1, m / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = bad;
    img.src = URL.createObjectURL(file);
  });

  let MODEL = "";
  const pickModel = async () => {
    if (MODEL) return MODEL;
    try {
      const r = await fetch(API + "models?pageSize=200", { headers: { "x-goog-api-key": KEY() } });
      const j = await r.json();
      const ok = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent") && /flash/i.test(m.name) && !/(image|tts|audio|live|embed|lite|preview|exp)/i.test(m.name));
      if (!ok.length) ok.push(...(j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent") && /flash/i.test(m.name) && !/(image|tts|audio|live|embed)/i.test(m.name)));
      ok.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }));
      MODEL = ok.length ? ok[0].name : "models/gemini-2.5-flash";
    } catch (e) { MODEL = "models/gemini-2.5-flash"; }
    return MODEL;
  };

  const read = async (dataUrl) => {
    const names = [...new Set(ITEMS.filter(mine).map(nm))].slice(0, 300).join(", ");
    const vens = [...new Set(ITEMS.filter(mine).map((x) => x.vendor).filter(Boolean))].join(", ");
    const prompt = "This photo is a handwritten or printed price list from an Indian grocery (pansari) shop, in Hindi and/or English. " +
      "Read every item line. For each line return: name (item name exactly as written), vendor (wholesaler name if written, else empty), size (pack/quantity like '1 किलो', '500g', else empty), " +
      "unit (one of: " + UNITS.join(", ") + "; pick the closest, default किलो), buy (purchase price number or null), sell (selling price number or null), unsure (true if any part of this line was hard to read). " +
      "If a line has only one price, put it in buy. Never invent items. Prefer these existing item names when the written name clearly means the same thing: " + names + ". Existing wholesalers: " + vens + ". " +
      "Return only a JSON array.";
    const model = await pickModel();
    const r = await fetch(API + model + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": KEY() },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: dataUrl.split(",")[1] } }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0 }
      })
    });
    const j = await r.json();
    if (j.error) throw new Error(j.error.message);
    const txt = (((j.candidates || [])[0] || {}).content || {}).parts?.map((p) => p.text || "").join("") || "[]";
    const arr = JSON.parse(txt.replace(/^[^\[]*/, "").replace(/[^\]]*$/, ""));
    return Array.isArray(arr) ? arr : [];
  };

  const findOld = (n, v, z) => ITEMS.filter(mine).find((x) => k(nm(x)) === k(n) && k(x.vendor) === k(v) && k(x.size) === k(z));

  const review = (dataUrl, rows) => {
    const box = $("modalBox");
    box.innerHTML = "";
    const pic = E("img", "", null, "width:100%;max-height:220px;object-fit:contain;border-radius:12px;background:#0001");
    pic.src = dataUrl;
    pic.onclick = () => (pic.style.maxHeight = pic.style.maxHeight ? "" : "220px");
    const dv = E("input");
    dv.placeholder = T("सबका होलसेलर (जिनमें ख़ाली है)", "Wholesaler for all blank rows");
    dv.setAttribute("list", "venList");
    const list = E("div");
    const save = E("button", "btn", "");
    const cancel = E("button", "btn btn2", "✖ " + T("रहने दें", "Cancel"));
    box.append(E("h3", "", "📷 " + T("जाँचें और ठीक करें", "Check and correct"), "margin:0 0 6px"),
      E("div", "mut", T("फ़ोटो दबाकर बड़ी करें। पीले वाले ध्यान से देखें।", "Tap photo to enlarge. Check yellow rows carefully.")), pic, dv, list, save, cancel);
    const R = [];
    const count = () => (save.textContent = "✔️ " + T("सब सेव करें", "Save all") + " (" + R.filter((r) => !r.gone && r.n.value.trim()).length + ")");
    rows.forEach((x) => {
      const c = E("div", "card", null, "display:block;padding:10px;margin:8px 0" + (x.unsure ? ";background:#fff8d6;outline:2px solid #ffb300" : ""));
      const inp = (v, ph, w, type) => { const i = E("input", "", null, "padding:8px;margin:3px 0;width:" + w); i.value = v == null ? "" : v; i.placeholder = ph; if (type) { i.type = type; i.inputMode = "decimal"; } return i; };
      const n = inp(x.name, T("सामान", "Item"), "100%");
      const v = inp(x.vendor, T("होलसेलर", "Wholesaler"), "49%"); v.setAttribute("list", "venList");
      const z = inp(x.size, T("साइज़", "Size"), "49%");
      const u = E("select", "", null, "padding:8px;margin:3px 0;width:32%");
      UNITS.forEach((o) => { const op = E("option", "", o); op.value = o; u.append(op); });
      u.value = UNITS.includes(x.unit) ? x.unit : UNITS[0];
      const b = inp(x.buy, T("ख़रीद", "Buy"), "32%", "number");
      const s = inp(x.sell, T("बेच", "Sell"), "32%", "number");
      const note = E("div", "mut", "", "margin-top:4px");
      const del = E("button", "pill", "✖ " + T("हटाएँ", "Remove"), "margin-top:4px");
      const r = { n, v, z, u, b, s, gone: false };
      const chk = () => {
        const o = findOld(n.value, v.value || dv.value, z.value);
        r.old = o;
        if (!o) { note.textContent = n.value.trim() ? "🆕 " + T("नया सामान", "New item") : ""; note.style.color = ""; return; }
        const ob = Number(o.buyPrice) || 0, nb = Number(b.value) || 0;
        const big = ob && nb && (nb > ob * 3 || nb < ob / 3);
        note.textContent = (big ? "⚠️ " + T("भाव बहुत अलग है! ", "Price very different! ") : "♻️ ") + T("पहले से है, भाव बदलेगा", "Already saved, price will update") + " (" + T("पुराना", "old") + " " + money(ob) + ")";
        note.style.color = big ? "#d32f2f" : "";
      };
      [n, v, z, b].forEach((i) => i.addEventListener("input", () => { chk(); count(); }));
      dv.addEventListener("input", chk);
      del.onclick = () => { r.gone = true; c.remove(); count(); };
      const row = (...a) => { const d = E("div", "", null, "display:flex;gap:2%;flex-wrap:wrap"); d.append(...a); return d; };
      const lab = row(E("span", "mut", T("यूनिट", "Unit"), "width:32%"), E("span", "mut", T("ख़रीद", "Buy"), "width:32%"), E("span", "mut", T("बेच", "Sell"), "width:32%"));
      c.append(n, row(v, z), lab, row(u, b, s), note, del);
      list.append(c);
      R.push(r);
      chk();
    });
    if (!rows.length) list.append(E("div", "box", T("फ़ोटो में कोई सामान नहीं पढ़ा गया। साफ़ फ़ोटो फिर से खींचें।", "No items could be read. Take a clearer photo."), "text-align:center"));
    count();
    cancel.onclick = () => $("modal").classList.remove("on");
    save.onclick = async () => {
      const todo = R.filter((r) => !r.gone && r.n.value.trim());
      if (!todo.length) return;
      if (!confirm(todo.length + " " + T("सामान सेव करें?", "items will be saved. Continue?"))) return;
      save.disabled = true;
      let a = 0, u = 0;
      for (const r of todo) {
        const name = r.n.value.trim(), vendor = (r.v.value.trim() || dv.value.trim()), size = r.z.value.trim();
        const old = findOld(name, vendor, size);
        const nb = r.b.value === "" ? (old ? Number(old.buyPrice) || 0 : 0) : Number(r.b.value) || 0;
        const ns = r.s.value === "" ? (old ? Number(old.sellPrice) || 0 : 0) : Number(r.s.value) || 0;
        const d = { Item: name, vendor, size, unit: r.u.value, buyPrice: nb, sellPrice: ns, shop: S.shop };
        try {
          if (old) {
            await updateDoc(doc(db, "items", old.id), d);
            const ob = Number(old.buyPrice) || 0, os = Number(old.sellPrice) || 0;
            if (ob !== nb || os !== ns) await addDoc(collection(db, "history"), { Item: name, vendor, unit: d.unit, size, shop: S.shop, oldBuy: ob, newBuy: nb, oldSell: os, newSell: ns, t: Date.now() });
            u++;
          } else {
            d.t = Date.now();
            try { d.alt = /[\u0900-\u097F]/.test(name) ? toEng(name) : await toHindi(name); } catch (e) {}
            await addDoc(collection(db, "items"), d);
            a++;
          }
        } catch (e) { alert("Error: " + e.message); }
      }
      $("modal").classList.remove("on");
      alert("✔️ " + a + " " + T("नए जुड़े", "added") + ", " + u + " " + T("के भाव बदले", "updated"));
      go("pList");
    };
    $("modal").classList.add("on");
  };

  fb.onclick = () => {
    if (!KEY()) return alert(T("पहले सेटिंग में AI चाबी डालें", "First add the AI key in Settings"));
    fi.value = "";
    fi.click();
  };
  fi.onchange = async () => {
    const f = fi.files[0];
    if (!f) return;
    const box = $("modalBox");
    box.innerHTML = "";
    box.append(E("div", "", null, "text-align:center;padding:20px"));
    box.firstChild.append(E("div", "tarazu", "⚖️"), E("div", "", T("फ़ोटो पढ़ी जा रही है... (10-30 सेकंड)", "Reading photo... (10-30 seconds)")));
    $("modal").classList.add("on");
    try {
      const url = await small(f);
      const rows = await read(url);
      review(url, rows);
    } catch (e) {
      $("modal").classList.remove("on");
      alert(T("फ़ोटो नहीं पढ़ी गई: ", "Could not read photo: ") + e.message);
    }
  };
})();
/* ===== AI मॉडल सुधार + सीधा कैमरा ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const clean = (s) => String(s || "").replace(/[^\x21-\x7E]/g, "");
  if (localStorage.getItem("rlKey")) localStorage.setItem("rlKey", clean(localStorage.getItem("rlKey")));

  const of = window.fetch.bind(window);
  const swap = (u, m) => u.replace(/models\/[^:\/?]+:generateContent/, m + ":generateContent");
  window.fetch = async (url, opt) => {
    if (typeof url !== "string" || !url.includes("generativelanguage.googleapis.com")) return of(url, opt);
    opt = Object.assign({}, opt || {});
    const h = Object.assign({}, opt.headers || {});
    if (h["x-goog-api-key"]) h["x-goog-api-key"] = clean(h["x-goog-api-key"]);
    opt.headers = h;
    const gen = url.includes(":generateContent");
    const saved = localStorage.getItem("rlModel");
    if (gen && saved) url = swap(url, saved);
    let r = await of(url, opt);
    if (gen && !r.ok) {
      const j = await r.clone().json().catch(() => null);
      const msg = (j && j.error && j.error.message) || "";
      const m = /use\s+(models\/[\w.\-]+)/i.exec(msg);
      const next = m ? m[1].replace(/[.\-]+$/, "") : (!saved && /not found|no longer|not supported/i.test(msg) ? "models/gemini-3.8-flash" : "");
      if (next && !url.includes(next + ":")) {
        localStorage.setItem("rlModel", next);
        r = await of(swap(url, next), opt);
      }
    }
    return r;
  };

  const fb = [...document.querySelectorAll("#pAdd button")].find((b) => /फ़ोटो से भरें|Fill from photo/.test(b.textContent));
  const fi = document.querySelector('body > input[type="file"][accept="image/*"]');
  if (fb && fi) {
    fb.textContent = "🖼️ " + T("गैलरी से भरें", "Fill from gallery");
    fb.classList.add("btn2");
    const cam = E("button", "btn", "📷 " + T("कैमरे से भरें", "Fill from camera"), "margin:10px 0 0");
    fb.before(cam);
    cam.onclick = () => {
      if (!localStorage.getItem("rlKey")) return alert(T("पहले सेटिंग में AI चाबी डालें", "First add the AI key in Settings"));
      fi.value = "";
      fi.setAttribute("capture", "environment");
      fi.click();
      setTimeout(() => fi.removeAttribute("capture"), 1500);
    };
  }
})();

/* ===== फ़्री कोटा वाला मॉडल चुनना ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const prev = window.fetch;
  const BAD = /(omni|pro|ultra|image|tts|audio|live|embed|exp|preview)/i;
  let list = null;
  const getList = async (opt) => {
    if (list) return list;
    list = [];
    try {
      const r = await prev("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: opt.headers });
      const j = await r.json();
      list = (j.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent") && /gemini-[\d.]+-flash(-lite)?$/i.test(m.name) && !BAD.test(m.name))
        .map((m) => m.name)
        .sort((a, b) => (/lite/.test(a) - /lite/.test(b)) || b.localeCompare(a, undefined, { numeric: true }));
    } catch (e) {}
    return list;
  };
  const why = async (r) => { const j = await r.clone().json().catch(() => null); return (j && j.error && j.error.message) || ""; };
  window.fetch = async (url, opt) => {
    if (typeof url !== "string" || !url.includes(":generateContent")) return prev(url, opt);
    opt = opt || {};
    const saved = localStorage.getItem("rlModel");
    const tries = [];
    if (saved && !BAD.test(saved)) tries.push(saved);
    tries.push("models/gemini-3.8-flash");
    (await getList(opt)).forEach((m) => tries.push(m));
    tries.push("models/gemini-3.8-flash-lite");
    let last = null, lastMsg = "";
    for (const m of [...new Set(tries)]) {
      localStorage.setItem("rlModel", m);
      const r = await prev(url, opt);
      if (r.ok) return r;
      const msg = await why(r);
      last = r; lastMsg = msg;
      const skip = /limit:\s*0\b/.test(msg) || /not found|no longer|not supported|unknown model/i.test(msg) || r.status === 404;
      if (!skip) break;
    }
    if (saved) localStorage.setItem("rlModel", saved); else localStorage.removeItem("rlModel");
    if (/quota|rate|exhausted/i.test(lastMsg) && !/limit:\s*0\b/.test(lastMsg)) {
      return new Response(JSON.stringify({ error: { message: T("आज की फ़्री सीमा पूरी हो गई। थोड़ी देर बाद या कल फिर कोशिश करें।", "Today's free limit is used up. Try again later or tomorrow.") } }), { status: 429, headers: { "Content-Type": "application/json" } });
    }
    if (/limit:\s*0\b/.test(lastMsg)) {
      return new Response(JSON.stringify({ error: { message: T("इस चाबी पर कोई फ़्री मॉडल नहीं मिला। स्क्रीनशॉट भेजें।", "No free model found for this key. Send a screenshot.") } }), { status: 429, headers: { "Content-Type": "application/json" } });
    }
    return last;
  };
})();
/* ===== साइज़ और नाम की समझदार पहचान ===== */
(function () {
  const U = [
    [/^(kilograms?|kilos?|kgs?|किलोग्राम|किलो|कि\.?ग्रा\.?|केजी)$/, "kg", 1000],
    [/^(grams?|grms?|gms?|gm|g|ग्राम|ग्रा\.?|जी)$/, "g", 1],
    [/^(litres?|liters?|ltrs?|lt|l|लीटर|ली\.?)$/, "l", 1000],
    [/^(millilitres?|milliliters?|ml|मिली|एमएल)$/, "ml", 1],
    [/^(pieces?|pcs?|पीस|नग)$/, "pc", 0],
    [/^(packets?|pkts?|pack|पैकेट)$/, "pkt", 0],
    [/^(dozens?|dz|दर्जन)$/, "dz", 0]
  ];
  const base = (s) => String(s || "").normalize("NFC").replace(/\u093C/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const size = (s) => {
    let t = base(s).replace(/(\d)\s*([^\d\s.])/g, "$1 $2").replace(/([^\d\s.])(\d)/g, "$1 $2");
    const p = t.split(" ");
    for (let i = 0; i < p.length; i++) for (const [re, u, f] of U) if (re.test(p[i].replace(/\.$/, ""))) { p[i] = u; break; }
    t = p.join(" ");
    const m = /^([\d.]+) (kg|g|l|ml)$/.exec(t);
    if (m) {
      const v = parseFloat(m[1]) * ({ kg: 1000, g: 1, l: 1000, ml: 1 })[m[2]];
      return (m[2] === "kg" || m[2] === "g" ? "w" : "v") + Math.round(v);
    }
    return t.replace(/\s+/g, "");
  };
  const nameOk = (a, x) => { const n = base(a); return n && (n === base(nm(x)) || (x.alt && n === base(x.alt))); };
  const same = (n, v, z) => ITEMS.filter(mine).find((x) => nameOk(n, x) && base(v) === base(x.vendor) && size(z) === size(x.size));

  const prev = window.fetch;
  window.fetch = async (url, opt) => {
    const r = await prev(url, opt);
    if (typeof url !== "string" || !url.includes(":generateContent") || !r.ok) return r;
    try {
      const j = await r.clone().json();
      const part = j.candidates[0].content.parts.find((p) => p.text);
      const txt = part.text;
      const rows = JSON.parse(txt.replace(/^[^\[]*/, "").replace(/[^\]]*$/, ""));
      rows.forEach((row) => {
        const o = same(row.name, row.vendor, row.size) || (!row.vendor && ITEMS.filter(mine).filter((x) => nameOk(row.name, x) && size(row.size) === size(x.size)).length === 1 ? ITEMS.filter(mine).find((x) => nameOk(row.name, x) && size(row.size) === size(x.size)) : null);
        if (o) { row.name = nm(o); row.vendor = o.vendor || ""; row.size = o.size || ""; }
      });
      part.text = JSON.stringify(rows);
      return new Response(JSON.stringify(j), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (e) { return r; }
  };

  const fix = () => {
    if (typeof editId !== "undefined" && editId) return;
    const o = same($("fName").value, $("fVen").value, $("fSize").value);
    if (!o) return;
    let ch = false;
    if ($("fName").value !== nm(o)) { $("fName").value = nm(o); ch = true; }
    if ($("fVen").value !== (o.vendor || "")) { $("fVen").value = o.vendor || ""; ch = true; }
    if ($("fSize").value !== (o.size || "")) { $("fSize").value = o.size || ""; ch = true; }
    if (ch) $("fSize").dispatchEvent(new Event("input"));
  };
  ["fName", "fVen", "fSize"].forEach((id) => $(id).addEventListener("change", fix));
  $("saveItem").addEventListener("click", fix, true);
})();
/* ===== फ़ोटो: जल्दी, अंग्रेज़ी नाम, एक होलसेलर ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const shrink = (b64) => new Promise((ok) => {
    const img = new Image();
    img.onload = () => {
      const m = 1024, r = Math.min(1, m / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      ok(c.toDataURL("image/jpeg", 0.7).split(",")[1]);
    };
    img.onerror = () => ok(b64);
    img.src = "data:image/jpeg;base64," + b64;
  });
  const EXTRA = " IMPORTANT: Write every item name in English letters (Roman script), e.g. 'हल्दी' -> 'Haldi', 'माचा चाय' -> 'Macha chai'. If it matches an existing item name, use that exact existing name. " +
    "The whole photo is one bill from ONE wholesaler: find the wholesaler/shop name written on the bill and put that same name in vendor for every line (use the existing wholesaler name if it matches; leave empty if not written). Keep it short and answer quickly.";
  const prev = window.fetch;
  window.fetch = async (url, opt) => {
    if (typeof url !== "string" || !url.includes(":generateContent") || !opt || !opt.body) return prev(url, opt);
    let body;
    try { body = JSON.parse(opt.body); } catch (e) { return prev(url, opt); }
    const parts = body.contents[0].parts;
    if (parts[0] && parts[0].text && !parts[0].text.includes("IMPORTANT: Write every item name")) parts[0].text += EXTRA;
    const pic = parts.find((p) => p.inline_data);
    if (pic) pic.inline_data.data = await shrink(pic.inline_data.data);
    const plain = JSON.stringify(body);
    if (localStorage.getItem("rlNoThink")) return prev(url, Object.assign({}, opt, { body: plain }));
    body.generationConfig = Object.assign({}, body.generationConfig, { thinkingConfig: { thinkingLevel: "low" } });
    let r = await prev(url, Object.assign({}, opt, { body: JSON.stringify(body) }));
    if (!r.ok && r.status === 400) {
      const j = await r.clone().json().catch(() => null);
      if (/thinking/i.test((j && j.error && j.error.message) || "")) { localStorage.setItem("rlNoThink", "1"); r = await prev(url, Object.assign({}, opt, { body: plain })); }
    }
    return r;
  };

  const isDv = (i) => /सबका होलसेलर|Wholesaler for all/.test(i.placeholder || "");
  const isRowVen = (i) => i.closest(".card") && /^(होलसेलर|Wholesaler)$/.test(i.placeholder || "");
  new MutationObserver(() => {
    const box = $("modalBox");
    const dv = [...box.querySelectorAll("input")].find(isDv);
    if (!dv || dv.dataset.done) return;
    dv.dataset.done = "1";
    dv.placeholder = T("होलसेलर चुनें या नया नाम लिखें", "Pick wholesaler or type a new one");
    dv.style.cssText += ";border:2px solid var(--acc);font-weight:700";
    dv.before(E("label", "", "🧾 " + T("ये बिल किस होलसेलर का है?", "Whose bill is this?")));
    const rows = () => [...box.querySelectorAll("input")].filter(isRowVen);
    const cnt = {};
    rows().forEach((i) => { const v = i.value.trim(); if (v) cnt[v] = (cnt[v] || 0) + 1; });
    const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0] || "";
    const apply = () => rows().forEach((i) => { if (i.value !== dv.value.trim()) { i.value = dv.value.trim(); i.dispatchEvent(new Event("input")); } });
    dv.value = top;
    apply();
    dv.addEventListener("input", apply);
    dv.addEventListener("change", apply);
  }).observe($("modalBox"), { childList: true });
})();
/* ===== सही भाव (एक पीस का) ===== */
(function () {
  localStorage.setItem("rlNoThink", "1");
  const RULE = " PRICE RULES (very important): buy and sell must always be the price of ONE single piece/unit, never the total of a bundle or line. " +
    "Bills often show a pack count like '3P', '6P', '12 pcs', '6 Set' and a total amount; in that case buy = total amount divided by that count, rounded to 2 decimals. " +
    "If the bill has separate Rate and Amount columns, use Rate (per piece), not Amount. If MRP per piece is written, put it in sell. " +
    "Put the pack count (like '6P') in size only if it is part of the product name; otherwise keep the real pack size like '100g'. Think carefully about the numbers before answering.";
  const prev = window.fetch;
  window.fetch = (url, opt) => {
    if (typeof url === "string" && url.includes(":generateContent") && opt && typeof opt.body === "string") {
      try {
        const b = JSON.parse(opt.body);
        const p = b.contents[0].parts[0];
        if (p && p.text && !p.text.includes("PRICE RULES")) p.text += RULE;
        opt = Object.assign({}, opt, { body: JSON.stringify(b) });
      } catch (e) {}
    }
    return prev(url, opt);
  };
})();
/* ===== भीड़ होने पर अपने-आप दोबारा कोशिश ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const prev = window.fetch;
  const busy = async (r) => {
    if (r.ok) return false;
    if (r.status === 503 || r.status === 500) return true;
    const j = await r.clone().json().catch(() => null);
    return /high demand|overloaded|unavailable|try again later/i.test((j && j.error && j.error.message) || "");
  };
  const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
  window.fetch = async (url, opt) => {
    if (typeof url !== "string" || !url.includes(":generateContent")) return prev(url, opt);
    let r = await prev(url, opt);
    for (let i = 0; i < 2 && (await busy(r)); i++) { await wait(4000 * (i + 1)); r = await prev(url, opt); }
    if (await busy(r)) {
      const saved = localStorage.getItem("rlModel") || "";
      const alt = /lite/.test(saved) ? saved.replace(/-lite$/, "") : (saved || "models/gemini-3.8-flash") + "-lite";
      localStorage.setItem("rlModel", alt);
      const r2 = await prev(url, opt);
      if (r2.ok) return r2;
      if (saved) localStorage.setItem("rlModel", saved);
      if (await busy(r2)) return new Response(JSON.stringify({ error: { message: T("Google पर अभी बहुत भीड़ है। 5-10 मिनट बाद फिर कोशिश करें।", "Google is very busy right now. Try again in 5-10 minutes.") } }), { status: 503, headers: { "Content-Type": "application/json" } });
      return r2;
    }
    return r;
  };
})();

/* ===== बिल पीछे-पीछे पढ़ना ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const pill = E("button", "", "", "display:none;position:fixed;left:50%;transform:translateX(-50%);bottom:95px;z-index:60;border:0;border-radius:24px;padding:12px 20px;font-size:1em;font-weight:700;color:#fff;box-shadow:0 4px 14px #0005");
  document.body.append(pill);
  let wait = false, ready = false;
  const show = (txt, bg) => { pill.textContent = txt; pill.style.background = bg; pill.style.display = "block"; };
  const hide = () => { pill.style.display = "none"; wait = false; ready = false; };
  pill.onclick = () => { if (ready) { $("modal").classList.add("on"); hide(); } };
  new MutationObserver(() => {
    const box = $("modalBox");
    if (box.querySelector(".tarazu") && /फ़ोटो पढ़ी जा रही|Reading photo/.test(box.textContent)) {
      wait = true; ready = false;
      setTimeout(() => { if (wait && !ready) $("modal").classList.remove("on"); }, 50);
      show("⏳ " + T("बिल पढ़ा जा रहा है... आप काम जारी रखें", "Reading bill... keep working"), "#555");
      return;
    }
    if (wait && /जाँचें और ठीक करें|Check and correct/.test(box.textContent)) {
      ready = true; wait = false;
      setTimeout(() => $("modal").classList.remove("on"), 0);
      const n = box.querySelectorAll(".card").length;
      show("✅ " + T("बिल तैयार है", "Bill ready") + " (" + n + ") — " + T("देखें", "Open"), "#2e7d32");
      try { navigator.vibrate && navigator.vibrate([150, 80, 150]); } catch (e) {}
    }
  }).observe($("modalBox"), { childList: true, subtree: true });
  const a = window.alert;
  window.alert = (m) => { if (/फ़ोटो नहीं पढ़ी|Could not read photo/.test(String(m))) hide(); return a(m); };
})();
/* ===== तेज़ पढ़ना: छपा बिल / हाथ का पर्चा ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const mode = () => localStorage.getItem("rlMode") || "print";
  const cam = [...document.querySelectorAll("#pAdd button")].find((b) => /कैमरे से भरें|Fill from camera/.test(b.textContent));
  if (cam) {
    const row = E("div", "row", null, "margin-top:10px");
    const mk = (v, t) => {
      const b = E("button", "pill", t, "flex:1;padding:10px");
      b.onclick = () => { localStorage.setItem("rlMode", v); paint(); };
      row.append(b);
      return b;
    };
    const p1 = mk("print", "🖨️ " + T("छपा बिल (तेज़)", "Printed bill (fast)"));
    const p2 = mk("hand", "✍️ " + T("हाथ का पर्चा", "Handwritten"));
    const paint = () => { p1.classList.toggle("on", mode() === "print"); p2.classList.toggle("on", mode() === "hand"); };
    paint();
    cam.before(row);
  }

  const crop = (b64, parts) => new Promise((ok) => {
    const img = new Image();
    img.onload = () => {
      const w = img.width, h = img.height;
      if (parts < 2 || h < w * 1.2) return ok([b64]);
      const step = h / parts, lap = Math.round(step * 0.1), out = [];
      for (let i = 0; i < parts; i++) {
        const y0 = Math.max(0, Math.round(i * step) - lap), y1 = Math.min(h, Math.round((i + 1) * step) + lap);
        const c = document.createElement("canvas");
        c.width = w; c.height = y1 - y0;
        c.getContext("2d").drawImage(img, 0, y0, w, y1 - y0, 0, 0, w, y1 - y0);
        out.push(c.toDataURL("image/jpeg", 0.85).split(",")[1]);
      }
      ok(out);
    };
    img.onerror = () => ok([b64]);
    img.src = "data:image/jpeg;base64," + b64;
  });
  const rowsOf = async (r) => {
    const j = await r.json();
    const t = j.candidates[0].content.parts.map((p) => p.text || "").join("");
    const a = JSON.parse(t.replace(/^[^\[]*/, "").replace(/[^\]]*$/, ""));
    return Array.isArray(a) ? a : [];
  };
  const pack = (rows) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(rows) }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } });

  const prev = window.fetch;
  const call = async (url, opt, body, fast) => {
    const b = JSON.parse(JSON.stringify(body));
    if (fast && !localStorage.getItem("rlNoLvl")) b.generationConfig = Object.assign({}, b.generationConfig, { thinkingConfig: { thinkingLevel: "low" } });
    let r = await prev(url, Object.assign({}, opt, { body: JSON.stringify(b) }));
    if (!r.ok && r.status === 400 && fast) {
      const j = await r.clone().json().catch(() => null);
      if (/thinking/i.test((j && j.error && j.error.message) || "")) {
        localStorage.setItem("rlNoLvl", "1");
        delete b.generationConfig.thinkingConfig;
        r = await prev(url, Object.assign({}, opt, { body: JSON.stringify(b) }));
      }
    }
    return r;
  };

  window.fetch = async (url, opt) => {
    if (typeof url !== "string" || !url.includes(":generateContent") || !opt || typeof opt.body !== "string") return prev(url, opt);
    let body;
    try { body = JSON.parse(opt.body); } catch (e) { return prev(url, opt); }
    const t0 = Date.now();
    const done = (r) => { window.__readSec = Math.round((Date.now() - t0) / 1000); return r; };
    if (mode() === "print") {
      body.contents[0].parts[0].text += " This is a clearly PRINTED computer bill: read it directly, quickly, without long reasoning.";
      return done(await call(url, opt, body, true));
    }
    const pic = body.contents[0].parts.find((p) => p.inline_data);
    const strips = pic ? await crop(pic.inline_data.data, 2) : [];
    if (strips.length < 2) return done(await call(url, opt, body, false));
    try {
      const res = await Promise.all(strips.map((s, i) => {
        const b = JSON.parse(JSON.stringify(body));
        b.contents[0].parts[0].text += " NOTE: this image is part " + (i + 1) + " of " + strips.length + " of one handwritten list (cut from top to bottom, edges overlap). Read only lines that are fully visible in this part.";
        b.contents[0].parts.find((p) => p.inline_data).inline_data.data = s;
        return call(url, opt, b, false);
      }));
      if (res.some((r) => !r.ok)) throw new Error("part failed");
      const all = [], seen = new Set();
      for (const r of res) for (const x of await rowsOf(r)) {
        const k = String(x.name || "").trim().toLowerCase() + "|" + (x.buy == null ? "" : x.buy) + "|" + String(x.size || "").trim().toLowerCase();
        if (!seen.has(k)) { seen.add(k); all.push(x); }
      }
      return done(pack(all));
    } catch (e) {
      return done(await call(url, opt, body, false));
    }
  };

  new MutationObserver(() => {
    const box = $("modalBox");
    if (!window.__readSec || box.querySelector(".rlsec") || !/जाँचें और ठीक करें|Check and correct/.test(box.textContent)) return;
    const h = box.querySelector("h3");
    if (h) h.after(E("div", "mut rlsec", "⏱️ " + T("पढ़ने में ", "Read in ") + window.__readSec + T(" सेकंड लगे", " seconds")));
    window.__readSec = 0;
  }).observe($("modalBox"), { childList: true, subtree: true });
})();
/* ===== छपा बिल पहले lite से + दोबारा पढ़ो + कई फ़ोटो ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const fi = document.querySelector('body > input[type="file"][accept="image/*"]');
  const pill = [...document.querySelectorAll("body > button")].find((b) => b.style.position === "fixed");
  if (!fi || !pill) return;
  fi.multiple = true;
  const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const until = async (fn, ms) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > (ms || 300000)) return false; await sleep(300); } return true; };
  const lite = (m) => (m || "models/gemini-3.8-flash").replace(/-lite$/, "") + "-lite";
  const bad = async (r) => {
    try {
      const j = await r.clone().json();
      const t = j.candidates[0].content.parts.map((p) => p.text || "").join("");
      const a = JSON.parse(t.replace(/^[^\[]*/, "").replace(/[^\]]*$/, ""));
      if (!a.length) return true;
      const nob = a.filter((x) => x.buy == null || x.buy === "" || isNaN(Number(x.buy))).length;
      return nob > a.length * 0.3 || a.some((x) => String(x.name || "").trim().length < 2);
    } catch (e) { return true; }
  };
  const cache = {};
  window.__q = null;
  const prev = window.fetch;
  window.fetch = async (url, opt) => {
    if (typeof url !== "string" || !url.includes(":generateContent")) return prev(url, opt);
    const q = window.__q;
    if (q && q.mode === "show" && cache[q.idx]) return new Response(cache[q.idx], { status: 200, headers: { "Content-Type": "application/json" } });
    const full = window.__forceFull; window.__forceFull = 0;
    let r;
    if (!full && (localStorage.getItem("rlMode") || "print") === "print") {
      const saved = localStorage.getItem("rlModel");
      localStorage.setItem("rlModel", lite(saved));
      try { r = await prev(url, opt); } finally { if (saved) localStorage.setItem("rlModel", saved); else localStorage.removeItem("rlModel"); }
      if (!r.ok || (await bad(r))) r = await prev(url, opt);
    } else r = await prev(url, opt);
    if (q && r.ok) cache[q.idx] = await r.clone().text();
    return r;
  };

  const setFile = (f) => { const dt = new DataTransfer(); dt.items.add(f); fi.files = dt.files; };
  const readyNow = () => pill.textContent.includes("✅");
  const failNow = () => pill.style.display === "none";
  const openReview = () => { $("modal").classList.add("on"); pill.style.display = "none"; };

  new MutationObserver(() => {
    const box = $("modalBox");
    if (box.querySelector(".rlre") || !/जाँचें और ठीक करें|Check and correct/.test(box.textContent)) return;
    const h = box.querySelector("h3");
    if (!h) return;
    const re = E("button", "btn btn2 rlre", "🔍 " + T("ठीक से दोबारा पढ़ो", "Read again carefully"), "margin:6px 0");
    re.onclick = async () => {
      window.__rereading = 1;
      $("modal").classList.remove("on");
      window.__forceFull = 1;
      if (window.__q) window.__q.mode = "reread";
      pill.textContent = "";
      fi.onchange();
      await sleep(300);
      await until(() => readyNow() || failNow());
      if (readyNow()) openReview();
      if (window.__q) window.__q.mode = "show";
      window.__rereading = 0;
    };
    const tag = window.__q ? E("div", "", "🧾 " + T("बिल ", "Bill ") + (window.__q.idx + 1) + " / " + window.__q.n, "font-weight:700;color:var(--acc)") : null;
    (box.querySelector(".rlsec") || h).after(re);
    if (tag) h.before(tag);
  }).observe($("modalBox"), { childList: true, subtree: true });

  const runQueue = async (files) => {
    const n = files.length, ok = [];
    const oldClick = pill.onclick;
    pill.onclick = () => {};
    for (let i = 0; i < n; i++) {
      window.__q = { mode: "read", idx: i, n };
      setFile(files[i]);
      pill.textContent = "";
      fi.onchange();
      await sleep(300);
      pill.style.display = "block"; pill.style.background = "#555";
      pill.textContent = "⏳ " + T("बिल ", "Bill ") + (i + 1) + "/" + n + T(" पढ़ा जा रहा है...", " being read...");
      await until(() => readyNow() || failNow());
      $("modal").classList.remove("on");
      if (cache[i]) ok.push(i);
    }
    window.__q = null;
    if (!ok.length) { pill.style.display = "none"; pill.onclick = oldClick; return; }
    pill.style.display = "block"; pill.style.background = "#2e7d32";
    pill.textContent = "✅ " + ok.length + "/" + n + T(" बिल तैयार — देखें", " bills ready — Open");
    try { navigator.vibrate && navigator.vibrate([150, 80, 150]); } catch (e) {}
    pill.onclick = async () => {
      pill.onclick = () => {};
      for (const i of ok) {
        window.__q = { mode: "show", idx: i, n };
        setFile(files[i]);
        pill.textContent = "";
        fi.onchange();
        await sleep(300);
        await until(() => readyNow() || failNow(), 30000);
        if (!readyNow()) continue;
        openReview();
        await sleep(500);
        await until(() => !$("modal").classList.contains("on") && !window.__rereading, 3600000);
        await sleep(800);
      }
      window.__q = null;
      pill.style.display = "none";
      pill.onclick = oldClick;
    };
  };
  fi.addEventListener("change", (e) => {
    if (fi.files.length > 1) { e.stopImmediatePropagation(); runQueue([...fi.files]); }
  }, true);
})();
/* ===== बिलों की लाइन (queue), भीड़ में इंतज़ार, गैलरी फ़ोटो, सामान की फ़ोटो, खोज ✖ ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const fi = document.querySelector('body > input[type="file"][accept="image/*"]');
  const pill = [...document.querySelectorAll("body > button")].find((b) => b.style.position === "fixed");
  const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const until = async (fn, ms) => { const t = Date.now(); while (!fn()) { if (Date.now() - t > (ms || 300000)) return false; await sleep(300); } return true; };
  const modalOn = () => $("modal").classList.contains("on");

  const load = async (file) => {
    let src;
    try { src = await createImageBitmap(file); } catch (e) {
      src = await new Promise((ok, bad) => {
        const fr = new FileReader();
        fr.onload = () => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => bad(new Error("x")); im.src = fr.result; };
        fr.onerror = () => bad(new Error("x"));
        fr.readAsDataURL(file);
      });
    }
    return src;
  };
  const toJpeg = async (file, max, q) => {
    const src = await load(file);
    const r = Math.min(1, max / Math.max(src.width, src.height));
    const c = document.createElement("canvas");
    c.width = Math.round(src.width * r); c.height = Math.round(src.height * r);
    c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
    const data = c.toDataURL("image/jpeg", q);
    const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", q));
    return { data, file: new File([blob], "bill.jpg", { type: "image/jpeg" }) };
  };

  if (fi && pill) {
    const Q = [];
    let shown = null, session = false, busyMsg = "";
    const prev = window.fetch;
    window.fetch = async (url, opt) => {
      if (window.__show17 && typeof url === "string" && url.includes(":generateContent")) {
        const t = window.__show17; window.__show17 = null;
        return new Response(t, { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return prev(url, opt);
    };
    const prompt = () => {
      const names = [...new Set(ITEMS.filter(mine).map(nm))].slice(0, 300).join(", ");
      const vens = [...new Set(ITEMS.filter(mine).map((x) => x.vendor).filter(Boolean))].join(", ");
      return "This photo is a handwritten or printed price list from an Indian grocery (pansari) shop, in Hindi and/or English. " +
        "Read every item line. For each line return: name (item name exactly as written), vendor (wholesaler name if written, else empty), size (pack/quantity like '1 किलो', '500g', else empty), " +
        "unit (one of: " + UNITS.join(", ") + "; pick the closest, default किलो), buy (purchase price number or null), sell (selling price number or null), unsure (true if any part of this line was hard to read). " +
        "If a line has only one price, put it in buy. Never invent items. Prefer these existing item names when the written name clearly means the same thing: " + names + ". Existing wholesalers: " + vens + ". " +
        "Return only a JSON array.";
    };
    const paint = () => {
      if (shown || window.__rereading) return;
      const ready = Q.filter((x) => x.st === "ready").length, wait = Q.filter((x) => x.st === "wait" || x.st === "read").length;
      if (!ready && !wait) { pill.style.display = "none"; session = false; return; }
      pill.style.display = "block";
      if (ready) {
        pill.style.background = "#2e7d32";
        pill.textContent = "✅ " + ready + T(" बिल तैयार — देखें", " bill(s) ready — Open") + (wait ? " • ⏳ " + wait : "");
      } else {
        pill.style.background = "#555";
        pill.textContent = "⏳ " + (busyMsg || T("बिल पढ़ा जा रहा है", "Reading bill")) + " (" + wait + ")" + T("... आप काम जारी रखें", "... keep working");
      }
    };
    let reading = false;
    const reader = async () => {
      if (reading) return;
      reading = true;
      for (;;) {
        const it = Q.find((x) => x.st === "wait");
        if (!it) break;
        it.st = "read"; busyMsg = ""; paint();
        let tries = 0;
        for (;;) {
          const t0 = Date.now();
          let r, msg = "";
          try {
            const url = "https://generativelanguage.googleapis.com/v1beta/" + (localStorage.getItem("rlModel") || "models/gemini-3.8-flash") + ":generateContent";
            r = await window.fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": localStorage.getItem("rlKey") || "" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt() }, { inline_data: { mime_type: "image/jpeg", data: it.data.split(",")[1] } }] }], generationConfig: { responseMimeType: "application/json", temperature: 0 } }) });
            if (!r.ok) { const j = await r.clone().json().catch(() => null); msg = (j && j.error && j.error.message) || ("HTTP " + r.status); }
          } catch (e) { msg = e.message || "network"; }
          if (r && r.ok) { it.text = await r.text(); it.sec = Math.round((Date.now() - t0) / 1000); it.st = "ready"; break; }
          const busy = (r && (r.status === 503 || r.status === 500)) || /busy|भीड़|high demand|overloaded|unavailable|network|Failed to fetch/i.test(msg);
          if (busy && tries < 15) {
            tries++;
            for (let s = 60; s > 0; s -= 5) { busyMsg = T("Google पर भीड़ है, ", "Google busy, retry in ") + s + T(" सेकंड में फिर कोशिश", "s"); paint(); await sleep(window.__busyWait || 5000); }
            busyMsg = ""; continue;
          }
          it.st = "fail"; busyMsg = "";
          alert(T("फ़ोटो नहीं पढ़ी गई: ", "Could not read photo: ") + msg);
          break;
        }
        paint();
        if (session && !shown && !modalOn()) next();
      }
      reading = false;
      paint();
    };
    const next = async () => {
      const it = Q.find((x) => x.st === "ready");
      if (!it || shown) { paint(); return; }
      shown = it; session = true;
      const dt = new DataTransfer(); dt.items.add(it.file); fi.files = dt.files;
      window.__show17 = it.text; window.__readSec = it.sec; window.__q = null;
      pill.textContent = "";
      fi.onchange();
      await sleep(300);
      await until(() => pill.textContent.includes("✅") || pill.style.display === "none", 30000);
      if (!pill.textContent.includes("✅")) { it.st = "fail"; shown = null; paint(); return; }
      const total = Q.length, pos = Q.indexOf(it) + 1;
      const h = $("modalBox").querySelector("h3");
      if (h && !$("modalBox").querySelector(".rlq")) h.before(E("div", "rlq", "🧾 " + T("बिल ", "Bill ") + pos + " / " + total, "font-weight:700;color:var(--acc)"));
      $("modal").classList.add("on");
      pill.style.display = "none";
      await sleep(500);
      await until(() => !modalOn() && !window.__rereading, 3600000);
      it.st = "done"; shown = null;
      await sleep(700);
      if (Q.some((x) => x.st === "ready")) next(); else paint();
    };
    pill.onclick = () => { if (!shown) next(); };
    const add = async (files) => {
      for (const f of files) {
        try { const j = await toJpeg(f, 1600, 0.85); Q.push({ file: j.file, data: j.data, st: "wait" }); }
        catch (e) { alert(T("ये फ़ोटो नहीं खुली। कैमरे से नई फ़ोटो खींचें, या फ़ोटो का स्क्रीनशॉट लेकर वो डालें।", "This photo could not be opened. Take a new photo with the camera, or use a screenshot of it.")); }
      }
      paint();
      reader();
    };
    window.addEventListener("change", (e) => {
      if (e.target !== fi || !fi.files.length) return;
      e.stopImmediatePropagation(); e.stopPropagation();
      add([...fi.files]);
    }, true);
  }

  /* ---- सामान की फ़ोटो (मर्ज़ी से) ---- */
  let pimg = null;
  const pv = E("img", "", null, "display:none;width:90px;height:90px;object-fit:cover;border-radius:12px;margin-right:8px");
  const pb = E("button", "btn btn2", "📷 " + T("सामान की फ़ोटो (मर्ज़ी से)", "Item photo (optional)"), "margin:0;flex:1");
  const px = E("button", "pill", "✖", "display:none");
  const pin = E("input"); pin.type = "file"; pin.accept = "image/*"; pin.style.display = "none";
  const prow = E("div", "row", null, "margin-top:12px");
  prow.append(pv, pb, px, pin);
  $("saveItem").before(prow);
  const setP = (d) => { pimg = d; pv.src = d || ""; pv.style.display = px.style.display = d ? "" : "none"; };
  pb.onclick = () => { pin.value = ""; pin.click(); };
  px.onclick = () => setP("");
  pin.onchange = async () => {
    if (!pin.files[0]) return;
    try { setP((await toJpeg(pin.files[0], 320, 0.7)).data); }
    catch (e) { alert(T("ये फ़ोटो नहीं खुली", "Could not open this photo")); }
  };
  new MutationObserver(() => {
    if (typeof editId !== "undefined" && editId) { const x = ITEMS.find((i) => i.id === editId); setP(x && x.img ? x.img : null); }
    else setP(null);
  }).observe($("addTitle"), { childList: true, characterData: true, subtree: true });
  const k = (s) => String(s || "").trim().toLowerCase();
  $("saveItem").addEventListener("click", () => {
    if (pimg === null) return;
    const want = pimg, n = k($("fName").value), v = k($("fVen").value), z = k($("fSize").value), eid = (typeof editId !== "undefined" && editId) || null;
    if (!n) return;
    (async () => {
      for (let i = 0; i < 40; i++) {
        await sleep(500);
        const x = eid ? ITEMS.find((it) => it.id === eid) : ITEMS.filter(mine).find((it) => k(nm(it)) === n && k(it.vendor) === v && k(it.size) === z);
        if (x) { if ((x.img || "") !== want) await updateDoc(doc(db, "items", x.id), { img: want }).catch(() => {}); return; }
      }
    })();
  }, true);

  const visible = () => {
    let a = ITEMS.filter(mine);
    if (curVen) a = a.filter((x) => (x.vendor || "—") === curVen);
    if (window.catFilter) a = window.catFilter(a);
    const q = $("q").value.trim().toLowerCase();
    if (q) a = a.filter((x) => (nm(x) + " " + (x.alt || "") + " " + (x.vendor || "") + " " + (x.size || "")).toLowerCase().includes(q));
    const srt = { az: (p, r) => nm(p).localeCompare(nm(r)), new: (p, r) => (r.t || 0) - (p.t || 0), old: (p, r) => (p.t || 0) - (r.t || 0) };
    return a.sort(srt[S.sort] || srt.az);
  };
  const oldR = render;
  render = function () {
    oldR();
    const cards = [...$("list").querySelectorAll(".card")], a = visible();
    if (cards.length !== a.length) return;
    cards.forEach((c, i) => {
      if (!a[i].img) return;
      const im = E("img", "", null, "width:56px;height:56px;object-fit:cover;border-radius:10px;flex:none;align-self:center");
      im.src = a[i].img;
      c.prepend(im);
    });
  };
  const oldS = window.openSheet;
  window.openSheet = (x) => {
    oldS(x);
    if (x.img) { const im = E("img", "", null, "width:100%;max-height:260px;object-fit:contain;border-radius:12px;margin-bottom:8px"); im.src = x.img; $("sheetBox").prepend(im); }
  };
  render();

  /* ---- खोज में ✖ ---- */
  const q = $("q");
  const cx = E("button", "", "✖", "display:none;flex:none;margin-left:-52px;width:40px;height:40px;border:0;border-radius:50%;background:#8883;color:var(--tx);font-size:16px;z-index:1");
  q.after(cx);
  q.style.paddingRight = "48px";
  const sx = () => (cx.style.display = q.value ? "block" : "none");
  q.addEventListener("input", sx);
  setInterval(sx, 800);
  cx.onclick = (e) => { e.preventDefault(); q.value = ""; q.blur(); sx(); render(); };
})();
/* ===== फ़ोन के अंदर पढ़ना (बिना Google) + Google को कम बार पूछना ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const pill = [...document.querySelectorAll("body > button")].find((b) => b.style.position === "fixed");
  const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
  const say = (t, bg) => { if (!pill) return; pill.style.display = "block"; pill.style.background = bg || "#555"; pill.textContent = t; };
  const mode = () => localStorage.getItem("rlMode") || "print";

  /* ---- तीसरा बटन: फ़ोन से पढ़ो ---- */
  const p1 = [...document.querySelectorAll("#pAdd button")].find((b) => /छपा बिल|Printed bill/.test(b.textContent));
  if (p1) {
    const row = p1.parentNode;
    const r2 = E("div", "row", null, "margin-top:8px");
    const p3 = E("button", "pill", "📱 " + T("फ़ोन से पढ़ो (बिना Google)", "Read on phone (no Google)"), "flex:1;padding:10px");
    r2.append(p3);
    row.after(r2);
    const paint3 = () => {
      p3.classList.toggle("on", mode() === "phone");
      if (mode() === "phone") row.querySelectorAll("button").forEach((b) => b.classList.remove("on"));
    };
    p3.onclick = () => { localStorage.setItem("rlMode", "phone"); paint3(); };
    row.addEventListener("click", () => setTimeout(paint3, 0));
    paint3();
  }

  /* ---- Tesseract लाना (पहली बार नेट चाहिए) ---- */
  let worker = null, pct = "";
  const getWorker = async () => {
    if (worker) return worker;
    if (!window.Tesseract) {
      await new Promise((ok, bad) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
        s.onload = ok; s.onerror = () => bad(new Error(T("पढ़ने वाला सिस्टम डाउनलोड नहीं हुआ। पहली बार नेट चालू रखें।", "Could not download the reader. Keep internet on the first time.")));
        document.head.append(s);
      });
    }
    say("⬇️ " + T("पढ़ने वाली भाषा-फ़ाइल आ रही है (सिर्फ़ पहली बार)...", "Downloading language file (first time only)..."));
    const w = await Tesseract.createWorker("eng+hin", 1, {
      logger: (m) => { if (m && m.status === "recognizing text") { pct = Math.round((m.progress || 0) * 100) + "%"; say("📱 " + T("फ़ोन बिल पढ़ रहा है ", "Phone reading bill ") + pct); } }
    });
    await w.setParameters({ tessedit_pageseg_mode: "6", preserve_interword_spaces: "1" });
    worker = w;
    return worker;
  };

  /* ---- फ़ोटो साफ़ करना: काला-सफ़ेद, तेज़ ---- */
  const prep = (b64) => new Promise((ok) => {
    const im = new Image();
    im.onload = () => {
      const r = Math.min(2, 2000 / Math.max(im.width, im.height));
      const c = document.createElement("canvas");
      c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
      const g = c.getContext("2d");
      g.drawImage(im, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        let v = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
        v = Math.max(0, Math.min(255, (v - 128) * 1.6 + 140));
        p[i] = p[i + 1] = p[i + 2] = v;
      }
      g.putImageData(d, 0, 0);
      ok(c.toDataURL("image/png"));
    };
    im.onerror = () => ok("data:image/jpeg;base64," + b64);
    im.src = "data:image/jpeg;base64," + b64;
  });

  /* ---- लाइन से नाम, साइज़, भाव निकालना ---- */
  const DEV = "०१२३४५६७८९";
  const digits = (s) => s.replace(/[०-९]/g, (d) => DEV.indexOf(d));
  const SZ = /(\d+(?:\.\d+)?)\s*(kgs?|kg|gms?|gm|grams?|g|ltrs?|ltr|lt|l|ml|किलो|ग्राम|लीटर|मिली)(?![a-z\u0900-\u097f])/i;
  const SKIP = /(total|sub ?total|grand|g\.?s\.?t|cgst|sgst|igst|tax|invoice|bill no|date|phone|mob|gstin|amount|round|discount|balance|thank|कुल|योग|दिनांक|मोबाइल|बिल)/i;
  const lev = (a, b) => {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  };
  const key = (s) => String(s || "").toLowerCase().replace(/[^a-z\u0900-\u097f]/g, "");
  const known = (name) => {
    const k = key(name);
    if (k.length < 3) return null;
    let best = null, bd = 99;
    for (const x of ITEMS.filter(mine)) for (const c of [nm(x), x.alt, x.name]) {
      const kc = key(c);
      if (!kc) continue;
      const dd = lev(k, kc) / Math.max(k.length, kc.length);
      if (dd < bd) { bd = dd; best = x; }
    }
    return bd <= 0.25 ? best : null;
  };
  const near = (a, b) => Math.abs(a - b) <= Math.max(1, b * 0.02);
  const parse = (text) => {
    const out = [];
    for (let line of text.split("\n")) {
      line = digits(line).replace(/[|_=~“”"'।॥]/g, " ").replace(/(\d),(\d{3})/g, "$1$2").replace(/(\d)\s*[,]\s*(\d{2})\b/g, "$1.$2").replace(/\s+/g, " ").trim();
      if (line.length < 4 || SKIP.test(line)) continue;
      let size = "";
      const sm = SZ.exec(line);
      if (sm) { size = sm[1] + " " + sm[2]; line = line.replace(sm[0], " "); }
      const nums = [], name = [];
      line.split(" ").filter(Boolean).forEach((w) => {
        const n = w.replace(/^[^\d]+|[^\d.]+$/g, "");
        const isWord = /[a-z\u0900-\u097f]/i.test(w);
        if (!isWord && /^\d+(\.\d+)?$/.test(n)) { if (name.length) nums.push(parseFloat(n)); }
        else if (isWord && !nums.length) name.push(w);
      });
      if (!name.length || !nums.length) continue;
      const nameTxt = name.join(" ").trim();
      if (key(nameTxt).length < 2) continue;
      let buy = null, sell = null, unsure = true;
      const L = nums.length;
      if (L >= 3 && near(nums[L - 3] * nums[L - 2], nums[L - 1])) { buy = nums[L - 2]; unsure = false; }
      else if (L >= 2) {
        const b = nums[L - 2], c = nums[L - 1];
        if (near(b, c)) { buy = c; unsure = false; }
        else if (c > b && c <= b * 1.6) { buy = b; sell = c; }
        else buy = c;
      } else buy = nums[0];
      const o = known(nameTxt);
      out.push({ name: o ? nm(o) : nameTxt, vendor: o ? (o.vendor || "") : "", size: o && !size ? (o.size || "") : size, unit: o ? (o.unit || "किलो") : "किलो", buy, sell, unsure });
    }
    return out;
  };
  window.__rlParse = parse;

  /* ---- Google को कम बार पूछना: बीच में रुकना ---- */
  let lastAt = 0, gap = 0;
  const prev = window.fetch;
  window.fetch = async (url, opt) => {
    if (typeof url !== "string" || !url.includes(":generateContent") || window.__show17) return prev(url, opt);
    if (mode() === "phone") {
      const t0 = Date.now();
      try {
        const body = JSON.parse(opt.body);
        const pic = body.contents[0].parts.find((p) => p.inline_data);
        const w = await getWorker();
        say("📱 " + T("फ़ोन बिल पढ़ रहा है...", "Phone reading bill..."));
        const res = await w.recognize(await prep(pic.inline_data.data));
        const rows = parse((res && res.data && res.data.text) || "");
        window.__readSec = Math.round((Date.now() - t0) / 1000);
        if (!rows.length) throw new Error(T("बिल में कोई लाइन समझ नहीं आई। फ़ोटो सीधी और पास से, रोशनी में खींचें।", "No lines understood. Take the photo straight, close and in good light."));
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(rows) }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: { message: e.message || "OCR" } }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
    }
    for (;;) {
      const left = lastAt + gap - Date.now();
      if (left <= 0) break;
      say("⏳ " + T("Google की सीमा: ", "Google limit: ") + Math.ceil(left / 1000) + T(" सेकंड रुककर पूछेंगे", "s wait"));
      await sleep(Math.min(left, window.__gapTick || 1000));
    }
    if (gap > 15000) window.__forceFull = 1;
    lastAt = Date.now();
    let r = await prev(url, opt);
    if (r.ok) { gap = 15000; return r; }
    const j = await r.clone().json().catch(() => null);
    const msg = (j && j.error && j.error.message) || "";
    if (r.status === 429 || r.status === 503 || r.status === 500 || /quota|rate|exhausted|सीमा|भीड़|busy|high demand/i.test(msg)) {
      gap = 75000;
      r = new Response(JSON.stringify({ error: { message: T("Google पर भीड़ / सीमा भरी", "Google busy / limit reached") } }), { status: 503, headers: { "Content-Type": "application/json" } });
    }
    return r;
  };
})();
/* ===== फ़ोन वाला बटन हटाना + आज की Google गिनती ===== */
(function () {
  const T = (h, e) => (S.lang === "en" ? e : h);
  const LIMIT = 20;

  /* ---- फ़ोन वाला बटन हटाना ---- */
  const ph = [...document.querySelectorAll("#pAdd button")].find((b) => /फ़ोन से पढ़ो|Read on phone/.test(b.textContent));
  if (ph) (ph.parentNode.classList.contains("row") ? ph.parentNode : ph).remove();
  if (localStorage.getItem("rlMode") === "phone") {
    localStorage.setItem("rlMode", "print");
    const p1 = [...document.querySelectorAll("#pAdd button")].find((b) => /छपा बिल|Printed bill/.test(b.textContent));
    if (p1) p1.click();
  }

  /* ---- गिनती: Google का दिन (अमेरिका का समय) ---- */
  const day = () => { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date()); } catch (e) { return new Date(Date.now() - 8 * 3600000).toISOString().slice(0, 10); } };
  const get = () => { let c = {}; try { c = JSON.parse(localStorage.getItem("rlCount") || "{}"); } catch (e) {} if (c.d !== day()) c = { d: day(), f: 0, l: 0 }; return c; };
  const bump = (lite) => { const c = get(); c[lite ? "l" : "f"]++; localStorage.setItem("rlCount", JSON.stringify(c)); paint(); };
  try { performance.setResourceTimingBufferSize(1000); } catch (e) {}
  try {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((en) => {
        const m = /models\/([^:\/?]+):generateContent/.exec(en.name || "");
        if (m && /generativelanguage/.test(en.name)) bump(/lite/.test(m[1]));
      });
    }).observe({ type: "resource", buffered: false });
  } catch (e) {}

  /* ---- जोड़ें पेज पर गिनती दिखाना ---- */
  const box = E("div", "mut", "", "margin:8px 4px 0;font-weight:700;text-align:center");
  const cam = [...document.querySelectorAll("#pAdd button")].find((b) => /कैमरे से भरें|Fill from camera/.test(b.textContent));
  if (cam) cam.before(box);
  const paint = () => {
    const c = get(), left = Math.max(0, LIMIT - c.f);
    box.style.color = left <= 3 ? "#c62828" : "";
    box.textContent = "🔢 " + T("आज Google से पढ़ाई: ", "Google reads today: ") + c.f + " / " + LIMIT +
      T(" (बचे " + left + ")", " (" + left + " left)") + (c.l ? " • lite " + c.l : "") +
      T(" — दोपहर 1:30 बजे फिर 0", " — resets 1:30 PM");
  };
  paint();
  setInterval(paint, 30000);

  /* ---- हाथ का पर्चा: दो टुकड़ों की जगह एक ही बार भेजना ---- */
  const widen = (b64) => new Promise((ok) => {
    const im = new Image();
    im.onload = () => {
      if (im.height < im.width * 1.2) return ok(b64);
      const c = document.createElement("canvas");
      c.width = Math.ceil(im.height / 1.15); c.height = im.height;
      const g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(im, 0, 0);
      ok(c.toDataURL("image/jpeg", 0.9).split(",")[1]);
    };
    im.onerror = () => ok(b64);
    im.src = "data:image/jpeg;base64," + b64;
  });

  /* ---- सीमा पूरी हो तो बार-बार न पूछना ---- */
  let fails = 0;
  const stop = () => new Response(JSON.stringify({ error: { message: T("आज की Google सीमा (" + LIMIT + " बार) पूरी हो गई। दोपहर 1:30 बजे के बाद फिर चलेगा।", "Today's Google limit (" + LIMIT + ") is used up. It works again after 1:30 PM.") } }), { status: 400, headers: { "Content-Type": "application/json" } });
  const prev = window.fetch;
  window.fetch = async (url, opt) => {
    if (typeof url !== "string" || !url.includes(":generateContent") || window.__show17) return prev(url, opt);
    if (get().f >= LIMIT || fails >= 4) { if (get().f < LIMIT) fails = 0; return stop(); }
    if ((localStorage.getItem("rlMode") || "print") === "hand" && opt && typeof opt.body === "string") {
      try {
        const b = JSON.parse(opt.body);
        const pic = b.contents[0].parts.find((p) => p.inline_data);
        if (pic) { pic.inline_data.data = await widen(pic.inline_data.data); opt = Object.assign({}, opt, { body: JSON.stringify(b) }); }
      } catch (e) {}
    }
    const r = await prev(url, opt);
    if (r.ok) { fails = 0; return r; }
    if (r.status === 503 || r.status === 429) { fails++; if (fails >= 4) return stop(); }
    return r;
  };
})();

