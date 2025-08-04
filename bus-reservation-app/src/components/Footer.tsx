import React from 'react';
import { Bus, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Bus className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">CooperBus</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Tu compañía de confianza para viajar por todo Ecuador. 
              Más de 20 años conectando ciudades con seguridad y comodidad.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white transition-colors">
                  Buscar Viajes
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-gray-400">+593 2 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-gray-400">info@cooperbus.ec</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  Av. Patria 123 y 10 de Agosto<br />
                  Quito, Ecuador
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="text-gray-400">24/7 Atención al cliente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 CooperBus. Todos los derechos reservados. | 
            <span className="ml-1">Desarrollado con ❤️ en Ecuador</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;