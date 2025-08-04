#!/bin/sh

# Script para reemplazar variables de entorno en los archivos estáticos de React

# Ruta a los archivos construidos
ROOT_DIR=/usr/share/nginx/html

# Obtener la lista de variables de entorno que comienzan con VITE_
# y que están definidas en el entorno actual.
VARS_TO_REPLACE=$(printenv | grep ^VITE_ | awk -F= '{print $1}')

echo "=== DEBUG: Variables de entorno disponibles ==="
printenv | grep ^VITE_ | while read line; do
  echo "  $line"
done

echo "=== Variables encontradas para reemplazar ==="
echo "$VARS_TO_REPLACE"

echo "Reemplazando variables en los archivos de $ROOT_DIR..."

# Iterar sobre cada variable encontrada
for VAR_NAME in $VARS_TO_REPLACE
do
  # Obtener el valor de la variable
  VAR_VALUE=$(printenv $VAR_NAME)
  
  echo "  - Variable: $VAR_NAME"
  
  # Escapar caracteres especiales en el valor para sed
  VAR_VALUE_ESCAPED=$(printf '%s\n' "$VAR_VALUE" | sed -e 's/[\/&]/\\&/g')

  echo "  - Reemplazando placeholder para $VAR_NAME en archivos..."
  
  # Buscar archivos que contengan el placeholder antes del reemplazo
  FILES_WITH_PLACEHOLDER=$(find $ROOT_DIR -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) -exec grep -l "__${VAR_NAME}__" {} \;)
  
  if [ -n "$FILES_WITH_PLACEHOLDER" ]; then
    echo "    Archivos que contienen el placeholder:"
    echo "$FILES_WITH_PLACEHOLDER" | while read file; do
      echo "      - $file"
    done
  else
    echo "    ⚠️  No se encontraron archivos con el placeholder __${VAR_NAME}__"
  fi
  
  # Usar find y sed para reemplazar el placeholder en todos los archivos JS y CSS
  # Ahora buscamos el placeholder personalizado __VITE_NOMBRE_VARIABLE__
  find $ROOT_DIR -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) -exec sed -i "s|__${VAR_NAME}__|$VAR_VALUE_ESCAPED|g" {} +
  
  # Verificar si el reemplazo fue exitoso
  FILES_STILL_WITH_PLACEHOLDER=$(find $ROOT_DIR -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) -exec grep -l "__${VAR_NAME}__" {} \;)
  
  if [ -z "$FILES_STILL_WITH_PLACEHOLDER" ]; then
    echo "    ✅ Reemplazo exitoso para $VAR_NAME"
  else
    echo "    ❌ Algunos archivos aún contienen el placeholder:"
    echo "$FILES_STILL_WITH_PLACEHOLDER" | while read file; do
      echo "      - $file"
    done
  fi
  
  echo ""
done

echo "=== RESUMEN FINAL ==="
echo "Reemplazo completado."

# Mostrar algunos archivos para verificar el contenido final
echo "=== Verificación final - Contenido de archivos principales ==="
find $ROOT_DIR -name "*.js" -type f | head -2 | while read file; do
  echo "Archivo: $file"
  echo "Primeras líneas del archivo:"
  head -10 "$file" | grep -E "(VITE_|import\.meta\.env)" || echo "  (No se encontraron referencias a VITE_)"
  echo ""
done

# Inicia el proceso principal del contenedor (Nginx)
# "exec" reemplaza el proceso del shell con nginx, que es una buena práctica.
exec nginx -g 'daemon off;'