import React from 'react';
import '../../assets/css/home.css'; // Styling for the home page
import Aboutus from './Aboutus';
import FeedbackForm from './FeedbackForm';

const Home = () => {
  return (
    <>
    <div className="home-container">
      <div className="background-overlay"></div>
      <section className="content">
        <h3>Welcome to CampusConnect</h3>
        <p>
          Campus Connect is your gateway to education, innovation, and collaboration. Join us to
          explore endless opportunities.
        </p>
      </section>
    </div>
    <Aboutus/>
    <FeedbackForm/>
  </>
  );
};

export default Home;
