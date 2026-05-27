# 🚀 BIG EARN — Complete Deployment Guide
## For Android (Termux) → Vercel + Supabase

---

## PART 1: SET UP TERMUX ON ANDROID

### Step 1 — Install Termux
1. Download **Termux** from F-Droid (NOT Google Play — the Play version is outdated)
   → https://f-droid.org/packages/com.termux/
2. Open Termux and run:
```
pkg update && pkg upgrade
```
Press `Y` when asked.

### Step 2 — Install required tools
```
pkg install nodejs git
```
Check versions work:
```
node --version
npm --version
git --version
```

---

## PART 2: SET UP SUPABASE (FREE)

### Step 1 — Create Supabase account
1. Go to https://supabase.com on your phone browser
2. Click "Start your project" → sign up with GitHub or email
3. Create a new project:
   - Name: `bigearn`
   - Password: choose a strong password (save it!)
   - Region: choose closest to you
4. Wait ~2 minutes for project to start

### Step 2 — Get your API keys
1. In your Supabase project, click **Settings** (gear icon) → **API**
2. Copy these two values (you'll need them soon):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 3 — Run the database schema
1. In Supabase, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase-schema.sql` from this project
4. Copy ALL its contents and paste into the SQL editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned"

### Step 4 — Create the admin account
1. In Supabase, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Email: `admin@bigearn.com`
4. Password: `masa234`
5. Click **Create user** and copy the UUID shown
6. Go back to **SQL Editor** and run:
```sql
UPDATE public.profiles SET is_admin = true WHERE email = 'admin@bigearn.com';
```

### Step 5 — Set up storage for payment proofs
1. In Supabase, click **Storage** in sidebar
2. Click **New bucket**
3. Name: `proofs`
4. Toggle **Public bucket** ON
5. Click **Save**

### Step 6 — Enable Realtime notifications
1. Go to **Database** → **Replication** in sidebar
2. Find the `notifications` table
3. Toggle it ON for realtime

---

## PART 3: SET UP THE PROJECT IN TERMUX

### Step 1 — Transfer project files
**Option A — If you have the zip file:**
```
pkg install unzip
unzip bigearn.zip -d ~/bigearn
cd ~/bigearn
```

**Option B — Create fresh (copy-paste files manually):**
```
mkdir ~/bigearn && cd ~/bigearn
```
Then create each file using `nano filename` and paste the content.

### Step 2 — Create environment file
```
cd ~/bigearn
nano .env.local
```
Paste these lines (replace with YOUR actual values from Step 2 above):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Press `Ctrl+X`, then `Y`, then `Enter` to save.

### Step 3 — Install dependencies
```
npm install
```
This takes 2–5 minutes. Wait for it to finish.

### Step 4 — Test locally (optional)
```
npm run dev
```
Open your Android browser and go to: `http://localhost:3000`
Press `Ctrl+C` to stop when done.

---

## PART 4: DEPLOY TO VERCEL

### Step 1 — Create GitHub account & repo
1. Go to https://github.com and create a free account
2. Create a **New repository**:
   - Name: `bigearn`
   - Private: recommended
   - Click **Create repository**

### Step 2 — Push code to GitHub (in Termux)
```
cd ~/bigearn
git init
git add .
git commit -m "Initial BIG EARN deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bigearn.git
git push -u origin main
```
Enter your GitHub username and password when asked.
(If using 2FA, create a Personal Access Token at GitHub → Settings → Developer settings → Tokens)

### Step 3 — Deploy on Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project**
3. Find and click **Import** next to your `bigearn` repo
4. Click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy**
6. Wait ~3 minutes for build to complete
7. Your site is live at `https://bigearn.vercel.app` (or similar)

---

## PART 5: USING YOUR SITE

### Admin Access
1. Go to your site and click **Login**
2. Sign in with: `admin@bigearn.com` / `masa234`
3. Open the sidebar (hamburger menu top-left)
4. Tap **ADMIN PANEL**
5. Enter password: `masa234`
6. You now have access to approve/reject transactions and send notifications

### Regular Users
1. Users sign up on `/auth/signup`
2. They deposit via the Deposit page (sends crypto to your wallet)
3. You approve deposits in the Admin Panel
4. Their balance updates and they can invest or withdraw

### Wallet Addresses
Update the wallet addresses in `app/dashboard/deposit/page.tsx`:
```
const WALLETS = [
  { name: 'Bitcoin (BTC)', address: 'YOUR_BITCOIN_ADDRESS', ... },
  { name: 'USDT (TRC20)', address: 'YOUR_USDT_ADDRESS', ... },
  { name: 'Ethereum (ETH)', address: 'YOUR_ETH_ADDRESS', ... },
]
```
After editing, push to GitHub and Vercel will auto-redeploy.

---

## TROUBLESHOOTING

**"Cannot find module" error:**
```
npm install
```

**Build fails on Vercel:**
- Check your environment variables are set correctly
- Make sure `.env.local` is NOT committed to GitHub

**Database errors:**
- Make sure you ran the full SQL schema
- Check Supabase → Logs for error details

**Admin panel says "Access denied":**
- Make sure you ran the SQL to set `is_admin = true` for admin account
- Sign out and sign back in

---

## UPDATING YOUR SITE

After making any code changes:
```
cd ~/bigearn
git add .
git commit -m "Update description"
git push
```
Vercel automatically rebuilds and redeploys. Done!
