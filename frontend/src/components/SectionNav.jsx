import { useEffect, useState } from 'react';

const links = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'gallery', label: 'Photos' },
  { id: 'contact', label: 'Contact' },
];

// The small menu under the header on the home page.
// It jumps to a section and highlights the one you are looking at.
function SectionNav() {
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      let current = '';
      links.forEach((link) => {
        const section = document.getElementById(link.id);
        if (section && window.scrollY >= section.offsetTop - 200) {
          current = link.id;
        }
      });
      setActive(current);
    };

    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="section-nav" aria-label="Sections of the home page">
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className={active === link.id ? 'active' : ''}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export default SectionNav;
