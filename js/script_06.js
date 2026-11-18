
/* ===================== Notes tab (Notes Template worksheet, filled from the VDS) ===================== */
(function(){
  const ABBR = t => String(t||"").replace(/\bFrontier\b/gi, "FTR").replace(/\bCity\s?net\b/gi, "CTYNT").replace(/\bSudden(\s?Link)?\b/gi, "SUDLNK").replace(/\bShenandoah\b/gi, "SHEN");   // company abbreviations in the notes
  const vdsRow = notesRow;
  // construction standards from the Katapult designer notes + the replacement from the pole top MR note
  function csLine(ci){
    try{
      const g = groupOf(ci), b = g.base, n = JOB?.nodes?.[b.node]; if(!n) return "";
      const a = n.attributes || {}, vals = o => Object.values(o||{}).filter(v=>typeof v==="string" && v.trim());
      const notes = vals(a.note).concat(vals(a.remedy_notes)).filter(t=>!/^Pole Tag:/m.test(t) && !/MRE (NOT )?REQUIRED/i.test(t));
      const stds = []; const RE = /\b(?:CS\s*)?(\d{1,2}-\d{3})\b/g;
      notes.forEach(t=>{ let m; RE.lastIndex = 0; while((m = RE.exec(t))){ const before = t.slice(Math.max(0, m.index-45), m.index); if(/due to\s*(CS\s*)?$/i.test(before) || /\b(not|n't|no|instead of|without)\b[^.]*$/i.test(before)) continue; const v = m[1].replace(/^0(?=\d-)/, ""); if(/^(4|8|11|12|16)-/.test(v) && !stds.includes(v)) stds.push(v); } });
      const main = Object.entries(n.photos||{}).find(([,v])=>v.association==="main");
      const pf = JOB.photos?.[main?.[0]]?.photofirst_data || K.mainPhoto(JOB, n) || {};
      const pt = Object.values(pf.pole_top||{})[0];
      const nm = String(pt?.mr_note||"").match(/Replace (\d+)' class (\w+) pole with (\d+)' class (\w+)/i);
      const spec = String(Object.values(a.proposed_pole_spec||{})[0]||"").match(/(\d+)-(\w+)/);
      // the replacement size: the SCID MR column first, then the Proposed Pole Spec, then the pole top MR note
      let h = "", cls = "";
      if(g.after && (g.after.repl || String(g.after.height||"")!==String(b.height||""))){ h = g.after.height; cls = g.after.cls; }
      else if(spec){ h = spec[1]; cls = spec[2]; }
      else if(nm){ h = nm[3]; cls = nm[4]; }
      // what's on the pole: primary framing and equipment, for the spec line
      const tr = JOB.traces?.trace_data || {}, ins = Object.values(pf.insulator||{});
      const priIns = ins.filter(i=>Object.values(i?._children?.wire||{}).some(w=>/primary/i.test(tr[w._trace]?.cable_type||"")));
      let feat = null; try{ feat = K.features(JOB, b.node); }catch(e){}
      const anyPri = (feat && feat.prims.length) || priIns.length || Object.values(pf.wire||{}).some(w=>/primary/i.test(tr[w._trace]?.cable_type||""));   // crossarm primaries count too
      const eq = Object.values(pf.equipment||{}).map(e=>e.equipment_type||"");
      const tagless = !String(b.tag||"").trim() || /^N\/?A$/i.test(b.tag);
      const z = v => v.replace(/^(\d)-/, "0$1-");
      const join = l => l.length > 1 ? l.slice(0,-1).join(", ") + " & " + l[l.length-1] : l.join("");
      let specLine = "";
      const stl = eq.includes("street_light");   // CS 16-100 is required any time there is a streetlight
      if(!anyPri) specLine = stl ? "SEC only & 16-100 (streetlight)" : "SEC only";
      else {
        let list = stds.slice();
        let fr = null;
        if(!list.length){
          // the spec picker (from the FE spec book drawings)
          try{ fr = K.framing(feat || K.features(JOB, b.node)); }catch(e){ fr = null; }
          if(fr && fr.specs.length) list = fr.specs.slice();
        }
        if(stl && !list.some(x=>/^0?16-100/.test(x))) list.push("16-100");
        specLine = list.length ? `PRI Spec ${join(list.map(z))}${stds.length ? "" : ` (from the framing in Katapult${fr && fr.why.length ? ": " + fr.why[0] : ""}; check)`}` : "PRI Spec ?";
      }
      if(tagless && spec && !main?.[1]?._measured) return `New midspan pole ${spec[1]}'-${spec[2]} using CS ${stds.length ? stds.join(", ") : "8-010, 8-105"}`;
      if(h){
        // the proposed attach height: typed on the replacement column, else the Katapult proposed height (+ its MR move)
        let att = (g.after && g.after.prop && g.after.prop.height) || (b.prop && b.prop.height) || "";
        if(!att && b.prop && b.prop.trace){ const w = polePW(JOB, b.node)[b.prop.trace]; if(w && w.h!=null) att = fmt(w.h + (parseFloat(w.mr)||0)); }
        const lines = [`Replace pole to ${h}'/${cls}${att ? `, attach at ${att}` : ""}`, specLine];
        if(nm && (nm[3]!==String(h) || String(nm[4])!==String(cls))) lines.push(`Check: the pole top MR note says ${nm[3]}'/${nm[4]}`);
        return lines.join("\n\n");
      }
      return "";
    }catch(e){ return ""; }
  }
  const autoRow = ci => { const r = vdsRow(ci); const cs = csLine(ci); r.mre = ABBR([r.mre, cs, r.results].filter(Boolean).join("\n\n")); delete r.results; r.cs = cs; return r; };   // the VDS's own Notes row (auto)
  let MAIN = "vds", NT = {rows:{}, recollects:""};
  const ntKey = () => "vcw-nt:" + (JOB?.name || "no-job");
  const ntLoad = () => { try{ NT = JSON.parse(localStorage.getItem(ntKey())||"null") || {rows:{}, recollects:""}; }catch(e){ NT = {rows:{}, recollects:""}; } NT.rows ||= {}; };
  const ntSave = () => { try{ localStorage.setItem(ntKey(), JSON.stringify(NT)); }catch(e){} };
  let lastJob = null;
  const sync = () => { const j = JOB?.name || "no-job"; if(j !== lastJob){ lastJob = j; ntLoad(); } };
  const rowKey = ci => { const b = groupOf(ci).base; return b.node || b.tag || ("col" + ci); };
  const FIELDS = ["cat","mtype","pla","mre","cell","dir","post","pre"];
  // every Notes row now carries your edits (Copy Notes rows in the toolbar too)
  notesRow = function(ci){ sync(); const r = autoRow(ci), e = NT.rows[rowKey(ci)] || {}; FIELDS.forEach(f=>{ if(e[f]!=null) r[f] = e[f]; }); r.mre = ABBR(r.mre); return r; };

  const MCLS = {"No MR":"c-nomr","Com Rearrangement":"c-comm","Power Make Ready":"c-power","Replacement":"c-repl"};
  const CCLS = {"No Violations":"c-nov","Midspan Violation":"c-mid","Pole Violation":"c-pole","Not Sure":"c-ns"};
  const PCLS = {"Pass":"c-pass","Fail":"c-fail","":"c-none"};

  // top tabs
  const nav = document.createElement("nav"); nav.className = "top-tabs"; nav.setAttribute("aria-label","Worksheets");
  nav.innerHTML = `<button type="button" role="tab" data-main="vds" aria-selected="true">Violation Determination</button><button type="button" role="tab" data-main="notes" aria-selected="false">Notes<span class="cnt" id="nt-count">0</span></button>`;
  document.querySelector(".gs-titlebar").after(nav);
  const view = document.createElement("div"); view.className = "ntview"; view.id = "ntview"; view.hidden = true;
  $("work").after(view);

  function setMain(m){
    MAIN = m;
    nav.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected", String(b.dataset.main===m)));
    const n = m==="notes";
    view.hidden = !n;
    [".gs-toolbar",".gs-fbar"].forEach(s=>{ const el = document.querySelector(s); if(el) el.hidden = n; });
    ["status","work","tabs"].forEach(id=>{ if($(id)) $(id).hidden = n; });
    if(n){ $("empty").dataset.wasHidden = $("empty").hidden; $("empty").hidden = true; const added = ensureAll(); render_(); if(added) toast(`Filled ${added} more pole${added>1?"s":""} from the Job JSON so every pole has a Notes row.`); }
    else { if($("empty").dataset.wasHidden!=null) $("empty").hidden = $("empty").dataset.wasHidden==="true"; setView(VIEW); }
    window.scrollTo(0,0);
  }

  const normScid = v => { const t = String(v??"").trim(); return /^\d+$/.test(t) ? String(parseInt(t,10)) : t.toUpperCase(); };
  // every pole in the Job JSON gets a Notes row: fill any pole that doesn't have a VDS column yet (columns you already have are kept as they are)
  function ensureAll(){
    try{
      if(typeof JOB==="undefined" || !JOB || typeof POLES==="undefined" || !POLES.length) return 0;
      const have = new Set(COLS.filter(c=>c.node).map(c=>c.node)), missing = POLES.filter(p=>!have.has(p.id));
      if(!missing.length) return 0;
      const next = [];
      POLES.forEach(p=>{ const mine = COLS.filter(c=>c.node===p.id); next.push(...(mine.length ? mine : buildGroup(p.id))); });
      COLS = next.concat(COLS.filter(c=>!c.node && c.tag));
      SEL = Math.min(SEL, COLS.length-1); render(); store.save(); S = COLS[SEL];
      return missing.length;
    }catch(e){ console.error(e); return 0; }
  }
  function rows(){ sync(); const s0 = SEL;
    const out = groupStarts().map(ci=>{ const a = autoRow(ci), key = rowKey(ci); let e = NT.rows[key] || {};
      // rows imported from your Notes Template are matched by SCID
      const imp = NT.imported?.[normScid(a.scid)]; if(imp && !e._imp){ const add = {}; Object.keys(imp).forEach(f=>{ if(!e["_vds_"+f]) add[f] = imp[f]; }); e = Object.assign({}, add, e, {_imp:1}); NT.rows[key] = e; ntSave(); }
      const r = Object.assign({}, a); FIELDS.forEach(f=>{ if(e[f]!=null) r[f] = e[f]; }); r.mre = ABBR(r.mre); return {ci, key, tag:groupOf(ci).base.tag||"", auto:a, r, e}; });
    const have = new Set(out.map(x=>normScid(x.auto.scid)));
    Object.entries(NT.imported||{}).forEach(([sc, imp])=>{ if(have.has(sc)) return; const key = "imp:" + sc, e = NT.rows[key] || {}; const a = {scid:sc, cat:"", mtype:"", pla:"", mre:"", cell:"", dir:"", post:"", pre:""}; const r = Object.assign({}, a, imp, e); r.mre = ABBR(r.mre); out.push({ci:-1, key, tag:"not in the VDS yet", auto:a, r, e:Object.assign({}, imp, e), orphan:true}); });
    out.sort((x,y)=>{ const nx = parseFloat(x.r.scid), ny = parseFloat(y.r.scid); return (isNaN(nx)?1e9:nx)-(isNaN(ny)?1e9:ny) || String(x.r.scid).localeCompare(String(y.r.scid)); });
    SEL = s0; S = COLS[SEL]; return out; }

  function render_(){
    const R = rows();
    $("nt-count").textContent = R.length;
    if(!R.length){ view.innerHTML = `<div class="nt-empty"><b>No poles yet.</b> Load the Katapult Job JSON on the Violation Determination tab. Each pole then gets a Notes row here, filled from its VDS column.</div>`; return; }
    const cnt = (list, f) => list.map(v=>[v, R.filter(x=>x.r[f]===v).length]);
    const box = (title, pairs, cls) => `<div class="nt-box"><h3>${title}</h3><table class="nt-cnt">${pairs.map(([v,n])=>`<tr><td><span class="lbl ${cls[v]||""}">${esc(v==="Power Make Ready"?"Power Work":v)}</span></td><td class="n">${n}</td></tr>`).join("")}<tr class="tot"><td>Total</td><td class="n">${R.length}</td></tr></table></div>`;
    const opt = (list, v) => (list.includes(v) || !v ? (list[0]===""?list:[""].concat(list)) : [v,""].concat(list)).map(x=>`<option${x===(v||"")?" selected":""}>${esc(x)}</option>`).join("");
    const edited = (x, f) => x.e[f]!=null && x.e[f]!==x.auto[f] && !x.orphan ? `<div class="nt-edit">${x.e._imp && !x.e["_t_"+f] && x.e[f]===NT.imported?.[normScid(x.r.scid)]?.[f] ? "From your Notes Template" : "Changed by you"} · VDS says “${esc(String(x.auto[f]).split("\n")[0].slice(0,40)||"—")}” <button type="button" data-ntreset="${esc(x.key)}|${f}">Use VDS</button></div>` : "";
    view.innerHTML = `
      <div class="nt-tools"><span class="grow muted">Filled from each pole's VDS column. Change anything here: your edits stay when the VDS changes, and <b>Use VDS</b> puts the VDS value back.</span>
        <button type="button" id="nt-copy" class="primary" title="Paste at A8 (SCID 1's row) in your Notes Template">Copy all rows</button>
        <span class="filebtn"><button type="button" tabindex="-1">Import Notes Template .xlsx</button><input type="file" id="nt-imp" accept=".xlsx" aria-label="Import your Notes Template workbook"></span>
        <button type="button" id="nt-xlsx" title="A Notes worksheet with these rows and counters">Download Notes .xlsx</button></div>
      <div class="nt-top">${box("MR Counter", cnt(MTYPES,"mtype"), MCLS)}${box("PCI Counter", cnt(CATS,"cat"), CCLS)}
        <div class="nt-box"><h3>Recollects</h3><textarea id="nt-rec" placeholder="Poles to recollect from the field (a pole, a power guy for PLA, the next pole over, uplift on a non-collected pole…)">${esc(NT.recollects||"")}</textarea></div></div>
      <div class="nt-wrap"><table class="nt"><thead><tr><th>Scid</th><th>Violations</th><th>MRE Type</th><th>PLA</th><th>MRE Notes <span class="red">(Mark Questions in Red and ask all at the same time)</span></th><th>Cell #</th><th>Scid direction</th><th>Clearance Post-1990</th><th>Clearance Pre-1990</th></tr></thead><tbody>
      ${R.map(x=>{ const r = x.r, blk = t => esc(t).replace(/^([^\n]*)/, "<b>$1</b>");
        const ta = f => `<textarea data-nt="${esc(x.key)}|${f}" aria-label="${f}" rows="${Math.max(8, String(r[f]||"").split("\n").length+1)}">${esc(r[f]||"")}</textarea>`;
        return `<tr class="${x.orphan?"orphan":""}"><td class="scid">${x.orphan?`<b>${esc(r.scid)}</b>`:`<button type="button" data-ntjump="${x.ci}" title="Open this pole's VDS column">${esc(r.scid||"—")}</button>`}<span class="tag">${esc(x.tag)}</span></td>
        <td class="dd"><select class="${CCLS[r.cat]||""}" data-nt="${esc(x.key)}|cat" aria-label="Violations">${opt(CATS, r.cat)}</select>${edited(x,"cat")}</td>
        <td class="dd"><select class="${MCLS[r.mtype]||""}" data-nt="${esc(x.key)}|mtype" aria-label="MRE Type">${opt(MTYPES, r.mtype)}</select>${edited(x,"mtype")}</td>
        <td class="pla"><select class="${PCLS[r.pla||""]}" data-nt="${esc(x.key)}|pla" aria-label="PLA">${opt(["","Pass","Fail"], r.pla||"")}</select></td>
        <td class="mre"><textarea data-nt="${esc(x.key)}|mre" aria-label="MRE Notes" rows="${Math.max(4, String(r.mre||"").split("\n").length+1)}">${esc(r.mre||"")}</textarea>${edited(x,"mre")}</td>
        <td class="blk">${ta("cell")}</td><td class="blk">${ta("dir")}</td><td class="blk">${ta("post")}</td><td class="blk">${ta("pre")}</td></tr>`; }).join("")}
      </tbody></table></div>`;
  }

  nav.addEventListener("click", e=>{ const b = e.target.closest("[data-main]"); if(b) setMain(b.dataset.main); });
  view.addEventListener("change", e=>{
    const t = e.target;
    if(t.id==="nt-imp"){ const f = t.files?.[0]; t.value = ""; if(f) importXlsx(f); return; }
    if(t.id==="nt-rec"){ NT.recollects = t.value; ntSave(); return; }
    if(t.dataset.nt){ const [k,f] = t.dataset.nt.split("|"); const e = (NT.rows[k] ||= {}); e[f] = t.value; e["_t_"+f] = 1; ntSave(); render_(); }
  });
  view.addEventListener("click", e=>{
    const rs = e.target.closest("[data-ntreset]"); if(rs){ const [k,f] = rs.dataset.ntreset.split("|"); if(NT.rows[k]){ delete NT.rows[k][f]; NT.rows[k]["_t_"+f] = 1; NT.rows[k]["_vds_"+f] = 1; } ntSave(); render_(); return; }
    const j = e.target.closest("[data-ntjump]"); if(j){ const ci = +j.dataset.ntjump; setMain("vds"); setView("template"); setSel(ci); document.querySelector(`thead th.col[data-col="${ci}"]`)?.scrollIntoView({inline:"center", block:"nearest"}); return; }
    if(e.target.id==="nt-copy"){ const R = rows(); copyRows(R.map(x=>x.r), `Copied ${R.length} row${R.length>1?"s":""}. Click A8 (SCID 1's row) in the Notes Template and paste.`); return; }
    if(e.target.id==="nt-xlsx"){ notesXlsx(e.target); return; }
  });

  // read your Notes Template (Design V2.1 layout: counters in rows 1–6, header in row 7, SCID 1 in row 8)
  async function importXlsx(file){
    try{
      const ExcelJS = await loadExcel(), wb = new ExcelJS.Workbook(); await wb.xlsx.load(await file.arrayBuffer());
      const txt = c => { const v = c.value; if(v==null) return ""; if(typeof v==="object"){ if(v.richText) return v.richText.map(x=>x.text).join(""); if("result" in v) return String(v.result??""); if(v.text) return String(v.text); } return String(v); };
      let ws = null, hr = 0;
      wb.eachSheet(sh=>{ if(ws) return; for(let r=1;r<=15;r++){ const a = txt(sh.getCell("A"+r)).trim().toLowerCase(), e = txt(sh.getCell("E"+r)).toLowerCase(); if(a==="scid" && /mre\s+notes/.test(e)){ ws = sh; hr = r; break; } } });
      if(!ws){ toast("Couldn't find the Notes layout (a row with Scid / Violations / MRE Type / PLA / MRE Notes)."); return; }
      const blank = t => !String(t).replace(/^(Cell #|Scid direction|Scid|Clearance (Post|Pre)-1990)\s*/i,"").replace(/\d+\.\s*/g,"").trim();
      const imp = {}; let n = 0;
      for(let r=hr+1; r<=ws.rowCount; r++){
        const sc = normScid(txt(ws.getCell("A"+r))); if(!sc || !/^[\dA-Z.]+$/.test(sc)) continue;
        const row = {cat:txt(ws.getCell("B"+r)).trim(), mtype:txt(ws.getCell("C"+r)).trim(), pla:txt(ws.getCell("D"+r)).trim(), mre:txt(ws.getCell("E"+r)).replace(/\r/g,"").trim(), cell:txt(ws.getCell("F"+r)), dir:txt(ws.getCell("G"+r)), post:txt(ws.getCell("H"+r)), pre:txt(ws.getCell("I"+r))};
        const o = {}; ["cat","mtype","pla","mre"].forEach(f=>{ if(row[f]) o[f] = row[f]; }); ["cell","dir","post","pre"].forEach(f=>{ if(row[f] && !blank(row[f])) o[f] = row[f].replace(/\r/g,""); });
        if(Object.keys(o).length){ imp[sc] = o; n++; }
      }
      NT.imported = imp; Object.values(NT.rows).forEach(e=>{ delete e._imp; }); Object.keys(NT.rows).forEach(k=>{ if(k.startsWith("imp:")) delete NT.rows[k]; });
      // imported values replace earlier imports, but not what you typed here since
      Object.keys(NT.rows).forEach(k=>{ const e = NT.rows[k]; ["cat","mtype","pla","mre","cell","dir","post","pre"].forEach(f=>{ if(e[f]!=null && e["_t_"+f]==null) delete e[f]; }); });
      ntSave(); render_(); toast(`Imported ${n} SCID row${n===1?"":"s"} from ${ws.name}. Anything you wrote there now shows here; Use VDS puts the VDS value back.`);
    }catch(err){ console.error(err); toast("Couldn't read that file. Save it from Google Sheets as .xlsx (File → Download → Microsoft Excel)."); }
  }

  async function notesXlsx(btn){
    btn.disabled = true; const lab = btn.textContent; btn.textContent = "Building…";
    try{
      const ExcelJS = await loadExcel(), wb = new ExcelJS.Workbook(), ws = wb.addWorksheet("Notes");
      const R = rows(), fill = c => ({type:"pattern", pattern:"solid", fgColor:{argb:"FF"+c}});
      const COL = {"No MR":"11734B","Com Rearrangement":"F8F000","Power Make Ready":"FDB707","Replacement":"B10202","No Violations":"D4EDBC","Midspan Violation":"FFCFC9","Pole Violation":"3D85C6","Not Sure":"3D3D3D","Pass":"11734B","Fail":"CC0000"};
      const DARK = new Set(["No MR","Replacement","Pole Violation","Not Sure","Pass","Fail"]);
      ws.getCell("A1").value = "MR Counter"; ws.getCell("C1").value = "PCI Counter"; ws.getCell("E1").value = "Recollects";
      MTYPES.forEach((m,i)=>{ const a = ws.getCell("A"+(i+2)), b = ws.getCell("B"+(i+2)); a.value = m; a.fill = fill(COL[m]); a.font = {color:{argb:DARK.has(m)?"FFFFFFFF":"FF202124"}, bold:true}; b.value = R.filter(x=>x.r.mtype===m).length; if(m==="Power Make Ready") a.value = "Power Work"; });
      CATS.forEach((m,i)=>{ const a = ws.getCell("C"+(i+2)), b = ws.getCell("D"+(i+2)); a.value = m; a.fill = fill(COL[m]); a.font = {color:{argb:DARK.has(m)?"FFFFFFFF":"FF202124"}, bold:true}; b.value = R.filter(x=>x.r.cat===m).length; });
      ws.getCell("A6").value = "Total"; ws.getCell("B6").value = R.length; ws.getCell("C6").value = "Total"; ws.getCell("D6").value = R.length;
      ws.getCell("E2").value = NT.recollects || ""; ws.getCell("E2").alignment = {wrapText:true, vertical:"top"};
      const head = ["Scid","Violations","MRE Type","PLA","MRE Notes (Mark Questions in Red and ask all at the same time)","Cell #","Scid direction","Clearance Post-1990","Clearance Pre-1990"];
      ws.getRow(7).values = head; ws.getRow(7).eachCell(c=>{ c.font = {bold:true}; c.fill = fill("B7B7B7"); c.alignment = {horizontal:"center", wrapText:true}; });
      R.forEach((x,i)=>{ const r = x.r, row = ws.getRow(8+i);
        row.values = [/^\d+$/.test(r.scid)?+r.scid:r.scid, r.cat, r.mtype, r.pla||"", r.mre, r.cell, r.dir, r.post, r.pre];
        [[2,r.cat],[3,r.mtype],[4,r.pla]].forEach(([c,v])=>{ if(COL[v]){ row.getCell(c).fill = fill(COL[v]); row.getCell(c).font = {color:{argb:DARK.has(v)?"FFFFFFFF":"FF202124"}, bold:true}; } });
        row.eachCell(c=>{ c.alignment = Object.assign({vertical:"top", wrapText:true}, c.alignment||{}); });
        row.getCell(2).dataValidation = {type:"list", allowBlank:true, formulae:['"'+CATS.join(",")+'"']};
        row.getCell(3).dataValidation = {type:"list", allowBlank:true, formulae:['"'+MTYPES.join(",")+'"']};
        row.getCell(4).dataValidation = {type:"list", allowBlank:true, formulae:['"Pass,Fail"']};
      });
      [8,18,20,8,48,14,16,20,20].forEach((w,i)=>ws.getColumn(i+1).width = w);
      ws.views = [{state:"frozen", ySplit:7}];
      const buf = await wb.xlsx.writeBuffer();
      await offerFile(buf, `Notes ${JOB?.name || "worksheet"}.xlsx`.replace(/[\\/:*?"<>|]+/g," "), "Saved. Upload it to Google Drive and open it with Google Sheets.");
    }catch(err){ console.error(err); toast("Couldn't build the file (the spreadsheet library didn't load). Use Copy all rows instead."); }
    finally{ btn.disabled = false; btn.textContent = lab; }
  }

  // sessions carry the Notes edits too
  $("btn-save").onclick = ()=>{ sync(); const name = (JOB?.name || COLS.find(c=>c.proposal)?.proposal || "VDS") + " session.json";
    const d = {vdsSession:1, layout:2, saved:new Date().toISOString(), job:JOB?.name||"", cols:COLS, sel:SEL, start:$("start-col").value, wf:WF, nt:NT};
    offerFile(new TextEncoder().encode(JSON.stringify(d)), name.replace(/[\\/:*?"<>|]+/g," "), "Session saved (with your Notes). Open session brings it back; load the Job JSON too for the SCID pickers and after JSON."); };
  $("s-file").addEventListener("change", e=>{ const f = e.target.files?.[0]; if(!f) return; const rd = new FileReader();
    rd.onload = ()=>{ try{ const d = JSON.parse(rd.result); if(d && d.vdsSession && d.nt && (!JOB || JOB.name===d.job)){ NT = d.nt; NT.rows ||= {}; lastJob = JOB?.name || "no-job"; ntSave(); if(MAIN==="notes") render_(); else $("nt-count").textContent = groupStarts().length; } }catch(err){} };
    rd.readAsText(f); }, true);

  // keep the tab count fresh
  setInterval(()=>{ if(MAIN==="vds"){ try{ $("nt-count").textContent = groupStarts().length; }catch(e){} } }, 1500);
})();
