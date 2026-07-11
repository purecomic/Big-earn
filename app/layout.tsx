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
              autoDisplay: true,
              includedLanguages: 'es,pt,fr,ar,zh-CN,ru,th,hi,bn,ur,tr,de,it,ja,ko,nl,pl,vi,id,ms,sw,ha,yo,ig,am,so,tl,uk,ro,fa,el',
              layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
          }
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
