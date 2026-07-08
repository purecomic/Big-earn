#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'app/dashboard/layout.tsx'
content = open(path).read()

# Check what's there
print("Has setUnread:", 'setUnread' in content)
print("Has unread state:", "const [unread, setUnread]" in content)

# Add unread state if missing
if "const [unread, setUnread]" not in content:
    content = content.replace(
        "  const [notifOpen, setNotifOpen] = useState(false)",
        "  const [notifOpen, setNotifOpen] = useState(false)\n  const [unread, setUnread] = useState(0)"
    )
    print("Added unread state")

# Also make sure unreadCount uses unread
if 'unreadCount' in content and 'const unreadCount' not in content:
    content = content.replace(
        "  const unreadCount = notifications.filter(n => !n.read).length",
        "  const unreadCount = unread + notifications.filter(n => !n.read).length"
    )

open(path, 'w').write(content)
print("Fixed! Has setUnread now:", "const [unread, setUnread]" in open(path).read())
PYEOF

git add . && git commit -m "fix setUnread missing in dashboard layout" && git push
echo "Done!"
