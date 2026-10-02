import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import CheckQuotePage from './pages/CheckQuotePage'
import EmergencyPage from './pages/EmergencyPage'
import HomePage from './pages/HomePage'
import JoinPage from './pages/JoinPage'
import NotFoundPage from './pages/NotFoundPage'
import PricesPage from './pages/PricesPage'
import ProviderPage from './pages/ProviderPage'
import SavedPage from './pages/SavedPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<SearchPage />} />
        <Route path="providers/:id" element={<ProviderPage />} />
        <Route path="prices" element={<PricesPage />} />
        <Route path="check" element={<CheckQuotePage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="join" element={<JoinPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
