import { useEffect } from 'react';
import { X } from 'lucide-react';

// A popup box. Used for the project details and the journey pictures.
function Modal({ onClose, wide, children }) {
  // close the popup when Escape is pressed
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        // clicking the dark area outside the box closes it
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={wide ? 'modal modal-wide' : 'modal'}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
