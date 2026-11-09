import { useEffect, useState } from 'react'

export default function LegacyExamLibrary() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <>
      <button className="legacy-exams-launcher" onClick={() => setOpen(true)} type="button">
        คลังข้อสอบเดิม
      </button>
      {open && (
        <div className="legacy-exams-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false)
        }}>
          <section className="legacy-exams-dialog" role="dialog" aria-modal="true" aria-label="คลังข้อสอบเดิม">
            <header className="legacy-exams-toolbar">
              <div>
                <strong>คลังข้อสอบเดิม</strong>
                <span>ข้อสอบและแบบฝึกหัดจากหน้าเดิม</span>
              </div>
              <div className="legacy-exams-actions">
                <a href={`${import.meta.env.BASE_URL}english-exam-master.html`} target="_blank" rel="noreferrer">
                  เปิดเต็มหน้า
                </a>
                <button type="button" onClick={() => setOpen(false)} aria-label="ปิดคลังข้อสอบ">ปิด</button>
              </div>
            </header>
            <iframe
              className="legacy-exams-frame"
              src={`${import.meta.env.BASE_URL}english-exam-master.html`}
              title="คลังข้อสอบเดิม English Exam Academy"
            />
          </section>
        </div>
      )}
    </>
  )
}
