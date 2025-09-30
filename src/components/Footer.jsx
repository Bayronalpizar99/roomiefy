import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import appLogo from '../assets/roomify2.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-column">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Explorar Propiedades</Link></li>
            <li><Link to="/roomies">Encontrar Roomies</Link></li>
            <li><Link to="/publicar">Publicar Propiedad</Link></li>
            <li><Link to="/favoritos">Mis Favoritos</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Sobre Roomiefy</h4>
          <ul>
            <li><Link to="/sobre-nosotros">Sobre Nosotros</Link></li>
            <li><Link to="/como-funciona">Cómo Funciona</Link></li>
            <li><Link to="/ayuda">Centro de Ayuda / FAQ</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Legal</h4>
          <ul>
            <li><Link to="/terminos">Términos y Condiciones</Link></li>
            <li><Link to="/privacidad">Política de Privacidad</Link></li>
            <li><Link to="/cookies">Política de Cookies</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Comunidad</h4>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={24} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter size={24} />
            </a>
          </div>
          <div className="newsletter">
            <p>¡Recibe las mejores ofertas!</p>
            <input type="email" placeholder="Tu correo electrónico" />
            <button>Suscribirse</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <img src={appLogo} alt="Roomiefy Logo" className="footer-logo" />
        <p>© {new Date().getFullYear()} Roomiefy. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;