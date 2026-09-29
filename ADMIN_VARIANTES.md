# Administrador de imágenes por producto y variante

- Un producto = una tarjeta.
- Imagen general heredada por variantes sin específica.
- Selección múltiple: una sola subida física se comparte entre variantes.
- Imagen específica tiene prioridad sobre general; luego se usa la imagen histórica del Sheets.
- Las asociaciones se guardan dinámicamente en un registro JSON dentro de Cloudinary.
- La web pública resuelve: específica > general > histórica > sin imagen.
- No requiere rebuild para cada cambio de imagen.

Variables requeridas (configurarlas en `.env.local` y Vercel, nunca en Git):
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
