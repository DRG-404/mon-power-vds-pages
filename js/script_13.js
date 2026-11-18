
/* Manual walkthrough: the Notes template row as it looks in the Design V2.1 sheet, with the fix written the way the team
   writes it ("Moved FE Secondary up 9" to 28' 4"", "Proposed to Attach at 24' 4""), and a button that copies the row. */
const NT_ABBR = t => String(t||"").replace(/\bFrontier\b/gi, "FTR").replace(/\bCity\s?net\b/gi, "CTYNT").replace(/\bSudden(\s?Link)?\b/gi, "SUDLNK").replace(/\bShenandoah\b/gi, "SHEN");
function mwNotesRow(cur){
  const row = notesRow(cur); S = COLS[SEL];
  try{
    const V = violations(cur), g = V.g, P = fixPlan(cur); S = COLS[SEL];
    if(!V.list.length || !window.DG) return row;
    if(g.after) return row;   // the designer's own MR / replacement is already in Katapult: the row shows that design and its result
    const D = DG.poleData(g), R = DG.decide(D, P, V); S = COLS[SEL];
    const amt = d => { d = Math.round(Math.abs(d)); return d < 12 ? `${d}"` : fmt(d); };
    const fix = [];
    if(R.mode==="replace"){ const T = R.T; fix.push(`Replace pole to ${T.opt.size}'/${T.opt.cl}`); fix.push(D.secOnly ? "SEC only" : `PRI Spec ${(D.fr?.specs||[]).map(x=>x.replace(/^(\d)-/,"0$1-")).join(", ") || "08-105"}`); }
    if(R.mode==="midspan") fix.push(`New midspan pole 40'-4 using CS 8-010, 8-105`);
    if(R.mode==="replace" && D.special?.pushBrace) fix.push(`Replace push brace (${R.T.opt.size}'/${R.T.opt.cl}) per CS 7-120`);
    if((R.mode==="replace"||R.mode==="raise") && D.special?.customer?.length) fix.push(`Coordinate with homeowner to remove customer-owned ${D.special.customer[0].t.toLowerCase()}`);
    if(R.T && (R.mode==="raise" || R.mode==="replace" || R.mode==="comm")){
      const rows = DG.layout(D, R.T);
      const pw = rows.filter(r=>r.kind==="power" && r.name!=="Primary" && r.old!=null && r.nw!=null && Math.abs(r.nw-r.old)>=1);
      if(pw.length && R.mode!=="replace") fix.push(pw.map((r,i)=>`${i?"":"Moved "}FE ${r.name} up ${amt(r.nw-r.old)} to ${fmt(r.nw)}`).join(" & "));
      rows.filter(r=>r.kind==="comm" && r.old!=null && r.nw!=null && Math.abs(r.nw-r.old)>=1).forEach(r=>fix.push(`Moved ${NT_ABBR(r.name)} ${r.nw>r.old?"up":"down"} ${amt(r.nw-r.old)} to ${fmt(r.nw)}`));
      const pr = rows.find(r=>r.kind==="prop"); if(pr && pr.nw!=null) fix.push(`Proposed to Attach at ${fmt(pr.nw)}`);
      if(R.T.left===0) { /* clears */ } else fix.push(`Still failing after the fix: check the VDS`);
    }
    if(R.mode==="none") fix.push(`Needs a lead's call: no pole height clears every check`);
    const head = row.mre ? row.mre.split("\n\n").filter(x=>!/ (Passed|still fails) with /.test(x)) : [];
    row.mre = [...head, ...fix].join("\n\n");
    if(R.mode==="replace") row.mtype = "Replacement"; else if(R.mode==="raise") row.mtype = "Power Make Ready"; else if(R.mode==="comm" && V.list.every(v=>!v.power)) row.mtype = "Com Rearrangement";
  }catch(e){ console.error(e); S = COLS[SEL]; }
  return row;
}
function mwNotesHTML(cur){
  const r = mwNotesRow(cur), b = s => String(s||"").replace(/^[^\n]*\n\n/, "");   // the block cells start with their own heading line
  const cc = {"No Violations":"c-none","Pole Violation":"c-pole","Midspan Violation":"c-mid","Not Sure":"c-sure"}[r.cat] || "c-none";
  const mc = {"No MR":"m-nomr","Com Rearrangement":"m-comm","Power Make Ready":"m-pmr","Replacement":"m-rep"}[r.mtype] || "m-nomr";
  window.__mwNotes = r;
  return `<p>In the Notes template (Design V2.1 tab) this is SCID ${esc(r.scid)}'s row (SCID 1 = row 8). This is what the row should look like:</p>
    <div class="nt-wrap"><table class="nt-row"><thead><tr><th>Scid</th><th>Violations</th><th>MRE Type</th><th>PLA</th><th>MRE Notes</th><th>Cell #</th><th>Scid</th><th>Clearance Post-1990</th><th>Clearance Pre-1990</th></tr></thead>
    <tbody><tr><td class="sc">${esc(r.scid)}</td><td><span class="nt-chip ${cc}">${esc(r.cat)}</span></td><td><span class="nt-chip ${mc}">${esc(r.mtype)}</span></td><td>${esc(r.pla||"")}</td>
    <td class="mre">${esc(r.mre||"").replace(/\n\n/g,"\n\n")}</td><td class="blk">${esc(b(r.cell))}</td><td class="blk">${esc(b(r.dir))}</td><td class="blk">${esc(b(r.post))}</td><td class="blk">${esc(b(r.pre))}</td></tr></tbody></table></div>
    <div class="nt-bar"><button type="button" class="primary" id="mw-copy-notes">Copy Notes row</button><span class="muted" style="font-size:12.5px">Then click the Scid cell (column A) of SCID ${esc(r.scid)}'s row in the Notes template and paste (Ctrl+V). PLA stays blank until you've run it.</span></div>`;
}
document.addEventListener("click", e=>{ if(e.target.id!=="mw-copy-notes") return; const r = window.__mwNotes; if(r) copyRows([r], `Copied SCID ${r.scid}'s Notes row. Click its Scid cell (column A) in the Notes template and paste.`); });
