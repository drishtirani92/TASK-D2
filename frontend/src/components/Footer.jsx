import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import SubscribeForm from './SubscribeForm.jsx';

// my contact details, change them here if they ever change
const EMAIL = 'drishti4762.se25@chitkara.edu.in';
const GITHUB = 'https://github.com/drishtirani92';
const LINKEDIN = 'https://www.linkedin.com/in/drishti-kathpal-0314b9421/';

function Footer() {
  return (
    <footer id="contact">
      <SubscribeForm />

      <div className="footer-main">
        <div className="footer-columns">
          <div>
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/post">Questions</Link>
            <Link to="/">Articles</Link>
            <Link to="/">Tutorials</Link>
          </div>

          <div>
            <h3>Support</h3>
            <a href="#">FAQs</a>
            <a href="#">Help</a>
            <a href={`mailto:${EMAIL}`}>Contact Us</a>
          </div>

          <div>
            <h3>Stay connected</h3>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>

            <div className="social">
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer"
                aria-label="My GitHub"
              >
                <Github />
              </a>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                aria-label="My LinkedIn"
              >
                <Linkedin />
              </a>
              <a href={`mailto:${EMAIL}`} aria-label="Email me">
                <Mail />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>DEV@Deakin 2026</p>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
          <a href="#">Code of Conduct</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
