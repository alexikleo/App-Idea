import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import JoinPage from './pages/JoinPage'
import NotFoundPage from './pages/NotFoundPage'
import PricesPage from './pages/PricesPage'
import ProviderPage from './pages/ProviderPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<SearchPage />} />
        <Route path="providers/:id" element={<ProviderPage />} />
        <Route path="prices" element={<PricesPage />} />
        <Route path="join" element={<JoinPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
