# HermesPOS - Partición Inventario

Módulo especializado en la gestión integral del inventario: visualización, carga y ajuste de stock.

## 📋 Funcionalidades

- **Visualizar Inventario**
  - Vista completa del inventario de productos
  - Filtrar por código y nombre
  - Información de cantidad, lote y fecha de vencimiento
  - Tabla interactiva con AG-Grid

- **Movimientos de Inventario**
  - Registro de entradas y salidas
  - Filtrar por tipo de producto, código, fecha y tipo de movimiento
  - Historial completo de movimientos
  - Trazabilidad por lotes

- **Cargar Inventario**
  - Agregar productos al inventario
  - Soporte para lotes y fechas de vencimiento
  - Manejo de presentaciones (cajas/unidades)
  - Validaciones automáticas

- **Ajuste de Inventario**
  - Corregir discrepancias de stock
  - Gestión de lotes específicos
  - Cálculos automáticos de presentaciones
  - Registro de ajustes en movimientos

## 🚀 Inicio Rápido

```bash
cd HermesPOS-Inventario
npm install
npm run dev
```

Accede a `http://localhost:5173`

## 📂 Estructura

```
src/
├── components/        # Componentes reutilizables
│   ├── AjusteInventario.vue
│   └── ...
├── views/            # Páginas principales
│   ├── Inventario.vue
│   ├── MovimientoInventario.vue
│   └── ...
├── App.vue           
└── main.js           
```

## 🔐 Autenticación

Se requiere login con usuario y contraseña.

## 📊 Base de Datos

- Colección: `inventario` - Stock actual de productos
- Colección: `movimientoInventario` - Historial de movimientos
- Colección: `productos` - Catálogo de productos

Estructura de Inventario:
```
{
  idProducto: string,
  cantidad: number,
  unidad: number,
  lotes: [{
    lote: string,
    cantidad: number,
    unidad: number,
    fecha: timestamp
  }]
}
```

## 🎨 Tema

- Color primario: #004E7C (Azul marino)
- Color secundario: #E0A800 (Amarillo/Oro)

## 📝 Características Especiales

- **Lotes**: Rastreo por lote y fecha de vencimiento
- **Presentaciones**: Soporte para productos con presentación (cajas/unidades)
- **Validaciones**: 
  - Cantidad no puede ser negativa
  - Unidades validadas según presentación
  - Fechas de vencimiento no pueden ser pasadas
- **Cálculos Automáticos**: Conversión entre cajas y unidades

## 🔧 Desarrollo

Variables de entorno requeridas:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## ✅ Testing

1. Ejecuta `npm run dev`
2. Accede a http://localhost:5173
3. Inicia sesión
4. Navega al módulo de Inventario desde el dashboard
5. Prueba cargar inventario y ajustar stock

## 📞 Soporte

Para reportar errores o solicitar funcionalidades, contacta al equipo de desarrollo.
