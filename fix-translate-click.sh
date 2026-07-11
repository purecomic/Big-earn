#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
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
  ['am', '🇪🇹 Amharic'],
  ['so', '🇸🇴 Somali'],
]

export default function LanguagePicker() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('🇬🇧 English')

  function translateTo(code: string, label: string) {
    // Try multiple methods to trigger Google Translate
    const tryTranslate = () => {
      // Method 1: direct combo select
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement
      if (select) {
        select.value = code
        select.dispatchEvent(new Event('change'))
        setCurrent(label)
        setOpen(false)
        return true
      }

      // Method 2: use cookie method
      const setCookie = (name: string, value: string) => {
        document.cookie = name + '=' + value + '; path=/; domain=' + window.location.hostname
      }
      setCookie('googtrans', '/en/' + code)
      setCookie('googtrans', '/en/' + code)
      window.location.reload()
      return false
    }

    if (!tryTranslate()) {
      // Wait for Google Translate to load then try again
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (tryTranslate() || attempts > 20) {
          clearInterval(interval)
        }
      }, 300)
    }

    setCurrent(label)
    setOpen(false)
  }

  // Set cookie-based translation (most reliable method)
  function translateWithCookie(code: string, label: string) {
    if (code === 'en') {
      // Reset to English
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname
    } else {
      const cookieVal = '/en/' + code
      document.cookie = 'googtrans=' + cookieVal + '; path=/'
      document.cookie = 'googtrans=' + cookieVal + '; path=/; domain=.' + window.location.hostname
    }
    setCurrent(label)
    setOpen(false)
    window.location.reload()
  }

  return (
    <div style={{ position: 'fixed', bottom: 82, left: 12, zIndex: 200 }}>
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

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: -1 }} />
          <div style={{
            position: 'absolute', bottom: '110%', left: 0,
            background: '#0a0f1e',
            border: '1px solid rgba(245,200,66,0.25)',
            borderRadius: 14, padding: '8px',
            width: 210, maxHeight: 320,
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
                onClick={() => translateWithCookie(code, label)}
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

with open('components/LanguagePicker.tsx', 'w') as f:
    f.write(lang_picker)
print("LanguagePicker updated with cookie-based translation")

# Also update layout to include the googtrans cookie handling
layout = open('app/layout.tsx').read()

# Update the translate script to handle cookies
old_script = """        <script dangerouslySetInnerHTML={{ __html: `
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              autoDisplay: false,
              includedLanguages: 'es,pt,fr,ar,zh-CN,zh-TW,ru,th,hi,bn,ur,tr,de,it,ja,ko,nl,pl,vi,id,ms,sw,ha,yo,ig,am,so,tl,uk,ro,fa,he,el,cs,hu,sv,no,da,fi,sk,hr,bg,lt,lv,et,sl,sr,mk,sq,hy,ka,az,kk,uz,tk,ky,mn,si,ne,my,km,lo,bo,jw,su,ceb,hmn,mg,mt,cy,eu,gl,ca',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }

          function translateTo(lang) {
            var select = document.querySelector('.goog-te-combo');
            if (select) {
              select.value = lang;
              select.dispatchEvent(new Event('change'));
            }
            document.getElementById('lang-picker').style.display = 'none';
          }

          function toggleLangPicker() {
            var picker = document.getElementById('lang-picker');
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
          }

          window.translateTo = translateTo;
          window.toggleLangPicker = toggleLangPicker;
        `}} />"""

new_script = """        <script dangerouslySetInnerHTML={{ __html: `
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              autoDisplay: true,
              includedLanguages: 'es,pt,fr,ar,zh-CN,ru,th,hi,bn,ur,tr,de,it,ja,ko,nl,pl,vi,id,ms,sw,ha,yo,ig,am,so,tl,uk,ro,fa,el',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }
        `}} />"""

if old_script in layout:
    layout = layout.replace(old_script, new_script)
    print("Updated translate script")
else:
    print("Script not found, keeping as is")

with open('app/layout.tsx', 'w') as f:
    f.write(layout)
print("Done!")
PYEOF

git add . && git commit -m "fix language picker to use cookie method for reliable translation" && git push
echo "Done!"
