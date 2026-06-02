import { ArrowLeft, BarChart3, Bell, Brain, ChevronRight, Edit3, Eye, FileText, History, LayoutDashboard, Mail, Menu, RefreshCw, Send, Settings, Sparkles, UploadCloud, Users, X, Zap, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Upload Leads', icon: UploadCloud, href: '/upload-leads' },
  { label: 'ICP Settings', icon: Brain, href: '/icp-settings' },
  { label: 'Lead Detail', icon: FileText, href: '/lead-detail' },
  { label: 'Email Preview', icon: Eye, href: '/email-preview' },
  { label: 'Email History', icon: History, href: '/email-history' },
  { label: 'Leads', icon: Users, href: '/leads' },
  { label: 'Settings', icon: Settings, href: '#' },
]

const Sidebar = () => (
  <div className="flex h-full flex-col">
    <a href="/" className="mb-9 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black"><Zap className="h-6 w-6" /></span><div><p className="text-lg font-black text-white">LeadFlow AI</p><p className="text-xs font-semibold text-blue-300">Qualification Suite</p></div></a>
    <nav className="space-y-2">{navItems.map((item) => { const active = window.location.pathname === item.href; return <a key={item.label} href={item.href} className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? 'bg-blue-600 text-white shadow-[0_18px_45px_rgba(37,99,235,0.25)]' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}><span className="flex items-center gap-3"><item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-blue-400'}`} />{item.label}</span>{active ? <ChevronRight className="h-4 w-4" /> : null}</a> })}</nav>
    <div className="mt-auto rounded-3xl border border-blue-400/20 bg-blue-500/10 p-5">
      <ShieldCheck className="mb-4 h-7 w-7 text-blue-300" />
      <p className="font-black text-white">LeadFlow AI</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">Qualification Suite</p>
      <button
        type="button"
        onClick={() => {
          try { window.localStorage.clear() } catch (e) {}
          window.location.href = '/login'
        }}
        className="mt-4 w-full rounded-2xl bg-white px-4 py-2 text-sm font-black text-black hover:bg-blue-100"
      >
        Logout
      </button>
    </div>
  </div>
)

export default function EmailPreview() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const subject = 'Sarah, quick idea for Northstar Cloud pipeline quality'
  const body = `Hi Sarah,\n\nI noticed Northstar Cloud is scaling a revenue team across a 420-person SaaS organization. LeadFlow AI helps teams like yours qualify inbound leads automatically, explain each score, and send the best-fit accounts directly to sales.\n\nBased on your role and company profile, I thought this could help reduce manual lead review while keeping reps focused on high-intent accounts.\n\nWould you be open to a short walkthrough this week?\n\nBest,\nLeadFlow AI`

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-black/95 p-5 lg:block"><Sidebar /></aside>
      {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} /><aside className="relative h-full w-80 max-w-[86vw] bg-black p-5"><button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10"><X className="h-5 w-5" /></button><Sidebar /></aside></div> : null}
      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/75 backdrop-blur-2xl"><div className="flex items-center justify-between px-5 py-4 lg:px-8"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 lg:hidden"><Menu className="h-5 w-5" /></button><div><p className="text-sm font-bold text-blue-300">Outbound composer</p><h1 className="text-2xl font-black sm:text-3xl">Email Preview</h1></div></div><Bell className="h-5 w-5 text-blue-300" /></div></header>
        <div className="px-5 py-6 lg:px-8">
          <section className="mb-6 rounded-[2rem] border border-white/10 bg-blue-600 p-6 shadow-2xl shadow-blue-950/35">
            <a href="/lead-detail" className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-black"><ArrowLeft className="h-4 w-4 text-blue-600" />Back to lead</a>
            <h2 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Review generated email before sending.</h2>
            <p className="mt-4 text-blue-100">Subject and body are personalized from the lead profile, ICP match, and qualification reason.</p>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <label className="block"><span className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-blue-400">Subject</span><input value={subject} readOnly className="h-14 w-full rounded-2xl border border-white/10 bg-black/60 px-4 text-lg font-black text-white outline-none" /></label>
              <label className="mt-6 block"><span className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-blue-400">Email body</span><textarea value={body} readOnly rows={14} className="w-full resize-none rounded-2xl border border-white/10 bg-black/60 p-4 leading-8 text-slate-300 outline-none" /></label>
            </div>
            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 xl:sticky xl:top-28">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><Mail className="h-7 w-7" /></div>
              <h2 className="text-2xl font-black">Ready actions</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Edit the draft, regenerate with a new angle, or send it to the lead.</p>
              <div className="mt-6 space-y-3">
                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/50 font-black text-blue-300 hover:border-blue-400/50"><Edit3 className="h-4 w-4" />Edit</button>
                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/50 font-black text-blue-300 hover:border-blue-400/50"><RefreshCw className="h-4 w-4" />Regenerate</button>
                <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-black text-white hover:bg-blue-500"><Send className="h-4 w-4" />Send</button>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}
