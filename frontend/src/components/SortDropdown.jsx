import { useEffect, useRef, useState } from 'react';

export default function SortDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  return (
    <div className="sort-dropdown" ref={ref}>
      <button
        type="button"
        className="sort-dropdown-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Sort by</span>
        <span className="sort-arrow">▾</span>
      </button>

      {open && (
        <ul className="sort-menu" role="menu">
          {options.map((opt) => (
            <li key={opt.value} role="menuitem">
              <button
                type="button"
                className={`sort-option ${value === opt.value ? 'is-active' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
