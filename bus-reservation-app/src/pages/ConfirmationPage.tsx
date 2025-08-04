import { CheckCircle, Clock, CreditCard, Download } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  paymentData?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    paymentMethod: 'credit_card' | 'debit_card';
  };
  confirmationCode?: string;
  invoiceUrl?: string;
  reservationId?: string;
  emailSent?: boolean;
  reservationComplete?: boolean;
}

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as BookingData;

  // Si no hay datos o la reserva no está completa, redirigir
  useEffect(() => {
    if (!bookingData || !bookingData.reservationComplete) {
      navigate("/");
      return;
    }
  }, [bookingData, navigate]);

  // Memoizar displayData para evitar recreaciones innecesarias
  const displayData = useMemo(() => {
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
  }, [bookingData]);

  const handleDownloadInvoice = () => {
    if (bookingData.invoiceUrl) {
      window.open(bookingData.invoiceUrl, '_blank');
    }
  };

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

  const handleNewReservation = () => {
    navigate('/');
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
            <li>
              <Link to="/payment" className="hover:text-gray-700">
                Pago
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
          {/* Encabezado de Éxito */}
          <div className="bg-green-600 px-6 py-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-white mb-4" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-white" id="confirmation-title">
              ¡Reserva Confirmada!
            </h1>
            <p className="mt-2 text-green-100">
              Su pago ha sido procesado exitosamente
            </p>
            {bookingData.confirmationCode && (
              <div className="mt-4 inline-block bg-white rounded-lg px-4 py-2 shadow-lg border-2 border-green-400">
                <p className="text-sm text-gray-600">Código de Confirmación</p>
                <p className="text-xl font-bold text-green-700">{bookingData.confirmationCode}</p>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-8">
            {/* Estado del Pago */}
            <section className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Pago Procesado Exitosamente
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Su reserva ha sido confirmada y la factura ha sido enviada a su email.
                  </p>
                </div>
              </div>
            </section>

            {/* Información de Pago */}
            {bookingData.paymentData && (
              <section aria-labelledby="payment-info-heading">
                <h2 id="payment-info-heading" className="text-xl font-semibold text-gray-900 mb-4">
                  Información de Pago
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-700">
                      {bookingData.paymentData.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Terminada en: ****{bookingData.paymentData.cardNumber.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Titular: {bookingData.paymentData.cardholderName}
                  </p>
                </div>
              </section>
            )}

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
                      Total pagado
                    </dt>
                    <dd className="text-right text-2xl font-bold text-green-600">
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
                onClick={handleNewReservation}
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Nueva Reserva
              </button>
              {bookingData.invoiceUrl && (
                <button
                  onClick={handleDownloadInvoice}
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                  Descargar Factura
                </button>
              )}
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <Clock className="h-5 w-5 text-blue-400 mt-0.5 mr-3" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Información Importante
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Su factura electrónica ha sido enviada a {displayData.passengerInfo.email}</li>
                      <li>Presente su cédula y este código de confirmación en el terminal</li>
                      <li>Llegue al terminal al menos 30 minutos antes de la salida</li>
                      <li>Para cambios o cancelaciones, contacte nuestro servicio al cliente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
