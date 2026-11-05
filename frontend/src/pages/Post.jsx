import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import QuestionForm from '../components/QuestionForm.jsx';
import ArticleForm from '../components/ArticleForm.jsx';
import { validatePost, splitTags } from '../utils/postValidation.js';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = {
  plan: 'free',
  title: '',
  description: '',
  abstract: '',
  articleText: '',
  tags: '',
};

function Post() {
  const [postType, setPostType] = useState('question');
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'New Post | DEV@Deakin';
  }, []);

  // old error messages should not follow you to the other form
  useEffect(() => {
    setErrors({});
  }, [postType]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = validatePost(postType, form);
    setErrors(result.errors);

    if (!result.ok) {
      Swal.fire(
        'Error',
        'Your post could not be sent. Please fix the highlighted fields.',
        'error',
      );
      return;
    }

    // only send the fields that belong to the chosen post type
    const body =
      postType === 'question'
        ? {
            type: 'question',
            plan: form.plan,
            title: form.title,
            description: form.description,
            tags: splitTags(form.tags),
          }
        : {
            type: 'article',
            plan: form.plan,
            title: form.title,
            abstract: form.abstract,
            articleText: form.articleText,
            tags: splitTags(form.tags),
          };

    setSaving(true);
    try {
      await apiRequest('/api/posts', { method: 'POST', body, token });
      Swal.fire('Post sent', 'Your post has been saved.', 'success');
      setForm(emptyForm);
    } catch (err) {
      if (err.status === 401) {
        // the token expired, so the user has to log in again
        logout();
        await Swal.fire('Session expired', err.message, 'info');
        navigate('/login', { state: { from: '/post', needLogin: true } });
      } else {
        setErrors(err.errors || {});
        Swal.fire('Error', err.message, 'error');
      }
    }
    setSaving(false);
  };

  return (
    <section className="form-page post-page">
      <h1>New Post</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="post-type">
          <span>Select Post Type:</span>
          <label>
            <input
              type="radio"
              name="postType"
              value="question"
              checked={postType === 'question'}
              onChange={(e) => setPostType(e.target.value)}
            />
            Question
          </label>
          <label>
            <input
              type="radio"
              name="postType"
              value="article"
              checked={postType === 'article'}
              onChange={(e) => setPostType(e.target.value)}
            />
            Article
          </label>
        </div>

        <div className="post-type">
          <span>Select Post Plan:</span>
          <label>
            <input
              type="radio"
              name="plan"
              value="free"
              checked={form.plan === 'free'}
              onChange={handleChange}
            />
            Free
          </label>
          <label>
            <input
              type="radio"
              name="plan"
              value="paid"
              checked={form.plan === 'paid'}
              onChange={handleChange}
            />
            Paid
          </label>
        </div>
        {errors.plan && <p className="error">{errors.plan}</p>}
        <p className="field-hint">
          Free posts can be read by everyone. Paid posts can only be read by
          users on the Paid plan.
        </p>

        {postType === 'question' ? (
          <QuestionForm form={form} errors={errors} onChange={handleChange} />
        ) : (
          <ArticleForm form={form} errors={errors} onChange={handleChange} />
        )}

        <button type="submit" className="btn post-btn" disabled={saving}>
          {saving ? 'Posting...' : 'Post'}
        </button>
      </form>
    </section>
  );
}

export default Post;
