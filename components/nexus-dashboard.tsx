"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Bot, CheckCircle2, ChevronRight, CircleDot, Clock3, Code2,
  Github, Globe2, LayoutDashboard, Menu, Plus, Play, RefreshCw, Search,
  Settings2, ShieldCheck, Sparkles, Terminal, Trash2, X, Zap
} from "lucide-react";
import type { Agent, Run, ToolId } from "@/types/nexus";

const tools: { id: ToolId; label: string; icon: any }[] = [
  { id: "github_repo", label: "GitHub", icon: Github },
  { id: "web_search", label: "Web Search", icon: Globe2 },
  { id: "calculator", label: "Calculator", icon: Terminal },
  { id: "current_time", label: "Time", icon: Clock3 }
];

export default function NexusDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [task, setTask] = useState("");
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "runs">("overview");
  const [showCreate, setShowCreate] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [lastRun, setLastRun] = useState<Run | null>(null);
  const [form, setForm] = useState({
    name: "Repository Analyst",
    description: "Analyze a GitHub repository and explain its architecture.",
    systemPrompt: "You are a senior software engineer. Analyze repository evidence carefully and provide actionable engineering insights.",
    tools: ["github_repo", "calculator", "current_time"] as ToolId[]
  });

  async function load() {
    const [a, r] = await Promise.all([
      fetch("/api/agents").then(x => x.json()),
      fetch("/api/runs").then(x => x.json())
    ]);
    setAgents(a);
    setRuns(r);
    if (!selectedId && a[0]) setSelectedId(a[0].id);
  }

  useEffect(() => { load(); }, []);

  const selected = agents.find(a => a.id === selectedId) || agents[0];
  const completed = runs.filter(r => r.status === "completed").length;
  const successRate = runs.length ? Math.round((completed / runs.length) * 100) : 100;

  async function createAgent() {
    const res = await fetch("/api/agents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      const agent = await res.json();
      setAgents(prev => [agent, ...prev]);
      setSelectedId(agent.id);
      setShowCreate(false);
    }
  }

  async function deleteAgent(id: string) {
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    const remaining = agents.filter(a => a.id !== id);
    setAgents(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id || "");
  }

  async function runTask() {
    if (!selected || !task.trim() || running) return;
    setRunning(true);
    try {
      const res = await fetch(`/api/agents/${selected.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task })
      });
      const run = await res.json();
      if (res.ok) {
        setLastRun(run);
        setRuns(prev => [run, ...prev]);
        setTask("");
      } else {
        alert(run.error || "Run failed");
      }
    } finally {
      setRunning(false);
    }
  }

  const nav = [
    { id: "overview", label: "Command Center", icon: LayoutDashboard },
    { id: "agents", label: "Agents", icon: Bot },
    { id: "runs", label: "Run History", icon: Activity }
  ] as const;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className={`${showMobile ? "fixed inset-y-0 left-0 z-50 flex" : "hidden"} w-72 shrink-0 flex-col border-r border-white/10 bg-[#080d18]/95 p-5 backdrop-blur-xl lg:flex`}>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight">NEXUS</div>
                <div className="text-[10px] font-semibold uppercase tracking-[.24em] text-slate-500">Agent OS</div>
              </div>
            </div>
            <button className="lg:hidden" onClick={() => setShowMobile(false)}><X size={20}/></button>
          </div>

          <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">Workspace</div>
          <nav className="space-y-1">
            {nav.map(item => {
              const Icon = item.icon;
              return <button key={item.id} onClick={() => { setActiveTab(item.id); setShowMobile(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeTab === item.id ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={17}/>{item.label}
              </button>;
            })}
          </nav>

          <div className="mt-8 mb-3 px-2 text-[10px] font-bold uppercase tracking-[.22em] text-slate-500">Agents</div>
          <div className="space-y-1 overflow-auto">
            {agents.map(agent => <button key={agent.id} onClick={() => { setSelectedId(agent.id); setActiveTab("agents"); setShowMobile(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${selected?.id === agent.id ? "bg-violet-500/10 text-violet-200" : "text-slate-400 hover:bg-white/5"}`}>
              <span className={`size-2 rounded-full ${agent.status === "active" ? "bg-emerald-400" : "bg-slate-600"}`}/>
              <span className="truncate">{agent.name}</span>
            </button>)}
          </div>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><ShieldCheck size={15}/> Safety mode</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Explicit tools only. No arbitrary shell execution.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#070b14]/80 px-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setShowMobile(true)}><Menu size={21}/></button>
              <div>
                <div className="text-sm font-bold text-white">{nav.find(x => x.id === activeTab)?.label}</div>
                <div className="hidden text-xs text-slate-500 sm:block">AI agent orchestration workspace</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:inline-flex"><CircleDot size={12} className="mr-1.5"/> System online</span>
              <button onClick={load} className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"><RefreshCw size={16}/></button>
            </div>
          </header>

          <div className="grid-bg min-h-[calc(100vh-4rem)] p-4 md:p-8">
            {activeTab === "overview" && (
              <>
                <div className="mb-7">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-violet-300"><Zap size={13}/> Autonomous workspace</div>
                  <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">Turn instructions into <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">agent workflows.</span></h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">Create specialized agents, give them explicit tools, execute tasks, and inspect every step.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Active agents", agents.filter(a => a.status === "active").length, Bot],
                    ["Total runs", runs.length, Activity],
                    ["Success rate", `${successRate}%`, CheckCircle2],
                    ["Avg duration", runs.length ? `${Math.round(runs.reduce((a,r)=>a+r.durationMs,0)/runs.length)}ms` : "—", Clock3]
                  ].map(([label, value, Icon]: any, i) => <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*.05}} key={label} className="glass rounded-2xl p-5">
                    <div className="mb-5 flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{label}</span><Icon size={17} className="text-violet-300"/></div>
                    <div className="text-2xl font-black">{value}</div>
                  </motion.div>)}
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
                  <section className="glass overflow-hidden rounded-3xl">
                    <div className="border-b border-white/10 p-5 md:p-6">
                      <div className="flex items-center justify-between">
                        <div><h2 className="font-bold">Execute a task</h2><p className="mt-1 text-xs text-slate-500">Selected agent: {selected?.name || "None"}</p></div>
                        <div className="rounded-xl bg-violet-500/10 p-2 text-violet-300"><Terminal size={17}/></div>
                      </div>
                    </div>
                    <div className="p-5 md:p-6">
                      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                        {agents.map(a => <button key={a.id} onClick={()=>setSelectedId(a.id)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${selected?.id===a.id ? "border-violet-400/30 bg-violet-400/10 text-violet-200" : "border-white/10 text-slate-500"}`}>{a.name}</button>)}
                      </div>
                      <textarea value={task} onChange={e=>setTask(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();runTask();}}}
                        placeholder="Try: Analyze github.com/Krishna-Gudavalli/Sentinel-AI-Reviewer and summarize the architecture."
                        className="min-h-40 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 outline-none placeholder:text-slate-600 focus:border-violet-400/40"/>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500"><Settings2 size={14}/> {selected?.tools.length || 0} tools enabled</div>
                        <button disabled={!selected||!task.trim()||running} onClick={runTask} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40">
                          {running ? <RefreshCw size={15} className="animate-spin"/> : <Play size={15}/>} {running ? "Running…" : "Run agent"}
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="glass rounded-3xl p-5 md:p-6">
                    <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Tool registry</h2><p className="mt-1 text-xs text-slate-500">Explicit capabilities</p></div><Code2 size={17} className="text-cyan-300"/></div>
                    <div className="space-y-2">
                      {tools.map(({id,label,icon:Icon}) => <div key={id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[.025] p-3">
                        <div className="grid size-9 place-items-center rounded-lg bg-white/5 text-slate-300"><Icon size={15}/></div>
                        <div className="min-w-0"><div className="text-sm font-semibold">{label}</div><div className="text-[11px] text-slate-600">{selected?.tools.includes(id) ? "Enabled for selected agent" : "Not enabled"}</div></div>
                        <div className={`ml-auto size-2 rounded-full ${selected?.tools.includes(id) ? "bg-emerald-400" : "bg-slate-700"}`}/>
                      </div>)}
                    </div>
                  </section>
                </div>

                {lastRun && <RunPanel run={lastRun} />}
              </>
            )}

            {activeTab === "agents" && (
              <AgentsPanel agents={agents} selected={selected} onSelect={setSelectedId} onCreate={()=>setShowCreate(true)} onDelete={deleteAgent}/>
            )}

            {activeTab === "runs" && <RunsPanel runs={runs} onOpen={setLastRun}/>}
          </div>
        </section>
      </div>

      {showCreate && <CreateModal form={form} setForm={setForm} onClose={()=>setShowCreate(false)} onCreate={createAgent}/>}
    </main>
  );
}

function RunPanel({run}:{run:Run}) {
  return <section className="glass mt-5 rounded-3xl p-5 md:p-6">
    <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Latest execution trace</h2><p className="mt-1 text-xs text-slate-500">{run.durationMs}ms · {run.status}</p></div><CheckCircle2 className="text-emerald-300" size={18}/></div>
    <div className="grid gap-3">{run.steps.map(step=><div key={step.id} className="rounded-2xl border border-white/5 bg-black/15 p-4"><div className="mb-1 flex items-center gap-2 text-xs font-bold text-slate-300"><span className="rounded-md bg-white/5 px-2 py-1 uppercase">{step.kind}</span>{step.title}</div><pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-500">{step.content}</pre></div>)}</div>
  </section>
}

function AgentsPanel({agents,selected,onSelect,onCreate,onDelete}:{agents:Agent[];selected?:Agent;onSelect:(id:string)=>void;onCreate:()=>void;onDelete:(id:string)=>void}) {
  return <div>
    <div className="mb-6 flex items-end justify-between gap-4"><div><h1 className="text-3xl font-black">Agents</h1><p className="mt-2 text-sm text-slate-500">Specialized identities with explicit capabilities.</p></div><button onClick={onCreate} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950"><Plus size={16}/> New agent</button></div>
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {agents.map(agent=><motion.div layout key={agent.id} className={`glass rounded-3xl p-5 ${selected?.id===agent.id?"ring-1 ring-violet-400/30":""}`}>
        <div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/10 text-violet-200"><Bot size={20}/></div><button onClick={()=>onDelete(agent.id)} className="rounded-lg p-2 text-slate-600 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15}/></button></div>
        <h2 className="mt-5 font-bold">{agent.name}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{agent.description}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">{agent.tools.map(t=><span key={t} className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-400">{t}</span>)}</div>
        <button onClick={()=>onSelect(agent.id)} className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5">Select agent <ChevronRight size={15}/></button>
      </motion.div>)}
    </div>
  </div>
}

function RunsPanel({runs,onOpen}:{runs:Run[];onOpen:(r:Run)=>void}) {
  return <div><div className="mb-6"><h1 className="text-3xl font-black">Run History</h1><p className="mt-2 text-sm text-slate-500">Every execution is persisted locally for inspection.</p></div>
    <div className="glass overflow-hidden rounded-3xl">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/10 px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-600"><span>Task</span><span>Status</span><span>Duration</span></div>
      {runs.length===0 ? <div className="p-12 text-center text-sm text-slate-600">No runs yet. Execute your first task from the Command Center.</div> :
        runs.map(run=><button key={run.id} onClick={()=>onOpen(run)} className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/5 px-5 py-4 text-left hover:bg-white/[.025]">
          <div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-200">{run.task}</div><div className="mt-1 text-[11px] text-slate-600">{new Date(run.createdAt).toLocaleString()}</div></div>
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${run.status==="completed"?"bg-emerald-400/10 text-emerald-300":"bg-red-400/10 text-red-300"}`}>{run.status}</span>
          <span className="text-xs text-slate-500">{run.durationMs}ms</span>
        </button>)}
    </div>
  </div>
}

function CreateModal({form,setForm,onClose,onCreate}:{form:any;setForm:any;onClose:()=>void;onCreate:()=>void}) {
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
    <div className="glass max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-black">Create agent</h2><p className="mt-1 text-xs text-slate-500">Define identity, behavior and explicit tools.</p></div><button onClick={onClose}><X size={19}/></button></div>
      <div className="space-y-4">
        <Field label="Name"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input"/></Field>
        <Field label="Description"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="input"/></Field>
        <Field label="System prompt"><textarea value={form.systemPrompt} onChange={e=>setForm({...form,systemPrompt:e.target.value})} className="input min-h-28"/></Field>
        <Field label="Tools"><div className="grid grid-cols-2 gap-2">{tools.map(t=><button key={t.id} onClick={()=>setForm({...form,tools:form.tools.includes(t.id)?form.tools.filter((x:string)=>x!==t.id):[...form.tools,t.id]})} className={`rounded-xl border p-3 text-left text-xs font-semibold ${form.tools.includes(t.id)?"border-violet-400/30 bg-violet-400/10 text-violet-200":"border-white/10 text-slate-500"}`}>{t.label}</button>)}</div></Field>
        <button onClick={onCreate} className="mt-2 w-full rounded-xl bg-white py-3 text-sm font-black text-slate-950">Create agent</button>
      </div>
    </div>
  </div>
}

function Field({label,children}:{label:string;children:React.ReactNode}) {
  return <label className="block"><div className="mb-2 text-xs font-bold text-slate-400">{label}</div>{children}</label>
}
