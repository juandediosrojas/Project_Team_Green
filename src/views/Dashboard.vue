<!-- src/views/Dashboard.vue -->
<template>
    <div class="dashboard-container" :class="{ 'light-mode': !isDarkMode }">
        <div class="container">
            <h1 class="dashboard-title">
                <span class="title-gradient">Indicadores</span>
            </h1>

            <div class="columns is-multiline">
                <div class="column is-half" v-for="(option, index) in chartOptions" :key="index">
                    <div class="chart-card" :style="{ animationDelay: `${index * 0.1}s` }">
                        <ag-charts :options="option"></ag-charts>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Vue Chart Component
import { AgCharts } from 'ag-charts-vue3';
import { ref, onMounted, computed, watch } from 'vue';
import { db, collection, getDocs, query, orderBy, limit, where } from '../firebase';

export default {
    name: 'Dashboard',
    components: {
        'ag-charts': AgCharts,
    },
    setup() {
        const isDarkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

        // Escuchar cambios en la preferencia del sistema
        onMounted(() => {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e) => {
                isDarkMode.value = e.matches;
            };
            mediaQuery.addEventListener('change', handler);
        });

        // Configuración base mejorada para todos los gráficos
        const createBaseOptions = (title, subtitle, seriesType) => ({
            theme: {
                baseTheme: isDarkMode.value ? 'ag-vivid-dark' : 'ag-vivid',
                palette: {
                    fills: ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
                    strokes: ['#1e40af', '#0891b2', '#6d28d9', '#059669', '#d97706'],
                },
                overrides: {
                    common: {
                        title: {
                            fontSize: 22,
                            fontWeight: 'bold',
                            color: isDarkMode.value ? '#ffffff' : '#1e293b',
                        },
                        subtitle: {
                            fontSize: 14,
                            color: isDarkMode.value ? '#94a3b8' : '#64748b',
                        },
                        background: {
                            fill: 'transparent',
                        },
                    },
                    bar: {
                        series: {
                            strokeWidth: 0,
                            cornerRadius: 8,
                            fillOpacity: 1,
                            shadow: {
                                enabled: true,
                                color: isDarkMode.value ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                                xOffset: 0,
                                yOffset: 4,
                                blur: 8,
                            },
                        },
                    },
                    line: {
                        series: {
                            strokeWidth: 3,
                            marker: {
                                enabled: true,
                                size: 8,
                                strokeWidth: 2,
                            },
                        },
                    },
                },
            },
            title: { text: title },
            subtitle: { text: subtitle },
            data: [],
            series: [{
                type: seriesType,
                xKey: seriesType === 'bar' ? 'codigo' : 'nombre',
                yKey: 'cantidad',
                yName: 'Cantidad',
                tooltip: {
                    renderer: (params) => ({
                        title: params.datum.nombre,
                        content: `Cantidad: ${params.datum.cantidad}`,
                    }),
                },
            }],
            axes: [
                {
                    type: 'category',
                    position: 'bottom',
                    label: {
                        rotation: -45,
                        fontSize: 11,
                        color: isDarkMode.value ? '#94a3b8' : '#64748b',
                    },
                    line: {
                        width: 1,
                        color: isDarkMode.value ? '#475569' : '#cbd5e1'
                    },
                    gridLine: { enabled: false },
                },
                {
                    type: 'number',
                    position: 'left',
                    min: 0,
                    label: {
                        fontSize: 12,
                        color: isDarkMode.value ? '#94a3b8' : '#64748b',
                    },
                    line: {
                        width: 1,
                        color: isDarkMode.value ? '#475569' : '#cbd5e1'
                    },
                    gridLine: {
                        enabled: true,
                        style: [{
                            stroke: isDarkMode.value ? '#334155' : '#e2e8f0',
                            lineDash: [4, 4]
                        }],
                    },
                },
            ],
        });

        const options = ref(createBaseOptions('Productos con Más Stock', 'Top 5 productos disponibles', 'bar'));
        const options2 = ref(createBaseOptions('Clientes con Más Compras', 'Últimos 30 días', 'line'));
        const options3 = ref(createBaseOptions('Producto con Más Movimientos', 'Últimos 30 días', 'bar'));
        const options4 = ref(createBaseOptions('Servicios con Más Movimientos', 'Últimos 30 días', 'line'));

        // Actualizar tema de los gráficos cuando cambie el modo
        watch(isDarkMode, () => {
            const updateOptions = (opt) => {
                return {
                    ...opt,
                    theme: {
                        ...opt.theme,
                        baseTheme: isDarkMode.value ? 'ag-vivid-dark' : 'ag-vivid',
                        overrides: {
                            ...opt.theme.overrides,
                            common: {
                                ...opt.theme.overrides.common,
                                title: {
                                    ...opt.theme.overrides.common.title,
                                    color: isDarkMode.value ? '#ffffff' : '#1e293b',
                                },
                                subtitle: {
                                    ...opt.theme.overrides.common.subtitle,
                                    color: isDarkMode.value ? '#94a3b8' : '#64748b',
                                },
                            },
                            bar: {
                                series: {
                                    ...opt.theme.overrides.bar.series,
                                    shadow: {
                                        ...opt.theme.overrides.bar.series.shadow,
                                        color: isDarkMode.value ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
                                    },
                                },
                            },
                        },
                    },
                    axes: opt.axes.map(axis => ({
                        ...axis,
                        label: {
                            ...axis.label,
                            color: isDarkMode.value ? '#94a3b8' : '#64748b',
                        },
                        line: {
                            ...axis.line,
                            color: isDarkMode.value ? '#475569' : '#cbd5e1',
                        },
                        gridLine: axis.gridLine ? {
                            ...axis.gridLine,
                            style: [{
                                stroke: isDarkMode.value ? '#334155' : '#e2e8f0',
                                lineDash: [4, 4]
                            }],
                        } : axis.gridLine,
                    })),
                };
            };

            options.value = updateOptions(options.value);
            options2.value = updateOptions(options2.value);
            options3.value = updateOptions(options3.value);
            options4.value = updateOptions(options4.value);
        });

        const chartOptions = computed(() => [options.value, options2.value, options3.value, options4.value]);

        // =====================
        //  TOP PRODUCTOS POR STOCK
        // =====================
        const loadProducts = async () => {
            try {
                // Obtener TODOS los documentos de inventario
                const inventarioSnapshot = await getDocs(collection(db, 'inventario'), { source: "cache" });

               //  console.log(' Total docs inventario:', inventarioSnapshot.docs.length);

                // Procesar y filtrar datos
                const inventarioData = [];
                inventarioSnapshot.forEach(d => {
                    const data = d.data();
                    const cantidad = Number(data.cantidad) || 0;
                //    //  console.log(' Inventario item:', {
                //         id: d.id,
                //         cantidad,
                //         idProducto: data.idProducto
                //     });

                    // Solo agregar si tiene cantidad positiva
                    if (cantidad > 0 && data.idProducto) {
                        inventarioData.push({
                            idProducto: data.idProducto,
                            cantidad
                        });
                    }
                });

               // //  console.log(' Items con stock positivo:', inventarioData.length);

                if (inventarioData.length === 0) {
                    console.warn('⚠️ No hay productos con stock positivo');
                    return;
                }

                // Ordenar por cantidad descendente y tomar top 5
                inventarioData.sort((a, b) => b.cantidad - a.cantidad);
                const top5 = inventarioData.slice(0, 5);

               //  console.log(' Top 5 productos:', top5);

                const productIds = top5.map(p => p.idProducto);

                // Obtener nombres de productos
                const productsQuery = query(collection(db, 'productos'), where('__name__', 'in', productIds));
                const productsSnapshot = await getDocs(productsQuery, { source: "cache" });

                const productsMap = new Map();
                productsSnapshot.forEach(doc => {
                    productsMap.set(doc.id, doc.data());
                   //  console.log(' Producto:', doc.id, doc.data().nombre);
                });

                // Crear array final para el gráfico
                const topProducts = top5.map(p => ({
                    codigo: productsMap.get(p.idProducto)?.codigo || 0,
                    nombre: productsMap.get(p.idProducto)?.nombre || 'Producto',
                    cantidad: p.cantidad
                }));

               //  console.log('DATOS FINALES PARA GRÁFICO:', JSON.stringify(topProducts, null, 2));

                // Actualizar opciones del gráfico - IMPORTANTE: crear nuevo objeto para que Vue detecte el cambio
                options.value = {
                    ...options.value,
                    data: topProducts
                };
            } catch (e) {
                console.error('❌ Error cargando productos:', e);
            }
        };

        // =====================
        //  TOP CLIENTES POR FACTURAS
        // =====================
        const loadTopClients = async () => {
            try {
                const hoy = new Date();
                const hace30 = new Date();
                hace30.setDate(hoy.getDate() - 30);

                const facturasQuery = query(
                    collection(db, 'factura'),
                    where('fecha', '>=', hace30)
                );
                const facturasSnapshot = await getDocs(facturasQuery, { source: "cache" });

                const clientCountMap = new Map();
                facturasSnapshot.forEach(doc => {
                    const idCliente = doc.data().idCliente;
                    if (idCliente) {
                        clientCountMap.set(idCliente, (clientCountMap.get(idCliente) || 0) + 1);
                    }
                });

                const topClients = Array.from(clientCountMap.entries())
                    .map(([idCliente, count]) => ({ idCliente, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                if (topClients.length === 0) {
                   //  console.log('No hay facturas recientes');
                    return;
                }

                const clientIds = topClients.map(c => c.idCliente);

                const clientsQuery = query(collection(db, 'clientes'), where('__name__', 'in', clientIds));
                const clientsSnapshot = await getDocs(clientsQuery, { source: "cache" });

                const clientsMap = new Map();
                clientsSnapshot.forEach(doc => clientsMap.set(doc.id, doc.data()));

                const topClientsData = topClients
                    .map(c => ({
                        nombre: clientsMap.get(c.idCliente)?.nombre || 'Cliente',
                        cantidad: c.count
                    }))
                    .filter(c => c.nombre !== 'Cliente');

               //  console.log(' Clientes finales para gráfico:', topClientsData);
                options2.value = {
                    ...options2.value,
                    data: topClientsData
                };
            } catch (e) {
                console.error('❌ Error cargando clientes:', e);
            }
        };

        // =====================
        //  TOP PRODUCTOS CON MÁS MOVIMIENTOS
        // =====================
        const loadTopMovingProducts = async () => {
            try {
                const hoy = new Date();
                const hace30 = new Date(hoy);
                hace30.setDate(hoy.getDate() - 30);

                // Ahora cada doc en 'movimientoInventario' tiene como id el id del producto
                // y un array 'list' con objetos { cantidad, fecha, tipo }
                const movimientosSnapshot = await getDocs(collection(db, 'movimientoInventario'), { source: "cache" });

                const productMovementMap = new Map();

                movimientosSnapshot.forEach(doc => {
                    const idProducto = doc.id;
                    const data = doc.data() || {};
                    const list = Array.isArray(data.movimientos) ? data.movimientos : [];

                    let countEnRango = 0;

                    list.forEach(item => {
                        if (!item) return;

                        // Normalizar fecha (puede ser Timestamp, Date, string o número)
                        let fechaItem;
                        const f = item.fecha;
                        if (f && typeof f.toDate === 'function') {
                            fechaItem = f.toDate();
                        } else if (f instanceof Date) {
                            fechaItem = f;
                        } else if (typeof f === 'string' || typeof f === 'number') {
                            const parsed = new Date(f);
                            if (!isNaN(parsed)) fechaItem = parsed;
                        }

                        if (!fechaItem) return;

                        // Filtrar por últimos 30 días
                        if (fechaItem >= hace30 && fechaItem <= hoy) {
                            countEnRango += 1; // contamos cantidad de movimientos
                        }
                    });

                    if (countEnRango > 0) {
                        productMovementMap.set(idProducto, countEnRango);
                    }
                });

                const topMovingProducts = Array.from(productMovementMap.entries())
                    .map(([idProducto, count]) => ({ idProducto, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                if (topMovingProducts.length === 0) {
                   //  console.log('No hay movimientos recientes');
                    options3.value = { ...options3.value, data: [] };
                    return;
                }

                const ids = topMovingProducts.map(p => p.idProducto);
                const productsQuery = query(collection(db, 'productos'), where('__name__', 'in', ids));
                const productsSnapshot = await getDocs(productsQuery, { source: "cache" });

                const productsMap = new Map();
                productsSnapshot.forEach(doc => productsMap.set(doc.id, doc.data()));

                const topData = topMovingProducts
                    .map(p => ({
                        codigo: productsMap.get(p.idProducto)?.codigo || 0,
                        nombre: productsMap.get(p.idProducto)?.nombre || 'Producto',
                        cantidad: p.count
                    }))
                    .filter(p => p.nombre !== 'Producto');

               //  console.log(' Movimientos finales para gráfico (últimos 30 días):', topData);
                options3.value = {
                    ...options3.value,
                    data: topData
                };
            } catch (e) {
                console.error('❌ Error cargando movimientos de productos:', e);
            }
        };

        const loadInventarioProxVencer = async () => {
            // Implementar si es necesario
        };
        onMounted(() => {
            loadProducts();
            loadTopClients();
            loadTopMovingProducts();
            loadInventarioProxVencer();
        });

        return {
            options,
            options2,
            options3,
            options4,
            chartOptions,
            isDarkMode,
        };
    },
};
</script>

<style scoped>
.dashboard-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    padding: 2rem 0;
    transition: background 0.5s ease;
}

.dashboard-container.light-mode {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%);
}

.dashboard-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 2rem;
    text-align: center;
    animation: fadeInDown 0.6s ease-out;
}

.title-gradient {
    background: linear-gradient(135deg, #e0a800 0%, #fbbf24 50%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.4));
    animation: shimmer 3s ease-in-out infinite;
    background-size: 200% auto;
}

@keyframes shimmer {

    0%,
    100% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }
}

.chart-card {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.3),
        0 10px 20px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(71, 85, 105, 0.3);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeInUp 0.6s ease-out backwards;
    position: relative;
    overflow: hidden;
    min-height: 400px;
}

.light-mode .chart-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
    box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.05),
        0 10px 20px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(226, 232, 240, 0.8);
}

.chart-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
            transparent,
            rgba(59, 130, 246, 0.1),
            transparent);
    transition: left 0.6s ease;
}

.light-mode .chart-card::before {
    background: linear-gradient(90deg,
            transparent,
            rgba(59, 130, 246, 0.05),
            transparent);
}

.chart-card:hover::before {
    left: 100%;
}

.chart-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.4),
        0 20px 40px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border-color: rgba(59, 130, 246, 0.5);
}

.light-mode .chart-card:hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.1),
        0 20px 40px rgba(59, 130, 246, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 1);
    border-color: rgba(59, 130, 246, 0.4);
}

/* Mejora el aspecto del contenedor de AG Charts */
.chart-card :deep(.ag-chart-wrapper) {
    border-radius: 0.5rem;
    background: rgba(15, 23, 42, 0.4);
    min-height: 350px;
}

.light-mode .chart-card :deep(.ag-chart-wrapper) {
    background: rgba(248, 250, 252, 0.5);
}

/* Animaciones */
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Efectos de resplandor para los gráficos */
.chart-card:nth-child(1):hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.4),
        0 20px 40px rgba(59, 130, 246, 0.3);
}

.chart-card:nth-child(2):hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.4),
        0 20px 40px rgba(6, 182, 212, 0.3);
}

.chart-card:nth-child(3):hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.4),
        0 20px 40px rgba(139, 92, 246, 0.3);
}

.chart-card:nth-child(4):hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.4),
        0 20px 40px rgba(16, 185, 129, 0.3);
}

.light-mode .chart-card:nth-child(1):hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.1),
        0 20px 40px rgba(59, 130, 246, 0.2);
}

.light-mode .chart-card:nth-child(2):hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.1),
        0 20px 40px rgba(6, 182, 212, 0.2);
}

.light-mode .chart-card:nth-child(3):hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.1),
        0 20px 40px rgba(139, 92, 246, 0.2);
}

.light-mode .chart-card:nth-child(4):hover {
    box-shadow:
        0 8px 16px rgba(0, 0, 0, 0.1),
        0 20px 40px rgba(16, 185, 129, 0.2);
}

/* Responsividad mejorada */
@media screen and (max-width: 768px) {
    .dashboard-title {
        font-size: 2rem;
    }

    .chart-card {
        padding: 1rem;
    }
}
</style>