import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, X, Menu } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Bus className="h-8 w-8 text-blue-600" aria-hidden="true" />
            <span className="text-xl font-bold text-gray-900">CooperBus</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Inicio
            </Link>
            <Link 
              to="/search" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Buscar Viajes
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Contacto
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              id="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div 
          ref={menuRef}
          id="mobile-menu"
          className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-white pt-2 pb-4 space-y-1 border-t`}
          role="menu" 
          aria-orientation="vertical" 
          aria-labelledby="mobile-menu-button"
        >
          <Link 
            to="/"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            role="menuitem"
          >
            Inicio
          </Link>
          <Link 
            to="/search"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            role="menuitem"
          >
            Buscar Viajes
          </Link>
          <Link 
            to="/contact"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            role="menuitem"
          >
            Contacto
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;