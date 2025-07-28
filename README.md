# 🚌 Sistema de Reservas de Autobuses

Sistema web para reservar asientos de autobuses interprovinciales.
Proyecto de la asignatura Usabilidad y Accesibilidad.

## 🚀 Tecnologías

- React + TypeScript + Vite
- Tailwind CSS
- Supabase

## ⚙️ Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

3. **Agregar credenciales de Supabase en `.env.local`:**
```env
VITE_SUPABASE_URL=tu-url-aqui
VITE_SUPABASE_ANON_KEY=tu-clave-aqui
```

4. **Iniciar el proyecto**
```bash
npm run dev
```

## 📋 Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Construir para producción
```

## 🎯 Estado Actual

- ✅ Página de inicio
- 🚧 Búsqueda de rutas
- 🚧 Selección de asientos
- 🚧 Reservas y pagos
