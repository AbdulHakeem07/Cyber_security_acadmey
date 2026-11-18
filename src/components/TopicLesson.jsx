import { useState } from 'react'
import ActivityLogs from './ActivityLogs'
import AboutSQLInjection from './AboutSQLInjection'
import DatabaseExplorer from './DatabaseExplorer'
import InjectionSimulator from './InjectionSimulator'
import LoginLab from './LoginLab'

const courseModules = [
  { title: 'Understand', description: 'Learn the core idea' },
  { title: 'Defend', description: 'Put protection into practice' },
  { title: 'Practice', description: 'Work through a scenario' },
]

function TopicCourse({ topic, activeModule, setActiveModule, selectedChoice, setSelectedChoice, onClose }) {
  const isCorrect = selectedChoice === topic.answer

  function goToModule(index) {
    setActiveModule(Math.max(0, Math.min(index, courseModules.length - 1)))
  }

  return (
    <section className="topic-course" aria-label={`${topic.name} learning course`}>
      <aside className="topic-course-sidebar">
        <span className="section-eyebrow">LEARNING CENTER</span>
        <h2>Course contents</h2>
        <nav className="topic-course-modules" aria-label={`${topic.name} course modules`}>
          {courseModules.map((module, index) => (
            <button
              className={`topic-course-module${activeModule === index ? ' module-active' : ''}${index === 2 && isCorrect ? ' module-complete' : ''}`}
              type="button"
              key={module.title}
              onClick={() => goToModule(index)}
              aria-current={activeModule === index ? 'step' : undefined}
            >
              <span className="topic-course-module-number">{index === 2 && isCorrect ? '✓' : `0${index + 1}`}</span>
              <span className="topic-course-module-copy">
                <strong>{module.title}</strong>
                <small>{module.description}</small>
              </span>
            </button>
          ))}
        </nav>
        <div className="topic-course-progress">
          <div className="topic-course-progress-label">
            <span>Course progress</span>
            <strong>{activeModule + 1} of {courseModules.length}</strong>
          </div>
          <div
            className="topic-course-progress-track"
            role="progressbar"
            aria-label="Course progress"
            aria-valuemin={0}
            aria-valuemax={courseModules.length}
            aria-valuenow={activeModule + 1}
          >
            <span style={{ width: `${((activeModule + 1) / courseModules.length) * 100}%` }} />
          </div>
        </div>
      </aside>

      <div className="topic-course-panel">
        {activeModule === 0 && (
          <article className="topic-course-reading">
            <span className="section-eyebrow">MODULE 01 · THE CORE CONCEPT</span>
            <h2>Understand {topic.name}</h2>
            <p className="topic-course-lead">{topic.summary}</p>
            <div className="topic-course-prose">
              <p>{topic.lesson}</p>
            </div>
            <div className="topic-course-note">
              <span aria-hidden="true">i</span>
              <p>As you read, think about where this topic could affect the confidentiality, integrity, or availability of information.</p>
            </div>
          </article>
        )}

        {activeModule === 1 && (
          <article className="topic-course-reading">
            <span className="section-eyebrow">MODULE 02 · DEFENSIVE HABITS</span>
            <h2>How to defend against {topic.name.toLowerCase()}</h2>
            <p className="topic-course-lead">Use these habits to reduce risk and respond responsibly.</p>
            <div className="topic-course-takeaway">
              <span className="takeaway-mark" aria-hidden="true">✓</span>
              <div>
                <span className="section-eyebrow">DEFENSIVE TAKEAWAY</span>
                <p>{topic.takeaway}</p>
              </div>
            </div>
            <div className="topic-course-note">
              <span aria-hidden="true">i</span>
              <p>Practice security skills only in systems and exercises you own or are explicitly authorized to use.</p>
            </div>
          </article>
        )}

        {activeModule === 2 && (
          <section className="topic-course-practice" aria-labelledby="topic-practice-title">
            <div className="topic-lab-heading">
              <span className="section-eyebrow">MODULE 03 · HANDS-ON PRACTICE</span>
              <span className="lab-safety-note">Safe scenario · No external systems</span>
            </div>
            <h2 id="topic-practice-title">{topic.lab}</h2>
            <p className="topic-course-practice-hint">Choose the safest defensive response to complete this scenario.</p>
            <div className="lab-choices">
              {topic.choices.map((choice, index) => {
                const isSelected = selectedChoice === index
                const showCorrect = selectedChoice !== null && index === topic.answer

                return (
                  <button
                    className={`lab-choice${isSelected ? ' choice-selected' : ''}${showCorrect ? ' choice-correct' : ''}`}
                    type="button"
                    key={choice}
                    onClick={() => setSelectedChoice(index)}
                    disabled={selectedChoice !== null}
                  >
                    <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                    <span>{choice}</span>
                  </button>
                )
              })}
            </div>
            {selectedChoice !== null && (
              <div className={`lab-feedback ${isCorrect ? 'feedback-correct' : 'feedback-retry'}`} role="status" aria-live="polite">
                <strong>{isCorrect ? 'That’s right — scenario complete.' : 'Not quite — review the guidance and try again.'}</strong>
                <p>{topic.rationale}</p>
                {!isCorrect && (
                  <button className="try-again-button" type="button" onClick={() => setSelectedChoice(null)}>
                    Try again
                  </button>
                )}
                {isCorrect && (
                  <button className="topic-course-finish" type="button" onClick={onClose}>
                    Finish lesson
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        <div className="topic-course-navigation">
          <button type="button" onClick={() => goToModule(activeModule - 1)} disabled={activeModule === 0}>
            <span aria-hidden="true">←</span> Previous
          </button>
          {activeModule < courseModules.length - 1 ? (
            <button type="button" onClick={() => goToModule(activeModule + 1)}>
              Next module <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button type="button" onClick={() => goToModule(0)}>
              Review lesson <span aria-hidden="true">↻</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default function TopicLesson({ topic, onClose }) {
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [activeModule, setActiveModule] = useState(0)
  const isSqlInjection = topic.name === 'SQL injection'

  return (
    <section className="topic-detail-page">
      <div className="topic-detail-container">
        <button className="topic-back-button" type="button" onClick={onClose}>
          <span aria-hidden="true">←</span> Back to all topics
        </button>

        <header className="topic-detail-hero">
          <div className="topic-detail-copy">
            <span className="section-eyebrow">{topic.category} · LESSON</span>
            <h1>{topic.name}</h1>
            <p className="topic-detail-summary">{topic.summary}</p>
            {isSqlInjection && <p className="topic-detail-explanation">{topic.lesson}</p>}
          </div>
          <div className="topic-detail-image">
            <img src={topic.image} alt={`${topic.name} cybersecurity illustration`} />
            <span className="topic-detail-image-label">LEARN · UNDERSTAND · DEFEND</span>
          </div>
        </header>

        {isSqlInjection ? (
          <>
            <section className="topic-takeaway-section">
              <span className="takeaway-mark" aria-hidden="true">✓</span>
              <div>
                <span className="section-eyebrow">DEFENSIVE TAKEAWAY</span>
                <p>{topic.takeaway}</p>
              </div>
            </section>
            <div className="topic-practical-lab">
              <AboutSQLInjection />
              <LoginLab />
              <InjectionSimulator />
              <DatabaseExplorer />
              <ActivityLogs />
            </div>
          </>
        ) : (
          <TopicCourse
            topic={topic}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            selectedChoice={selectedChoice}
            setSelectedChoice={setSelectedChoice}
            onClose={onClose}
          />
        )}
      </div>
    </section>
  )
}
