# 🚀 Pre-Deployment Checklist

Use this checklist before deploying to Vercel.

## ✅ Code Preparation

- [ ] All code is committed to GitHub
- [ ] `.env.local` is NOT committed (check `.gitignore`)
- [ ] No console.log statements in production code (or use proper logging)
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Build succeeds locally (`npm run build`)

## ✅ Environment Variables

- [ ] All Firebase credentials ready
- [ ] Mux API credentials ready
- [ ] Environment variables documented in `.env.example`
- [ ] Know which variables are public (`NEXT_PUBLIC_*`)

## ✅ Firebase Configuration

- [ ] Firestore database created
- [ ] Firestore security rules configured
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Firebase Storage configured
- [ ] Authorized domains will be updated after deployment

## ✅ Vercel Setup

- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Environment variables added to Vercel project
- [ ] Build settings verified (Next.js auto-detected)

## ✅ Testing

- [ ] App runs locally without errors
- [ ] Authentication works (signup/login)
- [ ] Event creation works
- [ ] Video upload works (Mux)
- [ ] Ticket purchasing works
- [ ] Dashboard displays correctly
- [ ] Mobile responsive design verified

## ✅ Post-Deployment

- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] Firebase authorized domains updated
- [ ] Test all critical flows on production
- [ ] Check for console errors in production
- [ ] Verify analytics (if configured)

## 🔧 Quick Commands

```bash
# Test build locally
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint

# Test production build locally
npm run build && npm run start
```

## 📝 Notes

- First deployment may take 3-5 minutes
- Preview deployments are created for all branches
- Production deploys only from main/master branch
- Environment variables can be updated in Vercel dashboard

---

**Ready to deploy?** Follow the steps in [DEPLOYMENT.md](./DEPLOYMENT.md)
