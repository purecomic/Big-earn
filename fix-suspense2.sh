#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'app/auth/signup/page.tsx'
content = open(path).read()

# Fix the import - make sure Suspense is imported from react
if "import { useState, Suspense } from 'react'" not in content:
    content = content.replace(
        "import { useState } from 'react'",
        "import { useState, Suspense } from 'react'"
    )
    # If that didn't work, try other variations
    if "import { useState, Suspense } from 'react'" not in content:
        # Add import at very top after 'use client'
        content = content.replace(
            "'use client'\n",
            "'use client'\nimport { Suspense } from 'react'\n"
        )

open(path, 'w').write(content)
print("Fixed Suspense import")
print("First 5 lines:")
print('\n'.join(content.split('\n')[:5]))
PYEOF

git add . && git commit -m "fix Suspense import in signup page" && git push
echo "Done!"
