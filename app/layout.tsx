import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import LanguagePicker from '@/components/LanguagePicker'

export const metadata: Metadata = {
  title: 'BIG EARN — Invest & Grow',
  description: 'The premier crypto investment platform. Earn big, earn smart.',
  manifest: '/manifest.json',

}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style>{`
          .goog-te-banner-frame { display: none !important; }
          .goog-te-ftab-float { display: none !important; }
          body { top: 0 !important; position: static !important; }
          .skiptranslate { display: none !important; }
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <div id="google_translate_element" style={{ display: 'none' }} />
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
        `}} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/6a212f3e5c37391c2e9a3190/default';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `
          }}
        />
      <LanguagePicker />
      </body>
    </html>
  )
}
