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
        <div className="welcome-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="book-emoji">📚</div><div className="floating-card"><Trophy size={18}/><span><b>Small steps,</b><small>big progress.</small></span></div><div className="floating-star">✦</div></div>
      </section>
      <div className="section-heading"><div><h2>ภาพรวมการเรียน</h2><p>ติดตามการเตรียมสอบของคุณ</p></div><span className="muted-tag">MY LEARNING</span></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue"><BookOpen/></div><span>บทเรียนทั้งหมด</span><strong>06</strong><small>หัวข้อสำคัญ</small></div>
        <div className="stat-card"><div className="stat-icon purple"><ClipboardCheck/></div><span>ชุดฝึกที่ทำแล้ว</span><strong>{completed}</strong><small>ชุดแบบฝึกหัด</small></div>
        <div className="stat-card"><div className="stat-icon orange"><Target/></div><span>เป้าหมายต่อวัน</span><strong>30 <small>นาที</small></strong><small>ฝึกสม่ำเสมอ</small></div>
        <div className="stat-card"><div className="stat-icon green"><ChartNoAxesColumnIncreasing/></div><span>สถานะการเรียน</span><strong>เริ่มต้น</strong><small>บันทึกความก้าวหน้าในเครื่องนี้</small></div>
      </div>
      <div className="content-grid">
        <section className="panel"><div className="panel-head"><div><h2>เส้นทางการเรียน</h2><p>เนื้อหาที่ควรฝึกสำหรับการสอบ</p></div><button className="text-btn" onClick={() => setPage('lessons')}>ดูทั้งหมด <ChevronRight size={15}/></button></div>
          <div className="learning-list">{lessons.slice(0,4).map((l,i)=><button className="learning-row" key={l.title} onClick={()=>{if(l.tag==='Reading'){setPage('reading')}else{setSelectedLessonId(l.id);setPage('lesson')}}}><div className={`lesson-icon color-${i}`}><l.icon size={19}/></div><div className="lesson-info"><b>{l.title}</b><span>{l.desc}</span></div><small>{l.time}</small><ChevronRight size={17}/></button>)}</div>
        </section>
        <section className="panel daily-panel"><div className="daily-icon"><Clock3 size={22}/></div><span className="eyebrow">TODAY'S CHALLENGE</span><h2>ฝึกวันละนิด<br/>พิชิตข้อสอบ</h2><p>เริ่มจากแบบฝึกหัด 8 ข้อ เพื่อทบทวน Grammar, Vocabulary และ Conversation</p><button className="dark-btn" onClick={startQuiz}>ทำแบบฝึกหัดวันนี้ <ChevronRight size={16}/></button><div className="daily-decoration">✦</div></section>
      </div>
    </>
  }

  function Lessons() {
    return <><div className="page-title"><span className="eyebrow">LEARNING LIBRARY</span><h1>คลังบทเรียน</h1><p>เลือกหัวข้อที่ต้องการทบทวน แล้วพัฒนาความแม่นยำทีละเรื่อง</p></div>
      <div className="toolbar"><div className="searchbox"><Search size={18}/><input placeholder="ค้นหาบทเรียน..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="filters">{['ทั้งหมด','Grammar','Vocabulary','Reading','Conversation'].map(f=><button key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
      <div className="lesson-grid">{filteredLessons.map((l,i)=><article className="lesson-card" key={l.title}><div className={`lesson-icon large color-${i}`}><l.icon size={22}/></div><span className="category">{l.tag}</span><h3>{l.title}</h3><p>{l.desc}</p><div className="lesson-card-foot"><span><Clock3 size={14}/> {l.time}</span><button onClick={()=>{if(l.tag==='Reading'){setPage('reading')}else{setSelectedLessonId(l.id);setPage('lesson')}}}>เริ่มเรียน <ChevronRight size={15}/></button></div></article>)}</div>
    </>
  }

  function LessonDetail() {
    const content = {
      tenses: {
        title: 'Tenses ที่ออกสอบบ่อย (Present, Past, Future)',
        sub: 'สรุปโครงสร้างและคำบอกเวลาที่มักออกข้อสอบบ่อยที่สุด',
        sections: [
          { h: '1. Present Simple Tense', f: 'Subject + V.1 (เติม s/es เมื่อประธานเอกพจน์บุรุษที่ 3)', desc: 'ใช้กับความจริงทั่วไปและกิจวัตรประจำวัน คำบอกเวลา: always, usually, every day' },
          { h: '2. Past Simple Tense', f: 'Subject + V.2', desc: 'ใช้กับเหตุการณ์ที่เกิดขึ้นและจบลงแล้วในอดีต คำบอกเวลา: yesterday, last night, ...ago' },
          { h: '3. Future Simple Tense', f: 'Subject + will + V.1', desc: 'ใช้กับเหตุการณ์ที่จะเกิดขึ้นในอนาคต คำบอกเวลา: tomorrow, next week, soon' }
        ]
      },
      sva: {
        title: 'Subject-Verb Agreement (ความสอดคล้องของประธานและกริยา)',
        sub: 'หลักการเลือกใช้คำกริยาให้ถูกต้องตามพจน์ของประธาน',
        sections: [
          { h: '1. ประธานเอกพจน์และพหูพจน์', f: 'ประธานเอกพจน์ + กริยาเติม s/es | ประธานพหูพจน์ + กริยาช่อง 1 รูปปกติ', desc: 'เช่น He works hard. / They work hard.' },
          { h: '2. คำเชื่อม as well as, with, together with', f: 'ยึดประธานตัวหน้าเป็นหลัก', desc: 'เช่น The teacher, along with the students, is ready.' }
        ]
      },
      prep: {
        title: 'Prepositions (คำบุพบทบอกเวลาและสถานที่)',
        sub: 'การใช้ in, on, at ให้ถูกต้องแม่นยำ',
        sections: [
          { h: '1. Prepositions of Time (เวลา)', f: 'at + เวลาเจาะจง | on + วัน/วันที่ | in + เดือน/ปี/ช่วงเวลา', desc: 'เช่น at 9:00 AM, on Monday, in 2026, in the morning' },
          { h: '2. Prepositions of Place (สถานที่)', f: 'at + จุดพิกัดเฉพาะ | on + พื้นผิว/ถนน | in + พื้นที่ปิด/เมืองใหญ่', desc: 'เช่น at the door, on the table, in Bangkok' }
        ]
      },
      vocab: {
        title: 'Vocabulary for Teachers (คำศัพท์หมวดการศึกษา)',
        sub: 'คลังคำศัพท์ที่พบบ่อยในการสอบบรรจุครูผู้ช่วย',
        sections: [
          { h: 'คำศัพท์สำคัญ', f: 'Curriculum (หลักสูตร), Evaluation (การประเมิน), Instruction (การสอน), Outstanding (โดดเด่น)', desc: 'ควรจำคำศัพท์ที่เป็นทางการและเกี่ยวข้องกับการบริหารจัดการเรียนรู้ในโรงเรียน' }
        ]
      },
      conv: {
        title: 'Everyday Conversation (บทสนทนาในสถานการณ์ต่างๆ)',
        sub: 'การเลือกตอบคำถามในสถานการณ์จำลองอย่างสุภาพและเหมาะสม',
        sections: [
          { h: 'รูปแบบการตอบรับ', f: 'Thank you → You’re welcome. / My pleasure.', desc: 'ระวังการเลือกสำนวนที่ใช้ในบริบททางการและไม่เป็นทางการให้ถูกต้อง' }
        ]
      }
    }[selectedLessonId] || { title: 'บทเรียน', sub: '', sections: [] }

    return <><button className="back-btn" onClick={()=>setPage('lessons')}>← กลับไปคลังบทเรียน</button>
      <div className="page-title"><span className="eyebrow">LESSON DETAIL</span><h1>{content.title}</h1><p>{content.sub}</p></div>
      <div className="panel lesson-content">
        {content.sections.map((sec, i) => (
          <div key={i} style={{marginBottom: '20px'}}>
            <h2>{sec.h}</h2>
            <div className="formula">{sec.f}</div>
            <p style={{marginTop: '10px'}}>{sec.desc}</p>
          </div>
        ))}
        <button className="primary-btn" onClick={startQuiz} style={{marginTop: '15px'}}>ลองทำแบบฝึกหัด <ChevronRight size={17}/></button>
      </div>
    </>
  }

  function Reading() {
    const readingScore = activeStory.questions.filter(q => readingAnswers[q.id] === q.answer).length
    return <>
      <div className="page-title reading-title"><span className="eyebrow">READING COMPREHENSION MODULE</span><h1>Reading Manga <span>📖</span></h1><p>อ่านเรื่องสั้นมังงะแบบต่อเนื่อง จับใจความบทอ่านอย่างเป็นระบบ พร้อมเฉลยและเหตุผล</p></div>
      <div className="reading-banner"><div><span className="reading-level">{activeStory.level}</span><h2>{activeStory.title}</h2><p>บทอ่านต่อเนื่องความยาว {activeStory.passage.length} ย่อหน้า พร้อมภาพประกอบและคีย์เวิร์ด</p><div className="reading-meta"><span>⏱ {activeStory.time}</span><span>✦ {activeStory.questions.length} คำถาม</span><span>🎯 Reading Comprehension</span></div></div><div className="reading-banner-art">📚</div></div>
      <div className="reading-layout">
        <section className="panel reading-story">
          <div className="reading-section-head"><div><span className="eyebrow">MANGA PASSAGE</span><h2>เนื้อเรื่องบทอ่าน (Passage)</h2></div><span className="story-tag">{activeStory.title}</span></div>
          <img className="manga-illustration" src={activeStory.image} alt="ภาพการ์ตูนประกอบเรื่อง" />
          <div className="passage-text">{activeStory.passage.map((p, idx)=><p key={idx}><b>[ย่อหน้าที่ {idx+1}]</b> {p}</p>)}</div>
          <div className="passage-translation"><b>สรุปเรื่องราว (Thai Summary)</b><p>{activeStory.summary}</p></div>
          <div className="story-vocab"><h3>🧩 คำศัพท์น่ารู้ประจำบทอ่าน (Vocabulary)</h3>{activeStory.vocab.map((v, i)=><div className="vocab-row" key={i}><b>{v.word}</b><span>{v.meaning}</span></div>)}</div>
        </section>
        <aside className="reading-side">
          <div className="panel keyword-panel"><div className="keyword-title"><span>💡</span><div><b>เทคนิคการอ่าน (Reading Tip)</b><small>ค้นหาคำตอบในบทอ่าน</small></div></div><div className="keyword-item"><b>1. อ่านโจทย์ก่อน</b><span>ดูว่าโจทย์ถาม ใคร ทำอะไร ที่ไหน หรือทำไม</span></div><div className="keyword-item"><b>2. สแกนคีย์เวิร์ด</b><span>มองหาคำศัพท์สำคัญในย่อหน้าเพื่อหาตำแหน่งคำตอบ</span></div></div>
          <div className="panel reading-coach"><div className="coach-mascot">🐱</div><b>Reading Coach</b><p>อ่านคำถามทางด้านล่าง แล้วนำตัวเลือกมาเปรียบเทียบกับเนื้อเรื่องได้เลย!</p></div>
        </aside>
      </div>
      <section className="panel reading-quiz"><div className="reading-section-head"><div><span className="eyebrow">QUESTIONS FOR THIS PASSAGE</span><h2>โจทย์คำถามวัดความเข้าใจ ({activeStory.questions.length} ข้อ)</h2></div><span className="story-tag">Reading Questions</span></div>
        {activeStory.questions.map((q)=><div className="reading-question" key={q.id}><h3>{q.q}</h3><div className="reading-options">{q.options.map((o, j)=><button key={j} className={`${readingAnswers[q.id]===j?'chosen':''} ${readingSubmitted&&j===q.answer?'right':''} ${readingSubmitted&&readingAnswers[q.id]===j&&j!==q.answer?'wrong':''}`} disabled={readingSubmitted} onClick={()=>setReadingAnswers(a=>({...a,[q.id]:j}))}><b>{String.fromCharCode(65+j)}</b>{o}</button>)}</div>{readingSubmitted&&<div className="reading-explanation"><b>{readingAnswers[q.id]===q.answer?'✓ ถูกต้อง!':'✕ คำตอบที่ถูกคือ '+String.fromCharCode(65+q.answer)}</b><p>{q.why}</p></div>}</div>)}
        <div className="reading-submit">{!readingSubmitted?<button className="primary-btn" disabled={Object.keys(readingAnswers).length!==activeStory.questions.length} onClick={()=>setReadingSubmitted(true)}>ตรวจคำตอบ Reading <CheckCircle2 size={17}/></button>:<><div className="reading-result">คะแนน Reading ของคุณ <b>{readingScore}/{activeStory.questions.length}</b></div><button className="secondary-btn" onClick={()=>{setReadingAnswers({});setReadingSubmitted(false)}}><RotateCcw size={15}/> ลองอีกครั้ง</button></>}</div>
      </section>
    </>
  }

  function Practice() {
    if (submitted) return <div className="result-wrap"><div className="result-icon"><Trophy size={34}/></div><span className="eyebrow">PRACTICE COMPLETED</span><h1>ทำแบบฝึกหัดเสร็จแล้ว!</h1><div className="score-number">{score}<small> / {questions.length}</small></div><p className="score-caption">คุณตอบถูก {Math.round(score/questions.length*100)}% ของชุดฝึกไวยากรณ์นี้</p><div className="result-actions"><button className="primary-btn" onClick={resetQuiz}><RotateCcw size={17}/> ทำอีกครั้ง</button><button className="secondary-btn" onClick={()=>setPage('progress')}>ดูความก้าวหน้า</button></div><div className="panel review-panel"><h2>ทบทวนเฉลยไวยากรณ์</h2>{questions.map((q,i)=><div className="review-row" key={q.id}><div className="review-top"><b>ข้อ {i+1}. {q.question}</b>{selected[q.id]===q.answer?<CheckCircle2 className="correct"/>:<XCircle className="incorrect"/>}</div><p>คำตอบที่ถูก: <b>{q.options[q.answer]}</b></p><small>{q.explanation}</small></div>)}</div></div>
    const q = current
    return <><div className="page-title"><span className="eyebrow">GRAMMAR & VOCABULARY MODE</span><h1>ฝึกทำข้อสอบไวยากรณ์ ({questions.length} ข้อ)</h1><p>เลือกคำตอบที่ถูกต้องที่สุดตามหลักโครงสร้างภาษาอังกฤษ</p></div><div className="quiz-layout"><section className="panel quiz-panel"><div className="quiz-top"><span className="question-count">QUESTION {quizIndex+1} <small>/ {questions.length}</small></span><span className="level-pill">{q.level} · {q.topic}</span></div><div className="progress-track"><span style={{width:`${(quizIndex+1)/questions.length*100}%`}}/></div><h2 className="question-text">{q.question}</h2><div className="options">{q.options.map((o,i)=><button key={o} className={`option ${selected[q.id]===i?'chosen':''}`} onClick={()=>setSelected(s=>({...s,[q.id]:i}))}><span className="option-letter">{String.fromCharCode(65+i)}</span>{o}{selected[q.id]===i&&<CheckCircle2 size={18}/>}</button>)}</div><div className="quiz-footer"><button className="secondary-btn" disabled={quizIndex===0} onClick={()=>setQuizIndex(i=>i-1)}>ย้อนกลับ</button>{quizIndex<questions.length-1?<button className="primary-btn" disabled={selected[q.id]===undefined} onClick={()=>setQuizIndex(i=>i+1)}>ข้อต่อไป <ChevronRight size={17}/></button>:<button className="primary-btn" disabled={selected[q.id]===undefined} onClick={finishQuiz}>ส่งคำตอบ <CheckCircle2 size={17}/></button>}</div></section><aside className="panel quiz-aside"><div className="aside-symbol"><Brain size={23}/></div><h3>เทคนิคทำข้อสอบ</h3><p>{q.tip}</p><div className="aside-divider"/><b>รายการข้อสอบ</b><div className="question-dots">{questions.map((x,i)=><button key={x.id} className={`${i===quizIndex?'current':''} ${selected[x.id]!==undefined?'answered':''}`} onClick={()=>setQuizIndex(i)}>{i+1}</button>)}</div><small>ตอบแล้ว {Object.keys(selected).length} จาก {questions.length} ข้อ</small></aside></div></>
  }

  function Mock() {
    return <div className="empty-state panel"><div className="empty-icon"><ClipboardCheck size={32}/></div><span className="eyebrow">MOCK EXAM</span><h1>จำลองสนามสอบ</h1><p>โหมดจับเวลาและชุดข้อสอบเสมือนจริงกำลังอยู่ในแผนพัฒนาขั้นถัดไป</p><div className="mock-features"><span>✓ จับเวลาทำข้อสอบ</span><span>✓ สุ่มลำดับคำถาม</span><span>✓ สรุปคะแนนหลังสอบ</span></div><button className="primary-btn" onClick={startQuiz}>ทดลองทำชุดฝึกตอนนี้ <ChevronRight size={17}/></button></div>
  }

  function Progress() {
    return <><div className="page-title"><span className="eyebrow">YOUR PERFORMANCE</span><h1>ความก้าวหน้าของคุณ</h1><p>ดูพัฒนาการและวางแผนการฝึกครั้งต่อไป</p></div><div className="stats-grid"><div className="stat-card"><div className="stat-icon purple"><ClipboardCheck/></div><span>ชุดฝึกที่ทำแล้ว</span><strong>{completed}</strong></div><div className="stat-card"><div className="stat-icon blue"><BookOpen/></div><span>บทเรียนในระบบ</span><strong>6</strong></div><div className="stat-card"><div className="stat-icon green"><Target/></div><span>เป้าหมายต่อวัน</span><strong>30 <small>นาที</small></strong></div><div className="stat-card"><div className="stat-icon orange"><Trophy/></div><span>ระดับการเตรียมสอบ</span><strong>กำลังฝึก</strong></div></div><div className="panel progress-advice"><h2>แผนฝึกที่แนะนำ</h2><ol><li>ทบทวน Tenses และ Subject-Verb Agreement ในหมวด Grammar</li><li>ฝึกอ่านบทความต่อเนื่องในหมวด Reading Manga</li><li>ฝึกคำศัพท์เกี่ยวกับการศึกษา วันละ 10 คำ</li><li>ทำข้อสอบแบบจับเวลาและจดข้อผิดพลาด</li></ol><button className="primary-btn" onClick={startQuiz}>ฝึกต่อเลย <ChevronRight size={17}/></button></div></>
  }

  return <div className="app-shell"><Sidebar/><main className="main"><Header/><div className="page-content">{page==='dashboard'?<Dashboard/>:page==='lessons'?<Lessons/>:page==='lesson'?<LessonDetail/>:page==='reading'?<Reading/>:page==='practice'?<Practice/>:page==='mock'?<Mock/>:<Progress/>}</div><footer>ENGLISH EXAM MASTER <span>·</span> Teacher Assistant Preparation</footer></main>{mobileOpen&&<button className="mobile-scrim" onClick={()=>setMobileOpen(false)} aria-label="ปิดเมนู"><X/></button>}</div>
}

export default App
