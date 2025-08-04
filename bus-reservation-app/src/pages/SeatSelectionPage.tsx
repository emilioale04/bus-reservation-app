import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Check,
  ChevronRight,
  Home,
} from "lucide-react";
import type { Trip } from "../types";
import {
  getTripById,
  getOccupiedSeats,
  formatDepartureTime,
} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

const SeatSelectionPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const TOTAL_SEATS = 40; // Capacidad total del bus según el PDF
  const MAX_SEATS_PER_RESERVATION = 5; // Límite razonable por reserva

  useEffect(() => {
    const loadTripData = async () => {
      if (!tripId) {
        setError("ID del viaje no válido");
        setIsLoading(false);
        return;
      }

      try {
        const [tripData, occupiedSeatsData] = await Promise.all([
          getTripById(tripId),
          getOccupiedSeats(tripId),
        ]);

        if (!tripData) {
          setError("No se encontró el viaje solicitado");
          return;
        }

        setTrip(tripData);
        setOccupiedSeats(occupiedSeatsData);
      } catch (err) {
        console.error("Error loading trip data:", err);
        setError("Error al cargar la información del viaje");
      } finally {
        setIsLoading(false);
      }
    };

    loadTripData();
  }, [tripId]);

  const handleSeatClick = (seatNumber: number) => {
    if (occupiedSeats.includes(seatNumber)) {
      return; // No permitir seleccionar asientos ocupados
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        // Deseleccionar asiento
        return prev.filter((seat) => seat !== seatNumber);
      } else {
        // Seleccionar asiento (con límite)
        if (prev.length >= MAX_SEATS_PER_RESERVATION) {
          setError(
            `No puede seleccionar más de ${MAX_SEATS_PER_RESERVATION} asientos`
          );
          return prev;
        }
        setError(null);
        return [...prev, seatNumber].sort((a, b) => a - b);
      }
    });
  };

  // Función para manejar navegación por teclado en el mapa de asientos
  const handleSeatKeyDown = (e: React.KeyboardEvent, seatNumber: number) => {
    const seatsPerRow = 4;
    let targetSeat: number | null = null;

    switch (e.key) {
      case " ":
      case "Enter":
        e.preventDefault();
        handleSeatClick(seatNumber);
        return;
      case "ArrowLeft":
        e.preventDefault();
        targetSeat = seatNumber > 1 ? seatNumber - 1 : null;
        break;
      case "ArrowRight":
        e.preventDefault();
        targetSeat = seatNumber < TOTAL_SEATS ? seatNumber + 1 : null;
        break;
      case "ArrowUp":
        e.preventDefault();
        targetSeat = seatNumber - seatsPerRow;
        if (targetSeat < 1) targetSeat = null;
        break;
      case "ArrowDown":
        e.preventDefault();
        targetSeat = seatNumber + seatsPerRow;
        if (targetSeat > TOTAL_SEATS) targetSeat = null;
        break;
      case "Home":
        e.preventDefault();
        targetSeat = 1;
        break;
      case "End":
        e.preventDefault();
        targetSeat = TOTAL_SEATS;
        break;
    }

    if (targetSeat) {
      const targetButton = document.querySelector(
        `button[data-seat-number="${targetSeat}"]`
      ) as HTMLButtonElement;
      if (targetButton) {
        // Actualizar tabIndex para todos los asientos
        document.querySelectorAll("[data-seat-number]").forEach((button) => {
          (button as HTMLButtonElement).tabIndex = -1;
        });
        targetButton.tabIndex = 0;
        targetButton.focus();
      }
    }
  };

  const getSeatStatus = (
    seatNumber: number
  ): "available" | "occupied" | "selected" => {
    if (occupiedSeats.includes(seatNumber)) return "occupied";
    if (selectedSeats.includes(seatNumber)) return "selected";
    return "available";
  };

  const getSeatClassName = (seatNumber: number): string => {
    const baseClasses =
      "w-10 h-10 rounded-md border-2 flex items-center justify-center text-sm font-medium cursor-pointer transition-colors";
    const status = getSeatStatus(seatNumber);

    switch (status) {
      case "occupied":
        return `${baseClasses} bg-gray-300 border-gray-400 text-gray-600 cursor-not-allowed`;
      case "selected":
        return `${baseClasses} bg-blue-600 border-blue-600 text-white hover:bg-blue-700`;
      case "available":
        return `${baseClasses} bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50`;
    }
  };

  const calculateTotal = (): number => {
    const pricePerSeat = trip?.schedule?.route?.price || 0;
    return selectedSeats.length * pricePerSeat;
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setError("Por favor, seleccione al menos un asiento");
      return;
    }

    // Navigate to registration page with booking data
    navigate(`/registro/${tripId}`, {
      state: {
        bookingData: {
          tripId,
          selectedSeats,
          total: calculateTotal(),
        },
      },
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-EC", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderSeatMap = () => {
    const seats = [];
    const seatsPerRow = 4; // 2 asientos + pasillo + 2 asientos
    const rows = Math.ceil(TOTAL_SEATS / seatsPerRow);

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];

      // Asientos del lado izquierdo (ventana + pasillo)
      const leftWindow = row * seatsPerRow + 1;
      const leftAisle = row * seatsPerRow + 2;

      // Asientos del lado derecho (pasillo + ventana)
      const rightAisle = row * seatsPerRow + 3;
      const rightWindow = row * seatsPerRow + 4;

      if (leftWindow <= TOTAL_SEATS) {
        rowSeats.push(
          <div key={`seat-${leftWindow}`} className="flex space-x-1">
            <button
              onClick={() => handleSeatClick(leftWindow)}
              onKeyDown={(e) => handleSeatKeyDown(e, leftWindow)}
              className={getSeatClassName(leftWindow)}
              disabled={occupiedSeats.includes(leftWindow)}
              aria-label={`Asiento ${leftWindow}, ${
                getSeatStatus(leftWindow) === "occupied"
                  ? "ocupado, no disponible"
                  : getSeatStatus(leftWindow) === "selected"
                  ? "seleccionado"
                  : "disponible para seleccionar"
              }`}
              aria-pressed={selectedSeats.includes(leftWindow)}
              role="checkbox"
              tabIndex={leftWindow === 1 ? 0 : -1}
              data-seat-number={leftWindow}
            >
              {leftWindow}
            </button>
            {leftAisle <= TOTAL_SEATS && (
              <button
                onClick={() => handleSeatClick(leftAisle)}
                onKeyDown={(e) => handleSeatKeyDown(e, leftAisle)}
                className={getSeatClassName(leftAisle)}
                disabled={occupiedSeats.includes(leftAisle)}
                aria-label={`Asiento ${leftAisle}, ${
                  getSeatStatus(leftAisle) === "occupied"
                    ? "ocupado, no disponible"
                    : getSeatStatus(leftAisle) === "selected"
                    ? "seleccionado"
                    : "disponible para seleccionar"
                }`}
                aria-pressed={selectedSeats.includes(leftAisle)}
                role="checkbox"
                tabIndex={-1}
                data-seat-number={leftAisle}
              >
                {leftAisle}
              </button>
            )}
          </div>
        );
      }

      // Pasillo central
      rowSeats.push(
        <div key={`aisle-${row}`} className="w-6" aria-hidden="true" />
      );

      // Asientos del lado derecho
      if (rightAisle <= TOTAL_SEATS) {
        rowSeats.push(
          <div key={`seat-right-${rightAisle}`} className="flex space-x-1">
            {rightAisle <= TOTAL_SEATS && (
              <button
                onClick={() => handleSeatClick(rightAisle)}
                onKeyDown={(e) => handleSeatKeyDown(e, rightAisle)}
                className={getSeatClassName(rightAisle)}
                disabled={occupiedSeats.includes(rightAisle)}
                aria-label={`Asiento ${rightAisle}, ${
                  getSeatStatus(rightAisle) === "occupied"
                    ? "ocupado, no disponible"
                    : getSeatStatus(rightAisle) === "selected"
                    ? "seleccionado"
                    : "disponible para seleccionar"
                }`}
                aria-pressed={selectedSeats.includes(rightAisle)}
                role="checkbox"
                tabIndex={-1}
                data-seat-number={rightAisle}
              >
                {rightAisle}
              </button>
            )}
            {rightWindow <= TOTAL_SEATS && (
              <button
                onClick={() => handleSeatClick(rightWindow)}
                onKeyDown={(e) => handleSeatKeyDown(e, rightWindow)}
                className={getSeatClassName(rightWindow)}
                disabled={occupiedSeats.includes(rightWindow)}
                aria-label={`Asiento ${rightWindow}, ${
                  getSeatStatus(rightWindow) === "occupied"
                    ? "ocupado, no disponible"
                    : getSeatStatus(rightWindow) === "selected"
                    ? "seleccionado"
                    : "disponible para seleccionar"
                }`}
                aria-pressed={selectedSeats.includes(rightWindow)}
                role="checkbox"
                tabIndex={-1}
                data-seat-number={rightWindow}
              >
                {rightWindow}
              </button>
            )}
          </div>
        );
      }

      seats.push(
        <div
          key={`row-${row}`}
          className="flex items-center justify-center space-x-2 mb-2"
        >
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando información del viaje..." />;
  }

  if (error && !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert type="error" title="Error" message={error} />
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/search")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Volver a Búsqueda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con Breadcrumbs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <nav aria-label="Navegación de páginas" className="mb-4">
            <ol
              className="flex items-center space-x-2 text-sm text-gray-500"
              role="list"
            >
              <li role="listitem">
                <Link
                  to="/search"
                  className="flex items-center hover:text-blue-600 transition-colors"
                  aria-label="Ir a la página de búsqueda"
                >
                  <Home className="h-4 w-4 mr-1" aria-hidden="true" />
                  Búsqueda
                </Link>
              </li>
              <li role="listitem" className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-2" aria-hidden="true" />
                <span aria-current="page" className="text-gray-900 font-medium">
                  Selección de Asientos
                </span>
              </li>
            </ol>
          </nav>

          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors mr-4"
              aria-label="Volver a la página anterior"
            >
              <ArrowLeft className="h-5 w-5 mr-1" aria-hidden="true" />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Selección de Asientos
              </h1>
              <p className="text-gray-600" role="doc-subtitle">
                Elige tus asientos preferidos para el viaje de{" "}
                <span className="font-medium">
                  {trip?.schedule?.route?.origin} →{" "}
                  {trip?.schedule?.route?.destination}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del viaje */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-lg shadow-md p-6 sticky top-4"
              role="complementary"
              aria-label="Información del viaje"
            >
              <h2
                className="text-lg font-semibold text-gray-900 mb-4"
                id="trip-info-title"
              >
                Información del Viaje
              </h2>

              {trip && (
                <div className="space-y-4" aria-labelledby="trip-info-title">
                  <div className="flex items-center">
                    <MapPin
                      className="h-5 w-5 text-gray-400 mr-3"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {trip.schedule?.route?.origin} →{" "}
                        {trip.schedule?.route?.destination}
                      </div>
                      <div className="text-sm text-gray-500">Ruta</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock
                      className="h-5 w-5 text-gray-400 mr-3"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDepartureTime(
                          trip.schedule?.departure_time || ""
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(trip.trip_date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users
                      className="h-5 w-5 text-gray-400 mr-3"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {trip.available_seats} disponibles
                      </div>
                      <div className="text-sm text-gray-500">
                        de {TOTAL_SEATS} asientos
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <DollarSign
                      className="h-5 w-5 text-gray-400 mr-3"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        ${trip.schedule?.route?.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">por asiento</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen de selección */}
              {selectedSeats.length > 0 && (
                <div
                  className="mt-6 pt-6 border-t border-gray-200"
                  role="region"
                  aria-label="Resumen de selección de asientos"
                >
                  <h3
                    className="text-md font-semibold text-gray-900 mb-3"
                    id="selection-summary"
                  >
                    Resumen de Selección
                  </h3>
                  <div
                    className="space-y-2"
                    aria-labelledby="selection-summary"
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asientos:</span>
                      <span
                        className="font-medium"
                        aria-label={`Asientos seleccionados: ${selectedSeats.join(
                          ", "
                        )}`}
                      >
                        {selectedSeats.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cantidad:</span>
                      <span
                        className="font-medium"
                        aria-label={`Cantidad de asientos: ${selectedSeats.length}`}
                      >
                        {selectedSeats.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span
                        className="text-green-600"
                        aria-label={`Total a pagar: ${calculateTotal().toFixed(
                          2
                        )} dólares`}
                      >
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
                    aria-describedby="continue-help"
                  >
                    <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                    Continuar con la Reserva
                  </button>
                  <div id="continue-help" className="sr-only">
                    Proceder al siguiente paso para completar la reserva de{" "}
                    {selectedSeats.length} asiento
                    {selectedSeats.length !== 1 ? "s" : ""} por un total de $
                    {calculateTotal().toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mapa de asientos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2
                  className="text-lg font-semibold text-gray-900"
                  id="seat-map-title"
                >
                  Selecciona tus Asientos
                </h2>
                <div
                  className="text-sm text-gray-600"
                  role="note"
                  aria-label="Límite de asientos"
                >
                  Máximo {MAX_SEATS_PER_RESERVATION} asientos por reserva
                </div>
              </div>

              {/* Instrucciones de accesibilidad */}
              <div
                className="mb-4 p-3 bg-blue-50 rounded-md"
                role="region"
                aria-label="Instrucciones de navegación"
              >
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Navegación por teclado:</span>{" "}
                  Usa las teclas de flecha para navegar entre asientos, Espacio
                  o Enter para seleccionar/deseleccionar.
                </p>
              </div>

              {/* Leyenda */}
              <div
                className="flex justify-center space-x-6 mb-8"
                role="legend"
                aria-label="Leyenda de estados de asientos"
              >
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2"
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm text-gray-600">Disponible</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded mr-2"
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm text-gray-600">Seleccionado</span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 bg-gray-300 border-2 border-gray-400 rounded mr-2"
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm text-gray-600">Ocupado</span>
                </div>
              </div>

              {/* Estado actual de selección */}
              {selectedSeats.length > 0 && (
                <div
                  className="mb-4 p-3 bg-green-50 rounded-md"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Asientos seleccionados:</span>{" "}
                    {selectedSeats.join(", ")}
                    {selectedSeats.length >= MAX_SEATS_PER_RESERVATION && (
                      <span className="block mt-1">
                        Has alcanzado el límite máximo de asientos.
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Frente del bus */}
              <div className="text-center mb-4">
                <div
                  className="inline-block bg-gray-800 text-white px-4 py-2 rounded-md text-sm"
                  role="img"
                  aria-label="Indicador del frente del autobús"
                >
                  Frente del Bus
                </div>
              </div>

              {/* Mapa de asientos */}
              <div
                className="max-w-sm mx-auto"
                role="application"
                aria-labelledby="seat-map-title"
                aria-describedby="seat-map-instructions"
              >
                <div id="seat-map-instructions" className="sr-only">
                  Mapa interactivo de asientos del autobús. Usa las teclas de
                  flecha para navegar y espacio para seleccionar asientos
                  disponibles.
                </div>
                {renderSeatMap()}
              </div>

              {/* Mostrar errores */}
              {error && (
                <div className="mt-6">
                  <Alert
                    type="error"
                    message={error}
                    onClose={() => setError(null)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
