import React from 'react'
import { createRoot } from 'react-dom/client'
import AppWithAuth from './AppWithAuth.jsx'
import LegacyExamLibrary from './LegacyExamLibrary.jsx'
import './style.css'
import './auth.css'
import './polish.css'
import './legacy-exams.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <AppWithAuth />
      <LegacyExamLibrary />
    </>
  </React.StrictMode>
)
