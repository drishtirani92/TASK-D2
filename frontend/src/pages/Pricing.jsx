import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Check, Minus } from 'lucide-react';
import UpgradeModal from '../components/UpgradeModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PRICES = {
  monthly: { amount: 9.99, text: '$9.99 / month' },
  yearly: { amount: 99, text: '$99 / year' },
};

// ✓ = included, a string = shown as text, false = not included
const features = [
  { name: 'Read free community posts', free: true, paid: true },
  { name: 'Read Paid-only articles', free: false, paid: true },
  { name: 'Posts per month', free: '5 posts', paid: 'Unlimited' },
  { name: 'Saved drafts', free: '1 draft', paid: 'Unlimited' },
  { name: 'Image upload size', free: '2 MB', paid: '20 MB' },
  { name: 'Paid badge next to your name', free: false, paid: true },
  { name: 'Ad-free reading', free: false, paid: true },
  { name: 'Support', free: 'Community forum', paid: 'Email, 24 hour reply' },
];

const faqs = [
  {
    q: 'Do I need an account to upgrade?',
    a: 'Yes. The plan is saved to your account, so you need to be logged in before you can upgrade.',
  },
  {
    q: 'Is this a real payment?',
    a: 'No. This website is a university project, so the payment form only checks your details and no money is taken. Your card details are never saved.',
  },
  {
    q: 'Can I switch back to the Free plan?',
    a: 'Not yet. Downgrading is not available in this version of DEV@Deakin.',
  },
];

function Cell({ value }) {
  if (value === true) return <Check size={18} aria-label="Included" />;
  if (value === false) return <Minus size={18} aria-label="Not included" />;
  return value;
}

function Pricing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const isPaid = user?.plan === 'paid';
  const price = PRICES[billingCycle];

  useEffect(() => {
    document.title = 'Pricing | DEV@Deakin';
  }, []);

  const handleUpgradeClick = async () => {
    // only logged-in users can start an upgrade
    if (!user) {
      const result = await Swal.fire({
        title: 'Please log in first',
        text: 'You need an account to upgrade your plan.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Go to login',
      });
      if (result.isConfirmed) {
        navigate('/login', { state: { from: '/pricing', needLogin: true } });
      }
      return;
    }
    setModalOpen(true);
  };

  return (
    <section className="pricing">
      <h1>Plans and pricing</h1>
      <p className="pricing-intro">
        Start for free, and upgrade whenever you want more from DEV@Deakin.
      </p>

      {isPaid && (
        <p className="plan-banner">
          You are on the <strong>Paid</strong> plan. Thanks for supporting
          DEV@Deakin!
        </p>
      )}

      <div className="billing-toggle" role="group" aria-label="Billing period">
        <button
          type="button"
          className={billingCycle === 'monthly' ? 'active' : ''}
          aria-pressed={billingCycle === 'monthly'}
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly
        </button>
        <button
          type="button"
          className={billingCycle === 'yearly' ? 'active' : ''}
          aria-pressed={billingCycle === 'yearly'}
          onClick={() => setBillingCycle('yearly')}
        >
          Yearly (save 17%)
        </button>
      </div>

      <div className="plans">
        <div className="plan-card">
          <h2>Free</h2>
          <p className="plan-price">
            $0 <span>forever</span>
          </p>
          <p className="plan-desc">For reading and getting started.</p>
          <ul>
            <li>Read free community posts</li>
            <li>5 posts per month</li>
            <li>2 MB image uploads</li>
            <li>Community forum support</li>
          </ul>
          {user && !isPaid ? (
            <p className="current-plan">Your current plan</p>
          ) : (
            <p className="current-plan hidden">&nbsp;</p>
          )}
        </div>

        <div className="plan-card featured-plan">
          <h2>Paid</h2>
          <p className="plan-price">
            ${price.amount}
            <span>{billingCycle === 'monthly' ? ' / month' : ' / year'}</span>
          </p>
          <p className="plan-desc">For people who post and write a lot.</p>
          <ul>
            <li>Everything in Free</li>
            <li>Read Paid-only articles</li>
            <li>Unlimited posts and drafts</li>
            <li>20 MB image uploads</li>
            <li>Paid badge and ad-free reading</li>
            <li>Email support with a 24 hour reply</li>
          </ul>

          {isPaid ? (
            <>
              <p className="current-plan">Your current plan</p>
              <button type="button" className="btn btn-dark" disabled>
                Upgrade Plan
              </button>
              <p className="plan-hint">You are already on the Paid plan.</p>
            </>
          ) : (
            <>
              <p className="current-plan hidden">&nbsp;</p>
              <button
                type="button"
                className="btn btn-dark"
                disabled={loading}
                onClick={handleUpgradeClick}
              >
                Upgrade Plan
              </button>
              {!user && !loading && (
                <p className="plan-hint">
                  <Link to="/login" state={{ from: '/pricing', needLogin: true }}>
                    Log in
                  </Link>{' '}
                  to upgrade your plan.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <h2 className="pricing-heading">Compare the plans</h2>
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.name}>
                <td>{f.name}</td>
                <td>
                  <Cell value={f.free} />
                </td>
                <td>
                  <Cell value={f.paid} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="pricing-heading">Questions</h2>
      <div className="faq">
        {faqs.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>

      {modalOpen && (
        <UpgradeModal
          billingCycle={billingCycle}
          priceText={price.text.replace(' / ', ' per ')}
          onClose={closeModal}
        />
      )}
    </section>
  );
}

export default Pricing;
