import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Shield, Users, Search, Calendar, AlertCircle } from 'lucide-react';
import { getCityOptions } from '../services/api';
import type { CityOption, SearchFilters } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchForm, setSearchForm] = useState<SearchFilters>({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cityOptions = await getCityOptions();
        setCities(cityOptions);
      } catch (err) {
        console.error('Error loading cities:', err);
        setError('Error al cargar las ciudades disponibles');
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!searchForm.origin) {
      setError('Por favor selecciona una ciudad de origen');
      return false;
    }
    if (!searchForm.destination) {
      setError('Por favor selecciona una ciudad de destino');
      return false;
    }
    if (!searchForm.date) {
      setError('Por favor selecciona una fecha');
      return false;
    }
    if (searchForm.origin === searchForm.destination) {
      setError('El origen y destino no pueden ser iguales');
      return false;
    }
    
    // Check if date is not in the past
    const selectedDateString = searchForm.date;
    const todayString = new Date().toISOString().split('T')[0];
    
    if (selectedDateString < todayString) {
      setError('No puedes seleccionar una fecha anterior a hoy');
      return false;
    }

    return true;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Create URL with search parameters
    const searchParams = new URLSearchParams({
      origin: searchForm.origin,
      destination: searchForm.destination,
      date: searchForm.date
    });
    
    // Navigate to search page with parameters
    navigate(`/search?${searchParams.toString()}`);
  };
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Encuentra tu próximo viaje
              </h2>
              <p className="text-gray-600">
                Busca y reserva tu viaje en pocos clics
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Origin */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <MapPin className="inline h-4 w-4 mr-1 text-blue-600" />
                    Ciudad de Origen
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  {isLoadingCities ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                      <LoadingSpinner size="sm" inline />
                      <span className="ml-2 text-gray-500 text-sm">Cargando ciudades...</span>
                    </div>
                  ) : (
                    <select
                      value={searchForm.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                      required
                    >
                      <option value="">Seleccionar origen</option>
                      {cities.map((city) => (
                        <option 
                          key={city.value} 
                          value={city.value}
                          disabled={city.value === searchForm.destination}
                        >
                          {city.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <MapPin className="inline h-4 w-4 mr-1 text-blue-600" />
                    Ciudad de Destino
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  {isLoadingCities ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                      <LoadingSpinner size="sm" inline />
                      <span className="ml-2 text-gray-500 text-sm">Cargando ciudades...</span>
                    </div>
                  ) : (
                    <select
                      value={searchForm.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                      required
                    >
                      <option value="">Seleccionar destino</option>
                      {cities.map((city) => (
                        <option 
                          key={city.value} 
                          value={city.value}
                          disabled={city.value === searchForm.origin}
                        >
                          {city.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <Calendar className="inline h-4 w-4 mr-1 text-blue-600" />
                    Fecha de Viaje
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                    required
                  />
                </div>

                {/* Search Button */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-transparent">
                    Buscar
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoadingCities}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" inline />
                        <span className="ml-2">Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Buscar Viajes
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">
                      Consejos para tu búsqueda
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Los precios pueden variar según la fecha y disponibilidad</li>
                      <li>• Te recomendamos reservar con anticipación para mejores tarifas</li>
                      <li>• Verifica los horarios de salida antes de confirmar tu reserva</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
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