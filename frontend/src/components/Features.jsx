import { BookOpen, MessageCircle, Code } from 'lucide-react';

const features = [
  {
    id: 1,
    icon: <MessageCircle size={32} />,
    title: 'Ask questions',
    text: 'Stuck on a bug? Post a question and get help from other students.',
  },
  {
    id: 2,
    icon: <BookOpen size={32} />,
    title: 'Read articles',
    text: 'Short articles on the topics we cover in class.',
  },
  {
    id: 3,
    icon: <Code size={32} />,
    title: 'Follow tutorials',
    text: 'Step by step tutorials you can code along with.',
  },
];

function Features() {
  return (
    <section className="features">
      {features.map((f) => (
        <div className="feature" key={f.id}>
          {f.icon}
          <h3>{f.title}</h3>
          <p>{f.text}</p>
        </div>
      ))}
    </section>
  );
}

export default Features;
