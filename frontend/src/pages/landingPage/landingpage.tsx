import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  Database,
  FileText,
  Filter,
  LockKeyhole,
  Menu,
  Play,
  Sparkles,
  Target,
  UploadCloud,
  UserPlus,
  X,
  Zap,
} from 'lucide-react'

const navigation = [
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Customers', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
]

const features = [
  {
    icon: Sparkles,
    title: 'AI lead analysis',
    desc: 'Read form submissions, emails, notes, and campaign data to understand buyer intent instantly.',
  },
  {
    icon: Target,
    title: 'ICP matching',
    desc: 'Compare each lead against your best-fit customer profile, market, budget, and buying signals.',
  },
  {
    icon: BarChart3,
    title: 'Revenue scoring',
    desc: 'Prioritize accounts by fit, urgency, source quality, and likely pipeline value.',
  },
  {
    icon: Filter,
    title: 'Smart routing',
    desc: 'Send hot leads to the right owner, nurture the rest, and keep every decision traceable.',
  },
]

const steps = [
  { icon: UploadCloud, title: 'Capture', text: 'Forms, CSV files, ads, inboxes, and CRM data flow into one clean intake.' },
  { icon: Bot, title: 'Qualify', text: 'The agent enriches records, scores intent, checks fit, and flags missing context.' },
  { icon: Database, title: 'Sync', text: 'Approved leads move to your CRM with owner, score, summary, and next step.' },
]

const testimonials = [
  {
    name: 'Aisha Khan',
    role: 'Head of Growth',
    quote: 'LeadFlow AI turned our lead pile into a daily priority list. Reps now start with the accounts most likely to convert.',
  },
  {
    name: 'Diego Martins',
    role: 'VP Sales',
    quote: 'The qualification rules are transparent, so sales and marketing finally agree on what a qualified lead means.',
  },
  {
    name: 'Samantha Reed',
    role: 'RevOps Manager',
    quote: 'Setup was straightforward and the workflow view made it easy to explain the process to leadership.',
  },
]

const faqs = [
  {
    q: 'How long does setup take?',
    a: 'Most teams can import their first lead source, define scoring rules, and test CRM delivery in a single afternoon.',
  },
  {
    q: 'Can I customize qualification rules?',
    a: 'Yes. You can combine firmographic filters, campaign source, custom fields, buying intent, and AI-generated summaries.',
  },
  {
    q: 'Does it replace my CRM?',
    a: 'No. LeadFlow AI qualifies and enriches leads before sending the best opportunities into your existing sales workflow.',
  },
]

const FadeIn = ({ children, delay = 0, className = '' }) => {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true)
      },
      { threshold: 0.12 },
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const AuthButton = ({ children, href, variant = 'primary', icon: Icon }) => {
  const styles =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-blue-500 hover:text-white shadow-[0_16px_50px_rgba(37,99,235,0.25)]'
      : 'border border-white/15 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.08]'

  return (
    <a
      href={href}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition-all ${styles}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </a>
  )
}

const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-3" aria-label="LeadFlow AI home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Zap className="h-5 w-5" />
          </span>
          <span className="text-lg font-black tracking-tight text-white">LeadFlow AI</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-semibold text-slate-400 transition hover:text-white">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <AuthButton href="/login" variant="secondary" icon={LockKeyhole}>
            Login
          </AuthButton>
          <AuthButton href="/signup" icon={UserPlus}>
            Sign up
          </AuthButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white md:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-white/10 bg-black px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="font-semibold text-slate-300">
                {item.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <AuthButton href="/login" variant="secondary" icon={LockKeyhole}>
                Login
              </AuthButton>
              <AuthButton href="/signup" icon={UserPlus}>
                Sign up
              </AuthButton>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

const WorkflowGraphic = () => (
  <div id="workflow" className="relative mx-auto mt-16 max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-blue-950/30 sm:p-8">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(20,184,166,0.12),transparent_30%)]" />
    <div className="relative grid gap-5 lg:grid-cols-[1fr_1.35fr_1fr]">
      {steps.map((step, index) => (
        <div key={step.title} className="rounded-2xl border border-white/10 bg-black/60 p-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
              <step.icon className="h-6 w-6" />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">0{index + 1}</span>
          </div>
          <h3 className="text-xl font-bold text-white">{step.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{step.text}</p>
        </div>
      ))}
    </div>

    <div className="relative mt-5 rounded-2xl border border-white/10 bg-black/70 p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        {['Raw lead', 'AI score: 94', 'CRM ready'].map((label, index) => (
          <React.Fragment key={label}>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {label}
              </div>
              <div className="space-y-2">
                <span className="block h-2 rounded-full bg-slate-700" />
                <span className="block h-2 w-4/5 rounded-full bg-slate-800" />
                <span className="block h-2 w-2/3 rounded-full bg-blue-500/40" />
              </div>
            </div>
            {index < 2 ? <ArrowRight className="hidden h-5 w-5 text-slate-500 md:block" /> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
)

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState(0)

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-5 pb-20 pt-36 sm:pt-40 lg:px-8">
          <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />
          <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

          <div className="relative mx-auto max-w-6xl text-center">
            <FadeIn>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">
                <Sparkles className="h-4 w-4 text-blue-400" />
                AI lead qualification for modern revenue teams
              </div>

              <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-8xl">
                Turn scattered leads into qualified customers.
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
                LeadFlow AI captures, enriches, scores, and routes high-intent leads so your sales team focuses on the conversations that matter.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <AuthButton href="/signup" icon={UserPlus}>
                  Create account
                </AuthButton>
                <a
                  href="#workflow"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                >
                  <Play className="h-4 w-4" />
                  Watch workflow
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={250}>
              <WorkflowGraphic />
            </FadeIn>
          </div>
        </section>

        <section id="features" className="border-y border-white/10 px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-400">What it does</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                  A cleaner path from raw interest to sales-ready pipeline.
                </h2>
              </div>
              <p className="max-w-md text-slate-400">
                Keep the same black, electric-blue style while giving visitors a clearer, more complete landing experience.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <FadeIn key={feature.title} delay={index * 80} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-blue-400/50 hover:bg-white/[0.055]">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-blue-300 ring-1 ring-white/10">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{feature.desc}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <FadeIn>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-400">Built for speed</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Know who is ready before reps spend a minute.</h2>
              <p className="mt-5 text-lg leading-8 text-slate-400">
                The agent summarizes context, exposes the reason behind every score, and gives your team a next action instead of another spreadsheet.
              </p>
            </FadeIn>

            <FadeIn delay={120} className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-slate-400">Qualified today</p>
                  <p className="text-4xl font-black text-white">287</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-300">+38%</span>
              </div>
              <div className="space-y-4">
                {['Enterprise SaaS buyer', 'Requested pricing', 'Matched ICP region'].map((item, index) => (
                  <div key={item} className="flex items-center gap-4 rounded-2xl bg-black/60 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                      {index === 0 ? <FileText className="h-5 w-5" /> : index === 1 ? <BarChart3 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white">{item}</p>
                      <p className="text-sm text-slate-500">Confidence score above qualification threshold</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 flex-none text-emerald-400" />
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        <section id="testimonials" className="border-y border-white/10 px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-black tracking-tight text-white sm:text-5xl">Revenue teams move faster with cleaner signals.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {testimonials.map((item, index) => (
                <FadeIn key={item.name} delay={index * 100} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                  <p className="leading-7 text-slate-300">"{item.quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-sm font-black text-white">
                      {item.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')}
                    </span>
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.role}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-400">FAQ</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Questions before you sign up.</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((item, index) => (
                <div key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <button
                    type="button"
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="font-bold text-white">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 flex-none text-slate-500 transition ${openFAQ === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden text-slate-400 transition-all ${openFAQ === index ? 'mt-4 max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-[2rem] border border-white/10 bg-blue-600 px-6 py-10 text-center shadow-2xl shadow-blue-950/40 md:flex-row md:px-10 md:text-left">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white">Start qualifying leads today.</h2>
              <p className="mt-2 text-blue-100">Create an account, connect your lead source, and see your first AI score in minutes.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <AuthButton href="/login" variant="secondary" icon={LockKeyhole}>
                Login
              </AuthButton>
              <AuthButton href="/signup" icon={ArrowRight}>
                Sign up free
              </AuthButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm text-slate-500 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <Zap className="h-5 w-5" />
            </span>
            <span>LeadFlow AI. Built for faster qualification.</span>
          </div>
          <div className="flex gap-5">
            <a href="#" className="transition hover:text-white">Privacy</a>
            <a href="#" className="transition hover:text-white">Terms</a>
            <a href="#" className="transition hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
