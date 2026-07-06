#!/bin/bash
cd ~/bigearn-app/bigearn

python3 << 'PYEOF'
path = 'app/dashboard/layout.tsx'
content = open(path).read()

# Add DELETE listener to the realtime subscription
old_subscription = """      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        const n = payload.new as Notification
        // Only add if it's for this user or broadcast
        if (n.user_id === user.id || n.is_broadcast) {
          setNotifications(prev => [n, ...prev])
        }
      })"""

new_subscription = """      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        const n = payload.new as Notification
        if (n.user_id === user.id || n.is_broadcast) {
          setNotifications(prev => [n, ...prev])
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
        setUnread(prev => Math.max(0, prev - 1))
      })"""

if old_subscription in content:
    content = content.replace(old_subscription, new_subscription)
    print("Added DELETE listener to realtime subscription")
else:
    print("Could not find subscription block, trying alternative...")
    # Try simpler approach - find the subscribe line and add before it
    content = content.replace(
        "      .subscribe()\n\n    channelRef.current = channel",
        """      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        setNotifications(prev => prev.filter(n => n.id !== (payload.old as any).id))
        setUnread(prev => Math.max(0, prev - 1))
      })
      .subscribe()

    channelRef.current = channel"""
    )
    print("Added DELETE listener (alternative method)")

open(path, 'w').write(content)
print("Done! Has DELETE listener:", 'event: \'DELETE\'' in open(path).read())
PYEOF

git add . && git commit -m "realtime delete notifications for online users" && git push
echo "Done!"
