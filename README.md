# 🎉 Moja Events

**Moja Events** is a modern, TikTok-style event discovery and ticketing platform built with Next.js, Firebase, and Mux.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.8.0-orange?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

---

## ✨ Features

- 🎬 **TikTok-style vertical video feed** for event discovery
- 🎫 **Digital ticketing system** with QR codes
- 📱 **Mobile-first responsive design**
- 🔐 **Firebase authentication** (Email/Password)
- 🎥 **Mux video streaming** for event teasers
- 📊 **Organizer dashboard** with analytics
- 💳 **Ticket purchasing** (mock checkout ready for payment integration)
- 🎨 **Modern glassmorphic UI** with dark mode

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project
- Mux account (for video streaming)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd web-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Mux credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (Mux upload)
│   ├── auth/              # Authentication pages
│   ├── create/            # Event creation
│   ├── dashboard/         # Organizer dashboard
│   ├── events/[id]/       # Event details
│   ├── tickets/           # User tickets
│   └── page.tsx           # Home feed
├── components/            # React components
├── context/               # React context (Auth)
├── lib/                   # Utilities (Firebase config)
└── app/globals.css        # Global styles
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Mux
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

### Firebase Setup

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration instructions.

---

## 🌐 Deployment

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

**Quick deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/moja-events)

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Storage:** Firebase Storage
- **Video:** Mux Video Streaming
- **Deployment:** Vercel

---

## 📱 Key Pages

- **`/`** - Event discovery feed (TikTok-style)
- **`/auth/login`** - User login
- **`/auth/signup`** - User registration
- **`/create`** - Create new event (organizers)
- **`/events/[id]`** - Event details and ticket purchase
- **`/tickets`** - User's purchased tickets
- **`/dashboard`** - Organizer dashboard

---

## 🎨 Design System

**Colors:**
- Primary: `#C6B7E2` (Lavender)
- Background: `#0F0F12` (Dark)
- Surface: `#18181D`
- Muted Grey: `#B3B3B8`

**Font:** Inter (Google Fonts)

---

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 🔐 Security

- Firebase Authentication for user management
- Firestore security rules for data protection
- Environment variables for sensitive data
- HTTPS enforced in production

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Mux](https://mux.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase setup help

---

**Built with ❤️ for the event community**

