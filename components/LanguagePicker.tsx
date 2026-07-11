'use client'

import { useState, useEffect } from 'react'

const LANGUAGES = [
  ['en', '🇬🇧 English'],
  ['es', '🇪🇸 Spanish'],
  ['pt', '🇧🇷 Portuguese'],
  ['fr', '🇫🇷 French'],
  ['ar', '🇸🇦 Arabic'],
  ['zh-CN', '🇨🇳 Chinese'],
  ['ru', '🇷🇺 Russian'],
  ['th', '🇹🇭 Thai'],
  ['hi', '🇮🇳 Hindi'],
  ['tr', '🇹🇷 Turkish'],
  ['de', '🇩🇪 German'],
  ['it', '🇮🇹 Italian'],
  ['ja', '🇯🇵 Japanese'],
  ['ko', '🇰🇷 Korean'],
  ['nl', '🇳🇱 Dutch'],
  ['pl', '🇵🇱 Polish'],
  ['vi', '🇻🇳 Vietnamese'],
  ['id', '🇮🇩 Indonesian'],
  ['ms', '🇲🇾 Malay'],
  ['sw', '🇰🇪 Swahili'],
  ['ha', '🇳🇬 Hausa'],
  ['yo', '🇳🇬 Yoruba'],
  ['ig', '🇳🇬 Igbo'],
  ['ur', '🇵🇰 Urdu'],
  ['bn', '🇧🇩 Bengali'],
  ['fa', '🇮🇷 Persian'],
  ['uk', '🇺🇦 Ukrainian'],
  ['ro', '🇷🇴 Romanian'],
  ['el', '🇬🇷 Greek'],
  ['tl', '🇵🇭 Filipino'],
  ['sw', '🇹🇿 Swahili'],
  ['am', '🇪🇹 Amharic'],
  ['so', '🇸🇴 Somali'],
]

export default function LanguagePicker() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('🇬🇧 English')

  function translateTo(code: string, label: string) {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
    if (select) {
      select.value = code
      select.dispatchEvent(new Event('change'))
    }
    setCurrent(label.slice(0, 20))
    setOpen(false)
  }

  return (
    <div style={{ position: 'fixed', bottom: 82, left: 12, zIndex: 200 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(10,15,30,0.95)',
          border: '1px solid rgba(245,200,66,0.4)',
          borderRadius: 10, padding: '8px 14px',
          color: '#f5c842', fontSize: '0.78rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)'
        }}
      >
        🌐 <span style={{ fontWeight: 600, maxWidth: 80, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{current}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: -1 }}
          />
          <div style={{
            position: 'absolute', bottom: '110%', left: 0,
            background: '#0a0f1e',
            border: '1px solid rgba(245,200,66,0.25)',
            borderRadius: 14, padding: '8px',
            width: 200, maxHeight: 300,
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            zIndex: 300
          }}>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', padding: '4px 8px 8px', letterSpacing: '0.08em' }}>
              SELECT LANGUAGE
            </div>
            {LANGUAGES.map(([code, label]) => (
              <button
                key={code + label}
                onClick={() => translateTo(code, label)}
                style={{
                  display: 'block', width: '100%',
                  textAlign: 'left', padding: '9px 12px',
                  background: 'none', border: 'none',
                  color: '#e8eaf0', fontSize: '0.85rem',
                  cursor: 'pointer', borderRadius: 8,
                  transition: 'background 0.15s'
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(245,200,66,0.1)')}
                onMouseOut={e => (e.currentTarget.style.background = 'none')}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
