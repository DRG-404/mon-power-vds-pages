
(function(){
  const menu = document.querySelector(".gs-menu"); if(!menu) return;
  const fileOf = id => document.getElementById(id)?.closest(".filebtn");
  const load = fileOf("k-file"), after = fileOf("a-file"), sess = fileOf("s-file");
  const steps = document.createElement("div"); steps.className = "steps"; steps.setAttribute("aria-label","Steps");
  const mk = (n, title, hint) => { const d = document.createElement("section"); d.className = "step"; d.innerHTML = `<div class="sh"><span class="sn">${n}</span>${title}</div><div class="sb"></div><div class="hint">${hint}</div>`; steps.appendChild(d); return d; };
  const s1 = mk(1, "Load the job", "<b>First fix the poles in Katapult</b> (pole on its shadow, down guys, traces), then Download Manager → Data → Job JSON");
  const s3 = mk(2, "After make-ready", "Re-check every pole with the after JSON");
  const s4 = mk(3, "Export", "Workbook for Google Sheets, or Notes rows to paste");
  load.querySelector("button").textContent = "Load Job JSON"; load.classList.add("main"); s1.querySelector(".sb").append(load);
  const fill = $("btn-all");   // goes into More ▾ below (every pole is filled when the job loads)
  after.classList.add("main"); after.querySelector("button").textContent = "Load after JSON"; s3.querySelector(".sb").append(after);
  const xl = $("btn-xlsx"); xl.className = "main"; xl.textContent = "Download .xlsx"; const nt = $("btn-nt-all"); s4.querySelector(".sb").append(xl, nt);
  const more = document.createElement("div"); more.className = "more-wrap";
  more.innerHTML = `<button type="button" id="hdr-more-btn" aria-expanded="false" aria-haspopup="true">More ▾</button><div class="hdr-menu" id="hdr-menu" hidden></div>`;
  const m = more.querySelector("#hdr-menu"), add = el => { if(el) m.appendChild(el); };
  add($("btn-layers")); add($("btn-elev")); m.appendChild(document.createElement("hr")); add(fill); m.appendChild(document.createElement("hr")); add($("btn-save")); add(sess); m.appendChild(document.createElement("hr")); add($("btn-help"));
  if(sess) sess.querySelector("button").textContent = "Open saved session";
  steps.appendChild(more);
  document.querySelector(".gs-titlebar").after(steps);
  const btn = more.querySelector("#hdr-more-btn"), close = () => { m.hidden = true; btn.setAttribute("aria-expanded","false"); };
  btn.addEventListener("click", e=>{ e.stopPropagation(); m.hidden = !m.hidden; btn.setAttribute("aria-expanded", String(!m.hidden)); });
  m.addEventListener("click", e=>{ if(e.target.closest("button") && !e.target.closest(".filebtn")) close(); });
  m.addEventListener("change", close);
  document.addEventListener("click", e=>{ if(!more.contains(e.target)) close(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") close(); });
  // highlight the step you're on
  function mark(){
    const job = typeof JOB!=="undefined" && JOB, aft = typeof COLS!=="undefined" && COLS.some(c=>c.after);
    const st = !job ? 1 : !aft ? 2 : 3;
    [s1,s3,s4].forEach((s,i)=>{ s.classList.toggle("now", i+1===st); s.classList.toggle("done", i+1<st); s.querySelector(".sn").textContent = i+1<st ? "✓" : String(i+1); });
  }
  mark(); setInterval(mark, 1000);
  const em = $("empty");
  // one Load Job JSON button only: the one in step 1 above (the empty sheet just says where it is)
})();
