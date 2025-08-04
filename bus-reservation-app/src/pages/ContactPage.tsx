import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, User, FileText } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contáctanos
            </h1>
            <p className="text-xl max-w-3xl mx-auto">
              Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta, 
              sugerencia o información sobre nuestros servicios de transporte.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <Breadcrumb 
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Contacto', current: true }
            ]}
            className="mb-8"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Información de Contacto
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Teléfono</h3>
                    <p className="text-gray-600 mb-1">+593 2 123-4567</p>
                    <p className="text-gray-600">+593 98 765-4321 (WhatsApp)</p>
                    <p className="text-sm text-blue-600 mt-1">Disponible 24/7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600 mb-1">info@cooperbus.ec</p>
                    <p className="text-gray-600">reservas@cooperbus.ec</p>
                    <p className="text-sm text-blue-600 mt-1">Respuesta en 24 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Oficina Principal</h3>
                    <p className="text-gray-600 mb-1">Av. Patria 123 y 10 de Agosto</p>
                    <p className="text-gray-600 mb-1">Quito, Pichincha, Ecuador</p>
                    <p className="text-sm text-blue-600 mt-1">Lunes a Domingo: 6:00 AM - 10:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-md">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Horarios de Atención</h3>
                    <p className="text-gray-600 mb-1">Lunes a Viernes: 6:00 AM - 10:00 PM</p>
                    <p className="text-gray-600 mb-1">Sábados y Domingos: 6:00 AM - 10:00 PM</p>
                    <p className="text-sm text-blue-600 mt-1">Atención telefónica 24/7</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contacto de Emergencia
                </h3>
                <p className="text-red-700 mb-2">
                  Para emergencias durante el viaje o situaciones urgentes:
                </p>
                <p className="text-red-800 font-semibold">+593 99 123-4567</p>
                <p className="text-sm text-red-600 mt-1">Disponible 24 horas, todos los días</p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Envíanos un Mensaje
                </h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Asunto
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="reserva">Consulta sobre Reservas</option>
                      <option value="cancelacion">Cancelación de Viaje</option>
                      <option value="cambio">Cambio de Fecha/Hora</option>
                      <option value="equipaje">Consulta sobre Equipaje</option>
                      <option value="reclamo">Reclamo o Sugerencia</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageCircle className="h-4 w-4 inline mr-1" />
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Preguntas Frecuentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Cómo puedo cambiar mi reserva?
                </h3>
                <p className="text-gray-600">
                  Puedes cambiar tu reserva llamando a nuestro centro de atención al cliente 
                  al +593 2 123-4567 o enviando un email a reservas@cooperbus.ec con al menos 
                  2 horas de anticipación.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Qué documentos necesito para viajar?
                </h3>
                <p className="text-gray-600">
                  Para viajes nacionales solo necesitas tu cédula de identidad. 
                  Para viajes internacionales, se requiere pasaporte vigente.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Cuál es la política de equipaje?
                </h3>
                <p className="text-gray-600">
                  Permitimos hasta 20kg de equipaje en bodega sin costo adicional 
                  y equipaje de mano de hasta 5kg.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Puedo viajar con mascotas?
                </h3>
                <p className="text-gray-600">
                  Sí, aceptamos mascotas pequeñas en transportadoras. 
                  Debe coordinarse previamente y tiene un costo adicional de $10.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Qué pasa si pierdo mi boleto?
                </h3>
                <p className="text-gray-600">
                  Si tienes tu número de reserva y documento de identidad, 
                  podemos reemitir tu boleto sin costo adicional.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ¿Ofrecen descuentos?
                </h3>
                <p className="text-gray-600">
                  Ofrecemos descuentos para estudiantes (10%), adultos mayores (15%) 
                  y niños menores de 12 años (50%). Se requiere documento que lo acredite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
