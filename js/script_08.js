
/* ---------- keep the sheet (and its horizontal scrollbar) inside the window ---------- */
(function(){
  const wrap = document.getElementById("wrap"), work = document.getElementById("work"), notes = document.getElementById("notes");
  if(!wrap || !work) return;
  let busy = false;
  function fit(){
    if(busy) return; busy = true;
    try{
      if(wrap.offsetParent === null){ busy = false; return; }          // sheet hidden (Notes tab)
      const top = wrap.getBoundingClientRect().top + scrollY;
      const foot = Math.max(0, document.documentElement.scrollHeight - (work.getBoundingClientRect().bottom + scrollY));
      const h = Math.max(200, Math.floor(innerHeight - top - foot - 4));
      wrap.style.maxHeight = h + "px"; wrap.style.height = h + "px";
      if(notes){
        const side = Math.abs(notes.getBoundingClientRect().top - wrap.getBoundingClientRect().top) < 4;   // panel beside the sheet
        notes.style.maxHeight = side ? h + "px" : ""; 
      }
    }finally{ busy = false; }
  }
  window.fitSheet = fit;
  addEventListener("resize", fit);
  addEventListener("load", fit);
  try{ new ResizeObserver(()=>requestAnimationFrame(fit)).observe(document.body); }catch(e){}
  document.addEventListener("click", ()=>setTimeout(fit, 50));
  setTimeout(fit, 0); setTimeout(fit, 600);
})();
