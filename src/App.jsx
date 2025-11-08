import React from "react";
import Header from "../components/Header";
import Banner from "../components/Banner";
import SobreSection from "../components/SobreSection";
import LeafCursor from "../components/LeafCursor";
import ObjetivoSection from "../components/ObjetivoSection.jsx";

const App = () =>{
  return (
    <>
    <div>
      <LeafCursor />
        <Header />
        <Banner />
        <SobreSection />
        <ObjetivoSection />
    </div>
    </>
  )
}

export default App
