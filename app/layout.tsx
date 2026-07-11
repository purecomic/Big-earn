import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

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
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <div id="google_translate_element" style={{ position: 'fixed', bottom: 86, left: 16, zIndex: 99 }} />
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
      </body>
    </html>
  )
}
