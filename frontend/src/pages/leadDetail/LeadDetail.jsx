import {
  ArrowLeft,
  Bell,
  Brain,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  History,
  LayoutDashboard,
  Mail,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  X,
  Zap,
  AlertCircle,
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
  { label: 'Leads', icon: Users, href: '/leads' },
  { label: 'Email Preview', icon: Eye, href: '/email-preview' },
  { label: 'Email History', icon: History, href: '/email-history' },
  { label: 'Settings', icon: Settings, href: '#' },
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

const getStatusColor = (status) => {
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

const statusLabel = (status) => {
  switch (status) {
    case 'strong_qualified':
      return 'Strong Qualified'
    case 'moderate':
      return 'Moderate Fit'
    case 'rejected':
      return 'Rejected'
    default:
      return 'Pending'
  }
}

export default function LeadDetail() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLead = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const leadId = params.get('id')

        if (!leadId) {
          setError('No lead ID provided')
          setLoading(false)
          return
        }

        const token = getAuthToken()
        if (!token) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/leads?leadId=${leadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Failed to load lead')
        }

        const data = await response.json()
        const foundLead = data.leads?.[0]

        if (!foundLead) {
          setError('Lead not found')
        } else {
          setLead(foundLead)
        }
      } catch (err) {
        setError(err.message || 'Failed to load lead')
      } finally {
        setLoading(false)
      }
    }

    loadLead()
  }, [])

  const score = typeof lead?.score === 'number' ? lead.score : Number(lead?.score)
  const status = lead?.status || (score >= 80 ? 'strong_qualified' : score >= 70 ? 'moderate' : 'rejected')

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
              <div className="flex items-center gap-3">
                <a href="/leads" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </a>
                <div>
                  <p className="text-sm font-bold text-blue-300">Lead Detail</p>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{lead?.Name || 'Loading...'}</h1>
                </div>
              </div>
            </div>

            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-blue-300">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="px-5 py-6 lg:px-8">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
              <p className="text-slate-400">Loading lead details...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">
              {error}
            </div>
          ) : lead ? (
            <div className="grid gap-6">
              {/* Summary Card */}
              <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600 to-blue-700 p-6 shadow-2xl">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Score */}
                  <div className="rounded-2xl bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">Fit Score</p>
                    <p className="mt-4 text-5xl font-black text-white">{!Number.isNaN(score) ? score : '-'}</p>
                    <p className="mt-2 text-sm text-blue-100">Out of 100 points</p>
                  </div>

                  {/* Status */}
                  <div className="rounded-2xl bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">Qualification</p>
                    <div className="mt-4">
                      <span className={`inline-block rounded-full px-4 py-2 text-sm font-black ${getStatusColor(status)}`}>
                        {statusLabel(status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-blue-100">Based on ICP match</p>
                  </div>

                  {/* Priority */}
                  <div className="rounded-2xl bg-black/20 p-6 backdrop-blur-sm">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">Priority</p>
                    <p className="mt-4 text-2xl font-black text-white capitalize">{lead?.priorityLevel || 'medium'}</p>
                    <p className="mt-2 text-sm text-blue-100">Action urgency level</p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <h2 className="mb-6 text-2xl font-black text-white">Contact Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Full Name</p>
                    <p className="mt-2 text-lg font-black text-white">{lead?.Name || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Email</p>
                    <p className="mt-2 font-bold text-blue-300 break-all">{lead?.Email || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Company</p>
                    <p className="mt-2 text-lg font-black text-white">{lead?.Company || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Role</p>
                    <p className="mt-2 text-lg font-black text-white">{lead?.Role || '-'}</p>
                  </div>
                </div>
              </section>

              {/* Company Profile */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <h2 className="mb-6 text-2xl font-black text-white">Company Profile</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Industry</p>
                    <p className="mt-2 text-lg font-bold text-white">{lead?.Industry || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Employee Count</p>
                    <p className="mt-2 text-lg font-bold text-white">{lead?.['Employee Count'] || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Currently Hiring</p>
                    <p className="mt-2 text-lg font-bold text-white">{lead?.['Currently Hiring'] || 'Unknown'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Tech Stack</p>
                    <p className="mt-2 text-sm text-slate-300">{lead?.['Company Tech Stack'] || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Funding Stage</p>
                    <p className="mt-2 text-lg font-bold text-white">{lead?.['Funding Stage'] || 'Unknown'}</p>
                  </div>
                </div>
              </section>

              {/* Qualification Reasoning */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <h2 className="mb-6 text-2xl font-black text-white">Qualification Analysis</h2>

                {/* Main Reason */}
                <div className="mb-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Primary Reason</p>
                  <p className="mt-2 text-base leading-7 text-slate-100">{lead?.qualificationReason || lead?.aiGeneratedReasoning || 'No reasoning available'}</p>
                </div>

                {/* Qualification factors */}
                {lead?.qualificationReasons && lead.qualificationReasons.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                      <FileText className="h-5 w-5 text-blue-400" />
                      Qualification factors
                    </h3>
                    <div className="space-y-2">
                      {lead.qualificationReasons.map((reason, idx) => (
                        <div key={idx} className="flex gap-3 rounded-xl bg-slate-900/70 p-3">
                          <span className="text-blue-300">•</span>
                          <span className="text-slate-300">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overall summary */}
                {lead?.researchSummary && (
                  <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4">
                    <p className="text-sm leading-7 text-slate-300">{lead.researchSummary}</p>
                  </div>
                )}

                {/* Strengths */}
                {lead?.strengths && lead.strengths.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      Strengths
                    </h3>
                    <div className="space-y-2">
                      {lead.strengths.map((strength, idx) => (
                        <div key={idx} className="flex gap-3 rounded-xl bg-emerald-500/10 p-3">
                          <span className="text-emerald-400">✓</span>
                          <span className="text-emerald-100">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {lead?.weaknesses && lead.weaknesses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                      Areas of Concern
                    </h3>
                    <div className="space-y-2">
                      {lead.weaknesses.map((weakness, idx) => (
                        <div key={idx} className="flex gap-3 rounded-xl bg-amber-500/10 p-3">
                          <span className="text-amber-400">!</span>
                          <span className="text-amber-100">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Action */}
                {lead?.recommendedAction && (
                  <div>
                    <h3 className="mb-4 text-lg font-bold text-white">Recommended Action</h3>
                    <div className="rounded-2xl border border-blue-400/30 bg-blue-500/15 p-4">
                      <p className="text-base text-blue-100">{lead.recommendedAction}</p>
                    </div>
                  </div>
                )}
              </section>

              {/* AI Reasoning */}
              {lead?.aiGeneratedReasoning && (
                <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                  <h2 className="mb-4 text-lg font-bold text-white">AI Generated Insights</h2>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm leading-7 text-slate-300">{lead.aiGeneratedReasoning}</p>
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
