
/* Pole Core — the Violation Determination Sheet logic: one copy of every table, clearance rule and Katapult import. */
let JOB = null;   // the loaded Katapult job (shared)
const DATA = {"nesc": {"Railroad": [282, 324, 324, 336, 324, 324, 336], "DOT Road": [216, 216, 216, 240, 216, 216, 240], "Non-DOT Road": [186, 216, 216, 240, 216, 216, 240], "Driveway/Parking Lot": [186, 144, 180, 240, 120, 120, 240], "Farmland": [186, 216, 216, 240, 216, 216, 240], "Pedestrian": [114, 96, 180, 180, 96, 180, 180], "Water (No Boats)": [168, 180, 180, 204, 180, 180, 204], "Less than 20 acres": [210, 216, 216, 240, 216, 216, 240], "20 to 200 acres": [306, 312, 312, 336, 312, 312, 336], "Over 200 to 2000 acres": [378, 384, 384, 408, 384, 384, 408], "Over 2000 acres": [450, 456, 456, 480, 456, 456, 480], "Parallel to Street": [186, 216, 216, 240, 216, 216, 240], "Unlikely Parallel to Street": [114, 96, 144, 216, 96, 144, 216]}, "Pre-1990 Spacing": {"cols": ["6 CU", "4 CU", "1 CU", "4 ACW", "6 ACW", "4 ACSR", "2 AAAC", "1/0 ACSR", "4 ACSR TPX", "1/0 ACSR TPX", "4/0 ACSR TPX"], "rows": [[100, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44], [125, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44], [150, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44], [175, null, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44], [200, null, 44, 44, 44, 44, 44, 44, 44, null, 44, 44], [225, null, 44, 44, 44, 44, 44, 44, 44, null, 44, 44], [250, null, 44, 44, 44, 44, 44, 44, 44, null, 44, 44], [275, null, 44, 44, 44, 44, 44, 44, 44, null, 67, 44], [300, null, 53, 44, 44, 44, 44, 44, 44, null, null, null], [325, null, null, 51, 44, 44, 44, 44, 44, null, null, null], [350, null, null, 60, 44, 44, 44, 44, 45, null, null, null], [375, null, null, 71, 44, 44, 44, 44, 53, null, null, null], [400, null, null, 82, 44, 48, 44, 44, 61, null, null, null], [425, null, null, 95, 44, 56, null, null, null, null, null, null], [450, null, null, 108, 44, 64, null, null, null, null, null, null], [475, null, null, null, 44, 73, null, null, null, null, null, null], [500, null, null, null, 44, 83, null, null, null, null, null, null], [525, null, null, null, 44, null, null, null, null, null, null, null], [550, null, null, null, 44, null, null, null, null, null, null, null], [575, null, null, null, 44, null, null, null, null, null, null, null], [600, null, null, null, 44, null, null, null, null, null, null, null]]}, "Secondary Neutral Sag": {"cols": ["6 CU", "6 ACW", "4 ACSR", "2 AAAC", "1/0 ACSR", "3/0 ACSR", "4 ACSR TPX", "1/0 ACSR TPX", "4/0 ACSR TPX"], "rows": [[100, 21, 10, 15, 11, 10, 5, 21, 15, 16], [120, 31, 14, 21, 16, 14, 7, 31, 22, 22], [140, 42, 19, 29, 22, 19, 10, 42, 29, 30], [160, 54, 25, 38, 29, 24, 13, 55, 38, 39], [180, 69, 32, 48, 31, 26, 17, 72, 40, 47], [200, 85, 40, 59, 39, 32, 21, 89, 49, 58], [220, 103, 48, 71, 47, 39, 25, 108, 60, 70], [240, 123, 57, 85, 56, 46, 30, 129, 71, 83], [260, 144, 67, 99, 66, 52, 35, 155, 85, 95], [280, 167, 78, 115, 76, 61, 40, 180, 98, 110], [300, 192, 89, 132, 87, 70, 46, 206, 112, 127], [320, 218, 102, 151, 99, 79, 53, 235, 128, 144], [340, 247, 115, 170, 112, 90, 60, 265, 144, 162], [350, 261, 122, 180, 119, 95, 63, 281, 153, 172], [360, 223, 102, 150, 97, 101, 63, null, null, null], [380, 249, 114, 168, 108, 112, 70, null, null, null], [400, 276, 126, 186, 119, 124, 77, null, null, null], [420, 304, 139, 205, 132, 137, 85, null, null, null], [440, 334, 153, 225, 144, 150, 94, null, null, null], [460, 365, 167, 246, 158, 164, 102, null, null, null], [480, 398, 182, 268, 172, 179, 111, null, null, null], [500, 432, 197, 290, 186, 194, 121, null, null, null], [520, 468, 214, 314, 203, 210, 131, null, null, null], [540, 505, 230, 339, 218, 226, 141, null, null, null], [560, 543, 248, 365, 234, 244, 152, null, null, null], [580, 583, 266, 391, 251, 261, 163, null, null, null], [600, 624, 284, 419, 269, 280, 174, null, null, null]]}, "Secondary Neutral-to-Copper Communications": {"cols": ["6 CU", "6 ACW", "4 ACSR", "2 AAAC", "1/0 ACSR", "3/0 ACSR", "4 ACSR TPX", "1/0 ACSR TPX", "4/0 ACSR TPX"], "rows": [[100, 44, 44, 44, 44, 44, 44, 44, 44, 44], [120, 44, 44, 44, 44, 44, 44, 46, 44, 44], [140, 44, 44, 44, 44, 44, 44, 55, 44, 44], [160, 44, 44, 44, 44, 44, 44, 65, 49, 50], [180, 44, 44, 44, 44, 44, 44, 81, 49, 56], [200, 44, 44, 44, 44, 44, 44, 95, 55, 64], [220, 47, 44, 44, 44, 44, 44, 112, 64, 74], [240, 61, 44, 44, 44, 44, 44, 130, 73, 85], [260, 75, 44, 44, 44, 44, 44, null, null, null], [280, 92, 44, 44, 44, 44, 44, null, null, null], [300, 111, 44, 51, 44, 44, 44, null, null, null], [320, 127, 44, 60, 44, 44, 44, null, null, null], [340, 149, 44, 72, 44, 44, 44, null, null, null], [350, 160, 44, 79, 44, 44, 44, null, null, null], [360, 119, 44, 46, 44, 44, 44, null, null, null], [380, 138, 44, 57, 44, 44, 44, null, null, null], [400, 159, 44, 69, 44, 44, 44, null, null, null], [420, null, 44, null, 44, 44, 44, null, null, null], [440, null, 44, null, 44, 44, 44, null, null, null], [460, null, 44, null, 44, 44, 44, null, null, null], [480, null, 44, null, 44, 44, 44, null, null, null], [500, null, 47, null, 44, 44, 44, null, null, null], [520, null, 58, null, 47, 54, 44, null, null, null], [540, null, 68, null, 56, 64, 44, null, null, null], [560, null, 79, null, 65, 75, 44, null, null, null], [580, null, 91, null, 76, 86, 44, null, null, null], [600, null, 102, null, 87, 98, 44, null, null, null]]}, "Secondary Neutral-to-Fiber Communications": {"cols": ["6 CU", "6 ACW", "4 ACSR", "2 AAAC", "1/0 ACSR", "3/0 ACSR", "4 ACSR TPX", "1/0 ACSR TPX", "4/0 ACSR TPX"], "rows": [[100, 44, 44, 44, 44, 44, 44, 44, 44, 44], [120, 44, 44, 44, 44, 44, 44, 46, 44, 44], [140, 44, 44, 44, 44, 44, 44, 55, 44, 44], [160, 44, 44, 44, 44, 44, 44, 65, 49, 50], [180, 49, 44, 44, 44, 44, 44, 81, 49, 56], [200, 61, 44, 44, 44, 44, 44, 95, 55, 64], [220, 76, 44, 44, 44, 44, 44, 112, 64, 74], [240, 92, 44, 54, 44, 44, 44, 130, 73, 85], [260, 110, 44, 65, 44, 44, 44, null, null, null], [280, 129, 44, 77, 44, 44, 44, null, null, null], [300, 132, 44, 72, 44, 44, 44, null, null, null], [320, 154, 44, 87, 44, 44, 44, null, null, null], [340, 178, 46, 101, 44, 44, 44, null, null, null], [350, 189, 50, 108, 47, 44, 44, null, null, null], [360, 149, 44, 76, 44, 44, 44, null, null, null], [380, 170, 44, 89, 44, 44, 44, null, null, null], [400, 192, 44, 102, 44, 44, 44, null, null, null], [420, null, 51, null, 44, 49, 44, null, null, null], [440, null, 60, null, 51, 57, 44, null, null, null], [460, null, 69, null, 60, 66, 44, null, null, null], [480, null, 79, null, 69, 76, 44, null, null, null], [500, null, 89, null, 78, 86, 44, null, null, null], [520, null, 102, null, 91, 98, 44, null, null, null], [540, null, 113, null, 101, 109, 44, null, null, null], [560, null, 126, null, 112, 122, 44, null, null, null], [580, null, 139, null, 124, 134, 44, null, null, null], [600, null, 152, null, 137, 148, 44, null, null, null]]}, "Secondary Neutral-to-Foreign-Owned-ADSS": {"cols": ["6 CU", "6 ACW", "4 ACSR", "2 AAAC", "1/0 ACSR", "3/0 ACSR", "4 ACSR TPX", "1/0 ACSR TPX", "4/0 ACSR TPX"], "rows": [[100, 34, 34, 34, 34, 34, 34, null, null, null], [120, 34, 34, 34, 34, 34, 34, null, null, null], [140, 34, 34, 34, 34, 34, 34, null, null, null], [160, 38, 34, 34, 34, 34, 34, null, null, null], [180, 49, 34, 34, 34, 34, 34, null, null, null], [200, 61, 34, 35, 34, 34, 34, null, null, null], [220, 76, 34, 44, 34, 34, 34, null, null, null], [240, 92, 34, 54, 34, 34, 34, null, null, null], [260, 110, 34, 65, 34, 34, 34, null, null, null], [280, 129, 40, 77, 38, 34, 34, null, null, null], [300, 132, 34, 72, 34, 34, 34, null, null, null], [320, 154, 38, 87, 35, 34, 34, null, null, null], [340, 178, 46, 101, 43, 34, 34, null, null, null], [350, 189, 50, 108, 47, 34, 34, null, null, null], [360, 149, 34, 76, 34, 34, 34, null, null, null], [380, 170, 35, 89, 34, 34, 34, null, null, null], [400, 192, 42, 102, 35, 40, 34, null, null, null], [420, null, 51, null, 44, 49, 34, null, null, null], [440, null, 60, null, 51, 57, 34, null, null, null], [460, null, 69, null, 60, 66, 34, null, null, null], [480, null, 79, null, 69, 76, 34, null, null, null], [500, null, 89, null, 78, 86, 34, null, null, null], [520, null, 102, null, 91, 98, 34, null, null, null], [540, null, 113, null, 101, 109, 34, null, null, null], [560, null, 126, null, 112, 122, 34, null, null, null], [580, null, 139, null, 124, 134, 36, null, null, null], [600, null, 152, null, 137, 148, 42, null, null, null]]}};
const SAG = DATA["Secondary Neutral Sag"], PRE = DATA["Pre-1990 Spacing"];
const COMM_TABLES = {telco:DATA["Secondary Neutral-to-Copper Communications"], fiber:DATA["Secondary Neutral-to-Fiber Communications"], adss:DATA["Secondary Neutral-to-Foreign-Owned-ADSS"]};
const COMM_TYPES = [["telco","Telco (Copper)","telco"],["catv","CATV (Fiber Optic)","fiber"],["fiber","Fiber (Fiber Optic)","fiber"],["adss","Comm drop (ADSS)","adss"]];
const SHEET_COMM = {telco:"Copper", catv:"Fiber Optic", fiber:"Fiber Optic", adss:"ADSS"};

const ENVS = Object.keys(DATA.nesc);
const ENV_LABEL = {"Less than 20 acres":"Water w/ boats, < 20 ac","20 to 200 acres":"Water w/ boats, 20–200 ac","Over 200 to 2000 acres":"Water w/ boats, 200–2000 ac","Over 2000 acres":"Water w/ boats, > 2000 ac"};
const CONDS = ["6 CU","4 CU","1 CU","4 ACW","6 ACW","4 ACSR","2 AAAC","1/0 ACSR","3/0 ACSR","4 ACSR TPX","1/0 ACSR TPX","4/0 ACSR TPX"];
const PTYPES = [["neutral","Neutral"],["sec","Secondary (< 750 V)"],["pri","Primary"]];

const SPANS = [["B","Before"],["A","After"],["O1","Other 1"],["O2","Other 2"],["O3","Other 3"],["O4","Other 4"]];

let S = null;

/* ---------- units ---------- */
function parseFt(s){
  s = String(s ?? "").trim().replace(/[’′]/g,"'").replace(/[”″]/g,'"');
  if(!s) return null;
  let m = s.match(/^(-?\d+)\s*(?:'|ft|-|\s)\s*(\d+(?:\.\d+)?)\s*(?:"|in)?$/i);
  if(m) return +m[1]*12 + +m[2];
  m = s.match(/^(-?\d+(?:\.\d+)?)\s*(?:'|ft)?$/i);
  if(m) return Math.round(+m[1]*12*10)/10;
  m = s.match(/^(-?\d+(?:\.\d+)?)\s*(?:"|in)$/i);
  if(m) return +m[1];
  return NaN;
}
function fmt(inches){
  if(inches==null || isNaN(inches)) return "—";
  const neg = inches<0; let t = Math.round(Math.abs(inches));
  const ft = Math.floor(t/12), r = t-ft*12;
  return (neg?"−":"") + ft + "' " + r + '"';
}
const num = s => { const v = parseFloat(String(s??"").replace(/[^\d.]/g,"")); return isNaN(v)?null:v; };

// Mirrors the sheet: spans under 100' use the 100' row; 341–350' use the 350' row (20' tables); else round up to the step.
function lookup(tbl, cond, span){
  const ci = tbl.cols.indexOf(cond);
  if(ci<0) return {status:"na"};
  if(span==null) return {status:"missing"};
  const step = tbl===PRE ? 25 : 20;
  // FIXED team worksheet (11/11): every table lookup is MATCH(CEILING(span,20|25)) with no MAX(span,100) and no 340–350
  // special case. The tables start at 100', so a span that rounds under 100' finds no row and the sheet cell stays blank.
  const key = Math.ceil(span/step)*step;
  if(key < 100) return {status:"blank", row:key}; // same as the sheet: CEILING(span,20) / CEILING(span,25), so the tool and the Google template never disagree (the 350 row is never used)
  const row = tbl.rows.find(r => r[0] === key), below = false;
  if(!row) return {status:"tbd", row:null};
  const v = row[ci+1];
  return v==null ? {status:"tbd", row:row[0]} : {status:"ok", v, row:row[0], below};
}



/* ---------- FE / Mon Power ground clearances (Post-1990), inches, by wire type ---------- */
const FE_COLS = ["guy","comm","neutral","multiplex","open","primary"];
const FE_COL_LABEL = {guy:"Span Guy", comm:"Comm Cable / Messenger", neutral:"Neutral", multiplex:"Multiplex Cable", open:"Open Wire", primary:"750 V–15 kV Primary"};
const FE = {
  "res-drive":{label:"Res. driveway, cable to house / customer pole, no large vehicles (CS 03-016)", v:[null,138,null,144,150,null]},
  "ped-drop": {label:"Pedestrian, cable to house / customer pole, no large vehicles (CS 03-016)", v:[null,114,null,120,126,null]},
  "ped":      {label:"Pedestrian / rural (no tractors) / obstructed parallel to street / parallel to driveway", v:[114,114,114,144,150,174]},
  "unlikely": {label:"Parallel to street, unlikely a vehicle passes under", v:[114,114,114,168,174,198]},
  "wvdoh-par":{label:"Parallel to WVDOH road within the right of way, unlikely a vehicle passes under", v:[null,186,186,186,186,186]},
  "road":     {label:"Parallel to street (vehicles can pass) / driveway / parking lot / alley / agricultural / non-WVDOH road / parallel to WVDOH rd (CS 3-048)", v:[186,186,186,192,198,222]},
  "wvdoh":    {label:"WVDOH road crossing", v:[216,216,216,216,216,240]},
  "csx":      {label:"CSX railroad", v:[324,324,324,324,336,336]},
  "ns":       {label:"Norfolk Southern railroad", v:[324,324,360,360,360,372]},
  "rr":       {label:"All other railroads", v:[282,282,282,288,294,318]},
  "water":    {label:"Non-navigable water (no sailboats)", v:[168,168,168,174,180,204]},
  "water-20": {label:"Water with sailboats, under 20 acres (CS 03-015)", v:[210,210,210,216,222,246]},
  "water-200":{label:"Water with sailboats, 20 to 200 acres (CS 03-015)", v:[306,306,306,312,318,342]},
  "water-2000":{label:"Water with sailboats, 200 to 2000 acres (CS 03-015)", v:[378,378,378,384,390,414]},
  "water-big":{label:"Water with sailboats, over 2000 acres (CS 03-015)", v:[450,450,450,456,462,486]}
};
function feCase(sp){
  if(!sp) return null; if(sp.fe) return FE[sp.fe] ? sp.fe : null;
  const house = !!sp.toHouse;
  switch(sp.env){
    case "Railroad": return sp.rr==="csx" ? "csx" : sp.rr==="ns" ? "ns" : "rr";
    case "DOT Road": return "wvdoh";
    case "Driveway/Parking Lot": return house ? "res-drive" : "road";
    case "Pedestrian": return house ? "ped-drop" : "ped";
    case "Non-DOT Road": case "Farmland": case "Parallel to Street": return "road";
    case "Unlikely Parallel to Street": return "unlikely";
    case "Water (No Boats)": return "water";
    default: return null;   /* water with boats, boat ramp: NESC table */
  }
}
const powCol = sp => sp.ptype==="pri" ? "primary" : sp.ptype==="neutral" ? "neutral" : /TPX/.test(sp.cond||"") || sp.toHouse ? "multiplex" : (sp.cond ? "open" : "multiplex");
function feReq(sp, col){
  // Team VDS sheet (11/11): rows 45–50 / 327–332 read the 'NESC Clearances' tab by environment only (column B Post-1990),
  // the same value for every wire type: 15'6" road/driveway/farmland/parallel, 9'6" pedestrian/unlikely, 14'0" water, 18'0" DOT,
  // 23'6" railroad. The FE CS 03-048 / 03-016 values (16'0" multiplex, 16'6" open wire, 18'6" primary...) only apply when the
  // designer picks an FE case in the "FE ground clearance case" field.
  if(!sp.fe){ const e = DATA.nesc[sp.env]; return e ? e[0] : null; }
  const k = feCase(sp); if(!k) return null;
  const v = FE[k].v[FE_COLS.indexOf(col)];
  if(v!=null) return v;
  return FE.road.v[FE_COLS.indexOf(col)];   /* N/A in a CS 03-016 row (e.g. primary to a house): use the road value */
}
const SAG32 = {"4 ACSR":{"cs":"CS 4-600","rows":[[100,13],[110,16],[120,19],[130,22],[140,25],[150,29],[160,33],[170,37],[179,42],[180,38],[190,42],[200,47],[210,51],[220,57],[230,62],[240,67],[249,73],[250,74],[260,80],[270,86],[280,93],[290,100],[300,107],[310,114],[320,121],[330,129],[340,137],[350,145]]},"2 AAAC":{"cs":"CS 4-601","rows":[[100,11],[110,14],[120,16],[130,19],[140,22],[150,26],[160,29],[170,33],[179,37],[180,32],[190,35],[200,39],[210,43],[220,47],[230,52],[240,56],[249,61],[250,61],[260,66],[270,71],[280,76],[290,81],[300,87],[310,93],[320,99],[330,105],[340,112],[350,118]]},"1/0 ACSR":{"cs":"CS 4-602","rows":[[100,10],[110,12],[120,14],[130,16],[140,19],[150,21],[160,24],[170,28],[179,31],[180,26],[190,29],[200,32],[210,36],[220,39],[230,43],[240,46],[249,50],[250,44],[260,48],[270,52],[280,56],[290,60],[300,64],[310,68],[320,73],[330,77],[340,82],[350,87]]},"3/0 ACSR":{"cs":"CS 4-604","rows":[[100,12],[110,15],[120,18],[130,21],[140,24],[150,27],[160,31],[170,35],[179,40],[180,27],[190,30],[200,34],[210,37],[220,41],[230,44],[240,48],[249,53],[250,47],[260,51],[270,55],[280,59],[290,64],[300,68],[310,73],[320,78],[330,83],[340,88],[350,93]]},"1/0 ACSR TPX":{"cs":"CS 4-626","rows":[[100,14],[110,17],[120,20],[130,24],[140,27],[150,31],[160,36],[170,40],[179,45],[180,40],[190,44],[200,49],[210,54],[220,59],[230,65],[240,70],[249,76],[250,77],[260,84],[270,91],[280,98],[290,105],[300,112],[310,120],[320,127],[330,135],[340,144],[350,152]]},"4/0 ACSR TPX":{"cs":"CS 4-628","rows":[[100,13],[110,16],[120,19],[130,23],[140,26],[150,30],[160,34],[170,39],[179,43],[180,44],[190,49],[200,54],[210,59],[220,65],[230,71],[240,77],[249,84],[250,84],[260,91],[270,98],[280,106],[290,114],[300,122],[310,130],[320,138],[330,147],[340,156],[350,166]]}};   /* FE CS 4-600 to 4-638: 32 F final sag with 1/2" ice, inches, by span (4 Triplex CS 4-624 not loaded) */
function sag32(cond, len){ const t = SAG32[cond]; if(!t || len==null) return null; const row = t.rows.find(r=>r[0]>=len); return row ? {v:row[1], cs:t.cs, span:row[0]} : null; }
function resagNote(sp, req){
  if(sp.ptype==="pri") return "";
  const lowW = (sp.powTraces||[]).find(p=>p.t===sp.lowTrace);
  if(sp.toHouse || /drop|service/i.test(lowW?.kind||"")) return " This span goes to a house or building: it can't be resagged (only a dead-ended conductor going to another pole, team ruling 10-29). Raise it at the pole (extend or add a riser if it gets too vertical) or replace the pole.";
  const len = num(sp.len), s = sag32(sp.cond, len);
  if(!s){
    if(len!=null && len>350) return " Span is over 350 ft, past the FE sag tables.";
    if(/CU|ACW/.test(sp.cond||"")) return ` ${sp.cond} is open wire / copper: it cannot be resagged; replace it with triplex or raise it.`;
    return sp.cond ? ` No FE sag table loaded for ${sp.cond}; check the CS 4-6xx sag sheet by hand.` : "";
  }
  const hA = parseFt(sp.pole); if(hA==null || isNaN(hA)) return "";
  let hB = null; try{ hB = polePW(JOB, sp.oid)[sp.lowTrace]?.h ?? null; }catch(e){}
  const midpt = (hA + (hB ?? hA)) / 2, mid = midpt - s.v, ok = mid >= req;
  return ` Resag check (${s.cs}, ${s.span} ft row, 32 F final sag ${fmt(s.v)}): attachment midpoint ${fmt(midpt)}${hB==null?" (other pole not in the job, assumed level)":""} less the sag = ${fmt(mid)}, ${ok ? `which clears ${fmt(req)}: a resag fixes it` : `still ${fmt(req-mid)} short of ${fmt(req)}: a resag alone will not fix it`}. Only call out a resag when the span is visibly slack.`;
}
const feWhy = (sp, col) => { if(!sp.fe) return ""; const k = feCase(sp); return k ? `FE: ${FE_COL_LABEL[col]}, ${FE[k].label}` : ""; };

/* ---------- calculations (mirror the worksheet formulas) ---------- */
const isPre = () => S.era!=="post";
const neutralCol = () => S.era==="pre1961" ? 4 : S.era==="pre1990" ? 1 : 0;   // NESC Neutral/Comm column, sheet rows 45–50
const iceAdj = len => (len!=null && len>175) ? Math.round((len-175)*0.01*12) : 0; // sheet rows 57–62
function spanEnv(k){ return DATA.nesc[S.spans[k].env] || null; }
function commAllowance(type, len){ // sheet rows 126–131: post-1990 comm midspan ice allowance (in)
  if(len==null) return 0;
  const t = SHEET_COMM[type];
  const rate = t==="Copper" ? (len<200 ? .015 : len<300 ? .016 : .017) : (len<300 ? .005 : .01);
  return len*rate*12;
}

function calcPower(k){
  const sp = S.spans[k], len = num(sp.len), pole = parseFt(sp.pole), mid = parseFt(sp.mid), ovr0 = parseFt(sp.ovr), ovr = (ovr0==null || isNaN(ovr0)) ? null : ovr0;   // an override that isn't a height is ignored
  const out = {k}; if(pole==null || isNaN(pole)){ out.status="missing"; return out; }
  const env = spanEnv(k) || ((ovr!=null && !isNaN(ovr)) ? Array(7).fill(ovr) : null);
  if(!env){ out.status="missing"; return out; }
  out.reqPost = ovr ?? (feReq(sp, powCol(sp)) ?? env[0]); out.feWhy = ovr!=null ? "" : feWhy(sp, powCol(sp));
  const sag = lookup(SAG, sp.cond, len); out.sag = sag;
  const sagIn = sag.status==="ok" ? sag.v : 0;
  out.calc = pole - sagIn; out.blank = sag.status==="blank";
  // elevation credit (Workflow 411: midspan ground lower than the poles), still capped by the Katapult midspan
  const cr = parseFt(sp.elev); out.credit = (cr!=null && !isNaN(cr) && cr>0) ? cr : 0;
  let effPost = (mid!=null && !isNaN(mid)) ? Math.min(mid, out.calc + out.credit) : out.calc + out.credit;
  out.effPost = effPost;
  // a short span has no sag row (row 87–92 blank on the sheet): only the Katapult midspan is left to compare (411 step: the lower of the two)
  if(out.blank){ effPost = (mid!=null && !isNaN(mid)) ? mid : null; out.effPost = effPost; }
  out.post = sag.status==="tbd" ? "tbd" : effPost==null ? "missing" : effPost >= out.reqPost ? "pass" : "fail";
  if(isPre()){
    const base = ovr ?? env[neutralCol()];
    out.reqPre = base + iceAdj(len);
    out.pre = (mid==null||isNaN(mid)) ? "missing" : mid >= out.reqPre ? "pass" : "fail";
  }
  // the column's own era decides, like the worksheet: a Pre-1990 column only calculates rows 57–68 (the Post-1990 sag rows
  // 69–92 are blank), so its verdict is the Pre-1990 check alone (11/16)
  out.status = isPre() ? (out.pre ?? "missing") : out.post;
  return out;
}
function combine(post, pre){
  if(post==="pass" || pre==="pass") return "pass";
  if(post==="tbd" || pre==="tbd") return "tbd";
  if(post==="fail" || pre==="fail") return "fail";
  return "missing";
}
function commTable(type){
  let k = (COMM_TYPES.find(t=>t[0]===type)||COMM_TYPES[0])[2];
  // the reduced ADSS table (34") applies only on a neutral-only pole; with any secondary / triplex / service on the pole use 44"+ (fiber table) (team ruling, 10-28)
  if(k==="adss" && typeof S!=="undefined" && S && S.spans && Object.values(S.spans).some(sp=>sp && (sp.ptype==="sec" || (sp.powTraces||[]).some(p=>p.kind==="sec")))) k = "fiber";
  return COMM_TABLES[k]; }

function calcComm(att, k){
  const sp = S.spans[k], v = att.vals[k] || {}, len = num(sp.len);
  const pPole = parseFt(sp.pole), cPole = parseFt(v.pole), cMid = parseFt(v.mid), ovr0 = parseFt(sp.ovr), ovr = (ovr0==null || isNaN(ovr0)) ? null : ovr0;
  const out = {k};
  if(cPole==null || isNaN(cPole)){ out.status="skip"; return out; }
  const noPow = pPole==null || isNaN(pPole);   /* comm-only span (e.g. telco with no power): ground clearance still applies */
  out.noPow = noPow; out.sep = noPow ? null : pPole - cPole;
  const env = spanEnv(k) || ((ovr!=null && !isNaN(ovr)) ? Array(7).fill(ovr) : null);
  if(!env){ out.status="missing"; return out; }
  const hasMid = cMid!=null && !isNaN(cMid);
  // post-1990
  const sepPost = lookup(commTable(att.type), sp.cond, len); out.sepPost = sepPost;
  out.gcReqPost = ovr ?? (feReq(sp, "comm") ?? env[0]);
  out.allow = Math.round(commAllowance(att.type, len));
  out.effMid = hasMid ? Math.round(cMid - commAllowance(att.type, len)) : null;
  const sepOkPost = noPow ? "pass" : sepPost.status==="ok" ? (out.sep >= sepPost.v ? "pass":"fail") : sepPost.status==="tbd" ? "tbd" : "missing";
  const gcPost = out.effMid==null ? "missing" : out.effMid >= out.gcReqPost ? "pass":"fail";
  out.post = all(sepOkPost, gcPost); out.sepOkPost = sepOkPost; out.gcPost = gcPost;
  if(isPre()){
    const sepPre = lookup(PRE, sp.cond, len); out.sepPre = sepPre;
    out.gcReqPre = (ovr ?? env[neutralCol()]) + iceAdj(len);
    const sepOkPre = noPow ? "pass" : sepPre.status==="ok" ? (out.sep >= sepPre.v ? "pass":"fail") : sepPre.status==="tbd" ? "tbd" : "missing";
    const gcPre = !hasMid ? "missing" : cMid >= out.gcReqPre ? "pass":"fail";
    out.pre = all(sepOkPre, gcPre); out.sepOkPre = sepOkPre; out.gcPre = gcPre;
  }
  out.status = isPre() ? (out.pre ?? "missing") : out.post;   // the column's own era decides, like the worksheet (rows 120–125 Pre-1990, 126–137 Post-1990)
  return out;
}
function all(a,b){ if(a==="fail"||b==="fail") return "fail"; if(a==="tbd"||b==="tbd") return "tbd"; if(a==="missing"||b==="missing") return "missing"; return "pass"; }

function calcProp(k){
  const sp = S.spans[k], ps = S.prop.spans[k], len = num(sp.len), pPole = parseFt(sp.pole), ovr = parseFt(sp.ovr);
  const out = {k};
  if(!ps.in){ out.status="skip"; return out; }
  if(pPole==null||isNaN(pPole)){ out.status="missing"; return out; }
  const post = lookup(commTable(S.prop.type), sp.cond, len); // sheet rows 321–326 use the post-1990 tables
  out.used = "post-1990";
  if(post.status!=="ok"){ out.status = post.status==="tbd" ? "tbd" : "missing"; return out; }
  out.req = post.v; out.max = pPole - out.req;
  out.gcReq = (ovr!=null && !isNaN(ovr)) ? ovr : (feReq(sp, "comm") ?? (spanEnv(k)||[null])[0]);                         // sheet rows 327–332
  const h = parseFt(S.prop.height), mid = parseFt(ps.mid);
  out.poleChk = (h==null||isNaN(h)) ? "missing" : h <= out.max ? "pass" : "fail";
  out.gcChk = (mid==null||isNaN(mid)||out.gcReq==null) ? "missing" : mid >= out.gcReq ? "pass" : "fail";
  out.status = out.poleChk==="missing" ? "info" : all(out.poleChk, out.gcChk==="missing" ? "pass" : out.gcChk);
  return out;
}

const KEYS = SPANS.map(s=>s[0]), SPAN_NAMES = SPANS.map(s=>s[1]);

const ATT_BASE = j => 94 + 45*j;

function blankSpan(){ return {len:"",env:"",cond:"",ptype:"sec",pole:"",mid:"",ovr:"",label:""}; }
function blankCol(){
  const spans = {}, pspans = {}; KEYS.forEach(k=>{ spans[k]=blankSpan(); pspans[k]={in:false,mid:""}; });
  return {proposal:"",tag:"",era:"post",height:"",cls:"",red:"",active:[],spans,atts:[],prop:{name:"",type:"fiber",height:"",spans:pspans},notes:"",design:"",line:"",poleYear:"",over:{},warn:[],node:""};
}

const realAtt = a => a && (String(a.name||"").trim() || Object.values(a.vals||{}).some(v=>v && (v.pole||v.mid)));
function prep(c){
  S = c;
  S.active = KEYS.filter(k=>{ const sp = S.spans[k]; return [sp.len, sp.pole, sp.mid].some(v=>String(v??"").trim()); });
}
function anyFail(){
  const pf = S.active.some(k=>{ const r = calcPower(k); return r.status==="fail"; });
  const cf = S.atts.filter(realAtt).some(a=>S.active.some(k=>a.vals[k]?.pole && calcComm(a,k).status==="fail"));
  return pf || cf;
}
function finishEra(c, line, auto3, why){
  const v3 = c.over[3] || auto3;
  const yr = parseInt(c.poleYear);
  const auto4 = v3==="Pre-1990" ? ((line==="pre1961" || (yr>1900 && yr<1961)) ? "Yes" : "No") : "";   /* 1900 = unknown year placeholder */
  const v4 = c.over[4] || auto4;
  S.era = v3==="Post-1990" ? "post" : v4==="Yes" ? "pre1961" : "pre1990";
  return {auto3, v3, auto4, v4, why};
}
function eraFor(c){
  prep(c);
  const line = c.line||"";
  let auto3 = "Post-1990", why = "";
  if(c.replaced){ S.era = "post"; return finishEra(c, line, "Post-1990", "The pole is being replaced, so its existing violations are read Post-1990 (switch row 3 to compare Pre-1990)."); }
  if(line==="pre1990" || line==="pre1961"){
    S.era = "post";
    if(anyFail()){ auto3 = "Pre-1990"; why = "Post-1990 fails on a pre-1990 line, so it's loaded Pre-1990 (step 8)."; }
    else why = "Pre-1990 line, but Post-1990 passes, so it stays Post-1990 (step 7).";
  }
  const v3 = c.over[3] || auto3;
  const yr = parseInt(c.poleYear);
  const auto4 = v3==="Pre-1990" ? ((line==="pre1961" || (yr>1900 && yr<1961)) ? "Yes" : "No") : "";   /* 1900 = unknown year placeholder */
  const v4 = c.over[4] || auto4;
  S.era = v3==="Post-1990" ? "post" : v4==="Yes" ? "pre1961" : "pre1990";
  return {auto3, v3, auto4, v4, why};
}
// The sheet tables write 44"/34" (and every Pre-1990 spacing) in inches only
const tblFmt = (tbl, v) => (tbl===PRE || v===44 || v===34) ? `${v}"` : fmt(v);
const envWord = e => ({"DOT Road":"DOT Roadway","Non-DOT Road":"Non-DOT Roadway"})[e] || e;   /* wording used in the worksheet Fail notes */
const fi = v => { if(v==null||isNaN(v)) return "—"; const n = Math.round(v), neg = n<0, a = Math.abs(n); return (neg?"-":"")+Math.floor(a/12)+"'"+(a%12)+'"'; };
const ynOf = sts => sts.includes("fail") ? "Yes" : sts.length && sts.every(s=>s==="pass") ? "No" : "";
function compute(c){
  const E = eraFor(c);           // also points S at c and sets S.era
  const V = {}, F = {}, CL = {}, NT = {}, A = {3:E.auto3, 4:E.auto4};
  const pre = S.era!=="post", ncol = neutralCol();
  const powSt = [];
  KEYS.forEach((k,i)=>{
    const sp = S.spans[k], len = num(sp.len), pole = parseFt(sp.pole), mid = parseFt(sp.mid);
    const on = S.active.includes(k);
    if(pole!=null && !isNaN(pole)) V[27+i] = Math.round(pole);
    const env = DATA.nesc[sp.env];
    let req = null;
    if(sp.env){
      if(env){ const fcol = parseFt(sp.pole)==null || isNaN(parseFt(sp.pole)) ? "comm" : powCol(sp); req = (!pre ? feReq(sp, fcol) : null) ?? env[ncol]; V[45+i] = fmt(req); V[51+i] = req; if(!pre && feCase(sp)) F[45+i] = feWhy(sp, fcol); }
      else V[45+i] = sp.env==="Water (w/ Boats)" ? "Check Acreage" : ncol===4 ? "N/A" : "[7.x] + 5";   /* NESC Clearances tab: Boat Ramp is N/A in the Pre-1961 column */
    }
    if(pre && req!=null){ const r57 = (len!=null && len>175) ? req + iceAdj(len) : req; V[57+i] = r57; if(len!=null) V[63+i] = fmt(r57); }
    if(!pre && len!=null && sp.cond){
      const s = lookup(SAG, sp.cond, len);
      if(s.status==="ok"){ V[69+i] = fmt(s.v); V[75+i] = s.v; if(pole!=null && !isNaN(pole)){ V[81+i] = Math.round(pole - s.v); V[87+i] = fmt(pole - s.v); }
      }
      else if(s.status==="blank"){ F[87+i] = `${len}′ span: the sheet's sag lookup is CEILING(${len},20) = ${s.row}, and the sag table starts at 100′, so rows ${69+i}, ${75+i}, ${81+i} and ${87+i} stay blank like the worksheet. The tool still checks the Katapult midspan for this span.`; }
      else if(s.status==="tbd"){ V[69+i] = "TBD"; V[87+i] = "TBD"; CL[87+i] = "tbd"; F[87+i] = "TBD: span too long for the sag table. Workflow: set a midspan pole."; }
    }
    if(on && pole!=null && !isNaN(pole)){
      const r = calcPower(k);
      if(r.status!=="missing") powSt.push(r.status);
      if(!pre && r.post==="fail"){ CL[87+i] = "fail"; NT[87+i] = `Fail at ${fmt(r.effPost)} over ${envWord(sp.env)}`; F[87+i] = r.blank ? `Fail: Katapult midspan ${fmt(r.effPost)} is below ${fmt(r.reqPost)} (row 87–92 is blank on a span under 100′, so the midspan decides).` : `Fail: lower of pole − sag (${fmt(r.calc)}${r.credit?` + ${fmt(r.credit)} elevation credit`:""}) and Katapult midspan (${mid!=null&&!isNaN(mid)?fmt(mid):"—"}) is ${fmt(r.effPost)}; needs ${fmt(r.reqPost)}${r.feWhy?` (${r.feWhy})`:""}.`; }
      if(!pre && r.post==="pass" && r.credit && r.calc < r.reqPost){ F[87+i] = `Passes with the elevation credit: pole − sag ${fmt(r.calc)} + ${fmt(r.credit)} (midspan ground lower than the poles), capped by the Katapult midspan.`; }
      if(pre && r.pre==="fail"){ CL[63+i] = "fail"; NT[63+i] = `Fail at ${fmt(mid)} over ${envWord(sp.env)}`; F[63+i] = `Fail: Katapult midspan ${fmt(mid)} is below ${fmt(r.reqPre)}.`; }
      if(pre && r.post==="fail" && r.pre==="pass"){ F[63+i] = `OK under Pre-1990 (Post-1990 would fail at ${fmt(r.effPost)}).`; }
    }
  });
  A[93] = ynOf(powSt);
  for(let j=0;j<5;j++){
    const a = S.atts[j], b = ATT_BASE(j); if(!realAtt(a)) continue;
    const sts = [];
    KEYS.forEach((k,i)=>{
      const sp = S.spans[k], len = num(sp.len), v = a.vals[k]||{};
      if(len!=null) V[b+2+i] = len;
      // Team worksheet (11/11): the comm Required Pole Clearance rows look the span up with CEILING(span,25|20) and no
      // MAX(span,100), so a span under 100' finds no row and the cell stays blank: the sheet doesn't check those spans. Match it.
      const shortSpan = len!=null && Math.ceil(len/(pre?25:20))*(pre?25:20) < 100;
      if(len!=null && sp.cond && !shortSpan){
        const t = pre ? lookup(PRE, sp.cond, len) : lookup(commTable(a.type), sp.cond, len);
        V[b+20+i] = t.status==="ok" ? tblFmt(pre ? PRE : commTable(a.type), t.v) : t.status==="tbd" ? "TBD" : "";
        if(t.status==="tbd" && v.pole){ CL[b+20+i] = "tbd"; F[b+20+i] = "TBD: span too long for the table. Workflow: midspan pole."; }
      }
      if(pre && V[63+i]!=null) V[b+26+i] = V[63+i];
      const cMid = parseFt(v.mid);
      if(!pre && cMid!=null && !isNaN(cMid) && len!=null){ const e = Math.round(cMid - commAllowance(a.type, len)); V[b+32+i] = e; V[b+38+i] = fmt(e); }
      if(S.active.includes(k) && v.pole){
        const r = calcComm(a,k);
        if(r.status!=="skip" && r.status!=="missing") sts.push(r.status);
        const sepSt = shortSpan ? null : (pre ? r.sepOkPre : r.sepOkPost);
        if(sepSt==="fail"){ CL[b+20+i] = "fail"; NT[b+20+i] = `Fail at ${fmt(r.sep)} from lowest power (needs ${V[b+20+i]})`; F[b+20+i] = `Fail: ${fmt(r.sep)} below lowest power at the pole; needs ${V[b+20+i]}.`; }
        if(pre && r.gcPre==="fail"){ CL[b+26+i] = "fail"; NT[b+26+i] = `Fail at ${fmt(cMid)} over ${envWord(sp.env)}`; F[b+26+i] = `Fail: Katapult midspan ${fmt(cMid)} is below ${fmt(r.gcReqPre)}.`; }
        if(!pre && r.gcPost==="fail"){ CL[b+38+i] = "fail"; NT[b+38+i] = `Fail at ${fmt(r.effMid)} over ${envWord(sp.env)}`; F[b+38+i] = `Fail: Katapult midspan ${fmt(cMid)} less ice allowance (${r.allow}") is ${fmt(r.effMid)}; needs ${fmt(r.gcReqPost)}.`; }
      }
    });
    A[b+44] = ynOf(sts);
  }
  if(String(S.prop.name||"").trim()){
    const pst = [];
    KEYS.forEach((k,i)=>{
      const sp = S.spans[k], len = num(sp.len), ps = S.prop.spans[k]||{};
      if(len!=null && sp.cond){ const t = lookup(commTable(S.prop.type), sp.cond, len); V[321+i] = t.status==="ok" ? tblFmt(null, t.v) : t.status==="tbd" ? "TBD" : ""; }
      const env = DATA.nesc[sp.env]; if(env) V[327+i] = fmt(feReq(sp, "comm") ?? env[0]);
      if(!S.active.includes(k)) return;
      if(!ps.in){ if(V[321+i]) { CL[321+i] = "na"; F[321+i] = "Proposed doesn't go into this span, so this distance is ignored (step 14)."; } if(V[327+i]){ CL[327+i] = "na"; F[327+i] = F[321+i] || "Proposed doesn't go into this span."; } return; }
      const r = calcProp(k);
      if(r.status==="tbd"){ CL[321+i] = "tbd"; F[321+i] = "TBD: span too long for the table. Workflow: midspan pole."; }
      if(r.max!=null && !F[321+i]) F[321+i] = `Proposed can go up to ${fmt(r.max)} at the pole in this span.`;
      if(r.poleChk==="fail"){ CL[321+i] = "fail"; NT[321+i] = `Fail at ${S.prop.height}, max ${fmt(r.max)} at pole`; F[321+i] = `Fail: proposed at ${S.prop.height} is above the max ${fmt(r.max)}.`; }
      if(r.gcChk==="fail"){ CL[327+i] = "fail"; NT[327+i] = `Fail at ${S.prop.spans[k].mid} over ${envWord(sp.env)}`; F[327+i] = `Fail: proposed midspan ${S.prop.spans[k].mid} is below ${fmt(r.gcReq)}.`; }
      if(r.poleChk && r.poleChk!=="missing") pst.push(r.poleChk); if(r.gcChk && r.gcChk!=="missing") pst.push(r.gcChk);
    });
    A[333] = pst.includes("fail") ? "Yes" : pst.length ? "No" : "";
  }
  A[7] = ""; // red tag stays manual
  return {V, F, CL, NT, A, E};
}

/* ---------- violation codes ---------- */
const KIND = {telco:"Comm", catv:"Fiber", fiber:"Fiber", adss:"Fiber"};
const PWR_NAME = {neutral:"neutral", sec:"secondary", pri:"primary"};
const MID_NEED = {neutral:12, sec:30, pri:60};      // Spec Book between clearances: neutral→comm 12", triplex→comm 30", primary→comm 5′
// service span to a house: the comm service may be 12" from the customer's power service (NESC 235C Exc 3, FE design manual)
const midNeed = sp => (sp && sp.ptype==="sec" && sp.toHouse) ? 12 : (MID_NEED[sp && sp.ptype] ?? 12);
const CODE_DEF = {EBC:"Existing between clearance (comm too close to power or other comms, or crossing, in the span)",EGC:"Existing midspan ground clearance (too low in the span)",EPC:"Existing pole clearance",EOL:"Existing pole overload (PLA)",EGA:"Existing guy/anchor damaged",PPC:"Proposed pole clearance",PBC:"Proposed between clearance (in the span)",PGC:"Proposed ground clearance",POL:"Proposed pole overload",PGA:"Proposed guy/anchor damaged"};

function rowCode(r){
  if((r>=63&&r<=68)||(r>=87&&r<=92)) return "EGC";
  if(r>=94 && r<=318){ const o = (r-94)%45; if(o>=20&&o<=25) return "EPC"; if(o>=26&&o<=31) return "EGC"; if(o>=38&&o<=43) return "EGC"; }
  if(r>=321&&r<=326) return "PPC"; if(r>=327&&r<=332) return "PGC";
  return "";
}

/* ---------- Katapult import ---------- */
// a wire's spec is often only on a midspan or other photo: look through every photo for that trace
let SPEC_CACHE = null;
function specOfTrace(t){
  if(!SPEC_CACHE){ SPEC_CACHE = {};
    const walk = (o, sp) => { if(!o || typeof o!=="object") return; const s = o.wire_spec || o.bundle_spec || sp;
      for(const [k,v] of Object.entries(o)){ if(k==="wire" && v && typeof v==="object"){ Object.values(v).forEach(w=>{ if(w?._trace && (w.wire_spec||w.bundle_spec||s) && !SPEC_CACHE[w._trace]) SPEC_CACHE[w._trace] = w.wire_spec||w.bundle_spec||s; }); } else if(v && typeof v==="object" && !k.startsWith("_")) walk(v, s); } };
    Object.values(JOB?.photos||{}).forEach(p=>walk(p?.photofirst_data, null)); }
  return SPEC_CACHE[t] || null;
}

// every wire spec Katapult has for one trace, across all photos (a proposed can carry different specs on different spans)
let SPECS_ALL = null;
function specsOfTrace(t){
  if(!SPECS_ALL){ SPECS_ALL = {};
    const walk = o => { if(!o || typeof o!=="object") return; if(o._trace && (o.wire_spec || o.bundle_spec)) (SPECS_ALL[o._trace] = SPECS_ALL[o._trace] || new Set()).add(String(o.wire_spec || o.bundle_spec));
      for(const [k,v] of Object.entries(o)) if(v && typeof v==="object") walk(v); };
    Object.values(JOB?.photos||{}).forEach(p=>walk(p?.photofirst_data)); }
  return [...(SPECS_ALL[t]||[])];
}
const K = {
  first(obj){ if(obj==null || typeof obj!=="object") return obj; const v = Object.values(obj); return v.length ? v[0] : null; },
  nodeType(n){ return String(K.first(n?.attributes?.node_type) || ""); },
  scid(n){ return String(K.first(n?.attributes?.scid) ?? "").trim(); },
  tag(n){
    const t = n?.attributes?.pole_tag; if(!t) return "";
    const list = Object.values(t).filter(x=>x && typeof x==="object");
    const own = list.find(x=>x.owner) || list[0]; return own ? String(own.tagtext||"") : String(K.first(t)||"");
  },
  addr(n){ const a = n?.attributes||{}; return String(K.first(a.address) || [K.first(a.street_number),K.first(a.street_name)].filter(Boolean).join(" ") || ""); },
  dist(a,b){ // feet
    const R = 20925646, r = x=>x*Math.PI/180;
    const dLa = r(b.latitude-a.latitude), dLo = r(b.longitude-a.longitude);
    const h = Math.sin(dLa/2)**2 + Math.cos(r(a.latitude))*Math.cos(r(b.latitude))*Math.sin(dLo/2)**2;
    return 2*R*Math.asin(Math.sqrt(h));
  },
  poles(job){
    return Object.entries(job.nodes||{}).filter(([,n])=>K.nodeType(n)==="pole").map(([id,n])=>({id, scid:K.scid(n), tag:K.poleTag(n), addr:K.addr(n)}))
      .sort((a,b)=> (parseFloat(a.scid)||1e9)-(parseFloat(b.scid)||1e9) || a.scid.localeCompare(b.scid));
  },
  mainPhoto(job, n){
    const ph = n.photos||{}; const ids = Object.keys(ph);
    const main = ids.find(i=>ph[i]?.association==="main");
    const order = main ? [main, ...ids.filter(i=>i!==main)] : ids;
    for(const i of order){ const pf = job.photos?.[i]?.photofirst_data; if(pf && (pf.wire||pf.insulator||pf.messenger||pf.arm)) return pf; }
    return null;
  },
  poleWires(pf){
    const out = [];
    const walk = (o, h, spec, mr) => {
      if(!o || typeof o!=="object") return;
      const myH = typeof o._measured_height==="number" ? o._measured_height : h;
      const mySpec = o.wire_spec || spec;
      // 11/19: a move set on the insulator / messenger moves the wires under it (Katapult MR view does)
      const myMr = o.mr_move ?? mr;
      for(const [k,v] of Object.entries(o)){
        if(k.startsWith("_prediction") || k==="anchor_calibration" || k==="pixel_selection") continue;
        if(k==="wire" && v && typeof v==="object"){
          for(const w of Object.values(v)){ if(w && w._trace) out.push({trace:w._trace, h: typeof w._measured_height==="number" ? w._measured_height : myH, spec: w.wire_spec || w.bundle_spec || mySpec, mr: w.mr_move ?? myMr}); }
        } else if(v && typeof v==="object") walk(v, myH, mySpec, myMr);
      }
    };
    walk(pf, null, null);
    // one entry per trace, lowest height wins
    const by = {}; out.forEach(w=>{ if(w.h==null) return; if(!by[w.trace] || w.h < by[w.trace].h) by[w.trace] = w; });
    return by;
  },
  midspan(job, conn){
    const wires = {}, overs = [], units = [];
    for(const s of Object.values(conn.sections||{})){
      for(const pid of Object.keys(s.photos||{})){
        const pf = job.photos?.[pid]?.photofirst_data; if(!pf) continue;
        const n1 = job.nodes?.[conn.node_id_1], n2 = job.nodes?.[conn.node_id_2];
        const L = (n1 && n2 && n1.latitude!=null && n2.latitude!=null) ? K.dist(n1, n2) : 0;
        const u = {wires:{}, overs:[], f1: (L > 0 && s.latitude!=null) ? Math.min(1, K.dist(n1, s) / L) : null};
        for(const w of Object.values(pf.wire||{})){ if(w?._trace && typeof w._measured_height==="number"){ if(wires[w._trace]==null || w._measured_height < wires[w._trace]) wires[w._trace] = w._measured_height; if(u.wires[w._trace]==null || w._measured_height < u.wires[w._trace]) u.wires[w._trace] = w._measured_height; } }
        // 11/22: the environment set on the midspan height marker wins over Katapult's auto-added ground marker in the same photo
        { const mhs = Object.values(pf.midspanHeight||{}).filter(g=>g?.over), gms = Object.entries(pf.ground_marker||{}).filter(([k,g])=>g?.over && !(k==="auto_added" && mhs.length)).map(([,g])=>g);
          for(const g of [...gms, ...mhs]){ overs.push(g.over); u.overs.push(g.over); } }
        units.push(u);
      }
    }
    // Workflow 411 step 6: use the section with the strictest clearance (e.g. roadway over driveway)
    const strict = o => { const e = K.env(o).v; return e ? DATA.nesc[e][0] : -1; };
    const env = overs.length ? overs.reduce((a,b)=> strict(b) > strict(a) ? b : a) : null;
    return {wires, env, overs:[...new Set(overs)], units: units.map(u=>({wires:u.wires, f1:u.f1, env: u.overs.length ? u.overs.reduce((a,b)=> strict(b) > strict(a) ? b : a) : null}))};
  },
  // Several environments under one span: pair each measured height with the ground it's over and use the
  // crossing that's closest to failing (team, 10-22: 20'6" over the road vs 18', not 14'2" over the walkway vs 18').
  pairMid(ms, keep){
    const req = u => DATA.nesc[K.env(u.env).v]?.[0];
    const us = (ms.units||[]).filter(u=>u.env && req(u)!=null && keep.some(t=>u.wires[t]!=null));
    if(new Set(us.map(u=>K.env(u.env).v)).size < 2) return null;
    const low = u => Math.min(...keep.filter(t=>u.wires[t]!=null).map(t=>u.wires[t]));
    const margin = u => low(u) - req(u);
    const ctl = us.reduce((a,b)=> margin(b) < margin(a) ? b : a);
    const wires = {...ms.wires}; keep.forEach(t=>{ if(ctl.wires[t]!=null) wires[t] = ctl.wires[t]; });
    return {wires, env: ctl.env, overs: ms.overs, units: ms.units, paired: {env: ctl.env, h: low(ctl), others: us.filter(u=>u!==ctl).map(u=>({env:u.env, h:low(u)}))}};
  },
  powerKind(ct){ ct = (ct||"").toLowerCase(); if(ct.includes("guy")) return null; if(ct.includes("primary")) return "pri"; if(ct.includes("neutral")) return "neutral"; if(ct.includes("secondary")||ct.includes("power drop")||ct.includes("service")) return "sec"; return null; },
  commKind(ct){ ct = (ct||"").toLowerCase(); if(/power|primary|secondary|neutral|street ?light|guy/.test(ct)) return null; if(ct.includes("drop")) return "adss"; if(ct.includes("telco")) return "telco"; if(ct.includes("catv")) return "catv"; if(ct.includes("fiber")) return "fiber"; if(ct.includes("com drop")) return "adss"; if(ct.includes("strand")) return "fiber"; return null; },
  // "Frontier West Virginia Inc. (Formerly Verizon) ILEC" -> "Frontier", "Citynet, LLC" -> "Citynet"
  shortCo(c){ c = String(c||"").replace(/\(.*?\)/g,"").split(",")[0].trim(); return c.split(/\s+/)[0] || ""; },
  // the pole tag designers use is the one in the pole note ("Pole Tag:"), not Fielders Information
  poleTag(n){ return String(K.noteFields(n)["pole tag"]||"").trim() || K.tag(n); },
  poleYear(n){
    // Prefer the regular/internal notes, then other note attributes such as MRE_NOTE.
    // Read only the labeled Pole Year field; line designations and other dates are unrelated.
    const attrs = n?.attributes || {};
    const keys = [...new Set(["note", "internal_note", ...Object.keys(attrs).filter(k=>/note/i.test(k))])];
    for(const key of keys){
      const notes = attrs[key];
      for(const value of notes && typeof notes==="object" ? Object.values(notes) : [notes]){
        const fields = K.noteFields({attributes:{note:value}});
        const year = String(fields["pole year"]||"").match(/\b(?:18|19|20)\d{2}\b/);
        if(year) return year[0];
      }
    }
    return "";
  },
  proposedPoleSpec(n, job){
    // Katapult stores this as an attribute (for example, {button_added:"40-4 Southern Pine"}).
    const parse = value => {
      if(value && typeof value==="object"){
        for(const item of Object.values(value)){ const spec = parse(item); if(spec) return spec; }
        return null;
      }
      const m = String(value ?? "").trim().match(/^(\d+)\s*[-\u2013\u2014/]\s*(H?\d+)(?=\s|$)/i);
      return m && Number(m[1])>0 ? {height:m[1], cls:m[2].toUpperCase()} : null;
    };
    for(const [key,value] of Object.entries(n?.attributes||{})){
      if(key.toLowerCase().replace(/[^a-z]/g,"")!=="proposedpolespec") continue;
      const spec = parse(value); if(spec) return spec;
    }
    for(const key of ["note","internal_note"]){
      const fields = K.noteFields({attributes:{note:n?.attributes?.[key]}});
      const spec = parse(fields["proposed pole spec"]); if(spec) return spec;
    }
    // Pole top MR note from the Pole Replacement dialog: "Replace 40' class 6 pole with 45' class 3 pole"
    try{ const pf = job ? K.mainPhoto(job, n) : null;
      for(const pt of Object.values(pf?.pole_top||{})){ const m = String(pt?.mr_note||"").match(/with\s+(\d+)\s*'?\s*(?:ft\.?)?\s*class\s*(H?\d+)/i); if(m) return {height:m[1], cls:m[2].toUpperCase(), fromNote:true}; } }catch(e){}
    return null;
  },
  noteFields(n){ // "Key: value" lines from the pole's note attribute(s)
    const out = {}; const note = n?.attributes?.note; if(!note) return out;
    const vals = typeof note==="object" ? Object.values(note) : [note];
    vals.forEach(v=>String(v||"").split(/\r?\n/).forEach(line=>{ const m = line.match(/^\s*([A-Za-z][A-Za-z \/&#]*?)\s*:\s*(.*\S)?\s*$/); if(m && m[2] && !(m[1].toLowerCase() in out)) out[m[1].toLowerCase()] = m[2]; }));
    return out;
  },
  noteWireSpecs(txt){ // "2 AAAC (E,W) 4 AAAC (NW)" -> [{spec:"2 AAAC",dirs:["E","W"]},{spec:"4 AAAC",dirs:["NW"]}]
    if(!txt) return [];
    const out = []; const re = /([^()]+?)\s*(?:\(([^)]*)\)|$)/g; let m;
    while((m = re.exec(txt)) && m[0]){ const spec = m[1].replace(/^[\s,;&]+|[\s,;&]+$/g,"").replace(/^AND\s+/i,""); if(spec) out.push({spec, dirs:(m[2]||"").toUpperCase().split(/[\s,\/&]+/).filter(Boolean)}); }
    return out;
  },
  compass(a,b){
    if(a?.latitude==null || b?.latitude==null) return "";
    const r = x=>x*Math.PI/180, y = Math.sin(r(b.longitude-a.longitude))*Math.cos(r(b.latitude)), x = Math.cos(r(a.latitude))*Math.sin(r(b.latitude))-Math.sin(r(a.latitude))*Math.cos(r(b.latitude))*Math.cos(r(b.longitude-a.longitude));
    const brg = (Math.atan2(y,x)*180/Math.PI+360)%360;
    return ["N","NE","E","SE","S","SW","W","NW"][Math.round(brg/45)%8];
  },
  cond(spec){
    const s = (spec||"").toUpperCase(); if(!s) return {v:null};
    const size = (s.match(/(#\d+|\d+\/0|\b\d\b)/)||[])[1]; const sz = size ? size.replace("#","") : null;
    if(s.includes("TRIPLEX") || /\bTPX\b/.test(s)){
      if(s.includes("ACSR") && ["4","1/0","4/0"].includes(sz)) return {v:`${sz} ACSR TPX`, exact:true};
      if(["4","1/0","4/0"].includes(sz)) return {v:`${sz} ACSR TPX`, exact:false};
      return {v:null};
    }
    // FE Workflow 411 (11/2026) "Wire specs to use (VDS)": 3-6 Copperweld loads as 6 ACW
    if(s.includes("COPPERWELD") || /\bCW\b|\bCWC\b/.test(s)) return {v:"6 ACW", exact:s.includes("6"), note:"Copperweld loads as 6 ACW (Workflow 411 VDS wire specs)"};
    if(s.includes("DUPLEX")) return {v:null}; if(sz==="4" && s.includes("AAAC")) return {v:"4 ACSR", exact:false};   // 4 AAAC is loaded as 4 ACSR (8-010 conductor match)
    // Workflow 411 step 6: specs larger than 3/0 (4/0, 336, 477, 795…) are entered as 3/0
    const kcmil = parseFloat((s.match(/\b(\d{3}(?:\.\d)?)\b/)||[])[1]);
    if(sz==="4/0" || (kcmil && kcmil>=200)) return {v:"3/0 ACSR", exact:false, big:true};
    if(s.includes("ACSR") && ["4","1/0","3/0"].includes(sz)) return {v:`${sz} ACSR`, exact:true};
    if(s.includes("AAAC") && sz==="2") return {v:"2 AAAC", exact:true};
    // #2 ACSR / #2 AAC have no column: load as 2 AAAC (FE QC, 11/10/26)
    if(sz==="2" && (s.includes("ACSR") || /\bAAC\b/.test(s))) return {v:"2 AAAC", exact:false, note:"#2 ACSR / AAC loads as 2 AAAC"};
    // other aluminum sizes with no column of their own go to the same size's ACSR column (flagged to check)
    if((s.includes("AAAC") || /\bAAC\b/.test(s)) && ["1/0","3/0"].includes(sz)) return {v:`${sz} ACSR`, exact:false};
    if((s.includes("CU")||s.includes("COPPER")) && ["6","4","1"].includes(sz)) return {v:`${sz} CU`, exact:true};
    if(s.includes("ACW") && ["4","6"].includes(sz)) return {v:`${sz} ACW`, exact:true};
    return {v:null};
  },
  env(over){
    const o = (over||"").toLowerCase();
    if(!o) return {v:null};
    if(o.includes("parallel")) return {v: o.includes("unlikely") ? "Unlikely Parallel to Street" : "Parallel to Street", exact:true};
    if(o.includes("driveway")||o.includes("parking")) return {v:"Driveway/Parking Lot", exact:true};
    if(o.includes("pedestrian")||o.includes("sidewalk")||o.includes("yard")) return {v:"Pedestrian", exact:true};
    if(/\brail(\s?(road|way)s?)?\b/.test(o)) return {v:"Railroad", exact:true};   // not "trail" / "guardrail"
    if(/\bfarm|\bagric/.test(o)) return {v:"Farmland", exact:true};
    if(/\brural\b/.test(o)) return {v:"Pedestrian", exact:true};   // Katapult "Rural" = Pedestrian on the sheet (team, 11/3/26); farmland with tractor access is Farmland
    if(/other area/.test(o) && /vehicle/.test(o)) return {v:"Pedestrian", exact:true};   // Katapult "Other Area Traversed by Vehicles" = Pedestrian on the sheet (team, 11/16/26)
    if(/\bfield\b/.test(o)) return {v: /ball\s*field|athletic|sports/.test(o) ? "Pedestrian" : "Farmland", exact:false};
    if(o.includes("water")) return {v:"Water (No Boats)", exact:false};
    if(/non[- ]?dot/.test(o)) return {v:"Non-DOT Road", exact:true};
    if(/\bhighway|\binterstate|\bstate\s*(route|road|rte|hwy|highway)|\bwvdoh\b|\bdot\b|\b(wv|us|i|sr|cr)[\s-]?\d+\b|\broute\s*\d+/.test(o)) return {v:"DOT Road", exact:/\bdot\b|\bwvdoh\b/.test(o)};
    if(o.includes("street")||o.includes("road")||o.includes("alley")) return {v:"Non-DOT Road", exact:false};
    return {v:null};
  },
  build(job, nodeId, base){
    const warn = [], tr = job.traces?.trace_data || {}, nodes = job.nodes||{}, n = nodes[nodeId];
    const S = base; const ft = i => fmt(i);
    S.proposal = String(K.scid(n) || "").replace(/^0+(?=\d)/, "");   /* row 1 is the SCID, as in the worksheet (never the proposal name) */ S.tag = K.poleTag(n) || K.scid(n);
    const nf = K.noteFields(n);
    // red tag: Katapult has no red-tag field, so read it from the tracer notes / attributes / photo tags
    try{
      const rt = nf["red tag"] ?? nf["red-tag"] ?? nf["redtag"];
      if(rt!=null && String(rt).trim()) S.red = /^\s*(y|yes|true|present)/i.test(rt) ? "Y" : /^\s*(n|no|none|false)/i.test(rt) ? "N" : S.red;
      if(!S.red){
        const txt = JSON.stringify(n.attributes||{}) + " " + Object.keys(n.photos||{}).map(id=>JSON.stringify(job.photos?.[id]?.tags||"")).join(" ");
        if(/red[\s_-]?tag(?!\s*:\s*(no|n)\b)/i.test(txt) && !/no\s+red[\s_-]?tag/i.test(txt)){ S.red = "Y"; warn.push("RED TAG mentioned in Katapult for this pole: row 7 set to Yes. Confirm it in the photos (a red-tagged pole fails and gets replaced)."); }
      }
    }catch(e){}
    if(!S.red) S.red = "N"; // red tag is assumed No unless something says otherwise
    const spec = String(K.first(n.attributes?.pole_spec)||""); const pm = spec.match(/^(\d+)\s*-\s*(\w+)/);
    const nhc = (nf["pole height/class"]||"").match(/(\d+)\s*[-\/]\s*(\w+)/);
    const ah = K.first(n.attributes?.pole_height), ac = K.first(n.attributes?.pole_class);
    if(nhc){ S.height = nhc[1]; S.cls = nhc[2]; }
    else if(pm){ S.height = pm[1]; S.cls = pm[2]; }
    else if(ah!=null && ac!=null){ S.height = String(ah); S.cls = String(ac); }
    else warn.push("Pole height/class not found in Katapult; enter by hand.");
    const ld = (nf["line designation"]||"").toUpperCase();
    if(/1961/.test(ld) && /PRE/.test(ld)) S.era = "pre1961";
    else if(/PRE\s*-?\s*1990/.test(ld)) S.era = "pre1990";
    else if(/POST\s*-?\s*1990/.test(ld)) S.era = "post";
    else warn.push("Line designation not in the pole note. Set clearance era from GIS/FE records.");
    if(S.era==="pre1990" && nf["pole year"] && parseInt(nf["pole year"])<1961 && parseInt(nf["pole year"])>1900) warn.push(`Pole year ${nf["pole year"]}: check whether row 4 (Pre-1961) should be Yes.`);
    if(S.red==="N") warn.push("Row 7 (red tag) set to No by default. Change it to Yes if the photos show a red tag.");
    const internalFields = K.noteFields({attributes:{note:n.attributes?.internal_note}});
    const noteSpecs = K.noteWireSpecs(nf["wire spec"] || internalFields["wire spec"]);
    const pf = K.mainPhoto(job, n);
    if(!pf){ warn.push("This pole has no measured photo, so nothing could be filled from it."); return {S, warn}; }
    const pw = K.poleWires(pf);
    // spans
    const conns = Object.values(job.connections||{}).filter(c=>c.node_id_1===nodeId || c.node_id_2===nodeId).map(c=>{
      const oid = c.node_id_1===nodeId ? c.node_id_2 : c.node_id_1, o = nodes[oid] || {};
      let ms = K.midspan(job, c);
      const traces = Object.keys(ms.wires).filter(t=>pw[t]);
      const pk = traces.filter(t=>K.powerKind(tr[t]?.cable_type)); const pr = K.pairMid(ms, pk.length ? pk : traces.filter(t=>K.commKind(tr[t]?.cable_type))); if(pr) ms = pr;
      const len = (o.latitude!=null && n.latitude!=null) ? K.dist(n,o) : null;
      const type = String(K.first(c.attributes?.connection_type)||"");
      const otype = K.nodeType(o);
      const label = otype==="pole" ? `to ${K.scid(o)||K.tag(o)||"pole"}` : otype ? `${otype}${K.addr(o)?" · "+K.addr(o):""}` : type;
      // a "reference" node with a pole tag is a real pole just outside the job (e.g. 001.A), so its span is a main-line span
      const rtype = String(K.first(c.attributes?.reference_type)||"").toLowerCase();
      const isRefPole = otype==="reference" && !!K.tag(o) && !rtype.includes("com") && !rtype.includes("power");
      return {c, o, otype, ms, traces, len, label, isRefPole, isPoleSpan: (otype==="pole" && type.includes("aerial")) || isRefPole};
    }).filter(x=>x.traces.length || x.isPoleSpan);
    const scidNum = x => parseFloat(K.scid(x.o))||0, byScid = (a,b)=> scidNum(a)-scidNum(b) || K.scid(a.o).localeCompare(K.scid(b.o));
    // Before/After: job poles first, then tagged reference poles; the lower SCID is Before
    const mainAll = conns.filter(x=>x.isPoleSpan).sort((a,b)=> (a.isRefPole-b.isRefPole) || byScid(a,b));
    const main = [...mainAll.slice(0,2).sort(byScid), ...mainAll.slice(2)];
    conns.filter(x=>x.otype==="pole" && (!K.tag(x.o) || /^n\/?a$/i.test(K.tag(x.o).trim())) && K.first(x.o.attributes?.proposed_pole_spec) && !K.first(x.o.attributes?.measured_pole_height)).forEach(x=>warn.push(`Span to SCID ${K.scid(x.o)||"?"} ends at a NEW midspan pole. In a before (existing) JSON this hides the original long span and its violation: use a Job JSON exported before the midspan pole was added for the existing column.`));
    const other = conns.filter(x=>!x.isPoleSpan).sort((a,b)=>(a.len||0)-(b.len||0));
    const order = [...main, ...other];
    if(order.length>6) warn.push(`This pole has ${order.length} spans; the sheet holds 6, so the extra ones were left out.`);
    const keys = SPANS.map(s=>s[0]); const keyOf = {}; S.active = [];
    order.slice(0,6).forEach((x,i)=>{
      // pole spans fill Before/After; everything else starts at Other 1
      let k = i<Math.min(2,main.length) ? keys[i] : keys[2 + (i - Math.min(2,main.length))];
      if(main.length===1 && i===0){ const me = parseFloat(K.scid(n))||0, them = scidNum(x); k = (them && me && them < me) ? "B" : "A"; } // one pole span: toward a lower SCID = Before, otherwise After (first pole of a run has no Before span)
      if(!k) return; keyOf[x.c===undefined?i:i] = k; x.key = k; S.active.push(k);
      const sp = S.spans[k] = blankSpan(); sp.label = x.label; sp.toHouse = !x.isPoleSpan && x.otype!=="pole" && !/com/i.test(String(K.first(x.c.attributes?.reference_type)||""));   /* a com reference is the comm line going on, not a service to a house */ sp.to = K.scid(x.o) || ""; sp.cid = Object.keys(job.connections||{}).find(id=>job.connections[id]===x.c)||""; sp.olat = x.o.latitude; sp.olon = x.o.longitude;
      if(x.len!=null) sp.len = String(Math.ceil(x.len - 1e-6));   /* span length always rounds up to the next whole foot */
      if(x.len!=null && x.len>=400) warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): ${Math.ceil(x.len)}' long span (400'+). WV MRE Procedures Manual: for Citynet, Micrologic, HREA, Digcon and Spruce Knob use Katapult's 1% Ice Sag midspan height as the applicant's midspan height; for every other applicant use CS 8-020 (neutral size vs span length, rounded up) for the secondary/neutral-to-comm spacing. The pole also needs loading (400'+ span).`);
      if(x.ms.paired) warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): crosses ${x.ms.overs.join(", ")}. Used the crossing closest to failing: ${fmt(x.ms.paired.h)} over ${x.ms.paired.env}${x.ms.paired.others.length?` (also ${x.ms.paired.others.map(o=>`${fmt(o.h)} over ${o.env}`).join(", ")})`:""}.`);
      else if(x.ms.overs.length>1) warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): crosses ${x.ms.overs.join(", ")}; used the strictest, ${x.ms.env}.`);
      const e = K.env(x.ms.env); if(e.v){ sp.env = e.v; if(!e.exact) warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): Katapult says "${x.ms.env}", set to ${e.v}. Change to DOT Road if it's a state route.`); }
      else if(x.ms.env) warn.push(`${SPANS.find(s=>s[0]===k)[1]}: environment "${x.ms.env}" didn't match the sheet list; pick it by hand.`);
      else warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): no midspan measurement in Katapult.`);
      // lowest power
      const pow = x.traces.map(t=>({t, kind:K.powerKind(tr[t]?.cable_type), h:pw[t].h, mid:x.ms.wires[t], spec:pw[t].spec})).filter(p=>p.kind);
      if(pow.length){
        const low = pow.reduce((a,b)=>b.h<a.h?b:a); sp.lowTrace = low.t; sp.powTraces = pow.map(p=>({t:p.t, h:p.h, mid:p.mid??null, kind:p.kind})); sp.oid = x.c.node_id_1===nodeId ? x.c.node_id_2 : x.c.node_id_1;
        sp.pole = ft(low.h); sp.ptype = low.kind;
        const mids = pow.map(p=>p.mid).filter(v=>v!=null); if(mids.length) sp.mid = ft(Math.min(...mids));
        if(!low.spec && typeof specOfTrace==="function") low.spec = specOfTrace(low.t) || ""; let c = K.cond(low.spec);
        if(c.v && noteSpecs.length && !sp.toHouse && low.kind!=="sec" && !noteSpecs.some(s=>K.cond(s.spec).v===c.v)){ const nc = K.cond(noteSpecs[0].spec).v; if(nc) warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): Katapult traces the lowest power as ${low.spec} (sheet column ${c.v}) but the pole note's Wire Spec says ${noteSpecs.map(s=>s.spec).join(' / ')} (column ${nc}). The comm clearance tables change with it: confirm which one is on the pole.`); }
        if(!c.v && noteSpecs.length){
          // photo has no wire spec: use the pole note's "Wire Spec", matched to this span's direction when the note splits it
          const dir = K.compass(n, x.o);
          const DEG = {N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5};
          const brg = (()=>{ const r = v=>v*Math.PI/180, o = x.o; if(o?.latitude==null) return null; const yy = Math.sin(r(o.longitude-n.longitude))*Math.cos(r(o.latitude)), xx = Math.cos(r(n.latitude))*Math.sin(r(o.latitude))-Math.sin(r(n.latitude))*Math.cos(r(o.latitude))*Math.cos(r(o.longitude-n.longitude)); return (Math.atan2(yy,xx)*180/Math.PI+360)%360; })();
          const off = s => { const ds = s.dirs.filter(d=>DEG[d]!=null); if(brg==null || !ds.length) return 999; return Math.min(...ds.map(d=>{ let q = Math.abs(DEG[d]-brg)%360; return q>180?360-q:q; })); };
          const ranked = noteSpecs.filter(s=>s.dirs.length).sort((p,q)=>off(p)-off(q));
          const hit = (ranked[0] && off(ranked[0])<=67.5 ? ranked[0] : null) || noteSpecs.find(s=>s.dirs.includes(dir)) || noteSpecs.find(s=>!s.dirs.length) || noteSpecs[0];
          low.spec = hit.spec; c = K.cond(hit.spec);
          if(noteSpecs.length>1 && !hit.dirs.length) warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): note lists more than one wire spec; used ${hit.spec}. Check it.`);
          else if(noteSpecs.length>1 && hit.dirs.length && off(hit)>22.5) warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): span heads ${dir}, which the note's wire specs don't list; used ${hit.spec}. Check it.`);
        }
        // FE Workflow 411 (11/2026) "Wire specs to use (VDS)": service drop = 4 AAAC Triplex (4 ACSR TPX column), pole-to-pole secondary = 1/0 ACSR Triplex
        if(!c.v && low.kind==="sec"){ const drop = sp.toHouse || /power drop|service/i.test(String(tr[low.t]?.cable_type||"")); c = {v: drop ? "4 ACSR TPX" : "1/0 ACSR TPX", exact:false}; warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): no usable secondary size ("${low.spec||"none"}"), loaded as ${drop ? "a service drop, 4 AAAC Triplex (4 ACSR TPX column)" : "pole-to-pole secondary, 1/0 ACSR Triplex"} per the 411 VDS wire specs. Check it.`); }
        if(c.v){ sp.cond = c.v; if(c.big) warn.push(`${SPANS.find(s=>s[0]===k)[1]}: conductor "${low.spec}" is larger than 3/0, entered as 3/0 per the workflow.`); else if(!c.exact) warn.push(`${SPANS.find(s=>s[0]===k)[1]}: conductor "${low.spec}" set to the closest table column, ${c.v}. Check it.`); }
        else warn.push(`${SPANS.find(s=>s[0]===k)[1]}: conductor "${low.spec||"unknown"}" isn't a column in the sheet's tables; pick one by hand.`);
      } else warn.push(`${SPANS.find(s=>s[0]===k)[1]} (${x.label}): no power in this span; comm ground clearance is still checked.`);
    });
    if(!S.active.length) S.active = ["B","A"];
    S.active = SPANS.map(s=>s[0]).filter(k=>S.active.includes(k));
    // comms
    const commTraces = Object.keys(pw).filter(t=>K.commKind(tr[t]?.cable_type));
    const existing = commTraces.filter(t=>!tr[t]?.proposed).sort((a,b)=>pw[b].h-pw[a].h);
    const proposed = commTraces.filter(t=>tr[t]?.proposed);
    // comm drops load as their own ADSS row (Telco loads as Copper, CATV/Fiber as Fiber Optic); one row per company,
    // one drop per span, and drops in the same span load as the lowest one
    const isDrop = t => K.commKind(tr[t]?.cable_type)==="adss";
    const spansOf = t => order.slice(0,6).filter(x=>x.key && x.ms.wires[t]!=null);
    const coOf = t => K.shortCo(tr[t].company) || tr[t].cable_type;
    const rows = [];
    existing.filter(t=>!isDrop(t)).forEach(t=>{
      const a = {trace:t, name:coOf(t), type:K.commKind(tr[t].cable_type), vals:{}};
      spansOf(t).forEach(x=>{ a.vals[x.key] = {pole: ft(pw[t].h), mid: ft(x.ms.wires[t]), sag:"", trace:t}; });
      if(!Object.keys(a.vals).length) order.slice(0,6).forEach(x=>{ if(x.key && x.isPoleSpan) a.vals[x.key] = {pole: ft(pw[t].h), mid:"", sag:"", trace:t}; });
      if(tr[t].cable_type?.toLowerCase().includes("strand")) warn.push(`${a.name}: strand only, treated as Fiber.`);
      rows.push(a);
    });
    const drops = existing.filter(isDrop).sort((p,q)=>pw[p].h-pw[q].h);
    drops.forEach(t=>{
      const xs = spansOf(t); if(!xs.length) return;
      const co = coOf(t); let a = rows.find(r=>r.drop && r.name===co);
      if(!a){ a = {trace:t, name:co, type:"adss", drop:true, vals:{}}; rows.push(a); }
      // the lowest drop in the span wins; drops tied at the pole (same bolt) load the one with the lowest midspan
      xs.forEach(x=>{ const cur = a.vals[x.key], h = pw[t].h, m = x.ms.wires[t];
        const curH = cur ? pw[cur.trace]?.h : null, curM = cur ? x.ms.wires[cur.trace] : null;
        if(!cur || h < curH - 0.5 || (Math.abs(h - curH) <= 0.5 && m != null && (curM == null || m < curM))) a.vals[x.key] = {pole: ft(h), mid: ft(m), sag:"", trace:t}; });
    });
    if(drops.length) warn.push(`${drops.length} comm drop${drops.length>1?"s":""} loaded as ADSS (${[...new Set(drops.map(coOf))].join(", ")}); each company's drops share one row.`);
    const topH = a => Math.max(-1, ...Object.values(a.vals).map(v=>parseFt(v.pole)).filter(v=>v!=null && !isNaN(v)));
    rows.sort((p,q)=>topH(q)-topH(p));
    if(rows.length>5) warn.push(`${rows.length} comm rows on this pole; the sheet holds 5, so the lowest ${rows.length-5} were left out.`);
    S.atts = rows.slice(0,5);
    // proposed
    S.prop = {name:"", type:"fiber", height:"", spans:{}}; SPANS.forEach(([k])=>S.prop.spans[k] = {in:false, mid:""});
    if(proposed.length){
      const t = proposed[0];
      S.prop.name = K.shortCo(tr[t].company); S.prop.trace = t; S.prop.type = K.commKind(tr[t].cable_type) || "fiber"; if(specsOfTrace(t).some(s=>/adss/i.test(s))) S.prop.type = "adss"; // team enters a 12 ct Citynet ADSS (0.25") proposed as ADSS

      order.slice(0,6).forEach(x=>{ if(!x.key) return; const m = x.ms.wires[t]; if(m!=null){ S.prop.spans[x.key] = {in:true, mid: ft(m)}; } });
      if(!Object.values(S.prop.spans).some(s=>s.in)) ["B","A"].forEach(k=>{ if(S.active.includes(k)) S.prop.spans[k].in = true; });
      if(proposed.length>1) warn.push(`More than one proposed cable on this pole; used ${S.prop.name}.`);
    } else { warn.push("No proposed attachment marked on this pole."); ["B","A"].forEach(k=>{ if(S.active.includes(k)) S.prop.spans[k].in = true; }); }
    const mr = Object.keys(pw).filter(t=>pw[t].mr); if(mr.length) warn.push(`Katapult has MR View moves on ${mr.length} wire(s). This column uses existing heights; + After MR column applies the moves.`);
    S.notes = "";
    return {S, warn};
  }
};

const PW_CACHE = new WeakMap();
/* ---------- FE Distribution Construction Standards (spec book, 2022 ed. with 2023–26 revisions) ----------
   Geometry read off the drawings, in inches below the POLE TOP. neutRef = where the CS 8-010 primary-to-neutral
   spacing is measured from (the pin top for pole-top pins, else the lowest primary bolt / crossarm / brace / tap shown).
   page = page in FE_Construction_Standards_SPEC_Book.pdf. */
const SPECBOOK = {
  "8-010":  {page:196, title:"Span length limits / primary-to-secondary spacing (60\" 15 kV, 63\" 25 kV, 66\" 35 kV new construction; 42\" grandfathered only)"},
  "8-020":  {page:198, title:"Secondary/neutral-to-communication bolt-to-bolt spacing (fiber), rev 06/26 — replaces 8-010.1 on the newer drawings"},
  "8-020.2":{page:199, title:"Secondary/neutral-to-copper communication bolt-to-bolt spacing, rev 07/26"},
  "8-105": {page:203, ph:1, title:"1Ø single/double pole top pin, 15 kV", prim:[0], neutRef:0, guy:null, use:"tangent or light angle on pole-top pin(s)"},
  "8-110": {page:204, ph:1, title:"1Ø suspension clamp, heavy angles to 60°, 15 kV", prim:[8], neutRef:8, guy:24, use:"running angle / suspension"},
  "8-115": {page:205, ph:1, title:"1Ø corner dead end, angles over 60°, 15 kV", prim:[8,16], neutRef:8, guy:null, use:"two dead ends turning more than 60°"},
  "8-120": {page:206, ph:1, title:"1Ø dead end, 15 kV", prim:[8,20], neutRef:20, guy:null, use:"line ends at the pole"},
  "8-125": {page:207, ph:1, title:"1Ø tangent with 1Ø unfused tap, 15 kV", prim:[0,8], neutRef:8, guy:24, use:"pole-top pin through line + a dead-ended tap"},
  "8-205": {page:208, ph:3, title:"3Ø single pin tangent-to-light angle, 8 ft crossarm, 15 kV", prim:[0,12], arm:12, neutRef:12, use:"crossarm with pin insulators (single arm)"},
  "8-207": {page:209, ph:3, title:"3Ø single/double pin tangent-to-medium angle, alley arm, 15 kV", prim:[0,12], arm:12, neutRef:12, use:"alley arm", check:true},
  "8-210": {page:210, ph:3, title:"3Ø double pin tangent-to-medium line angle, 15 kV", prim:[0,16], arm:16, neutRef:34, use:"double crossarm with pins (60\" is from the arm brace bolt, 18\" below the arm)"},
  "8-212": {page:211, ph:3, title:"3Ø double dead end, line angle to 60°, double crossarm, 15 kV", prim:[8], arm:8, neutRef:8, use:"dead ends both ways on a double arm, angle 60° or less"},
  "8-215": {page:212, ph:3, title:"3Ø corner dead end, line angle 60°–90°, crossarm, 15 kV", prim:[8,44], arm:8, neutRef:44, use:"corner: arm at 8\", second dead-end set 36\" below it"},
  "8-220": {page:213, ph:3, title:"3Ø dead end, 8 ft crossarm, 15 kV", prim:[13], arm:13, neutRef:13, use:"3Ø line ends at the pole"},
  "8-225": {page:214, ph:0, title:"1Ø & 3Ø unequal tensions or double dead end, 15 kV", prim:[8], arm:8, neutRef:8, neutRef3:26, use:"double dead end insulators (unequal tension)", check:true},
  "8-235": {page:215, ph:3, title:"3Ø tangent with 1Ø unfused tap, crossarm, 15 kV", prim:[0,8,40], arm:8, neutRef:40, use:"crossarm through line + 1Ø tap dead-ended 32\" below the arm"},
  "8-236": {page:216, ph:3, title:"3Ø tangent with 3Ø unfused tap, 15 kV", prim:[0,12,48], arm:12, neutRef:48, use:"crossarm through line + 3Ø tap on a second arm 36\" below"},
  "8-405": {page:224, ph:3, title:"3Ø tangent-to-10° line angle, 10 ft crossarm (underbuild), 15 kV: arm at least 6 ft below the lowest crossarm of the higher-voltage circuit (CS 17)", prim:[0], arm:0, neutRef:0, use:"distribution underbuild under a higher-voltage circuit", check:true},
  "8-410": {page:225, ph:3, title:"3Ø double pin, tangent-to-medium angle, 10 ft double crossarm (underbuild), 15 kV", prim:[0], arm:0, neutRef:0, use:"underbuild, double arm", check:true},
  "8-435": {page:226, ph:3, title:"3Ø tangent with 1Ø unfused tap, 10 ft crossarm (underbuild), 15 kV", prim:[0], arm:0, neutRef:0, use:"underbuild with a 1Ø tap", check:true},
  "8-436": {page:227, ph:3, title:"3Ø tangent with 3Ø unfused tap, 10 ft crossarm (underbuild), 15 kV: tap dead ends 36\" below the arm, neutral 60\" below the tap, 30\" to the down guy", prim:[0,36], arm:0, neutRef:36, use:"underbuild with a 3Ø tap; team pick for stacked crossarms with a wire change (10-29)", check:true},
  "11-115":{page:315, title:"1Ø conventional transformer, wye primary: cutout 24\" (15 kV) / 40\" (25–35 kV) below the lowest primary, transformer bolt 36\" / 45\" below the cutout, neutral 44\" (≤50 kVA) / 60\" (75–167 kVA) below the bolt"},
  "11-116":{page:316, title:"Extra secondary height for a 1Ø transformer (only when adding a transformer per 11-115 would force a pole replacement)"},
  "11-130":{page:318, title:"Three 1Ø transformer bank, 208Y/120 or 480Y/277 V: cutout arm 24\" (15 kV) / 40\" below the lowest arm, transformer bolt 48\" / 58\" below, neutral 44\"/60\""},
  "11-135":{page:319, title:"Three 1Ø transformer bank, closed wye-delta, 240 V 3-wire & 240/120 V 4-wire: cutout arm 24\" below the lowest arm, transformer bolt 48\" below, neutral 44\"/60\""},
  "12-010":{page:335, title:"Line sectionalizing: 1Ø cutouts or 300 A disconnects"},
  "12-410":{page:371, title:"Fused 1Ø tap: tap 28\" min below the pole top (1Ø lead) or 35\" below the crossarm (3Ø, 15/25 kV); neutral 42\" (15 kV) min below the tap"},
  "16-100":{page:474, title:"Luminaire brackets, wood pole: bracket thru-bolt 5.5'–9.5' below the lowest primary by arm length; mounting heights 25.5' (≤100 W HID / ≤50 W LED, 2.5' arm) to 33.5'; comms 4\" from a grounded bracket (the team uses 12\")"},
  "16-150":{page:475, title:"Floodlight installation, wood pole"},
};
K.specbook = SPECBOOK;
// what's on the pole, read straight from the Katapult photo + spans (the VDS Notes use this)
K.features = function(job, nodeId){
  const n = job.nodes?.[nodeId], pf = n && K.mainPhoto(job, n); const tr = job.traces?.trace_data || {};
  const f = {prims:[], xfmr:0, xfmrSpec:"", light:false, flood:false, cutout:0, kv:15, note:Object.values(n?.attributes?.note||{}).join("\n")};
  if(!pf) return f;
  const isPri = t => /primary/i.test(tr[t]?.cable_type||"");
  const addIns = (ins, arm) => Object.values(ins?._children?.wire||{}).forEach(w=>{ if(w?._trace && isPri(w._trace)) f.prims.push({trace:w._trace, ins:String(ins.insulator_spec||""), arm: arm ? String(arm.arm_spec||"crossarm") : "", h: ins._measured_height ?? arm?._measured_height ?? null}); });
  Object.values(pf.insulator||{}).forEach(i=>addIns(i, null));
  Object.values(pf.arm||{}).forEach(a=>Object.values(a?._children?.insulator||{}).forEach(i=>addIns(i, a)));
  Object.values(pf.wire||{}).forEach(w=>{ if(w?._trace && isPri(w._trace) && !f.prims.some(p=>p.trace===w._trace)) f.prims.push({trace:w._trace, ins:"", arm:"", h:w._measured_height ?? null}); });
  for(const e of Object.values(pf.equipment||{})){ const t = e.equipment_type||"";
    if(t==="transformer" && e.measurement_of!=="bottom_of_equipment"){ f.xfmr++; f.xfmrSpec += " " + (e.transformer_spec||""); }
    if(t==="street_light"){ f.light = true; if(/flood/i.test(e.street_light_spec||"")) f.flood = true; }
    if(t==="cutout_arrestor") f.cutout++; }
  // cutouts on a crossarm (a transformer bank's cutout arm) sit under the arm in the photo
  Object.values(pf.arm||{}).forEach(a=>Object.values(a?._children?.equipment||{}).forEach(e=>{ if(e?.equipment_type==="cutout_arrestor") f.cutout++; }));
  // kVA: the TX note ("TX Size & Serial #: 3-75KVA") is per transformer; otherwise the largest kVA in the specs
  { const m = /TX Size[^:]*:\s*(\d)\s*[-xX×]\s*(\d+(?:\.\d+)?)\s*KVA/i.exec(f.note||""), ks = (f.xfmrSpec.match(/(\d+(?:\.\d+)?)\s*kVA/gi)||[]).map(x=>parseFloat(x));
    f.txCount = m ? +m[1] : f.xfmr; f.kva = m ? parseFloat(m[2]) : (ks.length ? Math.max(...ks) : null); }
  f.kv = Math.max(15, ...f.prims.map(p=>parseFloat((p.ins.match(/(\d+(?:\.\d+)?)\s*kV/i)||[])[1])||0));
  // direction of each primary trace out of the pole (bearing to the other end of each span it's in)
  const brg = (a,b) => { const r = Math.PI/180, y = Math.sin((b.longitude-a.longitude)*r)*Math.cos(b.latitude*r), x = Math.cos(a.latitude*r)*Math.sin(b.latitude*r)-Math.sin(a.latitude*r)*Math.cos(b.latitude*r)*Math.cos((b.longitude-a.longitude)*r); return (Math.atan2(y,x)/r+360)%360; };
  const dirs = {};
  for(const c of Object.values(job.connections||{})){ if(c.node_id_1!==nodeId && c.node_id_2!==nodeId) continue; const o = job.nodes?.[c.node_id_1===nodeId ? c.node_id_2 : c.node_id_1]; if(!o || o.latitude==null || n.latitude==null) continue;
    let ts = []; try{ ts = Object.keys(K.midspan(job, c).wires); }catch(e){}
    if(!ts.length){ try{ ts = Object.keys(polePW(job, c.node_id_1===nodeId ? c.node_id_2 : c.node_id_1)); }catch(e){} }
    const b = brg(n, o); ts.filter(isPri).forEach(t=>(dirs[t] = dirs[t] || []).push(b)); }
  f.prims.forEach(p=>p.dirs = dirs[p.trace] || []);
  return f;
};
// pick the framing / transformer / light standards for the pole from what's on it
K.framing = function(f){
  const why = [], check = [], ins = f.prims.map(p=>p.ins.toLowerCase());
  const has = re => f.prims.some(p=>re.test(p.ins.toLowerCase()));
  const onArm = f.prims.filter(p=>p.arm), offArm = f.prims.filter(p=>!p.arm);
  const traces = [...new Set(f.prims.map(p=>p.trace))];
  const ph3 = onArm.length > 0 || /three|3\s*-?\s*ph/i.test(f.xfmrSpec) || /TX Size[^:]*:\s*3\s*-/i.test(f.note||"") || f.xfmr >= 2;
  const ang = (a,b) => { let d = Math.abs(a-b)%360; if(d>180) d = 360-d; return 180-d; };   // line angle between two directions out of the pole
  // the distinct directions the primary leaves the pole in (spans within 20° count as one direction)
  const dirsAll = []; f.prims.flatMap(p=>p.dirs).forEach(d=>{ if(!dirsAll.some(x=>{ let q = Math.abs(x-d)%360; if(q>180) q = 360-q; return q < 20; })) dirsAll.push(d); });
  const nDir = dirsAll.length;
  const lineAngle = nDir === 2 ? ang(dirsAll[0], dirsAll[1]) : null;   // 0° = straight through
  let key = null;
  if(!f.prims.length){ return {phase:0, key:null, specs:[], secOnly:true, why:["no primary on the pole: secondary-only standard, no rebuild spec"], check}; }
  if(f.kv > 15){ check.push(`${f.kv} kV insulators: 22.86/34.5 kV construction is Section 9 (9-xxx), not the 15 kV 8-xxx drawings`); }
  const DE = /dead ?end/, PIN = /pole top|pin/, RA = /running angle|suspension/, DDE = /double dead ?end/;
  if(!ph3){
    if(has(RA)){ key = "8-110"; why.push("running angle / suspension insulator"); }
    else if(has(PIN) && has(DE)){ key = "8-125"; why.push("pole-top pin through line with a dead-ended tap"); }
    else if(has(DDE)){ key = "8-225"; why.push("double dead end insulator (unequal tension)"); }
    else if(has(DE)){ const n = f.prims.filter(p=>DE.test(p.ins.toLowerCase())).length;
      if(n <= 1 || nDir === 1){ key = "8-120"; why.push("dead end: the line ends here"); }
      else if(lineAngle != null && lineAngle > 60){ key = "8-115"; why.push(`dead ends turning ${Math.round(lineAngle)}° (over 60°)`); }
      else { key = "8-225"; why.push(lineAngle != null ? `dead ends both ways, ${Math.round(lineAngle)}° line angle` : "dead ends both ways"); } }
    else if(has(PIN) || !ins.some(Boolean)){ key = "8-105"; why.push(has(PIN) ? "pole-top pin" : "primary with no insulator traced: assumed pole-top pin"); if(!has(PIN)) check.push("no primary insulator traced; check the framing in the photo"); }
  } else {
    const dbl = onArm.some(p=>/double/i.test(p.arm));
    if(nDir > 2) check.push(`primary leaves in ${nDir} directions: a tap or junction; check the framing`);
    const armHs = [...new Set(onArm.map(p=>Math.round((p.h||0)/6)))];
    if(armHs.length >= 2) check.push(`${armHs.length} crossarms at different heights: the 8-5xx drawings are two circuits side by side, not a stacked 3Ø; for stacked arms / a wire change look at the 8-4xx underbuild drawings (one team read is 8-436, 10-29) and confirm with a lead`);
    const armDE = onArm.some(p=>DE.test(p.ins.toLowerCase())), armPin = onArm.some(p=>PIN.test(p.ins.toLowerCase())) || f.prims.some(p=>/pole top/.test(p.ins.toLowerCase()));
    const tapDE = offArm.filter(p=>DE.test(p.ins.toLowerCase()));
    if(armPin && tapDE.length){ key = new Set(tapDE.map(p=>p.trace)).size >= 3 ? "8-236" : "8-235"; why.push(`crossarm through line with a ${key==="8-236"?"3Ø":"1Ø"} dead-ended tap`); }
    else if(armPin && !armDE){ key = dbl ? "8-210" : "8-205"; why.push(dbl ? "double crossarm with pins" : "single crossarm with pins"); }
    else if(has(DDE)){ key = "8-225"; why.push("double dead end insulators (unequal tension)"); }
    else if(armDE){ const dirs = new Set(onArm.filter(p=>DE.test(p.ins.toLowerCase())).flatMap(p=>p.dirs.map(d=>Math.round(d/20))));
      if(nDir <= 1){ key = "8-220"; why.push("crossarm dead end: the line ends here"); }
      else if(lineAngle != null && lineAngle > 60){ key = "8-215"; why.push(`corner dead end, ${Math.round(lineAngle)}°`); }
      else { key = "8-212"; why.push(`double crossarm dead ends${lineAngle!=null?`, ${Math.round(lineAngle)}° line angle`:""}`); } }
    else { key = "8-205"; why.push("3Ø with no arm insulators traced: assumed 8-205"); check.push("3Ø framing not traced on a crossarm; check the photo"); }
    if(!onArm.length) check.push("read as 3Ø from the transformer/TX note, but no crossarm is traced");
  }
  const specs = [key];
  if(!ph3 && key === "8-110" && has(DE) && nDir > 2){ specs.push("8-125"); why.push("plus a dead-ended tap (8-125)"); check.push("running angle with a tap: 8-110 + 8-125 is a reading, confirm with a lead"); }
  if(f.xfmr){ if(ph3 && (f.xfmr >= 2 || /three|3\s*-?\s*ph/i.test(f.xfmrSpec) || /TX Size[^:]*:\s*3\s*-/i.test(f.note||""))){ specs.push("11-135"); check.push("transformer bank: 11-135 is closed wye-delta (240 V 3-wire / 240/120 V 4-wire); use 11-130 for 208Y/120 or 480Y/277 V services"); }
    else specs.push("11-115"); }
  if(f.light) specs.push(f.flood ? "16-150" : "16-100");
  const sb = SPECBOOK[key] || {};
  const neutRef = ph3 && sb.neutRef3 != null ? sb.neutRef3 : (sb.neutRef ?? 0);
  return {phase: ph3 ? 3 : 1, nDir, key, specs, neutRef, prim: sb.prim || [0], arm: sb.arm ?? null, guy: sb.guy ?? null, lineAngle, kv:f.kv, why, check: check.concat(sb.check ? [`${key}: read from the drawing, confirm the dimensions`] : [])};
};

function polePW(job, nodeId){   // {trace:{h, mr}} at a pole, from a job export
  if(!job || !nodeId || !job.nodes?.[nodeId]) return {};
  let m = PW_CACHE.get(job); if(!m) PW_CACHE.set(job, m = {});
  if(m[nodeId]) return m[nodeId];
  let out = {}; try{ const pf = K.mainPhoto(job, job.nodes[nodeId]); if(pf) out = K.poleWires(pf); }catch(e){ console.error(e); }
  return m[nodeId] = out;
}
const mrOf = w => { const v = parseFloat(w?.mr); return isFinite(v) ? v : 0; };
// After MR column = copy of the existing (determination) column with new heights.
// job = JOB: existing heights + Katapult MR View moves; job = the after JSON: its heights + its moves; job = null: plain copy.
function afterCol(src, job, hooks){   // hooks (optional): {move(t), other(k,t), spec:{height,cls}} to apply a designed layout instead of Katapult MR moves
  const R = compute(src), nc = JSON.parse(JSON.stringify(src));
  const baseName = String(src.proposal||"").replace(/\s*(·\s*MR|\bMR|\((replacement|after MR)\))\s*$/i,"");
  nc.proposal = baseName + " MR";   /* 411: "Scid # MR" */
  Object.assign(nc, {twin:false, pair:false, after:true, plan:false, fromAfter: !!job && job!==JOB, design:"", warn:[], over:{3:R.E.v3}, baseEra:R.E.v3, baseHeight:src.height, mrCount:0});
  if(R.E.v4) nc.over[4] = R.E.v4;
  // 411 step 8 / WV manual: on a pre-1990 line anything failing loads Pre-1990, and Pre-1990 holds until the pole is replaced
  // (comm moves and power raises included). The sheet rows alone can miss a pole-wide failure (e.g. a comm 44" from the neutral).
  if(R.E.v3==="Post-1990" && !src.over?.[3] && (src.line==="pre1990" || src.line==="pre1961")){ const keepS = S; try{ if(violationsOf(src, "").list.length){ nc.over[3] = "Pre-1990"; nc.baseEra = "Pre-1990"; const yr = parseInt(src.poleYear); nc.over[4] = (src.line==="pre1961" || (yr>1900 && yr<1961)) ? "Yes" : "No"; } }catch(e){} S = keepS; }
  if(!job || !src.node) return nc;
  const abs = job!==JOB, pw = polePW(job, src.node), moved = new Set();
  const oth = k => polePW(job, nc.spans[k]?.oid);
  const midsCache = {};
  const mids = k => midsCache[k] ||= (()=>{ const c = job.connections?.[nc.spans[k]?.cid]; try{ if(!c) return {}; const ms = K.midspan(job, c), P = (nc.spans[k]?.powTraces||[]).map(p=>p.t), pr = P.length ? K.pairMid(ms, P) : null; return (pr||ms).wires; }catch(e){ return {}; } })();
  const mv = t => hooks ? (+hooks.move(t)||0) : mrOf(pw[t]), omv = (k,t) => hooks ? (+hooks.other(k,t)||0) : mrOf(oth(k)[t]);
  const newPole = (t, old) => { const w = pw[t]; if(mv(t)) moved.add(t); if(abs && w && w.h!=null) return w.h + mv(t); return old!=null && !isNaN(old) ? old + mv(t) : null; };
  const unitsCache = {};
  const unitsOf = k => unitsCache[k] ||= (()=>{ const c = job.connections?.[nc.spans[k]?.cid]; try{ if(!c) return null; const ms = K.midspan(job, c), P = (nc.spans[k]?.powTraces||[]).map(p=>p.t);
    const pr = P.length ? K.pairMid(ms, P) : null;   // several environments under the span: power uses the photo over the controlling ground
    return {units: ms.units||[], here1: c.node_id_1 === src.node, pairEnv: pr ? pr.env : null, P}; }catch(e){ return null; } })();
  // Katapult MR View moves each midspan photo by where it sits in the span: move here × (share of the span from the far end) + move at the far end × (the rest).
  // The lowest result over the span's photos goes on the sheet. Falls back to the ½ rule (1' at the pole ≈ 6" at midspan) when the photo has no position.
  const secMid = (t, k) => { const U = unitsOf(k); if(!U) return null; let best = null;
    for(const u of U.units){ const h = u.wires[t]; if(h==null || u.f1==null) continue; if(!nc.spans[k]?.unitEnv && U.pairEnv && U.P.includes(t) && u.env !== U.pairEnv) continue; if(nc.spans[k]?.unitEnv && u.env !== nc.spans[k].unitEnv) continue; const share = U.here1 ? 1 - u.f1 : u.f1, v = h + Math.round(mv(t)*share) + Math.round(omv(k,t)*(1-share)); /* Katapult rounds each pole's share of the move to a whole inch (MR view: [-4"]) (11/20) */ if(best==null || v < best) best = v; }
    return best; };
  // A span the WV layers pinned to one midspan photo (unitEnv, the photo over the road): the existing column shows that photo's
  // heights for the power and the comms alike, so the After MR column moves that same photo's heights (11/16: the power came
  // from a different photo than the comms, which read as a comm above the power at midspan).
  const unitBase = (t, k) => { const ue = nc.spans[k]?.unitEnv, U = ue ? unitsOf(k) : null; if(!U) return null; let b = null;
    for(const u of U.units){ const h = u.wires[t]; if(h==null || u.env !== ue) continue; if(b==null || h < b) b = h; } return b; };
  const newMid = (t, k, old) => { const d = (mv(t) + omv(k,t)) / 2; if(omv(k,t)) moved.add(t);
    const ub = unitBase(t, k);
    if(job && src.node && (abs || (old!=null && mids(k)[t]!=null && Math.abs(old - mids(k)[t]) <= 0.5) || (old!=null && ub!=null && Math.abs(old - ub) <= 0.5))){ const s = secMid(t, k); if(s!=null) return s; }
    const m = abs && mids(k)[t]!=null ? mids(k)[t] : old; return m!=null && !isNaN(m) ? m + d : null; };
  nc.atts.forEach(a=>KEYS.forEach(k=>{ const v = a.vals[k]; if(!v) return; const t = v.trace || a.trace; if(!t) return;
    const p = newPole(t, parseFt(v.pole)); if(p!=null) v.pole = fmt(p);
    const m = newMid(t, k, parseFt(v.mid)); if(m!=null) v.mid = fmt(m); }));
  KEYS.forEach(k=>{ const sp = nc.spans[k], P = sp.powTraces;
    if(P && P.length){
      const np = P.map(p=>{ const h = newPole(p.t, p.h) ?? p.h, nm = newMid(p.t, k, p.mid), ub = unitBase(p.t, k);
        if(ub==null) return {...p, h, mid: nm, was: p.mid};
        return {...p, h, mid: secMid(p.t, k) ?? ub + (mv(p.t) + omv(k, p.t)) / 2, was: ub}; });   // the pinned photo's height, moved
      // Lowest power after the make-ready. When the existing lowest is a neutral / secondary, it stays among the neutrals and
      // secondaries: on a replaced pole the neutral is raised in Katapult but the primary usually isn't given a move, and the
      // old primary height then read as the lowest power (11/16, checked against a team worksheet).
      const low0 = P.reduce((a,b)=>b.h<a.h?b:a), pool = low0.kind!=="pri" && np.some(p=>p.kind!=="pri") ? np.filter(p=>p.kind!=="pri") : np;
      const low = pool.reduce((a,b)=>b.h<a.h?b:a);
      if(np.some((p,i)=>p.h!==P[i].h || p.mid!==p.was)){ sp.pole = fmt(low.h); sp.ptype = low.kind; sp.lowTrace = low.t; const ms = np.map(p=>p.mid).filter(v=>v!=null); if(ms.length) sp.mid = fmt(Math.min(...ms)); }
    } else if(sp.lowTrace){
      const p = newPole(sp.lowTrace, parseFt(sp.pole)); if(p!=null) sp.pole = fmt(p);
      const m = newMid(sp.lowTrace, k, parseFt(sp.mid)); if(m!=null) sp.mid = fmt(m);
    }
  });
  if(nc.prop?.trace){ const t = nc.prop.trace, p = newPole(t, parseFt(nc.prop.height)); if(p!=null) nc.prop.height = fmt(p);
    KEYS.forEach(k=>{ const ps = nc.prop.spans[k]; if(!ps?.in) return; const m = newMid(t, k, parseFt(ps.mid)); if(m!=null) ps.mid = fmt(m); }); }
  // An explicit proposed pole spec (Katapult "proposed_pole_spec" or the note's "Proposed Pole Spec") = replacement → Post-1990
  const proposed = hooks && ("spec" in hooks) ? hooks.spec : K.proposedPoleSpec(job.nodes?.[src.node], job);
  if(proposed){ nc.height = proposed.height; nc.cls = proposed.cls; nc.over[3] = "Post-1990"; nc.over[4] = ""; nc.baseEra = "Post-1990"; nc.repl = true; }
  else if(abs){ try{ const a = K.build(job, src.node, blankCol()).S; if(a.height && String(a.height)!==String(src.height)){ nc.height = a.height; nc.cls = a.cls; nc.over[3] = "Post-1990"; nc.repl = true; } }catch(e){} }
  // FE Workflow 411 (11/2026) step 17: a make-ready column (replacement or not) is titled "Scid # MR" (was "SCID (replacement)", team layout 10-28)
  if(nc.repl) nc.proposal = baseName + " MR";
  nc.mrCount = moved.size;
  // for the pole-wide check in violationsOf: every wire's height on the pole after the make-ready, and the drip loops / risers
  // Katapult gave their own move (or the after JSON a new height). mrFollow: a designed layout (hooks), where they follow the power.
  try{ nc.mrH = {}; Object.entries(pw).forEach(([t,w])=>{ if(w && typeof w.h==="number") nc.mrH[t] = w.h + mv(t); });
    nc.mrEq = {}; nc.mrFollow = !!hooks;
    if(!hooks){ const pfA = K.mainPhoto(job, job.nodes[src.node]) || {}, n0 = abs ? JOB?.nodes?.[src.node] : null, eq0 = (n0 ? (K.mainPhoto(JOB, n0) || {}).equipment : null) || {};
      Object.entries(pfA.equipment||{}).forEach(([id,e])=>{ if(!e || typeof e._measured_height!=="number") return; const m = parseFloat(e.mr_move), h0 = eq0[id]?._measured_height;
        if((isFinite(m) && m!==0) || (typeof h0==="number" && h0!==e._measured_height)) nc.mrEq[id] = e._measured_height + (isFinite(m) ? m : 0); }); }
  }catch(e){ console.error(e); }
  { const topH = a => Math.max(-1, ...Object.values(a.vals||{}).map(v=>parseFt(v.pole)).filter(v=>v!=null && !isNaN(v)));
    const sorted = nc.atts.map((a,i)=>({a,i})).sort((p,q)=>topH(q.a)-topH(p.a) || p.i-q.i);
    if(sorted.some((x,i)=>x.i!==i)){ nc.atts = sorted.map(x=>x.a); nc.reordered = true; } }   // only when the MR swapped two comms
  return nc;
}

/* 11/22: the VDS shows only what the VDS sheet shows. Checks the sheet doesn't have (a comm's midspan to power, comm to comm at the
   pole and in midspan, 44" / 40" from the power bolts, drip loops and risers) run only with violationsOf(c, L, {full:true}). */
function violationsOf(c, L, o){
  const FULL = o && o.full != null ? !!o.full : (typeof window !== "undefined" && !!window.VDS_FULL_CHECKS);   // every violation in one column, with its code (pure: no sheet state)
  L = L || ""; const R = compute(c), out = [];   // compute() points S at c
  const add = o => out.push(o);
  KEYS.forEach((k,i)=>{ for(const r of [63+i,87+i]) if(R.CL[r]==="fail") add({who:"Power", what:"lowest power", k, code:"EGC", cell:L+r, note:R.NT[r], power:true}); });
  const atts = S.atts.map((a,j)=>({a,j})).filter(x=>realAtt(x.a));
  const isZ = a => /zayo/i.test(a.name||"");   // Zayo FE ADSS in power space: not held to the comm-to-power spacing (CS 19-203)
  // 11/19: only what the VDS sheet itself would show. A span whose length rounds under 100' has no table row, so the
  // sheet leaves that comm's rows blank there (11/11): no comm check runs in that span, and a comm in short spans only isn't checked.
  const onSheet = (j, i) => { const v = R.V[ATT_BASE(j)+20+i], h = parseFt(S.atts[j]?.vals?.[KEYS[i]]?.pole); return v!=null && String(v).trim()!=="" && h!=null && !isNaN(h); };
  const sheetComm = j => KEYS.some((k,i)=>S.active.includes(k) && onSheet(j, i));
  atts.forEach(({a,j})=>{
    const b = ATT_BASE(j);
    KEYS.forEach((k,i)=>{
      for(const r of [b+20+i, b+26+i, b+38+i]) if(R.CL[r]==="fail" && !(isZ(a) && rowCode(r)==="EPC")) add({who:a.name||`Attachment ${j+1}`, what:KIND[a.type]||"Comm", k, code:rowCode(r), cell:L+r, note:R.NT[r], j});
      const sp = S.spans[k], pm = parseFt(sp.mid), cm = parseFt(a.vals[k]?.mid);
      if(FULL && S.active.includes(k) && onSheet(j, i) && pm!=null && !isNaN(pm) && cm!=null && !isNaN(cm)){
        const need = midNeed(sp);
        if(pm - cm < need && !isZ(a)) add({who:a.name||`Attachment ${j+1}`, what:KIND[a.type]||"Comm", k, code:"EBC", cell:L+(b+14+i), note:`Fail at ${fmt(pm-cm)} below the ${PWR_NAME[sp.ptype]||"lowest power"} in midspan (needs ${need}")`, j});
      }
    });
  });
  // comm to comm: at the pole 12" (different company) / 6" (same company) → EPC on the upper (more recent) attacher; midspan 4" → EBC
  const ph = x => Math.max(...KEYS.map(k=>parseFt(x.a.vals[k]?.pole)).filter(v=>v!=null && !isNaN(v)));
  for(let n=0;FULL && n<atts.length-1;n++){
    const up = atts[n], lo = atts[n+1], hu = ph(up), hl = ph(lo);
    const dropPair = String(up.a.name).trim().toLowerCase()===String(lo.a.name).trim().toLowerCase() && (up.a.drop || lo.a.drop);
    if(isFinite(hu) && isFinite(hl)){
      const same = String(up.a.name).trim().toLowerCase()===String(lo.a.name).trim().toLowerCase(), need = isZ(up.a) ? 30 : same ? 6 : 12;   // comms 30" below Zayo (CS 19-203)
      if(!dropPair && !(same && hu===hl) && sheetComm(up.j) && sheetComm(lo.j) && hu - hl < need) add({who:isZ(up.a) ? lo.a.name : up.a.name, what:KIND[up.a.type]||"Comm", k:null, code:"EPC", cell:L+(ATT_BASE(up.j)+8), note:isZ(up.a) ? `Fail at ${fmt(hu-hl)} below Zayo FE ADSS at the pole (needs 30")` : `Fail at ${fmt(hu-hl)} above ${lo.a.name||"the next comm"} at the pole (needs ${need}"${same?", same company":""})`, j:up.j});
    }
    const sameCo = String(up.a.name).trim().toLowerCase()===String(lo.a.name).trim().toLowerCase();
    KEYS.forEach((k,i)=>{
      const mu = parseFt(up.a.vals[k]?.mid), ml = parseFt(lo.a.vals[k]?.mid);
      const mneed = isZ(up.a) ? 12 : 4;
      if(typeof BLDG==="function" && BLDG(S.spans[k]) && !isZ(up.a)) return;   /* service to a house / building: not designed, only the 12" at the pole is kept (FE 411) */
      if(!dropPair && !(sameCo && hu===hl) && S.active.includes(k) && onSheet(up.j, i) && onSheet(lo.j, i) && mu!=null && ml!=null && !isNaN(mu) && !isNaN(ml) && mu - ml < mneed) add({who:isZ(up.a) ? lo.a.name : up.a.name, what:KIND[up.a.type]||"Comm", k, code:"EBC", cell:L+(ATT_BASE(up.j)+14+i), note:isZ(up.a) ? `Fail at ${fmt(mu-ml)} below Zayo FE ADSS in midspan (needs 12")` : `Fail at ${fmt(mu-ml)} above ${lo.a.name||"the next comm"} in midspan (needs 4")`, j:up.j});
    });
  }
  // ---- at the pole, beyond the sheet's per-span rows: every comm on the pole (drops that don't reach a measured
  // midspan too) against the lowest power bolt (44"), secondary drip loops and risers (40").
  // The After MR column is checked too, on its own heights (11/16: a drip-loop violation the make-ready didn't fix
  // dropped off the After MR result): comms as the column has them, power and drip loops / risers as the make-ready leaves them.
  if(FULL && JOB && c.node && JOB.nodes?.[c.node]){
    try{
      const pf = K.mainPhoto(JOB, JOB.nodes[c.node]) || {}, tr = JOB.traces?.trace_data || {}, pw = K.poleWires(pf);
      const aft = !!(c.after || c.newPole);   // a new midspan pole's column is its after-MR layout
      // After MR heights by trace: recorded by afterCol; a column saved before that falls back to the Katapult MR moves
      const mh = !aft ? null : (c.mrH || (!c.fromAfter && !c.plan ? Object.fromEntries(Object.entries(pw).map(([t,w])=>[t, w.h + mrOf(w)])) : null));
      // a lowest-power height typed on the After MR column wins over the recorded one
      const typed = {}; let follow = !aft || !!c.mrFollow;
      if(aft) KEYS.forEach(k=>{ const sp = c.spans?.[k], h = parseFt(sp?.pole); if(sp?.lowTrace && h!=null && !isNaN(h)) typed[sp.lowTrace] = h; });
      const hOf = (t, w) => { const h = mh && mh[t]!=null ? mh[t] : w.h; if(typed[t]!=null && Math.abs(typed[t] - h) > 0.5){ follow = true; return typed[t]; } return h; };
      const pws = Object.entries(pw).filter(([t])=>{ const kd = K.powerKind(tr[t]?.cable_type); return (kd==="neutral" || kd==="sec") && !shortOnlyPow(c, t); });
      const low0 = pws.length ? Math.min(...pws.map(([,w])=>w.h)) : null;
      const ps = +c.powShift || 0;   // a power raise being tried on this column
      const low = low0==null ? null : aft ? Math.min(...pws.map(([t,w])=>hOf(t, w))) : low0 + ps;
      // how far the drip loops / risers go with the power: a fix being tried or a typed raise moves them with it; from Katapult
      // (MR moves / after JSON) they only move if they were moved there, so an untouched drip loop still counts
      const sh = !aft ? ps : (follow && low!=null ? low - low0 : 0);
      const eq = Object.entries(pf.equipment||{}).filter(([,e])=>e && typeof e._measured_height==="number" && ((e.equipment_type==="drip_loop" && !/street/i.test(e.drip_loop_spec||"")) || e.equipment_type==="riser"))
        .map(([id,e])=>({...e, _measured_height: aft && c.mrEq && c.mrEq[id]!=null ? c.mrEq[id] : sh && e.equipment_type==="drip_loop" && low!=null ? low - 4 : e._measured_height + sh}));
      // a comm's height on this column (it may have been moved) by its Katapult trace
      const colH = {}; (S.atts||[]).forEach(a=>KEYS.forEach(k=>{ const v = a.vals?.[k], t = v?.trace || a.trace, h = parseFt(v?.pole); if(t && h!=null && !isNaN(h)) colH[t] = Math.max(colH[t] ?? -Infinity, h); }));
      const flagged = new Set(out.filter(v=>v.code==="EPC").map(v=>String(v.who).toLowerCase()));
      const seen = new Set();
      Object.entries(pw).forEach(([t,w0])=>{
        const w = colH[t]!=null ? {...w0, h: colH[t]} : (mh && mh[t]!=null ? {...w0, h: mh[t]} : w0);
        const kind = K.commKind(tr[t]?.cable_type); if(!kind || tr[t]?.proposed) return;
        const who = K.shortCo(tr[t].company) || tr[t].cable_type; if(/zayo/i.test(tr[t].company||"") || flagged.has(who.toLowerCase())) return;
        let note = "";
        if(low!=null && low - w.h < 44) note = `Fail at ${fmt(low - w.h)} below the lowest secondary/neutral bolt at the pole (needs 44")`;
        else { const e = eq.find(e=>w.h > e._measured_height - 40); if(e) note = w.h > e._measured_height ? `Fail: ${fmt(w.h)} is above the ${e.equipment_type==="riser"?"riser":"secondary drip loop"} at ${fmt(e._measured_height)} (needs 40" below it)` : `Fail at ${fmt(e._measured_height - w.h)} below the ${e.equipment_type==="riser"?"riser":"secondary drip loop"} (needs 40")`; }
        if(note && !seen.has(who)){ const ja = (S.atts||[]).findIndex(a=>a && (a.trace===t || KEYS.some(k=>a.vals?.[k]?.trace===t))); if(ja<0 || !sheetComm(ja)) return; seen.add(who); add({who, what:KIND[kind]||"Comm", k:null, code:"EPC", cell: ja>=0 ? L+(ATT_BASE(ja)+8) : "", note, pole:true, j: ja>=0 ? ja : undefined}); }
      });
    }catch(e){}
  }
  if(String(S.prop.name||"").trim()){
    KEYS.forEach((k,i)=>{
      for(const r of [321+i, 327+i]) if(R.CL[r]==="fail") add({who:S.prop.name, what:"proposed", k, code:rowCode(r), cell:L+r, note:R.NT[r], prop:true});
      // 11/22: no proposed-to-power midspan check: the VDS sheet doesn't have one (rows 321–326 pole distance and 327–332 ground
      // clearance only). The proposed's midspan height is the designer's to set.
    });
  }
  return {list:out, R, era:R.E.v3};
}

/* ---------- API ---------- */
const PoleCore = {
  version: "1.5 (2026-10-29)",
  setJob(job){ JOB = job; SPEC_CACHE = null; SPECS_ALL = null; return JOB; },
  getJob(){ return JOB; },
  poles(){ return JOB ? K.poles(JOB) : []; },
  // existing-condition column for one pole, exactly as the VDS fills it (WV road layers are applied by the VDS page only)
  column(nodeId){ const {S:ns, warn} = K.build(JOB, nodeId, blankCol()); const n = JOB.nodes[nodeId], nf = K.noteFields(n);
    ns.node = nodeId; ns.over = {}; ns.red = ns.red || "N"; ns.line = warn.some(w=>w.startsWith("Line designation not in")) ? "" : ns.era;
    ns.poleYear = K.poleYear(n) || (nf["pole year"]||"").trim(); ns.warn = warn; ns.design = ""; return ns; },
  compute, violationsOf, afterCol, eraFor, calcPower, calcComm, calcProp, lookup, feReq, feCase, powCol, sag32,
  parseFt, fmt, K, DATA, KEYS, SPANS, SPAN_NAMES, ATT_BASE, CODE_DEF, MID_NEED, midNeed, polePW, blankCol,
  get S(){ return S; }
};
if (typeof window !== "undefined") window.PoleCore = PoleCore;
if (typeof module !== "undefined" && module.exports) module.exports = PoleCore;

