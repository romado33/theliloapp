# 🧪 Development & Testing Guide

## Mock Data Strategy

Mock data is **available and enabled** for development and testing. Here's how it works:

### When Mock Data is Used

Mock data is automatically used in these scenarios:

1. **Development Mode** (`npm run dev`)
   - When database is unavailable
   - When experience ID not found in database
   - As fallback for testing

2. **Production Mode**
   - Mock data is **never used**
   - Only real database data is shown

### How It Works

```typescript
// In ExperienceDetails.tsx
if (import.meta.env.DEV) {
  // Try mock data if database fails
  const mockExperience = MOCK_EXPERIENCES[id];
  if (mockExperience) {
    setExperience(mockExperience);
    // Shows toast: "Development Mode - Using mock data"
  }
}
```

### Mock Data Files

- **`src/lib/experienceMockData.ts`** - Mock experiences, images, categories
- **`src/lib/mockData.ts`** - Additional mock data utilities
- **`src/lib/mockDataUtils.ts`** - Helper functions for mock data

### Available Mock Experiences

Check `src/lib/experienceMockData.ts` for the full list. Examples:
- Farm experiences
- Cooking classes
- Pottery workshops
- Wine tastings
- And more...

---

## 🛠️ Development Tools

### Browser Console Commands

When running in development mode, these commands are available:

```javascript
// View all mock experiences
window.MOCK_EXPERIENCES

// Seed/view mock data
window.seedMockData()

// Configure mock data behavior
window.DEV_MOCK_CONFIG.enableMockFallback = true
window.DEV_MOCK_CONFIG.showMockIndicator = true
```

### Dev Bypass (Quick Login)

For quick testing without auth:

1. Start dev server: `npm run dev`
2. Go to `/auth` page
3. Click "Dev Bypass" button (only visible in dev mode)
4. Enter password from `.env.local` → `VITE_DEV_BYPASS_PASSWORD`
5. Choose role: User or Host

**Security:** Dev bypass only works when:
- `import.meta.env.MODE === 'development'`
- Not on lovable.app or vercel.app domains
- Password matches environment variable

---

## 🧪 Testing Strategies

### Unit Testing

```bash
npm test                 # Watch mode
npm run test:run         # Run once
npm run test:coverage    # With coverage
npm run test:ui          # With UI
```

**Using Mock Data in Tests:**

```typescript
import { MOCK_EXPERIENCES } from '@/lib/experienceMockData';
import { getMockExperience } from '@/lib/mockDataUtils';

test('displays experience details', () => {
  const mockExp = getMockExperience('some-id');
  // Test with mock data
});
```

### E2E Testing

```bash
npm run test:e2e         # Run Playwright tests
npm run test:e2e:ui      # With UI
```

**Note:** E2E tests should use real database data when possible, mock data for fallback.

---

## 🎨 Mock Data vs Real Data

### When to Use Mock Data

✅ **Use Mock Data For:**
- Local development without database
- UI/UX testing and design
- Component storybooks
- Quick prototyping
- Offline development
- Demo purposes

❌ **Don't Use Mock Data For:**
- Production builds
- Integration testing (use test database)
- Performance testing
- User acceptance testing
- Production deployments

### Switching Between Mock and Real Data

**Option 1: Environment Variables**
```env
# .env.local
VITE_USE_MOCK_DATA=true  # Force mock data (optional)
```

**Option 2: Configuration**
```typescript
// src/lib/mockDataUtils.ts
export const DEV_MOCK_CONFIG = {
  enableMockFallback: true,  // Set to false to disable
  showMockIndicator: true,
  logMockUsage: true,
};
```

**Option 3: Code**
```typescript
// In your component
if (import.meta.env.DEV && useMockData) {
  const data = getMockExperience(id);
} else {
  const { data } = await supabase.from('experiences').select();
}
```

---

## 🗃️ Database Testing

### Using Test Database

For integration testing, use a separate Supabase project:

1. **Create test project** on Supabase
2. **Create `.env.test`**:
   ```env
   VITE_SUPABASE_URL="https://test-project.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="test-key"
   ```
3. **Run tests**:
   ```bash
   NODE_ENV=test npm run test:e2e
   ```

### Seeding Test Data

Create a seed script:

```typescript
// scripts/seed-test-data.ts
import { supabase } from './supabase';
import { MOCK_EXPERIENCES } from '../src/lib/experienceMockData';

async function seedDatabase() {
  // Clear existing data
  await supabase.from('experiences').delete().neq('id', '00000000');
  
  // Insert mock data
  for (const exp of Object.values(MOCK_EXPERIENCES)) {
    await supabase.from('experiences').insert(exp);
  }
}
```

Run with: `npx tsx scripts/seed-test-data.ts`

---

## 🖼️ Mock Images

Mock images are included in the project:

```typescript
// From experienceMockData.ts
export const GALLERY_IMAGES = {
  'hero-image': '/lovable-uploads/hero-image.jpg',
  'pottery-class': '/lovable-uploads/pottery-class.jpg',
  'cooking-class': '/lovable-uploads/cooking-class.jpg',
  // ... more images
};
```

These images are:
- Located in `public/lovable-uploads/`
- Referenced in mock experiences
- Available in development and production

---

## 🔄 Development Workflow

### Typical Development Flow

1. **Start dev server**
   ```bash
   npm run dev
   ```

2. **Choose data source:**
   - Real data: Make sure `.env.local` has valid Supabase credentials
   - Mock data: Database will fallback to mock if unavailable

3. **Develop feature**
   - Use real API when possible
   - Mock data as fallback

4. **Write tests**
   - Use mock data in unit tests
   - Use test database for integration tests

5. **Build for production**
   ```bash
   npm run build
   ```
   - Mock data code is included but never executed
   - Tree-shaking removes unused mock code

---

## 🐛 Debugging

### Mock Data Not Showing?

Check these:

1. **Console logs:**
   ```javascript
   console.log('Mock fallback enabled?', window.DEV_MOCK_CONFIG.enableMockFallback);
   console.log('Available mocks:', Object.keys(window.MOCK_EXPERIENCES));
   ```

2. **Environment:**
   ```javascript
   console.log('Dev mode?', import.meta.env.DEV);
   console.log('Mode:', import.meta.env.MODE);
   ```

3. **Database connection:**
   - If database is reachable, it will be used instead of mock
   - Disconnect from internet to force mock fallback

### Visual Indicators

When mock data is used in development:
- 🟡 Toast notification: "Development Mode - Using mock data"
- Console log: "Using mock experience data for development: {id}"

---

## 📝 Adding New Mock Data

### Add New Mock Experience

Edit `src/lib/experienceMockData.ts`:

```typescript
export const MOCK_EXPERIENCES: Record<string, MockExperience> = {
  // ... existing mocks
  
  'my-new-experience-id': {
    id: 'my-new-experience-id',
    title: 'My New Experience',
    description: 'Description here...',
    location: 'Ottawa, ON',
    price: 50,
    duration_hours: 2,
    max_guests: 10,
    image_urls: [GALLERY_IMAGES['hero-image']],
    category_id: 'food-drink',
    host_id: 'mock-host-id',
    categories: { name: 'Food & Drink' },
    profiles: {
      first_name: 'Mock',
      last_name: 'Host',
    },
    is_active: true,
    created_at: new Date().toISOString(),
  },
};
```

### Add New Mock Image

1. **Place image** in `public/lovable-uploads/my-image.jpg`
2. **Add to gallery**:
   ```typescript
   export const GALLERY_IMAGES = {
     'my-image': '/lovable-uploads/my-image.jpg',
     // ... other images
   };
   ```
3. **Use in mock experience**:
   ```typescript
   image_urls: [GALLERY_IMAGES['my-image']]
   ```

---

## 🎯 Best Practices

### Do's ✅

- ✅ Use mock data for UI development
- ✅ Keep mock data realistic and representative
- ✅ Update mock data when schema changes
- ✅ Test with both mock and real data
- ✅ Use conditional logic for mock fallback

### Don'ts ❌

- ❌ Don't ship mock data in production API calls
- ❌ Don't rely solely on mock data for testing
- ❌ Don't forget to update mock data when schema changes
- ❌ Don't use mock data for performance testing
- ❌ Don't expose mock data toggle in production UI

---

## 🚀 Production Considerations

### Build Output

When you run `npm run build`:

- Mock data code is **included** in bundle
- Mock data is **never executed** (protected by `import.meta.env.DEV`)
- Tree-shaking may remove some unused mock code
- No performance impact in production

### Size Impact

Mock data adds approximately:
- ~50 KB to bundle (uncompressed)
- ~10 KB gzipped
- Negligible performance impact

To completely remove from production:
```typescript
// Use this pattern
const MOCK_EXPERIENCES = import.meta.env.DEV ? {
  // mock data here
} : {};
```

---

## 📚 Related Documentation

- **Mock Data Implementation:** `src/lib/experienceMockData.ts`
- **Mock Utilities:** `src/lib/mockDataUtils.ts`
- **Testing Guide:** `TESTING_GUIDE.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`

---

**Questions?** Check the code comments or create an issue on GitHub.
