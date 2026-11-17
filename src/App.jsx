
import React, { useMemo, useState } from "react";
import {
  Activity, ArrowDownUp, ArrowUpRight, BarChart3, CheckCircle2, ChevronDown,
  ClipboardList, Database, Download, FileText, Info, LayoutDashboard, Menu,
  Search, ShieldCheck, Target, Trophy, Users, X
} from "lucide-react";
import data from "./data/results.json";

const D = data;
const fmt = (n, d=1) => Number.isFinite(Number(n)) ? Number(n).toFixed(d) : "—";
const integer = n => Number(n || 0).toLocaleString("en-IN");
const roleKeys = Object.keys(D.positions);
const downloadCsv = (name, rows) => {
  if (!rows?.length) return;
  const cols = Object.keys(rows[0]);
  const esc = v => `"${String(v ?? "").replaceAll('"','""')}"`;
  const csv = [cols.map(esc).join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8;"}));
  const a = document.createElement("a"); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url);
};
const nav = [
  ["Overview", LayoutDashboard],
  ["Batting Rankings", Trophy],
  ["Bowling Rankings", Target],
  ["Position Analysis", BarChart3],
  ["Player Comparison", Users],
  ["Methodology", ClipboardList],
  ["Exclusions & Audit", ShieldCheck],
];
function Badge({children, tone="neutral"}) { return <span className={`badge ${tone}`}>{children}</span>; }
function StatCard({label,value,sub,icon:Icon}) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-sub">{sub}</div></div>;
}
function SectionTitle({eyebrow,title,desc,action}) {
  return <div className="section-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{desc&&<p>{desc}</p>}</div>{action}</div>;
}
function Notice({children,kind="info"}) { return <div className={`notice ${kind}`}><Info size={17}/><div>{children}</div></div>; }
function PlayerTable({rows,kind="bat",title,downloadName,compact=false}) {
  const [query,setQuery]=useState(""); const [sort,setSort]=useState("rank");
  const nameKey=kind==="bat"?"striker_name":"bowler_name";
  const filtered=useMemo(()=>{
    const f=rows.filter(r=>(r[nameKey]||"").toLowerCase().includes(query.toLowerCase()));
    return [...f].sort((a,b)=>{
      if(sort==="score") return Number(b.score)-Number(a.score);
      if(sort==="sample") return Number(kind==="bat"?b.pressure_balls:b.p_legal_balls)-Number(kind==="bat"?a.pressure_balls:a.p_legal_balls);
      if(sort==="name") return (a[nameKey]||"").localeCompare(b[nameKey]||"");
      return Number(a.rank)-Number(b.rank);
    });
  },[rows,query,sort,kind,nameKey]);
  return <div className="table-card">
    <div className="table-head"><div><h3>{title || (kind==="bat"?"Batting candidates":"Bowling candidates")}</h3><p>{filtered.length} players · sortable performance metrics</p></div>
      <div className="table-tools"><label className="search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search player"/></label>
      <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort players"><option value="rank">Sort: rank</option><option value="score">Sort: score</option><option value="sample">Sort: sample size</option><option value="name">Sort: name</option></select>
      {downloadName&&<button className="icon-button" onClick={()=>downloadCsv(downloadName,filtered)} title="Download CSV"><Download size={16}/></button>}</div>
    </div>
    <div className="table-scroll"><table><thead><tr>
      <th>Rank</th><th>Player</th><th>Pressure score</th>
      {kind==="bat"?<><th>Pressure SR</th><th>Pressure balls</th><th>Matches</th><th>Boundary %</th><th>Dot %</th></>:<><th>Pressure Econ</th><th>Wickets / 6</th><th>Legal balls</th><th>Matches</th><th>Dot %</th></>}
    </tr></thead><tbody>
      {filtered.map((r,i)=><tr key={`${r[nameKey]}-${i}`}>
        <td><span className="rank-pill">{r.rank}</span></td><td className="player-cell">{r[nameKey]}</td>
        <td><span className="score-pill">{fmt(r.score)}</span></td>
        {kind==="bat"?<><td>{fmt(r.pressure_sr)}</td><td>{integer(r.pressure_balls)}</td><td>{integer(r.pressure_matches)}</td><td>{fmt(r.boundary_pct)}%</td><td>{fmt(r.dot_pct)}%</td></>:<><td>{fmt(r.p_econ,2)}</td><td>{fmt(r.p_wkts_per6,2)}</td><td>{integer(r.p_legal_balls)}</td><td>{integer(r.p_matches)}</td><td>{fmt(r.p_dot_pct)}%</td></>}
      </tr>)}
      {!filtered.length&&<tr><td colSpan="8" className="empty">No players match your search.</td></tr>}
    </tbody></table></div>
    <div className="table-foot"><span>Score is a relative model rating, not a probability.</span><span>{filtered.length} shown</span></div>
  </div>;
}
function Overview({setPage}) {
  const topBat=D.batters.top10.slice(0,3), topBowl=D.bowlers.top10.slice(0,3);
  return <div className="page-stack">
    <div className="hero">
      <div className="hero-copy"><div className="hero-kicker"><span className="live-dot"/> HACKATHON ANALYTICS · ROUND 1</div>
        <h1>Find the players<br/><em>who rise under pressure.</em></h1>
        <p>Ball-by-ball performance intelligence for auction scouting — built around match context, role, sample reliability and a transparent scoring model.</p>
        <div className="hero-actions"><button className="primary-button" onClick={()=>setPage("Batting Rankings")}>Explore rankings <ArrowUpRight size={16}/></button><a className="hero-link" href="/downloads/Royal_Intelligence_Methodology_Report.pdf" download>Methodology report <Download size={15}/></a></div>
      </div>
      <div className="hero-mark"><div className="crest"><span>RR</span><i>✦</i></div><div className="hero-mark-caption">ROYAL<br/>INTELLIGENCE</div><div className="hero-mark-line"/></div>
      <div className="hero-bottom"><span>IPL + MEN'S T20I</span><span>{D.meta.dateRange}</span><span>DATA-LED SCOUTING</span></div>
    </div>
    <Notice kind="warning"><b>Candidate status:</b> current franchise squad names supplied for this analysis have been excluded. Remaining players are potential candidates only; official auction registration, NOCs and final opt-outs have not been verified.</Notice>
    <div className="stat-grid">
      <StatCard label="Matches analysed" value={integer(D.meta.matches)} sub={D.meta.dateRange} icon={Activity}/>
      <StatCard label="Delivery records" value={integer(D.meta.deliveries)} sub="IPL + men's T20I · innings 1 & 2" icon={Database}/>
      <StatCard label="Batter candidates" value={integer(D.meta.eligibleBatters)} sub="After sample and exclusion filters" icon={Trophy}/>
      <StatCard label="Bowler candidates" value={integer(D.meta.eligibleBowlers)} sub="After sample and exclusion filters" icon={Target}/>
    </div>
    <div className="two-col">
      <div className="panel"><div className="panel-heading"><div><div className="eyebrow">OVERALL BATTERS</div><h2>Top pressure performers</h2></div><button className="text-button" onClick={()=>setPage("Batting Rankings")}>Full ranking <ArrowUpRight size={14}/></button></div>
        {topBat.map((p,i)=><div className="leader-row" key={p.striker_name}><span className={`leader-rank r${i+1}`}>0{i+1}</span><div className="leader-main"><b>{p.striker_name}</b><small>{p.roles}</small></div><div className="leader-score">{fmt(p.score)}<small>score</small></div></div>)}
      </div>
      <div className="panel"><div className="panel-heading"><div><div className="eyebrow">OVERALL BOWLERS</div><h2>Top pressure performers</h2></div><button className="text-button" onClick={()=>setPage("Bowling Rankings")}>Full ranking <ArrowUpRight size={14}/></button></div>
        {topBowl.map((p,i)=><div className="leader-row" key={p.bowler_name}><span className={`leader-rank r${i+1}`}>0{i+1}</span><div className="leader-main"><b>{p.bowler_name}</b><small>{fmt(p.p_econ,2)} economy · {p.p_matches} matches</small></div><div className="leader-score">{fmt(p.score)}<small>score</small></div></div>)}
      </div>
    </div>
    <div className="panel"><div className="panel-heading"><div><div className="eyebrow">ROLE-BASED SCOUTING</div><h2>Batting position leaders</h2></div><button className="text-button" onClick={()=>setPage("Position Analysis")}>View all roles <ArrowUpRight size={14}/></button></div>
      <div className="role-overview">{Object.entries(D.positions).map(([key,obj])=><button key={key} className="role-card" onClick={()=>setPage("Position Analysis")}><span>{obj.positions}</span><b>{obj.label.replace(/\s\(.+\)/,"")}</b><strong>{obj.top10[0]?.striker_name || "—"}</strong><small>{obj.count} qualified player rows</small></button>)}</div>
    </div>
    <div className="footnote">This dashboard is a supporting analytics view. The official challenge requires the ordered batter and bowler selections in Unstop plus a methodology report upload.</div>
  </div>;
}
function BattingPage() {
  return <div className="page-stack"><SectionTitle eyebrow="PLAYER RANKINGS · BATTING" title="Batting under pressure" desc="Overall player leaderboard plus position-specific evidence. Overall scores aggregate pressure delivery metrics across a player's batting roles." action={<a className="primary-button small" href="/downloads/Top10_Batters.csv" download><Download size={15}/> Top 10 CSV</a>}/>
    <div className="top-ten-strip">{D.batters.top10.slice(0,3).map((p,i)=><div className="top-ten-card" key={p.striker_name}><span>#{i+1} OVERALL</span><b>{p.striker_name}</b><strong>{fmt(p.score)}</strong><small>{fmt(p.pressure_sr)} pressure SR · {p.pressure_balls} balls</small></div>)}</div>
    <Notice><b>Scoring note:</b> overall batting score is calculated after aggregating pressure runs, balls, boundaries and dots across batting positions. The match count uses the maximum position-specific count to avoid summing overlapping match samples. Use the position leaderboards for role-specific selection.</Notice>
    <PlayerTable rows={D.batters.all} kind="bat" title="All qualified batter candidates" downloadName="All_Eligible_Batter_Rankings.csv"/>
  </div>;
}
function BowlingPage() {
  return <div className="page-stack"><SectionTitle eyebrow="PLAYER RANKINGS · BOWLING" title="Bowling under pressure" desc="Bowlers ranked by pressure economy, wicket threat, dot-ball control, boundary prevention and retention versus their normal baseline." action={<a className="primary-button small" href="/downloads/Top10_Bowlers.csv" download><Download size={15}/> Top 10 CSV</a>}/>
    <div className="top-ten-strip">{D.bowlers.top10.slice(0,3).map((p,i)=><div className="top-ten-card" key={p.bowler_name}><span>#{i+1} OVERALL</span><b>{p.bowler_name}</b><strong>{fmt(p.score)}</strong><small>{fmt(p.p_econ,2)} econ · {p.p_legal_balls} legal balls</small></div>)}</div>
    <Notice><b>Bowling pressure threshold:</b> ≥60/100. Eligible bowlers need at least 48 pressure legal balls in 5 matches and 60 non-pressure legal balls.</Notice>
    <PlayerTable rows={D.bowlers.all} kind="bowl" title="All qualified bowler candidates" downloadName="All_Eligible_Bowler_Rankings.csv"/>
  </div>;
}
function PositionsPage() {
  const [active,setActive]=useState(roleKeys[0]);
  const obj=D.positions[active];
  return <div className="page-stack"><SectionTitle eyebrow="BATTING ROLE ANALYSIS" title="Position-wise pressure leaders" desc="A batter's pressure performance depends on the role they are asked to play. Compare players within the same batting slot." action={<a className="secondary-button" href="/downloads/Position_Wise_Top10.csv" download><Download size={15}/> Export all roles</a>}/>
    <div className="tabs">{roleKeys.map(k=><button key={k} className={active===k?"active":""} onClick={()=>setActive(k)}>{D.positions[k].positions}<span>{D.positions[k].label.split(" (")[0]}</span></button>)}</div>
    <div className="role-summary"><div><span className="eyebrow">SELECTED ROLE</span><h2>{obj.label}</h2><p>Batting positions {obj.positions} · {obj.count} qualified player rows</p></div><div className="role-summary-stat"><strong>{obj.count}</strong><small>eligible samples</small></div></div>
    {obj.count<10&&<Notice kind="warning">Only {obj.count} players meet the minimum sample requirement in this role. The list is intentionally not padded with low-sample players.</Notice>}
    <PlayerTable rows={obj.all} kind="bat" title={`Rankings · ${obj.label}`} downloadName={`${active.replaceAll(" ","_")}_Rankings.csv`}/>
  </div>;
}
function ComparePage() {
  const [kind,setKind]=useState("bat");
  const rows=kind==="bat"?D.batters.all:D.bowlers.all;
  const nameKey=kind==="bat"?"striker_name":"bowler_name";
  const [a,setA]=useState(rows[0]?.[nameKey]||""); const [b,setB]=useState(rows[1]?.[nameKey]||"");
  const one=rows.find(x=>x[nameKey]===a)||rows[0]; const two=rows.find(x=>x[nameKey]===b)||rows[1];
  const metrics=kind==="bat"?[
    ["Pressure score","score",1],["Pressure strike rate","pressure_sr",1],["Pressure balls","pressure_balls",0],
    ["Pressure matches","pressure_matches",0],["Boundary rate %","boundary_pct",1],["Dot-ball rate %","dot_pct",1],["Runs / pressure match","runs_per_pressure_match",1]
  ]:[
    ["Pressure score","score",1],["Pressure economy","p_econ",2],["Wickets / 6 legal balls","p_wkts_per6",2],
    ["Pressure legal balls","p_legal_balls",0],["Pressure matches","p_matches",0],["Dot-ball rate %","p_dot_pct",1],["Boundary rate %","p_boundary_pct",1]
  ];
  const resetKind=k=>{setKind(k);const r=k==="bat"?D.batters.all:D.bowlers.all;setA(r[0]?.[k==="bat"?"striker_name":"bowler_name"]||"");setB(r[1]?.[k==="bat"?"striker_name":"bowler_name"]||"");};
  return <div className="page-stack"><SectionTitle eyebrow="SCOUTING TOOL" title="Compare two players" desc="Compare pressure performance side by side using the same model and sample definitions."/>
    <div className="segmented"><button className={kind==="bat"?"active":""} onClick={()=>resetKind("bat")}>Batters</button><button className={kind==="bowl"?"active":""} onClick={()=>resetKind("bowl")}>Bowlers</button></div>
    <div className="compare-selects"><label>Player A<select value={a} onChange={e=>setA(e.target.value)}>{rows.map(x=><option key={x[nameKey]} value={x[nameKey]}>{x[nameKey]}</option>)}</select></label><label>Player B<select value={b} onChange={e=>setB(e.target.value)}>{rows.map(x=><option key={x[nameKey]} value={x[nameKey]}>{x[nameKey]}</option>)}</select></label></div>
    {one&&two&&<div className="compare-card"><div className="compare-head"><div><span>PLAYER A</span><b>{a}</b></div><div className="vs">VS</div><div className="right"><span>PLAYER B</span><b>{b}</b></div></div>
      {metrics.map(([label,key,d])=><div className="compare-row" key={key}><strong>{fmt(one[key],d)}</strong><span>{label}</span><strong>{fmt(two[key],d)}</strong></div>)}
    </div>}
  </div>;
}
function MethodologyPage() {
  return <div className="page-stack"><SectionTitle eyebrow="MODEL TRANSPARENCY" title="Methodology & evidence" desc="The scoring logic, comparison rules and limitations behind the current rankings." action={<a className="primary-button small" href="/downloads/Royal_Intelligence_Methodology_Report.pdf" download><Download size={15}/> Download report</a>}/>
    <div className="method-grid">
      <div className="method-card"><span className="method-number">01</span><h3>Batting pressure state</h3><p><b>First innings</b></p><p>{D.methodology.batting.firstInnings}</p><p><b>Chase</b></p><p>{D.methodology.batting.chase}</p><Badge>Threshold ≥50/100</Badge><small>{D.methodology.batting.sample}</small></div>
      <div className="method-card"><span className="method-number">02</span><h3>Bowling pressure state</h3><p><b>First innings</b></p><p>{D.methodology.bowling.firstInnings}</p><p><b>Chase</b></p><p>{D.methodology.bowling.chase}</p><Badge>Threshold ≥60/100</Badge><small>{D.methodology.bowling.sample}</small></div>
      <div className="method-card"><span className="method-number">03</span><h3>Batting rating</h3><p>{D.methodology.batting.score}</p><p>{D.methodology.batting.confidence}</p><small>{D.methodology.batting.overall}</small></div>
      <div className="method-card"><span className="method-number">04</span><h3>Bowling rating</h3><p>{D.methodology.bowling.score}</p><p>{D.methodology.bowling.confidence}</p><small>Lower pressure economy and boundary concession are treated as better outcomes.</small></div>
    </div>
    <div className="panel"><div className="eyebrow">DATA COVERAGE</div><h2>What is included?</h2><p className="body-copy">{D.methodology.scope}</p><p className="body-copy">{D.methodology.innings}</p><div className="coverage-grid"><div><b>{integer(D.meta.matches)}</b><small>matches</small></div><div><b>{integer(D.meta.deliveries)}</b><small>deliveries</small></div><div><b>{D.meta.dateRange}</b><small>date range</small></div></div></div>
    <Notice kind="warning"><b>Limitations:</b> {D.methodology.availability} Scores are relative percentile ratings, not probabilities. Different batting and bowling sample thresholds are used because balls faced and legal balls bowled are different exposure measures. The overall batter match count is a conservative position-level proxy; use position-specific leaderboards for role decisions.</Notice>
  </div>;
}
function ExclusionsPage() {
  const [tab,setTab]=useState("squads"); const [query,setQuery]=useState("");
  const tabs=[["squads","Squad exclusions"],["unmatched","Not in dataset"],["retired","Retired"],["pakistanProxy","Pakistan proxy"],["aliases","Name aliases"]];
  let rows=D.exclusions[tab]||[];
  if(tab==="unmatched") rows=rows.map(x=>({"Player name":x,"Audit result":"No matching name in supplied ball-by-ball data"}));
  if(tab==="retired") rows=rows.map(x=>({"Player name":x["Dataset player name"],"Reason":x["Exclusion reason"]}));
  if(tab==="pakistanProxy") rows=rows.map(x=>({"Player name":x["Dataset player name"],"Reason":x["Exclusion reason"]}));
  if(tab==="aliases") rows=rows.map(x=>({"Roster spelling":x["Roster name"],"Matched dataset name":x["Matched dataset name"]}));
  const filtered=rows.filter(r=>Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()));
  return <div className="page-stack"><SectionTitle eyebrow="PLAYER AVAILABILITY AUDIT" title="Exclusions & data quality" desc="Trace which players were removed, which names could not be matched and where identity assumptions need manual review."/>
    <div className="stat-grid compact-stats"><StatCard label="Squad names supplied" value={D.meta.squadNamesProvided} sub="10 franchise lists" icon={Users}/><StatCard label="Matched to data" value={D.meta.squadNamesMatched} sub="Excluded from rankings" icon={CheckCircle2}/><StatCard label="Not found" value={D.meta.squadNamesNotFound} sub="No ball-by-ball match" icon={Search}/><StatCard label="Pakistan proxy names" value={D.meta.pakistanProxyExclusions} sub="Mapping-based, needs review" icon={ShieldCheck}/></div>
    <Notice kind="warning"><b>Important:</b> Pakistan-associated players were inferred from T20I team mappings because the supplied files do not contain a complete nationality field. Treat this as a review list, not definitive nationality evidence.</Notice>
    <div className="tabs audit-tabs">{tabs.map(([key,label])=><button key={key} className={tab===key?"active":""} onClick={()=>{setTab(key);setQuery("")}}>{label}</button>)}</div>
    <div className="table-card"><div className="table-head"><div><h3>{tabs.find(x=>x[0]===tab)?.[1]}</h3><p>{rows.length} audit records</p></div><label className="search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter audit"/></label></div>
      <div className="table-scroll"><table><thead><tr>{Object.keys(filtered[0]||rows[0]||{"Player":"—"}).map(k=><th key={k}>{k}</th>)}</tr></thead><tbody>{filtered.map((r,i)=><tr key={i}>{Object.values(r).map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>
    </div>
  </div>;
}

function SubmissionPage() {
  const files = [
    ["Top 10 batters","/downloads/Top10_Batters.csv","Ordered batter ranking for the Unstop dropdowns","CSV"],
    ["Top 10 bowlers","/downloads/Top10_Bowlers.csv","Ordered bowler ranking for the Unstop dropdowns","CSV"],
    ["Methodology report","/downloads/Royal_Intelligence_Methodology_Report.pdf","Pressure definitions, scoring, sample rules and limitations","PDF"],
    ["Position-wise Top 10","/downloads/Position_Wise_Top10.csv","Role-specific batting leaderboards","CSV"],
    ["Full batter rankings","/downloads/All_Eligible_Batter_Rankings.csv","All qualified batter candidates","CSV"],
    ["Full bowler rankings","/downloads/All_Eligible_Bowler_Rankings.csv","All qualified bowler candidates","CSV"]
  ];
  return <div className="page-stack">
    <SectionTitle eyebrow="HACKATHON HANDOFF" title="Submission pack" desc="The files needed to complete the Round 1 Unstop submission, plus supporting evidence from the interactive dashboard."/>
    <Notice kind="warning"><b>Before you submit:</b> confirm each selected player is present in the official auction registration list and has not opted out. This dashboard excludes the current squad lists you supplied, but it cannot verify final auction registration or availability.</Notice>
    <div className="submission-grid">{files.map(([name,url,desc,type])=><div className="submission-file" key={name}><div className="file-icon">{type==="PDF"?<FileText size={20}/>:<Database size={20}/>}</div><div className="submission-file-main"><b>{name}</b><small>{desc}</small></div><a href={url} download className="download-link"><Download size={15}/> Download</a></div>)}</div>
    <div className="panel"><div className="eyebrow">FINAL CHECKLIST</div><h2>Complete these steps on Unstop</h2>
      <ol className="checklist"><li><b>Batters:</b> enter the 10 names from Top10_Batters.csv in rank order, 1 through 10.</li><li><b>Bowlers:</b> enter the 10 names from Top10_Bowlers.csv in rank order, 1 through 10.</li><li><b>Methodology:</b> upload the PDF report.</li><li><b>Consistency:</b> confirm the Unstop selections match the report tables exactly.</li><li><b>Availability:</b> manually verify auction registration, overseas NOC and opt-out status before finalizing.</li></ol>
    </div>
    <div className="footnote">The website is a supporting interactive dashboard. The official submission still requires the two ordered Unstop lists and the methodology document.</div>
  </div>;
}

export default function App() {
  const [page,setPage]=useState("Overview"); const [mobileOpen,setMobileOpen]=useState(false);
  const render=()=>{
    if(page==="Overview") return <Overview setPage={setPage}/>;
    if(page==="Batting Rankings") return <BattingPage/>;
    if(page==="Bowling Rankings") return <BowlingPage/>;
    if(page==="Position Analysis") return <PositionsPage/>;
    if(page==="Player Comparison") return <ComparePage/>;
    if(page==="Methodology") return <MethodologyPage/>;
    if(page==="Exclusions & Audit") return <ExclusionsPage/>;
    if(page==="Submission Pack") return <SubmissionPage/>;
    return <ExclusionsPage/>;
  };
  return <div className="app-shell">
    {mobileOpen&&<button className="mobile-scrim" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"/>}
    <aside className={`sidebar ${mobileOpen?"open":""}`}>
      <div className="brand"><div className="brand-icon">♛</div><div><b>ROYAL</b><small>INTELLIGENCE</small></div><button className="close-nav" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
      <div className="nav-caption">SCOUTING WORKSPACE</div>
      <nav>{nav.map(([label,Icon])=><button key={label} className={page===label?"selected":""} onClick={()=>{setPage(label);setMobileOpen(false)}}><Icon size={17}/><span>{label}</span>{page===label&&<i/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="season-chip">ROUND 1 <span>2027 AUCTION</span></div><p>Most Reliable Players<br/>Under Pressure</p><small>Historical data · 2022–2026</small></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><div className="crumb">SUPE RR SELECTOR <span>/</span> {page.toUpperCase()}</div><div className="topbar-right"><Badge tone="success">DATA LOADED</Badge><span className="topbar-date">17 NOV 2026</span></div></header>
      <div className="content">{render()}</div>
      <footer className="site-footer"><span>ROYAL INTELLIGENCE · SUPERR SELECTOR S2</span><span>ANALYTICS COMPANION · NOT OFFICIAL AUCTION CONFIRMATION</span></footer>
    </main>
  </div>;
}
