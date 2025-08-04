import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Clock, AlertTriangle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link 
              to="/" 
              className="flex items-center text-blue-100 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al Inicio
            </Link>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-blue-200" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Condiciones generales de uso de los servicios de transporte CooperBus
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <Breadcrumb 
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Términos y Condiciones', current: true }
            ]}
            className="mb-8"
          />
          
          {/* Last Updated */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Última actualización: 3 de agosto de 2025
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                1. Introducción
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Bienvenido a CooperBus. Estos términos y condiciones ("Términos") rigen el uso de nuestros 
                servicios de transporte terrestre y plataforma de reservas en línea. Al utilizar nuestros 
                servicios, usted acepta estar sujeto a estos términos.
              </p>
              <p className="text-gray-700 leading-relaxed">
                CooperBus se reserva el derecho de modificar estos términos en cualquier momento. 
                Los cambios entrarán en vigor inmediatamente después de su publicación en nuestro sitio web.
              </p>
            </section>

            {/* Booking and Payment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Reservas y Pagos
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Proceso de Reserva</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Las reservas pueden realizarse en línea, por teléfono o en nuestras oficinas</li>
                    <li>Se requiere información personal válida para completar la reserva</li>
                    <li>Los menores de edad deben viajar acompañados de un adulto responsable</li>
                    <li>La reserva se confirma únicamente después del pago exitoso</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Métodos de Pago</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Tarjetas de crédito y débito (Visa, Mastercard)</li>
                    <li>Transferencias bancarias</li>
                    <li>Pago en efectivo en nuestras oficinas</li>
                    <li>Todos los precios están expresados en dólares americanos (USD)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Travel Conditions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Condiciones de Viaje
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Documentación Requerida</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Cédula de identidad vigente para viajes nacionales</li>
                    <li>Pasaporte vigente para viajes internacionales</li>
                    <li>Los documentos deben estar en buen estado y ser legibles</li>
                    <li>Los menores requieren cédula de identidad o partida de nacimiento</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 Equipaje</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Equipaje de bodega: máximo 20kg por pasajero sin costo adicional</li>
                    <li>Equipaje de mano: máximo 5kg y dimensiones 40x30x20cm</li>
                    <li>Artículos prohibidos: sustancias peligrosas, armas, objetos punzocortantes</li>
                    <li>CooperBus no se responsabiliza por objetos de valor no declarados</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Mascotas</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Se permite el transporte de mascotas pequeñas en transportadoras</li>
                    <li>Costo adicional de $10 USD por mascota</li>
                    <li>Certificado veterinario vigente (máximo 10 días)</li>
                    <li>Reserva previa obligatoria con al menos 24 horas de anticipación</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cancellations and Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Cancelaciones y Cambios
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Cambios de Fecha/Hora</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Cambios permitidos hasta 2 horas antes de la salida</li>
                    <li>Costo de cambio: $3 USD por boleto</li>
                    <li>Sujeto a disponibilidad de asientos</li>
                    <li>Diferencia de tarifa aplica si corresponde</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 Cancelaciones</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Más de 24 horas: reembolso del 90% del valor del boleto</li>
                    <li>Entre 24 y 2 horas: reembolso del 70% del valor del boleto</li>
                    <li>Menos de 2 horas: no hay reembolso</li>
                    <li>No presentarse: no hay reembolso</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Company Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Responsabilidades de la Empresa
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1 Servicios</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Proporcionar transporte seguro y confortable</li>
                    <li>Cumplir con los horarios programados (sujeto a condiciones climáticas y tráfico)</li>
                    <li>Mantener los vehículos en óptimas condiciones</li>
                    <li>Contar con personal capacitado y licenciado</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2 Limitaciones</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>No se responsabiliza por retrasos debido a casos fortuitos o fuerza mayor</li>
                    <li>Responsabilidad limitada por equipaje según tarifa aplicable</li>
                    <li>No cubre gastos adicionales por retrasos (hospedaje, alimentación, etc.)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Passenger Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Responsabilidades del Pasajero
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Llegar al punto de embarque con 30 minutos de anticipación</li>
                <li>Portar documentación válida y vigente</li>
                <li>Respetar las normas de convivencia y seguridad</li>
                <li>No consumir bebidas alcohólicas o sustancias prohibidas</li>
                <li>Cuidar sus pertenencias personales</li>
                <li>Seguir las instrucciones del personal de CooperBus</li>
                <li>Informar sobre cualquier condición médica especial</li>
              </ul>
            </section>

            {/* Prohibited Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                7. Conductas Prohibidas
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="list-disc list-inside text-red-800 space-y-2 ml-4">
                  <li>Fumar dentro del vehículo</li>
                  <li>Consumir bebidas alcohólicas</li>
                  <li>Comportamiento agresivo o irrespetuoso</li>
                  <li>Reproducir música o videos a alto volumen</li>
                  <li>Transportar objetos peligrosos o ilegales</li>
                  <li>Dañar las instalaciones o equipos del vehículo</li>
                </ul>
                <p className="text-red-800 font-medium mt-4">
                  El incumplimiento de estas normas puede resultar en la expulsión del pasajero 
                  sin derecho a reembolso.
                </p>
              </div>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Privacidad y Protección de Datos
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                CooperBus se compromete a proteger la privacidad de sus clientes. Los datos personales 
                recopilados se utilizan únicamente para:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Procesar reservas y pagos</li>
                <li>Comunicar información relevante sobre el viaje</li>
                <li>Mejorar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                No compartimos información personal con terceros sin consentimiento, excepto cuando 
                sea requerido por ley.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Información de Contacto
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  Para consultas, reclamos o información adicional sobre estos términos:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Teléfono:</strong> +593 2 123-4567</p>
                  <p><strong>Email:</strong> legal@cooperbus.ec</p>
                  <p><strong>Dirección:</strong> Av. Patria 123 y 10 de Agosto, Quito, Ecuador</p>
                  <p><strong>Horario de atención:</strong> Lunes a Domingo, 6:00 AM - 10:00 PM</p>
                </div>
              </div>
            </section>

            {/* Legal Jurisdiction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Jurisdicción y Ley Aplicable
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Estos términos se rigen por las leyes de la República del Ecuador. Cualquier disputa 
                relacionada con estos términos o el uso de nuestros servicios será resuelta por los 
                tribunales competentes de Quito, Ecuador.
              </p>
            </section>

            {/* Acceptance */}
            <section className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Aceptación de los Términos
                </h3>
                <p className="text-blue-700">
                  Al utilizar los servicios de CooperBus, usted confirma que ha leído, entendido y 
                  acepta estos términos y condiciones en su totalidad. Si no está de acuerdo con 
                  alguna parte de estos términos, le recomendamos no utilizar nuestros servicios.
                </p>
              </div>
            </section>

          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
