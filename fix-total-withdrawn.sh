#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'app/dashboard/admin/page.tsx'
content = open(path).read()

# Fix approveTransaction to update total_withdrawn when withdrawal is approved
old_approve = """    if (tx.type === 'deposit') {
      const profile = users.find(u => u.id === tx.user_id)
      if (profile) await supabase.from('profiles').update({ balance: (profile.balance??0) + tx.amount }).eq('id', tx.user_id)
      await supabase.from('notifications').insert({ user_id: tx.user_id, title: '✅ Deposit Approved', message: `Your deposit of $${tx.amount} has been approved.`, type: 'success', is_broadcast: false, read: false })
    } else if (tx.type === 'withdrawal') {
      await supabase.from('notifications').insert({ user_id: tx.user_id, title: '✅ Withdrawal Approved', message: `Your withdrawal of $${tx.amount} is being processed.`, type: 'success', is_broadcast: false, read: false })
    }"""

new_approve = """    if (tx.type === 'deposit') {
      const profile = users.find(u => u.id === tx.user_id)
      if (profile) await supabase.from('profiles').update({ balance: (profile.balance??0) + tx.amount }).eq('id', tx.user_id)
      await supabase.from('notifications').insert({ user_id: tx.user_id, title: '✅ Deposit Approved', message: `Your deposit of $${tx.amount} has been approved.`, type: 'success', is_broadcast: false, read: false })
    } else if (tx.type === 'withdrawal') {
      const profile = users.find(u => u.id === tx.user_id)
      if (profile) {
        await supabase.from('profiles').update({
          total_withdrawn: (profile.total_withdrawn ?? 0) + tx.amount
        }).eq('id', tx.user_id)
      }
      await supabase.from('notifications').insert({ user_id: tx.user_id, title: '✅ Withdrawal Approved', message: `Your withdrawal of $${tx.amount} has been approved and is being processed.`, type: 'success', is_broadcast: false, read: false })
    }"""

if old_approve in content:
    content = content.replace(old_approve, new_approve)
    print("Fixed approveTransaction to update total_withdrawn")
else:
    print("Could not find exact match, trying alternative...")
    # Try to find and fix the withdrawal approval section
    if 'total_withdrawn' not in content:
        content = content.replace(
            "} else if (tx.type === 'withdrawal') {\n      await supabase.from('notifications').insert({ user_id: tx.user_id, title: '✅ Withdrawal Approved'",
            """} else if (tx.type === 'withdrawal') {
      const wProfile = users.find(u => u.id === tx.user_id)
      if (wProfile) {
        await supabase.from('profiles').update({ total_withdrawn: (wProfile.total_withdrawn ?? 0) + tx.amount }).eq('id', tx.user_id)
      }
      await supabase.from('notifications').insert({ user_id: tx.user_id, title: '✅ Withdrawal Approved'"""
        )
        print("Applied alternative fix")

open(path, 'w').write(content)
print("Done! Has total_withdrawn update:", 'total_withdrawn' in open(path).read())
PYEOF

git add . && git commit -m "fix: update total_withdrawn when withdrawal is approved" && git push
echo "Done!"
