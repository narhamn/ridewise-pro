# Analisis Struktur Aplikasi Ridewise-Pro

**Tanggal:** 5 April 2026  
**Status:** Aplikasi Prototype dengan Dummy Data

---

## 📋 RINGKASAN EKSEKUTIF

**RideWise-Pro** adalah aplikasi shuttle booking online yang dibangun dengan:
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **State Management:** React Context API
- **Routing:** React Router v6
- **UI Framework:** Radix UI (via shadcn)
- **Data:** Mock/Dummy Data (tidak ada backend API)
- **Testing:** Vitest + Playwright

**Status Utama:**
- ✅ Frontend UI sangat lengkap dan well-designed
- ✅ Component library comprehensive (40+ UI components)
- ✅ Multi-role architecture (Customer, Driver, Admin)
- ❌ **KRITIS:** Tidak ada backend API real
- ❌ **KRITIS:** Semua data adalah dummy/mock data
- ❌ Minimal test coverage
- ❌ Tidak ada error handling robust
- ❌ Tidak ada persistence/database

---

## 🏗️ STRUKTUR APLIKASI

### 1. **Folder Organization**

```
ridewise-pro2/
├── src/
│   ├── App.tsx                 # Root component + routing
│   ├── components/             # Reusable UI components
│   │   ├── custom/             # Custom components (5)
│   │   └── ui/                 # shadcn/ui components (40+)
│   ├── contexts/               # React Context (2)
│   │   ├── ShuttleContext      # Main app state
│   │   └── NotificationContext # Notifications
│   ├── data/                   # Mock data
│   │   └── dummy.ts
│   ├── hooks/                  # Custom hooks
│   ├── layouts/                # Layout components (3 roles)
│   ├── pages/                  # Page components by role
│   │   ├── customer/           # 9 pages
│   │   ├── driver/             # ~4 pages
│   │   └── admin/              # 8 pages
│   ├── lib/                    # Utilities
│   └── test/                   # Test files
├── public/                     # Static assets
├── eslint.config.js            # Linting rules
├── vite.config.ts              # Build config
└── tsconfig.json               # TypeScript config
```

### 2. **Routing Structure**

```
/                                    # Index/Home
├── /customer
│   ├── /login                      # Login customer
│   ├── /home                       # Dashboard customer
│   ├── /route/:id                  # Detail rute
│   ├── /booking/new                # Booking baru
│   ├── /booking/:id                # Detail booking
│   ├── /history                    # Riwayat booking
│   ├── /tickets                    # E-ticket
│   ├── /profile                    # Profil
│   └── /ride-now                   # Ride on-demand
├── /driver
│   ├── /login                      # Login driver
│   ├── /dashboard                  # Dashboard driver
│   ├── /trips                      # Daftar trip
│   └── /tracking                   # Real-time tracking
└── /admin
    ├── /login                      # Login admin
    ├── /dashboard                  # Overview
    ├── /bookings                   # Manajemen booking
    ├── /drivers                    # Manajemen driver
    ├── /vehicles                   # Manajemen kendaraan
    ├── /routes                     # Manajemen rute
    ├── /tracking                   # Tracking real-time
    ├── /analytics                  # Analytics & reports
    ├── /reports                    # Report generation
    └── /payment-settings           # Konfigurasi pembayaran
```

### 3. **Type System**

**Core Types** (dalam `types/shuttle.ts`):
- `User`, `Driver`, `Vehicle`
- `Route`, `RoutePoint`, `Schedule`
- `Booking`, `TripDetail`, `SeatStatus`
- `Notification`, `RideRequest`
- `PaymentMethod`, `PaymentStatus`, `PaymentConfig`
- `RayonPricing` (untuk pricing by zone)

**Enum-like Constants:**
- `UserRole`: 'customer' | 'driver' | 'admin'
- `Status`: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled'

---

## 📊 DATA & STATE MANAGEMENT

### **ShuttleContext** (Main State)
```
├── currentUser: User | null
├── routes: Route[]            # 8 dummy routes
├── schedules: Schedule[]       # 7+ dummy schedules
├── drivers: Driver[]           # 5 dummy drivers
├── vehicles: Vehicle[]         # 5 dummy vehicles
├── bookings: Booking[]         # Dummy bookings
├── routePoints: RoutePoint[]   # 24 way points
├── rayonPricing: RayonPricing[]
├── rideRequests: RideRequest[]
└── setters & actions
```

**Mock Data Features:**
- Pricing per zone (Rayon A/B/C/D)
- Real coordinate data (Medan area)
- Booking status tracking
- Payment method support: bank_transfer, ewallet, qris

### **NotificationContext**
```
├── notifications: Notification[]
├── unreadCount(role): number
├── addNotification()
├── markAsRead()
└── markAllAsRead()
```

**Built-in Notifications:**
- Booking confirmations
- Payment status
- Trip assignments
- System alerts

---

## 🎨 UI/COMPONENT ARCHITECTURE

### **Custom Components** (5)
1. `ETicket.tsx` - E-ticket display
2. `NavLink.tsx` - Navigation link
3. `NotificationCenter.tsx` - Notification UI
4. `PaymentModal.tsx` - Payment gateway modal
5. `QRScanner.tsx` - QR code reader

### **UI Components** (40+ dari shadcn/ui)
Tersedia: Button, Card, Dialog, Form, Input, Select, Table, Tabs, Toast, Tooltip, Badge, Calendar, Chart, dll.

### **Layouts** (3 role-based)
- `AdminLayout.tsx` - Layout untuk admin
- `CustomerLayout.tsx` - Layout untuk customer
- `DriverLayout.tsx` - Layout untuk driver

---

## ❌ MASALAH KRITIS

### **1. Tidak Ada Backend API**
- **Impact:** Aplikasi hanya prototype/demo
- **Status:** Data hardcoded di dummy.ts
- **Masalah:**
  - Tidak ada persistence
  - Refresh halaman akan reset semua data
  - Tidak scalable

### **2. Dummy Authentication**
```typescript
// ShuttleContext.tsx
const login = (email: string, _password: string, role: UserRole) => {
  // Password diabaikan!
  // Tidak ada validasi
  // Semua role login tanpa checking
}
```

### **3. Tidak Ada Error Handling**
- Tidak ada try-catch blocks
- Tidak ada error boundaries
- Tidak ada fallback loading states
- Tidak ada null/undefined checks mendalam

### **4. State Management Limitations**
```typescript
// Setter diexpose langsung
setRoutes: React.Dispatch<React.SetStateAction<Route[]>>
```
- Props spreading memungkinkan mutations dari mana saja
- Tidak ada action dispatcher patterns
- Sulit untuk testing & debugging

### **5. Test Coverage Minimal**
- 1 file test kosong: `test/example.test.ts`
- 1 setup file: `test/setup.ts`
- **Total test:** 0 (tidak ada test cases)

### **6. Type Safety Gaps**
```typescript
// Weak type safety
const pt = (id, routeId, code, ...) // Tuple-like, bukan object
// Hard to read dan rentan error
```

### **7. Missing Features for Production**
- ❌ No logging system
- ❌ No error tracking (Sentry, etc)
- ❌ No analytics
- ❌ No performance monitoring
- ❌ No API request caching
- ❌ No offline support

### **8. Missing Security Features**
- ❌ No JWT/token validation
- ❌ No XSS protection
- ❌ No CSRF tokens
- ❌ Password hardcoded in dummy data
- ❌ No rate limiting
- ❌ No input validation

---

## 🎯 REKOMENDASI PENGEMBANGAN

### **Phase 1: Foundational (Weeks 1-2)**

#### 1.1 **Setup Backend API** (Paling Penting)
```
Platform Rekomendasi:
├── Node.js + Express (Lightweight)
│   └── Or Nest.js (Enterprise)
├── PostgreSQL + Supabase (Recommended)
│   └── Database untuk routes, schedules, bookings, users
├── Redis (Optional)
│   └── Untuk caching & sessions
└── JWT untuk authentication
```

**Struktur Backend:**
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── bookings.routes.ts
│   │   ├── drivers.routes.ts
│   │   ├── vehicles.routes.ts
│   │   ├── schedules.routes.ts
│   │   └── payments.routes.ts
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   └── validation.ts
│   ├── config/
│   └── app.ts
├── Dockerfile
└── .env.example
```

#### 1.2 **Setup React Query for API**
```typescript
// hooks/useBookings.ts
export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => fetch('/api/bookings').then(r => r.json()),
  });
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (booking: Booking) => 
      fetch('/api/bookings', { method: 'POST', body: JSON.stringify(booking) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
};
```

#### 1.3 **Refactor Context (Remove Dummy Data)**
```typescript
// Clean context API
interface ShuttleContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // Queries via React Query hooks
}
```

---

### **Phase 2: Core Features (Weeks 3-4)**

#### 2.1 **Implement Authentication**
```typescript
// services/auth.ts
export const authService = {
  login: async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { token, user } = await res.json();
    localStorage.setItem('token', token);
    return user;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
};
```

#### 2.2 **Add Error Boundaries**
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Di App.tsx
<ErrorBoundary>
  <Routes>...</Routes>
</ErrorBoundary>
```

#### 2.3 **Setup API Service Layer**
```typescript
// services/api.ts
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export const api = {
  get: (endpoint: string) => fetch(`${API_BASE}${endpoint}`),
  post: (endpoint: string, data: any) => 
    fetch(`${API_BASE}${endpoint}`, { 
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    }),
  // ... other methods
};
```

#### 2.4 **Input Validation dengan Zod**
```typescript
// schemas/booking.ts
import { z } from 'zod';

export const BookingSchema = z.object({
  userId: z.string().min(1),
  scheduleId: z.string().min(1),
  seatNumber: z.number().min(1),
  paymentMethod: z.enum(['bank_transfer', 'ewallet', 'qris']),
});

// Component
const { register, formState: { errors } } = useForm({
  resolver: zodResolver(BookingSchema),
});
```

---

### **Phase 3: Quality & Testing (Weeks 5-6)**

#### 3.1 **Add Unit Tests**
```typescript
// components/__tests__/BookingCard.test.ts
import { render, screen } from '@testing-library/react';
import BookingCard from '../BookingCard';

describe('BookingCard', () => {
  it('renders booking details', () => {
    render(<BookingCard booking={mockBooking} />);
    expect(screen.getByText('Hermes → Kualanamu')).toBeInTheDocument();
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<BookingCard booking={mockBooking} onCancel={onCancel} />);
    screen.getByText('Cancel').click();
    expect(onCancel).toHaveBeenCalled();
  });
});
```

#### 3.2 **Add Integration Tests**
```typescript
// test/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

test('customer should be able to book a shuttle', async ({ page }) => {
  await page.goto('http://localhost:5173/customer/home');
  await page.click('text=Hermes → Kualanamu');
  await page.click('text=Book Now');
  await page.fill('input[name=seat]', '5');
  await page.click('button:has-text("Confirm")');
  await expect(page).toHaveURL(/\/booking\/\d+/);
});
```

#### 3.3 **Setup Error Handling**
```typescript
// hooks/useApi.ts
export const useApi = (endpoint: string) => {
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      } catch (error) {
        toast.error(`Failed to fetch ${endpoint}`);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

---

### **Phase 4: Advanced Features (Weeks 7-8)**

#### 4.1 **Real-Time Updates (WebSocket)**
```typescript
// services/websocket.ts
export const setupWebsocketListener = () => {
  const socket = new WebSocket('ws://localhost:3000');
  
  socket.addEventListener('message', (event) => {
    const { type, data } = JSON.parse(event.data);
    
    if (type === 'booking-confirmed') {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
    if (type === 'driver-location-updated') {
      // Update driver location in real-time
    }
  });
  
  return socket;
};
```

#### 4.2 **Payment Gateway Integration**
```typescript
// services/payment.ts
export const paymentService = {
  initiateMidtrans: async (bookingId: string, amount: number) => {
    const res = await api.post('/payments/initiate', { bookingId, amount });
    const { token } = await res.json();
    // Snap.pay(token); // Midtrans SDK
  },
};
```

#### 4.3 **Analytics & Logging**
```typescript
// services/analytics.ts
import { Analytics } from '@/lib/analytics';

export const trackEvent = (event: string, data?: any) => {
  Analytics.track(event, {
    timestamp: new Date(),
    userId: currentUser?.id,
    ...data,
  });
};

// Usage
const handleBooking = async (booking: Booking) => {
  trackEvent('booking_created', { routeId: booking.routeId });
  // ...
};
```

#### 4.4 **Performance Optimization**
```typescript
// Code splitting
const CustomerHome = lazy(() => import('@/pages/customer/CustomerHome'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

// Suspense fallback
<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/" element={<CustomerHome />} />
  </Routes>
</Suspense>
```

---

### **Phase 5: DevOps & Deployment (Week 9)**

#### 5.1 **Environment Configuration**
```
.env.local
├── VITE_API_BASE=http://localhost:3000/api
├── VITE_APP_NAME=RideWise Pro
└── VITE_APP_VERSION=1.0.0

.env.production
├── VITE_API_BASE=https://api.ridewise.com
├── VITE_SENTRY_DSN=...
└── SENTRY_AUTH_TOKEN=...
```

#### 5.2 **Docker Setup**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### 5.3 **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm run build && npm run test
      - uses: vercel/action@master
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📋 CHECKLIST REKOMENDASI

### Must-Do (Critical)
- [ ] Build backend API (Node/Express/Nest)
- [ ] Setup PostgreSQL database
- [ ] Implement proper authentication (JWT)
- [ ] Remove dummy data, connect to real API
- [ ] Add error boundaries & error handling
- [ ] Setup input validation (Zod + React Hook Form)
- [ ] Add logging system

### Should-Do (High Priority)
- [ ] Write comprehensive tests (unit + integration)
- [ ] Setup error tracking (Sentry)
- [ ] Implement real-time updates (WebSockets)
- [ ] Add payment gateway integration
- [ ] Setup performance monitoring
- [ ] Add offline support (Service Workers)
- [ ] Create API documentation

### Nice-to-Have (Enhancement)
- [ ] Analytics dashboard
- [ ] User activity tracking
- [ ] Advanced reporting
- [ ] AI-powered recommendations
- [ ] Mobile app (React Native)
- [ ] Admin analytics dashboard
- [ ] Email notifications

---

## 📁 IMPROVED FOLDER STRUCTURE (RECOMMENDED)

```
ridewise-pro2/
├── src/
│   ├── api/                    # API services
│   │   ├── client.ts           # API client setup
│   │   ├── auth.ts
│   │   ├── bookings.ts
│   │   ├── drivers.ts
│   │   └── routes.ts
│   ├── components/
│   │   ├── common/             # Shared components
│   │   ├── auth/               # Auth-related
│   │   ├── booking/            # Booking-related
│   │   └── ui/                 # shadcn/ui
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useBookings.ts
│   │   ├── useMutation.ts
│   │   └── useQuery.ts
│   ├── contexts/               # Minimal context (only auth)
│   ├── lib/
│   │   ├── api.ts
│   │   ├── validation.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── auth/
│   │   ├── customer/
│   │   ├── driver/
│   │   └── admin/
│   ├── schemas/                # Zod schemas
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   └── payment.ts
│   ├── services/               # Business logic
│   │   ├── auth.service.ts
│   │   ├── booking.service.ts
│   │   └── analytics.service.ts
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── tests/                      # All tests
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── database/
│   │   └── middleware/
│   └── package.json
├── docker-compose.yml          # Local dev setup
└── README.md
```

---

## 🚀 QUICK START UNTUK DEVELOPMENT

### Immediate Actions (Today)

1. **Backup & Plan**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Prototype version"
   git branch -b backend-setup
   ```

2. **Setup Backend Repo**
   ```bash
   mkdir ridewise-backend
   cd ridewise-backend
   npm init -y
   npm install express cors dotenv
   ```

3. **Create Environment File**
   ```
   .env.local
   VITE_API_BASE=http://localhost:3000/api
   VITE_APP_MODE=development
   ```

### This Week
- [ ] Complete backend MVP (auth + bookings)
- [ ] Integrate React Query
- [ ] Setup error boundaries
- [ ] Write 10 critical tests

### Next Week
- [ ] Full API integration
- [ ] Payment gateway
- [ ] Real-time updates
- [ ] 50+ unit tests

---

## 📊 CURRENT TECH STACK ASSESSMENT

| Aspek | Status | Rating | Notes |
|-------|--------|--------|-------|
| **Frontend Framework** | ✅ React 18 | 9/10 | Modern, well-maintained |
| **Styling** | ✅ Tailwind CSS | 9/10 | Excellent for rapid development |
| **Component Library** | ✅ shadcn/ui | 8/10 | Comprehensive, accessible |
| **State Management** | ⚠️ Context API | 4/10 | Need React Query + backend |
| **Type Safety** | ✅ TypeScript | 8/10 | Good coverage, some gaps |
| **Testing** | ❌ Minimal | 1/10 | No test coverage |
| **Backend** | ❌ None | 0/10 | **CRITICAL** - Must build |
| **Database** | ❌ None | 0/10 | **CRITICAL** - Need DB |
| **Authentication** | ❌ Dummy | 0/10 | **CRITICAL** - Not secure |
| **Deployment** | ⚠️ Basic | 3/10 | No CI/CD, no docker |
| **Documentation** | ❌ None | 0/10 | Minimal README |

---

## 🎓 KEY LEARNINGS & BEST PRACTICES

### What Works Well ✅
1. **Component Organization** - Clean folder structure
2. **UI/UX Design** - Comprehensive component library
3. **TypeScript** - Good type definitions
4. **Routing** - Clear route structure
5. **Multi-role Support** - Good RBAC foundation

### What Needs Work ❌
1. **Architecture** - No separation of concerns
2. **Backend Integration** - Completely missing
3. **Testing** - No test culture
4. **Error Handling** - Non-existent
5. **Documentation** - Minimal/missing
6. **Deployment** - No CI/CD pipeline
7. **Security** - Multiple vulnerabilities

---

## 📞 NEXT STEPS

1. **Week 1:** Backend setup + database schema
2. **Week 2:** API endpoints + authentication
3. **Week 3:** Frontend integration with API
4. **Week 4:** Testing + Error handling
5. **Week 5:** Payment + Notifications
6. **Week 6:** Deployment + DevOps

**Estimated Timeline:** 6-8 weeks untuk production-ready

**Team Size:** 2-3 developers minimal

**Cost Estimate:** Infrastructure + hosting ~$100-300/month

---

## 📖 REFERENCE LINKS

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Zod Validation](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)

---

**Prepared by:** AI Code Reviewer  
**Version:** 1.0  
**Last Updated:** 2026-04-05

