# Administrador de imágenes — A Todo Trapo

## Variables de entorno necesarias
Configurar en `.env.local` para pruebas y en Vercel > Project Settings > Environment Variables para producción:

- `ADMIN_PASSWORD`: contraseña que usará el dueño en `/admin`.
- `ADMIN_SESSION_SECRET`: frase aleatoria larga (mínimo recomendado 32 caracteres).
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: `equm866o`.
- `CLOUDINARY_API_KEY`: API Key de Cloudinary.
- `CLOUDINARY_API_SECRET`: API Secret de Cloudinary. Nunca exponerla al navegador.

## Funcionamiento
Google Sheets sigue siendo la fuente de datos. `/admin` lee esos productos y permite subir una imagen por variante directamente a Cloudinary. La imagen administrada tiene prioridad; si no existe, la web conserva la imagen actual del Sheets. Cambiar o eliminar una imagen no requiere build ni Git.

## Seguridad
La subida y eliminación se realizan exclusivamente desde rutas del servidor protegidas por cookie HttpOnly firmada. Se aceptan JPG, PNG y WebP hasta 12 MB.
