#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
import os

# Create a proper client component for the language picker
lang_picker = """'use client'

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
"""

os.makedirs('components', exist_ok=True)
with open('components/LanguagePicker.tsx', 'w') as f:
    f.write(lang_picker)
print("LanguagePicker component created")

# Now fix layout.tsx - remove the broken inline UI and add the component
layout = open('app/layout.tsx').read()

# Remove the broken inline language picker block
broken_block = """      {/* Custom Language Picker */}
      <div style={{ position: 'fixed', bottom: 82, left: 12, zIndex: 200 }}>
        <button
          onClick={() => { const p = document.getElementById('lang-picker'); if(p) p.style.display = p.style.display === 'none' ? 'block' : 'none'; }}
          style={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(245,200,66,0.4)', borderRadius: 10, padding: '8px 14px', color: '#f5c842', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
        >
          🌐 <span style={{ fontWeight: 600 }}>Language</span>
        </button>
        <div id="lang-picker" style={{ display: 'none', position: 'absolute', bottom: '100%', left: 0, marginBottom: 8, background: '#0a0f1e', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 14, padding: '8px', width: 220, maxHeight: 320, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', padding: '4px 8px 8px', letterSpacing: '0.08em' }}>SELECT LANGUAGE</div>
          {[
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
          ].map(([code, label]) => (
            <button
              key={code}
              onClick={() => { const s = document.querySelector('.goog-te-combo') as HTMLSelectElement; if(s){ s.value=code; s.dispatchEvent(new Event('change')); } const p = document.getElementById('lang-picker'); if(p) p.style.display='none'; }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: 'none', border: 'none', color: '#e8eaf0', fontSize: '0.85rem', cursor: 'pointer', borderRadius: 8 }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(245,200,66,0.1)')}
              onMouseOut={e => (e.currentTarget.style.background = 'none')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      </body>"""

if broken_block in layout:
    layout = layout.replace(broken_block, "      <LanguagePicker />\n      </body>")
    print("Replaced broken block with component")
else:
    # Try simpler replacement
    layout = layout.replace(
        "      {/* Custom Language Picker */}",
        "      {/* Language Picker moved to component */}"
    )
    # Just add the component before </body>
    layout = layout.replace("      </body>", "      <LanguagePicker />\n      </body>")
    print("Added LanguagePicker component to layout")

# Add import at top of layout
if "import LanguagePicker" not in layout:
    layout = layout.replace(
        "import { AuthProvider } from '@/lib/auth-context'",
        "import { AuthProvider } from '@/lib/auth-context'\nimport LanguagePicker from '@/components/LanguagePicker'"
    )
    print("Added LanguagePicker import")

with open('app/layout.tsx', 'w') as f:
    f.write(layout)
print("Layout updated")
PYEOF

git add . && git commit -m "fix language picker as proper client component" && git push
echo "Done!"
