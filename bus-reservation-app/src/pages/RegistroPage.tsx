import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import LoadingSpinner from "../components/LoadingSpinner";
import { AlertCircle } from "lucide-react";

interface FormData {
  cedula: string;
  nombre: string;
  apellido: string;
  direccion: string;
  celular: string;
  email: string;
}

interface FormErrors {
  cedula?: string;
  nombre?: string;
  apellido?: string;
  direccion?: string;
  celular?: string;
  email?: string;
  submit?: string;
}

const RegistroPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const bookingData = location.state?.bookingData;

  const [formData, setFormData] = useState<FormData>({
    cedula: "",
    nombre: "",
    apellido: "",
    direccion: "",
    celular: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [hasTyped, setHasTyped] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!bookingData) {
      navigate(`/booking/${tripId}`);
    }
  }, [bookingData, tripId, navigate]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "cedula": {
        if (!value.trim()) return "La cédula es requerida";
        if (value.length !== 10) return "La cédula debe tener exactamente 10 dígitos";
        if (!/^\d+$/.test(value)) return "La cédula solo debe contener números";
        break;
      }
      case "nombre": {
        if (!value.trim()) return "El nombre es requerido";
        if (value.length < 2) return "El nombre debe tener al menos 2 caracteres";
        break;
      }
      case "apellido": {
        if (!value.trim()) return "El apellido es requerido";
        if (value.length < 2) return "El apellido debe tener al menos 2 caracteres";
        break;
      }
      case "direccion": {
        if (!value.trim()) return "La dirección es requerida";
        if (value.length < 5) return "La dirección debe tener al menos 5 caracteres";
        break;
      }
      case "celular": {
        if (!value.trim()) return "El número de celular es requerido";
        if (!/^09\d{8}$/.test(value)) return "El celular debe empezar con 09 y tener 10 dígitos";
        break;
      }
      case "email": {
        if (!value.trim()) return "El email es requerido";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingrese un email válido";
        break;
      }
    }
    return undefined;
  };

  // Validación en tiempo real solo cuando el usuario escribe
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Marcar como que el usuario ha escrito en este campo
    if (!hasTyped[name]) {
      setHasTyped((prev) => ({ ...prev, [name]: true }));
    }

    // Validación en tiempo real - solo al escribir
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validar todos los campos
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });
    
    setErrors(prev => ({
      ...prev,
      ...newErrors,
      // Limpiar error de submit si existe
      submit: Object.keys(newErrors).length > 0 ? "Por favor, verifique todos los campos del formulario." : undefined
    }));
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como que han sido escritos para mostrar errores
    const allTyped = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }), {}
    );
    setHasTyped(allTyped);
    
    // Validar formulario
    if (!validateForm()) {
      // Mostrar mensaje general de error
      setErrors(prev => ({
        ...prev,
        submit: "Por favor, complete todos los campos requeridos correctamente."
      }));
      return;
    }
    
    setIsLoading(true);
    try {
      // Aquí iría la lógica para enviar los datos al servidor
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulación
      navigate("/payment", {
        state: {
          ...bookingData,
          passengerInfo: formData,
        },
      });
    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Error al procesar la reserva. Por favor, intente nuevamente.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Procesando su reserva..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Búsqueda', href: '/search' },
            { label: 'Selección de Asientos', href: `/booking/${tripId}` },
            { label: 'Registro y Pago', current: true }
          ]}
        />
        
        <div className="bg-white shadow rounded-lg p-6">
          <h1
            className="text-2xl font-bold text-gray-900 mb-6"
            id="registro-title"
          >
            Registro de Pasajero
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-labelledby="registro-title">
            {/* Error general del formulario */}
            {errors.submit && (
              <div
                className="bg-red-50 border border-red-200 rounded-md p-4"
                role="alert"
                aria-live="polite"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cédula */}
            <div>
              <label
                htmlFor="cedula"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cédula de Identidad
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div id="cedula-help" className="text-xs text-gray-500 mb-2">
                Ingrese su número de cédula de 10 dígitos sin guiones ni espacios
              </div>
              <input
                type="text"
                id="cedula"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.cedula && hasTyped.cedula
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                aria-required="true"
                aria-invalid={!!(errors.cedula && hasTyped.cedula)}
                aria-describedby="cedula-help"
                maxLength={10}
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="Ej: 1234567890"
              />
              {errors.cedula && hasTyped.cedula && (
                <p
                  className="mt-2 text-sm text-red-600 flex items-start"
                  id="cedula-error"
                  role="alert"
                >
                  <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  {errors.cedula}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombres
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div id="nombre-help" className="text-xs text-gray-500 mb-2">
                Ingrese su nombre completo como aparece en su documento de identidad
              </div>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.nombre && hasTyped.nombre
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                aria-required="true"
                aria-invalid={!!(errors.nombre && hasTyped.nombre)}
                aria-describedby="nombre-help"
                autoComplete="given-name"
                placeholder="Ej: Juan Carlos"
              />
              {errors.nombre && hasTyped.nombre && (
                <p
                  className="mt-2 text-sm text-red-600 flex items-start"
                  id="nombre-error"
                  role="alert"
                >
                  <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label
                htmlFor="apellido"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Apellidos
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div id="apellido-help" className="text-xs text-gray-500 mb-2">
                Ingrese sus apellidos completos como aparecen en su documento de identidad
              </div>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.apellido && hasTyped.apellido
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                aria-required="true"
                aria-invalid={!!(errors.apellido && hasTyped.apellido)}
                aria-describedby="apellido-help"
                autoComplete="family-name"
                placeholder="Ej: Pérez González"
              />
              {errors.apellido && hasTyped.apellido && (
                <p
                  className="mt-2 text-sm text-red-600 flex items-start"
                  id="apellido-error"
                  role="alert"
                >
                  <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  {errors.apellido}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label
                htmlFor="direccion"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Dirección de Domicilio
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div id="direccion-help" className="text-xs text-gray-500 mb-2">
                Ingrese su dirección completa incluyendo calle, número y referencias
              </div>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.direccion && hasTyped.direccion
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                aria-required="true"
                aria-invalid={!!(errors.direccion && hasTyped.direccion)}
                aria-describedby="direccion-help"
                autoComplete="street-address"
                placeholder="Ej: Av. Amazonas N24-03 y Colón"
              />
              {errors.direccion && hasTyped.direccion && (
                <p
                  className="mt-2 text-sm text-red-600 flex items-start"
                  id="direccion-error"
                  role="alert"
                >
                  <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  {errors.direccion}
                </p>
              )}
            </div>

            {/* Celular */}
            <div>
              <label
                htmlFor="celular"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Número de Celular
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div id="celular-help" className="text-xs text-gray-500 mb-2">
                Número de celular ecuatoriano que inicie con 09 y tenga 10 dígitos
              </div>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.celular && hasTyped.celular
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                aria-required="true"
                aria-invalid={!!(errors.celular && hasTyped.celular)}
                aria-describedby="celular-help"
                autoComplete="tel"
                inputMode="numeric"
                placeholder="Ej: 0987654321"
              />
              {errors.celular && hasTyped.celular && (
                <p
                  className="mt-2 text-sm text-red-600 flex items-start"
                  id="celular-error"
                  role="alert"
                >
                  <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  {errors.celular}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <div id="email-help" className="text-xs text-gray-500 mb-2">
                Dirección de correo electrónico válida donde recibirá la confirmación de su reserva
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email && hasTyped.email
                    ? "border-red-300 focus:border-red-300 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                aria-required="true"
                aria-invalid={!!(errors.email && hasTyped.email)}
                aria-describedby="email-help"
                autoComplete="email"
                inputMode="email"
                placeholder="Ej: juan.perez@gmail.com"
              />
              {errors.email && hasTyped.email && (
                <p
                  className="mt-2 text-sm text-red-600 flex items-start"
                  id="email-error"
                  role="alert"
                >
                  <AlertCircle className="inline h-4 w-4 mr-1" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate(`/booking/${tripId}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                aria-label="Volver a la selección de asientos"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                aria-label="Continuar al proceso de pago"
              >
                Continuar
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroPage;