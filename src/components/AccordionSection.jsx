import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Plus, Minus } from 'lucide-react';
// Hook para la animación de scroll
import { useInView } from 'react-intersection-observer';

// --- DATOS DEL ACORDEÓN ---
const accordionItems = [
  {
    question: '¿Qué es RACiMo?',
    answer: 'RACiMo es una Red Ambiental Ciudadana de Monitoreo que busca mejorar el conocimiento y la calidad del aire a nivel local y regional en Santander Colombia. Utiliza sensores de bajo costo y la participación comunitaria para recopilar datos ambientales en tiempo real.',
  },
  {
    question: '¿Cómo funciona RACiMo?',
    answer: 'La red opera con estaciones meteorológicas y medidores de calidad del aire en varios municipios, y su misión principal es proporcionar datos ambientales de libre acceso a toda la comunidad.',
  },
  {
    question: '¿Cómo influye en este proyecto?',
    answer: 'Los datos de RACiMo son la base de este proyecto, utilizados en semilleros de investigación para fomentar la participación ciudadana y desarrollar proyectos científicos enfocados en el cambio climático y la calidad del aire. ',
  },
];

// Este componente maneja la lógica de UN solo ítem del acordeón
const SingleAccordionItem = ({ item, index, animationClass }) => {
  
  // Cada ítem tiene su propio useInView
  const { ref, inView } = useInView({
    triggerOnce: false, // Se anima mas de una vez
    threshold: 0.2,    // Requiere 20% visible
  });

  return (
    // El 'ref' y la clase de animación se aplican aquí
    <div
      ref={ref}
      className={`${inView ? animationClass : 'opacity-0'}`}
    >
      <Disclosure as="div" key={item.question}>
        {({ open }) => (
          <>
            <Disclosure.Button
              className={`
                flex w-full justify-between items-center 
                rounded-full bg-green px-6 py-4 
                text-left text-lg font-medium text-white
                hover:bg-opacity-90 focus:outline-none 
                ${index === 1 ? 'md:ml-20' : ''} /* El offset para el 2do item */
              `}
            >
              <span>{item.question}</span>
              <span className="shrink-0">
                {open ? <Minus className="h-6 w-6 cursor-pointer" /> : <Plus className="h-6 w-6 cursor-pointer" />}
              </span>
            </Disclosure.Button>

            <Transition
              enter="transition duration-300 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-150 ease-in"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel
                className={`
                  px-6 pt-4 pb-2 text-base text-gray-700
                  ${index === 1 ? 'md:ml-20' : ''} /* El offset para el panel */
                `}
              >
                {item.answer}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL ---
const AccordionSection = () => {

  // La sección principal también puede tener su propia animación
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section 
      ref={ref}
      className={`py-20 px-4 ${inView ? 'fade-in-top-normal' : 'opacity-0'}`}
    >
      <div className="container mx-auto max-w-3xl">

        <h2 className="text-4xl font-bold text-center text-black mb-12">
          Sobre RACiMo
        </h2>

        <div className="w-full space-y-4">
          
          {/* Mapeamos los datos y pasamos la clase de animación */}
          {accordionItems.map((item, index) => {
            
            // Lógica para elegir la animación
            let animationClass = '';
            if (index === 0 || index === 2) {
              // El 1ro y 3ro usan 'fade-in-right'
              animationClass = 'fade-in-right-normal';
            } else {
              // El 2do usa 'fade-in-left'
              animationClass = 'fade-in-left-normal';
            }

            return (
              <SingleAccordionItem 
                key={item.question}
                item={item} 
                index={index} 
                animationClass={animationClass} 
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AccordionSection;