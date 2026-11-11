import { Route, Routes } from 'react-router-dom'
import AuthProvider from './components/AuthProvider'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <AuthProvider>
            <Layout />
          </AuthProvider>
        }
      />
    </Routes>
  )
}
