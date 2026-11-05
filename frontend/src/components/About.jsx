const skills = [
  'Programming',
  'OOP',
  'Web Development',
  'Databases',
  'System Design',
  'IoT',
];

function About() {
  return (
    <section className="about" id="about">
      <img src="/profile.jpg" alt="Drishti" className="profile-photo" />
      <h2 className="profile-name">Drishti</h2>

      <p className="profile-line">
        I am a Software Engineering student who enjoys exploring how
        technology can be used to solve real-world problems.
      </p>
      <p className="about-more">
        Throughout my learning journey, I have explored programming,
        object-oriented development, databases, system analysis, web
        technologies and embedded systems. I enjoy learning by building and
        experimenting.
      </p>

      <div className="skills">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <hr className="divider" />
    </section>
  );
}

export default About;
