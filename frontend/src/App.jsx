import LandingPage from './pages/landingPage/landingpage'
import AuthPage from './pages/auth/AuthPage'
import Dashboard from './pages/dashboard/Dashboard'
import UploadLeads from './pages/uploadLeads/UploadLeads'
import IcpSettings from './pages/icpSettings/IcpSettings'
import LeadDetail from './pages/leadDetail/LeadDetail'
import EmailPreview from './pages/emailPreview/EmailPreview'
import EmailHistory from './pages/emailHistory/EmailHistory'
import Leads from './pages/leads/Leads'

function App() {
  const path = window.location.pathname

  if (path === '/login') {
    return <AuthPage mode="login" />
  }

  if (path === '/signup') {
    return <AuthPage mode="signup" />
  }

  if (path === '/dashboard') {
    return <Dashboard />
  }

  if (path === '/upload-leads') {
    return <UploadLeads />
  }

  if (path === '/icp-settings') {
    return <IcpSettings />
  }

  if (path === '/lead-detail') {
    return <LeadDetail />
  }

  if (path === '/email-preview') {
    return <EmailPreview />
  }

  if (path === '/email-history') {
    return <EmailHistory />
  }

  if (path === '/leads') {
    return <Leads />
  }

  return <LandingPage />
}

export default App
