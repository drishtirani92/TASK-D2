import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import PostModal from '../components/PostModal.jsx';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  defaultFilters,
  applyFilters,
  reorder,
  formatDate,
} from '../utils/browseFilters.js';

function Browse() {
  const { token } = useAuth();

  // what the backend sent us
  const [posts, setPosts] = useState([]);
  const [viewer, setViewer] = useState({ plan: 'visitor' });
  const [paidHidden, setPaidHidden] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // what the user does on this page
  const [filters, setFilters] = useState(defaultFilters);
  const [hidden, setHidden] = useState([]); // hidden only here, never deleted
  const [order, setOrder] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  useEffect(() => {
    document.title = 'Browse Posts | DEV@Deakin';
  }, []);

  // Ask the backend for the posts this user is allowed to see.
  // This runs again when the user logs in or out, so the list always matches.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    apiRequest('/api/posts', { token })
      .then((data) => {
        if (cancelled) return;
        setPosts(data.posts);
        setViewer(data.viewer);
        setPaidHidden(data.paidHidden);
        setOrder(data.posts.map((post) => post.id));
        setHidden([]);
        setFilters(defaultFilters);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  const byId = useMemo(
    () => Object.fromEntries(posts.map((post) => [post.id, post])),
    [posts],
  );

  const allTags = useMemo(
    () => [...new Set(posts.flatMap((post) => post.tags))].sort(),
    [posts],
  );

  // posts in the user's order, without the hidden ones, then filtered
  const visible = useMemo(() => {
    const ordered = order
      .map((id) => byId[id])
      .filter((post) => post && !hidden.includes(post.id));
    return applyFilters(ordered, filters);
  }, [order, byId, hidden, filters]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const hidePost = (id) => setHidden((current) => [...current, id]);

  // back to how the page first loaded: no filters, nothing hidden, original order
  const resetAll = () => {
    setFilters(defaultFilters);
    setHidden([]);
    setOrder(posts.map((post) => post.id));
  };

  const closeModal = useCallback(() => setOpenId(null), []);

  const isPaidViewer = viewer.plan === 'paid';
  const filtersActive =
    JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  const badRange = filters.from && filters.to && filters.from > filters.to;

  return (
    <section className="browse">
      <h1>Browse Posts</h1>

      {/* tells the user which plan they are seen as */}
      <div className={`plan-banner viewer-${viewer.plan}`}>
        {viewer.plan === 'visitor' && (
          <p>
            You are browsing as a visitor, so you can see <strong>Free</strong>{' '}
            posts only. <Link to="/login">Log in</Link> to see more.
          </p>
        )}
        {viewer.plan === 'free' && (
          <p>
            You are on the <strong>Free</strong> plan, so you can see Free
            posts only.
          </p>
        )}
        {viewer.plan === 'paid' && (
          <p>
            You are on the <strong>Paid</strong> plan, so you can see all
            posts.
          </p>
        )}
        {!isPaidViewer && paidHidden > 0 && (
          <p>
            {paidHidden} Paid {paidHidden === 1 ? 'post is' : 'posts are'}{' '}
            hidden. <Link to="/pricing">Upgrade your plan</Link> to read{' '}
            {paidHidden === 1 ? 'it' : 'them'}.
          </p>
        )}
      </div>

      <div className="filters">
        <div className="field">
          <label htmlFor="f-search">Search</label>
          <input
            id="f-search"
            value={filters.search}
            placeholder="Title or text"
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="f-type">Type</label>
          <select
            id="f-type"
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
          >
            <option value="all">All types</option>
            <option value="article">Articles</option>
            <option value="question">Questions</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-plan">Plan</label>
          <select
            id="f-plan"
            value={filters.plan}
            onChange={(e) => updateFilter('plan', e.target.value)}
          >
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="paid" disabled={!isPaidViewer}>
              {isPaidViewer ? 'Paid' : 'Paid (upgrade to view)'}
            </option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-tag">Tag</label>
          <select
            id="f-tag"
            value={filters.tag}
            onChange={(e) => updateFilter('tag', e.target.value)}
          >
            <option value="all">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-from">Created from</label>
          <input
            id="f-from"
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="f-to">Created to</label>
          <input
            id="f-to"
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
          />
        </div>
      </div>
      {badRange && (
        <p className="error">The &quot;from&quot; date is after the &quot;to&quot; date.</p>
      )}

      <div className="browse-bar">
        <p>
          Showing {visible.length} of {posts.length}{' '}
          {posts.length === 1 ? 'post' : 'posts'}
          {hidden.length > 0 && ` (${hidden.length} hidden)`}
        </p>
        <button
          type="button"
          className="btn"
          onClick={resetAll}
          disabled={!filtersActive && hidden.length === 0}
        >
          Reset
        </button>
      </div>

      {loading && <p className="page-note">Loading posts...</p>}

      {error && (
        <div className="notice-box">
          <p className="error">{error}</p>
          <button
            type="button"
            className="btn"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="page-note">
          There are no posts to show yet. <Link to="/post">Write the first one.</Link>
        </p>
      )}

      {!loading && !error && posts.length > 0 && visible.length === 0 && (
        <p className="page-note">
          No posts match right now. Try changing the filters or press Reset.
        </p>
      )}

      {visible.length > 1 && (
        <p className="drag-note">Tip: drag a post up or down to put the list in your own order.</p>
      )}

      <div className="browse-list">
        {visible.map((post) => (
          <article
            key={post.id}
            className={`browse-card${dragId === post.id ? ' dragging' : ''}${
              overId === post.id && dragId !== post.id ? ' drag-over' : ''
            }`}
            draggable
            onClick={() => setOpenId(post.id)}
            onDragStart={(e) => {
              setDragId(post.id);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', post.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (overId !== post.id) setOverId(post.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) setOrder((current) => reorder(current, dragId, post.id));
              setDragId(null);
              setOverId(null);
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
          >
            <div className="browse-card-top">
              <span className="pill">
                {post.type === 'article' ? 'Article' : 'Question'}
              </span>
              <span className={`pill plan-${post.plan}`}>
                {post.plan === 'paid' ? 'Paid' : 'Free'}
              </span>
              <GripVertical size={16} className="grip" aria-hidden="true" />
            </div>

            <h2>{post.title}</h2>
            <p className="browse-preview">{post.preview}</p>

            <div className="browse-tags">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFilter('tag', tag);
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="browse-card-bottom">
              <span className="browse-meta">
                By {post.authorName} on {formatDate(post.createdAt)}
              </span>
              <span className="browse-actions">
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => setOpenId(post.id)}
                >
                  Read more
                </button>
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    hidePost(post.id);
                  }}
                >
                  Hide
                </button>
              </span>
            </div>
          </article>
        ))}
      </div>

      {openId && <PostModal postId={openId} onClose={closeModal} />}
    </section>
  );
}

export default Browse;
