
/* ===================== QC my VDS sheet =====================
   Upload the Violation Determination workbook you filled in by hand (Google Sheets → File → Download → .xlsx).
   Each of its pole columns is matched to the tool's column by SCID (row 1; "SCID MR" → the After MR column) and
   compared row by row: your entry vs. what the tool read from Katapult, with why it differs and how to fix it.
   Read-only: the tool's sheet isn't changed (its columns are restored afterwards and nothing is saved).
   "Download marked-up copy" gives your own workbook back with the cells highlighted and a note on each. */
(function(){
  const T = v => String(v ?? "").replace(/ /g," ").replace(/[’′]/g,"'").replace(/[”″]/g,'"').replace(/\s+/g," ").trim();
  const E = s => esc(String(s ?? ""));
  const LBL = r => T(META.labels?.[String(r)] || "") || `Row ${r}`;
  const yn = s => ({y:"yes",yes:"yes",n:"no",no:"no"})[String(s).toLowerCase()];
  const isFt = s => /\d\s*'/.test(s);
  const numRe = /^-?\d+(\.\d+)?$/;
  function cellVal(cell){
    let v = cell?.value;
    if(v == null) return {v:"", f:false};
    if(typeof v === "object"){
      if(v instanceof Date) return {v:v.toISOString().slice(0,10), f:false};
      if("formula" in v || "sharedFormula" in v){ const r = v.result; return {v: r==null ? "" : (typeof r==="object" ? (r.error || r.richText?.map(t=>t.text).join("") || "") : r), f:true}; }
      if(v.richText) return {v:v.richText.map(t=>t.text).join(""), f:false};
      if(v.error) return {v:v.error, f:false};
      if(v.text != null) return {v:v.text, f:false};
    }
    return {v, f:false};
  }
  const noteOf = cell => { const n = cell?.note; if(!n) return ""; if(typeof n === "string") return n; return (n.texts||[]).map(t=>t.text||"").join(""); };
  function same(r, a, b){
    const A = T(a), B = T(b);
    if(A.toLowerCase() === B.toLowerCase()) return true;
    if(isFt(A) || isFt(B)){ const x = parseFt(A), y = parseFt(B); if(x!=null && y!=null) return Math.abs(x-y) <= 1; }
    if(numRe.test(A) && numRe.test(B)) return Math.abs(+A - +B) <= (r>=15 && r<=20 ? 1 : 0.05);
    if(yn(A) && yn(A) === yn(B)) return true;
    if((r===4 || r===7) && ((!A && yn(B)==="no") || (!B && yn(A)==="no"))) return true;   // blank = No on the Y/N picks
    // comm names (rows 94, 139, 184 …): the tool's short name vs the full one ("Sudden" / "Suddenlink", "Frontier" / "Frontier Communications")
    if(r>=94 && r<=318 && (r-94)%45===0 && A && B){ const k = x => x.toLowerCase().replace(/[^a-z]/g,""); const a1 = k(A), b1 = k(B);
      if(a1.length >= 4 && b1.length >= 4 && (a1.startsWith(b1) || b1.startsWith(a1))) return true; }
    return false;
  }
  const scidKey = s => { s = T(s).toUpperCase().replace(/^SCID\s*#?\s*/,"").replace(/\(.*?\)/g,"").replace(/\bMR\b|\bREPLACEMENT\b|\bAFTER\b|\bR\/?P\b/g,"").replace(/[()#]/g,"").trim(); return s.replace(/^0+(?=\d)/,"").replace(/\s+/g,""); };
  const isMR = s => /\bMR\b|replace|\bafter\b|\bR\/?P\b|post[- ]?mr/i.test(T(s));

  // what each sheet row is, why it would differ, and how to fix it
  function explain(r, c, R, tool, mine, cmap){
    const span = k => { const i = KEYS.indexOf(k), sp = c.spans[k]; return `${SPAN_NAMES[i]} span${sp?.label ? ` (to ${sp.label})` : ""}`; };
    const warnFor = k => (c.warn||[]).filter(w => w.includes(SPAN_NAMES[KEYS.indexOf(k)])).slice(0,2).join(" ");
    const mr = c.after ? " (After MR column: the heights after your make-ready in Katapult)" : "";
    if(r===1) return {sev:"err", what: c.after ? "Make-ready column title" : "SCID", why: c.after ? "The make-ready column is titled \"SCID MR\" in the grey header (FE 411 steps 16–17, updated 11/2). That replaced the older \"SCID # (replacement)\" title, so this column was matched to the pole's make-ready column, but the title has to change." : "The column header is the pole's SCID, exactly as in Katapult.", fix:`Type ${tool}.`};
    if(r===2) return {sev:"err", what:"Pole tag", why:"The pole tag has to match Katapult, the CAD block and SPANS exactly, or the job can be denied.", fix:`Use ${tool}.`};
    if(r===3){ let why = ""; try{ why = eraFor(c).why || ""; }catch(e){}
      const line = c.line==="pre1961" ? "a pre-1961 line" : c.line==="pre1990" ? "a pre-1990 line" : c.line==="post" ? "a post-1990 line" : "";
      if(!why) why = tool==="Post-1990" ? `Post-1990 is loaded first${line?` (the pole note says ${line})`:""} and it passes, so the column stays Post-1990 (411 step 7).` : `Post-1990 fails on ${line||"this line"}, so the column is loaded Pre-1990 (411 step 8).`;
      // the existing column of a pole being replaced stays switchable (411 steps 16–17, 11/2): the tool reads it Post-1990, but Pre-1990 is allowed
      if(c.replaced && !c.after) return {sev:"chk", what:"Pre/Post-1990 (row 3)", why:`This pole is being replaced. Its existing column stays switchable between Pre-1990 and Post-1990 (411 steps 16–17, updated 11/2); the tool reads it ${tool}. ${mine==="Pre-1990" ? "Pre-1990 is fine on a pre-1990 line when a Post-1990 cell fails." : ""} The calculated rows below follow row 3 (marked ↳3).`, fix:`Keep ${mine||"your pick"} if the line and the failing cell support it; otherwise change row 3 to ${tool}. The make-ready column is always Post-1990.`};
      return {sev:"err", what:"Pre/Post-1990 (row 3)", why:`${why} Every clearance and sag result in this column follows row 3, so a wrong pick changes whether the pole passes.`, fix:`Change row 3 to ${tool}. The calculated rows below it will then match (they're marked ↳3).`}; }
    if(r===4) return {sev:"chk", what:"Pre-1961", why:"Only Yes when the line is pre-1961 (pole note line designation).", fix:`The tool used ${tool||"blank"}.`};
    if(r===5 || r===6) return {sev:"err", what:r===5?"Pole height":"Pole class", why:`From the Katapult pole spec${c.after?"; on a replacement the MR column gets the new pole":""}.`, fix:`Use ${tool}.`};
    if(r===7) return {sev:"chk", what:"Red tag", why:"Assumed No unless the pole has a red tag (square red tag with logo).", fix:`The tool used ${tool||"blank"}.`};
    if(r>=9 && r<=14){ const k = KEYS[r-9]; return {sev:"chk", what:`Conductor, ${span(k)}`, why:`The lowest power in the span, picked from the dropdown. 411 VDS wire specs: 4 AAAC → 4 ACSR, 2 ACSR → 2 AAAC, 3-6 Copperweld → 6 ACW, service drop → 4 ACSR TPX, pole-to-pole secondary → 1/0 ACSR TPX, larger than 3/0 → 3/0. ${warnFor(k)}`.trim(), fix:`The tool picked ${tool||"blank"}. A wrong conductor changes the sag and every comm clearance in this span.`}; }
    if(r>=15 && r<=20){ const k = KEYS[r-15]; return {sev:"err", what:`Span length, ${span(k)}`, why:"From Katapult's span length. Spans with a reference number (001.A, buildings) are included too.", fix:`Use ${tool}'. Type a plain number (no ' after it).`}; }
    if(r>=21 && r<=26){ const k = KEYS[r-21]; return {sev:"err", what:`Power at the pole, ${span(k)}`, why:`The lowest bolted power (secondary / neutral) at the pole toward this span in Katapult${mr}.`, fix:`Use ${tool}.`}; }
    if(r>=33 && r<=38){ const k = KEYS[r-33]; return {sev:"err", what:`Power midspan, ${span(k)}`, why:`Katapult's midspan height of the lowest power in this span${mr}. The sheet uses the lower of this and the calculated sag.`, fix:`Use ${tool}.`}; }
    if(r>=39 && r<=44){ const k = KEYS[r-39]; return {sev:"chk", what:`Environment, ${span(k)}`, why:"The strictest environment the span crosses (a roadway wins). Check the WV Property Viewer by the midspan coordinates: Katapult \"Rural\" = Pedestrian; Farmland only with tractor access.", fix:`The tool used ${tool||"blank"}. This changes the required ground clearance.`}; }
    if(r>=94 && r<=318){
      const j = Math.floor((r-94)/45), o = r - ATT_BASE(j), a = c.atts[cmap ? cmap[j] : j], nm = a?.name ? ` (${a.name})` : "";
      if(o===0){ const keep = " Don't move your other comm sections: the QC matches each one to Katapult by company and type, wherever it sits.";
        if(!T(mine)) return {sev:"err", what:`Comm missing from your sheet: ${tool}`, why:`Katapult has ${tool}${T(valueOf(c, ATT_BASE(cmap ? cmap[j] : j)+1, R) ?? "") ? ` (${T(valueOf(c, ATT_BASE(cmap ? cmap[j] : j)+1, R))})` : ""} on this pole, and none of your comm sections lists it.`, fix:`Add ${tool} in this empty comm section (rows ${ATT_BASE(j)}–${ATT_BASE(j)+44}).${keep}`};
        if(!T(tool)) return {sev:"chk", what:`Katapult has no ${mine} on this pole`, why:`Your sheet lists ${mine} here, but no comm traced on this pole in Katapult matches it by company.`, fix:`Check the pole photos. If ${mine} is there, trace it in Katapult and reload the JSON; if not, clear this section.${keep}`};
        return {sev:"chk", what:`Comm name: ${mine} vs ${tool}`, why:`Your ${mine} doesn't match any comm on this pole in Katapult by company, and Katapult's ${tool} isn't on your sheet.`, fix:`Check which company it is in the photos.${keep}`}; }
      if(o===1) return {sev:"chk", what:`Comm ${j+1} type${nm}`, why:"Copper = Telco; Fiber Optic = CATV and Fiber; ADSS = comm drop. It picks the separation table.", fix:`Use ${tool}.`};
      if(o>=8 && o<=13){ const k = KEYS[o-8]; return {sev:"err", what:`Comm ${j+1}${nm} at the pole, ${span(k)}`, why:`Katapult height of this comm at the pole toward the span${mr}. Same-direction drops at the same height load as the lowest one.`, fix:`Use ${tool}.`}; }
      if(o>=14 && o<=19){ const k = KEYS[o-14]; return {sev:"err", what:`Comm ${j+1}${nm} midspan, ${span(k)}`, why:`Katapult midspan height of this comm${mr}.`, fix:`Use ${tool}.`}; }
    }
    if(r===319) return {sev:"chk", what:"Proposed name", why:"The proposed attacher's name (pink section).", fix:`Use ${tool}.`};
    if(r===320) return {sev:"chk", what:"Proposed type", why:"12/24 ct drop = ADSS; trunk fiber = Fiber Optic.", fix:`Use ${tool}.`};
    if(r===334) return {sev:"chk", what:"Design", why:"The cheapest design that clears every violation (Violations & fixes panel).", fix:`The tool recommends ${tool||"blank"}.`};
    return null;   // a calculated row
  }

  // the tool's column for each SCID: before and After MR
  function toolIndex(){
    const map = {};
    groupStarts().forEach(s=>{ const g = groupOf(s), R = compute(COLS[g.detCi]), key = scidKey(valueOf(COLS[g.detCi], 1, R) || g.base.scid || "");
      const tag = T(g.base.tag).toUpperCase();
      const e = {det:g.detCi, after: g.after ? g.afterCi : -1, tag, scid:key};
      if(key) map["S:"+key] = e; if(tag) map["T:"+tag] = e; });
    return map;
  }
  function pickSheet(wb){
    let best = null, bestScore = -1;
    wb.eachSheet(ws=>{ let sc = 0; [2,5,6,9,15,21,33,39,94,319].forEach(r=>{ const a = T(cellVal(ws.getCell("A"+r)).v).toLowerCase(), l = LBL(r).toLowerCase(); if(a && l && a.slice(0,12)===l.slice(0,12)) sc++; });
      if(sc > bestScore){ bestScore = sc; best = ws; } });
    return {ws:best, score:bestScore};
  }

  // Google Sheets downloads comments as Excel threaded comments, which ExcelJS doesn't read: pull them (and legacy notes) from the zip
  async function sheetComments(buf, sheetName){
    const out = {}; if(!window.JSZip) return out;
    try{ const z = await JSZip.loadAsync(buf), rd = async f => (await z.file(f)?.async("string")) || "";
      const wbx = await rd("xl/workbook.xml"), rels = await rd("xl/_rels/workbook.xml.rels");
      const sh = [...wbx.matchAll(/<sheet [^>]*name="([^"]*)"[^>]*r:id="([^"]*)"/g)].find(m=>m[1].replace(/&amp;/g,"&")===sheetName); if(!sh) return out;
      const tgt = (rels.match(new RegExp(`Id="${sh[2]}"[^>]*Target="([^"]*)"|Target="([^"]*)"[^>]*Id="${sh[2]}"`))||[]).slice(1).find(Boolean); if(!tgt) return out;
      const sheetPath = "xl/" + tgt.replace(/^\/?xl\//,""), relPath = sheetPath.replace(/worksheets\//,"worksheets/_rels/") + ".rels", srels = await rd(relPath);
      const dec = t => t.replace(/<[^>]+>/g,"").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
      for(const m of srels.matchAll(/Target="([^"]*(?:threadedComment|comments)[^"]*)"/g)){
        const f = "xl/" + m[1].replace(/^(\.\.\/)+/,"").replace(/^\/?xl\//,""), x = await rd(f);
        for(const c of x.matchAll(/<(threadedComment|comment)\b[^>]*\bref="([A-Z]+\d+)"[^>]*>([\s\S]*?)<\/\1>/g)){ const txt = dec((c[3].match(/<text>([\s\S]*?)<\/text>/)||[])[1] ?? c[3]).trim();
          if(txt) out[c[2]] = out[c[2]] ? out[c[2]] + "\n" + txt : txt; } }
    }catch(err){ console.error(err); }
    return out;
  }
  // a sheet formula, normalized so your column's formula can be compared with the template's column-B formula
  const normF = (f, L) => { let x = String(f||"").replace(/^=/,""); if(L && L!=="B") x = x.replace(new RegExp(`(?<![A-Za-z$!'"])${L}(?=\\$?\\d)`,"g"), "B");   // same rule as remap(): only relative column letters
    x = x.replace(/'[^']*'!/g,"!").replace(/\$/g,"").replace(/:([A-Z]+)\d*(?=[,)])/g,":$1").replace(/\s+/g,"").toUpperCase();
    // IFERROR(x) and IFERROR(x,"") give the same result (11/11: the team's rows 87–92 use the one-argument form)
    let out = "", i = 0;
    while(i < x.length){
      if(x.startsWith("IFERROR(", i)){ let d = 0, j = i + 7, top = 0; out += "IFERROR(";
        const st = [];
        for(j = i + 8; j < x.length; j++){ const ch = x[j]; if(ch==='"'){ const k = x.indexOf('"', j+1); j = k < 0 ? x.length : k; continue; }
          if(ch==="(") d++; else if(ch===")"){ if(d===0) break; d--; } else if(ch==="," && d===0) top++; }
        const inner = x.slice(i + 8, j); out += normF("=" + inner, "B") + (top===0 ? ',""' : "") + ")"; i = j + 1; continue; }
      out += x[i++]; }
    return out; };
  const cellFormula = cell => { const v = cell?.value; if(!v || typeof v!=="object") return ""; return v.formula || (()=>{ try{ return cell.formula || ""; }catch(e){ return ""; } })(); };
  async function analyze(buf, fileName){
    const ExcelJS = await loadExcel(), wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf);
    const {ws, score} = pickSheet(wb);
    const CM = ws ? await sheetComments(buf, ws.name) : {};
    const cmt = cell => noteOf(cell) || CM[cell?.address] || "";
    if(!ws || score < 4) throw new Error("That workbook doesn't have the Violation Determination sheet (row labels in column A didn't match). Download the VDS tab from Google Sheets as .xlsx and try again.");
    const idx = toolIndex(), poles = [], unmatched = [], seen = new Set(), fdiff = {};
    const XROWS = [...Array(6).keys()].flatMap(k => [15+k, 21+k, 33+k]);
    const toolCols = [];
    groupStarts().forEach(st => { const g = groupOf(st); [[g.detCi, false], ...(g.after ? [[g.afterCi, true]] : [])].forEach(([ci, mr]) => {
      const c = COLS[ci], R = compute(c), v = {}; XROWS.forEach(r => { const x = valueOf(c, r, R); v[r] = T(x==null ? "" : x); });
      toolCols.push({ci, mr, sc: scidKey(valueOf(c, 1, R) || g.base.scid || ""), v}); }); });
    let anyNote = false;
    const last = Math.max(ws.actualColumnCount || 0, ws.columnCount || 0);
    for(let col=2; col<=last; col++){ for(let r=1; r<=334 && !anyNote; r++){ if(cmt(ws.getCell(r, col))) anyNote = true; } }
    for(let col=2; col<=last; col++){
      const L = colName(col), h1 = T(cellVal(ws.getCell(L+"1")).v), h2 = T(cellVal(ws.getCell(L+"2")).v);
      if(!h1 && !h2) continue;
      const e = idx["S:"+scidKey(h1)] || idx["T:"+h2.toUpperCase()];
      if(!e){ unmatched.push({L, h1, h2}); continue; }
      const mr = isMR(h1), ci = mr ? e.after : e.det;
      if(mr && ci < 0){ poles.push({L, h1, sc:e.scid, mr, noAfter:true, items:[], follow:0}); seen.add(e.scid+(mr?"MR":"")); continue; }
      seen.add(e.scid+(mr?"MR":""));
      const c = COLS[ci], R = compute(c), items = [], rows = []; let follow = 0, followRows = [];
      // comm blocks with no comm on either side are skipped whole: the sheet's formulas show 0' 0" there, the tool shows blank (11/12)
      // match each of your comm sections to the tool's comm by company and type, not by position (11/12: an MR column keeps the
      // existing column's comm order even when the make-ready changes which comm is on top; two comms at the same height can go either way)
      const blk = j => 94 + 45*j, nameKey = x => T(x).toLowerCase().replace(/[^a-z]/g,"");
      const sameCo = (a, b) => { const x = nameKey(a), y = nameKey(b); return !!x && !!y && (x===y || (x.length>=4 && y.length>=4 && (x.startsWith(y) || y.startsWith(x)))); };
      const S5 = [...Array(5).keys()].map(j => ({nm:T(cellVal(ws.getCell(L+blk(j))).v), tp:T(cellVal(ws.getCell(L+(blk(j)+1))).v)}));
      const T5 = [...Array(5).keys()].map(k => ({nm:T(valueOf(c, blk(k), R) ?? ""), tp:T(valueOf(c, blk(k)+1, R) ?? ""),
        top: Math.max(-1, ...[...Array(6).keys()].map(i => parseFt(T(valueOf(c, blk(k)+8+i, R) ?? "")) ?? -1))}));
      const cmap = Array(5).fill(null), usedK = new Set();
      // score every pairing of a sheet section with a tool comm of the same company: type first, then how many of the
      // section's lengths / heights / midspans agree, so two comms from one company (two Suddenlink lines) still pair up right
      const agree = (j, k) => { let n = 0; for(let o=2; o<20; o++){ const mv = T(cellVal(ws.getCell(L+(blk(j)+o))).v), tv = T(valueOf(c, blk(k)+o, R) ?? ""); if(mv && tv && same(blk(j)+o, mv, tv)) n++; } return n; };
      const pairs = [];
      S5.forEach((sj, j) => { if(!sj.nm) return; for(let k=0; k<5; k++){ if(!sameCo(sj.nm, T5[k].nm)) continue;
        pairs.push({j, k, sc: (T(sj.tp).toLowerCase()===T(T5[k].tp).toLowerCase() ? 1000 : 0) + 10*agree(j, k) + (j===k ? 1 : 0)}); } });
      pairs.sort((a, b) => b.sc - a.sc).forEach(({j, k}) => { if(cmap[j]==null && !usedK.has(k)){ cmap[j] = k; usedK.add(k); } });
      S5.forEach((sj, j) => { if(sj.nm && cmap[j]==null && !usedK.has(j)){ cmap[j] = j; usedK.add(j); } });          // no match: compare in place
      const spare = [...Array(5).keys()].filter(k => T5[k].nm && !usedK.has(k));                                        // tool comms your sheet doesn't list
      S5.forEach((sj, j) => { if(!sj.nm && cmap[j]==null && spare.length){ const k = spare.includes(j) ? j : spare[0]; spare.splice(spare.indexOf(k), 1); cmap[j] = k; usedK.add(k); } });
      S5.forEach((sj, j) => { if(cmap[j]==null) cmap[j] = j; });
      const toolRow = r => (r>=94 && r<=318) ? r + 45*(cmap[Math.floor((r-94)/45)] - Math.floor((r-94)/45)) : r;
      const emptyBlock = new Set(); let commsMine = 0, commsTool = 0;
      for(let j=0; j<5; j++){ const nm = S5[j].nm, tn = T5[cmap[j]].nm;
        if(nm) commsMine++; if(tn) commsTool++; if(!nm && !tn) emptyBlock.add(j); }
      // an existing (not MR) column should still list comms top-down; ties at the same height can go either way
      if(!mr){ const tops = S5.map((sj, j) => sj.nm && sameCo(sj.nm, T5[cmap[j]].nm) ? T5[cmap[j]].top : null).filter(x => x!=null && x>=0);
        if(tops.some((h, i) => i && h > tops[i-1] + 1)) items.push({r:94, cell:L+"94", sev:"chk", what:`Comms aren't listed top-down`, mine:S5.filter(x=>x.nm).map(x=>x.nm).join(", "), tool:[...Array(5).keys()].filter(k=>T5[k].nm).map(k=>T5[k].nm).join(", "),
          why:`Row 94 rule: comm 1 is the highest comm at the pole, then the next one down. Your sections were matched to the tool's comms by company and type, so the rows below are compared correctly either way.`,
          fix:`Reorder the comm sections top-down by pole height, or leave it if your lead is fine with this order.`}); }
      let noCommItem = null;
      if(!commsMine && !commsTool) items.push(noCommItem = {r:94, cell:L+"94", sev:"chk", what:`No existing comms on this pole`, mine:"(none)", tool:"(none)",
        why:`Neither your sheet nor Katapult has an existing comm attached here, so the comm sections (rows 94–318) are skipped. Formula rows there show 0' 0" on the sheet and blank in the tool; that's expected.`,
        fix:`Check the pole photos in Katapult to make sure there's really no comm (or comm drop) on this pole. If there is one, trace it and reload the JSON.`});
      // 1. entries and results, row by row
      for(let r=1; r<=334; r++){
        if(r===8 || HIDDEN.has(r)) continue;
        if(r>=94 && r<=318 && emptyBlock.has(Math.floor((r-94)/45))){
          if(r===94 && noCommItem) rows.push({r, cell:L+r, mine:"(none)", tool:"(none)", calc:false, item:noCommItem});   // so the step has a row to point at
          continue; }
        const sp = rowSpec(r); if(sp.t==="blank" || sp.t==="black") continue;
        const cell = ws.getCell(L+r), mv = cellVal(cell), calc = sp.t==="calc";
        if(calc && mv.f){ const theirs = cellFormula(cell); if(theirs && normF(theirs, L) !== normF(FORMULAS[r], "B")){ const d = fdiff[r] ||= {r, cols:[], theirs, noMax: /MAX\(/i.test(FORMULAS[r]) && !/MAX\(/i.test(theirs)}; d.cols.push(L); } }
        const tr = toolRow(r); let tool = calc ? R.V[tr] : valueOf(c, tr, R); if(tool == null) tool = "";
        if(r===1 && c.after && !isMR(tool)) tool = T(tool) + " MR";
        const show = {r, cell:L+r, mine:T(mv.v), tool:T(tool), calc};
        rows.push(show);
        if(same(r, mv.v, tool)) continue;
        if(r>=94 && r<=318){ const j = Math.floor((r-94)/45); if(!T(mv.v) && !realAtt(c.atts[j])) continue; }
        const ex = explain(r, c, R, T(tool), T(mv.v), cmap);
        if(ex && ex.sev==="chk" && !T(tool)) continue;   // the tool has nothing to compare with here
        if(ex){ const it = {r, cell:L+r, ...ex, mine:T(mv.v), tool:T(tool)}; items.push(it); show.item = it; }
        else if(calc && r>=94 && r<=318 && (r-94)%45>=20 && (r-94)%45<=25 && c.atts[Math.floor((r-94)/45)]?.type==="adss" && /^34\s*"?$/.test(T(mv.v)) && (parseFt(T(tool)) ?? 0) >= 44){
          // the sheet's Foreign-Owned ADSS table gives 34"; the team uses 44" unless the pole has only a neutral (team ruling, 10-28)
          const it = {r, cell:L+r, sev:"chk", what:`${LBL(r)} · ADSS: 34" table vs the 10/28 ruling`, mine:T(mv.v), tool:T(tool),
            why:`The sheet's ADSS table gives 34", but that reduced clearance only applies on a pole with just a neutral. With any secondary, triplex or service on the pole, the team uses the fiber table instead, 44" or more (team ruling, 10/28). For this span that's ${T(tool)}, and the tool checks the comm against it.`,
            fix:`Leave the formula. Check this comm against ${T(tool)} and add a note on the cell (e.g. "${T(tool)} per 10/28 ruling, triplex on pole"). If it's closer than that to the power, it needs a Fail comment.`};
          items.push(it); show.item = it; }
        else if(calc && r>=87 && r<=92){
          const k = r - 87, g = rr => T(cellVal(ws.getCell(L+rr)).v), tv = rr => { const v = rr<=(14) || (rr>=15 && rr<=20) ? valueOf(c, rr, R) : (R.V[rr] ?? valueOf(c, rr, R)); return T(v==null ? "" : v); };
          const parts = [[3,"Row 3 era"],[9+k,"conductor (row "+(9+k)+")"],[15+k,"span length (row "+(15+k)+")"],[21+k,"pole height (row "+(21+k)+")"],[69+k,"ice sag (hidden row "+(69+k)+")"],[81+k,"pole − sag, inches (hidden row "+(81+k)+")"]]
            .map(([rr, nm]) => ({rr, nm, mine:g(rr), tool:tv(rr)}));
          const firstDiff = parts.find(x => !same(x.rr, x.mine, x.tool));
          if(firstDiff && firstDiff.rr < 69 && !fdiff[r]?.cols.includes(L)){ follow++; followRows.push({r, cell:L+r, mine:T(mv.v), tool:T(tool), what:LBL(r)}); show.follow = true; continue; }
          const fd = fdiff[r]?.cols.includes(L) || [69+k, 81+k].some(rr => { const th = cellFormula(ws.getCell(L+rr)); return th && normF(th, L) !== normF(FORMULAS[rr], "B"); });
          const it = {r, cell:L+r, sev:"chk", what:`${LBL(r)} · traced back to ${firstDiff ? firstDiff.nm : "a hidden row"}`, mine:T(mv.v), tool:T(tool),
            why:`Rows 87–92 only display hidden row ${81+k} (pole height − ice sag) in feet and inches, so a different result here always comes from an input above it. Step by step, yours vs the tool: ` + parts.map(x => `${x.nm}: ${x.mine||"(blank)"} vs ${x.tool||"(blank)"}${same(x.rr, x.mine, x.tool) ? "" : " ← differs"}`).join("; ") + `.` +
              (firstDiff && firstDiff.rr===15+k ? ` The span length is different, so either the span in this slot isn't the same span as the tool's (check the directions in rows 15–20 against Katapult) or the length was typed differently.` : "") +
              (firstDiff && firstDiff.rr===69+k ? ` The inputs match but the sag lookup doesn't: your hidden row ${69+k} formula ${fd ? "isn't the template's (e.g. an older version with MAX(span,100), or a value typed over it)" : "gives a different result"}. On the FIXED worksheet a span that rounds under 100′ has no sag row, so rows ${69+k} and ${r} stay blank.` : ""),
            fix: firstDiff && firstDiff.rr < 69 ? `Fix row ${firstDiff.rr} (${firstDiff.nm}) and row ${r} follows it. Don't type over row ${r}.` : `Unhide rows 69–86 and compare row ${69+k} and row ${81+k} with the template; replace them from a fresh copy of the FIXED worksheet if they differ. Don't type over row ${r}.`};
          items.push(it); show.item = it; }
        else if(calc && fdiff[r]?.cols.includes(L)){
          const d = fdiff[r], kk = r>=94 && r<=318 ? ((r-94)%45-2)%6 : (r-45)%6, span = KEYS[kk] ? c.spans[KEYS[kk]]?.len : null;
          const it = {r, cell:L+r, sev:"chk", what:`${LBL(r)} · your formula differs from the template`, mine:T(mv.v), tool:T(tool),
            why: d.noMax && !T(mv.v) ? `Your sheet's formula looks the span up without MAX(span,100)${span?`, and this span is ${span}′`:""}: a span under 100′ finds no table row, so the cell comes back blank and nothing gets checked. The tool uses the 100′ row and gets ${T(tool)}.` : `Your sheet's formula for this row isn't the same as the template the tool mirrors, so the result differs (yours ${T(mv.v)||"blank"}, tool ${T(tool)}). Yours: ${String(d.theirs).replace(/^=?/,"=").slice(0,220)}${String(d.theirs).length>220?"…":""} · FIXED template: ${remap(FORMULAS[r], L).slice(0,220)}${FORMULAS[r].length>220?"…":""}`,
            fix:`Check this cell by hand against ${T(tool)}${R.CL[r]==="fail"?" (the tool fails it)":""}, and ask your lead which worksheet version is current.`};
          items.push(it); show.item = it; }
        else if(calc){
          if(!mv.f && T(mv.v)){ const it = {r, cell:L+r, sev:"err", what:LBL(r), mine:T(mv.v), tool:T(tool), why:"This row is a formula in the template, but your cell has a typed value, so it no longer updates.", fix:"Put the formula back: copy this cell from a column where it's right (or from the template) and paste it here."}; items.push(it); show.item = it; }
          else { follow++; followRows.push({r, cell:L+r, mine:T(mv.v), tool:T(tool), what:LBL(r)}); show.follow = true; }
        }
      }
      // 2. Fail comments (411: right-click → Comment "Fail" and explain it). Every cell the tool fails gets its comment text,
      //    the same notes Download .xlsx writes: the failing check cells plus the violation notes on the cells they point at.
      const want = {};   // row → lines "Fail at … CODE"
      const sheetRow = r => { if(r<94 || r>318) return r; const k = Math.floor((r-94)/45), j = cmap.indexOf(k); return j < 0 ? r : r + 45*(j - k); };   // tool row → your row
      const addW = (r0, line) => { const r = sheetRow(r0); if(HIDDEN.has(r)) return; const w = want[r] ||= []; if(!w.includes(line)) w.push(line); };
      { const s0 = groupStarts().find(x=>groupOf(x).detCi===e.det);
        if(s0!=null) Object.entries(cellFailNotes(s0, !!mr)).forEach(([r, lines])=>lines.forEach(line=>addW(+r, line))); }
      const ftv = t => { const m = String(t||"").match(/-?\d+\s*'\s*\d+(?:\.\d+)?\s*"?/); return m ? parseFt(m[0]) : null; };
      const codesOf = t => (String(t||"").toUpperCase().match(/\b(EGC|EPC|EBC|EOL|EGA|PPC|PBC|PGC|POL|PGA)\b/g)||[]);
      for(const [rs, lines] of Object.entries(want)){ const r = +rs, text = lines.join("\n"), n = T(cmt(ws.getCell(L+r)));
        const has = /fail/i.test(n), base = {r, cell:L+r, fail:true, sev:"fail", what:`Fail comment · ${LBL(r)}`, tool:text, note:text, fix:`Right-click ${L}${r} → Comment, and type: ${text}`};
        if(has){
          // a Fail comment is there: does it say the same thing?
          const yv = ftv(n), tv = ftv(text), miss = [...new Set(codesOf(text))].filter(c=>!codesOf(n).includes(c));
          const off = yv!=null && tv!=null && Math.abs(yv - tv) > 1;
          if(off || miss.length) items.push({...base, mine:n.slice(0,90), why: (off ? `Your Fail comment says ${fi(yv)}, but the cell works out to ${fi(tv)}: the comment wasn't updated when the value changed.` : "") + (miss.length ? `${off?" It's also":"Your Fail comment is"} missing the violation code ${miss.join(" & ")}.` : "")});
          continue; }
        items.push({...base, mine: n ? n.slice(0,90) : (anyNote ? "no comment" : "comments not in the file"),
          why: anyNote ? "The tool fails this cell, and your sheet has no Fail comment on it." : "The tool fails this cell. No comments came through in your .xlsx, so check this one by hand."}); }
      if(anyNote) for(let r=1; r<=334; r++){ if(HIDDEN.has(r) || want[r]) continue; const n = cmt(ws.getCell(L+r));
        if(/^\s*fail/i.test(n)) items.push({r, cell:L+r, fail:true, sev:"chk", what:`Marked Fail · ${LBL(r)}`, mine:T(n).slice(0,70), tool:R.CL[toolRow(r)] ? "passes" : "no check here", why:"Your sheet comments this cell Fail, but with the tool's values it passes (or the Fail belongs on a different row).", fix:"If the entries above match the tool, remove the Fail comment, or move it to the cell that fails."}); }
      // root causes first: the entries, then the formula / Fail items
      items.sort((a,b)=> a.r-b.r || (a.fail?1:0)-(b.fail?1:0));
      // results that differ only because of the entries above
      if(follow && !items.length) followRows.forEach(f=>{ const it = {...f, sev:"chk", why:"Your entries match the tool, but this result doesn't: the formula in this cell may have been changed, or the row pasted from another column.", fix:"Copy the cell from a column where it's right and paste it here."}; items.push(it); const sr = rows.find(x=>x.r===f.r); if(sr){ sr.item = it; sr.follow = false; } });
      items.sort((a,b)=> a.r-b.r);
      items.filter(i=>i.fail).forEach(i=>{ const sr = rows.find(x=>x.r===i.r); if(sr && !sr.item){ sr.item = i; sr.follow = false; } });
      // a value that matches the tool's value in a different span slot of the same group → entered in the wrong cell (11/11)
      { const byR = {}; rows.forEach(x => byR[x.r] = x);
        const groupOfRow = r => { for(const g0 of [15, 21, 33, 39]) if(r >= g0 && r < g0+6) return g0;
          if(r >= 94 && r <= 318){ const o = (r-94)%45, b = r - o; for(const g0 of [2, 8, 14]) if(o >= g0 && o < g0+6) return b + g0; } return null; };
        items.forEach(it => { if(it.sev==="fail" || !it.mine) return; const g0 = groupOfRow(it.r); if(g0==null) return;
          for(let rr = g0; rr < g0+6; rr++){ if(rr===it.r) continue; const o = byR[rr]; if(!o || !o.tool) continue;
            if(same(rr, it.mine, o.tool) && !same(rr, o.mine, o.tool)){
              it.sev = "err"; it.what = `${LBL(it.r)} · looks like it was typed in the wrong span slot`;
              it.why = `Your ${it.mine} in row ${it.r} is the tool's value for row ${rr} (${LBL(rr)}). The span looks like it went into the wrong slot, so every result calculated from row ${it.r} (sag, clearances, Fail notes) is for the wrong span. ` + (it.why||"");
              it.fix = `Move ${it.mine} to row ${rr}, and put ${it.tool || "the right value"} in row ${it.r}. Then check the other rows of that span (conductor, pole height, midspan, environment) went into the same slot.`;
              break; } } }); }
      // formulas that read another column (11/11, a team sheet: column K's formulas all pointed at column C, G's at F) — every calculated cell then shows that column's results
      let refAlert = null;
      { const cnt = {}; let tot = 0;
        for(let r=1; r<=334; r++){ const f = cellFormula(ws.getCell(L+r)); if(!f) continue;
          String(f).replace(/'[^']*'![$A-Z0-9:]+/g, "").replace(/"[^"]*"/g, "").replace(/(?<![A-Za-z$!'"])\$?([A-Z]{1,3})\$?\d+/g, (m, cl) => { cnt[cl] = (cnt[cl]||0) + 1; tot++; return m; }); }
        const top = Object.entries(cnt).filter(([cl]) => cl!==L).sort((a, b) => b[1] - a[1])[0];
        if(top && top[1] >= 10 && top[1] > (cnt[L]||0)){
          const col = top[0], c2 = ws.getCell(col+"1"), who = T(cellVal(c2).v);
          refAlert = {col, who, n: top[1], tot}; } }
      // the column's span data matches a different pole in the tool better than its own → probably copied from that pole's column
      let alert = null;
      { const mine = {}; rows.forEach(x => { if(XROWS.includes(x.r) && x.mine) mine[x.r] = x.mine; });
        const score = tc => Object.entries(mine).filter(([r, v]) => tc.v[r] && same(+r, v, tc.v[r])).length;
        const own = toolCols.find(tc => tc.ci===ci), ownS = own ? score(own) : 0;
        const best = toolCols.filter(tc => tc.ci!==ci && tc.sc!==e.scid).map(tc => ({tc, n: score(tc)})).sort((a, b) => b.n - a.n)[0];
        if(best && best.n >= 3 && best.n >= ownS + 2) alert = {sc: best.tc.sc, mr: best.tc.mr, n: best.n, own: ownS, of: Object.keys(mine).length}; }
      poles.push({L, h1, sc:e.scid, mr, items, rows, follow: items.some(i=>i.sev) && follow ? follow : 0, followRows, alert, refAlert});
    }
    const missing = [];
    groupStarts().forEach(s=>{ const g = groupOf(s), sc = scidKey(valueOf(COLS[g.detCi], 1, compute(COLS[g.detCi])) || g.base.scid || ""); if(!sc) return;
      if(!seen.has(sc)) missing.push(sc); else if(g.after && exportOrder().order.includes(g.afterCi) && !seen.has(sc+"MR")) missing.push(sc+" MR"); });
    return {fileName, sheet:ws.name, poles, unmatched, missing, anyNote, buf, fdiff:Object.values(fdiff)};
  }

  // ---- the report: the pole's column on the right (row #, label, yours, tool),
  //      "fix these, top to bottom" on the left. One of your sheet's columns at a time.
  const SECTION = r => r<=7 ? "Pole info" : r<=20 ? "Power · conductor & span length" : r<=38 ? "Power · heights at the pole and midspan" : r<=44 ? "Power · environment" : r<=93 ? "Power · clearance results" : r<=318 ? null : r<=332 ? "Proposed attachment" : "Verdict & design";
  function sectionOf(r, P){ const s = SECTION(r); if(s) return s; const j = Math.floor((r-94)/45), nm = P.rows.find(x=>x.r===ATT_BASE(j))?.mine || P.rows.find(x=>x.r===ATT_BASE(j))?.tool || ""; return `Existing comm ${j+1}${nm?` · ${nm}`:""}`; }
  const isInput = r => r<=44 || r===319 || r===320 || (r>=94 && r<=318 && ((r-94)%45<=1 || ((r-94)%45>=8 && (r-94)%45<=19)));
  // which span a row belongs to (0–5 = Before, After, Other 1–4), or null for the whole column (rows 3–4, the Y/N rows)
  function spanOfRow(r){
    if(r>=9 && r<=44) return (r-9)%6;
    if(r>=45 && r<=92) return (r-45)%6;
    if(r>=94 && r<=318){ const o = (r-94)%45; return o>=2 && o<=43 ? (o-2)%6 : null; }
    if(r>=321 && r<=332) return (r-321)%6;
    return null;
  }
  function causesOf(P){   // calculated row → the differing entries above it that drive it
    const ins = P.items.filter(i=>!i.fail && i.sev!=="fail" && isInput(i.r)), map = {};
    P.rows.filter(x=>x.follow).forEach(x=>{
      const k = spanOfRow(x.r), j = x.r>=94 && x.r<=318 ? Math.floor((x.r-94)/45) : null;
      const c = ins.filter(i=>{ const ik = spanOfRow(i.r), sameSpan = ik==null || k==null || ik===k;
        if(i.r<=8) return true;                                         // row 3 / 4: the whole column
        if(i.r<=44) return sameSpan;                                    // power inputs: their own span, power and comm results
        if(i.r>=94 && i.r<=318) return j!=null && Math.floor((i.r-94)/45)===j && sameSpan;   // a comm's inputs: its own block
        if(i.r===319 || i.r===320) return x.r>=321;
        return false; });
      map[x.r] = c.length ? c : null; });
    return map;
  }
  function counts(P){ const L = P.items.filter(i=>!i.done), e = L.filter(i=>i.sev==="err").length, f = L.filter(i=>i.sev==="fail").length; return {e, f, c:L.length - e - f, done:P.items.length - L.length}; }
  // "Complete" boxes (11/11): the designer ticks each step as it's fixed on their sheet; the counts at the top and in the
  // column list go down. Saved per workbook name in this browser, so re-running the QC on the same file keeps the ticks.
  const doneKey = (P, it) => `${P.L}|${P.sc}|${it.r}|${it.sev}`;
  const doneStore = res => "qc:done:" + res.fileName;
  function loadDone(res){ let d = []; try{ d = JSON.parse(localStorage.getItem(doneStore(res)) || "[]"); }catch(e){} const D = new Set(d);
    res.poles.forEach(P=>(P.items||[]).forEach(it=>{ it.done = D.has(doneKey(P, it)); })); }
  function saveDone(res){ const d = []; res.poles.forEach(P=>(P.items||[]).forEach(it=>{ if(it.done) d.push(doneKey(P, it)); }));
    try{ d.length ? localStorage.setItem(doneStore(res), JSON.stringify(d)) : localStorage.removeItem(doneStore(res)); }catch(e){} }
  function report(res, sel){
    const errs = res.poles.reduce((n,p)=>n+counts(p).e, 0), chks = res.poles.reduce((n,p)=>n+counts(p).c, 0), fails = res.poles.reduce((n,p)=>n+counts(p).f, 0), dones = res.poles.reduce((n,p)=>n+counts(p).done, 0), total = res.poles.reduce((n,p)=>n+p.items.length, 0), clean = res.poles.filter(p=>!p.items.length && !p.noAfter).length;
    const P = res.poles[sel] || res.poles[0];
    const opt = (p,i) => { const k = counts(p); return `<option value="${i}"${i===sel?" selected":""}>${p.alert||p.refAlert?"⚠ ":""}SCID ${E(p.sc)}${p.mr?" · make-ready":""} · column ${E(p.L)} · ${p.noAfter?"no After MR in the tool":!p.items.length?"✓ matches":!(k.e+k.c+k.f)?"✓ all complete":[k.e?`${k.e} error${k.e===1?"":"s"}`:"", k.c?`${k.c} to check`:"", k.f?`${k.f} Fail comment${k.f===1?"":"s"}`:""].filter(Boolean).join(", ")}</option>`; };
    const head = `<div class="qc-head"><div><h3>QC my VDS sheet</h3><div class="muted" style="font-size:12.5px">${E(res.fileName)} · tab "${E(res.sheet)}" · nothing in the tool is changed</div></div>
      <div class="qc-sum"><span><b>${res.poles.length}</b> columns</span><span class="qc-ok"><b>${clean}</b> match</span><span class="qc-err"><b>${errs}</b> errors</span><span class="qc-chk"><b>${chks}</b> to check</span><span class="qc-fl"><b>${fails}</b> Fail comments</span>${dones?`<span class="qc-ok" title="Steps ticked Complete; they're taken off the counts"><b>${dones}</b> complete</span>`:""}<span class="muted" style="font-size:12px;flex-basis:100%;text-align:right">${total?"left to fix · tick Complete on each step as you fix it":""}</span></div>
      <div class="qc-actions" style="margin:0"><button type="button" id="qc-mark" ${total?"":"disabled"} title="Your workbook back with these cells highlighted and a note on each">Download marked-up copy</button><button type="button" class="primary" id="qc-close">Close</button></div></div>
      <div class="qc-bar"><button type="button" id="qc-prev" title="Previous column with something to fix">←</button><select id="qc-pole" aria-label="Which column of your sheet">${res.poles.map(opt).join("")}</select><button type="button" id="qc-next" title="Next column with something to fix">→</button>
      ${res.fdiff?.length ? `<span class="qc-chk" style="font-size:12px" title="${E(res.fdiff.slice(0,3).map(d=>`Row ${d.r}: ${d.theirs}`).join("\n\n"))}">Your workbook's formulas differ from the tool's template in ${res.fdiff.length} row${res.fdiff.length>1?"s":""} (${res.fdiff.slice(0,8).map(d=>d.r).join(", ")}${res.fdiff.length>8?"…":""})${res.fdiff.some(d=>d.noMax)?": no MAX(span,100), so spans under 100′ come back blank":""}. Ask your lead which version is current.</span>` : ""}
      ${res.unmatched.length ? `<span class="muted" style="font-size:12px">No matching pole: ${res.unmatched.map(u=>`${E(u.L)} (${E(u.h1||u.h2)})`).join(", ")}</span>` : ""}
      ${res.missing.length ? `<span class="muted" style="font-size:12px">Not on your sheet: SCID ${res.missing.map(E).join(", ")}</span>` : ""}</div>`;
    if(!P) return head + `<p>No columns to compare.</p>`;
    if(P.noAfter) return head + `<div class="qc-split"><div class="qc-left"><h4>SCID ${E(P.sc)} · make-ready column ${E(P.L)}</h4><p>The tool has no After MR column for this pole yet. Load the after JSON (step 3) with the Job JSON exported after your make-ready, then run the QC again.</p></div></div>`;
    // left: the steps, top to bottom
    const CZ0 = causesOf(P), drives = {}; Object.entries(CZ0).forEach(([r, cs])=>(cs||[]).forEach(c=>(drives[c.r] ||= []).push(+r)));
    const steps = P.items.map((it,k)=>`<li class="${it.sev}${it.done?" done":""}" data-r="${it.r}" data-k="${k}"><div class="qc-st"><label class="qc-done" title="Tick when you've fixed this on your sheet: it comes off the counts"><input type="checkbox" data-k="${k}"${it.done?" checked":""}> Complete</label><span class="qc-n">${k+1}</span><b>Row ${it.r}</b> · ${E(it.what)} <span class="qc-cellref">${E(it.cell)}</span></div>
      <div class="qc-yt"><span>Yours <b>${E(it.mine||"(blank)")}</b></span><span>Tool <b>${E(it.tool||"(blank)")}</b></span></div>
      <div class="qc-why">${E(it.why)}</div>${drives[it.r]?.length ? `<div class="qc-drives">This also changes ${drives[it.r].length} calculated row${drives[it.r].length>1?"s":""} (${drives[it.r].join(", ")}, marked ↳${it.r} on the right). Don't edit those: they follow this cell.</div>` : ""}${it.sev==="fail" ? `<div class="qc-fix"><b>Right-click ${E(it.cell)} → Comment:</b> <span class="qc-note">${E(it.note).replace(/\n/g,"<br>")}</span> <button type="button" class="qc-copy" data-copy="${E(it.note)}">Copy</button></div>` : `<div class="qc-fix"><b>Fix:</b> ${E(it.fix)}</div>`}</li>`).join("");
    const k = counts(P);
    const left = `<div class="qc-left"><h4>SCID ${E(P.sc)}${P.mr?" · make-ready":""} · your column ${E(P.L)}</h4>
      ${P.refAlert ? `<div class="qc-alert">⚠ <b>Column ${E(P.L)}'s formulas read column ${E(P.refAlert.col)}${P.refAlert.who?` (${E(P.refAlert.who)})`:""}, not column ${E(P.L)}.</b> ${P.refAlert.n} of the ${P.refAlert.tot} cell references in this column's formulas point at ${E(P.refAlert.col)}, so every calculated row here (clearances, sags, Y/N) shows column ${E(P.refAlert.col)}'s results, not this pole's. This happens when a column is copied in a way that keeps the old references. Fix: copy a column that works (or the template's column B) and paste it over column ${E(P.L)}'s formula rows so they read ${E(P.L)}, then re-check the steps below.</div>` : ""}
      ${P.alert ? `<div class="qc-alert">⚠ <b>This column's span data looks like it came from SCID ${E(P.alert.sc)}${P.alert.mr?" MR":""}.</b> ${P.alert.n} of your ${P.alert.of} span lengths, pole heights and midspans match that pole in the tool, and only ${P.alert.own} match SCID ${E(P.sc)}${P.mr?" MR":""}. It was probably copied from that pole's column and not updated. Re-enter rows 9–44 and the comm rows for this pole from Katapult (or Load JSON in the tool and compare) before working the steps below.</div>` : ""}
      ${!P.items.length ? `<p class="qc-ok">✓ Every entry in this column matches the tool.</p>` : `<p style="font-size:12.5px;margin:0 0 6px">${!(k.e+k.c+k.f)?`<span class="qc-ok"><b>✓ Every step in this column is ticked Complete.</b></span> `:""}Work down the column like the sheet${k.done?` (${k.done} complete)`:""}: <b>${k.e}</b> <span class="qc-err">error${k.e===1?"":"s"}</span>${k.c?`, <b>${k.c}</b> <span class="qc-chk">to check</span>`:""}${k.f?`, <b>${k.f}</b> <span class="qc-fl">Fail comment${k.f===1?"":"s"}</span> (what each should read)`:""}. Click a step to find its row.</p><ol class="qc-steps">${steps}</ol>`}
      ${P.follow ? `<p class="qc-follow">${P.follow} calculated cell${P.follow>1?"s":""} (clearances, sags, Y/N) differ only because of an entry above them, marked ↳ with that entry's row on the right. Decide that entry; the calculated cells follow it, so don't type over them.</p>` : ""}
      ${!res.anyNote ? `<p class="qc-follow">No comments came through in this file, so Fail comments weren't checked (Google may leave them out of the .xlsx).</p>` : ""}</div>`;
    // right: the sheet column
    let last = "", body = "";
    const CZ = causesOf(P);
    const shown = P.rows.filter(x=>x.mine || x.tool || x.item);
    for(const x of shown){ const sec = sectionOf(x.r, P); if(sec!==last){ body += `<tr class="qc-sec"><td colspan="5">${E(sec)}</td></tr>`; last = sec; }
      const st = x.item ? (x.item.done ? "done" : x.item.sev) : x.follow ? "follow" : "ok";
      const fl = P.items.find(i=>i.sev==="fail" && i.r===x.r);
      body += `<tr class="qc-row ${st}" data-r="${x.r}"><td class="qc-rn">${x.r}</td><td class="qc-lbl">${E(LBL(x.r))}</td><td class="qc-mine">${E(x.mine)}</td><td class="qc-tool">${st==="ok"?"":E(x.tool)}</td><td class="qc-mk"${st==="follow" && CZ[x.r] ? ` title="Follows from row ${CZ[x.r].map(i=>i.r).join(", ")}: fix that and this one matches"` : ""}>${st==="done"?`<span title="Ticked Complete">☑</span>`:st==="err"?"✗":st==="chk"?"?":st==="fail"?"F":st==="follow"?(CZ[x.r]?`↳${CZ[x.r][0].r}`:"·"):"✓"}${fl && st!=="fail"?`<span class="qc-fl" title="Needs a Fail comment">F</span>`:""}</td></tr>`; }
    P.items.filter(i=>i.fail).forEach(i=>{ });
    const right = `<div class="qc-right"><table class="qc-sheet"><thead><tr><th>#</th><th>A</th><th>${E(P.L)} · yours</th><th>Tool</th><th></th></tr></thead><tbody>${body}</tbody></table>
      <div class="qc-legend"><span class="err">✗ error</span><span class="chk">? to check</span><span class="qc-fl">F needs a Fail comment</span><span class="follow">↳3 differs only because of row 3 (no change needed in that cell)</span><span>✓ matches</span> · empty rows hidden</div></div>`;
    return head + `<div class="qc-split">${left}${right}</div>`;
  }
  function wire(m, res, sel){
    const box = m.querySelector(".ck-box"), go = i => { let html;
      try{ html = report(res, i); }catch(err){ console.error(err); toast(`Couldn't show column ${res.poles[i]?.L || ""}: ${err.message}`); return; }
      box.innerHTML = html; wire(m, res, i); };
    box.querySelectorAll(".qc-done").forEach(l=>l.addEventListener("click", e=>e.stopPropagation()));
    box.querySelectorAll(".qc-done input").forEach(cb=>cb.addEventListener("change", ()=>{ const P = res.poles[sel] || res.poles[0], it = P.items[+cb.dataset.k]; if(!it) return;
      it.done = cb.checked; saveDone(res);
      const L = box.querySelector(".qc-left"), R = box.querySelector(".qc-right"), lt = L?.scrollTop, rt = R?.scrollTop; go(sel);
      const L2 = box.querySelector(".qc-left"), R2 = box.querySelector(".qc-right"); if(L2) L2.scrollTop = lt; if(R2) R2.scrollTop = rt; }));
    box.querySelector("#qc-close").onclick = () => m.remove();
    box.querySelectorAll(".qc-copy").forEach(b=>b.addEventListener("click", e=>{ e.stopPropagation(); copyText(b.dataset.copy, "Copied the Fail comment."); }));
    box.querySelector("#qc-pole").onchange = e => go(+e.target.value);
    const step = d => { const n = res.poles.length; for(let k=1;k<=n;k++){ const i = (sel + d*k + n) % n, c = counts(res.poles[i]); if(c.e+c.c+c.f || res.poles[i].noAfter) return go(i); } };
    box.querySelector("#qc-prev").onclick = () => step(-1); box.querySelector("#qc-next").onclick = () => step(1);
    box.querySelectorAll(".qc-steps li").forEach(li=>li.addEventListener("click", ()=>{ const tr = box.querySelector(`.qc-row[data-r="${li.dataset.r}"]`);
      box.querySelectorAll(".qc-row.on,.qc-steps li.on").forEach(x=>x.classList.remove("on")); li.classList.add("on");
      if(tr){ tr.classList.add("on"); tr.scrollIntoView({block:"center", behavior:"smooth"}); } }));
    box.querySelectorAll(".qc-row").forEach(tr=>tr.addEventListener("click", ()=>{ const li = box.querySelector(`.qc-steps li[data-r="${tr.dataset.r}"]`); if(!li) return;
      box.querySelectorAll(".qc-row.on,.qc-steps li.on").forEach(x=>x.classList.remove("on")); tr.classList.add("on"); li.classList.add("on"); li.scrollIntoView({block:"nearest", behavior:"smooth"}); }));
    box.querySelector("#qc-mark").onclick = async e=>{ const b = e.currentTarget; b.disabled = true; const t = b.textContent; b.textContent = "Building…";
      try{ await offerFile(await markedCopy(res), res.fileName.replace(/\.xlsx$/i,"") + " (QC).xlsx", "Saved. Open it in Google Sheets: the highlighted cells have a note with the fix."); }
      catch(err){ console.error(err); toast("Couldn't build the marked-up copy."); }
      finally{ b.disabled = false; b.textContent = t; } };
  }

  // your own workbook back, with every finding highlighted and a note on the cell
  async function markedCopy(res){
    const ExcelJS = await loadExcel(), wb = new ExcelJS.Workbook(); await wb.xlsx.load(res.buf);
    const ws = wb.getWorksheet(res.sheet);
    const FILL = {err:"FFF4C7C3", chk:"FFFFF2CC", fail:"FFF3E8FD"};
    res.poles.forEach(p=>p.items.forEach(i=>{ const cell = ws.getCell(i.cell);
      // cells share style objects after loading: give this cell its own copy before changing the fill
      cell.style = Object.assign(JSON.parse(JSON.stringify(cell.style || {})), {fill:{type:"pattern", pattern:"solid", fgColor:{argb:FILL[i.sev]||FILL.chk}}});
      const old = noteOf(cell), add = i.sev==="fail" ? i.note : `VDS QC (${i.sev==="err"?"error":"check"}): ${i.what}\nYours: ${i.mine||"(blank)"} · Tool: ${i.tool||"(blank)"}\nWhy: ${i.why}\nFix: ${i.fix}`;
      cell.note = old ? old + "\n\n" + add : add; }));
    wb.calcProperties = Object.assign(wb.calcProperties||{}, {fullCalcOnLoad:true});
    return tidyXlsx(await wb.xlsx.writeBuffer());
  }

  async function run(file){
    if(!JOB || !groupStarts().length){ toast("Load the Job JSON first: the QC compares your sheet with the tool's columns."); return; }
    const m = document.createElement("div"); m.className = "ck-modal"; m.innerHTML = `<div class="ck-box qc-box"><h3>QC my VDS sheet</h3><p>Reading ${E(file.name)}…</p></div>`; document.body.appendChild(m);
    const close = () => m.remove();
    m.addEventListener("click", e=>{ if(e.target===m) close(); });
    // read-only: keep the tool's columns exactly as they are
    const snap = JSON.stringify(COLS), keepSel = SEL;
    let res;
    try{ res = await analyze(await file.arrayBuffer(), file.name); }
    catch(err){ console.error(err); m.querySelector(".ck-box").innerHTML = `<h3>QC my VDS sheet</h3><p class="qc-err">${E(/Violation Determination/.test(err.message) ? err.message : "Couldn't read that file. Save the VDS from Google Sheets as .xlsx (File → Download → Microsoft Excel) and try again.")}</p><div class="qc-actions"><button type="button" class="primary" id="qc-close">Close</button></div>`; m.querySelector("#qc-close").onclick = close; return; }
    finally{ COLS = JSON.parse(snap); SEL = keepSel; S = COLS[SEL]; }
    loadDone(res);
    const first = Math.max(0, res.poles.findIndex(p=>{ const k = counts(p); return k.e+k.c+k.f || p.noAfter; }));
    m.querySelector(".ck-box").innerHTML = report(res, first); wire(m, res, first);
  }
  window.VDSQC = {analyze, report, run, wire};

  // More ▾ → QC my VDS sheet (.xlsx)
  function addMenu(){
    const m = document.getElementById("hdr-menu"); if(!m){ setTimeout(addMenu, 300); return; }
    if(m.querySelector("#qc-file")) return;
    const span = document.createElement("span"); span.className = "filebtn";
    span.innerHTML = `<button type="button" tabindex="-1" title="Compare the VDS sheet you filled in by hand with the tool, cell by cell. Nothing in the tool changes.">QC my VDS sheet (.xlsx)</button><input type="file" id="qc-file" accept=".xlsx" aria-label="Upload your Violation Determination workbook to QC it">`;
    span.querySelector("input").addEventListener("change", e=>{ const f = e.target.files?.[0]; e.target.value = ""; if(f) run(f); });
    const hrs = m.querySelectorAll("hr"); const before = hrs[hrs.length-1] || null;
    m.insertBefore(span, before);
  }
  addMenu();
})();
