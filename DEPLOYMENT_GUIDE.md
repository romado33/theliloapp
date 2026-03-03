# 🏠 Lilo - Live Local

**Discover and book unique family-friendly experiences in Ottawa**

[![CI/CD](https://github.com/romado33/theliloapp/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/romado33/theliloapp/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)

---

## ✨ Features

### For Guests
- 🔍 **Smart Search** - AI-powered semantic search with OpenAI embeddings
- 📅 **Easy Booking** - Browse availability and book experiences
- ⭐ **Reviews & Ratings** - Read and write reviews
- 💬 **Messaging** - Chat with hosts
- 📱 **PWA Support** - Install as a mobile app
- 🔔 **Notifications** - Real-time booking updates

### For Hosts
- 📝 **Experience Management** - Create and manage experiences
- 📊 **Analytics Dashboard** - Track bookings and revenue
- 💼 **Availability Calendar** - Manage your schedule
- 💬 **Guest Communication** - Message guests
- 📈 **Revenue Tracking** - Monitor earnings

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TanStack Query** - Data fetching & caching
- **React Router** - Navigation
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Edge Functions

### AI/ML
- **OpenAI** - Semantic search & embeddings
- **GPT-4o-mini** - Query understanding
- **text-embedding-3-small** - Vector embeddings

### Testing
- **Vitest** - Unit & integration tests
- **Playwright** - E2E tests
- **Testing Library** - React component testing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Supabase** account (free tier available)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/romado33/theliloapp.git
   cd theliloapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL="your-project-url"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

---

## 🔧 Environment Setup

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | `eyJhbGc...` |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | `xxxxx` |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_DEV_BYPASS_PASSWORD` | Dev mode bypass password (dev only) |
| `VITE_MAPBOX_TOKEN` | Mapbox API token for maps |
| `VITE_ENABLE_ANALYTICS` | Enable analytics (true/false) |

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings → API
3. Copy your Project URL and anon/public key
4. Paste them into your `.env.local` file

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:8080)
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:run         # Run tests once
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

### Project Structure

```
theliloapp/
├── .github/
│   └── workflows/       # GitHub Actions CI/CD
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # Shadcn UI components
│   │   └── ...          # Feature components
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External services
│   │   └── supabase/    # Supabase client & types
│   ├── lib/             # Utilities & helpers
│   ├── pages/           # Route pages
│   ├── test/            # Test utilities
│   └── types/           # TypeScript types
├── supabase/
│   ├── functions/       # Edge Functions
│   └── migrations/      # Database migrations
└── e2e/                 # Playwright E2E tests
```

### Development Guidelines

1. **TypeScript** - All code must be typed
2. **ESLint** - Follow linting rules
3. **Components** - Use Shadcn UI components
4. **Hooks** - Extract logic into custom hooks
5. **Accessibility** - Add ARIA labels and keyboard support
6. **Testing** - Write tests for new features

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

Unit tests are located in `src/**/__tests__/` directories.

### Integration Tests

Integration tests verify feature workflows (booking, search, messaging).

### E2E Tests

```bash
npm run test:e2e
```

E2E tests use Playwright to test complete user journeys.

### Test Coverage

```bash
npm run test:coverage
```

Aim for >80% coverage on critical paths.

---

## 🚀 Deployment

### Automated Deployment

The app uses GitHub Actions for CI/CD:

- **Develop branch** → Staging environment
- **Main branch** → Production environment

### Manual Deployment

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder** to your hosting provider:
   - Vercel
   - Netlify
   - Cloudflare Pages
   - AWS S3 + CloudFront

### Environment Variables in Production

Make sure to set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

**⚠️ NEVER commit `.env.production` to git!**

---

## 🔒 Security

### Security Features

✅ **Hardened Authentication**
- Supabase Auth with email/password
- Google & Apple OAuth
- Email verification required
- Secure session management

✅ **Row Level Security (RLS)**
- All database tables protected
- User-specific data isolation
- Host-only actions enforced

✅ **Input Validation**
- Zod schemas for all inputs
- XSS protection with DOMPurify
- SQL injection prevention (Supabase)

✅ **Security Headers**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

✅ **API Security**
- Rate limiting on Edge Functions
- CORS properly configured
- No exposed secrets in code

### Reporting Security Issues

Please report security vulnerabilities to: security@liloapp.com

Do not create public GitHub issues for security vulnerabilities.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Review Process

- All PRs require passing CI/CD checks
- At least one approval from maintainers
- Code must pass linting and tests
- Documentation must be updated

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Email**: support@liloapp.com
- **Documentation**: [docs.liloapp.com](https://docs.liloapp.com)
- **Issues**: [GitHub Issues](https://github.com/romado33/theliloapp/issues)

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI Components from [Shadcn UI](https://ui.shadcn.com)
- Backend powered by [Supabase](https://supabase.com)
- AI features by [OpenAI](https://openai.com)

---

**Made with ❤️ in Ottawa, Canada** 🍁
