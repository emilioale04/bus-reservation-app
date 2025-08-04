# ---- Etapa 1: Construcción (Build) ----
# Usamos una imagen de Node para construir el proyecto
FROM node:20-alpine AS build

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos del proyecto
COPY . .

# ¡Importante! Construimos SIN variables de entorno para que Vite deje placeholders
# Vite usará 'undefined' para variables no definidas, que luego reemplazaremos
RUN npm run build

# ---- Etapa 2: Producción (Production) ----
# Usamos una imagen de Nginx muy ligera para servir los archivos
FROM nginx:1.27-alpine

# Copiamos los archivos estáticos construidos de la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos una configuración personalizada de Nginx (opcional pero recomendado)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el script que se ejecutará al iniciar el contenedor
COPY entrypoint.sh /entrypoint.sh

# Damos permisos de ejecución al script
RUN chmod +x /entrypoint.sh

# Exponemos el puerto 80
EXPOSE 80

# Usamos nuestro script como el punto de entrada del contenedor
ENTRYPOINT ["/entrypoint.sh"]