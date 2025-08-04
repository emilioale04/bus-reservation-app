import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

interface FormData {
  cedula: string;
  nombre: string;
  apellido: string;
  direccion: string;
  celular: string;
  email: string;
}

interface FormErrors {
  [key: string]: string;
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
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!bookingData) {
      navigate(`/booking/${tripId}`);
    }
  }, [bookingData, tripId, navigate]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "cedula":
        return value.length !== 10 ? "La cédula debe tener 10 dígitos" : "";
      case "nombre":
        return value.length < 2 ? "El nombre es requerido" : "";
      case "apellido":
        return value.length < 2 ? "El apellido es requerido" : "";
      case "direccion":
        return value.length < 5
          ? "La dirección debe tener al menos 5 caracteres"
          : "";
      case "celular":
        return !/^09\d{8}$/.test(value)
          ? "El celular debe empezar con 09 y tener 10 dígitos"
          : "";
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Email inválido"
          : "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validación en tiempo real
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos antes de proceder
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    // Verificar si todos los campos están llenos
    const isFormEmpty = Object.values(formData).some(
      (value) => value.trim() === ""
    );

    if (isFormEmpty) {
      setErrors({
        ...newErrors,
        submit: "Por favor, complete todos los campos requeridos.",
      });
      return;
    }

    // Si hay errores de validación, no continuar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-gray-500 text-sm">
            <li>
              <a href="/" className="hover:text-gray-700">
                Inicio
              </a>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <a href="/search" className="hover:text-gray-700">
                Búsqueda
              </a>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <a href={`/booking/${tripId}`} className="hover:text-gray-700">
                Selección de Asientos
              </a>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li aria-current="page" className="text-gray-900 font-medium">
              Registro de Pasajero
            </li>
          </ol>
        </nav>

        <div className="bg-white shadow rounded-lg p-6">
          <h1
            className="text-2xl font-bold text-gray-900 mb-6"
            id="registro-title"
          >
            Registro de Pasajero
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Cédula */}
            <div>
              <label
                htmlFor="cedula"
                className="block text-sm font-medium text-gray-700 required-field"
              >
                Cédula
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.cedula && touched.cedula
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.cedula}
                  aria-describedby="cedula-error"
                  maxLength={10}
                  pattern="[0-9]*"
                />
                {errors.cedula && touched.cedula && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    id="cedula-error"
                    role="alert"
                  >
                    {errors.cedula}
                  </p>
                )}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 required-field"
              >
                Nombre
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nombre && touched.nombre
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.nombre}
                  aria-describedby="nombre-error"
                />
                {errors.nombre && touched.nombre && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    id="nombre-error"
                    role="alert"
                  >
                    {errors.nombre}
                  </p>
                )}
              </div>
            </div>

            {/* Apellido */}
            <div>
              <label
                htmlFor="apellido"
                className="block text-sm font-medium text-gray-700 required-field"
              >
                Apellido
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.apellido && touched.apellido
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.apellido}
                  aria-describedby="apellido-error"
                />
                {errors.apellido && touched.apellido && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    id="apellido-error"
                    role="alert"
                  >
                    {errors.apellido}
                  </p>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label
                htmlFor="direccion"
                className="block text-sm font-medium text-gray-700 required-field"
              >
                Dirección
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.direccion && touched.direccion
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.direccion}
                  aria-describedby="direccion-error"
                />
                {errors.direccion && touched.direccion && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    id="direccion-error"
                    role="alert"
                  >
                    {errors.direccion}
                  </p>
                )}
              </div>
            </div>

            {/* Celular */}
            <div>
              <label
                htmlFor="celular"
                className="block text-sm font-medium text-gray-700 required-field"
              >
                Celular
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.celular && touched.celular
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.celular}
                  aria-describedby="celular-error"
                  placeholder="0912345678"
                />
                {errors.celular && touched.celular && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    id="celular-error"
                    role="alert"
                  >
                    {errors.celular}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 required-field"
              >
                Email
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email && touched.email
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                  autoComplete="email"
                />
                {errors.email && touched.email && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    id="email-error"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => navigate(`/booking/${tripId}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroPage;
