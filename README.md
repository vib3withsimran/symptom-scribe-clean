# 🩺 Symptom Scribe — Smart Health & MedTech Platform

**Symptom Scribe** is a one-stop health tracking and wellness platform that helps users monitor their health goals, analyze symptoms, and receive intelligent insights — all in one place. It integrates **AI-driven recommendations**, **brain-enhancing games**, and **doctor consultation suggestions**, making healthcare more interactive and personalized.

**Website link** - https://symptom-scribe-clean.netlify.app/

---

## 🌟 Features

### 🧠 Health & Wellness

* Track vital health metrics like steps, hydration, and nutrition.
* Get personalized tips and activities to boost daily health.

### 🩻 Symptom Analysis

* Log your symptoms and get AI-assisted health insights.
* Receive doctor recommendations based on your reported symptoms.

### 🎮 Brain Games

* Fun, scientifically designed games to improve focus and memory.

### 💡 Health Facts

- "Did You Know?" pop-ups with fascinating human body facts and medical trivia.

### 👨‍⚕️ Doctor Consultation

* Smart system to suggest professional medical consultations based on patterns.

---

## ⚙️ Tech Stack

| Category            | Technologies                             |
| ------------------- | ---------------------------------------- |
| **Frontend**        | React + Vite + TypeScript                |
| **Styling**         | Tailwind CSS + ShadCN UI                 |
| **Backend / API**   | Supabase (for database & authentication) |
| **Deployment**      | Netlify                                  |
| **Version Control** | GitHub                                   |

---

## 🚀 How to Run Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/mohdmaazgani/symptom-scribe-clean.git
   ```

2. **Enter the project directory**

   ```bash
   cd symptom-scribe-clean
   ```

3. **Configure environment variables**

   Copy the example env file and add your Supabase browser credentials (Dashboard → Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

   Add only the `VITE_*` variables to `.env.local`:

   - `VITE_SUPABASE_URL` — used by the frontend to build the Supabase client and function URLs.
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — canonical browser key for authentication and API access.
   - `VITE_SUPABASE_ANON_KEY` — legacy fallback only for older local setups.

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. Open in your browser → [http://localhost:8080](http://localhost:8080)

### Supabase Edge Function Setup

The browser app and Supabase edge functions use different environment surfaces. Browser variables are loaded into Vite at build time and live in `.env.local`. Edge-function runtime secrets are read by deployed functions or by the Supabase CLI when you serve them locally — **never** place `SUPABASE_SERVICE_ROLE_KEY` or other edge secrets in `.env.local`.

**Edge function secrets** (configure via Supabase Dashboard or CLI, not in `.env.local`):

- `LOVABLE_API_KEY` — required by `supabase/functions/symptom-analyzer` to call the AI gateway.
- `UPSTASH_REDIS_REST_URL` — optional; enables distributed rate limiting when present.
- `UPSTASH_REDIS_REST_TOKEN` — optional; used with `UPSTASH_REDIS_REST_URL` for Upstash-backed rate limiting.
- `SUPABASE_URL` — required by `delete-user-account` auth-admin flows.
- `SUPABASE_ANON_KEY` — required by `delete-user-account` to validate the caller before using admin privileges.
- `SUPABASE_SERVICE_ROLE_KEY` — required by `delete-user-account` for server-side account deletion.

**Configure secrets on your Supabase project:**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set LOVABLE_API_KEY=<your-key>
supabase secrets set SUPABASE_URL=<your-url> SUPABASE_ANON_KEY=<your-anon-key> SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
# Optional rate limiting:
supabase secrets set UPSTASH_REDIS_REST_URL=<url> UPSTASH_REDIS_REST_TOKEN=<token>
```

**Serve edge functions locally (optional):**

```bash
supabase functions serve --env-file supabase/.env.local
```

Keep the service role key out of browser-loaded files and client-side code.

---

## 🧩 Folder Structure

```
symptom-scribe-clean/
├── public/              # Static files
├── src/
│   ├── components/      # UI and reusable components
│   ├── pages/           # App pages (Dashboard, Metrics, Chat, etc.)
│   ├── integrations/    # Supabase & other service integrations
│   ├── hooks/           # Custom React hooks
│   └── main.tsx         # App entry point
├── supabase/
│   ├── functions/       # Edge functions (symptom-analyzer, delete-user-account)
│   └── migrations/      # Database migrations
├── package.json
└── vite.config.ts
```

---

## 💡 Future Enhancements

* Integration with wearable devices (Fitbit, Apple Watch)
* AI-powered chat diagnosis
* Prescription reminders and progress dashboards
* Multi-user (doctor-patient) collaboration system

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open a PR or issue in this repository.

### PR Template

### 📌 Related Issue
```
Closes #<issue-number>
```
> Link the issue this PR resolves. PRs without a linked issue will not be reviewed.

---


### 📝 Description
```
What does this PR do?
Why is this change needed?
Keep it short and clear.
```


---

### 📸 Screenshots *(required for UI changes)*

| Before | After |
|--------|-------|
|        |       |

---

### ✅ Checklist
```
 [ ] Tested locally with `npm run dev`
 [ ] No unrelated files changed
 [ ] Follows existing code style (TypeScript + Tailwind)
 [ ] PR is linked to an open issue
 [ ] No console errors or warnings
 [ ] GSSoC issue was assigned to me before I started
```

---



## 🧑‍💻 Author

**Developed by:** [@mohdmaazgani](https://github.com/mohdmaazgani)
✨ Passionate about building smart, user-centric solutions.

---

## 📄 License

This project is licensed under the **MIT License** — free for use, modification, and distribution.
