import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  History,
  LayoutDashboard,
  Mail,
  Map,
  Menu,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const parseCommaList = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

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
      <Brain className="mb-4 h-7 w-7 text-blue-300" />
      <p className="font-black text-white">ICP brain</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">These rules guide lead scoring, rejection, routing, and email targeting.</p>
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



export default function IcpSettings() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [customIcp, setCustomIcp] = useState('')
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [painPoints, setPainPoints] = useState('')
  const [preferredDepartments, setPreferredDepartments] = useState('')
  const [targetRoles, setTargetRoles] = useState('')
  const [industries, setIndustries] = useState('')
  const [companySizeMin, setCompanySizeMin] = useState('')
  const [companySizeMax, setCompanySizeMax] = useState('')
  const [preferredLocations, setPreferredLocations] = useState('')
  const [targetTechStack, setTargetTechStack] = useState('')
  const [fundingStage, setFundingStage] = useState('')
  const [recentTriggerEvents, setRecentTriggerEvents] = useState('')
  const [currentlyHiring, setCurrentlyHiring] = useState('')
  const [leadBatchId, setLeadBatchId] = useState('')

  const normalizeToString = (value) => {
    if (value === null || value === undefined) return ''
    return typeof value === 'string' ? value : String(value)
  }
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const [pendingBatch, setPendingBatch] = useState(null)
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    const loadSavedBatchId = () => {
      try {
        const savedBatch = window.localStorage.getItem('leadBatchId')
        if (savedBatch) setLeadBatchId(savedBatch)
      } catch {
        // ignore localStorage issues
      }
    }

    const loadIcpProfile = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) return

      try {
        const response = await fetch('http://localhost:5000/icp/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          const icp = data.icp || {}
          setCustomIcp(icp.customIcp || '')
          setProductName(icp.productName || '')
          setProductDescription(icp.productDescription || '')
          setPainPoints((icp.productCapabilities || []).join(', '))
          setPreferredDepartments((icp.preferredDepartments || []).join(', '))
          setTargetRoles((icp.targetRoles || []).join(', '))
          setIndustries((icp.targetIndustries || []).join(', '))
          setCompanySizeMin(normalizeToString(icp.companySizeMin))
          setCompanySizeMax(normalizeToString(icp.companySizeMax))
          setPreferredLocations((icp.targetLocations || []).join(', '))
          setTargetTechStack((icp.targetTechStack || []).join(', '))
          setFundingStage(icp.targetFundingStage || '')
          setRecentTriggerEvents(icp.recentTriggerEvents || '')
        }
      } catch {
        // ignore fetch errors
      }
    }

    loadSavedBatchId()
    loadIcpProfile()
    
    try {
      const pendingBatchStr = window.localStorage.getItem('pendingBatchForIcp')
      if (pendingBatchStr) {
        setPendingBatch(JSON.parse(pendingBatchStr))
      }
    } catch {}
  }, [])

  const compareWithUploadedBatch = async () => {
    if (!pendingBatch?.id) return

    setComparing(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:5000/leads/batches/${pendingBatch.id}/qualify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to compare with uploaded batch.')
      }

      try {
        window.localStorage.setItem('currentBatch', JSON.stringify(data.batch || pendingBatch))
        window.localStorage.setItem('leads', JSON.stringify(data.leads || []))
        window.localStorage.setItem('qualificationResults', JSON.stringify(data.qualification_results || []))
        window.localStorage.removeItem('pendingBatchForIcp')
      } catch {}

      setTimeout(() => {
        window.location.href = '/leads'
      }, 500)
    } catch (err) {
      setError('Error during comparison: ' + err.message)
      setComparing(false)
    }
  }

  const saveIcp = async () => {
    if (!customIcp.trim() && !productName.trim() && !productDescription.trim() && !industries.trim() && !targetRoles.trim()) {
      setError('Please provide at least one ICP field before saving')
      return
    }

    if (!currentlyHiring.trim()) {
      setError('Please select a Currently Hiring preference in ICP settings.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('You are not logged in')
        setSaving(false)
        return
      }

      const parseNumber = (value) => {
        const raw = normalizeToString(value).trim()
        const parsed = Number(raw)
        return Number.isFinite(parsed) ? parsed : null
      }

      const companySizeMinValue = normalizeToString(companySizeMin)
      const companySizeMaxValue = normalizeToString(companySizeMax)

      const icpData = {
        customIcp: customIcp.trim(),
        productName: productName.trim(),
        productDescription: productDescription.trim(),
        productCapabilities: parseCommaList(painPoints),
        preferredDepartments: parseCommaList(preferredDepartments),
        targetIndustries: parseCommaList(industries),
        targetRoles: parseCommaList(targetRoles),
        companySizeMin: companySizeMinValue.trim() ? parseNumber(companySizeMinValue) : null,
        companySizeMax: companySizeMaxValue.trim() ? parseNumber(companySizeMaxValue) : null,
        targetLocations: parseCommaList(preferredLocations),
        targetTechStack: parseCommaList(targetTechStack),
        targetFundingStage: fundingStage.trim(),
        recentTriggerEvents: recentTriggerEvents.trim(),
        targetCurrentlyHiring: currentlyHiring.trim(),
      }

      const response = await fetch('http://localhost:5000/icp/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(icpData),
      })

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        try {
          window.localStorage.setItem('icpProfile', JSON.stringify(data.icp || icpData))
        } catch {
          // ignore localStorage errors
        }
        setSaved(true)
        await runTest()
        
        if (pendingBatch?.id) {
          window.setTimeout(() => {
            setSaved(false)
            compareWithUploadedBatch()
          }, 1500)
        } else {
          window.setTimeout(() => setSaved(false), 2200)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError('Failed to save ICP: ' + (errorData.error || response.statusText))
      }
    } catch (err) {
      setError('Error saving ICP: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const runTest = async () => {
    setTesting(true)
    setError('')
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Not authenticated')
        setTesting(false)
        return
      }

      const batchId = leadBatchId || window.localStorage.getItem('leadBatchId')
      if (!batchId) {
        setError('No uploaded CSV batch found. Please upload leads first.')
        setTesting(false)
        return
      }

      const response = await fetch(`http://localhost:5000/leads/batches/${batchId}/qualify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const results = data.leads || []
        const qualifiedCount = results.filter((r) => r.status === 'strong_qualified').length
        setTestResults({
          total: results.length,
          qualifiedCount,
          results: results.slice(0, 8),
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError('Failed to run test: ' + (errorData.error || response.statusText))
      }
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setTesting(false)
    }
  }

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
                <p className="text-sm font-bold text-blue-300">Ideal customer profile</p>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">ICP Settings</h1>
              </div>
            </div>

            <div className="hidden min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 md:flex">
              <Search className="h-4 w-4 text-blue-400" />
              <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search ICP rules" />
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
                  <Brain className="h-4 w-4 text-blue-600" />
                  Brain of the qualification engine
                </div>
                <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                  Define exactly what a high-fit lead looks like.
                </h2>
                <p className="mt-4 max-w-2xl text-blue-100">These settings control scoring, rejection, routing, and the quality threshold used across your app.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-80">
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-blue-100">Fit score weight</p>
                  <p className="mt-2 text-3xl font-black text-white">86%</p>
                </div>
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-blue-100">Rules active</p>
                  <p className="mt-2 text-3xl font-black text-white">5</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="mb-8 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-6">
                <h2 className="mb-2 text-2xl font-black text-white">Write Your ICP Criteria</h2>
                <p className="text-sm text-blue-200">
                  Describe exactly what makes a lead qualified for your product. Be specific about industries, company size, roles, tech stack, pain points, or any other criteria. The AI will use this to score your leads.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Product / Project Name</label>
                    <input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Tumhara product/project naam"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Product Description</label>
                    <input
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Product kya karta hai"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-white">Pain Points</label>
                  <textarea
                    value={painPoints}
                    onChange={(e) => setPainPoints(e.target.value)}
                    placeholder="Kaunsi problems solve karta hai (comma-separated)"
                    rows={4}
                    className="w-full resize-none rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Preferred Departments</label>
                    <input
                      value={preferredDepartments}
                      onChange={(e) => setPreferredDepartments(e.target.value)}
                      placeholder="Kis department ko useful"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Target Decision Makers</label>
                    <input
                      value={targetRoles}
                      onChange={(e) => setTargetRoles(e.target.value)}
                      placeholder="Kisko target karna hai (comma-separated)"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Industries</label>
                    <input
                      value={industries}
                      onChange={(e) => setIndustries(e.target.value)}
                      placeholder="Kaunsi industries ideal hain (comma-separated)"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-white">Company Size Min</label>
                      <input
                        value={companySizeMin}
                        onChange={(e) => setCompanySizeMin(e.target.value)}
                        placeholder="Kitni badi company chahiye"
                        className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-white">Company Size Max</label>
                      <input
                        value={companySizeMax}
                        onChange={(e) => setCompanySizeMax(e.target.value)}
                        placeholder="Maximum employees"
                        className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Preferred Locations</label>
                    <input
                      value={preferredLocations}
                      onChange={(e) => setPreferredLocations(e.target.value)}
                      placeholder="Kis location ki companies"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Preferred Tech Stack</label>
                    <input
                      value={targetTechStack}
                      onChange={(e) => setTargetTechStack(e.target.value)}
                      placeholder="Kaunsi technologies wali companies"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Funding Stage</label>
                    <input
                      value={fundingStage}
                      onChange={(e) => setFundingStage(e.target.value)}
                      placeholder="Kis growth stage ki companies"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-white">Recent Triggers</label>
                    <input
                      value={recentTriggerEvents}
                      onChange={(e) => setRecentTriggerEvents(e.target.value)}
                      placeholder="Kaunsi activities buying intent dikhati hain"
                      className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-white">Currently Hiring?</label>
                  <select
                    value={currentlyHiring}
                    onChange={(e) => setCurrentlyHiring(e.target.value)}
                    className="w-full rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <p className="text-xs text-slate-500">Lead score gets a boost when ICP prefers currently hiring companies.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-white">Your Custom ICP</label>
                  <textarea
                    value={customIcp}
                    onChange={(e) => setCustomIcp(e.target.value)}
                    placeholder="Example: We target B2B SaaS companies with 50-500 employees. Must have a sales team, using Salesforce or HubSpot. Company should have raised at least Series A funding. Looking for companies in US, UK, or Canada. Ideal roles are VP Sales, Head of Growth, or RevOps Manager. Companies using our tech stack (AWS, Slack, modern APIs) are a strong fit..."
                    rows={10}
                    className="w-full resize-none rounded-3xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  />
                  <p className="text-xs text-slate-500">Tip: Use this field for broader ICP notes, or leave it blank if you prefer fully structured fields.</p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={saveIcp}
                disabled={saving || comparing || (!customIcp.trim() && !productName.trim() && !productDescription.trim())}
                className="mt-6 inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-[0_18px_55px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {comparing ? 'Comparing...' : saving ? 'Saving...' : pendingBatch?.id ? 'Save and Compare' : 'Save ICP & Compare'}
              </button>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 xl:sticky xl:top-28">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">ICP Preview</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Your criteria</h2>
                </div>
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
                  <Brain className="h-6 w-6" />
                </span>
              </div>

              <div className="rounded-2xl bg-black/50 p-4 max-h-48 overflow-auto">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Current ICP</p>
                <p className="text-sm text-slate-300 leading-6 whitespace-pre-wrap break-words">
                  {customIcp.trim() ? customIcp : (
                    productName || productDescription || industries || targetRoles || preferredLocations || targetTechStack
                  ) ? (
                    `Product: ${productName || 'N/A'}\nDescription: ${productDescription || 'N/A'}\nPain Points: ${painPoints || 'N/A'}\nPreferred Departments: ${preferredDepartments || 'N/A'}\nDecision Makers: ${targetRoles || 'N/A'}\nIndustries: ${industries || 'N/A'}\nCompany Size: ${companySizeMin || 'Any'} - ${companySizeMax || 'Any'}\nLocations: ${preferredLocations || 'N/A'}\nTech Stack: ${targetTechStack || 'N/A'}\nFunding Stage: ${fundingStage || 'N/A'}\nCurrently Hiring: ${currentlyHiring || 'Any'}\nRecent Triggers: ${recentTriggerEvents || 'N/A'}`
                  ) : (
                    '(Write your ICP above)'
                  )}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
                <p className="flex items-center gap-2 font-black text-blue-100">
                  <CheckCircle2 className="h-5 w-5 text-blue-300" />
                  How it works
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {pendingBatch?.id ? (
                    <>1. Upload your CSV<br/>2. Fill ICP criteria<br/>3. Click "Save and Compare"<br/>4. See qualified leads</>
                  ) : (
                    <>1. Upload CSV from Upload Leads page<br/>2. Write your ICP criteria<br/>3. Click "Save and Compare"<br/>4. Results shown here</>
                  )}
                </p>
              </div>

              {saved ? (
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-black text-black">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  {pendingBatch?.id ? 'ICP saved! Comparing against your CSV...' : 'ICP saved!'}
                </div>
              ) : null}

              <div className="mt-5">
                {testResults ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-black/50 p-4">
                      <p className="text-sm font-black text-slate-400">Total leads</p>
                      <p className="mt-1 text-2xl font-black text-white">{testResults.total}</p>
                    </div>
                    <div className="rounded-2xl bg-black/50 p-4">
                      <p className="text-sm font-black text-slate-400">Qualified</p>
                      <p className="mt-1 text-2xl font-black text-emerald-400">{testResults.qualifiedCount}</p>
                    </div>

                    <div className="rounded-2xl bg-black/50 p-4">
                      <p className="text-sm font-black text-slate-400 mb-2">Sample results</p>
                      <div className="max-h-40 overflow-auto text-xs text-slate-300">
                        <table className="w-full text-left">
                          <thead className="text-slate-500 sticky top-0 bg-black">
                            <tr>
                              <th className="py-2">Name</th>
                              <th className="py-2">Company</th>
                              <th className="py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {testResults.results.map((r, i) => (
                              <tr key={`${r.Email}-${i}`} className="border-t border-white/5">
                                <td className="py-2 font-black text-white">{r.Name || '-'}</td>
                                <td className="py-2">{r.Company || '-'}</td>
                                <td className="py-2">
                                  {r.status === 'strong_qualified' ? (
                                    <span className="text-emerald-400 font-black">✓ Qualified</span>
                                  ) : r.status === 'moderate' ? (
                                    <span className="text-amber-400 font-black">~ Moderate</span>
                                  ) : (
                                    <span className="text-red-400 font-black">✗ Rejected</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <a
                      href="/leads"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-500 text-center mt-3"
                    >
                      <ArrowRight className="h-4 w-4" />
                      View all qualified leads
                    </a>
                  </div>
                ) : null}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  )
}
