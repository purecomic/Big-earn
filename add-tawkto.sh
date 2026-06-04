#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PY'
layout = 'import type { Metadata } from \'next\'\nimport \'./globals.css\'\nimport { AuthProvider } from \'@/lib/auth-context\'\n\nexport const metadata: Metadata = {\n  title: \'BIG EARN — Invest & Grow\',\n  description: \'The premier crypto investment platform. Earn big, earn smart.\',\n  manifest: \'/manifest.json\',\n  themeColor: \'#050810\',\n}\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <head>\n        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />\n        <link rel="preconnect" href="https://fonts.googleapis.com" />\n        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />\n      </head>\n      <body>\n        <AuthProvider>\n          {children}\n        </AuthProvider>\n        <script\n          dangerouslySetInnerHTML={{\n            __html: `\n              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();\n              (function(){\n                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];\n                s1.async=true;\n                s1.src=\'https://embed.tawk.to/6a212f3e5c37391c2e9a3190/default\';\n                s1.charset=\'UTF-8\';\n                s1.setAttribute(\'crossorigin\',\'*\');\n                s0.parentNode.insertBefore(s1,s0);\n              })();\n            `\n          }}\n        />\n      </body>\n    </html>\n  )\n}\n'
open('app/layout.tsx','w').write(layout)
print("layout updated")
PY

git add . && git commit -m "add tawk.to live chat widget" && git push
echo "Done!"
