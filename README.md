# Bookshelf

A full-stack app for cataloguing your books — add, edit, sort, and search a personal library, with cover art lookup built in.

- **Backend:** Java 17, Spring Boot, Spring Data JPA, H2 (file-based)
- **Frontend:** React 18, Vite

## Project structure

```
backend/    Spring Boot REST API
frontend/   React + Vite client
```

## Getting started

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`. Data is stored in an H2 database file under `~/.bookshelf/data/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` (Vite's default) and talks to the backend API.

## API

| Method | Endpoint          | Description         |
|--------|--------------------|----------------------|
| GET    | `/api/books`       | List all books       |
| GET    | `/api/books/{id}`  | Get a single book     |
| POST   | `/api/books`       | Create a book         |
| PUT    | `/api/books/{id}`  | Update a book          |
| DELETE | `/api/books/{id}`  | Delete a book           |

Book fields: `title`, `author`, `genre`, `year`, `coverUrl`, `foundOnline`, `wasEdited`. Titles are validated as required, unique per author/year, with a publication year between 1450 and 2026.
