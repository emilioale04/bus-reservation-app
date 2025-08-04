import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

interface PassengerInfo {
  cedula: string;
  nombre: string;
  apellido: string;
  direccion: string;
  celular: string;
  email: string;
}

interface BookingData {
  tripId: string;
  selectedSeats: number[];
  total: number;
  trip?: {
    schedule?: {
      route?: {
        origin: string;
        destination: string;
        price: number;
      };
      departureTime: string;
      arrivalTime: string;
    };
    bus?: {
      number: string;
      type: string;
    };
  };
  passengerInfo: PassengerInfo;
}

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as BookingData;

  // Debug: Imprimir los datos recibidos
  console.log("Datos recibidos en ConfirmationPage:", bookingData);

  // Datos de respaldo para prueba si no hay datos reales
  const getDisplayData = () => {
    if (bookingData?.trip) {
      return bookingData;
    }

    // Datos de prueba si no hay datos reales
    return {
      ...bookingData,
      trip: {
        schedule: {
          route: {
            origin: "Quito",
            destination: "Guayaquil",
            price: 15.5,
          },
          departureTime: "2024-08-03T08:00:00",
          arrivalTime: "2024-08-03T16:00:00",
        },
        bus: {
          number: "B001",
          type: "Ejecutivo",
        },
      },
    };
  };

  const displayData = getDisplayData();

  React.useEffect(() => {
    if (!bookingData) {
      navigate("/");
    }
  }, [bookingData, navigate]);

  if (!bookingData) {
    return <LoadingSpinner message="Cargando información de la reserva..." />;
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-EC", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString("es-EC", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-500 text-sm">
            <li>
              <Link to="/" className="hover:text-gray-700">
                Inicio
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link to="/search" className="hover:text-gray-700">
                Búsqueda
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link
                to={`/booking/${displayData.tripId}`}
                className="hover:text-gray-700"
              >
                Selección de Asientos
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link
                to={`/registro/${displayData.tripId}`}
                className="hover:text-gray-700"
              >
                Registro
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li aria-current="page" className="text-gray-900 font-medium">
              Confirmación
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Encabezado */}
          <div className="bg-blue-600 px-6 py-4">
            <h1
              className="text-2xl font-bold text-white"
              id="confirmation-title"
            >
              Resumen de la Reserva
            </h1>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-8">
            {/* Detalles del Viaje */}
            <section aria-labelledby="trip-details-heading">
              <h2
                id="trip-details-heading"
                className="text-xl font-semibold text-gray-900 mb-4"
              >
                Detalles del Viaje
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Ruta</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {displayData.trip?.schedule?.route?.origin ||
                        "No disponible"}{" "}
                      →{" "}
                      {displayData.trip?.schedule?.route?.destination ||
                        "No disponible"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Fecha y Hora de Salida
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {displayData.trip?.schedule?.departureTime ? (
                        <>
                          {formatDate(displayData.trip.schedule.departureTime)}
                          <br />
                          {formatTime(displayData.trip.schedule.departureTime)}
                        </>
                      ) : (
                        "No disponible"
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Información del Bus
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      Bus Nº {displayData.trip?.bus?.number || "No disponible"}
                    </p>
                    <p className="text-md text-gray-600">
                      {displayData.trip?.bus?.type || "No disponible"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Asientos Reservados
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {displayData.selectedSeats
                        .sort((a, b) => a - b)
                        .join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: {displayData.selectedSeats.length} asiento(s)
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Información del Pasajero */}
            <section aria-labelledby="passenger-details-heading">
              <h2
                id="passenger-details-heading"
                className="text-xl font-semibold text-gray-900 mb-4"
              >
                Información del Pasajero
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Información Personal
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {displayData.passengerInfo.nombre}{" "}
                      {displayData.passengerInfo.apellido}
                    </p>
                    <p className="text-md text-gray-600">
                      Cédula: {displayData.passengerInfo.cedula}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Dirección
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {displayData.passengerInfo.direccion}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Información de Contacto
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {displayData.passengerInfo.celular}
                    </p>
                    <p className="text-md text-gray-600 break-all">
                      {displayData.passengerInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Resumen de Pago */}
            <section
              aria-labelledby="payment-details-heading"
              className="border-t pt-6"
            >
              <h2
                id="payment-details-heading"
                className="text-xl font-semibold text-gray-900 mb-4"
              >
                Resumen de Pago
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <dl className="space-y-4">
                  <div className="grid grid-cols-2 items-center py-3">
                    <dt className="text-gray-600">Precio por asiento</dt>
                    <dd className="text-right text-lg font-medium text-gray-900">
                      $
                      {displayData.trip?.schedule?.route?.price
                        ? displayData.trip.schedule.route.price.toFixed(2)
                        : "0.00"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 items-center py-3 border-t border-gray-200">
                    <dt className="text-gray-600">Cantidad de asientos</dt>
                    <dd className="text-right text-lg font-medium text-gray-900">
                      {displayData.selectedSeats.length}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 items-center py-4 border-t-2 border-gray-300">
                    <dt className="text-xl font-semibold text-gray-900">
                      Total a pagar
                    </dt>
                    <dd className="text-right text-2xl font-bold text-blue-600">
                      $
                      {displayData.total
                        ? displayData.total.toFixed(2)
                        : (
                            (displayData.trip?.schedule?.route?.price || 0) *
                            displayData.selectedSeats.length
                          ).toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t">
              <button
                onClick={() => navigate("/")}
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver al Inicio
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Imprimir Reserva
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
