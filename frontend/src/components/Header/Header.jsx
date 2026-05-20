import { useState } from 'react';

import '../../static/css/header.css';
import '../../static/css/style.css';

import Logo from './Logo';
import Nav from './Nav';
import MobileMenu from './MobileMenu';

import Streak from '../profile/Streak';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header>
            <Logo />

            <Nav />

            <div className="header_right">
                <MobileMenu
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />

                <Streak />
            </div>
        </header>
    );
};

export default Header;