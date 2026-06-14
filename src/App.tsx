import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Gallery } from './pages/Gallery'
import { CharacterEditor } from './pages/CharacterEditor'
import { CharacterWizard } from './pages/CharacterWizard'
import { CharacterSheet } from './pages/CharacterSheet'
import { Rules } from './pages/Rules'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personagem/:id"
        element={
          <ProtectedRoute>
            <CharacterSheet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personagem/:id/editar"
        element={
          <ProtectedRoute>
            <CharacterEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personagem/:id/criar"
        element={
          <ProtectedRoute>
            <CharacterWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/regras"
        element={
          <ProtectedRoute>
            <Rules />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
