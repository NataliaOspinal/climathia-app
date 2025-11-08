import {NavLink} from "react-router-dom";
import {Menu, X} from "lucide-react";
import { useState } from "react";

const NavLinks = () => {

  // Creamos una función que NavLink ejecutará por nosotros
  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) => {

    // 1. Clases base que SIEMPRE se aplican
    //    (He añadido padding/rounding/transition para que se vea bien)
    const baseClasses = "font-medium tracking-wide cursor-pointer px-3 py-2 rounded-md transition-colors duration-150";

    if (isActive) {
      // 2. Clases que se aplican SI EL LINK ESTÁ ACTIVO
      //    (Fondo sólido, texto blanco)
      return `${baseClasses} bg-green text-white`;
    } else {
      // 3. Clases para el link INACTIVO
      //    (Solo el hover, sin fondo inicial)
      return `${baseClasses} hover:bg-green hover:text-white`;
    }
  };

  return( 
    <>
      {/* 4. Pasamos la funcion al className */}
      <NavLink to="/" className={getNavLinkClasses}>
        Inicio
      </NavLink>
      <NavLink to="/datos" className={getNavLinkClasses}>
        Datos
      </NavLink>
    </>
  );
}

const Nav = () => {
    const[isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    }
    
  return( 
    <>
    <nav className="flex w-1/3 justify-end">
        <div className="hidden w-full justify-end gap-15 mr-5 md:flex">
            <NavLinks />
        </div>
        <div className="md:hidden">
            <button className="cursor-pointer" onClick={toggleNavbar}>{isOpen ? <X /> : <Menu />}</button>
        </div>
    </nav>
    {isOpen && (
        <div className="flex flex-col items-center basis-full">
            <NavLinks />
        </div>
    )}
    </>
  );
}

export default Nav;