import { Banknote, CheckCircle, Clock, CreditCard, Download } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  tripInfo?: {
    tripDate: string;
    busNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime?: string;
    price: number;
  };
  passengerInfo: PassengerInfo;
  paymentData?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
    paymentMethod: 'credit_card' | 'debit_card' | 'transfer';
    transferReceiptName?: string;
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
    // Si tenemos tripInfo de la base de datos, usarlo preferentemente
    if (bookingData?.tripInfo) {
      return {
        ...bookingData,
        trip: {
          schedule: {
            route: {
              origin: bookingData.tripInfo.origin,
              destination: bookingData.tripInfo.destination,
              price: bookingData.tripInfo.price,
            },
            departureTime: bookingData.tripInfo.departureTime,
            arrivalTime: bookingData.tripInfo.arrivalTime || '',
          },
          bus: {
            number: bookingData.tripInfo.busNumber,
            type: "Ejecutivo", // Valor por defecto
          },
        },
      };
    }

    // Si hay datos del trip original, usarlos
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
          departureTime: "08:00",
          arrivalTime: "16:00",
        },
        bus: {
          number: "B001",
          type: "Ejecutivo",
        },
      },
    };
  }, [bookingData]);

  // Obtener la fecha del viaje de diferentes fuentes
  const tripDate = bookingData?.tripInfo?.tripDate || null;

  const handleDownloadInvoice = () => {
    if (bookingData.invoiceUrl) {
      window.open(bookingData.invoiceUrl, '_blank');
    }
  };

  if (!bookingData) {
    return <LoadingSpinner message="Cargando información de la reserva..." />;
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Fecha no disponible';
    
    // Si es solo una fecha (YYYY-MM-DD), procesarla directamente
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS son 0-indexados
      return date.toLocaleDateString("es-EC", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    
    // Si es una fecha completa con tiempo
    return new Date(dateString).toLocaleDateString("es-EC", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'Hora no disponible';
    
    // Si es solo hora (HH:MM), devolverla directamente
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    
    // Si es solo hora con segundos (HH:MM:SS), devolver solo HH:MM
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString.substring(0, 5); // Tomar solo HH:MM
    }
    
    // Si es una fecha completa con tiempo (ISO format)
    try {
      return new Date(timeString).toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error('Error formateando hora:', timeString, error);
      return timeString; // Devolver el string original si hay error
    }
  };

  const handleNewReservation = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

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
                  {bookingData.paymentData.paymentMethod === 'transfer' ? (
                    // Información para transferencia bancaria
                    <>
                      <div className="flex items-center mb-2">
                        <Banknote className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                        <span className="text-sm font-medium text-gray-700">
                          Transferencia Bancaria
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Estado: Pago procesado exitosamente
                      </p>
                      {bookingData.paymentData.transferReceiptName && (
                        <p className="text-sm text-gray-600">
                          Comprobante: {bookingData.paymentData.transferReceiptName}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Banco: Banco del Pacífico
                      </p>
                      <p className="text-sm text-gray-600">
                        Beneficiario: CooperBus S.A.
                      </p>
                    </>
                  ) : (
                    // Información para tarjeta de crédito/débito
                    <>
                      <div className="flex items-center mb-2">
                        <CreditCard className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                        <span className="text-sm font-medium text-gray-700">
                          {bookingData.paymentData.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
                        </span>
                      </div>
                      {bookingData.paymentData.cardNumber && (
                        <p className="text-sm text-gray-600">
                          Terminada en: ****{bookingData.paymentData.cardNumber.slice(-4)}
                        </p>
                      )}
                      {bookingData.paymentData.cardholderName && (
                        <p className="text-sm text-gray-600">
                          Titular: {bookingData.paymentData.cardholderName}
                        </p>
                      )}
                    </>
                  )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      {tripDate && displayData.trip?.schedule?.departureTime ? (
                        <>
                          {formatDate(tripDate)}
                          <br />
                          {formatTime(displayData.trip.schedule.departureTime)}
                        </>
                      ) : displayData.trip?.schedule?.departureTime ? (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <dl className="space-y-3 sm:space-y-4">
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
                    <dt className="text-lg sm:text-xl font-semibold text-gray-900">
                      Total pagado
                    </dt>
                    <dd className="text-right text-xl sm:text-2xl font-bold text-green-600">
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
                className="inline-flex justify-center items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 shadow-sm text-sm sm:text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
              >
                Nueva Reserva
              </button>
              {bookingData.invoiceUrl && (
                <button
                  onClick={handleDownloadInvoice}
                  className="inline-flex justify-center items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
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
