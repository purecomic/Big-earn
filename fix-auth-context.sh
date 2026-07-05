#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'lib/auth-context.tsx'
content = open(path).read()

# Fix the referrerId issue - remove any referral related code
import re

# Find and fix the insert that has referrerId
old = """      await supabase.from('profiles').insert({
        id: userId,
        email,
        full_name: name,
        balance: 0,
        referred_by: referrerId,
        total_invested: 0,
        total_withdrawn: 0,
        is_admin: email === ADMIN_EMAIL,
      })"""

new = """      await supabase.from('profiles').insert({
        id: userId,
        email,
        full_name: name,
        balance: 0,
        total_invested: 0,
        total_withdrawn: 0,
        is_admin: email === ADMIN_EMAIL,
      })"""

if old in content:
    content = content.replace(old, new)
    print("Fixed referrerId in insert")
else:
    # Try broader fix - remove any line with referrerId
    lines = content.split('\n')
    new_lines = [l for l in lines if 'referrerId' not in l and 'referrer_id' not in l and 'referred_by: referrer' not in l]
    content = '\n'.join(new_lines)
    print(f"Removed referrerId lines, removed {len(lines) - len(new_lines)} lines")

open(path, 'w').write(content)
print("auth-context fixed")
PYEOF

git add . && git commit -m "fix referrerId error in auth-context" && git push
echo "Done!"
