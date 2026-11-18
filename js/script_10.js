
/* ===================== Design guide =====================
   Adds to the Violations & fixes panel:
   - "How to fix this" under every existing violation: what it means, why it fails, the fixes in cost order
   - a Recommended design card: raise the power on the existing pole if it fits, else the pole size to replace with,
     the build spec (CS 8-xxx framing from the Katapult photo, 8-010 spacing, 11-115 / 16-100), step by step, and a
     sketch of the existing pole next to the new one
   - when the proposed is the only attacher: use the Proposed Midspan Calculator, with the numbers to type in it
   - a span sketch for midspan ground-clearance fails */
(function(){
  if(typeof renderNotes!=="function") return;
  const baseRender = renderNotes;
  const k = t => `<kbd>${t}</kbd>`, E = s => esc(String(s==null?"":s));
  const SIZES = [[40,"4"],[45,"3"],[50,"2"],[55,"1"],[60,"1"],[65,"1"],[70,"1"]];   // team starting sizes (40-4, 45-3, 50-2, 55-1, 60-1), then taller
  const BURY = h => { h = +h; return h<=40 ? 72 : h===45 ? 78 : h===50 ? 84 : h===55 ? 90 : h===60 ? 96 : h===65 ? 102 : h===70 ? 108 : Math.round((h*0.1+2)*12); };   // 10% + 2'
  const toIn = t => { const m = /(-?\d+)'\s?(\d+)"/.exec(t||""); return m ? (+m[1])*12 + (+m[2])*(m[1].startsWith("-")?-1:1) : null; };
  const pf = v => { const x = parseFt(v); return x==null || isNaN(x) ? null : x; };
  const SN = kk => SPAN_NAMES[KEYS.indexOf(kk)];
  const MC_PATH = "Shared drives → FE 411 Support → FE Docs → Workflows → Process Docs → Supporting Docs → <b>Proposed Midspan Calculator</b>";

  /* ---------- what's on the pole (Katapult main photo) ---------- */
  function poleData(g){
    const b = g.base, c = g.det, node = b.node, h = parseInt(b.height,10) || null;
    const tr = JOB?.traces?.trace_data || {};
    let pw = {}; try{ pw = node ? (polePW(JOB, node) || {}) : {}; }catch(e){}
    const wires = Object.values(pw).filter(w=>w && w.h!=null).map(w=>{ const t = tr[w.trace] || {}, ct = t.cable_type || "", pk = K.powerKind(ct);
      return {t:w.trace, h:w.h, ct, co:K.shortCo(t.company)||"", pk, power:!!pk, prop:!!t.proposed, guy:/guy/i.test(ct)}; }).filter(w=>!w.guy);
    let feat = null, fr = null; try{ feat = node ? K.features(JOB, node) : null; fr = feat ? K.framing(feat) : null; }catch(e){}
    const pri = wires.filter(w=>w.pk==="pri"), low = wires.filter(w=>w.power && w.pk!=="pri");
    const spanLow = c.active.map(kk=>pf(c.spans[kk].pole)).filter(v=>v!=null);
    const lowPow = low.length ? Math.min(...low.map(w=>w.h)) : spanLow.length ? Math.min(...spanLow) : null;
    const highPow = low.length ? Math.max(...low.map(w=>w.h)) : null;
    const minPri = pri.length ? Math.min(...pri.map(w=>w.h)) : null, maxPri = pri.length ? Math.max(...pri.map(w=>w.h)) : null;
    let design = null; try{ design = window.MPDesigns && JOB ? (MPDesigns.forJob(JOB.name)||{})[node] || null : null; }catch(e){}
    const comms = c.atts.map((a,j)=>({a,j})).filter(x=>realAtt(x.a));
    // secondary drip loops on the main photo: they move with the secondary (4" under it) and comms stay 40" below them (FE 411)
    let drips = []; try{ const pfm = node ? K.mainPhoto(JOB, JOB.nodes[node]) : null; drips = Object.entries(pfm?.equipment||{}).filter(([,e])=>(e?.equipment_type==="drip_loop" || e?.equipment_type==="riser") && typeof e._measured_height==="number").map(([id,e])=>({id, riser: e.equipment_type==="riser", h:e._measured_height, spec:String(e.drip_loop_spec||"secondary")})); }catch(e){}
    // unique design cases on the pole (FE 411 Supporting Docs): push brace, open wire secondary, GFCI outlet, comm utility box, customer-owned attachments
    const sp0 = {pushBrace:false, ow:[], gfci:[], boxes:[], customer:[]};
    try{ const pfm = node ? K.mainPhoto(JOB, JOB.nodes[node]) : null, trd = JOB.traces?.trace_data || {};
      const walk = o => { if(!o || typeof o!=="object") return; for(const [k,v] of Object.entries(o)){ if(k==="guying" && v && typeof v==="object") Object.values(v).forEach(g=>{ if(/push/i.test(String(g?.guying_type||""))) sp0.pushBrace = true; }); else if(v && typeof v==="object") walk(v); } };
      walk(pfm);
      Object.values(pfm?.equipment||{}).forEach(e=>{ const t = String(e?.equipment_type||""), co = String(trd[e?._trace]?.company||e?.company||""), h = e?._measured_height;
        if(/gfci|outlet|receptacle/i.test(t)) sp0.gfci.push({h, co});
        else if(/box|cabinet|power.?supply|pedestal/i.test(t) && !/bolt/i.test(t)) sp0.boxes.push({h, co, t});
        if(/speaker|customer|private|homeowner/i.test(t + " " + co)) sp0.customer.push({t: /speaker/i.test(t) ? "SPEAKER" : /street/i.test(t) ? "LIGHT" : t.toUpperCase().replace(/_/g," "), co}); });
      D_OW: for(const w of wires){ if(/open secondary|open wire/i.test(w.ct)) sp0.ow.push(w); }
    }catch(e){}
    return {special:sp0, highPow, drips, b, c, node, h, cls:b.cls||"", wires, feat, fr, lowPow, minPri, maxPri, design, comms, secOnly: !pri.length && !!low.length};
  }

  /* ---------- how far the power has to come up (from the fix plan) ---------- */
  function needs(P){
    let low = 0, pri = 0; const hard = [];
    P.forEach(f=>{
      if(f.noRoom){ const m = toIn(/needs (\S+) more room/.exec(f.text||"")?.[1]); if(m!=null){ low = Math.max(low, m); hard.push(f); } }
      else if(f.power && f.code==="EGC"){ const m = toIn(/raise it (\S+) at this pole/.exec(f.text||"")?.[1]); if(m!=null){ if(/\(primary\)/.test(f.text)) pri = Math.max(pri, m); else low = Math.max(low, m); hard.push(f); } }
    });
    return {low, pri, hard, midspan: P.filter(f=>f.code==="TBD" || f.midspan)};
  }

  /* ---------- framing on a new pole: where the primary and the neutral land ---------- */
  // transformer spacing on a new pole: 11-115 for one 1Ø transformer, 11-130 / 11-135 for a bank
  // cutout 24" below the lowest primary (40" over 15 kV); transformer bolt 36" below the cutout for 11-115 (45" over 15 kV),
  // 48" below the cutout arm for a bank (58" over 15 kV); neutral 44" below the bolt for 50 kVA and smaller, 60" for 75–167 kVA
  function txSpec(D){
    const f = D.feat || {}; if(!f.xfmr) return null;
    const specs = D.fr?.specs || [], bank = specs.includes("11-135") || specs.includes("11-130"), hv = (f.kv||15) > 15;
    const big = f.kva != null && f.kva >= 75;
    return {bank, cs: bank ? (specs.includes("11-130") ? "11-130" : "11-135") : "11-115", co: hv ? 40 : 24, tx: bank ? (hv ? 58 : 48) : (hv ? 45 : 36), neut: big ? 60 : 44, kva: f.kva, n: f.txCount || f.xfmr};
  }
  function frame(D){
    const fr = D.fr || {}, sb = (fr.key && SPECBOOK[fr.key]) || {};
    const prim = (fr.prim && fr.prim.length ? fr.prim : [0]), pmax = Math.max(...prim);
    const X = txSpec(D), xf = X ? X.co + X.tx + X.neut : 0;   // cutout + transformer + neutral (see txSpec)
    const nref = fr.neutRef ?? 0;
    const neutBelow = D.secOnly ? 8 : Math.max(nref + 60, pmax + (xf || 60));
    return {fr, sb, prim, pmax, xf, nref, neutBelow};
  }
  function sizeTable(D, N, F){
    const rows = [];
    for(const [s, cl] of SIZES){
      if(D.h && s <= D.h) continue;
      const top = s*12 - BURY(s), neut = top - F.neutBelow, priLow = top - F.pmax;
      const gL = D.lowPow!=null ? neut - (D.highPow ?? D.lowPow) : null, gP = D.minPri!=null ? priLow - D.minPri : null;
      const ok = (N.low<=0 || (gL!=null && gL >= N.low)) && (N.pri<=0 || (gP!=null && gP >= N.pri));
      rows.push({s, cl, top, neut, priLow, gL, gP, ok});
      if(rows.length >= 5 || rows.filter(r=>r.ok).length >= 2) break;
    }
    return rows;
  }
  function roomOnPole(D, F){   // raise the neutral/secondary on the pole that's there: how far until it hits 8-010 (or the transformer chain)
    if(D.lowPow==null) return null;
    if(D.minPri==null){ const top = D.h ? D.h*12 - BURY(D.h) : null; return top!=null ? top - 8 - (D.highPow ?? D.lowPow) : null; }
    return D.minPri - (F.xf || 60) - (D.highPow ?? D.lowPow);   // from the top of the power space (the neutral), not the lowest secondary
  }

  /* ---------- sketch: existing pole next to the new pole ---------- */
  function poleSVG(D, pick, F, V){
    const W = 380, H = 380, newTop = pick.top, oldTop = D.h ? D.h*12 - BURY(D.h) : Math.max(...D.wires.map(w=>w.h), 0) + 24;
    const top = Math.max(newTop, oldTop) + 24, y = h => H - 26 - (h/top)*(H - 40), xo = 140, xn = 250;
    const failCo = new Set(V.list.filter(v=>!v.power && !v.prop).map(v=>String(v.who).split(/\s+/)[0].toLowerCase()));
    const powFail = V.list.some(v=>v.power), propFail = V.list.some(v=>v.prop);
    const col = w => w.prop ? "#1f7a46" : w.power ? "#c0302b" : "#1a5fb4";
    // new heights: primary to the spec, the rest of the power with the neutral, comms and proposed move up the same (they keep their spacing)
    const gain = pick.gL ?? 0, priSorted = D.wires.filter(w=>w.pk==="pri").sort((a,b)=>b.h-a.h);
    const nw = w => { if(w.pk==="pri"){ const i = priSorted.indexOf(w); return newTop - (F.prim[Math.min(i, F.prim.length-1)] || 0); } return w.h + gain; };
    let s = `<figure class="dg-fig"><figcaption>Existing pole → new ${pick.s}'-${pick.cl} <span class="muted">(red dot = failing now, dashed = proposed; estimate; click to enlarge)</span></figcaption><svg class="dg-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Existing pole and recommended ${pick.s}'-${pick.cl} pole">`;
    for(let f=0; f*12<=top; f+=5){ const yy = y(f*12); s += `<line x1="24" x2="${W-8}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"/><text class="m" x="4" y="${yy+3}">${f}'</text>`; }
    s += `<line x1="28" x2="${W-8}" y1="${y(0)}" y2="${y(0)}" stroke="var(--fg)" stroke-width="2"/>`;
    s += `<rect x="${xo-4}" y="${y(oldTop)}" width="8" height="${y(0)-y(oldTop)}" fill="#8d6e4f" opacity=".45"/>`;
    s += `<rect x="${xn-5}" y="${y(newTop)}" width="10" height="${y(0)-y(newTop)}" fill="#6b4f33" opacity=".9"/>`;
    s += `<text class="tag" x="${xo}" y="${H-8}" text-anchor="middle">existing ${D.h?D.h+"'":""}${D.cls?"-"+E(D.cls):""}</text><text class="tag" x="${xn}" y="${H-8}" text-anchor="middle">new ${pick.s}'-${pick.cl}</text>`;
    const items = D.wires.slice().sort((a,b)=>b.h-a.h);
    const name = w => (w.prop ? "PROP " : "") + (w.pk==="pri" ? "Primary" : w.pk==="neutral" ? "Neutral" : w.pk==="sec" ? "Secondary" : (w.co || "Comm") + (/drop/i.test(w.ct)?" drop":""));
    const bad = w => (w.power && w.pk!=="pri" && powFail) || (w.prop && propFail) || (!w.power && !w.prop && failCo.has(String(w.co).toLowerCase()));
    let lastL = -99, lastR = -99;
    items.forEach(w=>{
      const yo = y(w.h), yn = y(nw(w)), c = col(w);
      s += `<line x1="${xo-14}" x2="${xo+14}" y1="${yo}" y2="${yo}" stroke="${c}" stroke-width="${bad(w)?3.5:2}"/>`;
      if(bad(w)) s += `<circle cx="${xo+20}" cy="${yo}" r="4" fill="var(--fail)"/>`;
      s += `<line x1="${xo+14}" x2="${xn-16}" y1="${yo}" y2="${yn}" stroke="${c}" stroke-width="1" opacity=".35"/>`;
      s += `<line x1="${xn-16}" x2="${xn+16}" y1="${yn}" y2="${yn}" stroke="${c}" stroke-width="2.5"${w.prop?' stroke-dasharray="5 3"':""}/>`;
      const ly = Math.max(yo+3, lastL+12); lastL = ly; const ry = Math.max(yn+3, lastR+12); lastR = ry;
      s += `<text x="${xo-20}" y="${ly}" text-anchor="end" fill="${c}">${fi(w.h)}</text><text class="m" x="${xo-58}" y="${ly}" text-anchor="end">${E(name(w).slice(0,11))}</text>`;
      s += `<text x="${xn+22}" y="${ry}" fill="${c}">${fi(nw(w))}</text><text class="m" x="${xn+60}" y="${ry}">${E(name(w).slice(0,11))}</text>`;
    });
    // the 8-010 spacing band on the new pole
    if(!D.secOnly){ const a = y(pick.priLow), b2 = y(pick.neut); s += `<line x1="${xn+8}" x2="${xn+8}" y1="${a}" y2="${b2}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2"/>`; }
    return s + `</svg></figure>`;
  }

  /* ---------- sketch: one span, the wire's sag against what it needs ---------- */
  function spanSVG(o){   // {title, pole, mid, req, reqLbl, env, lbl, col, extra:[{pole,mid,lbl,col,dash}], band:{top,bot,lbl}}
    const W = 380, H = 210, hs = [o.pole, o.mid, o.req, ...(o.extra||[]).flatMap(x=>[x.pole, x.mid]), o.band?.top].filter(v=>v!=null);
    const top = Math.max(...hs) + 30, y = h => H - 24 - (h/top)*(H - 40), x1 = 40, x2 = W - (o.bldg ? 64 : 40), xm = (x1+x2)/2;
    // parabola through the midspan; at a building the wire ends lower (at the house attachment), so the far end is drawn halfway between the pole and midspan heights
    const endH = (a, m) => o.bldg ? m + (a - m)/2 : a;
    const q = (a, m) => { const e = endH(a, m); return `M ${x1} ${y(a)} Q ${xm} ${2*y(m) - (y(a)+y(e))/2} ${x2} ${y(e)}`; };
    let s = `<figure class="dg-fig"><figcaption>${E(o.title)} <span class="muted">(heights to scale, length not${o.bldg?"; the building end is a sketch, check its attachment in the photo":""}; click to enlarge)</span></figcaption><svg class="dg-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${E(o.title)}">`;
    s += `<line x1="6" x2="${W-6}" y1="${y(0)}" y2="${y(0)}" stroke="var(--fg)" stroke-width="2"/><text class="m" x="${xm}" y="${y(0)+15}" text-anchor="middle">${E(o.env||"ground")}</text>`;
    s += `<rect x="${x1-4}" y="${y(top-12)}" width="8" height="${y(0)-y(top-12)}" fill="#8d6e4f" opacity=".6"/>`;
    if(o.bldg){ const bh = Math.max(...[o.pole, ...(o.extra||[]).map(x=>x.pole)].filter(v=>v!=null).map(v=>v*0.75), (o.mid||0) + 30, 14*12), bx = x2 - 6, bw = 58;   // house / business: wall + roof, the drop attaches near the eave
      s += `<rect x="${bx}" y="${y(bh)}" width="${bw}" height="${y(0)-y(bh)}" fill="#9aa0a6" opacity=".55"/><path d="M ${bx-6} ${y(bh)} L ${bx+bw/2} ${y(bh)-22} L ${bx+bw+6} ${y(bh)} Z" fill="#7a7f85" opacity=".7"/><text class="m" x="${bx+bw/2}" y="${y(bh/2)}" text-anchor="middle">${E(o.bldg)}</text><text class="m" x="${bx+bw/2}" y="${y(bh/2)+12}" text-anchor="middle">building</text>`; }
    else s += `<rect x="${x2-4}" y="${y(top-12)}" width="8" height="${y(0)-y(top-12)}" fill="#8d6e4f" opacity=".6"/>`;
    if(o.band){ s += `<rect x="${x1}" y="${y(o.band.top)}" width="${x2-x1}" height="${Math.max(1, y(o.band.bot)-y(o.band.top))}" fill="#1f7a46" opacity=".15"/><text class="m" x="${x1+8}" y="${y(o.band.top)+11}">${E(o.band.lbl)}</text>`; }
    (o.extra||[]).forEach(x=>{ if(x.pole!=null && x.mid!=null) s += `<path d="${q(x.pole, x.mid)}" fill="none" stroke="${x.col}" stroke-width="2"${x.dash?' stroke-dasharray="5 3"':""}/><text x="${x2-8}" y="${y(x.pole)-5}" text-anchor="end" fill="${x.col}">${E(x.lbl)} ${fi(x.pole)}</text><text x="${xm}" y="${x.dash ? y(x.mid)+14 : y(x.mid)-5}" text-anchor="middle" fill="${x.col}">${fi(x.mid)}</text>`; });
    if(o.pole!=null && o.mid!=null){ s += `<path d="${q(o.pole, o.mid)}" fill="none" stroke="${o.col||"#c0302b"}" stroke-width="2.5"/><text x="${x1+8}" y="${y(o.pole)-5}" fill="${o.col||"#c0302b"}">${E(o.lbl||"wire")} ${fi(o.pole)}</text>`; }
    if(o.req!=null){ s += `<line x1="${x1}" x2="${x2}" y1="${y(o.req)}" y2="${y(o.req)}" stroke="var(--pass)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="${x2-6}" y="${y(o.req)+13}" text-anchor="end" fill="var(--pass)">${E(o.reqLbl||"needs")} ${fi(o.req)}</text>`;
      if(o.mid!=null && o.mid < o.req){ s += `<line x1="${xm}" x2="${xm}" y1="${y(o.mid)}" y2="${y(o.req)}" stroke="var(--fail)" stroke-width="3"/><text x="${xm+8}" y="${(y(o.mid)+y(o.req))/2+4}" fill="var(--fail)" class="tag">${fi(o.req - o.mid)} short</text>`; } }
    if(o.mid!=null) s += `<circle cx="${xm}" cy="${y(o.mid)}" r="4" fill="${o.col||"#c0302b"}"/><text x="${xm-8}" y="${y(o.mid)+15}" text-anchor="end" class="tag">${fi(o.mid)}${o.midLbl?` ${E(o.midLbl)}`:""}</text>`;
    return s + `</svg></figure>`;
  }

  /* ---------- "How to fix this" for every existing violation ---------- */
  function helpFor(v, D, P){
    const c = D.c, sp = v.k ? c.spans[v.k] : null, to = v.k ? spanTo(c, v.k) : "", note = v.note || "";
    const era = c.era!=="post" ? "Pre-1990" : "Post-1990", L = []; let what = "", why = "", svg = "";
    const envFix = `Check the environment first: Katapult's "over" label can be wrong. Verify it on the WV Property Viewer (the STOP box at the top) and try ${k("Check elevation")}: lower ground at midspan gives an elevation credit.`;
    if(v.code==="EGC" && v.power){
      what = `The lowest power wire (${E(PWR_LBL[sp?.ptype]||"power")}) toward ${E(to)} sags too close to the ground at midspan.`;
      why = `${E(note)}. ${era} rules${c.era!=="post"?" use the Katapult midspan as-is":" add the ice sag to the Katapult midspan"}.`;
      L.push(envFix);
      if(sp?.ptype==="pri") L.push(`Primary is never resagged. Raise it at this pole (and at the other pole), or replace the pole: on a new pole the primary goes on top per the framing standard, which is usually the cheapest way to gain height. See the <b>Recommended design</b> card.`);
      else {
        if((D.special?.ow||[]).length) L.push(`It's <b>open wire secondary</b>: OW can't be resagged. Replace the whole OW lead with 1/0 ACSR triplex and sag it per CS 4-626 (if the OW runs past your proposal, you can't); see "Also on this pole" for the CAD and CREWS lines.`);
        L.push(BLDG(sp) || sp?.toHouse ? `It goes to a house or building (${E(to)}), so it can't be resagged: only this end, at the pole, can move.` : `<b>Resag</b> the ${E(PWR_LBL[sp?.ptype]||"wire")} (CS 4-600 to 4-638, 32° column). Open wire secondary (OW SEC) can't be resagged: replace it with triplex.`);
        L.push(`<b>Secondary raise</b>: raise it at this pole (the midspan comes up half as much) or at both poles (all of it). It has to stay 60" below the primary (CS 8-010) and, with a transformer, 44" below the transformer bolt (CS 11-115).`);
        L.push(`If there isn't room under the primary, <b>replace the pole</b> with a taller one (see the Recommended design card).`);
      }
      if(num(sp?.len) > 300) L.push(`Long span (${E(sp.len)}′): a <b>midspan pole</b> may be cheaper than raising both ends.`);
      try{ S = c; const r = calcPower(v.k); S = COLS[SEL]; const eff = c.era!=="post" ? pf(sp.mid) : r.effPost, req = c.era!=="post" ? r.reqPre : r.reqPost;
        if(eff!=null && req!=null) svg = spanSVG({bldg: BLDG(sp) ? to : "", title:`${SN(v.k)} span to ${to}${BLDG(sp)?" (building)":""}: lowest power`, midLbl: c.era!=="post" ? "" : "with ice", pole:pf(sp.pole), mid:eff, req, reqLbl:"needs", env:sp.env, lbl:PWR_LBL[sp.ptype]||"power"}); }catch(e){ S = COLS[SEL]; }
    } else if(v.code==="EGC"){
      const a = c.atts[v.j];
      what = `${E(v.who)} ${E(v.what||"comm")} toward ${E(to)}${BLDG(sp)?" (a house / building, not a pole)":""} is too low at midspan.`;
      why = `${E(note)}.${c.era==="post" ? ` Post-1990 subtracts the comm ice allowance from the Katapult midspan.` : ""}`;
      L.push(envFix);
      L.push(`<b>Raise it at this pole</b>: the midspan comes up about half of the move. It has to stay under the power (the table spacing at the pole, 12" to a neutral at midspan) and 12" from the comm above (6" same company).`);
      if(BLDG(sp)){
        L.push(`This span goes to a <b>house or building</b> (${E(to)}), not a pole, so there's no "raise at both poles". The other end is the attachment on the building: <b>raise the attachment on the building</b> (house knob / bracket, or a mast) if the building has the height, or <b>retension the drop</b> so it sags less. The VDS can't check the building end, so look at the photo and write it in the MRE note (e.g. ${E(String(a?.name||"COMM").toUpperCase())}: RAISE ATTACHMENT AT BUILDING / RETENSION DROP TO MAINTAIN MIN GROUND CLEARANCE).`);
      } else L.push(`<b>Raise it at both poles</b> of that span: the midspan comes up the full move. Use this when this pole alone doesn't have the room.`);
      L.push(`If the comms above are in the way, move them up first (top-down), then this one. The fix plan below does this order for you.`);
      L.push(`If no comm move fits (the fix plan says <b>NO ROOM</b>), the power has to come up: secondary raise, or a taller pole (Recommended design card).`);
      try{ S = c; const r = calcComm(a, v.k); S = COLS[SEL]; const eff = c.era!=="post" ? pf(a.vals[v.k]?.mid) : r.effMid, req = c.era!=="post" ? r.gcReqPre : r.gcReqPost;
        if(eff!=null && req!=null) svg = spanSVG({bldg: BLDG(sp) ? to : "", title:`${SN(v.k)} span to ${to}${BLDG(sp)?" (building)":""}: ${a.name}`, midLbl: c.era!=="post" ? "" : "with ice", pole:pf(a.vals[v.k]?.pole), mid:eff, req, env:sp.env, col:"#1a5fb4", lbl:a.name, extra: pf(sp.pole)!=null && pf(sp.mid)!=null ? [{pole:pf(sp.pole), mid:pf(sp.mid), lbl:"power", col:"#c0302b"}] : []}); }catch(e){ S = COLS[SEL]; }
    } else if(v.code==="EPC"){
      what = /below|from lowest power/.test(note) ? `${E(v.who)} is too close to the lowest power at the pole.` : `${E(v.who)} is too close to another comm at the pole.`;
      why = `${E(note)}. Comm to power at the pole uses the spacing table on the sheet (${era}); comm to comm is 12" (6" for the same company's own wires).`;
      L.push(`<b>Lower it</b> to the spacing (the fix plan gives the exact height). Check it still clears the ground at midspan: lowering at the pole drops the midspan about half as much.`);
      L.push(`Comms below it have to come down too if they'd end up within 12": work top-down.`);
      L.push(`If lowering breaks ground clearance, <b>raise the power</b> instead (secondary raise / power equipment raise), or replace the pole.`);
    } else if(v.code==="EBC"){
      what = `${E(v.who)} is too close to ${/power|neutral|secondary|primary/i.test(note) ? "the power" : "another comm"} in the middle of the span toward ${E(to)}.`;
      why = `${E(note)}. Midspan needs 12" to a neutral, 30" to secondary, 60" (5′) to primary, and 4" comm to comm.`;
      L.push(`Comm to comm: <b>retension</b> the upper comm so it sags 2"–6" above the one below (heavy CATV: raise it instead), or match the sag of the other comm. Write it in the MRE note (RETENSION … TO MAINTAIN 4" SEPARATION AT MIDSPAN).`);
      L.push(`Comm to power: lower the comm at the pole (half the move shows at midspan), resag the power, or raise the power.`);
    } else if(v.code==="PPC"){
      what = `The proposed (${E(v.who)}) is too high: too close to the lowest power at the pole.`;
      why = `${E(note)}.`;
      L.push(D.comms.length ? `Lower the proposed to the max on the proposed rows (rows 321+). It stays at the top of the comm space: 12" above the highest comm at the pole and 4" above the top comm in midspan, so comms that end up within 12" under it come down (make-ready for the proposed).` : `Lower the proposed to the max on the proposed rows (rows 321+). It's the only comm, so the limit below it is ground clearance at midspan.`);
      L.push(`If it can't go lower (ground clearance or the comms below), the existing comms come down first, or the power comes up / the pole is replaced. That make-ready is caused by the proposed, so it's 100% or incremental to the proposer (the proposed never gets a split cost).`);
      if(!D.comms.length) L.push(`It's the only attacher on the pole: size it with the <b>Proposed Midspan Calculator</b> (card below).`);
    } else if(v.code==="PGC" || v.code==="PBC"){
      what = v.code==="PGC" ? `The proposed (${E(v.who)}) sags too low at midspan.` : `The proposed (${E(v.who)}) is too close to power or a comm in the span.`;
      why = `${E(note)}.`;
      if(!D.comms.length) L.push(`No other comm to match the sag of: use the <b>Proposed Midspan Calculator</b> (card below) and put the proposed as high as it can go (12" under the neutral at midspan) so the ice sag doesn't bring it down.`);
      else L.push(`With existing comms, the proposed matches their sag: place it 12" above the existing comms at the pole (4" minimum in the span), then retype its midspan on the proposed rows.`);
      L.push(`If it still fails, the comms or the power have to move to make room, or the pole is replaced (incremental cost to the proposer).`);
    } else return "";
    return `<details class="dg-help"><summary>How to fix this</summary><div class="dg-b"><p><b>What it means:</b> ${what}</p>${why?`<p><b>Why it fails:</b> ${why}</p>`:""}${svg}<p><b>Fixes, cheapest first:</b></p><ol>${L.map(x=>`<li>${x}</li>`).join("")}</ol></div></details>`;
  }

  /* ---------- Recommended design: the cheapest fix that clears every check ----------
     Order (Workflow 411 / MR principles): comm moves → raise the power on the existing pole → replace the pole → midspan pole.
     Each step is tested with the VDS's own checks: the power is moved on a copy of the column, the fix plan fits the comms
     around it, and the step is only recommended when nothing is left failing. */
  function trial(g, D, F, opt){   // opt: {raise} on the existing pole, or {size, cl} for a new pole
    const src = g.det;
    let gL, gP, top = null, neut = null, priLow = null;
    if(opt.size){
      top = opt.size*12 - BURY(opt.size); priLow = top - F.pmax;
      neut = D.secOnly ? top - 8 - Math.max(0, (D.highPow ?? D.lowPow) - D.lowPow) : top - F.neutBelow;   // SEC only: the highest secondary 8" under the top
      // neut is where the top of the power space (the neutral) lands; on a SEC only pole it's where the lowest secondary lands
      gL = D.lowPow!=null ? neut - (D.secOnly ? D.lowPow : (D.highPow ?? D.lowPow)) : 0; gP = D.minPri!=null ? priLow - D.minPri : gL;
    } else { gL = opt.raise; gP = 0; }
    gL = Math.floor(gL); gP = Math.floor(gP);   // Katapult moves are whole inches
    // Every column here is built the way the after JSON is read (afterCol): wires move at this pole, each midspan photo by
    // its position in the span, the far end stays. The power (and Zayo) move first; the fix plan then fits the comms, and its
    // moves are put back through afterCol until nothing more moves, so the result matches what Katapult will show.
    const trd = JOB?.traces?.trace_data || {};
    const base = t => { const pk = K.powerKind(trd[t]?.cable_type); if(pk) return pk==="pri" ? gP : gL; if(/zayo/i.test(trd[t]?.company||"")) return gL; return 0; };
    const cm = {}, om = {};   // comm moves at this pole by trace; at the other pole by span → trace
    const spec = opt.size ? {height:String(opt.size), cls:String(opt.cl)} : null;
    const build = () => { let c2;
      // a copy of the job object (same data): afterCol then reads it exactly like a loaded after JSON, with these moves as the MR
      if(!window.__JOBX || window.__JOBX.src !== JOB){ window.__JOBX = {src:JOB, job:Object.assign({}, JOB)}; }
      try{ c2 = afterCol(src, window.__JOBX.job, {move: t => base(t) + (cm[t]||0), other: (k,t) => om[k]?.[t] || 0, spec}); S = COLS[SEL]; }
      catch(e){ console.error(e); c2 = JSON.parse(JSON.stringify(src)); }
      Object.assign(c2, {after:false, fromAfter:false, twin:src.twin, pair:src.pair, plan:false, proposal:src.proposal, notes:src.notes});
      // the era follows what the after JSON will get: a new pole is Post-1990, otherwise the existing column's era is kept (afterCol)
      if(opt.size){ c2.replaced = true; c2.era = "post"; } else { c2.height = src.height; c2.cls = src.cls; delete c2.replaced; }
      c2.powShift = gL || 0; return c2; };
    const plan = c2 => { const i = g.detCi, keep = COLS[i]; try{ COLS[i] = c2; return fixPlan(g.start); } finally { COLS[i] = keep; S = COLS[SEL]; } };
    // opt.both: when a comm is held down by the comm above it in a span that runs to another pole, raise that upper comm at both
    // poles (its whole midspan comes up) so the one below has room. opt.order: comm companies top-down in a new order, only for
    // comms that share no span (they can't cross in the span).
    const reorder = c2 => { if(!opt.order) return c2; const rank = a => { const i = opt.order.indexOf(String(a.name||"").trim().toLowerCase()); return i < 0 ? -1 : i; };
      const idx = c2.atts.map((a,i)=>({a,i})); idx.sort((p,q)=>{ const rp = rank(p.a), rq = rank(q.a); if(rp<0 || rq<0) return p.i - q.i; return rp - rq || p.i - q.i; }); c2.atts = idx.map(x=>x.a); return c2; };
    const SNk = name => KEYS[SPAN_NAMES.indexOf(name)];
    let sim = reorder(build()), P = plan(sim);
    for(let it = 0; it < 6; it++){
      let did = false;
      P.filter(f=>f.move && Math.abs(f.move.d) >= 1).forEach(f=>{ const a = sim.atts[f.move.j]; if(!a) return; did = true; const ts = new Set([a.trace, ...KEYS.map(k=>a.vals?.[k]?.trace)].filter(Boolean));
        ts.forEach(t=>{ cm[t] = (cm[t]||0) + f.move.d; if(f.move.both){ (om[f.move.both] ||= {})[t] = (om[f.move.both][t]||0) + f.move.d; } }); });
      if(opt.both) P.filter(f=>f.noRoom).forEach(f=>{
        const m = /must be at or below \S+ \((\d+)" below (.+?) at midspan in the (.+?) span\)/.exec(f.text||""), need = toIn(/needs (\S+) more room/.exec(f.text||"")?.[1]);
        if(!m || !need) return; const k = SNk(m[3]); if(!k || !otherIsPole(sim, k)) return;
        const up = sim.atts.find(a=>String(a.name).trim()===m[2].trim() && a.vals?.[k]); if(!up) return;
        const t = up.vals[k].trace || up.trace; if(!t) return; const d = Math.ceil(need) + 1;
        cm[t] = (cm[t]||0) + d; (om[k] ||= {})[t] = (om[k][t]||0) + d; did = true; });
      if(!did) break;
      sim = reorder(build()); P = plan(sim);
    }
    if(opt.order){ const topH = a => Math.max(-1, ...KEYS.map(k=>pf(a.vals?.[k]?.pole)).filter(v=>v!=null)); sim.atts = sim.atts.map((a,i)=>({a,i})).sort((p,q)=>topH(q.a)-topH(p.a) || p.i-q.i).map(x=>x.a); }
    const hard = P.filter(f=>f.noRoom || f.power || f.midspan || f.code==="TBD");
    const after = sim;
    // the proposed goes as high as it's allowed (its midspan follows by its photo's share), so its ice sag clears the ground
    const pm = propMax(P); let ph = pf(after.prop?.height);
    if(ph==null && after.prop?.trace && D.node){ try{ const w = K.poleWires(K.mainPhoto(JOB, JOB.nodes[D.node]) || {})[after.prop.trace]; if(w && w.h!=null) ph = w.h; }catch(e){} }   /* Katapult's proposed height, before any MR move */
    if(pm!=null && String(after.prop?.name||"").trim()){ const d = ph!=null ? pm - ph : 0; after.prop.height = fmt(pm);
      if(ph!=null && Math.abs(d) >= 1) KEYS.forEach(kk=>{ const ps = after.prop.spans?.[kk], m = pf(ps?.mid); if(ps && ps.in && m!=null) ps.mid = fmt(m + d*((ps.share!=null && isFinite(+ps.share)) ? Math.min(1, Math.max(0, +ps.share)) : .5)); }); }
    // judged on every violation the VDS reports (sheet rows and the pole-wide checks), the proposed's own included
    let VA = []; try{ VA = violationsOf(after, "").list; }catch(e){ console.error(e); } S = COLS[SEL];
    const propV = VA.filter(v=>v.prop), left = VA.length - propV.length;
    let propShort = 0;
    if(String(after.prop?.name||"").trim() && pm!=null){ const hs = (after.atts||[]).filter(a=>realAtt(a) && !/zayo/i.test(a.name||"")).flatMap(a=>KEYS.map(kk=>pf(a.vals?.[kk]?.pole))).filter(v=>v!=null);
      if(hs.length) propShort = Math.max(0, Math.max(...hs) + 12 - pm);
    }
    // the proposed's midspan comes from Katapult's estimate (or the Midspan Calculator), so its midspan checks (PGC / PBC) are
    // shown as things to check, not used to pick the fix; its fit at the pole is (under the power, 12" over the comms)
    const propWarn = propV.filter(v=>/GC$|BC$/.test(v.code)), propPole = propV.filter(v=>!/GC$|BC$/.test(v.code));
    const ok = !hard.length && !left && !propPole.length && propShort < 1;
    return {opt, ok, P, sim, after, gL, gP, top, neut, priLow, left, propV, propWarn, propRows: propV.map(v=>v.cell), propShort, hard, cm, om};
  }
  // other top-down orders of the comm companies on the pole (Zayo stays in power space), only when the companies that change
  // places share no span, so they can't cross in a midspan (FE 411: comms keep their order in the span)
  function commOrders(D){
    const rows = D.c.atts.filter(a=>realAtt(a) && !/zayo/i.test(a.name||"")), cos = [];
    rows.forEach(a=>{ const n = String(a.name||"").trim().toLowerCase(); if(!cos.includes(n)) cos.push(n); });
    if(cos.length < 2 || cos.length > 4) return [];
    const spansOf = n => new Set(rows.filter(a=>String(a.name||"").trim().toLowerCase()===n).flatMap(a=>KEYS.filter(k=>a.vals?.[k]?.pole)));
    const share = (x,y) => { const A = spansOf(x); return [...spansOf(y)].some(k=>A.has(k)); };
    const perms = a => a.length <= 1 ? [a] : a.flatMap((x,i)=>perms([...a.slice(0,i), ...a.slice(i+1)]).map(p=>[x, ...p]));
    return perms(cos).slice(1).filter(o=>{ for(let i=0;i<o.length;i++) for(let j=i+1;j<o.length;j++){ if(cos.indexOf(o[i]) > cos.indexOf(o[j]) && share(o[i], o[j])) return false; } return true; });
  }
  function propMax(P){ const f = P.find(x=>x.prop); const m = f && /at or below (\S+) at the pole/.exec(f.text); return m ? toIn(m[1]) : null; }
  // every wire's height before and after, for the table and the sketch
  function layout(D, T){
    const rows = [], pri = D.wires.filter(w=>w.pk==="pri").sort((a,b)=>b.h-a.h);
    pri.forEach((w,i)=>rows.push({t:w.t, name:"Primary", kind:"power", old:w.h, nw: T.opt.size ? T.top - (frame(D).prim[Math.min(i, frame(D).prim.length-1)]||0) : w.h}));
    D.wires.filter(w=>w.power && w.pk!=="pri").sort((a,b)=>b.h-a.h).forEach(w=>rows.push({t:w.t, name: w.pk==="neutral" ? "Neutral" : /drop|service/i.test(w.ct) ? "Power drop" : "Secondary", kind:"power", old:w.h, nw:w.h + T.gL}));
    // drip loops: 4" under the lowest secondary / power drop at its new height (FE 411: drip loop 4" below)
    const lowNew = rows.filter(r=>r.kind==="power" && r.name!=="Primary").map(r=>r.nw);
    (D.drips||[]).forEach(d=>rows.push(d.riser ? {t:"eq:"+d.id, name:"Riser (weatherhead)", kind:"power", old:d.h, nw:d.h + T.gL, drip:true}
      : /street/i.test(d.spec) ? {t:"eq:"+d.id, name:`Drip loop (${d.spec})`, kind:"power", old:d.h, nw:d.h, street:true}   // a streetlight keeps its height (measured from the street, CS 16-100)
      : {t:"eq:"+d.id, name:`Drip loop (${d.spec})`, kind:"power", old:d.h, nw: T.gL ? (lowNew.length ? Math.min(...lowNew) - 4 : d.h + T.gL) : d.h, drip:true}));
    const H = a => { const hs = KEYS.map(kk=>pf(a.vals[kk]?.pole)).filter(v=>v!=null); return hs.length ? Math.max(...hs) : null; };
    // one row per Katapult wire: a company's drops in different directions are separate wires that can move differently
    const afterByTrace = {}; (T.after.atts||[]).forEach(a=>KEYS.forEach(kk=>{ const v = a.vals?.[kk], t = v?.trace || a.trace, h = pf(v?.pole); if(t && h!=null) afterByTrace[t] = Math.max(afterByTrace[t] ?? -Infinity, h); }));
    D.c.atts.forEach((a,j)=>{ if(!realAtt(a)) return;
      const byT = {}; KEYS.forEach(kk=>{ const v = a.vals?.[kk], t = v?.trace || a.trace, h = pf(v?.pole); if(!t || h==null) return; (byT[t] ||= {h:-Infinity, ks:[]}); byT[t].h = Math.max(byT[t].h, h); byT[t].ks.push(kk); });
      const ts = Object.keys(byT);
      ts.forEach(t=>{ const o = byT[t].h, nw = afterByTrace[t] ?? o;
        rows.push({t, name:`${a.name}${a.drop?" drop":""}${ts.length>1 ? ` (to ${byT[t].ks.map(kk=>spanTo(D.c,kk)).join(", ")})` : ""}`, kind:"comm", old:o, nw, bad:false}); }); });
    // power equipment and guys: the transformer and cutout follow CS 11-115 on a new pole (with a raise they go up with the
    // secondary); a power down guy follows the wire it backs up (FE, 11/3/26); a comm down guy follows its comm
    try{ const pfm = K.mainPhoto(JOB, JOB.nodes[D.node]) || {}, trd = JOB.traces?.trace_data || {}, eqs = Object.entries(pfm.equipment||{});
      const priRows = rows.filter(r=>r.name==="Primary"), lowPriNew = T.opt.size ? T.top - frame(D).pmax : (priRows.length ? Math.min(...priRows.map(r=>r.nw)) : null);
      const X = txSpec(D) || {}, kv = D.feat?.kv || 15, coGap = X.co ?? (kv > 15 ? 40 : 24), txGap = X.tx ?? (kv > 15 ? 45 : 36);
      // cutouts on a crossarm are at the arm's height (the arm is the row; one row per arm)
      const armCut = Object.entries(pfm.arm||{}).filter(([,a])=>typeof a?._measured_height==="number" && Object.values(a?._children?.equipment||{}).some(e=>e?.equipment_type==="cutout_arrestor"))
        .map(([id,a])=>[id, {equipment_type:"cutout_arrestor", _measured_height:a._measured_height, arm:true, n:Object.values(a._children.equipment).filter(e=>e?.equipment_type==="cutout_arrestor").length}]);
      const cut = eqs.filter(([,e])=>e.equipment_type==="cutout_arrestor" && typeof e._measured_height==="number").concat(armCut);
      const tx = eqs.filter(([,e])=>e.equipment_type==="transformer" && typeof e._measured_height==="number");
      const shiftP = T.opt.size ? null : T.gL;   // raise: everything in the power space below the primary moves together
      let cutNew = null;
      cut.forEach(([id,e])=>{ const nw = shiftP!=null ? e._measured_height + shiftP : (lowPriNew!=null ? lowPriNew - coGap : e._measured_height); cutNew = cutNew==null ? nw : Math.max(cutNew, nw); rows.push({t:(e.arm?"arm:":"eq:")+id, name: e.arm ? `Cutout arm (${e.n} cutout${e.n>1?"s":""})` : "Cutout", kind:"power", old:e._measured_height, nw, equip:true}); });
      const bolt = tx.find(([,e])=>/top/i.test(e.measurement_of||"")) || tx[0];
      if(bolt){ const nb = shiftP!=null ? bolt[1]._measured_height + shiftP : (lowPriNew!=null ? (cutNew!=null ? cutNew : lowPriNew - coGap) - txGap : bolt[1]._measured_height);
        tx.forEach(([id,e])=>rows.push({t:"eq:"+id, name:/bottom/i.test(e.measurement_of||"") ? "Transformer (bottom)" : "Transformer (top bolt)", kind:"power", old:e._measured_height, nw: nb - (bolt[1]._measured_height - e._measured_height), equip:true})); }
      const guyOf = (o) => { const g = []; const walk = x => { if(!x || typeof x!=="object") return; for(const [k,v] of Object.entries(x)){ if(k==="guying" && v && typeof v==="object") Object.entries(v).forEach(([id,gg])=>{ if(gg && typeof gg._measured_height==="number" && !/push/i.test(gg.guying_type||"")) g.push([id,gg]); }); else if(v && typeof v==="object") walk(v); } }; walk(o); return g; };
      guyOf(pfm).forEach(([id,gg])=>{ const co = String(trd[gg._trace]?.company||""), isPow = /first ?energy|mon ?power|fe\b/i.test(co);
        const cand = rows.filter(r=>r.old!=null && r.nw!=null && !r.equip && (isPow ? r.kind==="power" : r.kind==="comm"));
        if(!cand.length) return; const near = cand.reduce((a,b)=>Math.abs(b.old-gg._measured_height) < Math.abs(a.old-gg._measured_height) ? b : a);
        rows.push({t:"guy:"+id, name:`${isPow?"Power":K.shortCo(co)||"Comm"} down guy`, kind: isPow ? "power" : "comm", old:gg._measured_height, nw: Math.min(gg._measured_height + (near.nw - near.old), T.top!=null ? T.top - 4 : Infinity), equip:true, guy:true}); });   // never above the new pole top
      // streetlights keep their height (CS 16-100: measured from the street); anything else on the photo the layout doesn't
      // place is listed so the designer sets it by hand instead of it silently staying behind on the new pole
      eqs.forEach(([id,e])=>{ if(rows.some(r=>r.t==="eq:"+id) || typeof e._measured_height!=="number") return; const t = String(e.equipment_type||"");
        if(/existing bolt hole/i.test(t) || e.mr_ignore) return;
        if(/street_light|flood/i.test(t)) rows.push({t:"eq:"+id, name:"Streetlight (bracket)", kind:"power", old:e._measured_height, nw:e._measured_height, equip:true, street:true});
        else rows.push({t:"eq:"+id, name:t.replace(/_/g," "), kind:"power", old:e._measured_height, nw:null, equip:true, unplaced:true}); });
    }catch(e){ console.error(e); }
    if(String(D.c.prop?.name||"").trim()){ const pm = propMax(T.P); let ph = pf(D.c.prop.height);
      if(ph==null && D.c.prop.trace){ try{ const w = K.poleWires(K.mainPhoto(JOB, JOB.nodes[D.node]) || {})[D.c.prop.trace]; if(w && w.h!=null) ph = w.h; }catch(e){} }
      rows.push({t:D.c.prop.trace, name:`PROP ${D.c.prop.name}`, kind:"prop", old:ph, nw: pf(T.after.prop?.height) ?? (pm!=null ? pm : ph)}); }
    return rows;
  }
  function layoutSVG(D, rows, T, V){
    const W = 380, H = 380, newTop = T.top ?? (D.h ? D.h*12 - BURY(D.h) : Math.max(...rows.map(r=>r.nw||0)) + 24), oldTop = D.h ? D.h*12 - BURY(D.h) : newTop;
    const top = Math.max(newTop, oldTop) + 24, y = h => H - 26 - (h/top)*(H - 40), xo = 140, xn = 250;
    const col = r => r.kind==="prop" ? "#1f7a46" : r.kind==="power" ? "#c0302b" : "#1a5fb4";
    const failCo = new Set(V.list.filter(v=>!v.power && !v.prop).map(v=>String(v.who).split(/\s+/)[0].toLowerCase()));
    const bad = r => (r.kind==="power" && r.name!=="Primary" && V.list.some(v=>v.power)) || (r.kind==="prop" && V.list.some(v=>v.prop)) || (r.kind==="comm" && failCo.has(String(r.name).split(/\s+/)[0].toLowerCase()));
    const lbl = T.opt.size ? `new ${T.opt.size}'-${T.opt.cl}` : `after raise`;
    let s = `<figure class="dg-fig"><figcaption>Existing → ${E(lbl)} <span class="muted">(red dot = failing now, dashed = proposed; click to enlarge)</span></figcaption><svg class="dg-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Existing pole and ${E(lbl)}">`;
    for(let f=0; f*12<=top; f+=5){ const yy = y(f*12); s += `<line x1="24" x2="${W-8}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"/><text class="m" x="4" y="${yy+3}">${f}'</text>`; }
    s += `<line x1="24" x2="${W-8}" y1="${y(0)}" y2="${y(0)}" stroke="var(--fg)" stroke-width="2"/>`;
    s += `<rect x="${xo-4}" y="${y(oldTop)}" width="8" height="${y(0)-y(oldTop)}" fill="#8d6e4f" opacity=".45"/><rect x="${xn-5}" y="${y(newTop)}" width="10" height="${y(0)-y(newTop)}" fill="#6b4f33" opacity=".9"/>`;
    s += `<text class="tag" x="${xo}" y="${H-8}" text-anchor="middle">existing ${D.h?D.h+"'":""}${D.cls?"-"+E(D.cls):""}</text><text class="tag" x="${xn}" y="${H-8}" text-anchor="middle">${E(lbl)}</text>`;
    let lastL = -99, lastR = -99;
    rows.filter(r=>r.old!=null || r.nw!=null).sort((a,b)=>(b.nw??b.old)-(a.nw??a.old)).forEach(r=>{
      const c = col(r), dash = r.kind==="prop" ? ' stroke-dasharray="5 3"' : "";
      if(r.old!=null){ const yo = y(r.old); s += `<line x1="${xo-14}" x2="${xo+14}" y1="${yo}" y2="${yo}" stroke="${c}" stroke-width="${bad(r)?3.5:2}"${dash}/>`; if(bad(r)) s += `<circle cx="${xo+20}" cy="${yo}" r="4" fill="var(--fail)"/>`;
        const ly = Math.max(yo+3, lastL+12); lastL = ly; s += `<text x="${xo-20}" y="${ly}" text-anchor="end" fill="${c}">${fi(r.old)}</text><text class="m" x="${xo-58}" y="${ly}" text-anchor="end">${E(r.name.slice(0,11))}</text>`; }
      if(r.nw!=null){ const yn = y(r.nw); if(r.old!=null) s += `<line x1="${xo+14}" x2="${xn-16}" y1="${y(r.old)}" y2="${yn}" stroke="${c}" stroke-width="1" opacity=".35"/>`;
        s += `<line x1="${xn-16}" x2="${xn+16}" y1="${yn}" y2="${yn}" stroke="${c}" stroke-width="2.5"${dash}/>`;
        const ry = Math.max(yn+3, lastR+12); lastR = ry; s += `<text x="${xn+22}" y="${ry}" fill="${c}">${fi(r.nw)}</text><text class="m" x="${xn+60}" y="${ry}">${E(r.name.slice(0,11))}</text>`; }
    });
    return s + `</svg></figure>`;
  }
  const mv = d => d==null || Math.abs(d) < 1 ? "—" : (d>0?"+":"−") + fi(Math.abs(d));
  function layoutTable(rows){
    return `<div class="dg-scroll"><table class="dg-t"><thead><tr><th style="text-align:left">Wire</th><th>Existing</th><th>New</th><th>Move</th></tr></thead><tbody>${rows.map(r=>`<tr><td style="text-align:left">${E(r.name)}</td><td>${fi(r.old)}</td><td><b>${r.unplaced ? "set by hand" : fi(r.nw)}</b></td><td>${r.old!=null && r.nw!=null ? mv(r.nw - r.old) : r.kind==="prop" ? "attach" : "—"}</td></tr>`).join("")}</tbody></table></div>${rows.some(r=>r.unplaced) ? `<p class="dg-warn">Not placed by the tool: ${rows.filter(r=>r.unplaced).map(r=>E(r.name)).join(", ")}. Set ${rows.filter(r=>r.unplaced).length>1?"them":"it"} by its standard before you finish the pole.</p>` : ""}`;
  }
  function specList(D, F){
    const fr = F.fr, sb = F.sb, bits = [];
    if(fr.key) bits.push(`<b>CS ${E(fr.key)}</b>: ${E(sb.title||"")}${sb.page?` (spec book p${sb.page})`:""}. Read from the Katapult photo: ${E((fr.why||[]).join("; "))}.`);
    else if(D.secOnly) bits.push(`<b>SEC only</b>: no primary on the pole. The secondary can go up to 8" from the pole top; a 35'-5 is allowed.`);
    if(!D.secOnly) bits.push(`Primary ${F.prim.map(p=>p===0?"on the pole top":`${p}" below the top`).join(", ")}; neutral <b>60"</b> below ${F.nref?`the point ${F.nref}" below the top`:"the primary"} (<b>CS 8-010</b>, new construction, 15 kV). Long spans can need more: check the 8-010 calculator.`);
    if(D.feat?.xfmr){ const X = txSpec(D); bits.push(X.bank
      ? `<b>CS ${X.cs}${X.cs==="11-135"?" (check 11-130)":""}</b>: transformer bank${X.n>1?` (${X.n}${X.kva?` × ${X.kva} kVA`:""})`:""}. Cutout arm ${X.co}" below the lowest primary arm, transformer bolt ${X.tx}" below the cutout arm, neutral ${X.neut}" below the bolt${X.kva==null?" (60\" if 75 kVA or more)":""}. 11-135 is closed wye-delta (240 V 3-wire, 240/120 V 4-wire); use 11-130 for 208Y/120 or 480Y/277 V.`
      : `<b>CS 11-115</b>: cutout ${X.co}" below the lowest primary, transformer bolt ${X.tx}" below the cutout, neutral ${X.neut}" below the bolt${X.kva==null?" (60\" if 75 kVA or more)":""}.`); }
    if(D.feat?.light) bits.push(`<b>CS ${D.feat.flood?"16-150":"16-100"}</b>: the light is measured from the street, so it keeps its height (team default 25' to the bottom bracket). Comms 4" over the top bracket or 12" under the bracket / drip loop (CS 3-100).`);
    (fr.check||[]).forEach(x=>bits.push(`<span class="dg-warn">Check: ${E(x)}</span>`));
    return bits;
  }
  function decide(D, P, V){ const R = decide0(D, P, V); if(R && !V.list.length && R.mode!=="comm") R.forProposed = true; return R; }
  function decide0(D, P, V){
    const N = needs(P), g = V.g;
    const F = frame(D);
    if(N.midspan.length) return {mode:"midspan", sp:N.midspan[0], N};   // a span past the tables needs a midspan pole first; the rest is re-checked after
    const T0 = trial(g, D, F, {raise:0}); if(T0.ok) return {mode:"comm", T:T0, F, N};
    // still comm-only (Com Rearrangement): raise the comm above at both poles, then a new comm order where no two swapped comms share a span
    const TB = trial(g, D, F, {raise:0, both:true}); if(TB.ok) return {mode:"comm", T:TB, F, N, assist:"both"};
    const orders = commOrders(D);
    for(const o of orders){ const TO = trial(g, D, F, {raise:0, both:true, order:o}); if(TO.ok) return {mode:"comm", T:TO, F, N, assist:"order", order:o}; }
    // 1. raise the power on the pole that's there (Secondary / Power Equipment Raise), in 3" steps up to the room under the primary
    const room = roomOnPole(D, F);
    if(D.lowPow!=null && room!=null && room >= 3 && N.pri<=0){
      let T = trial(g, D, F, {raise:room}); if(!T.ok){ const T2 = trial(g, D, F, {raise:room, both:true}); if(T2.ok) T = T2; }
      if(T.ok){ let best = T; const step = Math.max(3, Math.ceil(room/30/3)*3); for(let r = step; r < room; r += step){ const t = trial(g, D, F, {raise:r, both:T.opt.both}); if(t.ok){ best = t; break; } } return {mode:"raise", T:best, F, N, room}; }
    }
    // 2. replace the pole: the shortest pole whose layout clears every check
    const tried = [];
    for(const [s, cl] of SIZES){ if(D.h && s <= D.h) continue; let T = trial(g, D, F, {size:s, cl}); if(!T.ok){ const T2 = trial(g, D, F, {size:s, cl, both:true}); if(T2.ok) T = T2; } tried.push(T); if(T.ok) return {mode:"replace", T, F, N, tried}; }
    return {mode:"none", F, N, tried};
  }
  /* ---------- uplift (KB "Uplift" + FE): a raised / new pole pulls the wires up at the lower pole next to it ----------
     Limit on the height difference of the primary / neutral (secondary on a SEC only pole) between the two ends:
     span 150'+ → 10', 100–150' → 5', under 100' → same height, over 350' → not checked here (map note for SPIDA).
     FE (11/3/26): a replacement 10' taller than an adjacent pole must be checked for uplift. */
  function uplift(D, T){
    const out = []; if(!T || !JOB || !(T.opt.size || T.gL)) return out;
    const c = D.c, rows = layout(D, T), nwOf = t => rows.find(r=>r.t===t)?.nw;
    const keyW = D.secOnly ? [] : D.wires.filter(w=>w.pk==="pri" || w.pk==="neutral");   // the span rule is for primary lines; SEC only poles get FE's 10'-taller check
    const elevAt = n => { try{ const v = ELEV[`${n.latitude.toFixed(6)},${n.longitude.toFixed(6)}`]; return v!=null ? v : null; }catch(e){ return null; } };
    const here = JOB.nodes[c.node];
    c.active.forEach(k=>{
      const sp = c.spans[k], cn = JOB.connections?.[sp.cid]; if(!cn) return;
      const oid = cn.node_id_1===c.node ? cn.node_id_2 : cn.node_id_1, o = JOB.nodes[oid]; if(!o) return;
      const ot = K.nodeType(o); if(!(ot==="pole" || (ot==="reference" && K.tag(o) && !/^n\/?a$/i.test(String(K.tag(o)).trim())))) return;
      const opw = polePW(JOB, oid) || {}, len = num(sp.len) ?? (here && o.latitude!=null ? Math.ceil(K.dist(here, o)) : null);
      const lim = len==null ? null : len > 350 ? null : len >= 150 ? 120 : len >= 100 ? 60 : 0;
      const oname = K.scid(o) ? `SCID ${K.scid(o)}` : (K.tag(o) || "the next pole"), otag = K.poleTag ? K.poleTag(o) : K.tag(o);
      let worst = null;
      keyW.forEach(w=>{ const ow = opw[w.t]; if(!ow || ow.h==null) return; const nw = nwOf(w.t); if(nw==null) return;
        const diff = nw - ow.h, was = w.h - ow.h; const eH = here ? elevAt(here) : null, eO = elevAt(o); const elevDiff = eH!=null && eO!=null ? diff + (eH - eO)*12 : null;
        const x = {k, span:SN(k), to:oname, otag, oid, len, lim, wire: w.pk==="pri" ? "primary" : w.pk==="neutral" ? "neutral" : "secondary", nw, oh:ow.h, diff, was, elevDiff,
          risk: lim!=null && Math.round(diff) > lim && Math.round(diff) > Math.round(was), over350: lim==null && len!=null && len > 350};
        if(!worst || x.diff > worst.diff) worst = x; });
      if(worst) out.push(worst);
      if(T.opt.size){ const oh = parseFloat(K.first(o.attributes?.pole_height)) || parseFloat((K.noteFields(o)["pole height/class"]||"").split(/[-\/]/)[0]) || null;
        if(oh && T.opt.size - oh >= 10) out.push({k, span:SN(k), to:oname, fe:true, oh, text:`The new ${T.opt.size}' pole is ${T.opt.size - oh}' taller than ${oname} (${oh}'): FE wants these checked for uplift.`}); }
    });
    return out;
  }
  function upliftHTML(D, T){
    const U = uplift(D, T); if(!U.length) return "";
    const risk = U.filter(u=>u.risk), fe = U.filter(u=>u.fe), over = U.filter(u=>u.over350);
    const rows = U.filter(u=>!u.fe).map(u=>`<tr class="${u.risk?"":"pick"}"><td>${E(u.span)} → ${E(u.to)}</td><td>${u.len!=null?u.len+"′":"—"}</td><td>${E(u.wire)}</td><td>${fi(u.nw)} vs ${fi(u.oh)}</td><td><b>${fi(u.diff)}</b>${u.elevDiff!=null?` <span class="muted">(${fi(u.elevDiff)} with ground)</span>`:""}</td><td>${u.lim==null?"n/a (over 350′)":fi(u.lim)}</td><td class="${u.risk?"no":"ok"}">${u.risk?"✗ uplift":"✓"}</td></tr>`).join("");
    const steps = risk.length ? `<p><b>How to fix the uplift</b> (${E(risk.map(u=>u.to).join(", "))}):</p><ol>
      <li>Check the ground: ${k("Check elevation")} (or Katapult's elevation tool) at both poles. If this pole sits lower, the difference shrinks by that much.${risk.some(u=>u.elevDiff!=null)?" The difference with ground is shown above.":""}</li>
      <li>Check the other end's insulator: a dead end can take 0 or negative vertical force (FE), so uplift there is OK unless SPIDA shows a positive (upward) wire force.</li>
      <li>If it's still over the limit, <b>replace the lower pole</b> taller so the difference fits: ${risk.map(u=>`${E(u.to)} needs about ${fi(Math.max(0, Math.round(u.diff) - u.lim))} more height (≈ ${Math.ceil(Math.max(0, Math.round(u.diff) - u.lim)/60)*5}' taller pole)`).join("; ")}. Only one reference pole off the app; check the FE tracker for its designer and status first.</li>
      <li>Annotate the adjacent pole with the same violations as this pole plus <code>- REPLACING POLE DUE TO UPLIFT CAUSED BY ${E(D.b.tag || "this pole's tag")}</code>. The uplift cost is split evenly among the attachers causing it.</li>
      <li>Run SPIDA on both poles: a positive wire vertical force is uplift → replace. Don't cascade uplift replacements down the line.</li></ol>` : "";
    return `<div class="dg-upl"><p><b>Uplift check</b> <span class="muted">(primary / neutral height at this pole vs the pole at the other end; 150′+ span → 10′, 100–150′ → 5′, under 100′ → same height)</span></p>
      ${rows?`<div class="dg-scroll"><table class="dg-t"><thead><tr><th>Span</th><th>Length</th><th>Wire</th><th>New here vs there</th><th>Difference</th><th>Limit</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:""}
      ${fe.map(u=>`<p class="dg-warn">${E(u.text)}</p>`).join("")}
      ${over.length?`<p class="muted">${E(over.map(u=>u.span).join(", "))}: over 350′, not checked here. Leave a map note to check uplift in SPIDA.</p>`:""}
      ${risk.length ? steps : `<p class="ok-line">✓ No uplift from this design.</p>`}</div>`;
  }
  function propNote(T, D){
    if(!T || !(T.propWarn||[]).length) return "";
    return `<p class="dg-warn"><b>Proposed, check its midspan:</b> ${T.propWarn.map(v=>E(`${v.code} ${v.note}`)).join("; ")}. That's from the estimated midspan, so it doesn't change the fix above: ${D.comms.length ? "match the sag of the existing comms (4\" above the top comm in the span)" : "run the span in the Proposed Midspan Calculator"} and retype the proposed's midspan. If it still fails, the proposed needs more height (its cost).</p>`;
  }
  /* ---------- unique design cases on this pole (FE 411 Supporting Docs, 11/2026) ---------- */
  function specialHTML(D, R){
    const X = D.special || {}, repl = R.mode==="replace", power = repl || R.mode==="raise", out = [];
    const tag = D.b.tag || "this pole", sz = repl ? `${R.T.opt.size}'-${R.T.opt.cl}` : "";
    if(X.pushBrace && repl) out.push(`<li><b>Push brace:</b> replacing the pole means replacing the push brace too. Place it per <b>CS 7-120</b>; the push brace pole is the same size and class as the new pole (${sz}). CAD (no extra map symbology): <code>- INSTALL PUSH BRACE OF CLASS ${sz} (P __' __") W/LEAD OF __' @ ___ DEGREES</code> after the pole replacement line. CREWS: on the pole's P/S, Scrap and Install <code>DS-140801</code> (BRACKET-PUSH POLE 6"-11" DIA), plus an extra pole Scrap and Install for the push brace pole (${sz}).</li>`);
    else if(X.pushBrace) out.push(`<li><b>Push brace</b> on this pole: if the fix turns into a replacement, the push brace is replaced too (CS 7-120, same size/class, CREWS DS-140801 + an extra pole).</li>`);
    if(X.ow.length && power) out.push(`<li><b>Open wire secondary</b> on this pole: to resag or rebuild it, replace the <b>whole OW lead</b> with triplex (if the OW runs past your proposal, you can't). CAD per pole: <code>- MP TO R/P (3) DE #4 CU OW SEC W/ (1) DE 1/0 ACSR TPX SEC (P __' __")</code> and <code>- SAG (1) DE 1/0 ACSR TPX SEC SO IT SAGS __" PER CONST STD 4-626</code> (TAN for a tangent pole); plus a small block per span: <code>SPAN FROM ${E(tag)} TO …</code> / <code>- R/P (3) #4 CU OW SEC W/ (1) 1/0 ACSR TPX</code> / <code>- SAG SPAN SO IT SAGS __" PER CONST STD 4-626</code>. CREWS: make the spans last (Type → Span, first pole then second, design length = span length); only (1) cable install and (1) cable scrap per span, no MISC CONST ACT CUs.</li>`);
    if(X.gfci.length) out.push(`<li><b>GFCI outlet</b> on this pole: comms stay <b>40"</b> from it (NESC, CS 16-800); the bottom of the outlet can't go below 16' 6"; when transferring, put it as low as possible. Its feed: a <b>municipal</b> secondary is its own power space, 40" drip loop to bolt from FE's (the municipality moves its own: SPANS Attachment Proposal, responding company "Other Company Mon Power", no CREWS); an <b>FE</b> secondary is a normal secondary with the muni riser 12" below it (MP transfers weatherhead, outlet and riser on a replacement; SPANS Informational Proposal).</li>`);
    if(X.boxes.length){ const own = X.boxes.map(b=>K.shortCo(b.co)||b.co).filter(Boolean)[0] || "box owner";
      out.push(`<li><b>Comm utility box</b> (${E(own)}): comms keep <b>12" above</b> the box, a comm can't be moved within 12" of it, and the box itself isn't called to move; its riser keeps normal MP riser clearances. The box is fed by MP but metered like any customer.${repl
        ? ` <b>The box, its power riser and the meter can't be transferred to the new pole.</b> In the box owner's remedy (e.g. ${E(own)}):<br><code>- REMOVE RISER &amp; UTILITY BOX FROM POWER POLE &amp; TRANSFER TO OWN POLE/PEDESTAL</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;- SET OWN POLE 15' FROM POWER POLE, OUTSIDE THE ROW</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;- IF SETTING OWN POLE IS NOT POSSIBLE, SET PEDESTAL 8' FROM POWER POLE</code><br>The box and meter go with the owner; MP can extend the power riser on the pole like a secondary riser (on the P/S).`
        : " If the box and riser have no violations they stay as they are."}</li>`); }
    if(X.customer.length && power) out.push(`<li><b>Customer-owned attachment</b> (${E(X.customer.map(c=>c.t).join(", "))}): FE doesn't allow them. Add to Mon Power's remedy: <code>- COORDINATE WITH HOMEOWNER TO REMOVE CUSTOMER-OWNED ${E(X.customer[0].t)}</code> (the light/speaker and its meter go on their own pole).</li>`);
    return out.length ? `<div class="dg-upl"><p><b>Also on this pole</b> <span class="muted">(FE 411 unique design cases)</span></p><ol>${out.join("")}</ol></div>` : "";
  }
  function designCard(D, P, V){
    const R = decide(D, P, V);
    if(R.mode==="comm"){
      // comm moves fix it, but not the way the "How to fix" list (read on the existing column) says: show the moves that work
      const T = R.T, eraNew = T?.after?.over?.[3], eraOld = compute(D.c).E.v3; S = COLS[SEL];
      const differs = T && (R.assist || (eraNew && eraNew!==eraOld) || P.some(f=>f.noRoom || f.power) || (T.P||[]).some(f=>f.move && f.move.both));
      if(!differs || R.forProposed===undefined && !V.list.length) return {mode:"comm", html:""};
      const rows = layout(D, T).filter(r=>!r.equip || Math.abs((r.nw??0)-(r.old??0))>=1);
      const mvd = rows.filter(r=>(r.kind==="comm"||r.kind==="prop") && r.nw!=null && (r.old==null || Math.abs(r.nw-r.old)>=1));
      return {mode:"comm", html:`<div class="dg-card"><h4>Fix: Com Rearrangement (no power work)</h4>
        <p class="dg-pick">Move the comms as in the table${eraNew==="Pre-1990" && eraOld!=="Pre-1990" ? `, with row 3 on <b>Pre-1990</b>` : ""}${R.assist==="both" ? `, raising the comm above at both ends of its span` : R.assist==="order" ? `, in a new comm order` : ""}. That clears every check.</p>
        ${eraNew==="Pre-1990" && eraOld!=="Pre-1990" ? `<p class="muted" style="font-size:12px">It's a pre-1990 line and something fails, so the sheet loads Pre-1990 (411 step 8), and Pre-1990 holds while comms and power move (only a replacement makes it Post-1990). The "How to fix" list below is read Post-1990, so it looks worse than it is.</p>` : ""}
        ${propNote(T, D)}${layoutTable(rows)}
        <p><b>Step by step:</b></p><ol>
        ${eraNew==="Pre-1990" && eraOld!=="Pre-1990" ? `<li>On the sheet, set row 3 of this pole's column to <b>Pre-1990</b> (row 4 per the pole year).</li>` : ""}
        ${mvd.map(r=>`<li>Katapult MR View: ${E(r.name)} ${r.old!=null ? `${fi(r.old)} → <b>${fi(r.nw)}</b> (${r.nw>r.old?"+":"−"}${fi(Math.abs(r.nw-r.old))})` : `attach at <b>${fi(r.nw)}</b>`}.</li>`).join("")}
        ${Object.keys(T.om||{}).length ? `<li>Also at the other pole of ${E(Object.keys(T.om).map(k=>SN(k)+" span").join(", "))}: the same raise on that comm, so its whole midspan comes up.</li>` : ""}
        <li>Export the Job JSON and ${k("Load after JSON")}: the After MR column should be all green.</li></ol>
        ${specialHTML(D, R)}</div>`};
    }
    if(R.mode==="midspan"){
      return {mode:"midspan", html:`<div class="dg-card"><h4>${R.forProposed?"Make room for the proposed: ":"Fix: "}set a midspan pole</h4>
        <p class="dg-pick">Set a <b>new 40'-4 midspan pole</b> in the ${E(R.sp.k ? SN(R.sp.k) : "long")} span, framed with <b>CS 8-105</b> (pole-top pin) and <b>CS 8-010</b> (60" primary to neutral). MP 100%, no code.</p>
        <p>The span is past the sag table, so moving wires on this pole won't fix it.</p>
        <ol><li>In Katapult, insert a pole at the middle of the span (not in a driveway or on a house), next SCID, ${k("Proposed Pole Spec")} 40-4.</li>
        <li>${k("Insert Blank Photo for Measuring")} and put each wire at its true midspan height, then raise them into spec on the make-ready side (primary on the pole-top pin, neutral 60" below).</li>
        <li>Add a SPANS sub-proposal for the pole addition, and add the new pole to the sheet to check both new spans.</li></ol>
        ${R.N && R.N.hard.length ? `<p class="dg-alt"><b>Re-check after the midspan pole:</b> these also fail on this pole now; the shorter spans may clear them, otherwise they need their own fix: ${R.N.hard.map(f=>E(f.text.split(/(?<=\.)\s/)[0])).join(" ")}</p>` : ""}</div>`};
    }
    const F = R.F, fr = F.fr, specs = (fr.specs||[]).filter(Boolean), out = [];
    const hardWhy = R.N.hard.map(f=>E(f.text.split(/(?<=\.)\s/)[0])).slice(0,2).join(" ");
    const bldg = D.c.active.filter(kk=>BLDG(D.c.spans[kk]) && V.list.some(v=>v.k===kk));
    if(R.mode==="none"){
      const last = (R.tried||[]).slice(-1)[0], blk = last ? last.hard.concat(last.P.filter(f=>f.code==="EBC")) : R.N.hard;
      const ord = blk.some(f=>/below \S+ (at the pole|at midspan)/.test(f.text||"") && !/power|secondary|neutral|drip|riser/.test((/must be at or below [^(]+\(([^)]*)\)/.exec(f.text||"")||[])[1]||""));
      out.push(`<div class="dg-card"><h4>${R.forProposed?"Make room for the proposed: ":"Fix: "}not fixable on this pole alone</h4><p class="dg-pick">Moving the comms, raising the power or a taller pole (up to ${SIZES[SIZES.length-1][0]}') doesn't clear everything here.</p>
        <p><b>What's still in the way</b>${last?` with a ${last.opt.size}' pole`:""}: ${blk.slice(0,3).map(f=>E(f.text.split(/(?<=\.)\s/).slice(0,2).join(" "))).join(" ")}</p>
        <p><b>Try, in this order:</b></p><ol>
        <li>Check the inputs: the environment (STOP box), ${k("Check elevation")}, and Pre-1990 if the line is pre-1990. A wrong "over" label is the most common reason a pole looks unfixable.</li>
        ${ord ? `<li><b>Rearrange the comm order</b>: a comm is held down by the comm above it (at the pole or in midspan). Swapping their order, or raising the upper one at both poles, makes room.</li>` : ""}
        <li>Work at the <b>other end of the failing span</b>${bldg.length?` (the building attachment at ${E(bldg.map(kk=>spanTo(D.c,kk)).join(", "))}: raise it, or retension the drop)`:" (raise the comm there too, so the whole midspan comes up)"}.</li>
        <li>A <b>midspan pole</b> in the failing span (shorter spans sag less).</li>
        <li>Then ask a lead, with the note: <code>${E(V.list.slice(0,2).map(v=>`${v.code} ${String(v.who).split(/\s+/)[0]}`).join(", "))}: NO SINGLE-POLE FIX, SEE VDS</code>.</li></ol></div>`);
      return {mode:"none", html:out.join("")};
    }
    const T = R.T, rows = layout(D, T);
    if(R.mode==="raise"){
      const equip = D.feat?.xfmr ? "Power Equipment Raise" : "Secondary Raise";
      out.push(`<div class="dg-card"><h4>${R.forProposed?"Make room for the proposed: ":"Fix: "}${equip} (no new pole)</h4>
        <p class="dg-pick">Raise the ${D.feat?.xfmr?"transformer, secondary and neutral":"neutral / secondary"} <b>${fi(T.gL)}</b> on the existing pole, then make the comm moves below. That clears every check.</p>
        <p class="muted" style="font-size:12px">Cheapest fix that works: comm moves alone don't clear it (${hardWhy}), and there's ${fi(R.room)} of room under the ${D.minPri!=null?(D.feat?.xfmr?`primary (${txSpec(D).cs} chain)`:"primary (8-010, 60\")"):"pole top"}.</p>
        ${propNote(T, D)}${layoutTable(rows)}${layoutSVG(D, rows, T, V)}${upliftHTML(D, T)}${specialHTML(D, R)}
        <p><b>Step by step:</b></p><ol>
        <li>In Katapult ${k("MR View")}, select the ${D.feat?.xfmr?"transformer, cutout, secondary, neutral and drip loops":"neutral / secondary and their drip loops"} (${k("Shift")}+click), ${k("Double-click")} one number and type ${k("+"+Math.round(T.gL))}.</li>
        <li>Move each comm to its <b>New</b> height in the table (${k("Double-click")} the number, type the move).${(()=>{ const st = rows.filter(r=>r.kind==="comm" && r.old!=null && r.nw!=null && Math.abs(r.nw-r.old) < 1); return st.length ? ` These stay where they are: ${st.map(r=>`${E(r.name)} ${fi(r.old)}`).join(", ")}.` : ""; })()}</li>
        <li>On the VDS: export the Job JSON and ${k("Load after JSON")}; the After MR column should be all green.</li>
        <li>MRE note: <code>MEDIUM POWER MRE REQUIRED. MP TO RAISE ${D.feat?.xfmr?"TX, SEC & NEUT":"NEUT"} ${fi(T.gL)}</code>, then the comm lines.</li></ol>
        ${bldg.length?`<p class="dg-alt">The ${E(bldg.map(kk=>spanTo(D.c,kk)).join(", "))} span goes to a building. If the comm's attachment on the building can go up, that may be cheaper still: check the photo.</p>`:""}</div>`);
      return {mode:"raise", html:out.join("")};
    }
    // replace
    const s = T.opt.size, cl = T.opt.cl, specTxt = D.secOnly ? "SEC ONLY" : `CS ${specs.join(", ")||"8-105"}`, prev = R.tried.filter(t=>!t.ok).map(t=>`${t.opt.size}'-${t.opt.cl}`);
    const room = roomOnPole(D, F);
    out.push(`<div class="dg-card"><h4>${R.forProposed?"Make room for the proposed: ":"Fix: "}replace the pole</h4>
      ${R.forProposed?`<p class="dg-alt">No existing violations on this pole: this make-ready is only to fit the proposed, so it's the proposer's cost (100% or incremental; the proposed never gets a split cost).</p>`:""}<p class="dg-pick">Replace the ${D.h?D.h+"'":""}${D.cls?"-"+E(D.cls):""} pole with a <b>${s}'-${cl}</b>, ${D.secOnly ? `<b>secondary only</b> (no primary, so no 8-xxx framing)` : `framed with <b>${E(specTxt)}</b>`}.</p>
      <p class="muted" style="font-size:12px">Why this and nothing cheaper: comm moves alone don't clear it (${hardWhy})${room!=null?`; raising the power on the existing pole doesn't either (${room>0?`only ${fi(room)} of room under the ${D.minPri!=null?"primary":"pole top"}`:`no room under the ${D.minPri!=null?"primary":"pole top"}`})`:""}${prev.length?`; a ${prev.join(" or ")} still leaves checks failing`:""}. The ${s}'-${cl} is the shortest pole whose layout passes every Post-1990 check on the sheet.</p>
      ${propNote(T, D)}<p><b>New pole layout</b> (Post-1990):</p>${layoutTable(rows)}${layoutSVG(D, rows, T, V)}${upliftHTML(D, T)}${specialHTML(D, R)}
      <p><b>Build spec:</b></p><ol>${specList(D, F).map(x=>`<li>${x}</li>`).join("")}<li>Comms in the order shown, 12" between companies; proposed at or below its height in the table.</li></ol>
      <p><b>Step by step:</b></p><ol>
      <li>In Katapult, click the pole top label → ${k("Pole Replacement")}, ${k("Proposed Pole Spec")} <b>${s}-${cl}</b>, check ${k("Adjust Power")} only (leave ${k("Adjust Communication")} off), then ${k("Adjust Heights")}. Comms only move where the table says.</li>
      ${(()=>{ const st = rows.filter(r=>r.kind==="comm" && r.old!=null && r.nw!=null && Math.abs(r.nw-r.old) < 1); return st.length ? `<li><b>Stay where they are</b> (no move needed, they already clear): ${st.map(r=>`${E(r.name)} ${fi(r.old)}`).join(", ")}. If Katapult moved them, set them back.</li>` : ""; })()}
      <li>Set every wire to its <b>New</b> height in the table: ${D.secOnly ? `the secondary up to 8" from the new pole top` : `primary per ${E(fr.key||"the spec")}, neutral 60" under it${D.feat?.xfmr?`, cutout and transformer per ${txSpec(D).cs}`:""}`}, then the comms and the proposed.</li>
      <li>Run PLA on the new pole; add guys if it fails.</li>
      <li>Export the Job JSON and ${k("Load after JSON")}: the SCID MR column fills and re-checks Post-1990.</li>
      <li>MRE note: <code>COMPLEX POWER MRE REQUIRED. MP TO REPLACE ${D.h?D.h+"'":""}${D.cls?"-"+E(D.cls):""} POLE W/ ${s}'-${cl} POLE${D.secOnly ? " (SEC ONLY)" : ` USING ${E(specTxt)}`}</code>. SPANS: Will Replace Pole, New Height ${s} / Class ${cl}; street, height and class must match the CAD block.</li></ol>
      ${bldg.length?`<p class="dg-alt">Before ordering the pole: the ${E(bldg.map(kk=>spanTo(D.c,kk)).join(", "))} span goes to a building. If the comm's attachment on the building can go up enough, that may avoid the replacement. Check the photo.</p>`:""}
      <p class="muted" style="font-size:12px;margin-top:6px">Heights come from the VDS checks with the power moved to the new framing (bury 10% + 2'${D.secOnly?", secondary 8\" from the top":`, 8-010 at 60"`}${D.feat?.xfmr?", transformer chain 104\"":""}); the far end of each span stays where it is.</p></div>`);
    return {mode:"replace", html:out.join("")};
  }

  /* ---------- the proposed is the only attacher: Proposed Midspan Calculator ---------- */
  function midspanCalcCard(D){
    const c = D.c; if(!String(c.prop?.name||"").trim() || D.comms.length) return "";
    const ks = c.active.filter(kk=>c.prop.spans[kk]?.in);
    let rows = "", svg = "";
    try{
      S = c;
      rows = ks.map(kk=>{ const sp = c.spans[kk], r = calcProp(kk), pm = pf(sp.mid), need = midNeed(sp), mMax = pm!=null ? pm - need : null;
        if(!svg && pm!=null && pf(sp.pole)!=null){
          const pp = r.max!=null ? r.max : null, est = pf(c.prop.spans[kk]?.mid);
          svg = spanSVG({bldg: BLDG(sp) ? spanTo(c,kk) : "", title:`${SN(kk)} span to ${spanTo(c,kk)}: proposed fit`, pole:null, mid:null, req:r.gcReq, reqLbl:"ground needs", env:sp.env,
            extra:[{pole:pf(sp.pole), mid:pm, lbl:"power", col:"#c0302b"}].concat(pp!=null && est!=null ? [{pole:pp, mid:est, lbl:"proposed", col:"#1f7a46", dash:true}] : []),
            band: mMax!=null && r.gcReq!=null && mMax > r.gcReq ? {top:mMax, bot:r.gcReq, lbl:`proposed midspan goes in here: ${fi(r.gcReq)}–${fi(mMax)}`} : null});
        }
        return `<tr><td>${E(SN(kk))} → ${E(spanTo(c,kk))}${sp.len?` · ${E(sp.len)}′`:""}</td><td><b>${fi(r.max)}</b></td><td>${fi(mMax)}</td><td>${fi(r.gcReq)}</td><td>${E(c.prop.spans[kk]?.mid||"—")}</td></tr>`; }).join("");
    }catch(e){ console.error(e); } finally { S = COLS[SEL]; }
    return `<div class="dg-card mc"><h4>Proposed is the only attacher: use the Midspan Calculator</h4>
      <p class="dg-pick">There's no existing comm to match the sag of, so run ${ks.length>1?"each span":"the span"} in the <b>Proposed Midspan Calculator</b> (Google sheet).</p>
      <p>Where: ${MC_PATH}. ${k("Make a copy")} into the proposal's Drive folder. QAQC column J looks for it on every span with power and no existing comm.</p>
      ${rows?`<div class="dg-scroll"><table class="dg-t"><thead><tr><th>Span</th><th>Proposed max at pole</th><th>Max at midspan (12" under power)</th><th>Ground needs</th><th>Est. midspan now</th></tr></thead><tbody>${rows}</tbody></table></div>`:""}
      ${svg}
      <ol>
        <li>Open your copy and type the span: length, the lowest power at both poles and at midspan, and the proposed attach heights. Put a <b>space</b> between feet and inches: <code>22' 6"</code>, not <code>22'6"</code> (it silently changes the height).</li>
        <li>Put the proposed <b>as high as it can go</b>: at or below the max at the pole above, and 12" under the neutral at midspan. Lower means the ice sag can pull it into a PGC.</li>
        <li>Read the proposed's max sag from the <b>green column</b>: that's its estimated midspan.</li>
        <li>Type it into the page-only row <b>Proposed est. midspan, ${E(ks.map(SN).join(" / ")||"…")} span</b> at the bottom of the sheet. The proposed rows (321–332) then show pass/fail for ground clearance.</li>
        <li>If it fails the ground, the proposed needs make-ready to get the height: secondary raise or a taller pole (incremental / 100% to the proposer).</li>
        <li>Set the same height in Katapult and keep the calculator in the proposal folder for the reviewer.</li>
      </ol></div>`;
  }

  renderNotes = function(){
    baseRender.apply(this, arguments);
    try{
      const el = $("notes"), c0 = COLS[SEL]; if(!el || !c0 || (!c0.node && !c0.tag)) return;
      const V = violations(SEL), g = V.g, P = fixPlan(SEL); S = COLS[SEL];
      const D = poleData(g);
      const secs = el.querySelectorAll(":scope > section");
      // 1 · existing violations: help under each one
      const lis = secs[0] ? secs[0].querySelectorAll(":scope > ul.vlist > li") : [];
      V.list.forEach((v,i)=>{ const li = lis[i]; if(!li) return; const h = helpFor(v, D, P); S = COLS[SEL]; if(!h) return; const sp = li.lastElementChild || li; sp.insertAdjacentHTML("beforeend", h); });
      // the recommended fix: when comm moves alone can't clear the pole, the one fix that does (raise the power, or the new pole
      // with its heights and build spec) goes first, and the comm-by-comm list folds away under it
      const done = g.after && !violations(SEL, true).list.length; S = COLS[SEL];   // the Katapult MR already clears the pole: nothing to recommend
      const R = done ? {mode:"done", html:""} : designCard(D, P, V), mc = midspanCalcCard(D); S = COLS[SEL];
      const how = secs[1] && /How to fix/.test(secs[1].querySelector("h3")?.textContent||"") ? secs[1] : null;
      if(R.html){
        const sec = `<section class="dg-rec"><h3>2 · Recommended fix</h3>${R.html}</section>`;
        if(how){
          how.insertAdjacentHTML("beforebegin", sec);
          const h3 = how.querySelector("h3"), body = [...how.childNodes].filter(n=>n!==h3);
          const det = document.createElement("details"); det.className = "dg-more";
          det.innerHTML = `<summary>Comm-by-comm detail: why moving the comms alone doesn't fix it (${how.querySelectorAll(".fixes > li").length})</summary>`;
          body.forEach(n=>det.appendChild(n)); h3.remove(); how.appendChild(det);
          document.getElementById("btn-plan2")?.remove();   // the comm-only plan isn't the fix here
        } else if(secs[0]) secs[0].insertAdjacentHTML("afterend", sec);
      }
      if(R.mode==="replace" || R.mode==="raise"){ const pick = el.querySelector(".dg-rec .dg-pick")?.textContent || "";
        el.querySelectorAll(".dg-help .dg-b").forEach(b=>b.insertAdjacentHTML("afterbegin", `<p class="dg-alt"><b>This pole's fix:</b> ${esc(pick)} See <b>2 · Recommended fix</b>. The options below are what was ruled out on the way there.</p>`)); }
      if(mc){ const at = el.querySelector(".dg-rec") || how || secs[0]; if(at) at.insertAdjacentHTML("afterend", `<section><h3>Proposed: Midspan Calculator</h3>${mc}</section>`); }
    }catch(e){ console.error(e); S = COLS[SEL]; }
  };
  window.__dgCard = designCard;
  window.DG = {specialHTML, uplift, upliftHTML, trial, roomOnPole, poleData, decide, layout, layoutTable, layoutSVG, frame, needs, specList};
  document.addEventListener("click", e=>{
    const z = e.target.closest?.(".dg-zoom"); if(z){ z.remove(); return; }
    const sv = e.target.closest?.("#notes .dg-svg"); if(!sv) return;
    const o = document.createElement("div"); o.className = "dg-zoom"; o.title = "Click to close"; o.appendChild(sv.cloneNode(true)); document.body.appendChild(o);
  });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") document.querySelectorAll(".dg-zoom").forEach(z=>z.remove()); });
  try{ renderNotes(); }catch(e){}
})();
