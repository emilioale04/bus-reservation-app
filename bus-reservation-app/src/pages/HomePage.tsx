import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Shield, Users } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Viaja Cómodo y Seguro
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Reserva tu asiento en los mejores autobuses del país. 
              Rutas directas, precios justos y la mejor experiencia de viaje por Ecuador.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/search" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Buscar Viajes
              </Link>
              <a 
                href="#features" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                Conocer Más
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Búsqueda Rápida */}
      <section className="py-12 -mt-10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
              Encuentra tu próximo viaje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Seleccionar ciudad</option>
                  <option>Quito</option>
                  <option>Guayaquil</option>
                  <option>Cuenca</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Seleccionar ciudad</option>
                  <option>Quito</option>
                  <option>Guayaquil</option>
                  <option>Cuenca</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex items-end">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir CooperBus?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Más de 20 años de experiencia nos respaldan como la mejor opción 
              para tus viajes por Ecuador
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rutas Directas</h3>
              <p className="text-gray-600">
                Conectamos las principales ciudades del país con rutas directas 
                y eficientes. Sin transbordos innecesarios.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Puntualidad</h3>
              <p className="text-gray-600">
                Horarios precisos y cumplimiento garantizado en todos nuestros viajes. 
                Tu tiempo es valioso para nosotros.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguridad</h3>
              <p className="text-gray-600">
                Vehículos modernos y conductores profesionales capacitados 
                para garantizar tu seguridad en cada viaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rutas Populares */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Rutas Populares
            </h2>
            <p className="text-gray-600">
              Las rutas más solicitadas por nuestros pasajeros
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                origin: 'Quito', 
                destination: 'Guayaquil', 
                price: 15.50, 
                duration: '8h',
                frequency: '6 salidas diarias' 
              },
              { 
                origin: 'Quito', 
                destination: 'Cuenca', 
                price: 12.00, 
                duration: '5h',
                frequency: '4 salidas diarias' 
              },
              { 
                origin: 'Guayaquil', 
                destination: 'Cuenca', 
                price: 10.00, 
                duration: '4h',
                frequency: '3 salidas diarias' 
              },
            ].map((route, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {route.origin} → {route.destination}
                    </h3>
                    <span className="text-2xl font-bold text-blue-600">
                      ${route.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duración: {route.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{route.frequency}</span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/search?origin=${route.origin}&destination=${route.destination}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Ver Horarios
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-blue-200">Años de experiencia</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Destinos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-200">Pasajeros satisfechos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99%</div>
              <div className="text-blue-200">Puntualidad</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Listo para tu próximo viaje?
          </h2>
          <p className="text-gray-600 mb-8">
            Reserva ahora y disfruta de la mejor experiencia de viaje por Ecuador
          </p>
          <Link 
            to="/search" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            Reservar Ahora
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;