# Connecting Fundi to Supabase

Until these steps are done the app runs in **demo mode**: sample listings, and
anything you add is saved only in your own browser. After them, listings,
reviews, logins and photos are shared and saved properly.

It takes about 20 minutes. You only need a browser.

> Supabase occasionally renames buttons. If a label below doesn't match exactly,
> look for the closest one in the same menu.

---

## 1. Create the project

1. Go to <https://supabase.com> and sign up (signing in with GitHub is easiest).
2. Click **New project**.
   - **Name:** `fundi`
   - **Database password:** generate one and save it in your password manager.
   - **Region:** **Cape Town (af-south-1)**, so customer data stays in South Africa (helps with POPIA).
   - Plan: **Free** is fine to start.
3. Wait a minute or two for the project to finish setting up.

## 2. Create the database tables

1. In the left menu open **SQL Editor** → **New query**.
2. Open each file below on GitHub, copy **all** of it, paste it into the editor and click **Run**. Do them **in this order**:
   1. [`supabase/migrations/20261006100000_init.sql`](../supabase/migrations/20261006100000_init.sql): tables and security rules
   2. [`supabase/migrations/20261006100100_categories.sql`](../supabase/migrations/20261006100100_categories.sql): the 18 service categories
   3. [`supabase/migrations/20261006100200_storage.sql`](../supabase/migrations/20261006100200_storage.sql): photo storage
3. Each should finish with *Success. No rows returned*.

**Optional: demo listings.** Run [`supabase/seed.sql`](../supabase/seed.sql) to add the 10 sample fundis, so the
app isn't empty while you test. They have made-up phone numbers, so **delete them before launch**:

```sql
delete from public.providers where id::text like '00000000-0000-4000-8000-%';
```

## 3. Set up sign-in

Fundi signs people in with a **6-digit code**: no passwords.

1. **Authentication → Sign In / Providers → Email**: make sure Email is **enabled**.
2. **Authentication → Emails → Templates → Magic Link**: replace the message body with something like the
   text below. The important part is `{{ .Token }}`, which inserts the 6-digit code:

   ```html
   <h2>Your Fundi sign-in code</h2>
   <p>Enter this code in the app to sign in:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
   <p>It expires in 1 hour. If you didn't ask for it, ignore this email.</p>
   ```

   Do the same for the **Confirm signup** template (first-time users get that one).
3. **Authentication → URL Configuration**:
   - **Site URL:** `https://alexikleo.github.io/App-Idea/`
   - **Redirect URLs:** add `https://alexikleo.github.io/App-Idea/**` and `http://localhost:5173/**`

> **Before launch:** Supabase's built-in email only sends a few emails per hour, which is fine for testing.
> For real users, add your own email sender under **Project Settings → Authentication → SMTP**
> (e.g. Resend, Brevo or Amazon SES).

### SMS codes (later)

To sign in with a cellphone number instead of email:

1. **Authentication → Sign In / Providers → Phone**: enable it and connect an SMS provider (Twilio, Vonage or
   MessageBird all reach SA numbers). Each SMS costs money, so check the provider's current SA rates.
2. Set `VITE_AUTH_METHOD` to `phone` (step 4).

## 4. Connect the website

1. In Supabase open **Project Settings → API** (may be called **API Keys**) and copy:
   - the **Project URL** (looks like `https://abcd1234.supabase.co`)
   - the **publishable** key (older projects call it the **anon public** key)

   These two are safe to put in a website; the security rules from step 2 protect the data.
   **Never** use the `secret` / `service_role` key in the app or share it.
2. On GitHub open **Settings → Secrets and variables → Actions → Variables** for this repo and add three
   **repository variables**:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | your Project URL |
   | `VITE_SUPABASE_ANON_KEY` | your publishable / anon key |
   | `VITE_AUTH_METHOD` | `email` |

3. Re-run the deploy: **Actions → Deploy to GitHub Pages → Run workflow**. A couple of minutes later the
   live site uses the real database, and the "Demo mode" notes disappear.

To use it on your laptop, copy `web/.env.example` to `web/.env.local`, fill in the same values and run
`npm run dev`.

## 5. Moderating listings and reviews

Until there's an admin screen (planned for Phase 3), do this in **SQL Editor**. It runs with full access, so
double-check the id before you run anything. Find ids in **Table Editor → providers / reviews**, or in the
address bar of a fundi's profile page.

```sql
-- Give a fundi the Verified badge (after checking their PIRB / ECSA / SAPCA registration)
update public.providers set verified = true where id = '<listing id>';

-- Hide a listing or a review that breaks the rules (ratings update automatically)
update public.providers set status = 'hidden' where id = '<listing id>';
update public.reviews set status = 'hidden' where id = '<review id>';
```

To mark your own account as an admin, ready for the admin screen, sign in on the site once and run:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

---

## What the security rules guarantee

These are enforced by the database itself, and checked by the automated tests in `supabase/tests`:

- Anyone can view active listings, prices and published reviews.
- You must be signed in to list a business or write a review.
- Each account can have **one** listing and can only edit **its own**.
- Each customer can review a fundi **once** (they can edit it) and **can't review themselves**.
- Nobody can give themselves the Verified badge, change their own rating or hide reviews, except admins.
- People can only upload photos into their own folder.
