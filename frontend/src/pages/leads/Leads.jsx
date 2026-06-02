import {
  ArrowRight,
  Bell,
  Brain,
  ChevronRight,
  Eye,
  FileText,
  History,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  Zap,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'

const getAuthToken = () => {
  try {
    return window.localStorage.getItem('authToken') || ''
  } catch {
    return ''
  }
}

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

const sampleRows = [
  {
    Name: 'Sarah Mathews',
    Company: 'Northstar Cloud',
    Role: 'VP Sales',
    Industry: 'SaaS',
    Email: 'sarah@northstar.io',
    'Employee Count': '420',
    'Company Tech Stack': 'Salesforce, HubSpot, AWS',
  },
  {
    Name: 'Diego Chen',
    Company: 'Vertex Labs',
    Role: 'Founder',
    Industry: 'AI Tools',
    Email: 'diego@vertexlabs.ai',
    'Employee Count': '118',
    'Company Tech Stack': 'OpenAI, Segment, Snowflake',
  },
]

const SidebarContent = () => (
  <div className="flex h-full flex-col">
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
      {navItems.map((item) => {
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
      })}
    </nav>

    <div className="mt-auto rounded-3xl border border-blue-400/20 bg-blue-500/10 p-5">
      <ShieldCheck className="mb-4 h-7 w-7 text-blue-300" />
      <p className="font-black text-white">Lead quality health</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">Your qualification model is performing above target.</p>
      <button
        type="button"
        onClick={() => {
          try { window.localStorage.clear() } catch { /* localStorage unavailable */ }
          window.location.href = '/login'
        }}
        className="mt-4 w-full rounded-2xl bg-white px-4 py-2 text-sm font-black text-black hover:bg-blue-100"
      >
        Logout
      </button>
    </div>
  </div>
)

export default function Leads() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLeads = async () => {
      const token = getAuthToken()

      if (!token) {
        setRows(sampleRows)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/leads`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load leads.')
        }

        setRows(data.leads || [])
        try {
          window.localStorage.setItem('leads', JSON.stringify(data.leads || []))
        } catch { /* localStorage unavailable */ }
      } catch (err) {
        setError(err.message || 'Unable to load leads.')
        try {
          const raw = window.localStorage.getItem('leads')
          setRows(raw ? JSON.parse(raw) : sampleRows)
        } catch {
          setRows(sampleRows)
        }
      } finally {
        setLoading(false)
      }
    }

    loadLeads()
  }, [])

  const getStatus = (row) => {
    if (row.status) {
      return row.status
    }

    const score = typeof row.score === 'number' ? row.score : Number(row.score)
    if (!Number.isNaN(score)) {
      if (score >= 80) return 'strong_qualified'
      if (score >= 70) return 'moderate'
      return 'rejected'
    }

    return 'pending'
  }

  const statusLabel = (status) => {
    switch (status) {
      case 'strong_qualified':
        return 'Strong qualified'
      case 'moderate':
        return 'Moderate'
      case 'rejected':
        return 'Rejected'
      default:
        return 'Pending'
    }
  }

  const statusClass = (status) => {
    switch (status) {
      case 'strong_qualified':
        return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25'
      case 'moderate':
        return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25'
      case 'rejected':
        return 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25'
      default:
        return 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/20'
    }
  }

  const getQualificationReason = (row) => {
    if (row.qualificationReason) return row.qualificationReason
    if (row.qualificationReasons?.length) return row.qualificationReasons.join('; ')
    if (row.aiGeneratedReasoning) return row.aiGeneratedReasoning
    return 'Pending qualification'
  }

  const total = rows.length
  const statusCounts = rows.reduce(
    (acc, row) => {
      const status = getStatus(row)
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {}
  )
  const qualified = (statusCounts.strong_qualified || 0) + (statusCounts.moderate || 0)
  const strongQualified = statusCounts.strong_qualified || 0
  const moderateQualified = statusCounts.moderate || 0
  const rejected = statusCounts.rejected || 0

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-black/95 p-5 lg:block">
        <SidebarContent />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" />
          <aside className="relative h-full w-80 max-w-[86vw] border-r border-white/10 bg-black p-5">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
              aria-label="Close navigation"
            >
              <Menu className="h-5 w-5" />
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
                <p className="text-sm font-bold text-blue-300">Leads</p>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">All Leads</h1>
              </div>
            </div>

            <div className="hidden min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 md:flex">
              <Search className="h-4 w-4 text-blue-400" />
              <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search leads, company, email" />
            </div>

            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-blue-300">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="px-5 py-6 lg:px-8">
          <section className="mb-6 rounded-[2rem] border border-white/10 bg-blue-600 p-6 shadow-2xl shadow-blue-950/35">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Total Leads</p>
                <h2 className="mt-2 text-3xl font-black text-white">{total.toLocaleString()}</h2>
                <p className="mt-2 text-sm text-blue-100">{loading ? 'Loading saved leads...' : 'Number of leads currently available in the workspace.'}</p>
              </div>
              <div className="rounded-3xl bg-black/20 p-5 text-center">
                <p className="text-sm font-bold text-blue-100">Qualified</p>
                <p className="mt-2 text-3xl font-black text-white">{qualified}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-200">{strongQualified} strong</span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-200">{moderateQualified} moderate</span>
                  <span className="rounded-full bg-red-500/10 px-2 py-1 text-red-200">{rejected} rejected</span>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">
              {error}
            </div>
          ) : null}

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Leads</p>
                <h2 className="mt-2 text-2xl font-black text-white">Lead list</h2>
              </div>
              <a href="/upload-leads" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-500">
                Upload Leads
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1240px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr className="border-b border-white/10">
                    <th className="py-3 font-bold">Name</th>
                    <th className="py-3 font-bold">Company</th>
                    <th className="py-3 font-bold">Role</th>
                    <th className="py-3 font-bold">Industry</th>
                    <th className="py-3 font-bold">Email</th>
                    <th className="py-3 font-bold">Employees</th>
                    <th className="py-3 font-bold">Tech Stack</th>
                    <th className="py-3 font-bold">Score</th>
                    <th className="py-3 font-bold">Qualification</th>
                    <th className="py-3 font-bold">Reason</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {rows.map((row, idx) => {
                    const status = getStatus(row)
                    return (
                      <tr
                        key={`${row.Email}-${idx}`}
                        className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition"
                        onClick={() => {
                          window.location.href = `/lead-detail?id=${row.id}`
                        }}
                      >
                        <td className="py-4 font-black text-white">{row.Name || '-'}</td>
                        <td className="py-4">{row.Company || '-'}</td>
                        <td className="py-4">{row.Role || '-'}</td>
                        <td className="py-4">{row.Industry || '-'}</td>
                        <td className="py-4 font-bold text-blue-300">{row.Email || '-'}</td>
                        <td className="py-4">{row['Employee Count'] || '-'}</td>
                        <td className="py-4">{row['Company Tech Stack'] || '-'}</td>
                        <td className="py-4 font-black text-white">{Number.isNaN(Number(row.score)) ? '-' : Number(row.score)}</td>
                        <td className="py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClass(status)}`}>
                            {statusLabel(status)}
                          </span>
                        </td>
                        <td className="py-4 max-w-[340px] text-sm leading-6 text-slate-300">{getQualificationReason(row)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
