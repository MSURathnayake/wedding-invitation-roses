# Sachini & Dimuth — Wedding Invitation (React + Google Apps Script)

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs /dist  → deploy to Vercel
```

## Change the details
Everything (names, date, venue, families, phone numbers, gallery photos) is in **`src/config.js`**.
Put your real photos in `public/assets/` and list them in `gallery`.
Replace `public/assets/intro.mp4` to change the intro video.

## Flow
1. **Cover** — rose heart with the couple's names; tap → heart spreads out, screen opens left/right
2. **Video** — plays, then blurs with "We are invited" → *Open invitation*
3. **Invitation** — rose circle with names, couple photo, families, date/venue (Maps + Add-to-calendar), countdown, photo slider, RSVP, guest photo upload, contacts

## Guest name (returning guests)
* After a guest sends an RSVP, their name is remembered in that browser. Next time they open the invitation their
  name appears on the cover ("Dear …"), on the "We are invited" screen, at the top of the invitation (with their RSVP
  summary) and in the RSVP card (they can change their answer).
* On a different phone, a guest can tap **"Already replied from another phone?"** and enter their number — the backend finds their row.
* You can also personalise links before they reply: `https://your-site.vercel.app/?to=Kamal%20Silva`

## Google Apps Script backend
1. Create a Google Sheet → **Extensions → Apps Script**.
2. Paste `apps-script/Code.gs`, save.
3. **Deploy → New deployment → Web app** → *Execute as: Me*, *Who has access: Anyone* → Deploy, authorise.
4. Copy the **Web app URL** into `appsScriptUrl` in `src/config.js`, rebuild.

* RSVPs go to a sheet called `RSVPs` (one row per phone number; replying again updates the same row).
* Uploaded photos go to a Drive folder called `Wedding Guest Photos`.
* After changing Code.gs you must **Deploy → Manage deployments → Edit → New version**.

Until the URL is set the site runs in **demo mode** (nothing leaves the browser).

## Photo upload timing
Uploads unlock on `uploadOpensAt` (wedding day 00:00, Sri Lanka time) and stay open afterwards.
To test early, open the site with `?unlock` at the end of the URL.
