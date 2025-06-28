import React from 'react';
import '../../assets/css/about.css';
import missionImage from '../../assets/images/mission.PNG'; // Ensure these images exist
import visionImage from '../../assets/images/vision.PNG';
import featuresImage from '../../assets/images/services.PNG';

const Aboutus = () => {
  return (
    <div className="about-container">
      <section className="hero-section">
        <h1 data-aos="fade-down">About CampusConnect</h1>
        <p data-aos="fade-up">
          Empowering students and educators to achieve excellence through seamless collaboration, 
          innovative tools, and unparalleled support.
        </p>
      </section>
      <div className="cards-container" id="cards-container">
        <div className="card" id="card" data-aos="fade-right">
          <img src={missionImage} alt="Our Mission" />
          <h2>Our Mission</h2>
          <p>
            Our mission is to bridge the gap between students, educators, and institutions by providing 
            a platform that fosters education, innovation, and a sense of community.
          </p>
        </div>
        <div className="card" id="card" data-aos="fade-left">
  <img src={featuresImage} alt="What We Offer" />
  <h2>What We Offer</h2>
  <ul>
    <li>
      <strong>Student Tools:</strong> Manage academics and participate in events.
    </li>
    <li>
      <strong>Educator Solutions:</strong> Streamline teaching and interactions.
    </li>
    <li>
      <strong>Community:</strong> Foster collaboration and connection.
    </li>
  </ul>
</div>

        <div className="card" id="card" data-aos="zoom-in">
          <img src={visionImage} alt="Our Vision" />
          <h2>Our Vision</h2>
          <p>
            To become the leading platform in empowering the education community by fostering innovation, 
            inclusivity, and collaboration across all aspects of campus life.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Aboutus;
