import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Users, Calendar } from 'lucide-react';
import type { SearchFilters, CityOption, Trip } from '../types';
import { getCityOptions, searchTrips, formatDepartureTime, formatDuration } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [cities, setCities] = useState<CityOption[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || new Date().toISOString().split('T')[0]
  });

  // Cargar ciudades disponibles al montar el componente
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

  // Realizar búsqueda automática si hay parámetros en la URL
  useEffect(() => {
    if (!isLoadingCities && filters.origin && filters.destination && filters.date) {
      handleSearch();
    }
  }, [isLoadingCities]);

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    if (!filters.origin || !filters.destination || !filters.date) {
      setError('Por favor, complete todos los campos de búsqueda');
      return;
    }

    if (filters.origin === filters.destination) {
      setError('El origen y destino no pueden ser iguales');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchTrips(filters);
      setTrips(results);
    } catch (err) {
      console.error('Error searching trips:', err);
      setError('Error al buscar viajes. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripSelect = (tripId: string) => {
    navigate(`/booking/${tripId}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Buscar Viajes
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra el viaje perfecto para tu destino. Horarios actualizados y reserva inmediata.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Origen
              </label>
              {isLoadingCities ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  Cargando ciudades...
                </div>
              ) : (
                <select
                  value={filters.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Seleccionar ciudad</option>
                  {cities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Destino
              </label>
              {isLoadingCities ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  Cargando ciudades...
                </div>
              ) : (
                <select
                  value={filters.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Seleccionar ciudad</option>
                  {cities.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading || isLoadingCities}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {/* Mostrar errores */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* Mostrar spinner de carga durante la búsqueda */}
        {isLoading && (
          <LoadingSpinner message="Buscando viajes disponibles..." />
        )}

        {/* Mostrar resultados */}
        {!isLoading && hasSearched && (
          <div>
            {trips.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Viajes Disponibles
                  </h2>
                  <p className="text-gray-600">
                    {trips.length} viaje{trips.length !== 1 ? 's' : ''} encontrado{trips.length !== 1 ? 's' : ''} para{' '}
                    <span className="font-medium">{filters.origin} → {filters.destination}</span>{' '}
                    el <span className="font-medium">{formatDate(filters.date)}</span>
                  </p>
                </div>

                <div className="grid gap-4">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {formatDepartureTime(trip.schedule?.departure_time || '')}
                                </div>
                                <div className="text-sm text-gray-500">Salida</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatDuration(trip.schedule?.route?.duration_minutes || 0)}
                                </div>
                                <div className="text-sm text-gray-500">Duración</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-green-600">
                                ${trip.schedule?.route?.price.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">por persona</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{trip.schedule?.route?.origin} → {trip.schedule?.route?.destination}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{trip.available_seats} asientos disponibles</span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:ml-6 lg:flex-shrink-0">
                          <button
                            onClick={() => handleTripSelect(trip.id)}
                            className="w-full lg:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                          >
                            Seleccionar Asientos
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron viajes
                </h3>
                <p className="text-gray-600 mb-6">
                  No hay viajes disponibles para{' '}
                  <span className="font-medium">{filters.origin} → {filters.destination}</span>{' '}
                  el <span className="font-medium">{formatDate(filters.date)}</span>
                </p>
                <p className="text-gray-500">
                  Intente con una fecha diferente o verifique las ciudades seleccionadas.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mensaje inicial cuando no se ha buscado nada */}
        {!hasSearched && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Busca tu viaje ideal
            </h3>
            <p className="text-gray-600">
              Selecciona tu origen, destino y fecha para encontrar los mejores viajes disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
