## Setup and Execution

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (Must be running locally on port 5432)

### 1. Database and Backend Setup
Open a terminal in the `backend` folder and run the following command:

```bash
npm install
```

Create a `.env` file in the backend folder and add your PostgreSQL URL:

```env
DATABASE_URL="postgresql://username:password@127.0.0.1:5432/incident_db?schema=public"
```

Create the database schema and start the backend:

```bash
npx prisma db push
npm run start:dev
```

*The backend will start running at [http://127.0.0.1:3000](http://127.0.0.1:3000).*

### 2. Frontend Setup
Open a terminal in the `frontend` folder and run the following command:

```bash
npm install
```

Create a `.env.local` file in the frontend folder with the following content:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3000
GEMINI_API_KEY=your_gemini_api_key
```

*Note: If you do not want to use Gemini, update the `src/app/api/ai/route.ts` file.*

Start the frontend:

```bash
npm run dev
```

*You can access the interface at http://localhost:3001.*

---

## Technologies Used

- **Frontend:** Next.js (React), Tailwind CSS, Axios
- **Backend:** NestJS (Node.js), TypeScript
- **Database & ORM:** PostgreSQL, Prisma
- **Real-Time Communication:** WebSocket (Socket.io)

---

## Architectural Approach

- **Monorepo-like Structure:** Both frontend and backend codes are kept in isolated folders (`/frontend` and `/backend`) under the same repository for ease of development and review.
- **RESTful API & Validation:** The backend architecture is designed according to REST standards, and all incoming requests are strictly validated using `ValidationPipe` and DTOs (Data Transfer Objects).
- **Secure Network Communication:** To prevent CORS and connection errors that may arise from DNS resolution differences (localhost IPv4/IPv6), inter-service communication is bound to the universal `127.0.0.1` IP.

---

## Assumptions Made

- Authentication is considered out of scope.
- It is assumed that the reviewing team has their own local PostgreSQL servers; therefore, the system is configured to connect to the database directly via `localhost/127.0.0.1`.

---

## Future Improvements (With More Time)

- **Comprehensive Testing:** Backend unit tests with Jest and frontend end-to-end (E2E) tests with Cypress/Playwright could be added.
- **Dockerization and CI/CD:** A fully-fledged `docker-compose` architecture could be established to guarantee 100% identical operation across all environments, along with automated build pipelines using GitHub Actions.
- **Advanced Filtering:** Multi-filtering and search capabilities based on date range, services, or severity could be added for incident logs on the frontend.