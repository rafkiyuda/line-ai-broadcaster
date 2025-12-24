# LineBlasting (AI LINE Broadcaster) 🚀

A modern, AI-powered message broadcasting tool for LINE groups.
Built with **Next.js**, **Supabase**, **Prisma**, and **Google Gemini AI**.

![Project Screenshot](https://via.placeholder.com/800x400?text=LineBlasting+UI+Preview)

## ✨ Features

- **AI Paraphrasing**: Rewrite messages instantly using Gemini 2.5 Flash with different tones (Professional, Fun, Marketing, Empathetic).
- **Split View UI**: Compare your original draft with the AI suggestion side-by-side.
- **Smart Scheduling**: Schedule messages for the future (One-time, Daily, Weekly, Monthly).
  - *Note: Automated cron jobs require a pro hosting setup.*
- **Instant Send**: Broadcast messages immediately to your target group.
- **History Tracking**: Keep a log of all sent and scheduled messages.
- **Modern UI**: "Salted Egg Blue" theme with Glassmorphism and animated backgrounds.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Styling**: Tailwind CSS + Shadcn Concepts
- **Icons**: Lucide React

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js & npm installed.
- A LINE Official Account (Messaging API channel).
- A Supabase project.
- A Google Gemini API Key.

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgres://user:password@host:port/postgres?pgbouncer=true"
DIRECT_URL="postgres://user:password@host:port/postgres"

# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN="your_long_lived_access_token"
LINE_CHANNEL_SECRET="your_channel_secret"

# Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Usage & Testing

#### 🔗 Join the Test Group
To test this bot, you must be in the specific Allowed Group.
[**Join Here via LINE**](https://line.me/R/ti/g/KGfbjk5j77)

#### 🎯 Target ID
Use this Group ID for all your tests:
```
Ca6096c7ef8d43b7d9fc142fa479d2518
```

#### ✍️ AI Paraphrasing
1. Type a draft message.
2. Select a Tone (e.g., "Fun").
3. Click **Rewrite**.
4. View the result in the box below and click **"Use This"** if you like it.

## ⚠️ Limitations & Notes

- **Free Tier Limits**: This project uses free tiers for Vercel, Supabase, and Gemini. Please use sparingly regarding API calls.
- **Scheduler**: The background cron job for valid scheduling is recommended to be powered by **Cron-Job.org**.
  - **URL**: `https://your-vercel-app.vercel.app/api/cron`
  - **Header**: `Authorization: Bearer YOUR_CRON_SECRET`
  - Recommended interval: Every 1 minute (or 15 mins for testing).
- **Deployment**: If deploying to Vercel, ensure you add all Environment Variables in the Project Settings.

## 📜 License
MIT License
