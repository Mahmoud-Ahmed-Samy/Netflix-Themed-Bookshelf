package com.bookshelf.bookshelf;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByYear(int year);
    List<Book> findByAuthor(String author);
    List<Book> findByTitleContaining(String keyword);
    List<Book> findByYearGreaterThan(int year);
    List<Book> findByAuthorAndYear(String author, int year);
    Optional<Book> findByTitleIgnoreCaseAndAuthorIgnoreCaseAndYear(String title, String author, int year);
    boolean existsByTitleIgnoreCaseAndAuthorIgnoreCaseAndYear(String title, String author, int year);
    boolean existsByTitleIgnoreCaseAndAuthorIgnoreCaseAndYearAndIdNot(String title, String author, int year, Long id);
}   