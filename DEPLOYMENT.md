# 🚀 Deploying Moja Events to Vercel

This guide will walk you through deploying your Moja Events application to Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub repository with your code
- ✅ [Vercel account](https://vercel.com/signup) (free tier works)
- ✅ Firebase project fully configured
- ✅ Mux account with API credentials

---

## 🔧 Step 1: Prepare Your Repository

### 1.1 Ensure `.gitignore` is correct

Make sure these files are NOT committed to GitHub:

```bash
# Check if .env.local is ignored
git status
```

If `.env.local` appears, add it to `.gitignore`:

```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Update .gitignore"
git push
```

### 1.2 Commit all changes

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository:**
   - Click "Import" next to your repository
   - If not listed, click "Adjust GitHub App Permissions" to grant access

4. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

5. **Add Environment Variables:**
   
   Click "Environment Variables" and add these:

   ```bash
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD9eXwSKq_edLZ3VibE-Ow_9wJ4YtcUte8
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=moja-4ca11.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=moja-4ca11
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=moja-4ca11.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=897872936744
   NEXT_PUBLIC_FIREBASE_APP_ID=1:897872936744:web:aae0bcbb4b9bb9c9719a1d
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-7RB7D1F7B9

   # Mux Configuration
   MUX_TOKEN_ID=2917ddd7-e4f8-44df-af8c-b6f136a885c7
   MUX_TOKEN_SECRET=Ik0blBTGDk364anFgx8BHkh69kwnvOJI7SFT5lURcdBdQckXYBXhCm9iBtEBTIsPqIL9XIv4b5+
   ```

   **Important:** Make sure to select "Production", "Preview", and "Development" for all variables.

6. **Click "Deploy"**

   Vercel will:
   - Install dependencies
   - Build your Next.js app
   - Deploy to a production URL

7. **Wait for deployment** (usually 2-3 minutes)

8. **Your app is live!** 🎉
   - You'll get a URL like: `https://your-project.vercel.app`

---

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts and add environment variables when asked.

---

## 🔐 Step 3: Update Firebase Configuration

After deployment, you need to update Firebase to allow your Vercel domain:

### 3.1 Update Firebase Auth Domain

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **moja-4ca11**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain: `your-project.vercel.app`
6. Click **"Add"**

### 3.2 Update Firestore Security Rules

If using production, update your Firestore rules for better security:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Events: Public read, authenticated write
    match /events/{eventId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.organizerId;
    }
    
    // Tickets: Users can only access their own tickets
    match /tickets/{ticketId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Users: Can read/write own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3.3 Update CORS for Mux (if needed)

In your Mux upload route (`src/app/api/mux/upload/route.ts`), update the CORS origin:

```typescript
cors_origin: 'https://your-project.vercel.app',
```

Or use wildcard for development:
```typescript
cors_origin: '*',
```

---

## 🔄 Step 4: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

### Main Branch (Production)
```bash
git add .
git commit -m "Update feature"
git push origin main
```
→ Deploys to production URL

### Preview Deployments
```bash
git checkout -b feature-branch
git add .
git commit -m "New feature"
git push origin feature-branch
```
→ Creates preview deployment with unique URL

---

## 🧪 Step 5: Test Your Deployment

After deployment, test these features:

- [ ] **Home page loads** with splash screen
- [ ] **Events feed** displays correctly
- [ ] **Video playback** works
- [ ] **User signup/login** works
- [ ] **Event creation** and video upload works
- [ ] **Ticket purchasing** works
- [ ] **Dashboard** shows correct data
- [ ] **Mobile responsiveness** works

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found`
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error:** `Environment variable not found`
- Check that all env vars are added in Vercel dashboard
- Make sure they're available for Production, Preview, and Development

### Firebase Connection Issues

**Error:** `Firebase: Error (auth/unauthorized-domain)`
- Add your Vercel domain to Firebase Authorized domains (Step 3.1)

**Error:** `Missing or insufficient permissions`
- Update Firestore security rules (Step 3.2)

### Mux Upload Issues

**Error:** `CORS error when uploading`
- Update `cors_origin` in Mux upload route (Step 3.3)

---

## 📊 Step 6: Monitor Your Deployment

### Vercel Analytics (Optional)

1. Go to your project in Vercel Dashboard
2. Click **"Analytics"** tab
3. Enable **Web Analytics** (free)
4. Monitor page views, performance, and errors

### View Logs

1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **"View Function Logs"** to see API route logs

---

## 🎨 Step 7: Custom Domain (Optional)

### Add Your Own Domain

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `mojaevents.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

---

## 🔒 Step 8: Production Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] Firebase security rules are production-ready
- [ ] Firestore indexes are created (if needed)
- [ ] Error tracking is set up (e.g., Sentry)
- [ ] Analytics are configured
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active (automatic with Vercel)
- [ ] Test all critical user flows
- [ ] Mobile testing completed

---

## 🚀 Quick Deploy Commands

```bash
# Check current deployment status
vercel ls

# View deployment logs
vercel logs

# Rollback to previous deployment
vercel rollback

# Remove deployment
vercel remove [deployment-url]
```

---

## 📚 Useful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Hosting with Vercel](https://firebase.google.com/docs/hosting)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎉 You're Live!

Your Moja Events app is now deployed and accessible worldwide!

**Share your app:**
- Production URL: `https://your-project.vercel.app`
- Custom domain: `https://yourdomain.com` (if configured)

---

## 💡 Pro Tips

1. **Use Preview Deployments** for testing before production
2. **Enable Vercel Analytics** to track performance
3. **Set up GitHub branch protection** to require reviews before merging
4. **Use Vercel's Edge Functions** for better performance
5. **Monitor Firebase usage** to avoid unexpected costs
6. **Set up error tracking** (Sentry, LogRocket, etc.)

---

Need help? Check the [Vercel Support](https://vercel.com/support) or [Firebase Support](https://firebase.google.com/support).
