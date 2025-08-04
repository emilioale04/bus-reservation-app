import { AlertCircle, Calendar, CreditCard, Lock, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { sendInvoiceEmail, updateSeatsAsReserved } from '../services/emailService';
import {
  createInvoicesBucket,
  generateInvoicePDF,
  uploadInvoiceToStorage,
  type InvoiceData
} from '../services/invoiceService';

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

interface FormErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as BookingData;

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'credit_card' as 'credit_card' | 'debit_card'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    if (!bookingData) {
      navigate('/');
    }
  }, [bookingData, navigate]);

  // Formatear número de tarjeta con espacios
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Formatear fecha de expiración
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D+/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validación en tiempo real
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'cardNumber': {
        const cleanNumber = value.replace(/\s/g, '');
        if (!cleanNumber) return 'Número de tarjeta es requerido';
        if (cleanNumber.length < 16) return 'Número de tarjeta debe tener 16 dígitos';
        if (!/^\d+$/.test(cleanNumber)) return 'Solo se permiten números';
        break;
      }
      case 'expiryDate': {
        if (!value) return 'Fecha de expiración es requerida';
        if (!/^\d{2}\/\d{2}$/.test(value)) return 'Formato debe ser MM/YY';
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        const expMonth = parseInt(month);
        const expYear = parseInt(year);
        if (expMonth < 1 || expMonth > 12) return 'Mes inválido';
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          return 'Tarjeta expirada';
        }
        break;
      }
      case 'cvv': {
        if (!value) return 'CVV es requerido';
        if (!/^\d{3,4}$/.test(value)) return 'CVV debe tener 3 o 4 dígitos';
        break;
      }
      case 'cardholderName': {
        if (!value.trim()) return 'Nombre del titular es requerido';
        if (value.trim().length < 2) return 'Nombre muy corto';
        break;
      }
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar formateo específico
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }

    setPaymentData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Validación en tiempo real
    const error = validateField(name, formattedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    Object.keys(paymentData).forEach(key => {
      if (key !== 'paymentMethod') {
        const error = validateField(key, paymentData[key as keyof typeof paymentData]);
        if (error) newErrors[key as keyof FormErrors] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generar código de confirmación único
  const generateConfirmationCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    setShowAlert(false);

    try {
      console.log('🔄 Iniciando procesamiento lineal del pago...');
      
      // Paso 1: Validar pago (simulado)
      setProcessingStep('Validando método de pago...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Pago validado exitosamente');

      // Paso 2: Generar código de confirmación
      setProcessingStep('Generando confirmación...');
      const generatedCode = generateConfirmationCode();
      console.log('✅ Código de confirmación generado:', generatedCode);

      // Paso 3: Crear bucket si no existe
      setProcessingStep('Configurando sistema de archivos...');
      await createInvoicesBucket();
      console.log('✅ Sistema de archivos configurado');

      // Paso 4: Preparar datos para la factura
      setProcessingStep('Preparando factura...');
      const displayData = getDisplayData();
      
      const invoiceData: InvoiceData = {
        reservationId: `RES-${Date.now()}`,
        confirmationCode: generatedCode,
        passenger: {
          nombre: bookingData.passengerInfo.nombre,
          apellido: bookingData.passengerInfo.apellido,
          cedula: bookingData.passengerInfo.cedula,
          email: bookingData.passengerInfo.email,
          celular: bookingData.passengerInfo.celular,
          direccion: bookingData.passengerInfo.direccion
        },
        trip: {
          origin: displayData.trip?.schedule?.route?.origin || 'Origen',
          destination: displayData.trip?.schedule?.route?.destination || 'Destino',
          departureTime: displayData.trip?.schedule?.departureTime || new Date().toISOString(),
          busNumber: displayData.trip?.bus?.number || 'N/A',
          busType: displayData.trip?.bus?.type || 'N/A'
        },
        seats: bookingData.selectedSeats,
        total: bookingData.total,
        paymentMethod: paymentData.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito',
        cardLastFour: paymentData.cardNumber.slice(-4),
        createdAt: new Date().toISOString()
      };

      // Paso 5: Generar PDF
      setProcessingStep('Generando factura...');
      const pdfBuffer = generateInvoicePDF(invoiceData);
      console.log('✅ PDF generado exitosamente');

      // Paso 6: Subir factura a Storage
      setProcessingStep('Subiendo factura...');
      const invoiceUrl = await uploadInvoiceToStorage(pdfBuffer, invoiceData.reservationId);
      console.log('✅ Factura subida:', invoiceUrl);

      // Paso 7: Actualizar asientos como reservados
      setProcessingStep('Reservando asientos...');
      await updateSeatsAsReserved(bookingData.tripId, bookingData.selectedSeats);
      console.log('✅ Asientos reservados exitosamente');

      // Paso 8: Enviar email con factura
      setProcessingStep('Enviando confirmación por email...');
      const emailSent = await sendInvoiceEmail({
        to_email: bookingData.passengerInfo.email,
        to_name: `${bookingData.passengerInfo.nombre} ${bookingData.passengerInfo.apellido}`,
        confirmation_code: generatedCode,
        invoice_url: invoiceUrl,
        trip_origin: invoiceData.trip.origin,
        trip_destination: invoiceData.trip.destination,
        departure_date: new Date(invoiceData.trip.departureTime).toLocaleDateString('es-EC'),
        seat_numbers: bookingData.selectedSeats.join(', '),
        total_amount: bookingData.total.toFixed(2),
        passenger_name: `${bookingData.passengerInfo.nombre} ${bookingData.passengerInfo.apellido}`
      });

      console.log('✅ Proceso completado exitosamente');

      // Paso 9: Navegar a confirmación con todos los datos procesados
      navigate('/confirmation', {
        state: {
          ...bookingData,
          paymentData: {
            ...paymentData,
            cardNumber: `****-****-****-${paymentData.cardNumber.slice(-4)}`
          },
          confirmationCode: generatedCode,
          invoiceUrl: invoiceUrl,
          reservationId: invoiceData.reservationId,
          emailSent: emailSent,
          reservationComplete: true // Bandera para indicar que todo está completado
        }
      });

    } catch (error) {
      console.error('❌ Error en el procesamiento:', error);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayData = () => {
    if (bookingData?.trip) {
      return bookingData;
    }

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

  if (!bookingData) {
    return <LoadingSpinner message="Cargando información de reserva..." />;
  }

  const displayData = getDisplayData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-500 text-sm">
            <li>
              <Link to="/" className="hover:text-gray-700">
                Inicio
              </Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li>
              <Link to="/search" className="hover:text-gray-700">
                Búsqueda
              </Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li>
              <Link to={`/booking/${displayData.tripId}`} className="hover:text-gray-700">
                Selección de Asientos
              </Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li>
              <Link to={`/registro/${displayData.tripId}`} className="hover:text-gray-700">
                Registro
              </Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li aria-current="page" className="text-gray-900 font-medium">
              Pago
            </li>
          </ol>
        </nav>

        {showAlert && (
          <Alert 
            type="error" 
            message="Por favor, verifica todos los campos del formulario"
            onClose={() => setShowAlert(false)}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Pago */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <h1 className="text-2xl font-bold text-white" id="payment-title">
                  Información de Pago
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Método de Pago */}
                <fieldset className="mb-6">
                  <legend className="text-lg font-medium text-gray-900 mb-4">
                    Método de Pago
                  </legend>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentData.paymentMethod === 'credit_card'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        aria-describedby="credit-card-desc"
                      />
                      <CreditCard className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="ml-3 text-gray-900">Tarjeta de Crédito</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="debit_card"
                        checked={paymentData.paymentMethod === 'debit_card'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        aria-describedby="debit-card-desc"
                      />
                      <CreditCard className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="ml-3 text-gray-900">Tarjeta de Débito</span>
                    </label>
                  </div>
                </fieldset>

                {/* Información de la Tarjeta */}
                <fieldset>
                  <legend className="text-lg font-medium text-gray-900 mb-4">
                    Información de la Tarjeta
                  </legend>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Número de Tarjeta */}
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Tarjeta <span className="text-red-500" aria-label="requerido">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentData.cardNumber}
                          onChange={handleInputChange}
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          className={`block w-full px-3 py-2 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.cardNumber ? 'border-red-300 focus:border-red-300' : 'border-gray-300'
                          }`}
                          aria-invalid={errors.cardNumber ? 'true' : 'false'}
                          aria-describedby={errors.cardNumber ? 'card-number-error' : 'card-number-help'}
                          autoComplete="cc-number"
                        />
                        <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      {errors.cardNumber && (
                        <p id="card-number-error" className="mt-2 text-sm text-red-600" role="alert">
                          <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.cardNumber}
                        </p>
                      )}
                      <p id="card-number-help" className="mt-1 text-sm text-gray-500">
                        Ingresa los 16 dígitos de tu tarjeta
                      </p>
                    </div>

                    {/* Fecha de Expiración y CVV */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Expiración <span className="text-red-500" aria-label="requerido">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentData.expiryDate}
                            onChange={handleInputChange}
                            maxLength={5}
                            placeholder="MM/YY"
                            className={`block w-full px-3 py-2 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.expiryDate ? 'border-red-300 focus:border-red-300' : 'border-gray-300'
                            }`}
                            aria-invalid={errors.expiryDate ? 'true' : 'false'}
                            aria-describedby={errors.expiryDate ? 'expiry-error' : 'expiry-help'}
                            autoComplete="cc-exp"
                          />
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        {errors.expiryDate && (
                          <p id="expiry-error" className="mt-2 text-sm text-red-600" role="alert">
                            <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.expiryDate}
                          </p>
                        )}
                        <p id="expiry-help" className="mt-1 text-sm text-gray-500">
                          Formato: MM/YY
                        </p>
                      </div>

                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                          CVV <span className="text-red-500" aria-label="requerido">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handleInputChange}
                            maxLength={4}
                            placeholder="123"
                            className={`block w-full px-3 py-2 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.cvv ? 'border-red-300 focus:border-red-300' : 'border-gray-300'
                            }`}
                            aria-invalid={errors.cvv ? 'true' : 'false'}
                            aria-describedby={errors.cvv ? 'cvv-error' : 'cvv-help'}
                            autoComplete="cc-csc"
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        {errors.cvv && (
                          <p id="cvv-error" className="mt-2 text-sm text-red-600" role="alert">
                            <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.cvv}
                          </p>
                        )}
                        <p id="cvv-help" className="mt-1 text-sm text-gray-500">
                          Código de 3 o 4 dígitos en el reverso
                        </p>
                      </div>
                    </div>

                    {/* Nombre del Titular */}
                    <div>
                      <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Titular <span className="text-red-500" aria-label="requerido">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="cardholderName"
                          name="cardholderName"
                          value={paymentData.cardholderName}
                          onChange={handleInputChange}
                          placeholder="Nombre como aparece en la tarjeta"
                          className={`block w-full px-3 py-2 pl-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.cardholderName ? 'border-red-300 focus:border-red-300' : 'border-gray-300'
                          }`}
                          aria-invalid={errors.cardholderName ? 'true' : 'false'}
                          aria-describedby={errors.cardholderName ? 'cardholder-error' : 'cardholder-help'}
                          autoComplete="cc-name"
                        />
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      {errors.cardholderName && (
                        <p id="cardholder-error" className="mt-2 text-sm text-red-600" role="alert">
                          <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.cardholderName}
                        </p>
                      )}
                      <p id="cardholder-help" className="mt-1 text-sm text-gray-500">
                        Nombre exacto como aparece en tu tarjeta
                      </p>
                    </div>
                  </div>
                </fieldset>

                {/* Botones */}
                <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner message="" />
                        <span className="ml-2">{processingStep || 'Procesando...'}</span>
                      </>
                    ) : (
                      `Pagar $${displayData.total?.toFixed(2) || '0.00'}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Resumen de la Reserva */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden sticky top-8">
              <div className="bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Resumen de la Reserva
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ruta</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {displayData.trip?.schedule?.route?.origin} → {displayData.trip?.schedule?.route?.destination}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Asientos</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {displayData.selectedSeats?.join(', ')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pasajero</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {displayData.passengerInfo?.nombre} {displayData.passengerInfo?.apellido}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${displayData.total?.toFixed(2) || '0.00'}
                    </span>
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

export default PaymentPage;
