export const defaultFilters = {
  search: '',
  type: 'all',
  plan: 'all',
  tag: 'all',
  from: '',
  to: '',
};

// Narrows down a list of posts. The posts here are already the ones this
// user is allowed to see (the backend decided that), so filtering can
// safely happen in the browser.
export function applyFilters(posts, filters) {
  const search = filters.search.trim().toLowerCase();
  const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999`) : null;

  return posts.filter((post) => {
    if (filters.type !== 'all' && post.type !== filters.type) return false;
    if (filters.plan !== 'all' && post.plan !== filters.plan) return false;
    if (filters.tag !== 'all' && !post.tags.includes(filters.tag)) return false;

    if (search) {
      const text = `${post.title} ${post.preview}`.toLowerCase();
      if (!text.includes(search)) return false;
    }

    if (from || to) {
      if (!post.createdAt) return false;
      const created = new Date(post.createdAt);
      if (from && created < from) return false;
      if (to && created > to) return false;
    }

    return true;
  });
}

// Moves the dragged post into the place of the post it was dropped on
export function reorder(order, dragId, targetId) {
  const fromIndex = order.indexOf(dragId);
  const toIndex = order.indexOf(targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return order;

  const next = order.filter((id) => id !== dragId);
  next.splice(toIndex, 0, dragId);
  return next;
}

export function formatDate(iso) {
  if (!iso) return 'Unknown date';
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
