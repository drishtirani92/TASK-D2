# DEV@Deakin - Task D2 (Browse Posts)

SIT313 Secure Frontend Applications, Distinction Task D2.

This builds on the D1 platform (login sessions, pricing and upgrade).

- The Post form has a new **Select Post Plan** option (Free or Paid).
- Posts are saved to Firestore by the backend, only for logged-in users. Each post stores the author's ID, the plan and the date created.
- New **Browse Posts** page. The **backend** decides which posts each person may see:
  - a visitor (not logged in) sees Free posts only
  - a user on the Free plan sees Free posts only
  - a user on the Paid plan sees Free and Paid posts
- Filter by search text, type, plan, tag and created date. Hide posts, Reset, Expand a post into a larger view, and drag posts to re-order them.

## Home page

The home page is also my portfolio from Task P1, built in React:

- Header with the logo, search box, Browse Posts, Pricing, Post, Login and Sign up. When logged in it shows the user's name, their plan (Free or Paid) and Logout.
- A small menu under the header (About, Work, Photos, Contact) that jumps to each section and highlights the one you are on. Contact scrolls down to the footer.
- Banner of Deakin University with "Hey, I'm Drishti" in a bar at the bottom.
- Profile with my photo, name and a short line about me.
- "Here's what I've done so far": three projects with a picture on the left and the text on the right. Explore Project opens a popup with more details.
- My photos: a gallery that re-arranges itself (4, 2 or 1 pictures across) when the window is resized. Clicking a picture opens a bigger view.
- Featured Articles, Tutorials and a back to top button.
- One footer with the newsletter sign-up, links, my email and my GitHub and LinkedIn icons.

The pictures are in `frontend/public` (`banner.jpg` and `profile.jpg`).

## Folders

```
frontend/   React + Vite website
backend/    ExpressJS server + Firestore (firebase-admin)
```

## How the login flow works

1. **Register:** React validates the form (Zod) and sends it to `POST /api/auth/register`. The backend validates again, hashes the password and saves the user in the `users` collection with `plan: "free"`.
2. **Login:** React sends the email and password to `POST /api/auth/login`. If they match, the backend signs a JWT and sends it back with the user.
3. **Session:** React saves the JWT in `localStorage`. When the site opens, it calls `GET /api/auth/me` to check that the token is still valid and load the user.
4. **Protected requests:** React sends `Authorization: Bearer <token>`. The backend checks the token before saving a post or upgrading a plan.
5. **Logout:** the token is removed from `localStorage` and the user is cleared.

## Backend routes

| Route | Login needed | What it does |
| --- | --- | --- |
| `POST /api/auth/register` | no | Create an account (201, 400, 409) |
| `POST /api/auth/login` | no | Check details and return a JWT (200, 400, 401) |
| `GET /api/auth/me` | yes | Return the current user (200, 401) |
| `POST /api/posts` | yes | Save a question or article (201, 400, 401) |
| `GET /api/posts` | optional | List the posts this user may see, as short previews (200) |
| `GET /api/posts/:id` | optional | One whole post. Paid posts need a Paid plan (200, 400, 403, 404) |
| `POST /api/plan/upgrade` | yes | Check the card details and set the plan to paid (200, 400, 401, 409) |
| `POST /api/subscribe` | no | Send the newsletter welcome email (200, 400, 502) |

Card details are only validated (Zod and the Luhn check) and are never saved or logged. This is a demo, so no real payment is made. The test card is `4242 4242 4242 4242` with any future expiry and any 3 digit CVC.

## How Browse Posts keeps Paid posts private

1. The React page calls `GET /api/posts` and sends the login token if there is one.
2. The backend works out the plan from **Firestore** (not from the browser), takes the Paid posts out of the list when the person is not on the Paid plan, and sends back only what they may see.
3. A Free user's browser never receives Paid posts, so they are not in the page, the network tab or the code. The response only says how many Paid posts are hidden.
4. The list holds just a short preview. The whole post comes from `GET /api/posts/:id`, which checks the plan again and answers 403 for Paid posts. Guessing a post ID does not work.
5. The author's email is never sent, only their name, because visitors can open this page.
6. Responses are sent with `Cache-Control: private, no-store`, so one person's list is never shown to another.

Filtering, hiding, re-ordering and Reset happen in the browser, on posts the user is already allowed to see. Hiding never changes Firestore.

## Firestore collections

- `users`: firstName, lastName, email, passwordHash, plan (`free` or `paid`), createdAt, upgradedAt
- `posts`: type, plan (`free` or `paid`), title, description or abstract and articleText, tags (up to 3), authorId, authorName, createdAt

## Set up

### 1. Firebase service account key (one time)

The backend uses the Firebase Admin SDK, so it needs a key file.

1. Firebase console, Project settings, **Service accounts**, **Generate new private key**.
2. Save the downloaded file as `backend/serviceAccountKey.json`. Git ignores it. Never commit it.
3. Make sure a Firestore database exists (Build, Firestore Database, Create database).

### 2. Run it

You need two terminals.

Backend:

```bash
cd backend
npm install
cp .env.example .env     # add JWT_SECRET and your Mailjet keys
npm run dev
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env     # only needs VITE_API_URL
npm run dev
```

Open http://localhost:5173.

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Both `.env` files and the service account key are ignored by Git.

## Deploy

The website is two parts, so it is hosted in two places:

| Part | Hosted on | Why |
| --- | --- | --- |
| `frontend/` (React + Vite) | **Netlify** | Netlify serves static files, which is what `npm run build` produces |
| `backend/` (ExpressJS) | **Render** (free web service) | Netlify cannot run a long-lived Express server, Render can |

### 1. Backend on Render

1. Push the project to GitHub, then on render.com choose New, Web Service, and pick the repository.
2. Settings: **Root Directory** `backend`, **Build Command** `npm install`, **Start Command** `npm start`, **Instance type** Free.
3. Environment variables (Environment tab):

| Name | Value |
| --- | --- |
| `JWT_SECRET` | a long random string |
| `JWT_EXPIRES_IN` | `2h` |
| `CLIENT_URL` | your Netlify link, no `/` at the end (add it after step 2 below) |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | the key file as base64, see below |
| `MAILJET_API_KEY` | your Mailjet key |
| `MAILJET_SECRET_KEY` | your Mailjet secret |
| `EMAIL_FROM` | your verified sender email |

Make the base64 text of the Firebase key on a Mac (it copies to the clipboard):

```bash
base64 -i backend/serviceAccountKey.json | tr -d '\n' | pbcopy
```

4. Deploy. Open `https://YOUR-SERVICE.onrender.com/api/health`. It should say `Server is running`.

### 2. Frontend on Netlify

1. On netlify.com choose Add new site, Import an existing project, and pick the same repository.
2. Settings: **Base directory** `frontend`, **Build command** `npm run build`, **Publish directory** `frontend/dist` (Netlify may show it as `dist`).
3. Environment variable: `VITE_API_URL` = your Render link, no `/` at the end. Vite reads it while building, so set it before deploying.
4. Deploy, then copy the Netlify link.
5. Go back to Render and set `CLIENT_URL` to the Netlify link. Render redeploys by itself.

`frontend/public/_redirects` and `frontend/netlify.toml` make pages like `/pricing` and `/login` still work when the page is refreshed.

### Things to know

- Render's free service goes to sleep after 15 minutes without visitors, so the first request afterwards can take about a minute. Open the `/api/health` link before a demo to wake it up.
- Changing a variable on Netlify needs a new deploy (Deploys, Trigger deploy) before it takes effect.
- Never put `serviceAccountKey.json` or any `.env` file in Git.
