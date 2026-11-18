
import { useState } from 'react'
import './AboutSQLInjection.css'

const lessons = [
  {
    title: 'SQL basics',
    icon: '📚',
    content: (
      <>
        <p>
          <strong>SQL</strong> is a language that applications use to work
          with information stored in a database.
        </p>
        <h3>Common tasks</h3>
        <ul>
          <li>Save and find records.</li>
          <li>Change information when allowed.</li>
          <li>Organize data into tables.</li>
        </ul>
        <h3>A simple example</h3>
        <pre><code>SELECT * FROM students;</code></pre>
        <p>
          This asks the database to show the records in the students table.
        </p>
      </>
    ),
  },
  {
    title: 'What is SQL injection?',
    icon: '💉',
    content: (
      <>
        <p>
          <strong>SQL injection</strong> is a flaw that can happen when an
          application puts user input into a database command in an unsafe
          way.
        </p>
        <p>
          The database may then treat some of that input as an instruction
          instead of ordinary information. This can make a query behave in
          an unexpected way.
        </p>
        <p>
          The main lesson is simple: keep database instructions separate
          from values people enter.
        </p>
      </>
    ),
  },
  {
    title: 'Why it matters',
    icon: '🌍',
    content: (
      <>
        <p>
          A successful SQL injection flaw may let someone see information
          they should not access, get around an application check, or change
          and remove stored records.
        </p>
        <h3>Information that may be at risk</h3>
        <ul>
          <li>Account and contact details.</li>
          <li>Orders, payments, or other private records.</li>
          <li>Information that affects how an application works.</li>
        </ul>
        <p>
          The real impact depends on what the application can access and
          what permissions its database account has.
        </p>
      </>
    ),
  },
  {
    title: 'Where can it happen?',
    icon: '🔎',
    content: (
      <>
        <p>
          The risk can appear anywhere an application uses outside
          information to build a database query.
        </p>
        <h3>Common places to review</h3>
        <ul>
          <li>Login, search, and product-filter forms.</li>
          <li>Values used to add or update records.</li>
          <li>Sorting options, table names, or column names.</li>
          <li>Inputs sent through web pages, mobile apps, or APIs.</li>
        </ul>
        <p>
          Changing the input format, such as sending JSON or XML, does not
          fix an unsafe query. Checking for a few blocked words is not a
          reliable defense either.
        </p>
      </>
    ),
  },
  {
    title: 'Common forms of SQL injection',
    icon: '🧩',
    content: (
      <>
        <p>
          SQL injection can affect database queries in different ways.
          These names describe the kind of result, not a safe way to test a
          live service.
        </p>
        <ul>
          <li><strong>Unwanted results:</strong> a query returns records that should stay hidden.</li>
          <li><strong>Changed query logic:</strong> a database check may not work as intended.</li>
          <li><strong>Combined results:</strong> a query may expose information from another data source.</li>
          <li><strong>Blind SQL injection:</strong> the page does not show query results, but unsafe database behavior may still be inferred.</li>
        </ul>
        <p>
          Security teams should study these ideas only in a local training
          lab or a system they have permission to assess.
        </p>
      </>
    ),
  },
  {
    title: 'Second-order SQL injection',
    icon: '⏱️',
    content: (
      <>
        <p>
          Sometimes an application saves a value safely, then uses it in an
          unsafe database query later. This delayed problem is called
          <strong> second-order SQL injection</strong>.
        </p>
        <p>
          Saved information is still untrusted. Use safe query methods every
          time the application reads or uses it, not just when it is first
          received.
        </p>
      </>
    ),
  },
  {
    title: 'Databases and safe review',
    icon: '🗂️',
    content: (
      <>
        <p>
          Different database products can use different rules and features.
          A check that works for one database may not work for another.
        </p>
        <h3>Good review habits</h3>
        <ul>
          <li>Review how the application creates each database query.</li>
          <li>Use approved tools only on systems you are allowed to test.</li>
          <li>Do not rely on hiding errors or blocking a few input patterns.</li>
        </ul>
        <p>
          If an issue is found, record it safely and report it through the
          system owner's approved process.
        </p>
      </>
    ),
  },
  {
    title: 'How to prevent SQL injection',
    icon: '🛡️',
    content: (
      <>
        <h3>Practical protections</h3>
        <ul>
          <li>
            <strong>Use parameterized queries:</strong> keep the SQL command
            apart from the values supplied by users.
          </li>
          <li>
            <strong>Allowlist query options:</strong> use approved choices
            for table names, column names, and sort order.
          </li>
          <li>
            <strong>Limit database access:</strong> give an application only
            the permissions it needs.
          </li>
          <li>
            <strong>Handle errors safely:</strong> show users a general
            message and keep technical details in protected logs.
          </li>
          <li>
            <strong>Check your work:</strong> review and test changes before
            release, using authorized environments.
          </li>
        </ul>
        <p>
          Checking input can help, but it does not replace parameterized
          queries.
        </p>
      </>
    ),
  },
]

function AboutSQLInjection() {
  const [activeLesson, setActiveLesson] = useState(0)

  const currentLesson = lessons[activeLesson]

  function goNext() {
    setActiveLesson((current) =>
      Math.min(current + 1, lessons.length - 1)
    )
  }

  function goPrevious() {
    setActiveLesson((current) =>
      Math.max(current - 1, 0)
    )
  }

  return (
    <section className="about-sqli-section" id="about">
      <div className="about-sqli-heading">
        <span className="about-sqli-label">LEARNING CENTER</span>
        <h2>Understanding SQL Injection</h2>
        <p>
          Learn the basic idea, the risks, common forms, and the safest ways
          to protect an application and its data.
        </p>
      </div>

      <div className="about-sqli-layout">
        <aside className="about-sqli-sidebar">
          <h3>Course Contents</h3>

          {lessons.map((lesson, index) => (
            <button
              key={lesson.title}
              className={`about-sqli-topic ${
                activeLesson === index ? 'active' : ''
              }`}
              onClick={() => setActiveLesson(index)}
            >
              <span>{lesson.icon}</span>
              <span>{lesson.title}</span>
            </button>
          ))}
        </aside>

        <article className="about-sqli-content">
          <div className="about-sqli-progress">
            <span>
              Lesson {activeLesson + 1} of {lessons.length}
            </span>
            <span>
              {Math.round(((activeLesson + 1) / lessons.length) * 100)}% complete
            </span>
          </div>

          <div className="about-sqli-progress-track">
            <div
              className="about-sqli-progress-fill"
              style={{
                width: `${((activeLesson + 1) / lessons.length) * 100}%`,
              }}
            />
          </div>

          <div className="about-sqli-lesson">
            <div className="about-sqli-lesson-icon">
              {currentLesson.icon}
            </div>
            <h2>{currentLesson.title}</h2>
            <div className="about-sqli-lesson-body">
              {currentLesson.content}
            </div>
          </div>

          <div className="about-sqli-navigation">
            <button
              onClick={goPrevious}
              disabled={activeLesson === 0}
            >
              ← Previous
            </button>

            <button
              onClick={goNext}
              disabled={activeLesson === lessons.length - 1}
            >
              Next Lesson →
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}

export default AboutSQLInjection
