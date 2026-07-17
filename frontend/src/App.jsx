import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchAllBooks, createBook, updateBook, deleteBook } from './api';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import { sfx } from './sound';
import { music } from './music';
import { findCoverUrl } from './coverSearch';
import './netflix.css';

function SoundIcon({ on, className }) {
  return (
    <span className={className} aria-hidden="true">
      {on ? '🔊' : '🔇'}
    </span>
  );
}

function App() {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [centerMessage, setCenterMessage] = useState(null);
  const [centerType, setCenterType] = useState(null); // 'success' | 'error'
  const [pendingDeleteBook, setPendingDeleteBook] = useState(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterYearFrom, setFilterYearFrom] = useState('1450');
  const [filterYearTo, setFilterYearTo] = useState('2026');
  const [filterExactYear, setFilterExactYear] = useState('');
  const [filterExactYearInput, setFilterExactYearInput] = useState('');
  const [filterTrusted, setFilterTrusted] = useState(false);
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const formSectionRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function enrichBooks(data) {
      return Promise.all(
        data.map(async (book) => {
          if (book.coverUrl) return book;
          try {
            const coverUrl = await findCoverUrl(book.title, book.author);
            return { ...book, coverUrl: coverUrl ?? null };
          } catch (_) {
            return { ...book, coverUrl: null };
          }
        })
      );
    }

    async function loadBooks() {
      try {
        setLoading(true);
        const data = await fetchAllBooks();
        if (cancelled) return;

        const booksWithCovers = await enrichBooks(data);

        if (cancelled) return;
        setBooks(booksWithCovers);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    // helper used after create/update/delete to re-enrich any missing covers
    window.__bookshelf_enrich_and_set = async (rawBooks) => {
      const enriched = await enrichBooks(rawBooks);
      setBooks(enriched);
    };

    loadBooks();
    return () => {
      cancelled = true;
      window.__bookshelf_enrich_and_set = undefined;
    };
  }, []);

  useEffect(() => {
    if (error) {
      sfx.error();
      const timer = window.setTimeout(() => setError(null), 4000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = window.setTimeout(() => setSuccess(null), 3200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [success]);

  // Centered notification helper — shows a message in the middle of the screen
  const showCentered = useCallback((msg, type = 'success', ms = 2200) => {
    setCenterMessage(msg);
    setCenterType(type);
    // also keep legacy banners in sync
    if (type === 'error') setError(msg);
    else setSuccess(msg);
    try {
      const t = window.setTimeout(() => {
        setCenterMessage(null);
        setCenterType(null);
      }, ms);
      return () => window.clearTimeout(t);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const startMusic = () => {
      music.start();
      setMusicOn(music.playing);
      window.removeEventListener('pointerdown', startMusic);
      window.removeEventListener('keydown', startMusic);
    };

    // Do not auto-start audio on mount (browsers block autoplay). Wait for
    // a user gesture to begin the AudioContext to avoid console warnings.
    setMusicOn(music.playing);
    window.addEventListener('pointerdown', startMusic, { once: true });
    window.addEventListener('keydown', startMusic, { once: true });

    return () => {
      window.removeEventListener('pointerdown', startMusic);
      window.removeEventListener('keydown', startMusic);
    };
  }, []);

  // Global runtime error surface: catch uncaught errors and unhandled promise rejections
  // and display them in the app UI so a black screen shows a helpful message.
  useEffect(() => {
    function onError(event) {
      try {
        showCentered('An unexpected error occurred. Please refresh the page.', 'error', 6000);
        // eslint-disable-next-line no-console
        console.error('Global error captured', event);
      } catch (e) {
        // ignore
      }
    }

    function onRejection(ev) {
      try {
        showCentered('Something went wrong. Please refresh the page.', 'error', 6000);
        // eslint-disable-next-line no-console
        console.error('Unhandled rejection', ev);
      } catch (e) {}
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  


  const years = useMemo(() => {
    return Array.from(new Set(books.filter((book) => book.year != null).map((book) => String(book.year)))).sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [books]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    const filtered = books.filter((book) => {
      const matchesQuery =
        !normalizedQuery ||
        (String(book.id || '').toLowerCase().includes(normalizedQuery)) ||
        (book.title || '').toLowerCase().includes(normalizedQuery) ||
        (book.author || '').toLowerCase().includes(normalizedQuery) ||
        (book.genre || '').toLowerCase().includes(normalizedQuery);
      const matchesYear = filterExactYear
        ? true
        : ((!filterYearFrom || (book.year != null && Number(book.year) >= Number(filterYearFrom))) &&
            (!filterYearTo || (book.year != null && Number(book.year) <= Number(filterYearTo))));
      const matchesExactYear =
        !filterExactYear || (book.year != null && Number(book.year) === Number(filterExactYear));
      const matchesTrusted = !filterTrusted || Boolean(book.foundOnline);
      return matchesQuery && matchesYear && matchesExactYear && matchesTrusted;
    });

    return filtered.slice().sort((a, b) => {
      const aValue = sortField === 'year'
        ? Number(a.year || 0)
        : sortField === 'added'
        ? Number(a.id || 0)
        : String(a[sortField] || '').toLowerCase();
      const bValue = sortField === 'year'
        ? Number(b.year || 0)
        : sortField === 'added'
        ? Number(b.id || 0)
        : String(b[sortField] || '').toLowerCase();
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [books, debouncedQuery, filterYearFrom, filterYearTo, filterExactYear, filterTrusted, sortField, sortDirection]);

  const hasYearFilter =
    (filterYearFrom && filterYearFrom !== '1450') ||
    (filterYearTo && filterYearTo !== '2026') ||
    Boolean(filterExactYear);

  const isFiltered = Boolean(
    debouncedQuery.trim() ||
    hasYearFilter ||
    filterTrusted
  );

  // Show the reset button only when actual filters are active (year range/exact year or trusted filter).
  // Do not show it for plain search queries entered in the main search bar.
  const showResetButton = Boolean(
    hasYearFilter ||
    filterTrusted
  );

  const resetFilters = useCallback(() => {
    setQuery('');
    setFilterYearFrom('1450');
    setFilterYearTo('2026');
    setFilterExactYear('');
    setFilterExactYearInput('');
    setFilterTrusted(false);
    setSortField('title');
    setSortDirection('asc');
  }, []);

  const handleToggleMusic = useCallback(() => {
    const nowPlaying = music.toggle();
    setMusicOn(nowPlaying);
  }, []);

  const scrollToForm = useCallback(() => {
    const element = formSectionRef.current;
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.pageYOffset - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const handleAddBookClick = useCallback(() => {
    setEditingBook(null);
    scrollToForm();
  }, [scrollToForm]);

  const handleAddBook = useCallback(async (newBook) => {
    try {
      await createBook(newBook);
      const updatedBooks = await fetchAllBooks();
      if (window.__bookshelf_enrich_and_set) {
        await window.__bookshelf_enrich_and_set(updatedBooks);
      } else {
        setBooks(updatedBooks);
      }
      sfx.success();
      showCentered(`"${newBook.title}" was added to your shelf.`, 'success');
    } catch (err) {
      showCentered(err.message || 'Unable to add book.', 'error');
    }
  }, []);

  // Debounce validation for exact-year input: wait 2s after typing stops,
  // then validate. If out of range, show message and clear the input so user can re-enter.
  useEffect(() => {
    if (!filterExactYearInput) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const parsed = Number(filterExactYearInput);
      if (!Number.isFinite(parsed) || parsed < 1450 || parsed > 2026) {
        // Inform the user and clear the input so they can retype.
        showCentered('Exact year must be a whole number between 1450 and 2026.', 'error', 2600);
        setFilterExactYearInput('');
        setFilterExactYear('');
      } else {
        setFilterExactYear(String(Math.trunc(parsed)));
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filterExactYearInput, showCentered]);

  const handleUpdateBook = useCallback(async (id, bookData) => {
    try {
      await updateBook(id, bookData);
      const updatedBooks = await fetchAllBooks();
      if (window.__bookshelf_enrich_and_set) {
        await window.__bookshelf_enrich_and_set(updatedBooks);
      } else {
        setBooks(updatedBooks);
      }
      setEditingBook(null);
      sfx.success();
      showCentered(`Changes to "${bookData.title}" were saved.`, 'success');
    } catch (err) {
      showCentered(err.message || 'Unable to update book.', 'error');
    }
  }, []);

  const handleDeleteClick = useCallback((id) => {
    const book = books.find((item) => item.id === id);
    setPendingDeleteBook(book || { id });
  }, [books]);

  const confirmDeleteBook = useCallback(async () => {
    if (!pendingDeleteBook?.id) return;

    try {
      await deleteBook(pendingDeleteBook.id);
      setEditingBook((current) => (current?.id === pendingDeleteBook?.id ? null : current));
      const updatedBooks = await fetchAllBooks();
      if (window.__bookshelf_enrich_and_set) {
        await window.__bookshelf_enrich_and_set(updatedBooks);
      } else {
        setBooks(updatedBooks);
      }
      showCentered(pendingDeleteBook.title ? `"${pendingDeleteBook.title}" was removed from your shelf.` : 'Book removed.', 'success');
    } catch (err) {
      showCentered(err.message || 'Unable to delete book.', 'error');
    } finally {
      setPendingDeleteBook(null);
    }
  }, [pendingDeleteBook, showCentered]);

  const cancelDeleteBook = useCallback(() => {
    setPendingDeleteBook(null);
  }, []);

  const handleEditClick = useCallback((book) => {
    setEditingBook(null);
    window.requestAnimationFrame(() => {
      setEditingBook(book);
      const element = formSectionRef.current;
      if (!element) return;

      const top = element.getBoundingClientRect().top + window.pageYOffset - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingBook(null);
  }, []);

  return (
    <div className="nf-app">
      <div className="nf-ambient" aria-hidden="true">
        <span className="nf-blob nf-blob-1" />
        <span className="nf-blob nf-blob-2" />
        <span className="nf-blob nf-blob-3" />
      </div>

      <header className="nf-header">
        <h1 className="nf-logo">BOOKSHELF</h1>
        <p className="nf-tagline">Unlimited books, wherever you are.</p>
        <button
          className="nf-music-toggle"
          onClick={handleToggleMusic}
          aria-pressed={musicOn}
          aria-label={musicOn ? 'Turn off sound' : 'Turn on sound'}
        >
          <SoundIcon on={musicOn} className="nf-music-icon" />
        </button>
      </header>

      <div className="nf-content">
        <div className="nf-toolbar">
          <div className="nf-toolbar-row">
            <div className="nf-search-wrap">
              <input
                className={`nf-search-input ${query ? 'nf-search-input--active' : ''}`}
                type="text"
                placeholder="Search id, title, author, or genre"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button className="nf-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                  ✕
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" className="nf-action-btn" onClick={handleAddBookClick} aria-label="Add a book">
                Add a Book
              </button>
            </div>
          </div>
        </div>

        <div className="nf-filter-panel">
          {!filterExactYear && (
            <div className="nf-filter-group nf-filter-year-range">
              <label className="nf-filter-label" htmlFor="filter-year-from">Year range</label>
              <div className="nf-year-range-inputs">
                <input
                  id="filter-year-from"
                  className="nf-filter-input"
                  type="number"
                  placeholder="From"
                  value={filterYearFrom}
                  onChange={(event) => setFilterYearFrom(event.target.value)}
                  min="1450"
                  max="2026"
                />
                <span className="nf-year-range-separator">—</span>
                <input
                  id="filter-year-to"
                  className="nf-filter-input"
                  type="number"
                  placeholder="To"
                  value={filterYearTo}
                  onChange={(event) => setFilterYearTo(event.target.value)}
                  min="1450"
                  max="2026"
                />
              </div>
            </div>
          )}
          <div className="nf-filter-group nf-filter-exact-year">
            <label className="nf-filter-label" htmlFor="filter-exact-year">Exact year</label>
            <input
              id="filter-exact-year"
              className="nf-filter-input"
              type="number"
              placeholder="Exact year"
              value={filterExactYearInput}
              onChange={(event) => setFilterExactYearInput(event.target.value)}
              min="1450"
              max="2026"
            />
          </div>
          <div className="nf-filter-group nf-filter-toggle">
            <label className="nf-filter-label" htmlFor="filter-trusted">Verified</label>
            <button
              id="filter-trusted"
              type="button"
              className={`nf-action-btn ${filterTrusted ? 'nf-action-btn--active' : ''}`}
              onClick={() => setFilterTrusted((current) => !current)}
            >
              {filterTrusted ? 'Verified only' : 'All books'}
            </button>
          </div>
          <div className="nf-filter-group">
            <label className="nf-filter-label" htmlFor="sort-field">Sort by</label>
            <select
              id="sort-field"
              className="nf-filter-select"
              value={sortField}
              onChange={(event) => setSortField(event.target.value)}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="genre">Genre</option>
              <option value="year">Year</option>
              <option value="added">Date added</option>
            </select>
          </div>
          <div className="nf-filter-group nf-filter-toggle nf-sort-order-group">
            <label className="nf-filter-label" htmlFor="sort-direction">Order</label>
            <button
              id="sort-direction"
              type="button"
              className={`nf-action-btn nf-sort-direction-btn ${sortDirection === 'desc' ? 'nf-action-btn--active' : ''}`}
              onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
            >
              {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
        {showResetButton && (
          <div className="nf-filter-actions">
            <button
              type="button"
              className="nf-filter-reset"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </div>
        )}

        <BookList
          books={filteredBooks}
          isLoading={loading}
          isSearching={isFiltered}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        <div ref={formSectionRef}>
          <BookForm
            editingBook={editingBook}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onCancelEdit={handleCancelEdit}
            onShowMessage={showCentered}
          />
        </div>
      </div>

      {(centerMessage || pendingDeleteBook) && (
        <div className="nf-centered-overlay" role="dialog" aria-live="assertive" aria-modal="true">
          <div className={`nf-centered-banner ${pendingDeleteBook ? 'nf-centered-banner--confirm' : centerType || 'success'}`}>
            {pendingDeleteBook ? (
              <div className="nf-confirm-delete">
                <div className="nf-confirm-delete-title">Delete this book?</div>
                <div className="nf-confirm-delete-copy">This action will remove {pendingDeleteBook.title || 'this book'} from your shelf.</div>
                <div className="nf-confirm-delete-actions">
                  <button type="button" className="nf-btn-secondary" onClick={cancelDeleteBook}>Cancel</button>
                  <button type="button" className="nf-btn-primary" onClick={confirmDeleteBook}>Delete</button>
                </div>
              </div>
            ) : (
              centerMessage
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
