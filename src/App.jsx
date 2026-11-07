import { useMemo, useState } from 'react'
import {
  BookOpen, Brain, ChartNoAxesColumnIncreasing, ClipboardCheck, Clock3,
  GraduationCap, House, Menu, Search, Settings, Target, Trophy, X,
  CheckCircle2, XCircle, ChevronRight, RotateCcw, BookMarked, Sparkles
} from 'lucide-react'

const questions = [
  {
    id: 1, topic: 'Present Simple', level: 'พื้นฐาน',
    question: 'She _____ to school by bus every day.',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 1,
    explanation: 'ประธาน She เป็นเอกพจน์บุรุษที่ 3 ใน Present Simple จึงเติม -s หรือ -es ที่คำกริยา โดย go เปลี่ยนเป็น goes',
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
    explanation: 'มี since 2020 แสดงจุดเริ่มต้นในอดีตต่อเนื่องถึงปัจจุบัน จึงใช้ Present Perfect: have/has + V3',
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
  { id: 'tenses', title: 'Tenses ที่ออกสอบบ่อย', desc: 'Present, Past และ Future พร้อมคำบอกเวลา', tag: 'Grammar', time: '20 นาที', icon: BookOpen },
  { id: 'sva', title: 'Subject-Verb Agreement', desc: 'การเลือกกริยาให้สอดคล้องกับประธาน', tag: 'Grammar', time: '15 นาที', icon: Brain },
  { id: 'prep', title: 'Prepositions', desc: 'การใช้ in, on, at และคำบุพบทสำคัญ', tag: 'Grammar', time: '15 นาที', icon: BookMarked },
  { id: 'vocab', title: 'Vocabulary for Teachers', desc: 'คำศัพท์เกี่ยวกับโรงเรียนและการศึกษา', tag: 'Vocabulary', time: '15 นาที', icon: GraduationCap },
  { id: 'reading-lesson', title: 'Reading Comprehension', desc: 'ฝึกอ่านจับใจความและหาความหมายจากบริบท', tag: 'Reading', time: '25 นาที', icon: ClipboardCheck },
  { id: 'conv', title: 'Everyday Conversation', desc: 'บทสนทนาและการเลือกคำตอบให้เหมาะสม', tag: 'Conversation', time: '15 นาที', icon: Sparkles }
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
      'He checked behind the bushes and found a little kitten. The poor kitten was hurt, cold, and shivering in the rain. Tom immediately wrapped the kitten in his jacket and ran to the nearby animal hospital.',
      'The veterinarian examined the kitten, gave it medicine, and said, "You came just in time! You are a truly good boy. Animals need kind people like you." Tom smiled happily and decided to adopt the kitten, naming it Lucky.'
    ],
    summary: 'ทอมเป็นเด็กใจดี พบลูกแมวบาดเจ็บและตากฝนอยู่ใต้ต้นไม้ จึงรีบใช้เสื้อแจ็คเก็ตห่อตัวและพาไปโรงพยาบาลสัตว์ สัตวแพทย์ได้รักษาและเอ่ยชมทอม สุดท้ายทอมรับเลี้ยงลูกแมวและตั้งชื่อให้มันว่า "ลักกี้"',
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
        why: 'immediately หมายถึง ในทันทีทันใด โดยไม่รอช้า (Right away without delay)'
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
        why: 'ตอนจบของเรื่องระบุว่า Tom ตัดสินใจรับเลี้ยงลูกแมวและตั้งชื่อให้ว่า Lucky'
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
    const done = completed + 1
    setCompleted(done)
    localStorage.setItem('eem-completed', String(done))
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
      <nav>{navItems.map(([id, label, Icon]) => <button key={id} className={`nav-item ${page === id || (page === 'lesson' && id === 'lessons') ? 'active' : ''}`} onClick={() => {setPage(id);setMobileOpen(false)}}><Icon size={18}/><span>{label}</span>{id === 'practice' && <i>ใหม่</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="goal-card"><Target size={19}/><b>เป้าหมายของคุณ</b><p>ฝึกวันละ 30 นาที เพื่อเพิ่มความมั่นใจก่อนสอบ</p><div className="goal-line"><span/></div><small>เริ่มต้นสร้างวินัยวันนี้</small></div><button className="nav-item"><Settings size={18}/> ตั้งค่า</button></div>
    </aside>
  }

  function Header() {
    return <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileOpen(!mobileOpen)}><Menu/></button><div className="crumb">เตรียมสอบครูผู้ช่วย <ChevronRight size={15}/> <b>{navItems.find(n => n[0] === page)?.[1] || (page === 'lesson' ? 'รายละเอียดบทเรียน' : 'ฝึกทำข้อสอบ')}</b></div><div className="top-right"><span className="streak"><Sparkles size={16}/> Keep learning</span><div className="avatar">T</div></div></header>
  }

  function Dashboard() {
    return <>
      <section className="welcome">
        <div><span className="eyebrow">YOUR PERSONAL ENGLISH COACH</span><h1>พร้อมอัปคะแนน<br/><em>ภาษาอังกฤษ</em> แล้วหรือยัง?</h1><p>ฝึกอย่างเป็นระบบ เข้าใจหลักภาษา และทำข้อสอบได้อย่างมั่นใจ</p><button className="primary-btn" onClick={startQuiz}>เริ่มฝึกทำข้อสอบ <ChevronRight size={17}/></button></div>
        <div className="welcome-art"><div
             function Dashboard() {
    return <>
      <section className="welcome">
        <div>
          <span className="eyebrow">YOUR PERSONAL ENGLISH COACH</span>
          <h1>พร้อมอัปคะแนน<br/><em>ภาษาอังกฤษ</em> แล้วหรือยัง?</h1>
          <p>ฝึกอย่างเป็นระบบ เข้าใจหลักภาษา และทำข้อสอบได้อย่างมั่นใจ</p>
          <button className="primary-btn" onClick={startQuiz}>
            เริ่มฝึกทำข้อสอบ <ChevronRight size={17}/>
          </button>
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
      
      {/* ส่วนสถิติและเมนูด่วนด้านล่าง */}
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
                            
