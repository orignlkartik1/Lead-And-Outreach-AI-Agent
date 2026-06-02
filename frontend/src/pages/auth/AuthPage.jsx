import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Zap,
} from 'lucide-react'

const benefits = [
  'AI scoring for every new lead',
  'Clear qualification reasons',
  'CRM-ready routing and summaries',
]

const inputStyles =
  'h-12 w-full rounded-2xl border border-white/10 bg-black/70 px-4 pl-11 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15'

const Field = ({ icon: Icon, label, type = 'text', placeholder, value, name, onChange }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-bold text-blue-300">{label}</span>
    <span className="relative block">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400" />
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputStyles}
      />
    </span>
  </label>
)

export default function AuthPage({ mode = 'login' }) {
  const isSignup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const payload = isSignup
      ? { name, email, password }
      : { email, password }

    try {
      const response = await fetch(`http://127.0.0.1:5000/${isSignup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        const message = data.error || data.message || 'Authentication failed'
        setError(message)
        console.error('Auth error:', response.status, data)
        setLoading(false)
        return
      }

      window.localStorage.setItem('authToken', data.token)
      window.localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Signup/Login exception:', err)
      setError('Unable to reach the authentication service. Check the console for details.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <section className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:px-8">
        <div className="flex min-h-[32rem] flex-col justify-between">
          <a href="/" className="inline-flex w-fit items-center gap-3 text-sm font-bold text-slate-300 transition hover:text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
              <Zap className="h-5 w-5" />
            </span>
            LeadFlow AI
          </a>

          <div className="max-w-2xl py-12">
            <a href="/" className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-blue-300 transition hover:border-blue-400/50">
              <ArrowLeft className="h-4 w-4" />
              Back to landing page
            </a>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
              <Sparkles className="h-4 w-4" />
              {isSignup ? 'Start qualifying leads today' : 'Welcome back to your pipeline'}
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {isSignup ? 'Create your LeadFlow account.' : 'Login to LeadFlow AI.'}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              {isSignup
                ? 'Launch a clean qualification workspace with blue-signal scoring, routing, and CRM-ready summaries.'
                : 'Open your dashboard, review qualified leads, and move the best opportunities into sales.'}
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-blue-400" />
                  <p className="text-sm font-semibold leading-6 text-slate-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-4 text-sm text-slate-500 lg:flex">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            Secure auth experience styled for the LeadFlow AI workspace.
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-b from-blue-500/35 via-white/10 to-transparent" />
          <div className="relative rounded-[2rem] border border-white/10 bg-black/90 p-5 shadow-2xl shadow-blue-950/40 sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-400">
                  {isSignup ? 'Sign up' : 'Login'}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                  {isSignup ? 'Build your workspace' : 'Access your workspace'}
                </h2>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20">
                {isSignup ? <UserPlus className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
              </span>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {isSignup ? (
                <Field
                  icon={User}
                  label="Full name"
                  placeholder="Your name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              ) : null}
              <Field
                icon={Mail}
                label="Work email"
                type="email"
                placeholder="you@company.com"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Field
                icon={LockKeyhole}
                label="Password"
                type="password"
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {isSignup ? (
                <Field
                  icon={BarChart3}
                  label="Company"
                  placeholder="Company name"
                  name="company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              ) : null}

              {!isSignup ? (
                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 font-semibold text-slate-400">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-black text-blue-500 accent-blue-500" />
                    Remember me
                  </label>
                  <a href="#" className="font-bold text-blue-300 transition hover:text-blue-200">
                    Forgot password?
                  </a>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-[0_18px_55px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {loading ? (isSignup ? 'Creating account...' : 'Logging in...') : isSignup ? 'Create account' : 'Login'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-600">or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white text-sm font-black text-black transition hover:bg-blue-500 hover:text-white"
            >
              <Sparkles className="h-4 w-4" />
              Continue with demo account
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              {isSignup ? 'Already have an account?' : 'Need a new account?'}{' '}
              <a href={isSignup ? '/login' : '/signup'} className="font-black text-blue-300 transition hover:text-blue-200">
                {isSignup ? 'Login' : 'Sign up'}
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
