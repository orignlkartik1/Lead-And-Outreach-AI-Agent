import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Brain,
  Eye,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const metrics = [
  {
    label: 'Total Leads',
    value: '12,840',
    change: '+18.4%',
    icon: Users,
    tone: 'from-blue-500/25 to-blue-500/5',
  },
  {
    label: 'Qualified Leads',
    value: '8,214',
    change: '+24.1%',
    icon: UserCheck,
    tone: 'from-emerald-400/20 to-blue-500/5',
  },
  {
    label: 'Rejected Leads',
    value: '2,106',
    change: '-6.8%',
    icon: XCircle,
    tone: 'from-red-400/20 to-blue-500/5',
  },
  {
    label: 'Email Sent',
    value: '42,390',
    change: '+31.7%',
    icon: Mail,
    tone: 'from-cyan-400/20 to-blue-500/5',
  },
]

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Upload Leads', icon: UploadCloud, href: '/upload-leads' },
  { label: 'ICP Settings', icon: Brain, href: '/icp-settings' },
  { label: 'Lead Detail', icon: FileText, href: '/lead-detail' },
  { label: 'Email Preview', icon: Eye, href: '/email-preview' },
  { label: 'Email History', icon: History, href: '/email-history' },
  { label: 'Leads', icon: Users, href: '/leads' },
  { label: 'Automation', icon: Sparkles, href: '#' },
  { label: 'Settings', icon: Settings, href: '#' },
]

const activity = [
  { title: 'Lead qualified', text: 'Sarah Mathews from Northstar Cloud scored 94.', time: '2 min ago', icon: CheckCircle2 },
  { title: 'Email sequence sent', text: 'Welcome sequence delivered to 186 new leads.', time: '18 min ago', icon: Mail },
  { title: 'Lead rejected', text: '42 contacts failed ICP and domain checks.', time: '41 min ago', icon: XCircle },
  { title: 'Team update', text: 'No of employee data refreshed for 1,290 companies.', time: '1 hr ago', icon: Users },
]

const conversionPoints = [28, 42, 36, 58, 52, 71, 66, 84]

const getStoredUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem('user')) || {}
  } catch (error) {
    return {}
  }
}

const getUserInitials = (name = '', email = '') => {
  const source = name || email
  return source
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U'
}

const handleLogout = () => {
  try {
    window.localStorage.clear()
  } catch (error) {
    // Continue to the login page even if local storage is unavailable.
  }
  window.location.href = '/login'
}

const SidebarContent = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const user = getStoredUser()
  const userName = user.name || 'Logged in user'
  const userEmail = user.email || 'user@leadflow.ai'
  const initials = getUserInitials(userName, userEmail)

  return (
    <div className="flex min-h-full flex-col">
      <a href="/" className="mb-9 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
          <Zap className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-black tracking-tight text-white">LeadFlow AI</p>
          <p className="text-xs font-semibold text-blue-300">Qualification Suite</p>
        </div>
      </a>

      <nav className="space-y-2">
        {navItems.map((item) => (
          (() => {
            const active = window.location.pathname === item.href
            return (
          <a
            href={item.href}
            key={item.label}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
              active
                ? 'bg-blue-600 text-white shadow-[0_18px_45px_rgba(37,99,235,0.25)]'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-blue-400'}`} />
              {item.label}
            </span>
            {active ? <ChevronRight className="h-4 w-4" /> : null}
          </a>
            )
          })()
        ))}
      </nav>

      <div className="mt-8 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-5">
        <ShieldCheck className="mb-4 h-7 w-7 text-blue-300" />
        <p className="font-black text-white">Lead quality health</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">Your qualification model is performing above target.</p>
        <div className="mt-4 h-2 rounded-full bg-black">
          <div className="h-full w-[82%] rounded-full bg-blue-500" />
        </div>
      </div>

      <div className="relative mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white ring-1 ring-blue-300/30">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-white">{userName}</p>
            <p className="truncate text-xs font-semibold text-slate-400">{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-white/10 text-blue-300 transition hover:bg-white/10 hover:text-white"
            aria-expanded={menuOpen}
            aria-label="Open user menu"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {menuOpen ? (
          <div className="absolute bottom-[calc(100%+0.75rem)] left-0 right-0 z-20 overflow-hidden rounded-3xl border border-white/10 bg-black/95 p-2 shadow-2xl shadow-black/40">
            <a href="#" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
              <User className="h-4 w-4 text-blue-400" />
              View profile
            </a>
            <a href="#" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
              <Settings className="h-4 w-4 text-blue-400" />
              Setting
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
            >
              <LogOut className="h-4 w-4 text-red-300" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const MetricCard = ({ item }) => (
  <div className={`rounded-3xl border border-white/10 bg-gradient-to-br ${item.tone} p-5 shadow-xl shadow-black/20`}>
    <div className="flex items-start justify-between gap-4">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/70 text-blue-300 ring-1 ring-white/10">
        <item.icon className="h-6 w-6" />
      </span>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">{item.change}</span>
    </div>
    <p className="mt-7 text-sm font-bold text-slate-400">{item.label}</p>
    <p className="mt-2 text-3xl font-black tracking-tight text-white">{item.value}</p>
  </div>
)

const PieChart = () => {
  const circumference = 100
  const qualified = 64
  const rejected = 16
  const pending = 20

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Lead Quality</p>
          <h2 className="mt-2 text-2xl font-black text-white">Quality breakdown</h2>
        </div>
        <Gauge className="h-6 w-6 text-blue-300" />
      </div>

      <div className="grid gap-6 sm:grid-cols-[13rem_1fr] sm:items-center">
        <div className="relative mx-auto h-52 w-52">
          <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#2563eb" strokeWidth="5" strokeDasharray={`${qualified} ${circumference - qualified}`} strokeDashoffset="0" />
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#60a5fa" strokeWidth="5" strokeDasharray={`${pending} ${circumference - pending}`} strokeDashoffset={`-${qualified}`} />
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ef4444" strokeWidth="5" strokeDasharray={`${rejected} ${circumference - rejected}`} strokeDashoffset={`-${qualified + pending}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white">64%</span>
            <span className="text-sm font-bold text-blue-300">Qualified</span>
          </div>
        </div>

        <div className="space-y-4">
          {[
            ['Qualified', '64%', 'bg-blue-600'],
            ['Pending review', '20%', 'bg-blue-300'],
            ['Rejected', '16%', 'bg-red-500'],
          ].map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-black/50 p-4">
              <span className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <span className={`h-3 w-3 rounded-full ${color}`} />
                {label}
              </span>
              <span className="font-black text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ConversionGraph = () => {
  const points = conversionPoints
    .map((value, index) => {
      const x = 20 + index * 52
      const y = 130 - value
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Conversion Graph</p>
          <h2 className="mt-2 text-2xl font-black text-white">Lead to customer trend</h2>
        </div>
        <span className="w-fit rounded-full bg-blue-500/15 px-3 py-1 text-sm font-black text-blue-300">+12.6% this week</span>
      </div>

      <div className="overflow-hidden rounded-2xl bg-black/50 p-4">
        <svg viewBox="0 0 400 160" className="h-64 w-full">
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[30, 60, 90, 120].map((y) => (
            <line key={y} x1="10" x2="390" y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
          ))}
          <polygon points={`20,150 ${points} 384,150`} fill="url(#lineFill)" />
          <polyline points={points} fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {conversionPoints.map((value, index) => (
            <circle key={value + index} cx={20 + index * 52} cy={130 - value} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
          ))}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3 text-center text-xs font-bold text-slate-500 sm:grid-cols-8">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Now'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="scrollbar-hidden fixed inset-y-0 left-0 z-40 hidden w-72 overflow-y-auto border-r border-white/10 bg-black/95 p-5 lg:block">
        <SidebarContent />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" />
          <aside className="scrollbar-hidden relative h-full w-80 max-w-[86vw] overflow-y-auto border-r border-white/10 bg-black p-5">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      ) : null}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/75 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-bold text-blue-300">Lead qualification dashboard</p>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Performance Overview</h1>
              </div>
            </div>

            <div className="hidden min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 md:flex">
              <Search className="h-4 w-4 text-blue-400" />
              <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search leads, campaign, employee count" />
            </div>

            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-blue-300">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="px-5 py-6 lg:px-8">
          <section className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-blue-600 p-6 shadow-2xl shadow-blue-950/35">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-black">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Live pipeline health
                </div>
                <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                  82% of reviewed leads are moving toward sales-ready status.
                </h2>
                <p className="mt-4 max-w-2xl text-blue-100">Track lead success, rejected leads, email volume, and no of employee signals in one responsive workspace.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-80">
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-blue-100">No of Employee</p>
                  <p className="mt-2 text-3xl font-black text-white">186</p>
                </div>
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-blue-100">Lead Success</p>
                  <p className="mt-2 text-3xl font-black text-white">71%</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => (
              <MetricCard key={item.label} item={item} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <PieChart />
            <ConversionGraph />
          </section>

          <section className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.58fr)]">
            <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Lead Table</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Recent high-value leads</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-slate-500">
                    <tr className="border-b border-white/10">
                      <th className="py-3 font-bold">Lead</th>
                      <th className="py-3 font-bold">Status</th>
                      <th className="py-3 font-bold">Employees</th>
                      <th className="py-3 font-bold">Email</th>
                      <th className="py-3 font-bold">Score</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {[
                      ['Northstar Cloud', 'Qualified', '420', 'Sent', '94'],
                      ['Vertex Labs', 'Qualified', '118', 'Sent', '89'],
                      ['BluePeak CRM', 'Review', '52', 'Queued', '76'],
                      ['Atlas Finance', 'Rejected', '9', 'Skipped', '32'],
                    ].map((row) => (
                      <tr key={row[0]} className="border-b border-white/5">
                        <td className="py-4 font-black text-white">{row[0]}</td>
                        <td className="py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${row[1] === 'Rejected' ? 'bg-red-500/15 text-red-300' : row[1] === 'Review' ? 'bg-blue-300/15 text-blue-200' : 'bg-blue-600 text-white'}`}>
                            {row[1]}
                          </span>
                        </td>
                        <td className="py-4">{row[2]}</td>
                        <td className="py-4">{row[3]}</td>
                        <td className="py-4 font-black text-blue-300">{row[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-5 xl:sticky xl:top-28">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Activity Feed</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Latest actions</h2>
                </div>
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
                  <Activity className="h-6 w-6" />
                </span>
              </div>

              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item.title} className="flex min-w-0 gap-4 rounded-2xl bg-black/50 p-4">
                    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="font-black text-white">{item.title}</p>
                        <span className="text-xs font-bold text-slate-500">{item.time}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}
