# BookShelf: Learn & Apply Iteratively

You already know Java OOP well. This plan uses a **learn-then-apply** approach: learn a concept, immediately apply it in your project, then move to the next concept.

---

## Cycle 1: Learn JPA Entities → Create the Book Entity

**Learn:** JPA entities, @Entity annotation, @Id primary key, field mappings to database columns

**Apply:** Create the Book entity with title, author, and year fields
- File: [backend/src/main/java/com/bookshelf/bookshelf/Book.java](backend/src/main/java/com/bookshelf/bookshelf/Book.java)
- Add: `@Entity`, `@Id`, `@GeneratedValue`, fields for title, author, year
- Add: getters and setters (or use @Data from Lombok)

---

## Cycle 2: Learn JpaRepository → Create the Book Repository

**Learn:** Spring Data JPA, JpaRepository interface, how it provides CRUD methods (save, findById, findAll, delete)

**Apply:** Create the BookRepository interface that extends JpaRepository
- File: [backend/src/main/java/com/bookshelf/bookshelf/BookRepository.java](backend/src/main/java/com/bookshelf/bookshelf/BookRepository.java)
- Add: `public interface BookRepository extends JpaRepository<Book, Long>`

---

## Cycle 3: Learn Spring Boot Controllers & REST → Create the Basic Controller

**Learn:** @RestController, @RequestMapping, HTTP GET/POST/PUT/DELETE methods, @PathVariable, @RequestBody, ResponseEntity

**Apply:** Create the BookController with dependency injection
- File: [backend/src/main/java/com/bookshelf/bookshelf/BookController.java](backend/src/main/java/com/bookshelf/bookshelf/BookController.java)
- Add: `@RestController @RequestMapping("/api/books")` class
- Inject BookRepository: `@Autowired private BookRepository bookRepository;`

---

## Cycle 4: Learn HTTP GET Responses → Implement Get All Books

**Learn:** @GetMapping, how to return lists, 200 OK status, JSON serialization

**Apply:** Create GET /api/books endpoint
- Returns all books as JSON
- Uses `bookRepository.findAll()`
- Returns HTTP 200 with list of books

---

## Cycle 5: Learn Path Variables & 404s → Implement Get Book by ID

**Learn:** @PathVariable, Optional type, 404 Not Found responses, handling missing data

**Apply:** Create GET /api/books/{id} endpoint
- Returns a single book by ID
- Returns 404 if book doesn't exist
- Uses `bookRepository.findById(id)`

---

## Cycle 6: Learn Request Bodies & POST → Implement Create Book

**Learn:** @PostMapping, @RequestBody, JSON deserialization, 201 Created status, validating input

**Apply:** Create POST /api/books endpoint
- Accepts Book JSON in request body
- Saves to database via `bookRepository.save()`
- Returns 201 Created with the saved book
- Validates: title and author are required

---

## Cycle 7: Learn PUT for Updates → Implement Edit Book

**Learn:** @PutMapping, updating existing entities, merging changes, checking existence first

**Apply:** Create PUT /api/books/{id} endpoint
- Updates an existing book by ID
- Validates book exists (404 if not)
- Updates title, author, year from request body
- Saves changes to database
- Returns 200 OK with updated book

---

## Cycle 8: Learn DELETE → Implement Delete Book

**Learn:** @DeleteMapping, 204 No Content, deletion patterns

**Apply:** Create DELETE /api/books/{id} endpoint
- Deletes a book by ID
- Returns 404 if book doesn't exist
- Returns 204 No Content on success

---

## Cycle 9: Learn Validation → Add Data Validation

**Learn:** @NotBlank, @Min, @Max annotations, @Valid on controller method, BindingResult, validation messages

**Apply:** Add validation to Book entity and POST/PUT endpoints
- Title and author: @NotBlank (required, not empty)
- Year: @Min(1450), @Max(current year)
- Return 400 Bad Request with error messages if validation fails

---

## Cycle 10: Learn React Components & JSX → Create App.jsx Structure

**Learn:** React components, JSX syntax, functional components, component composition

**Apply:** Build the main App component
- File: [frontend/src/App.jsx](frontend/src/App.jsx)
- Set up basic structure with header and main sections
- Plan layout: BookList and BookForm side-by-side or stacked

---

## Cycle 11: Learn useState & State Management → Add Book List State

**Learn:** useState hook, state updates, re-rendering when state changes

**Apply:** Add state to App.jsx
- `const [books, setBooks] = useState([])`
- Prepare to hold the list of books from the backend

---

## Cycle 12: Learn fetch API → Create API Utility Module

**Learn:** fetch() function, async/await, JSON requests/responses, error handling, CORS

**Apply:** Create the API module
- File: [frontend/src/api.js](frontend/src/api.js)
- Create function: `fetchAllBooks()` - GET /api/books
- Create function: `createBook(book)` - POST /api/books
- Create function: `updateBook(id, book)` - PUT /api/books/{id}
- Create function: `deleteBook(id)` - DELETE /api/books/{id}
- Handle errors and return meaningful messages

---

## Cycle 13: Learn useEffect → Load Books on Mount

**Learn:** useEffect hook, dependency arrays, running code on component mount

**Apply:** Update App.jsx to fetch books when it loads
- Use `useEffect(() => { fetchAllBooks() }, [])`
- Call API and update books state with `setBooks()`
- Handle loading and error states

---

## Cycle 14: Learn Rendering Lists → Create BookList Component

**Learn:** map() to render lists, keys, conditional rendering, rendering arrays in JSX

**Apply:** Create BookList component
- File: [frontend/src/components/BookList.jsx](frontend/src/components/BookList.jsx)
- Display all books in a table or list
- Show: title, author, year
- Add buttons for Edit and Delete

---

## Cycle 15: Learn React Forms & Input Handling → Create BookForm Component

**Learn:** Controlled components, onChange handlers, form state with useState, form submission

**Apply:** Create BookForm component
- File: [frontend/src/components/BookForm.jsx](frontend/src/components/BookForm.jsx)
- Form fields: title, author, year
- useState for each field
- onChange handlers to update state
- onSubmit to capture form data

---

## Cycle 16: Learn Event Handlers & CRUD → Implement Add Book

**Learn:** onClick and onSubmit handlers, calling functions from props, async operations in handlers

**Apply:** Wire up the "Add Book" feature
- BookForm sends new book to App.jsx via callback
- App.jsx calls `createBook()` from api.js
- On success: refresh books list with `fetchAllBooks()`
- On error: show error message in UI

---

## Cycle 17: Learn Editing Data → Implement Edit Book

**Learn:** Identifying which item to edit, pre-filling form with existing data, conditional rendering (add vs. edit mode)

**Apply:** Add edit functionality
- BookList: onClick Edit button sets selected book in App.jsx state
- BookForm: if editing, pre-fill fields and change submit button to "Update"
- Call `updateBook(id, book)` instead of `createBook()`
- Refresh books list after success

---

## Cycle 18: Learn Deletion & Confirmation → Implement Delete Book

**Learn:** Confirmation patterns, async deletion, updating UI after deletion

**Apply:** Add delete functionality
- BookList: onClick Delete button
- Show confirmation: "Are you sure?" (browser confirm dialog)
- Call `deleteBook(id)` from api.js
- Remove book from UI (or refresh entire list)

---

## Cycle 19: Learn Error Handling in UI → Display Error Messages

**Learn:** Displaying errors to users, error state management, clearing errors after timeout

**Apply:** Add error display
- Add state in App.jsx: `const [error, setError] = useState(null)`
- Catch errors from all API calls
- Display error message in UI (red banner)
- Clear error after 5 seconds or on user action

---

## Cycle 20: Learn CORS → Enable Frontend-Backend Communication

**Learn:** What CORS is, Cross-Origin Resource Sharing, CORS headers, why browsers block requests, @CrossOrigin

**Apply:** Fix CORS in BookController
- Add `@CrossOrigin(origins = "http://localhost:5173")` on controller class
- Or configure globally in Spring Boot
- Test: frontend should now call backend without CORS errors

---

## Cycle 21: Learn Full-Stack Testing → Manual End-to-End Testing

**Learn:** How requests flow from UI → backend → database → back to UI, JSON serialization, HTTP cycle

**Apply:** Test the complete flow
- Start backend (Spring Boot)
- Start frontend (Vite)
- Add a book from the UI → verify it appears in the list
- Edit a book → verify changes
- Delete a book → verify it's removed
- Test invalid input (empty title, invalid year) → verify error message
- Test missing book ID → verify 404 handling

---

## ✅ Done!

You've learned each concept and immediately applied it. The full-stack bookshelf is complete.