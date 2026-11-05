import { Star } from 'lucide-react';

const tutorials = [
  {
    id: 1,
    image: '/images/tutorial-js.png',
    tag: 'JavaScript',
    name: 'JavaScript basics',
    description: 'Variables, functions and arrays in JS6.',
    rating: 5,
    username: 'jsmith',
  },
  {
    id: 2,
    image: '/images/tutorial-router.png',
    tag: 'React Router',
    name: 'Routing with React Router',
    description: 'Moving between pages in a React app.',
    rating: 5,
    username: 'anna_k',
  },
  {
    id: 3,
    image: '/images/tutorial-express.png',
    tag: 'Express',
    name: 'Building an Express server',
    description: 'Creating routes with Express.',
    rating: 4.9,
    username: 'mike22',
  },
];

function Tutorials() {
  return (
    <section className="featured">
      <h2>Featured Tutorials</h2>

      <div className="items">
        {tutorials.map((tutorial) => (
          <div className="item" key={tutorial.id}>
            <img src={tutorial.image} alt={tutorial.name} />
            <div className="item-text">
              <span className="tag">{tutorial.tag}</span>
              <h3>{tutorial.name}</h3>
              <p>{tutorial.description}</p>
              <div className="item-footer">
                <span>
                  <Star size={16} fill="goldenrod" color="goldenrod" />{' '}
                  {tutorial.rating}
                </span>
                <span>{tutorial.username}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn see-all">
        See all tutorials
      </button>
    </section>
  );
}

export default Tutorials;
