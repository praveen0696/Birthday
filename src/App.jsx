import { useEffect, useMemo, useState } from 'react'
import { upload } from '@vercel/blob/client'
import './App.css'

const HEARTS = ['❤️', '💗', '💕', '💖', '❣️']
const CELEBRATE_EMOJI = ['❤️', '💗', '💕', '💖', '❣️', '🎉', '🎊', '✨']
const BALLOON_COLORS = ['🎈', '🎈', '🎈']

const DEFAULT_MEMORIES = [
  { id: 'm1', caption: 'Our first dance', src: null },
  { id: 'm2', caption: 'That sunset by the sea', src: null },
  { id: 'm3', caption: 'Adventures together', src: null },
  { id: 'm4', caption: 'Silly faces, big laughs', src: null },
  { id: 'm5', caption: 'Just us, no plans', src: null },
  { id: 'm6', caption: 'The trip we still talk about', src: null },
]

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

function PhotoCard({ memory, onPhotoChange, onCaptionChange, onRemove }) {
  const inputId = `photo-input-${memory.id}`
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(false)
    try {
      const blob = await upload(`memories/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })
      onPhotoChange(memory.id, blob.url)
    } catch {
      setError(true)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="photo-card">
      <button
        type="button"
        className="remove-photo"
        title="Remove this card"
        onClick={() => onRemove(memory.id)}
      >
        ✕
      </button>
      <label className="photo-placeholder" htmlFor={inputId}>
        {memory.src ? (
          <img src={memory.src} alt={memory.caption} />
        ) : (
          <>
            <span>{uploading ? '⏳' : '📷'}</span>
            <small>{uploading ? 'Uploading…' : error ? 'Upload failed, try again' : 'Add photo'}</small>
          </>
        )}
        <span className="photo-overlay">
          {uploading ? 'Uploading…' : `Click to ${memory.src ? 'change' : 'add'} photo`}
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        hidden
      />
      <div
        className="caption"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onCaptionChange(memory.id, e.currentTarget.textContent)}
      >
        {memory.caption}
      </div>
    </div>
  )
}

function App() {
  const [name] = useState('Bestie')
  const [burst, setBurst] = useState([])
  const [memories, setMemories] = useState(DEFAULT_MEMORIES)

  useEffect(() => {
    fetch('/api/memories')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length) setMemories(data)
      })
      .catch(() => {
        // /api routes only run on Vercel (or `vercel dev`) — fall back to
        // the built-in defaults when previewing with plain `vite dev`
      })
  }, [])

  const syncMemories = (next) => {
    setMemories(next)
    fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    }).catch(() => {})
  }

  const handlePhotoChange = (id, src) => {
    syncMemories(memories.map((m) => (m.id === id ? { ...m, src } : m)))
  }

  const handleCaptionChange = (id, caption) => {
    syncMemories(memories.map((m) => (m.id === id ? { ...m, caption } : m)))
  }

  const addMemory = () => {
    const id = `m${Date.now()}`
    syncMemories([...memories, { id, caption: 'New memory', src: null }])
  }

  const removeMemory = async (id) => {
    const memory = memories.find((m) => m.id === id)
    if (memory?.src) {
      try {
        const res = await fetch('/api/memories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: memory.src }),
        })
        if (res.ok) {
          setMemories(await res.json())
          return
        }
      } catch {
        // fall through to local-only removal
      }
    }
    syncMemories(memories.filter((m) => m.id !== id))
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
              onPhotoChange={handlePhotoChange}
              onCaptionChange={handleCaptionChange}
              onRemove={removeMemory}
            />
          ))}
          <button className="add-photo-card" onClick={addMemory}>
            <span className="add-photo-icon">+</span>
            <span>Add Photo</span>
          </button>
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
