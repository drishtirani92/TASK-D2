import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { X } from 'lucide-react';
import FormField from './FormField.jsx';
import {
  cardSchema,
  formatCardNumber,
  formatExpiry,
} from '../utils/paymentValidation.js';
import { getFieldErrors } from '../utils/validation.js';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyCard = { name: '', number: '', expiry: '', cvc: '' };

function UpgradeModal({ billingCycle, priceText, onClose }) {
  const { token, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [card, setCard] = useState(emptyCard);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstInput = useRef(null);

  // focus the first field, and let the Escape key close the popup
  useEffect(() => {
    firstInput.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleaned = value;
    if (name === 'number') cleaned = formatCardNumber(value);
    if (name === 'expiry') cleaned = formatExpiry(value);
    if (name === 'cvc') cleaned = value.replace(/\D/g, '').slice(0, 4);
    setCard({ ...card, [name]: cleaned });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const result = cardSchema.safeParse(card);
    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const data = await apiRequest('/api/plan/upgrade', {
        method: 'POST',
        token,
        body: { billingCycle, card: result.data },
      });
      updateUser(data.user); // header and pricing page now show the Paid plan
      onClose();
      Swal.fire('Payment successful', data.message, 'success');
    } catch (err) {
      if (err.status === 401) {
        logout();
        onClose();
        await Swal.fire('Session expired', err.message, 'info');
        navigate('/login', { state: { from: '/pricing', needLogin: true } });
        return;
      }
      setErrors(err.errors || {});
      setFormError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
      >
        <button
          type="button"
          className="modal-close"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <h2 id="upgrade-title">Upgrade to Paid</h2>
        <p className="modal-summary">
          Paid plan, billed {billingCycle}: <strong>{priceText}</strong>
        </p>
        <p className="demo-note">
          This is a demo, so no money is taken and your card details are not
          saved. You can use the test card 4242 4242 4242 4242 with any future
          expiry date.
        </p>

        {formError && <p className="error">{formError}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Name on card</label>
            <input
              id="name"
              name="name"
              autoComplete="cc-name"
              ref={firstInput}
              value={card.name}
              onChange={handleChange}
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          <FormField
            label="Card number"
            name="number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={card.number}
            onChange={handleChange}
            error={errors.number}
          />

          <div className="field-row">
            <FormField
              label="Expiry (MM/YY)"
              name="expiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={handleChange}
              error={errors.expiry}
            />
            <FormField
              label="CVC"
              name="cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={card.cvc}
              onChange={handleChange}
              error={errors.cvc}
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? 'Processing...' : `Pay ${priceText}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpgradeModal;
