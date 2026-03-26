# Guía de Despliegue

## Build de Producción

```bash
npm run build
```

Esto genera la carpeta `dist/` con los archivos optimizados.

## Opciones de Despliegue

### 1. Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### 2. Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### 3. GitHub Pages
```bash
# Agregar en vite.config.ts:
base: '/clear-minds-lms/'

# Build y deploy
npm run build
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

### 4. Servidor Propio
```bash
npm run build
# Copiar carpeta dist/ al servidor
# Configurar nginx/apache para servir archivos estáticos
```

## Variables de Entorno

Crear archivo `.env`:

```
VITE_API_URL=https://api.clearminds.com
VITE_GOOGLE_CLIENT_ID=your_client_id
```

## Configuración de Producción

### Nginx
```nginx
server {
    listen 80;
    server_name clearminds.com;
    root /var/www/clear-minds-lms;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Checklist Pre-Deploy

- [ ] Actualizar URLs de API
- [ ] Configurar Google OAuth
- [ ] Optimizar imágenes
- [ ] Configurar analytics
- [ ] Configurar error tracking (Sentry)
- [ ] Configurar CDN para assets
- [ ] Habilitar HTTPS
- [ ] Configurar cache headers
