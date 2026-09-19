import { useEffect, useMemo, useState } from 'react'
import './App.css'

const HEARTS = ['❤️', '💗', '💕', '💖', '❣️']
const CELEBRATE_EMOJI = ['❤️', '💗', '💕', '💖', '❣️', '🎉', '🎊', '✨']
const BALLOON_COLORS = ['🎈', '🎈', '🎈']

function Sparkles() {
  return (
    <div className="sparkles" aria-hidden="true">
      <span className="sparkle s1">✨</span>
      <span className="sparkle s2">🦋</span>
      <span className="sparkle s3">✨</span>
      <span className="sparkle s4">🌸</span>
      <span className="sparkle s5">💐</span>
      <span className="sparkle s6">✨</span>
    </div>
  )
}

function Starfield({ count = 28 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 6 + Math.random() * 10,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 2.5,
      })),
    [count]
  )

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            fontSize: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}

function FloatingHearts({ count = 10 }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 5,
        emoji: HEARTS[i % HEARTS.length],
      })),
    [count]
  )

  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}

function Balloons({ count = 6 }) {
  const balloons = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        delay: Math.random() * 6,
        duration: 9 + Math.random() * 6,
        emoji: BALLOON_COLORS[i % BALLOON_COLORS.length],
      })),
    [count]
  )

  return (
    <div className="balloons" aria-hidden="true">
      {balloons.map((b) => (
        <span
          key={b.id}
          className="balloon"
          style={{
            left: `${b.left}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        >
          {b.emoji}
        </span>
      ))}
    </div>
  )
}

function PhotoCard({ memory, onCaptionChange, onRemove }) {
  return (
    <div className="photo-card">
      <button
        type="button"
        className="remove-photo"
        title="Remove this photo"
        onClick={() => onRemove(memory)}
      >
        ✕
      </button>
      <div className="photo-placeholder">
        <img src={memory.src} alt={memory.caption} />
      </div>
      <div
        className="caption"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onCaptionChange(memory, e.currentTarget.textContent)}
      >
        {memory.caption}
      </div>
    </div>
  )
}

function AddPhotoInfoCard() {
  return (
    <div className="add-photo-card">
      <span className="add-photo-icon">+</span>
      <span>
        Upload a photo in Vercel's Blob dashboard (any file name works) — it'll show up
        here automatically
      </span>
    </div>
  )
}

function App() {
  const [name] = useState('Bestie')
  const [burst, setBurst] = useState([])
  const [memories, setMemories] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/memories')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMemories(Array.isArray(data) ? data : []))
      .catch(() => {
        // /api routes only run on Vercel (or `vercel dev`) — the gallery
        // just stays empty when previewing with plain `vite dev`
      })
      .finally(() => setLoaded(true))
  }, [])

  const handleCaptionChange = (memory, caption) => {
    setMemories((prev) => prev.map((m) => (m.id === memory.id ? { ...m, caption } : m)))
    fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: memory.src, caption }),
    }).catch(() => {})
  }

  const removeMemory = (memory) => {
    setMemories((prev) => prev.filter((m) => m.id !== memory.id))
    fetch('/api/memories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: memory.src }),
    }).catch(() => {})
  }

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const celebrate = () => {
    const id = Date.now()
    const newHearts = Array.from({ length: 22 }, (_, i) => ({
      id: id + i,
      left: 10 + Math.random() * 80,
      emoji: CELEBRATE_EMOJI[i % CELEBRATE_EMOJI.length],
      drift: Math.random() * 140 - 70,
      delay: Math.random() * 0.3,
    }))
    setBurst((prev) => [...prev, ...newHearts])
    setTimeout(() => {
      setBurst((prev) => prev.filter((h) => !newHearts.some((n) => n.id === h.id)))
    }, 1800)
  }

  useEffect(() => {
    const t1 = setTimeout(celebrate, 500)
    const t2 = setTimeout(celebrate, 1100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <section id="hero" className="section pink">
        <Starfield />
        <FloatingHearts />
        <Balloons />
        <Sparkles />
        <h1 className="script">Happy Birthday, {name}!</h1>
        <p className="subtitle">Today is all about celebrating you and the joy you bring to my life</p>
        <div className="hearts-row">
          {HEARTS.map((h, i) => (
            <span key={i} className="heart-emoji">{h}</span>
          ))}
        </div>
        <button className="cta" onClick={celebrate}>
          Start the Celebration 🎉
        </button>
        <div className="burst-layer" aria-hidden="true">
          {burst.map((h) => (
            <span
              key={h.id}
              className="burst-heart"
              style={{
                left: `${h.left}%`,
                animationDelay: `${h.delay}s`,
                '--drift': `${h.drift}px`,
              }}
            >
              {h.emoji}
            </span>
          ))}
        </div>
      </section>

      <section id="memories" className="section light">
        <div className="hearts-row small">
          {HEARTS.map((h, i) => (
            <span key={i} className="heart-emoji">{h}</span>
          ))}
        </div>
        <h2 className="script section-title">Our Beautiful Memories</h2>
        <div className="gallery">
          {memories.map((m) => (
            <PhotoCard
              key={m.id}
              memory={m}
              onCaptionChange={handleCaptionChange}
              onRemove={removeMemory}
            />
          ))}
          {loaded && memories.length === 0 && (
            <p className="no-memories">No photos yet — add some from the Vercel Blob dashboard!</p>
          )}
          <AddPhotoInfoCard />
        </div>
        <button className="cta ghost" onClick={() => scrollTo('message')}>
          Read My Message 💌
        </button>
      </section>

      <section id="message" className="section purple">
        <Sparkles />
        <div className="message-card">
          <h2 className="script">A Special Message for You</h2>
          <p>
            On this special day, I want you to know how grateful I am to have you in my life.
            Your laughter fills my days with joy, your support gives me strength, and your
            presence makes everything better. You're not just my best friend, you're my
            partner in crime, my go-to person, my ride-or-die.
          </p>
          <p>
            Today, we celebrate you &mdash; your kindness, your beauty, your amazing spirit, and
            all the wonderful things that make you uniquely you. I hope this new year of your
            life brings you endless happiness, incredible adventures, and all your dreams come
            true.
          </p>
          <p className="signature">
            Happy Birthday, my Bestie! Here's to many more years of laughter, chaos, and
            unforgettable memories together. 💕
          </p>
          <div className="hearts-row">
            <span className="heart-emoji">💖</span>
            <span className="heart-emoji">💕</span>
            <span className="heart-emoji">❤️</span>
            <span className="heart-emoji">💗</span>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
