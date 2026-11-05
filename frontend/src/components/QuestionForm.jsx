function QuestionForm({ form, errors, onChange }) {
  return (
    <>
      <h2>What do you want to ask or share?</h2>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          placeholder="Start your question with how, what, why, etc."
          value={form.title}
          onChange={onChange}
        />
        {errors.title && <p className="error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="description">Describe your problem</label>
        <textarea
          id="description"
          name="description"
          rows="8"
          placeholder="Describe your problem"
          value={form.description}
          onChange={onChange}
        />
        {errors.description && <p className="error">{errors.description}</p>}
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

export default QuestionForm;
