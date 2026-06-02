import { BarChart3, Bell, Brain, ChevronRight, Eye, FileText, History, LayoutDashboard, Mail, Menu, Search, Settings, UploadCloud, Users, X, Zap, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

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

const emails = [
  ['Sarah Mathews', 'May 24, 2026', 'Sent'],
  ['Diego Chen', 'May 24, 2026', 'Pending'],
  ['Priya Raman', 'May 23, 2026', 'Sent'],
  ['Marcus Lee', 'May 23, 2026', 'Failed'],
  ['Elena Novak', 'May 22, 2026', 'Sent'],
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

export default function EmailHistory() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [filter, setFilter] = useState('Sent')
  const filtered = useMemo(() => emails.filter((email) => email[2] === filter), [filter])

  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-black/95 p-5 lg:block"><Sidebar /></aside>
      {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} /><aside className="relative h-full w-80 max-w-[86vw] bg-black p-5"><button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10"><X className="h-5 w-5" /></button><Sidebar /></aside></div> : null}
      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/75 backdrop-blur-2xl"><div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 lg:hidden"><Menu className="h-5 w-5" /></button><div><p className="text-sm font-bold text-blue-300">Outbound log</p><h1 className="text-2xl font-black sm:text-3xl">Email History</h1></div></div><Bell className="h-5 w-5 text-blue-300" /></div></header>
        <div className="px-5 py-6 lg:px-8">
          <section className="mb-6 rounded-[2rem] border border-white/10 bg-blue-600 p-6 shadow-2xl shadow-blue-950/35">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-black"><History className="h-4 w-4 text-blue-600" />Email delivery history</div><h2 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Track every generated outreach email.</h2><p className="mt-4 text-blue-100">Filter sent, pending, and failed messages across all qualified leads.</p></div><div className="rounded-3xl bg-black/20 p-5 text-center"><p className="text-sm text-blue-100">Total Emails</p><p className="mt-2 text-5xl font-black">{emails.length}</p></div></div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex flex-wrap gap-3">{['Sent', 'Pending', 'Failed'].map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-5 py-2 text-sm font-black transition ${filter === item ? 'bg-blue-600 text-white' : 'border border-white/10 bg-black/50 text-slate-400 hover:text-white'}`}>{item}</button>)}</div>
              <div className="flex min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-black/50 px-4 py-3"><Search className="h-4 w-4 text-blue-400" /><input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search lead" /></div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-white/[0.04] text-slate-500"><tr><th className="px-4 py-4 font-black">Lead</th><th className="px-4 py-4 font-black">Date</th><th className="px-4 py-4 font-black">Status</th></tr></thead>
                <tbody>{filtered.map(([lead, date, status]) => <tr key={lead} className="border-t border-white/5 text-slate-300"><td className="px-4 py-4 font-black text-white">{lead}</td><td className="px-4 py-4">{date}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${status === 'Sent' ? 'bg-blue-600 text-white' : status === 'Pending' ? 'bg-blue-300/15 text-blue-200' : 'bg-red-500/15 text-red-300'}`}>{status}</span></td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
