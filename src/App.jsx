import React from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import SobreSection from "../components/SobreSection";
import LeafCursor from "../components/LeafCursor";
import ObjetivoSection from "../components/ObjetivoSection.jsx";
import AccordionSection from "../components/AccordionSection.jsx";
import VariablesSection from "../components/VariablesSection.jsx";
import Footer from "../components/Footer.jsx";

const App = () =>{
  return (
    <>
    <div>
      <LeafCursor />
        <Header />
        <Banner />
        <SobreSection />
        <ObjetivoSection />
        <AccordionSection />
        <VariablesSection />
        <Footer />
    </div>
    </>
  )
}

export default App
