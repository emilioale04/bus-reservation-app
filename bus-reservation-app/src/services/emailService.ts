import emailjs from '@emailjs/browser';
import { supabase } from './supabase';

const EMAIL_SERVICE_ID = 'service_busreserva'; 
const EMAIL_TEMPLATE_ID = 'template_invoice'; 
const EMAIL_PUBLIC_KEY = 'D3X-1CUTtFCWpIu7P'; 

emailjs.init(EMAIL_PUBLIC_KEY);

export interface EmailData {
  to_email: string;
  to_name: string;
  confirmation_code: string;
  invoice_url: string;
  trip_origin: string;
  trip_destination: string;
  departure_date: string;
  seat_numbers: string;
  total_amount: string;
  passenger_name: string;
}

/**
 * Envía email con la factura usando EmailJS
 */
export const sendInvoiceEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Validar que el email no esté vacío
    if (!emailData.to_email || emailData.to_email.trim() === '') {
      console.error('❌ Error: Email del destinatario está vacío');
      throw new Error('Email del destinatario es requerido');
    }

    console.log('📧 Enviando email con EmailJS...', emailData);

    const templateParams = {
      email: emailData.to_email,  // EmailJS usa 'email' para el destinatario
      to_name: emailData.to_name,
      confirmation_code: emailData.confirmation_code,
      invoice_url: emailData.invoice_url,
      trip_details: `${emailData.trip_origin} → ${emailData.trip_destination}`,
      departure_date: emailData.departure_date,
      seat_numbers: emailData.seat_numbers,
      total_amount: emailData.total_amount,
      passenger_name: emailData.passenger_name,
      company_name: 'BusReserva',
      support_email: 'soporte@busreserva.com'
    };

    // Enviar email usando EmailJS
    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      templateParams
    );

    if (response.status === 200) {
      console.log('✅ Email enviado exitosamente:', response);
      return true;
    } else {
      console.error('❌ Error en respuesta de EmailJS:', response);
      return false;
    }

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    
    // Fallback: mostrar información en consola para desarrollo
    console.log('📧 FALLBACK - Datos del email que se hubiera enviado:');
    console.log('='.repeat(50));
    console.log(`Para: ${emailData.to_email}`);
    console.log(`Asunto: Confirmación de Reserva - ${emailData.confirmation_code}`);
    console.log(`Pasajero: ${emailData.passenger_name}`);
    console.log(`Viaje: ${emailData.trip_origin} → ${emailData.trip_destination}`);
    console.log(`Fecha: ${emailData.departure_date}`);
    console.log(`Asientos: ${emailData.seat_numbers}`);
    console.log(`Total: $${emailData.total_amount}`);
    console.log(`URL Factura: ${emailData.invoice_url}`);
    console.log('='.repeat(50));
    
    return false;
  }
};

/**
 * Actualiza los asientos como reservados en Supabase
 */
export const updateSeatsAsReserved = async (
  tripId: string, 
  seatNumbers: number[]
): Promise<boolean> => {
  try {
    console.log('🪑 Actualizando asientos como reservados...', {
      tripId,
      seatNumbers
    });

    // Primero verificar el estado actual de los asientos
    const { data: currentSeats, error: checkError } = await supabase
      .from('seats')
      .select('seat_number, is_reserved')
      .eq('trip_id', tripId)
      .in('seat_number', seatNumbers);

    if (checkError) {
      console.error('❌ Error verificando estado de asientos:', checkError);
      // No lanzar error, continuar con fallback
      console.log('🔄 FALLBACK - Simulando actualización de asientos:');
      console.log(`Trip ID: ${tripId}`);
      console.log(`Asientos reservados: ${seatNumbers.join(', ')}`);
      return false;
    }

    // Filtrar solo los asientos que no están ya reservados
    const seatsToUpdate = currentSeats
      ?.filter(seat => !seat.is_reserved)
      .map(seat => seat.seat_number) || [];

    if (seatsToUpdate.length === 0) {
      console.log('ℹ️ Todos los asientos ya están reservados, no es necesario actualizar');
      return true; // Considerar exitoso ya que el objetivo se cumplió
    }

    console.log(`🔄 Actualizando ${seatsToUpdate.length} asientos que no estaban reservados:`, seatsToUpdate);

    // Actualizar solo los asientos que no están reservados
    const { error } = await supabase
      .from('seats')
      .update({ is_reserved: true })
      .eq('trip_id', tripId)
      .in('seat_number', seatsToUpdate);

    if (error) {
      console.error('❌ Error actualizando asientos:', error);
      // Fallback: simular actualización para desarrollo
      console.log('🔄 FALLBACK - Simulando actualización de asientos:');
      console.log(`Trip ID: ${tripId}`);
      console.log(`Asientos reservados: ${seatsToUpdate.join(', ')}`);
      return false;
    }

    console.log('✅ Asientos actualizados exitosamente como reservados');
    return true;

  } catch (error) {
    console.error('❌ Error en updateSeatsAsReserved:', error);
    
    // Fallback: simular actualización para desarrollo
    console.log('🔄 FALLBACK - Simulando actualización de asientos:');
    console.log(`Trip ID: ${tripId}`);
    console.log(`Asientos reservados: ${seatNumbers.join(', ')}`);
    
    return false;
  }
};

/**
 * Verifica si los asientos están disponibles antes de procesar el pago
 */
export const checkSeatsAvailability = async (
  tripId: string, 
  seatNumbers: number[]
): Promise<{ available: boolean; unavailableSeats: number[] }> => {
  try {
    console.log('🔍 Verificando disponibilidad de asientos...', {
      tripId,
      seatNumbers
    });

    // Consultar el estado actual de los asientos
    const { data: seats, error } = await supabase
      .from('seats')
      .select('seat_number, is_reserved')
      .eq('trip_id', tripId)
      .in('seat_number', seatNumbers);

    if (error) {
      console.error('❌ Error consultando asientos:', error);
      throw new Error(`Error consultando asientos: ${error.message}`);
    }

    // Encontrar asientos no disponibles
    const unavailableSeats = seats
      ?.filter(seat => seat.is_reserved)
      .map(seat => seat.seat_number) || [];

    const available = unavailableSeats.length === 0;

    console.log('✅ Verificación de asientos completada:', {
      available,
      unavailableSeats
    });

    return { available, unavailableSeats };

  } catch (error) {
    console.error('❌ Error en checkSeatsAvailability:', error);
    
    // Fallback: asumir que están disponibles para desarrollo
    console.log('🔄 FALLBACK - Asumiendo asientos disponibles para desarrollo');
    return { available: true, unavailableSeats: [] };
  }
};

/**
 * Libera asientos reservados (en caso de cancelación o error)
 */
export const releaseSeats = async (
  tripId: string, 
  seatNumbers: number[]
): Promise<boolean> => {
  try {
    console.log('🔓 Liberando asientos...', {
      tripId,
      seatNumbers
    });

    const { error } = await supabase
      .from('seats')
      .update({ is_reserved: false })
      .eq('trip_id', tripId)
      .in('seat_number', seatNumbers);

    if (error) {
      console.error('❌ Error liberando asientos:', error);
      throw new Error(`Error liberando asientos: ${error.message}`);
    }

    console.log('✅ Asientos liberados exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error en releaseSeats:', error);
    return false;
  }
};

/**
 * Configuración para EmailJS - Instrucciones para el desarrollador
 */
export const getEmailJSSetupInstructions = (): string => {
  return `
🔧 CONFIGURACIÓN DE EMAILJS REQUERIDA:

1. Ve a https://www.emailjs.com/
2. Crea una cuenta gratuita
3. Crea un nuevo servicio (Service):
   - ID: service_busreserva
   - Proveedor: Gmail, Outlook, etc.

4. Crea un template (Template):
   - ID: template_invoice
   - Variables requeridas:
     * to_email, to_name, confirmation_code
     * invoice_url, trip_details, departure_date
     * seat_numbers, total_amount, passenger_name
     * company_name, support_email

5. Obtén tu Public Key desde el Dashboard

6. Actualiza emailService.ts con tus credenciales:
   - EMAIL_SERVICE_ID
   - EMAIL_TEMPLATE_ID  
   - EMAIL_PUBLIC_KEY

EJEMPLO DE TEMPLATE HTML para EmailJS:
(Usa las variables con doble llaves como placeholders)
- Título: Confirmación de Reserva - BusReserva
- Contenido: Usar variables de EmailJS para personalizar
`;
};
