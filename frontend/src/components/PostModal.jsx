import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/browseFilters.js';

// The larger view of one post. The whole text is only fetched when the user
// opens it, and the backend checks their plan again before sending it.
function PostModal({ postId, onClose }) {
  const { token } = useAuth();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const closeButton = useRef(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest(`/api/posts/${postId}`, { token })
      .then((data) => {
        if (!cancelled) setPost(data.post);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [postId, token]);

  useEffect(() => {
    closeButton.current?.focus();
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-label={post ? post.title : 'Post'}
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          ref={closeButton}
          onClick={onClose}
        >
          <X size={18} />
        </button>

        {!post && !error && <p>Loading post...</p>}

        {error && (
          <>
            <p className="error">{error.message}</p>
            {error.status === 403 && (
              <p>
                <Link to="/pricing" className="btn btn-dark">
                  See the Paid plan
                </Link>
              </p>
            )}
          </>
        )}

        {post && (
          <article className="full-post">
            <div className="browse-card-top">
              <span className="pill">
                {post.type === 'article' ? 'Article' : 'Question'}
              </span>
              <span className={`pill plan-${post.plan}`}>
                {post.plan === 'paid' ? 'Paid' : 'Free'}
              </span>
            </div>
            <h2>{post.title}</h2>
            <p className="browse-meta">
              By {post.authorName} on {formatDate(post.createdAt)}
            </p>

            {post.type === 'article' ? (
              <>
                <p className="full-abstract">{post.abstract}</p>
                <p className="full-text">{post.articleText}</p>
              </>
            ) : (
              <p className="full-text">{post.description}</p>
            )}

            <div className="browse-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

export default PostModal;
