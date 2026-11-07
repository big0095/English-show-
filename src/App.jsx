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
  { title: 'Tenses ที่ออกสอบบ่อย', desc: 'Present, Past และ Future พร้อมคำบอกเวลา', tag: 'Grammar', time: '20 นาที', icon: BookOpen },
  { title: 'Subject-Verb Agreement', desc: 'การเลือกกริยาให้สอดคล้องกับประธาน', tag: 'Grammar', time: '15 นาที', icon: Brain },
  { title: 'Prepositions', desc: 'การใช้ in, on, at และคำบุพบทสำคัญ', tag: 'Grammar', time: '15 นาที', icon: BookMarked },
  { title: 'Vocabulary for Teachers', desc: 'คำศัพท์เกี่ยวกับโรงเรียนและการศึกษา', tag: 'Vocabulary', time: '15 นาที', icon: GraduationCap },
  { title: 'Reading Comprehension', desc: 'ฝึกอ่านจับใจความและหาความหมายจากบริบท', tag: 'Reading', time: '25 นาที', icon: ClipboardCheck },
  { title: 'Everyday Conversation', desc: 'บทสนทนาและการเลือกคำตอบให้เหมาะสม', tag: 'Conversation', time: '15 นาที', icon: Sparkles }
]

function App() {
  const [page, setPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selected, setSelected] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [completed, setCompleted] = useState(() => Number(localStorage.getItem('eem-completed') || 0))
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ทั้งหมด')
  const [readingAnswers, setReadingAnswers] = useState({})
  const [readingSubmitted, setReadingSubmitted] = useState(false)

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
      <nav>{navItems.map(([id, label, Icon]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => {setPage(id);setMobileOpen(false)}}><Icon size={18}/><span>{label}</span>{id === 'practice' && <i>ใหม่</i>}</button>)}</nav>
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
          <div className="learning-list">{lessons.slice(0,4).map((l,i)=><button className="learning-row" key={l.title} onClick={()=>setPage(l.tag==='Reading'?'reading':'lessons')}><div className={`lesson-icon color-${i}`}><l.icon size={19}/></div><div className="lesson-info"><b>{l.title}</b><span>{l.desc}</span></div><small>{l.time}</small><ChevronRight size={17}/></button>)}</div>
        </section>
        <section className="panel daily-panel"><div className="daily-icon"><Clock3 size={22}/></div><span className="eyebrow">TODAY'S CHALLENGE</span><h2>ฝึกวันละนิด<br/>พิชิตข้อสอบ</h2><p>เริ่มจากแบบฝึกหัด 8 ข้อ เพื่อทบทวน Grammar, Vocabulary และ Conversation</p><button className="dark-btn" onClick={startQuiz}>ทำแบบฝึกหัดวันนี้ <ChevronRight size={16}/></button><div className="daily-decoration">✦</div></section>
      </div>
      <div className="note"><Sparkles size={18}/><div><b>คำแนะนำจาก English Coach</b><p>อย่าเน้นจำเฉลยเพียงอย่างเดียว ให้สังเกตเหตุผลและหลักไวยากรณ์ที่อยู่เบื้องหลังคำตอบทุกข้อ</p></div></div>
    </>
  }

  function Lessons() {
    return <><div className="page-title"><span className="eyebrow">LEARNING LIBRARY</span><h1>คลังบทเรียน</h1><p>เลือกหัวข้อที่ต้องการทบทวน แล้วพัฒนาความแม่นยำทีละเรื่อง</p></div>
      <div className="toolbar"><div className="searchbox"><Search size={18}/><input placeholder="ค้นหาบทเรียน..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="filters">{['ทั้งหมด','Grammar','Vocabulary','Reading','Conversation'].map(f=><button key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
      <div className="lesson-grid">{filteredLessons.map((l,i)=><article className="lesson-card" key={l.title}><div className={`lesson-icon large color-${i}`}><l.icon size={22}/></div><span className="category">{l.tag}</span><h3>{l.title}</h3><p>{l.desc}</p><div className="lesson-card-foot"><span><Clock3 size={14}/> {l.time}</span><button onClick={()=>setPage(l.tag==='Reading'?'reading':'lesson')}>เริ่มเรียน <ChevronRight size={15}/></button></div></article>)}</div>
    </>
  }

  function LessonDetail() {
    return <><button className="back-btn" onClick={()=>setPage('lessons')}>← กลับไปคลังบทเรียน</button><div className="page-title"><span className="eyebrow">GRAMMAR FOUNDATION</span><h1>Present Simple Tense</h1><p>ใช้พูดถึงกิจวัตร ความจริงทั่วไป และสิ่งที่เกิดขึ้นเป็นประจำ</p></div><div className="panel lesson-content"><h2>1. โครงสร้างประโยค</h2><div className="formula">Subject + V.1 (เติม s/es เมื่อประธานเป็น He / She / It)</div><h3>ตัวอย่าง</h3><p><b>She teaches English every day.</b><br/><span className="translation">เธอสอนภาษาอังกฤษทุกวัน</span></p><p><b>They play football after school.</b><br/><span className="translation">พวกเขาเล่นฟุตบอลหลังเลิกเรียน</span></p><h3>2. คำบอกเวลาที่พบบ่อย</h3><div className="vocab-chips"><span>always = เสมอ</span><span>usually = โดยปกติ</span><span>often = บ่อย ๆ</span><span>every day = ทุกวัน</span><span>sometimes = บางครั้ง</span></div><div className="exam-tip"><b>จุดที่มักออกสอบ</b><p>ถ้าประธานเป็นเอกพจน์บุรุษที่ 3 (He, She, It หรือคำนามเอกพจน์) ในประโยคบอกเล่า ต้องเติม s/es ที่กริยา</p></div><button className="primary-btn" onClick={startQuiz}>ลองทำแบบฝึกหัด <ChevronRight size={17}/></button></div></>
  }

  function Reading() {
    const readingQuestions = [
      { q: 'What is the main idea of the passage?', options: ['Tom likes cats very much.', 'Tom found a kitten and helped it.', 'The vet works at a school.', 'The kitten ran away.'], answer: 1, why: 'ใจความสำคัญคือ Tom พบลูกแมวและช่วยเหลือมัน เพราะเหตุการณ์หลักของเรื่องกล่าวถึงการช่วยลูกแมวที่บาดเจ็บ' },
      { q: 'Why did Tom take the kitten to the animal hospital?', options: ['It was hungry.', 'It was lost.', 'It was hurt and cold.', 'It was noisy.'], answer: 2, why: 'คำใบ้คือ “hurt and cold” แปลว่า บาดเจ็บและหนาว จึงต้องพาไปโรงพยาบาลสัตว์' },
      { q: 'The word “kind” is closest in meaning to _____.', options: ['angry', 'helpful and caring', 'lazy', 'afraid'], answer: 1, why: 'kind หมายถึง ใจดี มีน้ำใจ ซึ่งสอดคล้องกับการที่ Tom ช่วยลูกแมว' }
    ]
    const readingScore = readingQuestions.filter((q,i)=>readingAnswers[i]===q.answer).length
    return <>
      <div className="page-title reading-title"><span className="eyebrow">READ · UNDERSTAND · ANSWER</span><h1>Reading Manga <span>📖</span></h1><p>อ่านเรื่องสั้นผ่านภาพการ์ตูน ฝึกจับใจความ พร้อมเก็บคีย์เวิร์ดที่ออกสอบบ่อย</p></div>
      <div className="reading-banner"><div><span className="reading-level">READING STORY · LEVEL 01</span><h2>The Little Hero</h2><p>เรื่องราวของเด็กชายผู้มีน้ำใจ ช่วยเหลือลูกแมวตัวน้อย</p><div className="reading-meta"><span>⏱ 5–7 นาที</span><span>✦ 3 คำถาม</span><span>🎯 Main Idea & Vocabulary</span></div></div><div className="reading-banner-art">📚</div></div>
      <div className="reading-layout">
        <section className="panel reading-story">
          <div className="reading-section-head"><div><span className="eyebrow">MANGA STORY</span><h2>Read the story</h2></div><span className="story-tag">A kind action</span></div>
          <img className="manga-illustration" src="/images/reading-kitten-manga.png" alt="ภาพการ์ตูนมังงะเด็กชายช่วยลูกแมว" />
          <div className="passage-text"><p><b>Tom is a kind boy.</b> One day, he found a little kitten on the street. The kitten was hurt and cold. Tom quickly took it to the animal hospital.</p><p>The vet said, “You are a good boy. Animals need kind people like you.” Tom smiled happily.</p></div>
          <div className="passage-translation"><b>สรุปใจความภาษาไทย</b><p>ทอมพบลูกแมวตัวหนึ่งที่บาดเจ็บและหนาว เขาจึงรีบพามันไปโรงพยาบาลสัตว์ สัตวแพทย์ชมว่าทอมเป็นเด็กดีและมีน้ำใจ</p></div>
          <div className="story-vocab"><h3>🧩 Vocabulary to remember</h3><div className="vocab-row"><b>kind</b><span>ใจดี / มีน้ำใจ</span></div><div className="vocab-row"><b>kitten</b><span>ลูกแมว</span></div><div className="vocab-row"><b>hurt</b><span>บาดเจ็บ</span></div><div className="vocab-row"><b>animal hospital</b><span>โรงพยาบาลสัตว์</span></div></div>
        </section>
        <aside className="reading-side">
          <div className="panel keyword-panel"><div className="keyword-title"><span>💡</span><div><b>KEYWORDS ที่ต้องรู้</b><small>คำใบ้ช่วยจับใจความ</small></div></div><div className="keyword-item"><b>One day</b><span>วันหนึ่ง · เปิดเหตุการณ์ในอดีต</span></div><div className="keyword-item"><b>because</b><span>เพราะว่า · บอกเหตุผล</span></div><div className="keyword-item"><b>quickly</b><span>อย่างรวดเร็ว · บอกลักษณะการกระทำ</span></div><div className="keyword-item"><b>kind</b><span>ใจดี · คำคุณศัพท์บอกลักษณะ</span></div><div className="keyword-memory">จำไว้: อ่านคำถามก่อน แล้วกลับไปหาประโยคที่เป็นหลักฐานในเรื่อง</div></div>
          <div className="panel reading-coach"><div className="coach-mascot">🐱</div><b>Reading Coach</b><p>อย่าแปลทุกคำ! ลองหาคำสำคัญและประโยคที่ตอบคำถามให้เจอก่อน</p></div>
        </aside>
      </div>
      <section className="panel reading-quiz"><div className="reading-section-head"><div><span className="eyebrow">CHECK YOUR UNDERSTANDING</span><h2>ตอบคำถามจากเรื่องที่อ่าน</h2></div><span className="story-tag">3 Questions</span></div>
        {readingQuestions.map((q,i)=><div className="reading-question" key={i}><h3><span>{i+1}</span>{q.q}</h3><div className="reading-options">{q.options.map((o,j)=><button key={j} className={`${readingAnswers[i]===j?'chosen':''} ${readingSubmitted&&j===q.answer?'right':''} ${readingSubmitted&&readingAnswers[i]===j&&j!==q.answer?'wrong':''}`} disabled={readingSubmitted} onClick={()=>setReadingAnswers(a=>({...a,[i]:j}))}><b>{String.fromCharCode(65+j)}</b>{o}</button>)}</div>{readingSubmitted&&<div className="reading-explanation"><b>{readingAnswers[i]===q.answer?'✓ ถูกต้อง!':'✕ คำตอบที่ถูกคือ '+String.fromCharCode(65+q.answer)}</b><p>{q.why}</p></div>}</div>)}
        <div className="reading-submit">{!readingSubmitted?<button className="primary-btn" disabled={Object.keys(readingAnswers).length!==readingQuestions.length} onClick={()=>setReadingSubmitted(true)}>ตรวจคำตอบ <CheckCircle2 size={17}/></button>:<><div className="reading-result">คะแนนของคุณ <b>{readingScore}/3</b></div><button className="secondary-btn" onClick={()=>{setReadingAnswers({});setReadingSubmitted(false)}}><RotateCcw size={15}/> ลองอีกครั้ง</button></>}</div>
      </section>
    </>
  }

  function Practice() {
    if (submitted) return <div className="result-wrap"><div className="result-icon"><Trophy size={34}/></div><span className="eyebrow">PRACTICE COMPLETED</span><h1>ทำแบบฝึกหัดเสร็จแล้ว!</h1><div className="score-number">{score}<small> / {questions.length}</small></div><p className="score-caption">คุณตอบถูก {Math.round(score/questions.length*100)}% ของชุดฝึกนี้</p><div className="result-actions"><button className="primary-btn" onClick={resetQuiz}><RotateCcw size={17}/> ทำอีกครั้ง</button><button className="secondary-btn" onClick={()=>setPage('progress')}>ดูความก้าวหน้า</button></div><div className="panel review-panel"><h2>ทบทวนคำตอบ</h2>{questions.map((q,i)=><div className="review-row" key={q.id}><div className="review-top"><b>ข้อ {i+1}. {q.question}</b>{selected[q.id]===q.answer?<CheckCircle2 className="correct"/>:<XCircle className="incorrect"/>}</div><p>คำตอบที่ถูก: <b>{q.options[q.answer]}</b></p><small>{q.explanation}</small></div>)}</div></div>
    const q = current
    return <><div className="page-title"><span className="eyebrow">PRACTICE MODE · ชุดพื้นฐาน</span><h1>ฝึกทำข้อสอบ</h1><p>อ่านโจทย์ให้ครบ เลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว</p></div><div className="quiz-layout"><section className="panel quiz-panel"><div className="quiz-top"><span className="question-count">QUESTION {quizIndex+1} <small>/ {questions.length}</small></span><span className="level-pill">{q.level} · {q.topic}</span></div><div className="progress-track"><span style={{width:`${(quizIndex+1)/questions.length*100}%`}}/></div><h2 className="question-text">{q.question}</h2><div className="options">{q.options.map((o,i)=><button key={o} className={`option ${selected[q.id]===i?'chosen':''}`} onClick={()=>setSelected(s=>({...s,[q.id]:i}))}><span className="option-letter">{String.fromCharCode(65+i)}</span>{o}{selected[q.id]===i&&<CheckCircle2 size={18}/>}</button>)}</div><div className="quiz-footer"><button className="secondary-btn" disabled={quizIndex===0} onClick={()=>setQuizIndex(i=>i-1)}>ย้อนกลับ</button>{quizIndex<questions.length-1?<button className="primary-btn" disabled={selected[q.id]===undefined} onClick={()=>setQuizIndex(i=>i+1)}>ข้อต่อไป <ChevronRight size={17}/></button>:<button className="primary-btn" disabled={selected[q.id]===undefined} onClick={finishQuiz}>ส่งคำตอบ <CheckCircle2 size={17}/></button>}</div></section><aside className="panel quiz-aside"><div className="aside-symbol"><Brain size={23}/></div><h3>เทคนิคทำข้อสอบ</h3><p>สังเกตคำบอกเวลาและประธานของประโยคก่อนเลือกคำตอบ</p><div className="aside-divider"/><b>ความคืบหน้า</b><div className="question-dots">{questions.map((x,i)=><button key={x.id} className={`${i===quizIndex?'current':''} ${selected[x.id]!==undefined?'answered':''}`} onClick={()=>setQuizIndex(i)}>{i+1}</button>)}</div><small>ตอบแล้ว {Object.keys(selected).length} จาก {questions.length} ข้อ</small></aside></div></>
  }

  function Mock() {
    return <div className="empty-state panel"><div className="empty-icon"><ClipboardCheck size={32}/></div><span className="eyebrow">MOCK EXAM</span><h1>จำลองสนามสอบ</h1><p>โหมดจับเวลาและชุดข้อสอบเสมือนจริงกำลังอยู่ในแผนพัฒนาขั้นถัดไป</p><div className="mock-features"><span>✓ จับเวลาทำข้อสอบ</span><span>✓ สุ่มลำดับคำถาม</span><span>✓ สรุปคะแนนหลังสอบ</span></div><button className="primary-btn" onClick={startQuiz}>ทดลองทำชุดฝึกตอนนี้ <ChevronRight size={17}/></button></div>
  }

  function Progress() {
    return <><div className="page-title"><span className="eyebrow">YOUR PERFORMANCE</span><h1>ความก้าวหน้าของคุณ</h1><p>ดูพัฒนาการและวางแผนการฝึกครั้งต่อไป</p></div><div className="stats-grid"><div className="stat-card"><div className="stat-icon purple"><ClipboardCheck/></div><span>ชุดฝึกที่ทำแล้ว</span><strong>{completed}</strong></div><div className="stat-card"><div className="stat-icon blue"><BookOpen/></div><span>บทเรียนในระบบ</span><strong>6</strong></div><div className="stat-card"><div className="stat-icon green"><Target/></div><span>เป้าหมายต่อวัน</span><strong>30 <small>นาที</small></strong></div><div className="stat-card"><div className="stat-icon orange"><Trophy/></div><span>ระดับการเตรียมสอบ</span><strong>กำลังฝึก</strong></div></div><div className="panel progress-advice"><h2>แผนฝึกที่แนะนำ</h2><ol><li>ทบทวน Tenses และ Subject-Verb Agreement</li><li>ฝึกคำศัพท์เกี่ยวกับการศึกษา วันละ 10 คำ</li><li>อ่านบทความภาษาอังกฤษสั้น ๆ แล้วสรุปใจความ</li><li>ทำข้อสอบแบบจับเวลาและจดข้อผิดพลาด</li></ol><button className="primary-btn" onClick={startQuiz}>ฝึกต่อเลย <ChevronRight size={17}/></button></div></>
  }

  return <div className="app-shell"><Sidebar/><main className="main"><Header/><div className="page-content">{page==='dashboard'?<Dashboard/>:page==='lessons'?<Lessons/>:page==='lesson'?<LessonDetail/>:page==='reading'?<Reading/>:page==='practice'?<Practice/>:page==='mock'?<Mock/>:<Progress/>}</div><footer>ENGLISH EXAM MASTER <span>·</span> Teacher Assistant Preparation <span>·</span> เวอร์ชันเริ่มต้น</footer></main>{mobileOpen&&<button className="mobile-scrim" onClick={()=>setMobileOpen(false)} aria-label="ปิดเมนู"><X/></button>}</div>
}

export default App
