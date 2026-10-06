# Velora V2

Velora is a responsive, adaptive touch-typing academy built as a lightweight web application. Version 2 adds real account architecture, per-user progress, intentional dark/light themes, improved responsive behavior, and a more responsive training experience while preserving the original journey and typing engine.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Cloudflare deployment

The repository includes a deployment-ready `public/` directory and `wrangler.jsonc`. No framework build is required.

### Cloudflare Workers / Wrangler

```bash
npx wrangler deploy
```

### Cloudflare dashboard with Git integration

- Production branch: `arena/3d690ca4-typing-pro` until the pull request is merged into `main`
- Build command: leave blank
- Deploy command: `npx wrangler deploy`
- Static asset directory: `public`

The explicit asset configuration prevents Wrangler's “Could not detect a directory containing static files” error.

## Accounts and data

Velora provides three modes:

- **Guest:** Progress is stored locally for the current browser.
- **Local email account:** Account credentials are hashed with Web Crypto and progress is isolated by account in `localStorage`.
- **Firebase:** Genuine Google Sign-In, Firebase email authentication, persistent sessions, and Firestore profile sync are enabled when Firebase is configured.

The app never simulates a successful Google login. Without a configured provider, the Google action explains what needs to be connected.

### Enable Firebase authentication

Define the Firebase web configuration before `auth-provider.js` loads. For example, place this immediately before that script in `index.html` (or load it from an environment-generated config file):

```html
<script>
  window.VELORA_FIREBASE_CONFIG = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    appId: "..."
  };
</script>
```

Then in Firebase:

1. Enable Email/Password and Google providers under Authentication.
2. Add the deployment domain to Authorized Domains.
3. Create Firestore and secure the `profiles/{userId}` collection so users can only access their own document.

`auth-provider.js` implements the adapter consumed by `AuthService`. It can be replaced by a Supabase or custom adapter implementing `getSession`, `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `loadProfile`, and `saveProfile`.

## V2 features

- Email sign-up/login, logout, guest mode, session restoration, and optional genuine Google authentication
- Per-user persistence for XP, lessons, exercises, records, history, weak keys, achievements, goals, and preferences
- Context-aware welcome, smart continuation, daily progress, and data-driven empty states
- Responsive dashboard and typing workspace for wide, laptop, tablet, mobile, landscape, and short screens
- Dark, light, and system themes with persistence
- Reduced motion and adaptive UI preferences
- Export and reset controls for user data
- Optimized typing feedback, physical-key animation, combo feedback, and a gentle Flow state
- WPM, accuracy, consistency, score, and weak-key analytics based on real sessions
- Journey, practice library, challenges, charts, Typing DNA, skill tree, and achievements

No build step or frontend framework is required.
