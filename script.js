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
