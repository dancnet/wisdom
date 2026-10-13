# Wisdom 🌱💡

**Wisdom** is a lightweight, self-hosted note-taking and study app. Organize notes into folders, turn your notes into questions, and review what you've learned with randomized quizzes.

It's built with **React**, **W3.CSS**, and **Lucide** on the frontend, and **Express** with **SQLite** (`better-sqlite3`) on the backend. The interface is responsive and can be added to an iPhone's home screen as a web app.

## Features

- **Folders:** Create, rename, and delete folders; view their note counts and most recent note modification dates.
- **Notes:** Create, edit, move between folders via the API, and delete notes. Browse note previews within each folder.
- **Questions:** Add, edit, and remove study questions attached to individual notes.
- **Random notes:** Browse notes in a shuffled order using previous/next controls.
- **Quizzes:** Review randomized questions from one note or an entire folder, and reveal the related note to check your answer.
- **Responsive interface:** Designed for desktop and mobile browsers, including iPhone home-screen use.
- **Local data:** Notes and questions are stored in a SQLite database on your server; no external database service is required.

## Tech stack

| Frontend | Backend |
| --- | --- |
| React + Vite | Node.js + Express |
| W3.CSS | SQLite (`better-sqlite3`) |
| Lucide React icons | REST API under `/api` |

## Project layout

```text
wisdom/
├── api.js                  # Express API routes
├── db.js                   # Database initialization and schema
├── server.js               # Express server and static file serving
├── .env                     # Optional local PORT setting (ignored by Git)
├── .env.example             # Example environment configuration
├── .gitignore               # Excludes local data, secrets, build files
├── nodemon.json            # Development watch exclusions (if configured)
├── package.json            # Backend scripts and dependencies
├── data/
│   ├── .gitkeep            # Keeps the directory in Git
│   └── knowledge.db        # Created automatically; NOT committed
└── client/
    ├── index.html
    ├── vite.config.js      # /api proxy during development
    ├── package.json
    ├── public/
    │   ├── icon.png
    │   └── manifest.webmanifest
    └── src/
        ├── App.jsx
        ├── Folders.jsx
        ├── FolderView.jsx
        ├── NotesList.jsx
        ├── NoteView.jsx
        ├── QuestionsTab.jsx
        ├── FolderModals.jsx
        └── api.js          # Frontend fetch helpers
```

## Requirements

- A current **Node.js LTS** release and npm (Node.js 22+ recommended)
- A supported desktop or mobile browser

No separate SQLite installation is necessary.

## Installation

Clone the repository and install dependencies in **both** the project root and React client:

```bash
git clone https://github.com/dancnet/wisdom.git
cd wisdom
npm install
cd client
npm install
cd ..
```

The clone command uses GitHub SSH authentication; configure your SSH key first, or use the HTTPS repository URL instead.

## Configuration (.env)

The Express server listens on **port 3000** by default. To change it, create `.env` in the repository root (or copy the provided example):

```bash
cp .env.example .env
```

Example `.env`:

```dotenv
PORT=3000
```

Change the value to your preferred port. **If `.env` does not exist, Express still starts on port 3000.** The backend reads the optional `.env` using `dotenv` (install with `npm install dotenv` if not already installed). At the top of `server.js`, add:

```js
import "dotenv/config";
```

And set your existing port constant to:

```js
const PORT = Number(process.env.PORT ?? 3000);
```

The import must run before reading `process.env.PORT`. The `.env` file is ignored by Git; `.env.example` is committed as a template. `client/.env` is separate and is not needed for the Vite proxy setup here.

**Development proxy note:** `client/vite.config.js` currently forwards `/api` to `http://localhost:3000`. If you change `PORT`, update the Vite proxy target accordingly. Production does not need the proxy.

## Development

Start the API and Vite together from the project root:

```bash
npm run dev
```

The root development script uses `concurrently` and `nodemon` to run Express and Vite together. The Vite proxy forwards `/api` requests to Express.

| URL | Purpose |
| --- | --- |
| `http://localhost:5173` | React development UI |
| `http://localhost:3000/api` | Express API (or configured `PORT`) |

If you prefer separate terminals:

```bash
# Terminal 1, project root
npx nodemon .

# Terminal 2, project root
npm --prefix client run dev
```

### Expected root development script

If you haven't configured it yet, add this to the `scripts` section of the root `package.json`:

```json
{
  "dev": "concurrently -n API,CLIENT -c cyan,magenta \"nodemon .\" \"npm --prefix client run dev\""
}
```

Install the development tools in the root project if needed:

```bash
npm install --save-dev concurrently nodemon
```

## Production build and run

From the project root:

```bash
npm install
npm --prefix client install
npm --prefix client run build
node server.js
```

The React build is written to `client/dist/`. Express serves those built files and handles the API on the **same port**, by default (unless `PORT` is set in `.env`):

```text
http://localhost:3000
```

For access from other devices on your network, use the server's reachable address and configure your network/firewall appropriately. Use **HTTPS** when exposing the app over a network you don't trust or the public internet.

## Deploy on Debian with systemd

A convenient location for a single-user self-hosted installation is **`~/apps/wisdom`** (for example, `/home/dan/apps/wisdom`). It keeps the project out of system directories and makes updates straightforward. The systemd service runs as that regular Linux user, not root.

### 1. Clone, install, and build

Run as your regular user:

```bash
mkdir -p ~/apps
cd ~/apps
git clone git@github.com:dancnet/wisdom.git
cd wisdom
npm ci
npm --prefix client ci
npm run build --prefix client
cp .env.example .env   # optional: edit PORT here
```

`npm ci` requires committed lockfiles. If your repo does not contain them yet, use `npm install` and `npm --prefix client install` instead.

Check the absolute Node path with `command -v node` (often `/usr/bin/node` on Debian). If using nvm, systemd will not automatically load your interactive shell's Node environment; use the actual absolute path or install a system-wide Node version.

### 2. Create `/etc/systemd/system/wisdom.service`

```ini
[Unit]
Description=Wisdom note-taking web app
After=network.target

[Service]
Type=simple
User=YOUR_LINUX_USERNAME
WorkingDirectory=/home/YOUR_LINUX_USERNAME/apps/wisdom
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Replace **both** `YOUR_LINUX_USERNAME` occurrences with your actual Debian username, and change `ExecStart` if `command -v node` returns a different path. The application's `.env` is loaded by `dotenv` in `server.js`; you don't need an `EnvironmentFile=` directive. Ensure this user owns the project and can write to `data/`.

### 3. Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now wisdom
sudo systemctl status wisdom
journalctl -u wisdom -f
```

To restart after changes:

```bash
sudo systemctl restart wisdom
```

To deploy a new version:

```bash
cd ~/apps/wisdom
git pull --ff-only
npm ci
npm --prefix client ci
npm --prefix client run build
sudo systemctl restart wisdom
```

This keeps the `.env` and SQLite database on the server rather than in Git.

**Security:** The current API has no authentication. Do not expose Wisdom directly to the public internet. Use a private network, VPN, or an authenticated reverse proxy; use HTTPS for remote access and iPhone home-screen installation.

## iPhone home screen

Wisdom includes a web app manifest and an Apple touch icon (`client/public/icon.png`). Once served over HTTPS, open the site in Safari and choose **Share → Add to Home Screen**. It can launch in a standalone, app-like window.

> Installing it to the home screen does **not** make the app work offline. It still needs a connection to the Express server.

## Data and API

The database is created automatically at:

```text
data/knowledge.db
```

Its tables are:

- `folders` — folder names
- `notes` — note content, folder membership, modification timestamp
- `questions` — question text linked to a note

Deleting a folder cascades to its notes and their questions. Deleting a note cascades to its questions. A SQLite trigger updates a note's modification timestamp when the note or its folder assignment changes.

The REST API is mounted at `/api`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/folders` | List folders, including note count and last modified note |
| POST | `/api/folders` | Create a folder (`name`) |
| PUT | `/api/folders/:id` | Rename a folder (`name`) |
| DELETE | `/api/folders/:id` | Delete a folder |
| GET | `/api/notes?folder_id=1` | List notes in a folder |
| POST | `/api/notes` | Create a note (`note`, `folder_id`) |
| PUT | `/api/notes/:id` | Edit text and/or folder (`note`, `folder_id`) |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/questions?note_id=1` | List a note's questions, newest first |
| GET | `/api/questions?folder_id=1` | List randomized questions from a folder |
| POST | `/api/questions` | Create a question (`question`, `note_id`) |
| PUT | `/api/questions/:id` | Edit question text (`question`) |
| DELETE | `/api/questions/:id` | Delete a question |

Requests with JSON bodies should use `Content-Type: application/json`.

## Backups

Back up `data/knowledge.db` regularly. If the server is running, use SQLite's backup mechanism or stop the server before copying the database file, rather than relying on a potentially inconsistent live file copy.

The provided `.gitignore` excludes `data/knowledge.db`, `.env`, `node_modules/`, and `client/dist/`. Only `data/.gitkeep` is tracked in `data/`.

## License

Released under the **GNU General Public License v3.0 (GPL-3.0-only)**. You may use, study, modify, and redistribute Wisdom under the terms of this copyleft license. Distributed modified versions must preserve the applicable GPL freedoms and provide corresponding source code. See [LICENSE](LICENSE).
