# 🚌 Bus Reservation App

Aplicación web moderna para reservas de autobús construida con React, TypeScript, Tailwind CSS y Supabase.

## ✨ Características

- 🔍 Búsqueda de viajes por origen, destino y fecha
- 💺 Selección interactiva de asientos
- 📄 Generación automática de facturas en PDF
- 📧 Envío de confirmaciones por email
- 📱 Diseño completamente responsive
- ♿ Accesibilidad web (WCAG)

## 🚀 Despliegue con Docker

### Opción 1: Usar imagen de Docker Hub (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/emilioale04/bus-reservation-app.git
cd bus-reservation-app/bus-reservation-app

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 3. Ejecutar con docker-compose
docker-compose up -d
```

La aplicación estará disponible en: <http://localhost:8080>

### Opción 2: Construir imagen localmente

```bash
# 1. Construir la imagen
docker build -t bus-reservation-app .

# 2. Ejecutar el contenedor
docker run -p 8080:80 --env-file ./.env.local bus-reservation-app
```

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 📦 Tecnologías

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Email**: EmailJS
- **PDF**: jsPDF, html2canvas
- **Despliegue**: Docker, Nginx

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run lint` - Ejecutar ESLint
- `npm run init-supabase` - Configurar base de datos
