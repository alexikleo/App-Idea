import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import AccountPage from './pages/AccountPage'
import BusinessCardPage from './pages/BusinessCardPage'
import CheckQuotePage from './pages/CheckQuotePage'
import DashboardPage from './pages/DashboardPage'
import ComparePage from './pages/ComparePage'
import EmergencyPage from './pages/EmergencyPage'
import HomePage from './pages/HomePage'
import JoinPage from './pages/JoinPage'
import NotFoundPage from './pages/NotFoundPage'
import PricesPage from './pages/PricesPage'
import ProviderPage from './pages/ProviderPage'
import RequestQuotesPage from './pages/RequestQuotesPage'
import SavedPage from './pages/SavedPage'
import SearchPage from './pages/SearchPage'
import SignInPage from './pages/SignInPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<SearchPage />} />
        <Route path="providers/:id" element={<ProviderPage />} />
        <Route path="providers/:id/card" element={<BusinessCardPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="request" element={<RequestQuotesPage />} />
        <Route path="prices" element={<PricesPage />} />
        <Route path="check" element={<CheckQuotePage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="account" element={<RequireAuth><AccountPage /></RequireAuth>} />
        <Route path="dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="join" element={<RequireAuth><JoinPage /></RequireAuth>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
