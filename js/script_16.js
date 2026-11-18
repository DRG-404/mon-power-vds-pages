
/* Lean toolbar: QAQC layout is always on (it's how the work has to show on the real VDS sheet), Clear stays on the bar,
   everything else on the Sheet tools bar is hidden. */
(function(){
  try{ localStorage.setItem("vds:qaLayout", "1"); }catch(e){}
  const qa = document.getElementById("qa-layout"); if(qa) qa.checked = true;
  const tb = document.querySelector(".gs-toolbar"), clr = document.getElementById("btn-clear"), next = document.getElementById("btn-next");
  if(tb && clr){ if(next && next.parentNode===tb) next.after(clr); else tb.appendChild(clr); }
})();
