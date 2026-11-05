import { useState } from 'react';
import Modal from './Modal.jsx';
import { journeyPictures } from '../data/projects.js';

function Journey() {
  // the picture that is open in the big view (null means none)
  const [openPicture, setOpenPicture] = useState(null);

  return (
    <section className="journey" id="gallery">
      <h2 className="teal-heading">My photos</h2>

      <div className="journey-grid">
        {journeyPictures.map((picture) => (
          <button
            type="button"
            className="journey-item"
            key={picture.id}
            onClick={() => setOpenPicture(picture)}
          >
            <img src={picture.image} alt={picture.name} loading="lazy" />
            <span>{picture.name}</span>
          </button>
        ))}
      </div>

      {openPicture && (
        <Modal wide onClose={() => setOpenPicture(null)}>
          <img
            src={openPicture.image}
            alt={openPicture.name}
            className="journey-big"
          />
          <h3>{openPicture.name}</h3>
        </Modal>
      )}
    </section>
  );
}

export default Journey;
