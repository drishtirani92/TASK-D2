import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import { signupSchema, getFieldErrors } from '../utils/validation.js';
import { apiRequest } from '../services/api.js';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function Signup() {
  const navigate = useNavigate();
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const result = signupSchema.safeParse(values);
    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      // the backend validates again, hashes the password and saves the user
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: result.data,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setErrors(err.errors || {});
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <section className="form-page">
      <h1>Create an account</h1>

      {formError && <p className="error">{formError}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="First name"
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          error={errors.firstName}
        />
        <FormField
          label="Last name"
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          error={errors.lastName}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </section>
  );
}

export default Signup;
