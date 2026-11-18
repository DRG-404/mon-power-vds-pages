
/* ---------- "Do it in Katapult": step-by-step for each fix ---------- */
(function(){
  if(typeof fixHTML !== "function") return;
  const base = fixHTML;
  const k = t => `<kbd>${t}</kbd>`;
  const inch = n => { const a = Math.round(Math.abs(n)); return (n<0?"-":"+") + a; };
  const BURY = h => { h = +h; return h<=40 ? 72 : h===45 ? 78 : h===50 ? 84 : h===55 ? 90 : h===60 ? 96 : h===65 ? 102 : h===70 ? 108 : h===75 ? 114 : 120; };   // 10% + 2'
  const lift = (from, to) => (to - from) * 12 - (BURY(to) - BURY(from));   // what everything on the pole moves up
  const open = (scid) => `In Katapult, open the job and click ${scid ? `SCID ${esc(scid)}` : "this pole"}. Switch the map to ${k("MR View")} and open the pole's main photo.`;
  const finish = `When you're done, export the Job JSON again (Download Manager → Data → Job JSON) and use ${k("Load after JSON")} here to re-check every pole.`;
  function curPole(){ try{ const g = groupOf(SEL), b = g.base; return {scid: POLES.find(p=>p.id===b.node)?.scid || "", h: parseInt(b.height,10) || null}; }catch(e){ return {scid:"", h:null}; } }
  const toIn = t => { const m = /(-?\d+)'\s?(\d+)"/.exec(t||""); return m ? (+m[1])*12 + (+m[2]) : null; };
  function steps(f){
    const P = curPole(), out = [];
    if(f.move){
      const d = f.move.d, who = esc(f.who);
      out.push(open(P.scid));
      out.push(`Find the ${who} height label on the pole. ${k("Double-click")} the number, type ${k(inch(d))} and press ${k("Enter")}. That moves it ${Math.abs(Math.round(d))}" ${d<0?"down":"up"}${Math.abs(d)>=12?` (${fi(Math.abs(d))})`:""}.<span class="tip">Its down guy and any of its drops at the same height move with it: select them all first (${k("Shift")}+click each label, or drag a box around them), then double-click one number and type ${k(inch(d))} once.</span>`);
      if(f.move.both){ const oth = /at (SCID [\w.]+|[^ ]+ span)/.exec(f.katapult||"")?.[1] || "the pole at the other end of the span"; out.push(`Open ${esc(oth)} and do the same: ${k("Double-click")} ${who}'s number and type ${k(inch(d))}. Moving it at both poles brings the whole midspan up ${Math.abs(Math.round(d))}".`); }
      out.push(`Check the midspan photo of each span it runs in: the moved wire now shows its new midspan height. It should match the VDS (midspan moves about half the pole move when only one end moves).`);
      out.push(finish);
      return out;
    }
    if(f.code === "TBD" || f.midspan){
      out.push(`On the map, add a pole in the middle of the long span (centered unless the ground won't allow it). Give it the next SCID and Node Type ${k("pole")}, then fill ${k("Proposed Pole Spec")} (usually 40-4) and the ${k("Pole Height")} / ${k("Pole Class")}.`);
      out.push(`Use ${k("Insert Blank Photo for Measuring")} on the new pole and trace every wire across it at its current midspan height: primary, secondary/neutral, comms, then the proposed.`);
      out.push(`In ${k("MR View")}, ${k("Double-click")} each height and type the move up to its spot on the new pole per the construction standard (e.g. primary on the pole top pin).`);
      out.push(`Add the midspan pole to the VDS (+ Column) and check both new spans. ${finish}`);
      return out;
    }
    if(f.noRoom || f.power){
      const h = P.h, sizes = h ? [5,10,15].map(x=>h+x).filter(x=>x<=70) : [];
      out.push(open(P.scid));
      const need = f.noRoom ? toIn(/needs ([-\d]+'\s?\d+") more room/.exec(f.text||"")?.[1]) : toIn(/raise it ([-\d]+'\s?\d+") at this pole/.exec(f.text||"")?.[1]);
      const mv = need ? "+" + need : "+6";
      if(f.code==="EGC" && f.power && !f.noRoom){
        out.push(`<b>Raise the lowest power:</b> ${k("Double-click")} the lowest power number (neutral/secondary) and type ${k(mv)}${need?` (${fi(need)} up, the move this fix needs)`:` for 6" up`}. To move several at once, ${k("Shift")}+click their labels, then double-click one number and type the move once.<span class="tip">Resags aren't a height move in Katapult: write them in the MRE note instead (RESAG … PER CONST STD 4-6xx).</span>`);
      } else {
        out.push(`<b>Raise the lowest power</b> if there's room above it: ${k("Double-click")} its number and type ${k(mv)}${need?` (${fi(need)}, the room this comm is short)`:""}. Move several at once with ${k("Shift")}+click, then one double-click.`);
      }
      out.push(`<b>Or replace the pole:</b> click the pole top label → ${k("Pole Replacement")}. Pick the ${k("Proposed Pole Spec")} (40-4, 45-3, 50-2, 55-1, 60-1), check ${k("Adjust Power")} and ${k("Adjust Communication")}, then ${k("Adjust Heights")}. This also writes the pole top note (Replace 40' class 6 pole with 45' class 3 pole).`
        + (sizes.length ? `<span class="tip">Moving everything by hand instead: select all the power (and comms) labels, ${k("Double-click")} a number and type how far it all comes up. A taller pole is also buried deeper (10% + 2'), so:</span><table><tr><th>${h}' →</th>${sizes.map(x=>`<th>${x}'</th>`).join("")}</tr><tr><td>type</td>${sizes.map(x=>`<td>${k("+"+lift(h,x))}</td>`).join("")}</tr></table>` : ""));
      out.push(`Then fit the comms and the proposed on the new pole (use the VDS fix plan for their heights), and run PLA on the replaced pole.`);
      out.push(finish);
      return out;
    }
    if(f.code==="EBC"){
      out.push(`This is comm to comm in the midspan: it's fixed with a ${k("retension")} or a raise, not a height change on this pole. Note it in the MRE note (e.g. RETENSION … SO IT SAGS …), or raise the upper comm at both poles in ${k("MR View")} (${k("Double-click")} its number, type ${k("+6")}).`);
      out.push(finish);
      return out;
    }
    return null;
  }

  /* ---------- "Fix it on the VDS": record the fix in the sheet ---------- */
  function vdsSteps(f){
    const g = groupOf(SEL), c = g.det, AL = g.after ? letterOf(g.afterCi) : null, EL = letterOf(g.detCi);
    const cell = r => `<code>${AL ? AL + r : "row " + r}</code>`;
    const cells = rs => rs.map(cell).join(", ");
    const col = AL ? `After MR column <b>${AL}</b>` : `the After MR column`;
    const fr = f.cell ? String(f.cell).replace(/^[A-Z]+/,"") : "", red = f.cell ? ` The failing cell is <code>${esc(f.cell)}</code> in the existing column; ${AL ? `<code>${AL}${fr}</code>` : "the same row in the After MR column"} should turn green.` : "";
    const make = AL ? `Click column <b>${AL}</b> (green <i>After MR</i> label). That's where make-ready heights go; existing column ${EL} stays locked as the violation record.`
                    : `Click ${k("+ After MR column")} on the sheet toolbar (or ${k("Apply fix plan")} for comm moves). It adds a green <i>After MR</i> column next to the pole. Make-ready heights go there; existing column ${EL} stays locked as the violation record.`;
    const notes = `Open the ${k("Notes")} tab for this SCID: click ${k("Use VDS")} so Category, MR Type and the cells fill from the sheet, then check the MRE line.`;
    const out = [];
    if(f.move){
      const a = c.atts[f.move.j], b = ATT_BASE(f.move.j), d = f.move.d;
      const ks = KEYS.filter(kk=>a?.vals[kk]?.pole);
      const pr = ks.map(kk=>b+8+KEYS.indexOf(kk)), mr = ks.map(kk=>b+14+KEYS.indexOf(kk));
      const newP = ks.map(kk=>fi(parseFt(a.vals[kk].pole)+d));
      const mid = f.move.both ? `raise its midspan in ${cells(mr)} by the full ${fi(Math.abs(d))} in the span you move at both poles${mr.length>1?` and ${fi(Math.abs(d)/2)} in the others`:""}` : `${d<0?"lower":"raise"} its midspan in ${cells(mr)} by ${fi(Math.abs(d)/2)} (half the pole move)`;
      if(g.after && g.after.plan){
        out.push(`${k("Apply fix plan")} already typed this into After MR column <b>${AL}</b>: ${esc(f.who)} at ${cells(pr)}${newP.length?` = ${[...new Set(newP)].join(" / ")}`:""}, midspan in ${cells(mr)} moved to match.`);
      } else {
        out.push(AL ? make : `Click ${k("Apply fix plan")}: it adds a green <i>After MR (plan)</i> column with this move (and the other comm moves) already typed in. Existing column ${EL} stays locked as the violation record.`);
        out.push(`Or by hand: in ${col}, type ${esc(f.who)}'s new pole height in ${cells(pr)}${newP.length?` (${[...new Set(newP)].join(" / ")})`:""}, then ${mid}.`);
      }
      out.push(`Check it cleared:${red} The chip at the top reads <i>Existing → After MR</i> with the failing count going to 0.`);
    } else if(f.code==="TBD" || f.midspan){
      out.push(`Click ${k("+ Column")} and pick the new midspan pole's SCID in the column header (after you add it in Katapult), or type its tag in row 2.`);
      out.push(`On the new column fill height (row 5), class (row 6), span lengths (rows 15–20) and the heights of each wire at the pole (rows 21–26 power, and each company's pole rows).`);
      out.push(`On this pole's column, change the long span's length (rows 15–20) to the new, shorter span so it re-checks against the sag table.`);
    } else if(f.noRoom || f.power){
      const i = f.k ? KEYS.indexOf(f.k) : -1, P = curPole(), h = P.h;
      out.push(make);
      out.push(`<b>Raising power:</b> in ${col}, add the raise to the lowest power at the pole in ${i>=0?cell(21+i):"rows 21–26"} and half of it to its midspan in ${i>=0?cell(33+i):"rows 33–38"} (all of it if you raise it at both poles).${f.code==="EGC"?` A resag only changes the midspan: add the resag to ${i>=0?cell(33+i):"rows 33–38"}.`:""}`);
      out.push(`<b>Replacing the pole:</b> in ${col}, type the new height in ${cell(5)} and class in ${cell(6)}. Row 3 switches to Post-1990 on its own. Then add ${h?`${k("+"+lift(h,h+5))} (${h+5}'), ${k("+"+lift(h,h+10))} (${h+10}')`:"the lift"} to every height at the pole (power rows 21–26 and each company's pole rows) and half of it to the midspans.<span class="tip">Easier: do the replacement in Katapult, export the Job JSON and ${k("Load after JSON")}: the After MR column fills itself.</span>`);
      out.push(`Check it cleared:${red} If a cell is still red, it needs more: raise again by what the Katapult steps say.`);
    } else if(f.code==="EBC"){
      out.push(make);
      const a = c.atts.find(x=>String(x.name).trim()===String(f.who).trim()), j = c.atts.indexOf(a), i = KEYS.indexOf(f.k);
      out.push(`<b>Retension:</b> in ${col}, type ${esc(f.who)}'s new midspan height in ${j>=0&&i>=0?cell(ATT_BASE(j)+14+i):"its midspan row"}, 2"–6" above the comm below it.${red}`);
    } else if(f.prop){
      out.push(`In the existing column ${EL}, set the proposed attach height (the Proposed Attachment rows) at or below the height above. The proposed isn't make-ready, so it goes in the existing column.${red}`);
    } else return null;
    out.push(notes);
    out.push(`When the whole job is done: ${k("Download .xlsx")} (or ${k("Copy column")} into your worksheet) so the Violation Determination sheet shows the After MR heights.`);
    return out;
  }
  fixHTML = function(f){
    const h = base(f), st = (()=>{ try{ return steps(f); }catch(e){ return null; } })(), vs = (()=>{ try{ return vdsSteps(f); }catch(e){ console.error(e); return null; } })();
    if((!st || !st.length) && (!vs || !vs.length)) return h;
    const box = (st&&st.length ? `<details class="ksteps"><summary>Do it in Katapult</summary><ol>${st.map(x=>`<li>${x}</li>`).join("")}</ol></details>` : "")
      + (vs&&vs.length ? `<details class="ksteps vsteps"><summary>Then fix it on the VDS</summary><ol>${vs.map(x=>`<li>${x}</li>`).join("")}</ol></details>` : "");
    const i = h.lastIndexOf("</span></li>");
    return i > 0 ? h.slice(0, i) + box + h.slice(i) : h.replace(/<\/li>\s*$/, box + "</li>");
  };
  try{ renderNotes(); }catch(e){}
})();
