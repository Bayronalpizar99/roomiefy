import React from 'react';
import './Navbar.css';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Link, useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon, SunIcon, ChatBubbleIcon, BellIcon,
  HomeIcon,
  AvatarIcon,
  PlusCircledIcon
} from '@radix-ui/react-icons';

import appLogo from '../assets/roomify2.png';
import { useAuth } from '../context/AuthContext';
import LoginButton from './LoginButton';

export const Navbar = ({ toggleTheme }) => { 
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <NavigationMenu.Root className="navbar">
      <div className="navbar-left">
        
        {/* --- INICIO DE LA MODIFICACIÓN --- */}
        <Link to="/" className="navbar-logo-link">
          <div className="navbar-logo">
            <img src={appLogo} alt="Logo de la aplicación" className="logo-image" />
          </div>
        </Link>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        <NavigationMenu.List className="navbar-links">
          <NavigationMenu.Item>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              <HomeIcon /> Propiedades
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link to="/roomies" className={location.pathname === '/roomies' ? 'active' : ''}>
              <AvatarIcon /> Roomies
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link to="/publicar" className={location.pathname === '/publicar' ? 'active' : ''}>
              <PlusCircledIcon /> Publicar
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
        <button className="icon-button" onClick={toggleTheme}><SunIcon /></button>
        <button className="icon-button"><ChatBubbleIcon /></button>
        <button className="icon-button">
            <BellIcon />
            <span className="notification-badge">3</span>
        </button>
        
        {user ? (
          <div className="user-menu">
            <img src={user.picture} alt="Avatar de usuario" className="user-avatar" />
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <button onClick={logout} className="dropdown-item">
                Salir
              </button>
            </div>
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </NavigationMenu.Root>
  );
};