import { getDb, FieldValue } from './firebase.js';

const posts = () => getDb().collection('posts');

export async function savePost(post) {
  const ref = await posts().add({
    ...post,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

// Firestore data -> plain object. Posts saved before D2 have no plan,
// so they count as free.
function toPost(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type,
    plan: data.plan || 'free',
    title: data.title,
    description: data.description,
    abstract: data.abstract,
    articleText: data.articleText,
    tags: data.tags || [],
    authorName: data.authorName || 'Unknown',
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
  };
}

// newest first. One orderBy on one field needs no extra Firestore index.
export async function listPosts(limit = 500) {
  const snapshot = await posts().orderBy('createdAt', 'desc').limit(limit).get();
  return snapshot.docs.map(toPost);
}

export async function getPost(id) {
  const doc = await posts().doc(id).get();
  return doc.exists ? toPost(doc) : null;
}
