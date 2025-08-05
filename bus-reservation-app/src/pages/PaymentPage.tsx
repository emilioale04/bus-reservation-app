import { AlertCircle, Banknote, Calendar, CreditCard, Lock, Upload, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Breadcrumb from '../components/Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import Tooltip from '../components/Tooltip';
import { getCompleteTripInfo, processCompleteReservation } from '../services/api';
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
  transferReceipt?: string;
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
    paymentMethod: 'credit_card' as 'credit_card' | 'debit_card' | 'transfer'
  });

  const [transferReceipt, setTransferReceipt] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

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
    // Si es transferencia, solo validar el recibo
    if (paymentData.paymentMethod === 'transfer') {
      return undefined; // La validación del archivo se hace en validateForm
    }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          transferReceipt: 'Debe ser un archivo de imagen (JPG, PNG, etc.)'
        }));
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          transferReceipt: 'El archivo no debe superar los 5MB'
        }));
        return;
      }

      setTransferReceipt(file);
      setErrors(prev => ({
        ...prev,
        transferReceipt: undefined
      }));
    }
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
    
    // Si es transferencia, solo validar que tenga el archivo
    if (paymentData.paymentMethod === 'transfer') {
      if (!transferReceipt) {
        newErrors.transferReceipt = 'Debe subir el comprobante de transferencia';
      }
    } else {
      // Validar campos de tarjeta
      Object.keys(paymentData).forEach(key => {
        if (key !== 'paymentMethod') {
          const error = validateField(key, paymentData[key as keyof typeof paymentData]);
          if (error) newErrors[key as keyof FormErrors] = error;
        }
      });
    }

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
      setProcessingProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Pago validado exitosamente');

      // Paso 2: Generar código de confirmación
      setProcessingStep('Generando confirmación...');
      setProcessingProgress(20);
      const generatedCode = generateConfirmationCode();
      console.log('✅ Código de confirmación generado:', generatedCode);

      // Paso 3: Crear bucket si no existe
      setProcessingStep('Configurando sistema de archivos...');
      setProcessingProgress(30);
      await createInvoicesBucket();
      console.log('✅ Sistema de archivos configurado');

      // Paso 4: Obtener información completa del viaje
      setProcessingStep('Obteniendo información del viaje...');
      setProcessingProgress(40);
      const tripInfo = await getCompleteTripInfo(bookingData.tripId);
      console.log('✅ Información del viaje obtenida:', tripInfo);

      // Paso 5: Preparar datos para la factura
      setProcessingStep('Preparando factura...');
      setProcessingProgress(50);
      
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
          origin: tripInfo.origin,
          destination: tripInfo.destination,
          departureTime: tripInfo.departureTime,
          tripDate: tripInfo.tripDate,
          busNumber: tripInfo.busNumber,
          busType: 'Ejecutivo' // Valor por defecto ya que no tenemos este campo en la BD
        },
        seats: bookingData.selectedSeats,
        total: bookingData.total,
        paymentMethod: paymentData.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' : 
                      paymentData.paymentMethod === 'debit_card' ? 'Tarjeta de Débito' : 
                      'Transferencia Bancaria',
        cardLastFour: paymentData.paymentMethod !== 'transfer' ? paymentData.cardNumber.slice(-4) : undefined,
        createdAt: new Date().toISOString()
      };

      // Paso 6: Generar PDF
      setProcessingStep('Generando factura...');
      setProcessingProgress(60);
      const pdfBuffer = generateInvoicePDF(invoiceData);
      console.log('✅ PDF generado exitosamente');

      // Paso 7: Subir factura a Storage
      setProcessingStep('Subiendo factura...');
      setProcessingProgress(70);
      const invoiceUrl = await uploadInvoiceToStorage(pdfBuffer, invoiceData.reservationId);
      console.log('✅ Factura subida:', invoiceUrl);

      // Paso 8: Guardar reserva, pasajero y pago en base de datos
      setProcessingStep('Guardando reserva en base de datos...');
      setProcessingProgress(80);
      const reservationResult = await processCompleteReservation({
        tripId: bookingData.tripId,
        passengerInfo: bookingData.passengerInfo,
        selectedSeats: bookingData.selectedSeats,
        total: bookingData.total,
        paymentMethod: paymentData.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' : 
                      paymentData.paymentMethod === 'debit_card' ? 'Tarjeta de Débito' : 
                      'Transferencia Bancaria',
        confirmationCode: generatedCode,
        receiptUrl: invoiceUrl
      });
      console.log('✅ Reserva guardada en base de datos:', reservationResult);

      // Paso 9: Actualizar asientos como reservados
      setProcessingStep('Reservando asientos...');
      setProcessingProgress(85);
      await updateSeatsAsReserved(bookingData.tripId, bookingData.selectedSeats);
      console.log('✅ Asientos reservados exitosamente');

      // Paso 10: Enviar email con factura
      setProcessingStep('Enviando confirmación por email...');
      setProcessingProgress(90);
      const emailSent = await sendInvoiceEmail({
        to_email: bookingData.passengerInfo.email,
        to_name: `${bookingData.passengerInfo.nombre} ${bookingData.passengerInfo.apellido}`,
        confirmation_code: generatedCode,
        invoice_url: invoiceUrl,
        trip_origin: tripInfo.origin,
        trip_destination: tripInfo.destination,
        departure_date: (() => {
          const [year, month, day] = tripInfo.tripDate.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('es-EC', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        })(),
        departure_time: tripInfo.departureTime,
        bus_number: tripInfo.busNumber,
        seat_numbers: bookingData.selectedSeats.join(', '),
        total_amount: bookingData.total.toFixed(2),
        passenger_name: `${bookingData.passengerInfo.nombre} ${bookingData.passengerInfo.apellido}`
      });

      console.log('✅ Proceso completado exitosamente');

      // Paso 11: Navegar a confirmación con todos los datos procesados
      setProcessingStep('Finalizando...');
      setProcessingProgress(100);
      navigate('/confirmation', {
        state: {
          ...bookingData,
          // Agregar información completa del viaje obtenida de la base de datos
          tripInfo: tripInfo,
          paymentData: paymentData.paymentMethod !== 'transfer' ? {
            ...paymentData,
            cardNumber: `****-****-****-${paymentData.cardNumber.slice(-4)}`
          } : {
            paymentMethod: paymentData.paymentMethod,
            transferReceiptName: transferReceipt?.name
          },
          confirmationCode: generatedCode,
          invoiceUrl: invoiceUrl,
          reservationId: reservationResult.reservationId, // Usar el ID real de la reserva
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
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center transition-all duration-300 ease-in-out">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center max-w-md mx-4 border border-gray-100 transform transition-all duration-300 ease-in-out">
            <div className="mb-6">
              <LoadingSpinner message="" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {processingStep || 'Procesando pago...'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor, no cierre ni actualice la página.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
                   style={{width: `${processingProgress}%`}}></div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumb 
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Búsqueda', href: '/search' },
            { label: 'Selección de Asientos', href: `/booking/${displayData.tripId}` },
            { label: 'Registro y Pago', current: true }
          ]}
        />

        {showAlert && (
          <Alert 
            type="error" 
            message="Por favor, verifica todos los campos del formulario"
            onClose={() => setShowAlert(false)}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Formulario de Pago */}
          <div className="xl:col-span-2">
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
                      <span id="credit-card-desc" className="sr-only">Pagar con tarjeta de crédito</span>
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
                      <span id="debit-card-desc" className="sr-only">Pagar con tarjeta de débito</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentData.paymentMethod === 'transfer'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        aria-describedby="transfer-desc"
                      />
                      <Banknote className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      <span className="ml-3 text-gray-900">Transferencia Bancaria</span>
                      <span id="transfer-desc" className="sr-only">Pagar con transferencia bancaria</span>
                    </label>
                  </div>
                </fieldset>

                {/* Información de Transferencia Bancaria */}
                {paymentData.paymentMethod === 'transfer' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Información para Transferencia Bancaria
                    </h3>
                    
                    {/* Datos bancarios mock */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-900 mb-3">Datos para la Transferencia:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                        <div>
                          <p className="font-medium text-blue-800">Banco:</p>
                          <p className="text-blue-700">Banco del Pacífico</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">Tipo de Cuenta:</p>
                          <p className="text-blue-700">Cuenta Corriente</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">Número de Cuenta:</p>
                          <p className="text-blue-700 font-mono text-xs sm:text-sm break-all">1234567890</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">RUC:</p>
                          <p className="text-blue-700 font-mono text-xs sm:text-sm break-all">1792345678001</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="font-medium text-blue-800">Beneficiario:</p>
                          <p className="text-blue-700">CooperBus S.A.</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="font-medium text-blue-800">Monto a Transferir:</p>
                          <p className="text-xl sm:text-2xl font-bold text-blue-900">${displayData.total?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Instrucciones */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-yellow-800 mb-2">📝 Instrucciones:</h4>
                      <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                        <li>Realice la transferencia por el monto exacto mostrado arriba</li>
                        <li>En el concepto o referencia, incluya su nombre completo</li>
                        <li>Tome una foto clara del comprobante de transferencia</li>
                        <li>Suba la imagen del comprobante usando el campo de abajo</li>
                        <li>Su reserva será confirmada automáticamente al subir el comprobante</li>
                      </ol>
                    </div>

                    {/* Campo para subir comprobante */}
                    <div>
                      <div className="block text-sm font-medium text-gray-700 mb-2">
                        Comprobante de Transferencia <span className="text-red-500" aria-label="requerido">*</span>
                      </div>
                      <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="transferReceipt"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Subir imagen</span>
                              <input
                                id="transferReceipt"
                                name="transferReceipt"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                                aria-describedby="file-upload-help"
                              />
                            </label>
                            <p className="pl-1">o arrastrar aquí</p>
                          </div>
                          <p id="file-upload-help" className="text-xs text-gray-500">
                            PNG, JPG, GIF hasta 5MB
                          </p>
                        </div>
                      </div>
                      
                      {/* Mostrar archivo seleccionado */}
                      {transferReceipt && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-green-800">
                                Archivo seleccionado: {transferReceipt.name}
                              </p>
                              <p className="text-sm text-green-600">
                                Tamaño: {(transferReceipt.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {errors.transferReceipt && (
                        <p className="mt-2 text-sm text-red-600" role="alert">
                          <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.transferReceipt}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Información de la Tarjeta - Solo si no es transferencia */}
                {paymentData.paymentMethod !== 'transfer' && (
                <fieldset>
                  <legend className="text-lg font-medium text-gray-900 mb-4">
                    Información de la Tarjeta
                  </legend>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Número de Tarjeta */}
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Tarjeta <span className="text-red-500" aria-label="requerido">*</span>
                      </label>
                      <p id="card-number-help" className="mb-2 text-xs text-gray-500">
                        Ingresa los 16 dígitos de tu tarjeta
                      </p>
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
                        <p id="card-number-error" className="mt-2 text-sm text-red-600 flex items-start" role="alert">
                          <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    {/* Fecha de Expiración y CVV */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Expiración <span className="text-red-500" aria-label="requerido">*</span>
                        </label>
                        <p id="expiry-date-help" className="mb-2 text-xs text-gray-500">
                          Formato: MM/YY
                        </p>
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
                            aria-describedby={errors.expiryDate ? 'expiry-date-error' : 'expiry-date-help'}
                            autoComplete="cc-exp"
                          />
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        {errors.expiryDate && (
                          <p id="expiry-date-error" className="mt-2 text-sm text-red-600 flex items-start" role="alert">
                            <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.expiryDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                          <Tooltip 
                            content="El CVV es el código de seguridad de 3 dígitos que se encuentra en el reverso de tu tarjeta, junto a la firma. En tarjetas American Express son 4 dígitos en el frente."
                            position="right"
                          >
                            <span className="cursor-help">
                              CVV <span className="text-red-500" aria-label="requerido">*</span>
                            </span>
                          </Tooltip>
                        </label>
                        <p id="card-cvv-help" className="mb-2 text-xs text-gray-500">
                          Código de 3 o 4 dígitos en el reverso
                        </p>
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
                            aria-describedby={errors.cvv ? 'card-cvv-error' : 'card-cvv-help'}
                            autoComplete="cc-csc"
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        {errors.cvv && (
                          <p id="card-cvv-error" className="mt-2 text-sm text-red-600 flex items-start" role="alert">
                            <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.cvv}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Nombre del Titular */}
                    <div>
                      <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Titular <span className="text-red-500" aria-label="requerido">*</span>
                      </label>
                      <p id="cardholder-help" className="mb-2 text-xs text-gray-500">
                        Nombre exacto como aparece en tu tarjeta
                      </p>
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
                    </div>
                  </div>
                </fieldset>
                )}

                {/* Botones */}
                <div className="flex justify-between pt-16">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    aria-label="Volver al registro de pasajero"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={paymentData.paymentMethod === 'transfer' ? "Continuar con la transferencia bancaria" : "Completar el pago y confirmar reserva"}
                  >
                    {isLoading ? 'Procesando...' : 
                     paymentData.paymentMethod === 'transfer' ? 'Continuar' : 
                     `Pagar $${displayData.total?.toFixed(2) || '0.00'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Resumen de la Reserva */}
          <div className="xl:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden lg:sticky lg:top-8">
              <div className="bg-gray-50 px-4 sm:px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Resumen de la Reserva
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ruta</h3>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {displayData.trip?.schedule?.route?.origin} → {displayData.trip?.schedule?.route?.destination}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Números de Asiento</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {displayData.selectedSeats?.join(', ')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Pasajero</h3>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {displayData.passengerInfo?.nombre} {displayData.passengerInfo?.apellido}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">
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
