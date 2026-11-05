import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Features from '../components/Features.jsx';
import Articles from '../components/Articles.jsx';
import Tutorials from '../components/Tutorials.jsx';
import Work from '../components/Work.jsx';
import Journey from '../components/Journey.jsx';

function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = 'DEV@Deakin | Drishti Rani';
  }, []);

  // links like /#contact (for example from the footer) jump to that section
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash]);

  return (
    <>
      <Hero />
      <About />
      <Work />
      <Journey />
      <Features />
      <Articles />
      <Tutorials />
    </>
  );
}

export default Home;
