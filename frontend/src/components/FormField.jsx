function FormField({ label, name, error, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} {...inputProps} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default FormField;
