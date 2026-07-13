# Kathreen & Lawrence Wedding Invitation

React/Vite wedding invitation with a PHP 8.2 + MySQL API and protected admin panel.

## Frontend

```powershell
npm install
npm run dev
npm run build
npm test
```

The public invitation is `/`. The admin panel is `/admin` and requires the account created by the PHP setup script.

## PHP/MySQL setup

1. Create a MySQL database and user.
2. Copy `api/config.example.php` to `api/config.php` and set the database credentials and private upload directory.
3. Run `api/schema.sql`, then `api/seed.sql`.
4. Install the Excel dependency from the `api` directory:

   ```
   composer install --no-dev --optimize-autoloader
   ```

5. Create the single administrator from a terminal on the host:

   ```
   php api/bin/create-admin.php admin "use-a-long-password"
   ```

6. Serve the built frontend and `api/` under the same HTTPS domain. Keep `api/config.php` and `api/vendor/` outside the public document root when the host allows it. The writable `api/uploads/` folder stores MP3 files; serve them through `api/private-media.php` rather than exposing generated filenames directly.

The two map navigation URLs are seeded from the invitation. To show the small embedded previews, copy each venue’s `src` URL from Google Maps’ “Share → Embed a map” and paste it into the corresponding admin venue setting. The public event endpoint exposes only invitation-safe data; RSVP records are admin-only.

## Separate API host

For local Vite development, `.env.development` routes `/api/kath` through the Vite proxy. This keeps the admin session same-site in the browser and avoids third-party-cookie blocking. Restart `npm run dev` after updating. For a separately hosted production frontend, set `VITE_API_BASE` to the PHP endpoint without a trailing slash (for example, `https://events.fitacademy.ph/api/kath`), add the exact frontend origin to `allowed_origins` in the API `config.php`, and use HTTPS.

## GitHub Pages

Pushing to `main` deploys the React invitation through GitHub Pages. The deployment workflow builds the site with the `/wedding-invitation/` base path. The PHP/MySQL `api/` directory and generated `dist/` directory are intentionally excluded from the repository; the live site uses the separately hosted API endpoint.
