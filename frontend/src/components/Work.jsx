import { useState } from 'react';
import Modal from './Modal.jsx';
import { projects } from '../data/projects.js';

function Work() {
  // which project is open in the popup (null means none)
  const [openProject, setOpenProject] = useState(null);

  return (
    <section className="work" id="work">
      <h2 className="teal-heading">Here&apos;s what I&apos;ve done so far</h2>

      <div className="work-list">
        {projects.map((project) => (
          <article className="work-row" key={project.id}>
            <img
              src={project.image}
              alt={project.title}
              className="work-thumb"
              loading="lazy"
            />

            <div className="work-text">
              <p className="work-category">{project.category}</p>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>

              <div className="work-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <button
                type="button"
                className="work-button"
                onClick={() => setOpenProject(project)}
              >
                Explore Project →
              </button>
            </div>
          </article>
        ))}
      </div>

      <hr className="divider" />

      {openProject && (
        <Modal onClose={() => setOpenProject(null)}>
          <h2 className="modal-title">{openProject.title}</h2>
          <p>{openProject.description}</p>
          <h3>Key Learning Areas</h3>
          <ul className="modal-list">
            {openProject.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </Modal>
      )}
    </section>
  );
}

export default Work;
