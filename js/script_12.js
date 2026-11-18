
/* ===================== Manual walkthrough: "Fix the violations" step =====================
   The Violations & fixes panel's recommendation for this pole, as a walkthrough step: when to do it, what to do in
   Katapult, and exactly which VDS cells change (existing → after) and which red cells it clears. */
function mwFixStep(cur){
  try{
    const V = violations(cur), g = V.g, P = fixPlan(cur); S = COLS[SEL];
    if(!V.list.length){ S = COLS[SEL]; return `<li><h3>Fix the violations</h3><p class="ok-line">✓ No violations on this pole: nothing to fix, no make-ready column.</p></li>`; }
    const D = DG.poleData(g), R = g.after ? {mode:"mine"} : DG.decide(D, P, V); S = COLS[SEL];
    const c = g.det, EL = letterOf(g.detCi), AL = g.after ? letterOf(g.afterCi) : letterOf(g.detCi + 1);
    const after = g.after ? g.after : R.T ? R.T.after : null;
    const Rc = compute(c), Ra = after ? compute(after) : null; S = COLS[SEL];
    const v = (col, r, RR) => r===3 ? (col.replaced || col.repl ? "Post-1990" : (RR.E?.v3 || "Post-1990")) : String(valueOf(col, r, RR) ?? "");
    const ch = [];
    if(after) for(let r=1;r<=334;r++){ if(rowSpec(r).t==="calc" || r===1) continue; const a = v(c, r, Rc), b = v(after, r, Ra); if(a!==b) ch.push({r, a, b}); }
    const ph0 = c.prop?.height || "", ph1 = after?.prop?.height || "";
    const cleared = [], still = [];
    for(let r=1;r<=334;r++){ if(Rc.CL[r]==="fail"){ (Ra && Ra.CL[r]!=="fail" ? cleared : still).push(r); } }
    const lab = r => esc(META.labels[r]||"").replace(/ - (Select From Dropdown|Value Only.*|Fully Written.*)$/,"");
    const head = {comm:"Comm rearrangement", raise:"Raise the power on the existing pole", replace:"Replace the pole", midspan:"Set a midspan pole", none:"Needs a lead's call", mine:`Your make-ready from Katapult (column ${AL})`}[R.mode];
    const pick = R.mode==="mine" ? "These are the MR moves already in Katapult. If cells are still red, open the Violations & fixes panel for what's left." : R.mode==="comm" ? (Ra && !Object.values(Ra.CL).includes("fail") ? "Moving the comms alone clears every check." : "Move the comms as listed; see the red cells left below.")
      : (()=>{ try{ const tmp = document.createElement("div"); tmp.innerHTML = window.__dgCard(D, P, V).html.match(/<p class="dg-pick">([\s\S]*?)<\/p>/)?.[1] || ""; S = COLS[SEL]; return tmp.textContent; }catch(e){ S = COLS[SEL]; return ""; } })();
    // what to do in Katapult, in order
    const kat = [];
    if(R.mode==="comm") P.filter(f=>f.move).forEach(f=>kat.push(esc(f.katapult ? f.katapult.replace(/^Katapult MR View: /,"") : f.text)));
    if(R.mode==="raise") kat.push(`Raise the ${D.feat?.xfmr?"transformer, secondary and neutral":"neutral / secondary"} ${fi(R.T.gL)} (select them, double-click one number, type <code>+${Math.round(R.T.gL)}</code>).`);
    if(R.mode==="replace") kat.push(`Pole top label → <b>Pole Replacement</b> → Proposed Pole Spec <b>${R.T.opt.size}-${R.T.opt.cl}</b>, <b>Adjust Power</b> only (leave Adjust Communication off) → Adjust Heights.`);
    if(R.mode==="raise" || R.mode==="replace"){ const rows = DG.layout(D, R.T); rows.filter(x=>x.old!=null && x.nw!=null && Math.abs(x.nw-x.old)>=1).forEach(x=>kat.push(`${esc(x.name)}: ${fi(x.old)} → <b>${fi(x.nw)}</b>`)); const pr = rows.find(x=>x.kind==="prop"); if(pr && pr.nw!=null) kat.push(`Proposed ${esc(D.c.prop.name)}: attach at or below <b>${fi(pr.nw)}</b>`);
      const st = rows.filter(x=>x.kind==="comm" && x.old!=null && x.nw!=null && Math.abs(x.nw-x.old) < 1); if(st.length) kat.push(`Stay where they are (no move needed): ${st.map(x=>`${esc(x.name)} ${fi(x.old)}`).join(", ")}`); }
    if(R.mode==="midspan") kat.push(`Insert a 40'-4 midspan pole in the long span (blank photo, each wire at its midspan height, then raised into CS 8-105 / 8-010 spec).`);
    const tbl = ch.length ? `<table class="mw"><thead><tr><th>Cell</th><th>Row</th><th>Existing (${EL})</th><th>After MR (${AL})</th></tr></thead><tbody>${ch.map(x=>`<tr><td class="mw-addr"><button type="button" class="cell-link" data-goto="${g.after?AL:EL}${x.r}">${AL}${x.r}</button></td><td>${lab(x.r)}</td><td>${mwShow(x.a)}</td><td><b>${mwShow(x.b)}</b></td></tr>`).join("")}${ph0!==ph1 && ph1 ? `<tr><td></td><td>Proposed height at pole (page-only row)</td><td>${mwShow(ph0)}</td><td><b>${mwShow(ph1)}</b></td></tr>` : ""}</tbody></table>` : "";
    const res = Ra ? `${cleared.length?`<p><b>Clears:</b> ${cleared.map(r=>`<button type="button" class="cell-link" data-goto="${EL}${r}">${EL}${r}</button> <span class="muted">${esc(rowCode(r))}</span>`).join(", ")}</p>`:""}${still.length?`<p class="mw-fail"><b>Still red after this fix:</b> ${still.map(r=>`${EL}${r} <span class="muted">${esc(Rc.NT[r]||"")}</span>`).join("; ")}. Look at the Violations & fixes panel for the next step.</p>`:`<p class="ok-line">✓ With these changes every check on this pole passes.</p>`}` : "";
    const sheetNote = R.mode==="replace" ? `<p>On the sheet: the After MR column gets the new height and class in rows 5–6, row 3 becomes <b>Post-1990</b> (a new pole is always Post-1990, so the clearances get stricter: the ice allowance is added back), and every height at the pole moves as listed. The existing column ${EL} doesn't change: QC compares the two.</p>`
      : R.mode==="raise" ? `<p>On the sheet: only heights change in the After MR column (the power at the pole, half of it at midspan, and the comm moves). Rows 3, 5 and 6 stay as they are. Column ${EL} doesn't change.</p>`
      : R.mode==="comm" ? `<p>On the sheet: only the comm heights change in the After MR column (the pole height, and half of the move at midspan). The power and rows 3–6 stay as they are.${P.some(f=>f.move)?` <b>Apply fix plan</b> in the Violations & fixes panel types these into a plan column for you.`:""}</p>`
      : R.mode==="mine" ? `<p>On the sheet: the After MR column ${AL} holds the Katapult MR heights${g.after.repl?" and the new pole's height and class (row 3 is Post-1990)":""}. Column ${EL} stays as the existing record.</p>`
      : R.mode==="midspan" ? `<p>On the sheet: add a column for the new midspan pole (+ Column, pick its SCID) and change this pole's long-span length (rows 15–20) to the new, shorter span. Both new spans are checked Post-1990.</p>`
      : `<p>The sheet can't be cleared with a change on this pole alone. Talk to a lead before you build the MR column.</p>`;
    return `<li><h3>Fix the violations <span class="muted">(Violations & fixes panel)</span></h3>
      <p><b>When:</b> after the red cells are read and the environment is verified (STOP box), and <b>before</b> you build the make-ready column. Make the change in Katapult first, then export the Job JSON and use <b>Load after JSON</b>: the After MR column fills itself with the Katapult heights and every pole is re-checked.</p>
      <p><b>Fix for this pole: ${esc(head)}.</b> ${esc(pick)}</p>
      ${kat.length?`<p><b>In Katapult MR View, in this order:</b></p><ol>${kat.map(x=>`<li>${x}</li>`).join("")}</ol>`:""}
      ${sheetNote}
      ${tbl?`<p><b>How the VDS sheet changes</b> (After MR column ${AL}${g.after?"":", next to the existing column"}):</p>${tbl}`:""}
      ${res}
      ${(R.mode==="raise"||R.mode==="replace") ? DG.layoutSVG(D, DG.layout(D, R.T), R.T, V) + DG.upliftHTML(D, R.T) : ""}${R.mode!=="mine" && R.mode!=="none" && R.T ? DG.specialHTML(D, R) : ""}
      ${V.list.some(x=>BLDG(c.spans[x.k]))?`<p class="muted">A failing span goes to a house or building: only the pole end is on a pole. Raising the attachment on the building or retensioning the drop may be another option; check the photo.</p>`:""}</li>`;
  }catch(e){ console.error(e); S = COLS[SEL]; return ""; }
}
