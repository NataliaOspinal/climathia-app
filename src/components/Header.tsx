import Logo from './Logo';
import Nav from './Nav';

const DASHBOARD_URL = "https://script.google.com/macros/s/AKfycbw52GW9o0vSR2pCpqQZKS4yccfe8pmUFt2h609pANGeWvpsvh_eMcD0wY3THDzlBATU/exec";

const Header = () => {

  return (
    <header className="bg-white text-black sticky top-0 flex-wrap z-20 mx-auto flex w-full items-center justify-between p-10">
        <Logo />
        <div className="flex items-center gap-4">
          <Nav />
          <a
            href={DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir Dashboard Ambiental en nueva pestaña"
            className="bg-transparent text-green border border-green px-4 py-2 rounded-md shadow-sm hover:bg-green/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 transition-colors duration-150 cursor-pointer"
          >
            Dashboard Ambiental
          </a>
        </div>
    </header>
  );
}

export default Header;