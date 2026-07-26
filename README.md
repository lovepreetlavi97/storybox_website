# Ultra-Fast Audio Streaming Platform (Kuku FM Clone)

A high-performance, production-ready, lightweight audio streaming platform built for rapid launch (MVP). Designed with custom HSL dark-theme layouts, index-optimized MongoDB retrieval, and zero-overhead file streaming.

## 🛠️ Technology Stack

- **Monorepo Manager**: Npm Workspaces
- **Public Website & Admin Panel**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend API Server**: Node.js, Fastify, Mongoose (MongoDB)
- **Shared Types Layer**: Single-package TypeScript structures

---

## 📁 Repository Structure

```text
├── apps/
│   ├── server/      # Node.js + Fastify backend API (Port 5000)
│   ├── website/     # Next.js 15 public streaming website (Port 3000)
│   └── admin/       # Next.js 15 administrator dashboard (Port 3001)
├── shared/          # Shared interfaces & types package
├── package.json     # Workspace management package configurations
└── README.md
```

---

## ⚡ Key Optimizations (10,000+ Concurrent Users)

1. **In-Memory Cache**: Public streaming feeds (Featured, Trending, Latest, and Categories) are cached for 10-30 seconds on the Fastify instance, bypassing DB querying during peak concurrent spikes.
2. **Database Indexes**: Compound indexes on Mongoose schemas cover filtering properties (`featured`, `trending`, `published`, `category`), and a `text` search index speeds up text search queries.
3. **Local Multipart Storage**: Multipart audio uploads are streamed directly to disk (`uploads/audio` and `uploads/images`) via pipeline pipes, avoiding high-RAM buffers on Node.js.
4. **Lightweight Controls**: Built using HTML5 audio elements and vanilla client states, avoiding heavy player libraries or custom wrappers.

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js**: v20 or later
- **MongoDB**: A running local instance of MongoDB at `mongodb://localhost:27017/kuku-fm-clone` (or edit `apps/server/.env` to point to a remote URI).

### ⚙️ Installation

In the root directory, install all workspace dependencies:

```bash
npm install
```

### 💻 Running Development Servers

Start the Fastify API server, Next.js Website, and Next.js Admin Panel simultaneously with one command:

```bash
npm run dev
```

The apps will be available at:
- 🌐 **Public Website**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Admin Control Panel**: [http://localhost:3001](http://localhost:3001)
- 🔌 **Backend REST API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Administrator Credentials

To manage your categories, upload audio titles, and publish banners, log into the Admin Control Panel using:

- **Username**: `admin`
- **Password**: `adminpassword`

*(These can be updated anytime inside `apps/server/.env`)*

---

## 📂 Customizing Storage Backend

This application saves uploads to the local filesystem (`/uploads`). If you wish to migrate to AWS S3, Cloudflare R2, or DigitalOcean Spaces in the future:
1. Replace Fastify's `/upload/image` and `/upload/audio` route handlers inside `apps/server/src/routes/admin.ts` with your cloud bucket upload client (e.g. `@aws-sdk/client-s3`).
2. Update references to `thumbnailUrl` and `audioUrl` returned by the upload endpoint to point to your CDN bucket URL instead of the local server prefix.
