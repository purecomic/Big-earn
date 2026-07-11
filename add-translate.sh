#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'app/layout.tsx'
content = open(path).read()

# Add Google Translate script and styles
old_head = "      <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n        <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossOrigin=\"anonymous\" />"

new_head = """      <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style>{`
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
        `}</style>"""

if old_head in content:
    content = content.replace(old_head, new_head)
    print("Added translate styles")

# Add translate script before closing body
old_body = """        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();"""

new_body = """        <div id="google_translate_element" style={{ position: 'fixed', bottom: 86, left: 16, zIndex: 99 }} />
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
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();"""

if old_body in content:
    content = content.replace(old_body, new_body)
    print("Added translate element and scripts")
else:
    # Try without Tawk.to
    content = content.replace(
        "      </body>",
        """      <div id="google_translate_element" style={{ position: 'fixed', bottom: 86, left: 16, zIndex: 99 }} />
        <script dangerouslySetInnerHTML={{ __html: `
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'en',
              autoDisplay: false,
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }
        ` }} />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
      </body>"""
    )
    print("Added translate (alternative method)")

open(path, 'w').write(content)
print("Done!")
PYEOF

git add . && git commit -m "add Google Translate widget for multi-language support" && git push
echo "Done!"
