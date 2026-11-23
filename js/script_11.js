
/* ===================== Simple view: the sheet first, everything else on request ===================== */
(function(){
  const LS = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const SS = (k,v) => { try{ localStorage.setItem(k,v); }catch(e){} };
  const tb = document.querySelector(".gs-toolbar"), notes = document.getElementById("notes");
  if(!tb || !notes) return;
  // advanced tools go in a drawer; the everyday ones stay on the bar
  const ADV = ["btn-addcol","btn-plan","btn-after","btn-lock","btn-copy-one","btn-clear"];
  const adv = document.createElement("span"); adv.className = "adv-tools"; adv.id = "adv-tools";
  const pasteAt = document.getElementById("start-col")?.closest("label");
  ADV.forEach(id=>{ const el = document.getElementById(id); if(el){ if(id==="btn-copy-one" && pasteAt) adv.appendChild(pasteAt); adv.appendChild(el); } });
  const advBtn = document.createElement("button"); advBtn.type = "button"; advBtn.id = "btn-adv"; advBtn.setAttribute("aria-expanded","false"); advBtn.textContent = "More tools ▾";
  const panelBtn = document.createElement("button"); panelBtn.type = "button"; panelBtn.id = "btn-panel"; panelBtn.className = "panel-btn";
  { const mk = (txt, title, fn) => { const b = document.createElement("button"); b.type = "button"; b.textContent = txt; b.title = title; b.addEventListener("click", fn); adv.appendChild(b); return b; };
    const pick = kind => { const f = document.createElement("input"); f.type = "file"; f.accept = ".xlsx"; f.onchange = ()=>{ if(f.files[0]) useTemplateFile(kind, f.files[0]); }; f.click(); };
    mk("VDS template…", "Use a newer Violation Determination worksheet template (.xlsx). The export and the sheet's colors, fonts and alignment follow it.", ()=>pick("vds"));
    mk("Notes template…", "Use a newer FE Notes Template (.xlsx) for Download Notes .xlsx.", ()=>pick("notes"));
    mk("Built-in templates", "Go back to the templates built into the tool (11/18 copies).", resetTemplates); }
  tb.append(advBtn, adv);
  tb.appendChild(panelBtn);
  function setAdv(on){ document.body.classList.toggle("show-adv", on); advBtn.setAttribute("aria-expanded", String(on)); advBtn.textContent = on ? "Fewer tools ▴" : "More tools ▾"; SS("vds:adv", on?"1":"0"); }
  function count(){ try{ if(typeof SEL==="undefined" || !COLS[SEL] || !COLS[SEL].node) return ""; const g = groupAt(SEL)[0]; const n = violations(g).list.length; return n ? ` (${n})` : " ✓"; }catch(e){ return ""; } }
  function label(){ const on = document.body.classList.contains("show-panel"); panelBtn.textContent = (on ? "Hide violations & fixes" : "Show violations & fixes") + count(); panelBtn.setAttribute("aria-pressed", String(on)); }
  function setPanel(on){ document.body.classList.toggle("show-panel", on); SS("vds:panel", on?"1":"0"); label(); try{ window.fitSheet && fitSheet(); }catch(e){} }
  advBtn.addEventListener("click", ()=>setAdv(!document.body.classList.contains("show-adv")));
  panelBtn.addEventListener("click", ()=>setPanel(!document.body.classList.contains("show-panel")));
  // a cell link in the Summary or a warning can still ask for the panel
  window.showPanel = () => setPanel(true);
  setAdv(false); setPanel(false);   // every visit starts with just the sheet; the buttons open the rest
  setInterval(label, 1000);
})();
