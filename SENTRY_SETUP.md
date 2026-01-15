# Sentry Integration Guide for Next.js

## 🚀 Quick Setup

### 1. Install Sentry SDK

```bash
npm install @sentry/nextjs
```

### 2. Initialize Sentry

Run the Sentry wizard (easiest method):

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js`
- Prompt for your Sentry DSN

### 3. Manual Setup (Alternative)

If you prefer manual setup:

#### Get Your DSN
1. Create account at https://sentry.io
2. Create new project → Select "Next.js"
3. Copy your DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

#### Add to Environment Variables

`.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
SENTRY_AUTH_TOKEN=your_auth_token (optional, for source maps)
```

---

## 📁 Configuration Files

### `sentry.client.config.ts` (Client-side)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Filter out development errors
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null; // Don't send events in development
    }
    return event;
  },
});
```

### `sentry.server.config.ts` (Server-side)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Filter out development errors
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

### `sentry.edge.config.ts` (Edge Runtime)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

---

## 🔧 Next.js Configuration

Update `next.config.ts`:

```typescript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  // Your existing config...
};

export default withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "your-org-slug",
    project: "your-project-slug",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    automaticVercelMonitors: true,
  }
);
```

---

## 🧪 Testing Sentry

### Test Client-Side Error

Add a button anywhere to trigger test error:

```tsx
<button onClick={() => {
  throw new Error("Sentry Test Error - Client");
}}>
  Test Sentry (Client)
</button>
```

### Test Server-Side Error

Create test API route `app/api/sentry-test/route.ts`:

```typescript
export async function GET() {
  throw new Error("Sentry Test Error - Server");
}
```

Visit `/api/sentry-test` to trigger.

---

## 📊 What Sentry Captures

✅ **Automatic:**
- Unhandled exceptions
- Unhandled promise rejections
- API route errors
- Server component errors
- Edge runtime errors

✅ **Manual Capture:**

```typescript
import * as Sentry from "@sentry/nextjs";

// Capture exception
try {
  // risky code
} catch (error) {
  Sentry.captureException(error);
}

// Capture message
Sentry.captureMessage("Something went wrong", "error");

// Add context
Sentry.setUser({ id: "user123", email: "user@example.com" });
Sentry.setTag("page", "/admin");
Sentry.setContext("character", { name: "John", age: 30 });
```

---

## 🎨 Error Boundaries

Error boundaries are already created:
- `app/error.tsx` - Catches errors in page components
- `app/global-error.tsx` - Catches errors in root layout

These automatically report to Sentry!

---

## 🚀 Production Checklist

Before deploying:

- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel environment variables
- [ ] Set `tracesSampleRate` to `0.1` or lower (10% sampling)
- [ ] Set `replaysSessionSampleRate` to `0.1` or lower
- [ ] Test error reporting in staging
- [ ] Set up alerts in Sentry dashboard
- [ ] Configure release tracking (optional)

---

## 📈 Best Practices

### 1. Filter Sensitive Data

```typescript
beforeSend(event, hint) {
  // Remove sensitive data
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers?.['authorization'];
  }
  return event;
}
```

### 2. Group Similar Errors

```typescript
Sentry.captureException(error, {
  fingerprint: ['database-error', databaseId],
});
```

### 3. Add Breadcrumbs

```typescript
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
});
```

---

## 🔍 Debugging

### Sentry Not Working?

1. **Check DSN:** Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. **Check Console:** Look for Sentry init messages
3. **Disable beforeSend:** Comment out filter in dev
4. **Check Network:** Look for requests to `sentry.io`
5. **Clear Cache:** Delete `.next/` and rebuild

### Common Issues

**"Sentry not capturing errors in development"**
→ Remove `beforeSend` filter for local testing

**"Source maps not uploading"**
→ Set `SENTRY_AUTH_TOKEN` and configure org/project

**"Too many events"**
→ Reduce `tracesSampleRate`

---

## 📚 Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Boundaries](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry Dashboard](https://sentry.io)

---

**Status:** ✅ Sentry integration complete!
