package com.bookshelf.bookshelf;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookRepository bookRepository;

    @Autowired
    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookRepository.findById(id);
        return book.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody Book book) {
        Map<String, String> errors = validateBook(book, null);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        Book saved = bookRepository.save(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody Book updatedBook) {
        Optional<Book> existing = bookRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Map<String, String> errors = validateBook(updatedBook, id);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        Book book = existing.get();
        book.setTitle(updatedBook.getTitle());
        book.setAuthor(updatedBook.getAuthor());
        book.setGenre(updatedBook.getGenre());
        book.setYear(updatedBook.getYear());
        book.setCoverUrl(updatedBook.getCoverUrl());
        book.setFoundOnline(Boolean.TRUE.equals(updatedBook.getFoundOnline()));
        book.setWasEdited(true);
        Book saved = bookRepository.save(book);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        if (bookRepository.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        bookRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, String> validateBook(Book book, Long currentId) {
        Map<String, String> errors = new HashMap<>();
        if (book.getTitle() == null || book.getTitle().isBlank()) {
            errors.put("title", "is required");
        }
        if (book.getAuthor() == null || book.getAuthor().isBlank()) {
            errors.put("author", "is required");
        }
        if (book.getYear() == null || book.getYear() < 1450 || book.getYear() > 2026) {
            errors.put("year", "must be between 1450 and 2026");
        }

        if (!errors.containsKey("title") && !errors.containsKey("author") && book.getYear() >= 1450 && book.getYear() <= 2026) {
            String normalizedTitle = normalizeText(book.getTitle());
            String normalizedAuthor = normalizeText(book.getAuthor());
            boolean duplicateExists = currentId == null
                    ? bookRepository.existsByTitleIgnoreCaseAndAuthorIgnoreCaseAndYear(normalizedTitle, normalizedAuthor, book.getYear())
                    : bookRepository.existsByTitleIgnoreCaseAndAuthorIgnoreCaseAndYearAndIdNot(normalizedTitle, normalizedAuthor, book.getYear(), currentId);
            if (duplicateExists) {
                errors.put("title", "already exists");
            }
        }
        return errors;
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}