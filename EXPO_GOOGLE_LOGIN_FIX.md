# Google login – load ho kar ruk jana (fix)

**Problem:** Google account select hone ke baad screen load hoti rehti hai, aage nahi jati.

**Reason:** OAuth ke baad redirect `kubsy://auth-callback` par to hota hai, lekin app us URL ko **receive karke session set nahi kar rahi**. Browser/in-app browser redirect ke baad app ko URL nahi de raha ya app us URL se session create nahi kar rahi.

**Fix:** Neeche wala flow use karo – `skipBrowserRedirect: true` + `WebBrowser.openAuthSessionAsync` + redirect URL se session banana.

---

## 1. Google sign-in – sahi flow (copy-paste ready)

```ts
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase'; // apna path

const REDIRECT_URL = 'kubsy://auth-callback';

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No auth URL');

  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    REDIRECT_URL
  );

  if (result.type !== 'success') {
    // User cancelled ya error
    return { success: false, cancelled: result.type === 'cancel' };
  }

  const { url } = result;
  await createSessionFromUrl(url);
  return { success: true };
}

async function createSessionFromUrl(url: string) {
  const params = new URL(url.replace('#', '?'));
  const access_token = params.searchParams.get('access_token') ?? params.hash?.split('&').find(p => p.startsWith('access_token='))?.split('=')[1];
  const refresh_token = params.searchParams.get('refresh_token') ?? params.hash?.split('&').find(p => p.startsWith('refresh_token='))?.split('=')[1];

  if (!access_token) throw new Error('No access_token in redirect');

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });
  if (error) throw error;
  return data.session;
}
```

---

## 2. Hash fragment se tokens (deep link URL format)

GoTrue redirect karta hai: `kubsy://auth-callback#access_token=...&refresh_token=...&...`

Isliye URL parse karte waqt **hash** bhi check karo:

```ts
function getParamsFromRedirectUrl(url: string): { access_token?: string; refresh_token?: string } {
  const parsed = new URL(url.replace(/^([^#]+)#/, '$1?'));
  return {
    access_token: parsed.searchParams.get('access_token') ?? undefined,
    refresh_token: parsed.searchParams.get('refresh_token') ?? undefined,
  };
}

async function createSessionFromUrl(url: string) {
  const { access_token, refresh_token } = getParamsFromRedirectUrl(url);
  if (!access_token) throw new Error('No access_token');
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? '',
  });
  if (error) throw error;
  return data.session;
}
```

Hash wale URL ko parse karne ka simple tareeka:

```ts
const hashPart = url.split('#')[1] || '';
const params = new URLSearchParams(hashPart);
const access_token = params.get('access_token');
const refresh_token = params.get('refresh_token');
```

---

## 3. Login button se call

```tsx
const [loading, setLoading] = useState(false);

const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    const result = await signInWithGoogle();
    if (result.success) {
      router.replace('/(tabs)'); // ya FillYourProfile check karke
    }
  } catch (e) {
    console.error(e);
    alert('Login failed');
  } finally {
    setLoading(false);
  }
};
```

---

## 4. Server side (already done)

- `ADDITIONAL_REDIRECT_URLS` mein `kubsy://auth-callback` add hai
- `APP_URL=kubsy://auth-callback`
- Auth restart ho chuka hai

---

**Summary:** `signInWithOAuth` mein `skipBrowserRedirect: true` do, phir `WebBrowser.openAuthSessionAsync(data.url, 'kubsy://auth-callback')` se browser kholo. Jab redirect `kubsy://auth-callback` par aaye to session return hogi; us URL se tokens nikaal kar `supabase.auth.setSession()` call karo – isse load hata kar aage navigation kaam karegi.
