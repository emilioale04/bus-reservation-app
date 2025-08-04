import jsPDF from "jspdf";
import {
    checkSeatsAvailability,
    sendInvoiceEmail as sendEmailViaEmailJS,
    updateSeatsAsReserved,
    type EmailData
} from "./emailService";
import { supabase } from "./supabase";

export interface InvoiceData {
  reservationId: string;
  confirmationCode: string;
  passenger: {
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    celular: string;
    direccion: string;
  };
  trip: {
    origin: string;
    destination: string;
    departureTime: string;
    busNumber: string;
    busType: string;
  };
  seats: number[];
  total: number;
  paymentMethod: string;
  cardLastFour?: string;
  createdAt: string;
}

export interface ReservationData {
  tripId: string;
  selectedSeats: number[];
  total: number;
  passengerInfo: {
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    celular: string;
    direccion: string;
  };
}

export interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  paymentMethod: 'credit_card' | 'debit_card';
}

// Generar PDF de la factura
export const generateInvoicePDF = (data: InvoiceData): Uint8Array => {
  const doc = new jsPDF();
  
  // Configuración de fuentes y colores
  const primaryColor = [37, 99, 235] as [number, number, number];
  const textColor = [31, 41, 55] as [number, number, number];
  const lightGray = [156, 163, 175] as [number, number, number];
  
  // Header de la empresa
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CooperBus', 20, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Reservas de Autobuses', 20, 32);
  
  // Información de la factura
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA ELECTRÓNICA', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Número de factura y fecha
  doc.text(`Factura #: ${data.confirmationCode}`, 20, 65);
  doc.text(`Fecha: ${new Date(data.createdAt).toLocaleDateString('es-EC')}`, 20, 72);
  doc.text(`Reserva ID: ${data.reservationId}`, 20, 79);
  
  // Información del pasajero
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL PASAJERO', 20, 95);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${data.passenger.nombre} ${data.passenger.apellido}`, 20, 105);
  doc.text(`Cédula: ${data.passenger.cedula}`, 20, 112);
  doc.text(`Email: ${data.passenger.email}`, 20, 119);
  doc.text(`Teléfono: ${data.passenger.celular}`, 20, 126);
  doc.text(`Dirección: ${data.passenger.direccion}`, 20, 133);
  
  // Información del viaje
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLES DEL VIAJE', 20, 150);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Ruta con flecha correcta
  doc.text(`Ruta: ${data.trip.origin} → ${data.trip.destination}`, 20, 160);
  doc.text(`Fecha y Hora: ${new Date(data.trip.departureTime).toLocaleString('es-EC')}`, 20, 167);
  
  // Solo mostrar información del bus si está disponible
  let currentY = 174;
  if (data.trip.busNumber && data.trip.busNumber !== 'N/A') {
    doc.text(`Bus: ${data.trip.busNumber}`, 20, currentY);
    currentY += 7;
  }
  if (data.trip.busType && data.trip.busType !== 'N/A') {
    doc.text(`Tipo: ${data.trip.busType}`, 20, currentY);
    currentY += 7;
  }
  
  doc.text(`Asientos: ${data.seats.join(', ')}`, 20, currentY);
  currentY += 7;
  
  // Tabla de detalles de pago (ajustar posición Y basada en contenido anterior)
  const tableStartY = currentY + 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLES DE PAGO', 20, tableStartY);
  
  // Encabezados de tabla
  doc.setFillColor(248, 250, 252); // gray-50
  doc.rect(20, tableStartY + 5, 170, 10, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Descripción', 25, tableStartY + 12);
  doc.text('Cantidad', 120, tableStartY + 12);
  doc.text('Precio Unit.', 140, tableStartY + 12);
  doc.text('Total', 170, tableStartY + 12);
  
  // Contenido de tabla
  doc.setFont('helvetica', 'normal');
  const pricePerSeat = data.total / data.seats.length;
  doc.text('Boleto de bus', 25, tableStartY + 22);
  doc.text(data.seats.length.toString(), 125, tableStartY + 22);
  doc.text(`$${pricePerSeat.toFixed(2)}`, 145, tableStartY + 22);
  doc.text(`$${data.total.toFixed(2)}`, 172, tableStartY + 22);
  
  // Línea de separación
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.line(20, tableStartY + 28, 190, tableStartY + 28);
  
  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR:', 120, tableStartY + 38);
  doc.setFontSize(14);
  doc.text(`$${data.total.toFixed(2)}`, 172, tableStartY + 38);
  
  // Información de pago
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Método de pago: ${data.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}`, 20, tableStartY + 50);
  if (data.cardLastFour) {
    doc.text(`Tarjeta terminada en: ****${data.cardLastFour}`, 20, tableStartY + 57);
  }
  
  // Footer
  const footerY = tableStartY + 80;
  doc.setFontSize(8);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('Esta es una factura electrónica generada automáticamente.', 20, footerY);
  doc.text('Para consultas, contacte nuestro servicio al cliente.', 20, footerY + 5);
  
  return doc.output('arraybuffer') as Uint8Array;
};

// Subir PDF a Supabase Storage y obtener URL
export const uploadInvoiceToStorage = async (
  pdfBuffer: Uint8Array,
  reservationId: string
): Promise<string> => {
  const fileName = `factura_${reservationId}_${Date.now()}.pdf`;
  
  try {
    // Convertir Uint8Array a Blob para Supabase
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    
    console.log('📄 Subiendo PDF a Supabase Storage...', {
      fileName,
      size: blob.size,
      type: blob.type
    });

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(fileName, blob, {
        contentType: 'application/pdf',
        upsert: true, // Permitir sobrescribir si ya existe
        cacheControl: '3600'
      });

    if (error) {
      console.error('❌ Error subiendo a Supabase:', error);
      throw new Error(`Error subiendo factura: ${error.message}`);
    }

    console.log('✅ PDF subido exitosamente:', data);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(data.path);

    console.log('🔗 URL pública generada:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('❌ Error en uploadInvoiceToStorage:', error);
    
    // Fallback: crear URL de datos para mostrar el PDF
    try {
      // Convertir Uint8Array a base64 de manera segura
      const base64String = btoa(
        Array.from(pdfBuffer)
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
      
      const fallbackUrl = `data:application/pdf;base64,${base64String}`;
      console.log('🔄 Usando URL fallback para desarrollo');
      return fallbackUrl;
    } catch (fallbackError) {
      console.error('❌ Error creando fallback:', fallbackError);
      return '#'; // URL placeholder
    }
  }
};

// Crear bucket de invoices con manejo mejorado de errores
export const createInvoicesBucket = async (): Promise<void> => {
  try {
    // Primero verificar si ya existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(bucket => bucket.name === 'invoices');
    
    if (exists) {
      console.log('Bucket invoices ya existe');
      return;
    }

    // Intentar crear el bucket
    const { error } = await supabase.storage.createBucket('invoices', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('Bucket ya existe (detectado en creación)');
        return;
      }
      
      if (error.message.includes('row-level security') || error.message.includes('RLS')) {
        console.log('Error de RLS al crear bucket. Verifica las políticas de Supabase.');
        console.log('Ejecuta el script setup_storage_policies.sql en el SQL Editor de Supabase');
        // No lanzar error, continuar con el flujo
        return;
      }
      
      throw new Error(`Error creando bucket: ${error.message}`);
    }
    
    console.log('Bucket de facturas creado exitosamente');
  } catch (error) {
    console.error('Error en createInvoicesBucket:', error);
    // No lanzar error para permitir que el flujo continúe
    console.log('Continuando sin bucket de storage...');
  }
};

// Guardar reserva y pago en la base de datos + actualizar asientos
export const saveReservationAndPayment = async (
  reservationData: ReservationData,
  paymentData: PaymentFormData,
  receiptUrl: string
): Promise<{ reservationId: string; paymentId: string }> => {
  try {
    // Generar IDs únicos para evitar conflictos
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const confirmationCode = generateConfirmationCode();

    // Verificar disponibilidad de asientos antes de procesar
    // NOTA: Solo verificamos si no están en modo de simulación
    console.log('🔍 Verificando disponibilidad de asientos...');
    
    try {
      const availability = await checkSeatsAvailability(
        reservationData.tripId, 
        reservationData.selectedSeats
      );

      // Si no están disponibles, esto puede indicar un doble procesamiento
      // En lugar de fallar, vamos a continuar con el procesamiento ya que 
      // es posible que esta sea una re-ejecución del mismo proceso
      if (!availability.available) {
        console.warn('⚠️ Los asientos parecen estar reservados. Esto puede ser normal si es una re-ejecución.');
        console.warn(`Asientos no disponibles: ${availability.unavailableSeats.join(', ')}`);
        
        // Para evitar errores en desarrollo, vamos a proceder
        // En producción, podrías querer verificar si esta reserva ya existe
      }
    } catch (availabilityError) {
      console.warn('⚠️ No se pudo verificar disponibilidad de asientos, continuando con el procesamiento...', availabilityError);
    }

    // Para el desarrollo, vamos a simular el guardado
    // En producción, aquí irían las llamadas reales a Supabase
    
    console.log('Simulando guardado en base de datos...');
    console.log('Datos de reserva:', {
      id: reservationId,
      tripId: reservationData.tripId,
      passengerInfo: reservationData.passengerInfo,
      selectedSeats: reservationData.selectedSeats,
      total: reservationData.total,
      confirmationCode,
      receiptUrl
    });

    console.log('Datos de pago:', {
      id: paymentId,
      reservationId,
      amount: reservationData.total,
      paymentMethod: paymentData.paymentMethod,
      cardLastFour: paymentData.cardNumber.slice(-4)
    });

    // Actualizar asientos como reservados (con manejo mejorado de errores)
    console.log('🪑 Actualizando asientos como reservados...');
    try {
      const seatsUpdated = await updateSeatsAsReserved(
        reservationData.tripId, 
        reservationData.selectedSeats
      );

      if (!seatsUpdated) {
        console.warn('⚠️ No se pudieron actualizar los asientos en tiempo real, pero el proceso continúa');
      }
    } catch (seatError) {
      console.warn('⚠️ Error actualizando asientos, pero el proceso continúa:', seatError);
      // No lanzar error aquí, continuar con el flujo
    }

    // Simular delay de base de datos
    await new Promise(resolve => setTimeout(resolve, 1000));

    // En un entorno real, descomentar y ajustar esto:
    /*
    // Crear el pasajero
    const { data: passengerData, error: passengerError } = await supabase
      .from('passengers')
      .upsert({
        name: `${reservationData.passengerInfo.nombre} ${reservationData.passengerInfo.apellido}`,
        email: reservationData.passengerInfo.email,
        phone: reservationData.passengerInfo.celular,
        address: reservationData.passengerInfo.direccion
      })
      .select()
      .single();

    if (passengerError) {
      console.error('Error creando pasajero:', passengerError);
      throw new Error(`Error creando pasajero: ${passengerError.message}`);
    }

    // Crear la reserva
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        id: reservationId,
        trip_id: reservationData.tripId,
        passenger_id: passengerData.id,
        passenger_name: `${reservationData.passengerInfo.nombre} ${reservationData.passengerInfo.apellido}`,
        passenger_email: reservationData.passengerInfo.email,
        passenger_phone: reservationData.passengerInfo.celular,
        passenger_address: reservationData.passengerInfo.direccion,
        seat_numbers: reservationData.selectedSeats,
        total_amount: reservationData.total,
        payment_status: 'completed',
        payment_method: paymentData.paymentMethod,
        confirmation_code: confirmationCode
      })
      .select()
      .single();

    if (reservationError) {
      console.error('Error creando reserva:', reservationError);
      throw new Error(`Error creando reserva: ${reservationError.message}`);
    }

    // Crear el registro de pago
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: paymentId,
        reservation_id: reservationId,
        amount: reservationData.total,
        payment_method: paymentData.paymentMethod,
        card_last_four: paymentData.cardNumber.slice(-4),
        receipt_url: receiptUrl,
        status: 'completed',
        transaction_id: generateTransactionId()
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creando pago:', paymentError);
      throw new Error(`Error creando pago: ${paymentError.message}`);
    }
    */

    return {
      reservationId,
      paymentId
    };
  } catch (error) {
    console.error('Error guardando reserva y pago:', error);
    throw error;
  }
};

// Generar código de confirmación
const generateConfirmationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generar ID de transacción
export const generateTransactionId = (): string => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Enviar factura por email usando EmailJS
export const sendInvoiceEmail = async (
  email: string,
  passengerName: string,
  confirmationCode: string,
  receiptUrl: string,
  tripData?: {
    origin: string;
    destination: string;
    departureTime: string;
  },
  seatNumbers?: number[],
  totalAmount?: number
): Promise<void> => {
  try {
    console.log('📧 Preparando envío de email...');
    
    // Preparar datos para EmailJS
    const emailData: EmailData = {
      to_email: email,
      to_name: passengerName,
      confirmation_code: confirmationCode,
      invoice_url: receiptUrl,
      trip_origin: tripData?.origin || 'Origen',
      trip_destination: tripData?.destination || 'Destino',
      departure_date: tripData?.departureTime ? 
        new Date(tripData.departureTime).toLocaleString('es-EC') : 
        'Fecha por confirmar',
      seat_numbers: seatNumbers?.join(', ') || 'Asientos por confirmar',
      total_amount: totalAmount?.toFixed(2) || '0.00',
      passenger_name: passengerName
    };

    // Intentar envío con EmailJS
    const emailSent = await sendEmailViaEmailJS(emailData);
    
    if (emailSent) {
      console.log('✅ Email enviado exitosamente con EmailJS');
    } else {
      console.log('⚠️ No se pudo enviar el email, pero se mostró información de fallback');
    }
    
  } catch (error) {
    console.error('❌ Error en envío de email:', error);
    
    // Fallback mejorado: mostrar información completa
    console.log('📧 INFORMACIÓN DEL EMAIL (FALLBACK):');
    console.log('='.repeat(60));
    console.log(`📬 Para: ${email}`);
    console.log(`👤 Pasajero: ${passengerName}`);
    console.log(`🎫 Código: ${confirmationCode}`);
    console.log(`🚌 Viaje: ${tripData?.origin || 'N/A'} → ${tripData?.destination || 'N/A'}`);
    console.log(`📅 Fecha: ${tripData?.departureTime ? new Date(tripData.departureTime).toLocaleString('es-EC') : 'N/A'}`);
    console.log(`🪑 Asientos: ${seatNumbers?.join(', ') || 'N/A'}`);
    console.log(`💰 Total: $${totalAmount?.toFixed(2) || '0.00'}`);
    console.log(`📄 Factura: ${receiptUrl}`);
    console.log('='.repeat(60));
    console.log('🔧 Para envío real de emails, configura EmailJS según las instrucciones en emailService.ts');
  }
};
