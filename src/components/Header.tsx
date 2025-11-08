import Logo from './Logo';
import Nav from './Nav';

const Header = () => {
  return (
    <header className="bg-white text-black sticky top-0 flex-wrap z-20 mx-auto flex w-full items-center justify-between p-10">
        <Logo />
        <Nav />
    </header>
  );
}

export default Header;