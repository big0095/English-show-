import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, Brain, ChartNoAxesColumnIncreasing, ClipboardCheck, Clock3,
  GraduationCap, House, Menu, Search, Settings, Target, Trophy, X,
  CheckCircle2, XCircle, ChevronRight, RotateCcw, BookMarked, Sparkles
} from 'lucide-react'
import { saveMyProgress, getMyProgress } from './lib/member-data'
import { supabase } from './lib/supabase'

const questions = [
  {
    id: 1, topic: 'Present Simple', level: 'พื้นฐาน',
    question: 'She _____ to school by bus every day.',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 1,
    explanation: 'ประธาน She เป็นเอกพจน์บุรุษที่ 3 ใน Present Simple จึงเติม -s หรือ -es ที่คำกริยา ...',
    tip: 'จำไว้: He / She / It + V-s/es ในประโยคบอกเล่า Present Simple'
  },
  {
    id: 2, topic: 'Subject-Verb Agreement', level: 'พื้นฐาน',
    question: 'The students _____ English in the classroom.',
    options: ['studies', 'study', 'studying', 'is study'],
    answer: 1,
    explanation: 'The students เป็นประธานพหูพจน์ จึงใช้กริยารูปพื้นฐาน study ไม่เติม s',
    tip: 'ประธานพหูพจน์ + กริยารูปพื้นฐานใน Present Simple'
  },
  {
    id: 3, topic: 'Prepositions', level: 'ปานกลาง',
    question: 'The meeting will start _____ 9 o’clock.',
    options: ['in', 'on', 'at', 'by'],
    answer: 2,
    explanation: 'ใช้ at กับเวลาที่เจาะจง เช่น at 9 o’clock, at noon, at midnight',
    tip: 'at = เวลาเจาะจง, on = วัน/วันที่, in = เดือน/ปี/ช่วงเวลา'
  },
  {
    id: 4, topic: 'Tenses', level: 'ปานกลาง',
    question: 'They _____ in this school since 2020.',
    options: ['work', 'worked', 'have worked', 'are working'],
    answer: 2,
    explanation: 'มี since 2020 แสดงจุดเริ่มต้นในอดีตต่อเนื่องถึงปัจจุบัน จึงใช้ Present Perfect: ...',
    tip: 'since + จุดเริ่มต้น, for + ระยะเวลา มักใช้กับ Present Perfect'
  },
  {
    id: 5, topic: 'Vocabulary', level: 'ปานกลาง',
    question: 'The word “improve” is closest in meaning to _____.',
    options: ['make better', 'make worse', 'make smaller', 'make slower'],
    answer: 0,
    explanation: 'Improve หมายถึง ทำให้ดีขึ้น หรือพัฒนา ดังนั้นคำตอบคือ make better',
    tip: 'improve = develop = make better (พัฒนา/ทำให้ดีขึ้น)'
  },
  {
    id: 6, topic: 'Conversation', level: 'ปานกลาง',
    question: 'A: “Thank you for your help.”  B: “_____”',
    options: ['I’m sorry.', 'You’re welcome.', 'Never mind you.', 'Good luck.'],
    answer: 1,
    explanation: 'เมื่อมีคนกล่าวขอบคุณ คำตอบที่เหมาะสมคือ You’re welcome. (ด้วยความยินดี)',
    tip: 'Thank you → You’re welcome. / No problem. / My pleasure.'
  },
  {
    id: 7, topic: 'Passive Voice', level: 'ยาก',
    question: 'The school building _____ last year.',
    options: ['renovates', 'renovated', 'was renovated', 'is renovating'],
    answer: 2,
    explanation: 'อาคารเป็นผู้ถูกกระทำ และมี last year เป็นอดีต จึงใช้ Past Simple Passive: was/were + V3',
    tip: 'Passive Voice เน้นผู้ถูกกระทำ: be + V3'
  },
  {
    id: 8, topic: 'Conditionals', level: 'ยาก',
    question: 'If I _____ more time, I would study another language.',
    options: ['have', 'had', 'will have', 'am having'],
    answer: 1,
    explanation: 'เป็น Second Conditional ใช้ If + Past Simple, would + V1 เพื่อกล่าวถึงสถานการณ์สมมติ',
    tip: 'If + V2, would + V1 = สมมติในปัจจุบัน'
  }
]

const lessons = [
  { id: 'tenses', title: 'Tenses ที่ออกสอบบ่อย', desc: 'Present, Past และ Future พร้อมคำบอกเวลา', tag: 'Grammar', time: '20 นาที', icon: BookMarked },
  { id: 'sva', title: 'Subject-Verb Agreement', desc: 'การเลือกกริยาให้สอดคล้องกับประธาน', tag: 'Grammar', time: '15 นาที', icon: BookMarked },
  { id: 'prep', title: 'Prepositions', desc: 'การใช้ in, on, at และคำบุพบทสำคัญ', tag: 'Grammar', time: '15 นาที', icon: BookMarked },
  { id: 'vocab', title: 'Vocabulary for Teachers', desc: 'คำศัพท์เกี่ยวกับโรงเรียนและการศึกษา', tag: 'Vocabulary', time: '15 นาที', icon: BookMarked },
  { id: 'reading-lesson', title: 'Reading Comprehension', desc: 'ฝึกอ่านจับใจความและหาความหมายจากบริบท', tag: 'Reading', time: '20 นาที', icon: BookMarked },
  { id: 'conv', title: 'Everyday Conversation', desc: 'บทสนทนาและการเลือกคำตอบให้เหมาะสม', tag: 'Conversation', time: '15 นาที', icon: BookMarked }
]

const readingStories = [
  {
    id: 'story-1',
    title: 'The Little Hero (เด็กชายกับลูกแมว)',
    level: 'LEVEL 01 · EASY',
    time: '5–7 นาที',
    image: '/images/reading-kitten-manga.png',
    passage: [
      'Tom is a kind and caring boy who lives near a green park. One rainy afternoon, as he was walking home from school, he heard a faint crying sound near a big tree.',
      'He checked behind the bushes and found a little kitten. The poor kitten was hurt, cold, and shivering in the rain. Tom immediately wrapped the kitten in his jacket and ran to the nearby animal clinic.',
      'The veterinarian examined the kitten, gave it medicine, and said, "You came just in time! You are a truly good boy. Animals need kind people like you." Tom smiled happily and decided to adopt the kitten and take good care of it.'
    ],
    summary: 'ทอมเป็นเด็กใจดี พบลูกแมวบาดเจ็บและตากฝนอยู่ใต้ต้นไม้ จึงรีบช่วยและรับเลี้ยงมันไว้',
    vocab: [
      { word: 'kind', meaning: 'ใจดี / มีน้ำใจ' },
      { word: 'faint', meaning: 'แผ่วเบา (เสียง)' },
      { word: 'shivering', meaning: 'สั่นสะท้าน (จากความหนาว)' },
      { word: 'immediately', meaning: 'ในทันทีทันใด' },
      { word: 'veterinarian (vet)', meaning: 'สัตวแพทย์' },
      { word: 'adopt', meaning: 'นำมาเลี้ยง / รับเลี้ยง' }
    ],
    questions: [
      {
        id: 'r1_1',
        q: '1. What is the main idea of the story?',
        options: [
          'Tom plays in the rain after school.',
          'Tom finds a injured kitten and kindly saves it.',
          'The veterinarian opens a new clinic.',
          'A kitten runs away from its home.'
        ],
        answer: 1,
        why: 'ใจความหลักคือ Tom พบลูกแมวที่บาดเจ็บและช่วยชีวิตมันไว้อย่างมีน้ำใจ'
      },
      {
        id: 'r1_2',
        q: '2. Why did Tom wrap the kitten in his jacket?',
        options: [
          'Because the kitten was hungry.',
          'Because he wanted to hide the kitten.',
          'Because the kitten was hurt, cold, and shivering.',
          'Because his jacket was dirty.'
        ],
        answer: 2,
        why: 'ในบทอ่านระบุว่า "The poor kitten was hurt, cold, and shivering in the rain" เขาจึงใช้แจ็คเก็ตห่อมันไว้'
      },
      {
        id: 'r1_3',
        q: '3. What does the word "immediately" mean in the text?',
        options: ['Very slowly', 'Right away without delay', 'Carefully', 'Secretly'],
        answer: 1,
        why: 'immediately หมายถึง ในทันทีทันใด โดยไม่รอช้า'
      },
      {
        id: 'r1_4',
        q: '4. What happened at the end of the story?',
        options: [
          'Tom left the kitten at the park.',
          'The kitten ran away into the forest.',
          'Tom named the kitten Lucky and adopted it.',
          'Tom sold the kitten to his friend.'
        ],
        answer: 2,
        why: 'ตอนจบของเรื่องระบุว่า Tom ตัดสินใจรับเลี้ยงลูกแมวและตั้งชื่อให้มัน'
      }
    ]
  }
]

function App() {
  const [page, setPage] = useState('dashboard')
  const [selectedLessonId, setSelectedLessonId] = useState('tenses')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selected, setSelected] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [completed, setCompleted] = useState(() => Number(localStorage.getItem('eem-completed') || 0))
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ทั้งหมด')
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    if (!supabase) return

    let active = true
    const syncUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (active) setUserId(user?.id ?? null)
      } catch {
        if (active) setUserId(null)
      }
    }

    syncUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) setUserId(session?.user?.id ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    let active = true
    getMyProgress().then((snapshot) => {
      if (!active || !snapshot) return
      const restoredCompleted = Number(snapshot.completed_sets || 0)
      const restoredProgress = Number(snapshot.progress_percent || 0)
      setCompleted(restoredCompleted)
      localStorage.setItem('eem-completed', String(restoredCompleted))
      localStorage.setItem('eem-progress', String(restoredProgress))
    }).catch((error) => {
      console.warn('Unable to hydrate progress from Supabase:', error)
    })

    return () => { active = false }
  }, [userId])

  const [activeStoryId, setActiveStoryId] = useState('story-1')
  const [readingAnswers, setReadingAnswers] = useState({})
  const [readingSubmitted, setReadingSubmitted] = useState(false)
  const activeStory = useMemo(() => readingStories.find(s => s.id === activeStoryId) || readingStories[0], [activeStoryId])

  const score = useMemo(() => questions.reduce((n, q) => n + (selected[q.id] === q.answer ? 1 : 0), 0), [selected])
  const navItems = [
    ['dashboard', 'หน้าหลัก', House],
    ['lessons', 'บทเรียน', BookOpen],
    ['reading', 'Reading Manga', BookMarked],
    ['practice', 'ฝึกทำข้อสอบ', Brain],
    ['mock', 'จำลองสนามสอบ', ClipboardCheck],
    ['progress', 'ความก้าวหน้า', ChartNoAxesColumnIncreasing]
  ]

  function startQuiz() {
    setQuizIndex(0); setSelected({}); setSubmitted(false); setPage('practice')
  }

  function finishQuiz() {
    setSubmitted(true)
    const nextCompleted = completed + 1
    setCompleted(nextCompleted)
    localStorage.setItem('eem-completed', String(nextCompleted))

    if (userId) {
      const nextProgress = Math.min(100, Math.round((nextCompleted / 8) * 100))
      saveMyProgress({ completedSets: nextCompleted, progressPercent: nextProgress }).catch((error) => {
        console.warn('Unable to sync progress to Supabase:', error)
      })
    }
  }

  function resetQuiz() {
    setQuizIndex(0); setSelected({}); setSubmitted(false)
  }

  const current = questions[quizIndex]
  const filteredLessons = lessons.filter(l =>
    (filter === 'ทั้งหมด' || l.tag === filter) &&
    (l.title.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase()))
  )

  function Sidebar() {
    return <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-icon"><GraduationCap size={24}/></div><div><b>ENGLISH EXAM</b><span>MASTER · TEACHER</span></div></div>
      <div className="nav-label">เมนูหลัก</div>
      <nav>{navItems.map(([id, label, Icon]) => <button key={id} className={`nav-item ${page === id || (page === 'lesson' && id === 'lessons') ? 'active' : ''}`} onClick={() => {setPage(id);setMobileOpen(false)}}><Icon size={16}/>{label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="goal-card"><Target size={19}/><b>เป้าหมายของคุณ</b><p>ฝึกวันละ 30 นาที เพื่อเริ่มเก็บคะแนนให้ดีขึ้น</p></div></div>
    </aside>
  }

  function Header() {
    return <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileOpen(!mobileOpen)}><Menu/></button><div className="crumb">เตรียมสอบครูผู้ช่วย</div><div className="header-actions"><button className="icon-btn"><Search size={18}/></button><button className="icon-btn"><Settings size={18}/></button></div></header>
  }

  function Dashboard() {
    return <>
      <section className="welcome">
        <div>
          <span className="eyebrow">YOUR PERSONAL ENGLISH COACH</span>
          <h1>พร้อมอัปคะแนน<br/><em>ภาษาอังกฤษ</em> แล้วหรือยัง?</h1>
          <p>ฝึกอย่างเป็นระบบ เข้าใจหลักภาษา และทำข้อสอบได้อย่างมั่นใจ</p>
          <button className="primary-btn" onClick={startQuiz}>เริ่มฝึกทำข้อสอบ <ChevronRight size={17}/></button>
        </div>
        <div className="welcome-art">
          <div className="art-card">
            <Trophy size={36} className="text-amber-500" />
            <div>
              <b>พิชิตข้อสอบครูผู้ช่วย</b>
              <small>แนวข้อสอบเน้นๆ อธิบายละเอียด</small>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <Clock3 size={20} />
          <div>
            <span>แบบฝึกหัดที่ทำแล้ว</span>
            <h3>{completed} ชุด</h3>
          </div>
        </div>
        <div className="stat-card">
          <BookOpen size={20} />
          <div>
            <span>บทเรียนทั้งหมด</span>
            <h3>{lessons.length} บทเรียน</h3>
          </div>
        </div>
      </div>
    </>
  }

  return <div className="app-shell"><Sidebar /><main className="main-panel"><Header />{page === 'dashboard' && <Dashboard />}{page === 'practice' && <section className="quiz-panel">{current && <div className="question-card"><div className="question-header"><span>ข้อที่ {quizIndex + 1}</span><span>{current.topic}</span></div><h3>{current.question}</h3><div className="options-grid">{current.options.map((option, index) => <button key={index} className={`option-btn ${selected[current.id] === index ? 'selected' : ''}`} onClick={() => setSelected(prev => ({ ...prev, [current.id]: index }))}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>{submitted && <div className="explanation-box"><h4>คำอธิบาย</h4><p>{current.explanation}</p><p className='tip'>{current.tip}</p></div>}<div className="quiz-actions"><button className="ghost-btn" onClick={() => setQuizIndex((i) => Math.max(0, i - 1))}>ก่อนหน้า</button><button className="primary-btn" onClick={() => { if (quizIndex < questions.length - 1) { setQuizIndex(i => i + 1) } else { finishQuiz() } }}>{quizIndex < questions.length - 1 ? 'ต่อไป' : 'ส่งคำตอบ'}</button></div></div>}</section>}{page === 'lessons' && <section className="panel-card"><h2>บทเรียน</h2><div className="cards-grid">{filteredLessons.map((lesson) => <button key={lesson.id} className="lesson-card" onClick={() => { setSelectedLessonId(lesson.id); setPage('dashboard') }}><div className="lesson-tag">{lesson.tag}</div><h3>{lesson.title}</h3><p>{lesson.desc}</p><div className="lesson-meta"><span>{lesson.time}</span><span>{lesson.icon ? 'พร้อมใช้งาน' : 'เรียนรู้'}</span></div></button>)}</div></section>}{page === 'reading' && <section className="panel-card"><h2>Reading Manga</h2><div className="story-header"><select value={activeStoryId} onChange={(e) => setActiveStoryId(e.target.value)}>{readingStories.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}</select></div><div className="story-grid"><div className="story-cover"><img src={activeStory.image} alt={activeStory.title} /></div><div className="story-meta"><h3>{activeStory.title}</h3><p>{activeStory.summary}</p><div className="vocab-list">{activeStory.vocab.map((item) => <div key={item.word}><b>{item.word}</b> — {item.meaning}</div>)}</div></div></div><div className="question-stack">{activeStory.questions.map((q) => <div key={q.id} className="read-q"><h4>{q.q}</h4>{q.options.map((option, index) => <button key={index} className={`read-option ${readingAnswers[q.id] === index ? 'selected' : ''}`} onClick={() => setReadingAnswers(prev => ({ ...prev, [q.id]: index }))}>{option}</button>)}{readingSubmitted && <div className="read-expl"><strong>คำอธิบาย:</strong> {q.why}</div>}</div>)}</div>{!readingSubmitted && <button className="primary-btn" onClick={() => setReadingSubmitted(true)}>ตรวจคำตอบ</button>}</section>}{page === 'progress' && <section className="panel-card"><h2>ความก้าวหน้า</h2><div className="progress-box"><div className="progress-head"><span>ความคืบหน้า</span><strong>{Math.min(100, Math.round((completed / 8) * 100))}%</strong></div><div className="progress-bar"><span style={{ width: `${Math.min(100, Math.round((completed / 8) * 100))}%` }} /></div></div></section>}</main></div>
}

export default App
