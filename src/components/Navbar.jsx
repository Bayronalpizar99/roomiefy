import React from 'react';
import './Navbar.css';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Link, useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon, SunIcon, ChatBubbleIcon, BellIcon, PersonIcon,
  HomeIcon,
  AvatarIcon,
  PlusCircledIcon
} from '@radix-ui/react-icons';

import appLogo from '../assets/roomify2.png';

// 1. Recibe 'toggleTheme' como prop
export const Navbar = ({ toggleTheme }) => { 
  const location = useLocation();

  return (
    <NavigationMenu.Root className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img src={appLogo} alt="Logo de la aplicación" className="logo-image" />
        </div>

        <NavigationMenu.List className="navbar-links">
          <NavigationMenu.Item>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <HomeIcon />
              Propiedades
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link to="/roomies" className={location.pathname === '/roomies' ? 'active' : ''}>
              <AvatarIcon />
              Roomies
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link to="/publicar" className={location.pathname === '/publicar' ? 'active' : ''}>
              <PlusCircledIcon />
              Publicar
            </Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </div>

      <div className="navbar-center">
        <div className="search-bar">
          <MagnifyingGlassIcon />
          <input type="text" placeholder="Buscar por ubicación ..." />
        </div>
      </div>

      <div className="navbar-right">
        {/* 2. Añade el evento onClick al botón del sol */}
        <button className="icon-button" onClick={toggleTheme}>
          <SunIcon />
        </button>
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