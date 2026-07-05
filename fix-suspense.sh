#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
import os

# Fix signup page - wrap with Suspense
signup_path = 'app/auth/signup/page.tsx'
signup = open(signup_path).read()

# Check if useSearchParams is used
if 'useSearchParams' in signup:
    signup = signup.replace(
        "import { useState } from 'react'",
        "import { useState, Suspense } from 'react'"
    )
    # Wrap the default export content in Suspense
    signup = signup.replace(
        "export default function SignupPage()",
        "function SignupContent()"
    )
    # Add wrapper at end
    signup = signup.rstrip()
    signup += "\n\nexport default function SignupPage() {\n  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#050810'}} />}><SignupContent /></Suspense>\n}\n"
    open(signup_path, 'w').write(signup)
    print("Fixed signup page with Suspense")
else:
    print("useSearchParams not found in signup, checking other approach")

# Fix login page too just in case
login_path = 'app/auth/login/page.tsx'
login = open(login_path).read()

if 'useSearchParams' in login:
    login = login.replace(
        "import { useState } from 'react'",
        "import { useState, Suspense } from 'react'"
    )
    login = login.replace(
        "export default function LoginPage()",
        "function LoginContent()"
    )
    login = login.rstrip()
    login += "\n\nexport default function LoginPage() {\n  return <Suspense fallback={<div style={{minHeight:'100vh',background:'#050810'}} />}><LoginContent /></Suspense>\n}\n"
    open(login_path, 'w').write(login)
    print("Fixed login page with Suspense")

# Also fix the metadata themeColor warning in layout
layout_path = 'app/layout.tsx'
layout = open(layout_path).read()
layout = layout.replace(
    "  themeColor: '#050810',",
    ""
)
open(layout_path, 'w').write(layout)
print("Removed themeColor from metadata")
PYEOF

git add . && git commit -m "fix useSearchParams suspense boundary and themeColor warning" && git push
echo "Done!"
