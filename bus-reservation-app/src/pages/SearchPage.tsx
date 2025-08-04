import {
    Calendar,
    MapPin,
    Search,
    Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import {
    formatDepartureTime,
    formatDuration,
    getCityOptions,
    searchTrips,
} from "../services/api";
import type { CityOption, SearchFilters, Trip } from "../types";

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Helper function to format date - fixed timezone issue
  const formatDate = (dateString: string): string => {
    // Parse the date string as local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [cities, setCities] = useState<CityOption[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    origin: searchParams.get("origin") || "",
    destination: searchParams.get("destination") || "",
    date: searchParams.get("date") || new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const loadCities = async () => {
      try {
        const cityOptions = await getCityOptions();
        setCities(cityOptions);
      } catch (err) {
        console.error("Error loading cities:", err);
        setError("Error al cargar las ciudades disponibles");
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  useEffect(() => {
    if (
      !isLoadingCities &&
      filters.origin &&
      filters.destination &&
      filters.date
    ) {
      handleSearch();
    }
  }, [isLoadingCities]);

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = async () => {
    if (!filters.origin || !filters.destination || !filters.date) {
      setError("Por favor, complete todos los campos de búsqueda");
      return;
    }

    if (filters.origin === filters.destination) {
      setError("El origen y destino no pueden ser iguales");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchTrips(filters);
      setTrips(results);
    } catch (err) {
      console.error("Error searching trips:", err);
      setError("Error al buscar viajes. Por favor, inténtelo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripSelect = (tripId: string) => {
    navigate(`/booking/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <nav aria-label="Navegación por migas de pan" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <a
                  href="/"
                  className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  aria-label="Ir a página de inicio"
                >
                  Inicio
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="text-gray-900 font-medium" aria-current="page">
                  Buscar Viajes
                </span>
              </li>
            </ol>
          </nav>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Buscar Viajes Disponibles
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra el viaje perfecto para tu destino. Horarios actualizados
              y reserva inmediata.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Detalles de Búsqueda
            </h2>
            <p className="text-gray-600 text-sm">
              Complete todos los campos para encontrar viajes disponibles
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            role="search"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="origin-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <MapPin className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  Origen{" "}
                  <span className="text-red-500" aria-label="campo requerido">
                    *
                  </span>
                </label>
                {isLoadingCities ? (
                  <div
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    aria-live="polite"
                  >
                    Cargando ciudades...
                  </div>
                ) : (
                  <select
                    id="origin-select"
                    value={filters.origin}
                    onChange={(e) =>
                      handleInputChange("origin", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                    required
                    aria-describedby="origin-help"
                    aria-invalid={hasSearched && !filters.origin}
                  >
                    <option value="">Seleccionar ciudad de origen</option>
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                )}
                <div id="origin-help" className="sr-only">
                  Seleccione la ciudad desde donde desea viajar
                </div>
              </div>

              <div>
                <label
                  htmlFor="destination-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <MapPin className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  Destino{" "}
                  <span className="text-red-500" aria-label="campo requerido">
                    *
                  </span>
                </label>
                {isLoadingCities ? (
                  <div
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    aria-live="polite"
                  >
                    Cargando ciudades...
                  </div>
                ) : (
                  <select
                    id="destination-select"
                    value={filters.destination}
                    onChange={(e) =>
                      handleInputChange("destination", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                    required
                    aria-describedby="destination-help"
                    aria-invalid={hasSearched && !filters.destination}
                  >
                    <option value="">Seleccionar ciudad de destino</option>
                    {cities
                      .filter((city) => city.value !== filters.origin)
                      .map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                  </select>
                )}
                <div id="destination-help" className="sr-only">
                  Seleccione la ciudad a donde desea viajar
                </div>
              </div>

              <div>
                <label
                  htmlFor="date-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Calendar
                    className="inline h-4 w-4 mr-1"
                    aria-hidden="true"
                  />
                  Fecha de Viaje{" "}
                  <span className="text-red-500" aria-label="campo requerido">
                    *
                  </span>
                </label>
                <input
                  id="date-input"
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  max={
                    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  } // 90 días adelante
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                  required
                  aria-describedby="date-help"
                  aria-invalid={hasSearched && !filters.date}
                />
                <div id="date-help" className="text-xs text-gray-500 mt-1">
                  Seleccione una fecha dentro de los próximos 90 días
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    isLoadingCities ||
                    !filters.origin ||
                    !filters.destination ||
                    !filters.date
                  }
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-describedby="search-button-help"
                >
                  <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                  {isLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Buscando...
                    </>
                  ) : (
                    "Buscar Viajes"
                  )}
                </button>
                <div id="search-button-help" className="sr-only">
                  Presione para buscar viajes disponibles con los criterios
                  seleccionados
                </div>
              </div>
            </div>
          </form>
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
                  <p className="text-gray-600" role="status" aria-live="polite">
                    {trips.length} viaje{trips.length !== 1 ? "s" : ""}{" "}
                    encontrado{trips.length !== 1 ? "s" : ""} para{" "}
                    <span className="font-medium">
                      {filters.origin} → {filters.destination}
                    </span>{" "}
                    el{" "}
                    <span className="font-medium">
                      {formatDate(filters.date)}
                    </span>
                  </p>
                </div>

                <div
                  className="grid gap-4"
                  role="list"
                  aria-label="Lista de viajes disponibles"
                >
                  {trips.map((trip, index) => (
                    <article
                      key={trip.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg focus-within:shadow-lg transition-shadow p-6"
                      role="listitem"
                      aria-labelledby={`trip-title-${index}`}
                      aria-describedby={`trip-details-${index}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {formatDepartureTime(
                                    trip.schedule?.departure_time || ""
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Salida
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatDuration(
                                    trip.schedule?.route?.duration_minutes || 0
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Duración
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-green-600">
                                ${trip.schedule?.route?.price.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                por persona
                              </div>
                            </div>
                          </div>

                          <div
                            id={`trip-details-${index}`}
                            className="flex items-center justify-between text-sm text-gray-600 mb-4"
                          >
                            <div className="flex items-center">
                              <MapPin
                                className="h-4 w-4 mr-1"
                                aria-hidden="true"
                              />
                              <span>
                                {trip.schedule?.route?.origin} →{" "}
                                {trip.schedule?.route?.destination}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Users
                                className="h-4 w-4 mr-1"
                                aria-hidden="true"
                              />
                              <span>
                                {trip.available_seats} asiento
                                {trip.available_seats !== 1 ? "s" : ""}{" "}
                                disponible
                                {trip.available_seats !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:ml-6 lg:flex-shrink-0">
                          <button
                            onClick={() => handleTripSelect(trip.id)}
                            className="w-full lg:w-auto bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                            aria-describedby={`trip-select-help-${index}`}
                          >
                            Seleccionar Asientos
                          </button>
                          <div
                            id={`trip-select-help-${index}`}
                            className="sr-only"
                          >
                            Seleccionar asientos para el viaje de{" "}
                            {formatDepartureTime(
                              trip.schedule?.departure_time || ""
                            )}
                            por ${trip.schedule?.route?.price.toFixed(2)}{" "}
                            dólares
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div
                className="text-center py-12"
                role="region"
                aria-label="No se encontraron resultados"
              >
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Search
                    className="h-10 w-10 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron viajes
                </h3>
                <p className="text-gray-600 mb-6">
                  No hay viajes disponibles para{" "}
                  <span className="font-medium">
                    {filters.origin} → {filters.destination}
                  </span>{" "}
                  el{" "}
                  <span className="font-medium">
                    {formatDate(filters.date)}
                  </span>
                </p>
                <div className="space-y-2 text-gray-500">
                  <p>• Intente con una fecha diferente</p>
                  <p>• Verifique las ciudades seleccionadas</p>
                  <p>• Consulte rutas alternativas</p>
                </div>
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
              Selecciona tu origen, destino y fecha para encontrar los mejores
              viajes disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
