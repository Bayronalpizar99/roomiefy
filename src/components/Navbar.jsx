import React from 'react';
import './Navbar.css';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { MagnifyingGlassIcon, SunIcon, ChatBubbleIcon, BellIcon, PersonIcon } from '@radix-ui/react-icons';

export const Navbar = () => {
  return (
    <NavigationMenu.Root className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">AppLogo</div>
        <NavigationMenu.List className="navbar-links">
          <NavigationMenu.Item>
            <NavigationMenu.Link href="#" className="active">Inicio</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="#">Explorar</NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link href="#">Crear</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </div>

      <div className="navbar-center">
        <div className="search-bar">
          <MagnifyingGlassIcon />
          <input type="text" placeholder="Buscar..." />
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-button"><SunIcon /></button>
        <button className="icon-button"><ChatBubbleIcon /></button>
        <button className="icon-button">
            <BellIcon />
            <span className="notification-badge">3</span>
        </button>
        <button className="icon-button"><PersonIcon /></button>
      </div>
    </NavigationMenu.Root>
  );
};
