const BASE_URL = 'http://localhost:8080/api/books';

// Claude - human-readable labels for the backend's field-level validation errors,
// e.g. { title: "must not be blank" } becomes "Title must not be blank."
const FIELD_LABELS = {
  title: 'Title',
  author: 'Author',
  genre: 'Genre',
  year: 'Year',
  coverUrl: 'Cover',
};

// Claude - turns whatever the backend sent back into one plain-English sentence
// instead of a raw JSON dump like the old JSON.stringify(errorData) did.
async function buildFriendlyError(response) {
  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    // no JSON body - fall through to the generic messages below
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (Object.values(data).some((value) => typeof value === 'string' && value.toLowerCase().includes('already exists'))) {
      return 'Book already exists.';
    }
    const messages = Object.entries(data).map(([field, msg]) => {
      const label = FIELD_LABELS[field] || field;
      return `${label} ${msg}`;
    });
    if (messages.length > 0) {
      return `Fix these details: ${messages.join(', ')}.`;
    }
  }

  if (response.status === 404) {
    return "We couldn't find that book. It may have been removed.";
  }
  if (response.status >= 500) {
    return "Server error. Try again in a moment.";
  }
  return "That didn't go through. Check the details and try again.";
}

// Claude - shared request helper: turns network failures and non-OK responses
// into friendly Error messages, instead of leaving every function to do it separately.
async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (networkError) {
    throw new Error("Can't reach the BookShelf server. Make sure the backend is running, then try again.");
  }

  if (!response.ok) {
    throw new Error(await buildFriendlyError(response));
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export async function fetchAllBooks() {
  try {
    return await request(BASE_URL);
  } catch (err) {
    if (err.message.startsWith("Can't reach")) throw err;
    throw new Error("Can't load books. Refresh and try again.");
  }
}

export async function createBook(book) {
  return request(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  });
}

export async function updateBook(id, book) {
  return request(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  });
}

export async function deleteBook(id) {
  return request(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}
