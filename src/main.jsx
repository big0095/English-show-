import React from 'react'
import { createRoot } from 'react-dom/client'
import LoginThenExam from './LoginThenExam.jsx'
import './style.css'
import './auth.css'
import './login-exam.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode><LoginThenExam /></React.StrictMode>
)
