# Tobi Adetimehin

Next.js site for the artist's portfolio and shop. Content is edited at **`/admin`**: text and artworks are stored in
Firestore (Firebase project `tobitheartist-5bd70`), sign-in is Firebase Auth, and uploaded images go to Cloudinary.

## Editing the site

Go to `/admin` and sign in.

| Section | What it changes |
| --- | --- |
| Home page | Hero image, introduction, featured work |
| About page | Portrait, biography, closing note |
| Artworks | Add/edit/delete art, price, size, sold out, order, which paintings page and whether it is in the shop |
| Paintings pages | Headings of the three paintings pages |
| Site settings | The enquiry button on every artwork (Calendly link or email address), site title, description and sharing image |

Saving publishes immediately.

## One-time setup

1. **Firebase → Authentication** → Sign-in method → enable **Email/Password**. Under Users, add a user for each editor.
2. **Firebase → Firestore** → create a collection `admins` and add a document whose **ID is the user's UID** (any field, e.g. `name`).
   The UID is shown in Authentication → Users, and on `/admin` after signing in with a non-admin account.
3. **Firestore rules**: publish `firestore.rules` with `firebase deploy --only firestore:rules --project tobitheartist-5bd70`
   (or paste the file into Firestore → Rules in the console). Until this is done the contact and newsletter forms cannot save.
4. **Cloudinary**: create a free account and copy the cloud name, API key and API secret from its dashboard into the
   `CLOUDINARY_*` environment variables below (locally in `.env.local`, and in the hosting provider's settings).

The first time an admin signs in, the content that was live before the move from Prismic is copied into Firestore.
Until then the site shows that same content from the defaults in `lib/types.ts`.

## Development

```bash
npm install
npm run dev
```

Environment variables: `RESEND_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`.

To make another piece of text or image editable, add it to the page's type and defaults in `lib/types.ts`,
list it in `lib/adminSchema.ts`, and render it on the page.
