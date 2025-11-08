// src/pages/HomePage.jsx
import React from 'react';

// Importa todas las secciones que construimos
import Banner from '../components/Banner.jsx';
import SobreSection from '../components/SobreSection.jsx';
import ObjetivosSection from '../components/ObjetivoSection.jsx';
import AccordionSection from '../components/AccordionSection.jsx';
import VariablesSection from '../components/VariablesSection.jsx';

const HomePage = () => {
  return (
    <>
      <Banner />
      <SobreSection />
      <ObjetivosSection />
      <AccordionSection />
      <VariablesSection />
    </>
  );
};

export default HomePage;