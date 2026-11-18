
import { useState } from 'react'
import './LearningCenter.css'

const lessons = [
  {
    number: '01',
    title: 'What is SQL Injection?',
    category: 'FUNDAMENTALS',
    description:
      'SQL injection is a security vulnerability where untrusted input changes the meaning of a database query.',
    example: "A login form accepts input that is accidentally treated as SQL code.",
    prevention:
      'Treat user input as data, not executable SQL. Use parameterized queries.',
  },
  {
    number: '02',
    title: 'How Vulnerable Queries Work',
    category: 'UNDERSTANDING THE RISK',
    description:
      'A vulnerable application may combine user input directly with SQL using string concatenation.',
    example: "A query is built by joining a username and password directly into SQL text.",
    prevention:
      'Avoid building SQL statements by inserting user input into query strings.',
  },
  {
    number: '03',
    title: 'Parameterized Queries',
    category: 'PREVENTION',
    description:
      'Parameterized queries separate SQL instructions from the values supplied by users.',
    example:
      'A query uses placeholders such as username = ? and password = ?.',
    prevention:
      'Use prepared statements or parameterized queries for database operations.',
  },
  {
    number: '04',
    title: 'Additional Security Practices',
    category: 'BEST PRACTICES',
    description:
      'Secure database access requires more than preventing SQL injection.',
    example:
      'An application uses limited database permissions and safely handles errors.',
    prevention:
      'Apply least privilege, hash passwords, validate input, and avoid exposing database errors.',
  },
]

export default function LearningCenter() {
  const [activeLesson, setActiveLesson] = useState(0)
  const lesson = lessons[activeLesson]

  return (
    <section className="learning-section" id="learning">
      <div className="learning-heading">
        <div>
          <span className="learning-eyebrow">KNOWLEDGE BASE</span>
          <h2>SQL Injection Learning Center</h2>
          <p>
            Learn the fundamentals, understand the risks, and discover
            practical prevention techniques.
          </p>
        </div>
        <div className="learning-icon">▣</div>
      </div>

      <div className="learning-layout">
        <aside className="lesson-sidebar">
          <h3>COURSE CONTENT</h3>

          {lessons.map((item, index) => (
            <button
              type="button"
              key={item.number}
              className={`lesson-button ${
                activeLesson === index ? 'lesson-active' : ''
              }`}
              onClick={() => setActiveLesson(index)}
            >
              <span className="lesson-number">{item.number}</span>
              <span>{item.title}</span>
            </button>
          ))}

          <div className="lesson-progress">
            <span>YOUR PROGRESS</span>
            <strong>{activeLesson + 1} of {lessons.length} lessons</strong>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${((activeLesson + 1) / lessons.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </aside>

        <article className="lesson-content">
          <span className="lesson-category">{lesson.category}</span>
          <h3>{lesson.title}</h3>
          <p className="lesson-description">{lesson.description}</p>

          <div className="lesson-info example-info">
            <span>EXAMPLE / CONCEPT</span>
            <p>{lesson.example}</p>
          </div>

          <div className="lesson-info prevention-info">
            <span><span className="prevention-check">✓</span> HOW TO PREVENT IT</span>
            <p>{lesson.prevention}</p>
          </div>

          <div className="lesson-navigation">
            <button
              type="button"
              onClick={() => setActiveLesson((current) => Math.max(0, current - 1))}
              disabled={activeLesson === 0}
            >
              ← Previous lesson
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveLesson((current) =>
                  Math.min(lessons.length - 1, current + 1),
                )
              }
              disabled={activeLesson === lessons.length - 1}
            >
              Next lesson →
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}
