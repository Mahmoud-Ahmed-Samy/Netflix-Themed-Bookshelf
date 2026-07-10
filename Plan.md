# BookShelf Learning Topics

You already know Java OOP well, so focus only on these topics:

## Backend topics
- Spring Boot project structure
- Controllers and REST endpoints
- HTTP methods: GET, POST, PUT, DELETE
- Request bodies and response bodies
- Status codes: 200, 201, 204, 400, 404
- Entities and tables
- Repositories and JpaRepository
- H2 database
- Saving and reading data from the database
- Validation annotations
- Handling invalid input
- Handling missing data

## Frontend topics
- React components
- useState
- Forms in React
- Rendering lists
- Event handlers
- fetch API
- Sending JSON to the backend
- Handling success and error responses
- Updating the UI after CRUD actions

## Full-stack topics
- How frontend and backend communicate
- How JSON flows between them
- How CORS works
- How CRUD works end to end

## Project-specific topics
- Book entity with title, author, and year
- CRUD endpoints for books
- Adding a book from the UI
- Listing books from the backend
- Editing a book
- Deleting a book
- Showing error messages

## Implementation plan

### 1. Backend first
- Create the Book entity in [backend/src/main/java/com/bookshelf/bookshelf/Book.java](backend/src/main/java/com/bookshelf/bookshelf/Book.java)
- Create the repository in [backend/src/main/java/com/bookshelf/bookshelf/BookRepository.java](backend/src/main/java/com/bookshelf/bookshelf/BookRepository.java)
- Create the controller in [backend/src/main/java/com/bookshelf/bookshelf/BookController.java](backend/src/main/java/com/bookshelf/bookshelf/BookController.java)

### 2. Backend endpoints
- Implement GET /api/books
- Implement GET /api/books/{id}
- Implement POST /api/books
- Implement PUT /api/books/{id}
- Implement DELETE /api/books/{id}

### 3. Backend validation
- Require title and author
- Validate year between 1450 and the current year
- Return 400 for bad input
- Return 404 for missing books

### 4. Frontend structure
- Build the main page in [frontend/src/App.jsx](frontend/src/App.jsx)
- Put API calls in [frontend/src/api.js](frontend/src/api.js)
- Create a form component in [frontend/src/components/BookForm.jsx](frontend/src/components/BookForm.jsx)
- Create a list component in [frontend/src/components/BookList.jsx](frontend/src/components/BookList.jsx)

### 5. Frontend features
- Show all books
- Add a new book
- Edit an existing book
- Delete a book
- Show friendly error messages

### 6. Connect everything
- Use fetch to call the backend
- Send JSON requests and read JSON responses
- Make sure the UI updates after each action
- Make sure CORS works between frontend and backend

### 7. Final checks
- Add a book and see it appear
- Edit a book
- Delete a book
- Test invalid input
- Test a missing book id