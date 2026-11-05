import { Star } from 'lucide-react';

const articles = [
  {
    id: 1,
    image: '/images/article-react.png',
    tag: 'React',
    name: 'Getting started with React',
    description: 'A first look at components and JSX.',
    rating: 5,
    author: 'Sarah Lee',
  },
  {
    id: 2,
    image: '/images/article-node.png',
    tag: 'NodeJS',
    name: 'What is NodeJS?',
    description: 'How NodeJS runs JavaScript on the server.',
    rating: 5,
    author: 'Tom Nguyen',
  },
  {
    id: 3,
    image: '/images/article-hooks.png',
    tag: 'React Hooks',
    name: 'Understanding React Hooks',
    description: 'Using useState and useEffect in components.',
    rating: 4.8,
    author: 'Priya Singh',
  },
];

function Articles() {
  return (
    <section className="featured">
      <h2>Featured Articles</h2>

      <div className="items">
        {articles.map((article) => (
          <div className="item" key={article.id}>
            <img src={article.image} alt={article.name} />
            <div className="item-text">
              <span className="tag">{article.tag}</span>
              <h3>{article.name}</h3>
              <p>{article.description}</p>
              <div className="item-footer">
                <span>
                  <Star size={16} fill="goldenrod" color="goldenrod" />{' '}
                  {article.rating}
                </span>
                <span>{article.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn see-all">
        See all articles
      </button>
    </section>
  );
}

export default Articles;
