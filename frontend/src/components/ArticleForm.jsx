function ArticleForm({ form, errors, onChange }) {
  return (
    <>
      <h2>What do you want to ask or share?</h2>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          placeholder="Enter a descriptive title"
          value={form.title}
          onChange={onChange}
        />
        {errors.title && <p className="error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="abstract">Abstract</label>
        <textarea
          id="abstract"
          name="abstract"
          rows="3"
          placeholder="Enter a 1 paragraph abstract"
          value={form.abstract}
          onChange={onChange}
        />
        {errors.abstract && <p className="error">{errors.abstract}</p>}
      </div>

      <div className="field">
        <label htmlFor="articleText">Article Text</label>
        <textarea
          id="articleText"
          name="articleText"
          rows="10"
          placeholder="Write your article here"
          value={form.articleText}
          onChange={onChange}
        />
        {errors.articleText && <p className="error">{errors.articleText}</p>}
      </div>

      <div className="field">
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          name="tags"
          placeholder="Please add up to 3 tags, e.g. Java, React"
          value={form.tags}
          onChange={onChange}
        />
        {errors.tags && <p className="error">{errors.tags}</p>}
      </div>
    </>
  );
}

export default ArticleForm;
