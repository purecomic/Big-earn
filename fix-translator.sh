#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'app/layout.tsx'
content = open(path).read()

# Remove old translate code and replace with better version
# Remove the style block
content = content.replace(
    """        <style>{`
          /* Hide Google Translate top banner */
          .goog-te-banner-frame { display: none !important; }
          body { top: 0 !important; }
          .goog-te-gadget { font-family: var(--font-body) !important; }
          .goog-te-gadget-simple {
            background: rgba(245,200,66,0.1) !important;
            border: 1px solid rgba(245,200,66,0.3) !important;
            border-radius: 8px !important;
            padding: 4px 10px !important;
            cursor: pointer !important;
          }
          .goog-te-gadget-simple span { color: #f5c842 !important; }
          .goog-te-gadget-simple .goog-te-menu-value span { color: #f5c842 !important; }
          #google_translate_element { display: inline-block; }
        `}</style>""",
    """        <style>{`
          .goog-te-banner-frame { display: none !important; }
          .goog-te-ftab-float { display: none !important; }
          body { top: 0 !important; position: static !important; }
          .skiptranslate { display: none !important; }
        `}</style>"""
)

# Remove old translate element div and scripts, replace with better ones
old_translate_block = """        <div id="google_translate_element" style={{ position: 'fixed', bottom: 86, left: 16, zIndex: 99 }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  autoDisplay: false,
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            `
          }}
        />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />"""

new_translate_block = """        <div id="google_translate_element" style={{ display: 'none' }} />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
        <script dangerouslySetInnerHTML={{ __html: `
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

if old_translate_block in content:
    content = content.replace(old_translate_block, new_translate_block)
    print("Replaced translate block")
else:
    print("Could not find old translate block")

# Add custom language picker UI before closing body
content = content.replace(
    "      </body>",
    """      {/* Custom Language Picker */}
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
)
print("Added custom language picker UI")

open(path, 'w').write(content)
print("Done!")
PYEOF

git add . && git commit -m "replace Google Translate widget with custom language picker" && git push
echo "Done!"
