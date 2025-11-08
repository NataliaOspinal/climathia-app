import React, { useState, useEffect, useRef } from 'react';

const LeafCursor = () => {
  // 1. Estado para guardar el array de hojas
  const [leaves, setLeaves] = useState([]);
  
  // 2. Ref para el "throttle" (límite de tiempo)
  //    Esto evita que creemos 1000 hojas por segundo
  const throttleTimeout = useRef(null);

  // 3. Función para añadir una hoja nueva
  const addLeaf = (x, y) => {
    const newLeaf = {
      id: Date.now(), // ID único
      x, // Posición X
      y, // Posición Y
    };

    // Añade la nueva hoja al estado
    setLeaves((prevLeaves) => [...prevLeaves, newLeaf]);

    // 4. Temporizador de limpieza:
    //    Quitamos la hoja del DOM después de que termine
    //    su animación (2000ms = 2s)
    setTimeout(() => {
      setLeaves((prevLeaves) =>
        prevLeaves.filter((leaf) => leaf.id !== newLeaf.id)
      );
    }, 2000);
  };

  // 5. El "Escuchador" de movimiento
  const handleMouseMove = (e) => {
    // Si ya hay un "throttle" activo, no hagas nada
    if (throttleTimeout.current) {
      return;
    }

    // Activa el throttle por 50ms
    throttleTimeout.current = true;
    setTimeout(() => {
      throttleTimeout.current = null;
    }, 200); // Solo 1 hoja cada 50ms

    // Añade la hoja en la posición del cliente
    addLeaf(e.clientX, e.clientY);
  };

  // 6. Efecto para añadir y quitar el listener global
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);

    // Función de limpieza del efecto
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, []); // El array vacío [] asegura que esto solo se ejecute una vez

  // 7. Renderizamos las hojas
  return (
    <>
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="leaf"
          style={{
            top: `${leaf.y}px`,
            left: `${leaf.x}px`,
          }}
        >
          🍃 {/* ¡Una hojita! */}
        </span>
      ))}
    </>
  );
};

export default LeafCursor;