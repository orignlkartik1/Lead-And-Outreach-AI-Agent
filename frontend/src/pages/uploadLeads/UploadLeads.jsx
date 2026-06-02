import {
  AlertCircle,
  ArrowRight,
  Bell,
  Brain,
  CheckCircle2,
  ChevronRight,
  Eye,
  History,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useRef, useState } from 'react'

const requiredColumns = ['Name', 'Company', 'Role', 'Industry', 'Email', 'Employee Count', 'Company Tech Stack', 'Currently Hiring']
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
const excelExtensions = ['.xlsx', '.xlsm']

const hasExtension = (fileName, extensions) => extensions.some((extension) => fileName.toLowerCase().endsWith(extension))

const sampleRows = [
  {
    Name: 'Sarah Mathews',
    Company: 'Northstar Cloud',
    Role: 'VP Sales',
    Industry: 'SaaS',
    Email: 'sarah@northstar.io',
    'Employee Count': '420',
    'Company Tech Stack': 'Salesforce, HubSpot, AWS',
    'Currently Hiring': 'No',
  },
  {
    Name: 'Diego Chen',
    Company: 'Vertex Labs',
    Role: 'Founder',
    Industry: 'AI Tools',
    Email: 'diego@vertexlabs.ai',
    'Employee Count': '118',
    'Company Tech Stack': 'OpenAI, Segment, Snowflake',
    'Currently Hiring': 'Yes',
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

const parseCsvLine = (line) => {
  const cells = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && next === '"') {
      value += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      cells.push(value.trim())
      value = ''
    } else {
      value += char
    }
  }

  cells.push(value.trim())
  return cells
}

const normalize = (value) => value.trim().toLowerCase()

const getAuthToken = () => {
  try {
    return window.localStorage.getItem('authToken') || ''
  } catch {
    return ''
  }
}

const authHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

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
      <FileCheck2 className="mb-4 h-7 w-7 text-blue-300" />
      <p className="font-black text-white">CSV rules</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">Upload CSV or Excel files with all required lead columns.</p>
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

const UploadModal = () => {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState([])
  const [rows, setRows] = useState([])
  const [batch, setBatch] = useState(null)
  const [agentError, setAgentError] = useState('')

  const uploadFile = async (file, parsedRows) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/leads/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const nextErrors = data.errors || [data.error || 'Unable to upload CSV file.']
      throw new Error(nextErrors.join(' '))
    }

    setRows(data.leads || parsedRows)
    setBatch(data.batch || null)
    try {
      window.localStorage.setItem('leads', JSON.stringify(data.leads || parsedRows))
      if (data.batch?.id) window.localStorage.setItem('leadBatchId', data.batch.id)
    } catch { /* localStorage unavailable */ }
  }

  const validateAndBindFile = async (file) => {
    setErrors([])
    setAgentError('')
    setProgress(0)
    setStatus('validating')
    setFileName(file?.name || '')
    setBatch(null)

    if (!file) return

    const nextErrors = []
    const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
    const isExcel = hasExtension(file.name, excelExtensions)

    if (!isCsv && !isExcel) {
      nextErrors.push('File must be a CSV or Excel .xlsx/.xlsm file.')
    }

    if (file.size > 10 * 1024 * 1024) {
      nextErrors.push('File size must be under 10 MB.')
    }

    if (nextErrors.length) {
      setErrors(nextErrors)
      setStatus('error')
      return
    }

    if (isExcel) {
      setRows([])
      setStatus('uploading')
      setProgress(45)

      try {
        await uploadFile(file, [])
        setProgress(100)
        setStatus('complete')
      } catch (error) {
        setErrors([error.message || 'Unable to upload Excel file.'])
        setStatus('error')
        setProgress(0)
      }
      return
    }

    const reader = new FileReader()

    reader.onload = async (event) => {
      const text = String(event.target?.result || '')
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

      if (lines.length < 2) {
        setErrors(['CSV must include a header row and at least one lead.'])
        setStatus('error')
        return
      }

      const headers = parseCsvLine(lines[0])
      const missing = requiredColumns.filter((column) => !headers.some((header) => normalize(header) === normalize(column)))

      if (missing.length) {
        setErrors([`Missing columns: ${missing.join(', ')}`])
        setStatus('error')
        return
      }

      const boundRows = lines.slice(1).map((line) => {
        const values = parseCsvLine(line)
        return requiredColumns.reduce((lead, column) => {
          const sourceIndex = headers.findIndex((header) => normalize(header) === normalize(column))
          return { ...lead, [column]: values[sourceIndex] || '' }
        }, {})
      })

      const invalidEmails = boundRows.filter((row) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email))
      const invalidEmployees = boundRows.filter((row) => Number.isNaN(Number(row['Employee Count'])) || Number(row['Employee Count']) < 0)
      const missingTechStacks = boundRows.filter((row) => !row['Company Tech Stack']?.trim())
      const missingHiring = boundRows.filter((row) => !row['Currently Hiring']?.trim())
      const invalidHiringValues = boundRows.filter((row) => {
        const value = normalize(row['Currently Hiring'] || '')
        return value && value !== 'yes' && value !== 'no'
      })

      if (invalidEmails.length || invalidEmployees.length || missingTechStacks.length || missingHiring.length || invalidHiringValues.length) {
        setErrors([
          invalidEmails.length ? `${invalidEmails.length} row(s) have invalid email addresses.` : '',
          invalidEmployees.length ? `${invalidEmployees.length} row(s) have invalid employee counts.` : '',
          missingTechStacks.length ? `${missingTechStacks.length} row(s) are missing company tech stack.` : '',
          missingHiring.length ? `${missingHiring.length} row(s) are missing the Currently Hiring field.` : '',
          invalidHiringValues.length ? `${invalidHiringValues.length} row(s) have invalid Currently Hiring values; use Yes or No.` : '',
        ].filter(Boolean))
        setStatus('error')
        setRows(boundRows)
        return
      }

      setRows(boundRows)
      setStatus('uploading')
      setProgress(45)

      try {
        await uploadFile(file, boundRows)
        setProgress(100)
        setStatus('complete')
      } catch (error) {
        setErrors([error.message || 'Unable to upload CSV file.'])
        setStatus('error')
        setProgress(0)
      }
    }

    reader.readAsText(file)
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    validateAndBindFile(event.dataTransfer.files?.[0])
  }

  const sendToAgent = async () => {
    if (!batch?.id) return

    setAgentError('')
    setStatus('qualifying')

    try {
      const response = await fetch(`${API_BASE_URL}/leads/batches/${batch.id}/qualify`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send leads to the agent.')
      }

      // Persist batch and leads data
      try {
        window.localStorage.setItem('currentBatch', JSON.stringify(data.batch || batch))
        window.localStorage.setItem('leads', JSON.stringify(data.leads || []))
        window.localStorage.setItem('qualificationResults', JSON.stringify(data.qualification_results || []))
      } catch { /* localStorage unavailable */ }

      setRows(data.leads || [])
      setBatch(data.batch || batch)
      
      // Redirect to leads portal
      setTimeout(() => {
        window.location.href = '/leads'
      }, 500)
    } catch (error) {
      setAgentError(error.message || 'Unable to send leads to the agent.')
      setStatus('complete')
    }
  }

  const summary = [
    { label: 'Rows saved', value: batch?.stats?.savedRows ?? rows.length },
    { label: 'Columns mapped', value: requiredColumns.length },
    { label: 'Duplicates', value: batch?.stats?.duplicateRows ?? 0 },
  ]

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-blue-950/30 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.28),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(96,165,250,0.12),transparent_30%)]" />
      <div className="relative grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-5">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Upload Leads</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Import CSV file</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Drag a CSV here and the app will validate, map, and bind your lead data to the preview table.</p>
            </div>
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
              <UploadCloud className="h-6 w-6" />
            </span>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex min-h-72 w-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed p-6 text-center transition ${
              dragging ? 'border-blue-300 bg-blue-500/15 shadow-[0_0_45px_rgba(37,99,235,0.22)]' : 'border-blue-400/30 bg-black/60 hover:border-blue-300 hover:bg-blue-500/10'
            }`}
          >
            <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-white text-black">
              <FileSpreadsheet className="h-9 w-9 text-blue-600" />
            </span>
            <span className="text-xl font-black text-white">Drop CSV or Excel file here</span>
            <span className="mt-2 max-w-xs text-sm leading-6 text-slate-400">or click to browse from your device. Required headers must match the lead columns.</span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv,.xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12"
              className="hidden"
              onChange={(event) => validateAndBindFile(event.target.files?.[0])}
            />
          </button>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{fileName || 'No file selected'}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{status === 'idle' ? 'CSV or Excel file up to 10 MB' : status}</p>
              </div>
              {status === 'complete' ? <CheckCircle2 className="h-5 w-5 flex-none text-blue-300" /> : null}
              {status === 'error' ? <AlertCircle className="h-5 w-5 flex-none text-red-300" /> : null}
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {errors.length ? (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 font-black text-red-200">
                <AlertCircle className="h-5 w-5" />
                Validation failed
              </div>
              <ul className="space-y-1 text-sm text-red-100">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-sm leading-6 text-blue-100">
              File validation checks type, size, required columns, duplicate emails, email format, employee count, and company tech stack values before saving to MongoDB.
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-[1.5rem] border border-white/10 bg-black/70 p-5">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">Bound Data</p>
              <h2 className="mt-2 text-2xl font-black text-white">Lead preview</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {summary.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white px-3 py-2 text-center">
                  <p className="text-lg font-black text-black">{item.value}</p>
                  <p className="text-[11px] font-bold text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {requiredColumns.map((column) => (
              <div key={column} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm font-bold text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                {column}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-500">
                <tr>
                  {requiredColumns.map((column) => (
                    <th key={column} className="px-4 py-4 font-black">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(rows.length ? rows : sampleRows).map((row, index) => (
                  <tr key={`${row.Email}-${index}`} className="border-t border-white/5 text-slate-300">
                    {requiredColumns.map((column) => (
                      <td key={column} className="px-4 py-4">
                        <span className={column === 'Email' ? 'font-bold text-blue-300' : column === 'Name' ? 'font-black text-white' : ''}>
                          {row[column] || '-'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-blue-600 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-black text-white">Next: Configure your ICP profile</p>
              <p className="text-sm text-blue-100">Go to ICP Settings to define your target profile. Your uploaded leads will be compared and scored against it.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                try { window.localStorage.setItem('pendingBatchForIcp', JSON.stringify(batch)) } catch {}
                window.location.href = '/icp-settings'
              }}
              disabled={!batch?.id}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black text-black transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              Go to ICP Settings
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {agentError ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-100">
              {agentError}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default function UploadLeads() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
                <p className="text-sm font-bold text-blue-300">Lead import workspace</p>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Upload Leads</h1>
              </div>
            </div>

            <div className="hidden min-w-72 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 md:flex">
              <Search className="h-4 w-4 text-blue-400" />
              <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search imports or lead batches" />
            </div>

            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-blue-300">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="px-5 py-6 lg:px-8">
          <section className="mb-6 rounded-[2rem] border border-white/10 bg-blue-600 p-6 shadow-2xl shadow-blue-950/35">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-black">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  CSV and Excel validation enabled
                </div>
                <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">Upload, validate, and bind lead data in one flow.</h2>
                <p className="mt-4 max-w-2xl text-blue-100">Map required columns, preview records, and send clean leads into the qualification engine.</p>
              </div>
              <div className="rounded-3xl bg-black/20 p-5">
                <p className="text-sm font-bold text-blue-100">Required columns</p>
                <p className="mt-2 text-4xl font-black text-white">{requiredColumns.length}</p>
              </div>
            </div>
          </section>

          <UploadModal />
        </div>
      </main>
    </div>
  )
}
