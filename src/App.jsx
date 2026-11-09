  const [page, setPage] = useState('dashboard')
  const [selectedLessonId, setSelectedLessonId] = useState('tenses')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selected, setSelected] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [completed, setCompleted] = useState(() => Number(localStorage.getItem('eem-completed') || 0))
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ทั้งหมด')

  useEffect(() => {
    if (!user || !supabase) return
    let mounted = true

    getMyProgress().then((snapshot) => {
      if (!mounted) return
      const nextCompleted = snapshot?.completed_sets ?? Number(localStorage.getItem('eem-completed') || 0)
      const nextProgress = snapshot?.progress_percent ?? Number(localStorage.getItem('eem-progress') || 0)
      setCompleted(nextCompleted)
      localStorage.setItem('eem-completed', String(nextCompleted))
      localStorage.setItem('eem-progress', String(nextProgress))
    }).catch((error) => {
      console.warn('Unable to restore cloud progress for current user:', error)
    })

    return () => { mounted = false }
  }, [user])

