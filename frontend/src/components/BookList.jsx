import { memo, useEffect, useMemo, useState } from 'react';
import { sfx } from '../sound';

const NETFLIX_GRADIENT = 'linear-gradient(135deg, #e50914 0%, #430d1b 48%, #0b0b10 100%)';

function posterGradient() {
  return NETFLIX_GRADIENT;
}

const Poster = memo(function Poster({ title, coverUrl }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);

    if (!coverUrl) return undefined;

    let cancelled = false;
    const img = new Image();
    img.decoding = 'async';
    img.src = coverUrl;
    img.onload = () => {
      if (cancelled) return;
      // ensure image actually has pixels
      if (img.naturalWidth && img.naturalHeight) setImageLoaded(true);
      else setImageFailed(true);
    };
    img.onerror = () => {
      if (cancelled) return;
      setImageFailed(true);
    };

    // if browser already has it cached and it's complete
    if (img.complete && img.naturalWidth) {
      setImageLoaded(true);
    }

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [coverUrl]);

  if (!coverUrl || imageFailed) {
    return (
      <div className="nf-poster nf-poster-nocover" style={{ background: posterGradient(title || '') }}>
        <span className="nf-poster-title">{title}</span>
        <span className="nf-poster-nocover-msg">No cover available for this book</span>
      </div>
    );
  }

  return (
    <div className={`nf-poster nf-poster-image ${imageLoaded ? 'is-loaded' : 'is-loading'}`}>
      <img
        src={coverUrl}
        alt={`Cover of ${title}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageFailed(true)}
      />
    </div>
  );
});

function BookList({ books, isLoading, isSearching, onEdit, onDelete }) {
  useEffect(() => {
    books.filter((book) => book.coverUrl).forEach((book) => {
      const image = new Image();
      image.src = book.coverUrl;
      image.decoding = 'async';
    });
  }, [books]);

  const placeholderCards = useMemo(() => Array.from({ length: 8 }, (_, index) => index), []);

  if (isLoading) {
    return (
      <div className="nf-grid">
        {placeholderCards.map((index) => (
          <div className="nf-card nf-card-skeleton" key={index}>
            <div className="nf-poster nf-poster-skeleton" />
            <div className="nf-card-body">
              <div className="nf-skeleton-line nf-skeleton-line-title" />
              <div className="nf-skeleton-line nf-skeleton-line-author" />
              <div className="nf-skeleton-line nf-skeleton-line-meta" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="nf-empty">
        {isSearching ? (
          <>
            <strong>No matches</strong>
            Try adjusting your search or filters.
          </>
        ) : (
          <>
            <strong>Your shelf is empty</strong>
            Add your first book below to start your list.
          </>
        )}
      </div>
    );
  }

  return (
    <div className="nf-grid">
      {books.map((book) => (
        <article className="nf-card" key={book.id}>
          <Poster title={book.title} coverUrl={book.coverUrl} />
          <div className="nf-card-body">
            <div className="nf-card-title-row">
              <p className="nf-card-title">{book.title}</p>
              {book.foundOnline && (
                <span className="nf-verified-badge" aria-label="Verified online book">✓</span>
              )}
            </div>
            <div className="nf-card-id">ID: {book.id}</div>
            <p className="nf-card-author">{book.author}</p>
            <div className="nf-card-meta">
              {book.genre ? <span className="nf-genre-pill">{book.genre}</span> : <span />}
              <span className="nf-year">{book.year}</span>
            </div>
            <div className="nf-card-buttons">
              <button type="button" className="nf-btn-edit" onClick={() => { sfx.click(); onEdit(book); }} aria-label={`Edit ${book.title}`}>
                Edit book
              </button>
              <button type="button" className="nf-btn-delete" onClick={() => { sfx.remove(); onDelete(book.id); }}>
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default BookList;
