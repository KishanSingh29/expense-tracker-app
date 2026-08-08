# Expense Tracker App

AI-powered expense tracker built with React Native (Expo). It listens for incoming bank SMS in the background, automatically classifies and logs the transaction, and gives you a real-time view of your spending — no manual entry required.

---

## Screenshots

> Screenshots coming soon

---

## Tech Stack

- React Native (Expo)
- TypeScript
- Expo Router
- AsyncStorage
- Axios

---

## Features

- SMS auto-detection (bank messages)
- Real-time expense tracking
- Budget management with spending limits
- Income/Expense analytics
- Category breakdown
- Credit/Debit classification

---

## Screens

| Screen | Description |
|---|---|
| Home / Dashboard | Overview of recent transactions and spending |
| Wallet | Full transaction history |
| Statistics | Income/expense analytics with date filter |
| Budget | Set and track monthly spending limits |
| Profile | User account and settings |

---

## How to Run

```bash
npm install
npx expo start --dev-client
```

> Requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/) since this app uses native modules (SMS reading) that aren't supported in Expo Go.

---

## Backend Connection

This app talks to the [backend microservices](https://github.com/KishanSingh29/Expence) over REST, deployed on a GCP VM behind an Nginx reverse proxy that does path-based routing to each service.

1. Open [`services/api.ts`](services/api.ts)
2. Update `BASE_URL` to point at your Nginx host. Each service is reached via its path prefix:

```ts
const BASE_URL = "http://<your-nginx-host>";

const AUTH_BASE_URL = `${BASE_URL}/auth`;
const USER_BASE_URL = `${BASE_URL}/user`;
const EXPENSE_BASE_URL = `${BASE_URL}/expense`;
const DS_BASE_URL = `${BASE_URL}/ds`;
```

Backend repo: [Expense Tracker — Backend Microservices](https://github.com/KishanSingh29/Expence)

---

## Author
**Kishan Singh**
[GitHub](https://github.com/KishanSingh29)
