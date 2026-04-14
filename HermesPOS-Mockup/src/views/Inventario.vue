<template>
    <div class="container p-2">
        <h1 class="title">Inventario de Productos</h1>

        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end" style="gap: 15px;"
            :class="{ 'is-flex-direction-column': isMobile }">
            <div class="field">
                <label class="label"> Código </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroCodigo" placeholder="Código Producto" />
                </div>
            </div>
            <div class="field">
                <label class="label"> Nombre producto </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroNombre" placeholder="Nombre Producto" />
                </div>
            </div>
        </div>

        <div class="is-flex is-justify-content-flex-end mb-2 mt-2" :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarInventario" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>

        <div class="buttons mb-3">

        </div>
        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                :rowData="inventario" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="20" />
        </div>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import { db, storage, collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getStorage, ref, uploadBytes, getDownloadURL } from '../firebase';


export default {
    name: 'Inventario',
    data() {
        return {
            isMobile: false,
            filtroCodigo: '',
            filtroNombre: '',
            isLoading: false,
            inventario: [],
            productos: [],
            columnDefs: [
                {
                    headerName: 'Código', field: 'codigo', width: 170, sortable: true, filter: 'agNumberColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }, sort: 'desc'
                },
                {
                    headerName: 'Nombre', field: 'nombre', sortable: true, flex: 1, filter: true, filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Cantidad', field: 'cantidad', sortable: true, width: 110, filter: 'agNumberColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                                {
                    headerName: 'Unidad', field: 'unidad', sortable: true, width: 110, filter: 'agNumberColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Lote', field: 'lote', sortable: true, width: 170, filter: true, filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Fecha Vencimiento', field: 'fechaLote', sortable: true, width: 170, filter: true, filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
            ],
            gridOptions: {
                localeText: this.$agGridLocaleText,
                paginationPageSizeSelector: false
                ,
                enableBrowserTooltips: true,
                defaultColDef: {
                    wrapHeaderText: true,
                    floatingFilter: true, 
                    filterParams: {
                        buttons: ['apply', 'reset'],
                        closeOnApply: true
                    },
                    tooltipValueGetter: (p) => (p.value != null ? String(p.value) : '')
                },
                onCellDoubleClicked: async (params) => {
                    const text = params.value != null ? String(params.value) : '';
                    try {
                        await navigator.clipboard.writeText(text);
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'Copiado al portapapeles',
                            showConfirmButton: false,
                            timer: 1200
                        });
                    } catch {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'error',
                            title: 'No se pudo copiar',
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                }
            }

        };
    },
    methods: {
        updateIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        async consultarInventario() {
            this.isLoading = true;

            try {
                Swal.fire({
                    title: "Buscando..",
                    text: "Por favor, espera un momento.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    },
                });

                // Limpiar inventario y productos
                this.inventario = [];
                this.productos = [];

                // Filtros de búsqueda
                const filtros = [];
                if (this.filtroCodigo) {
                    filtros.push(where('codigo', '==', this.filtroCodigo));
                }
                if (this.filtroNombre) {
                    filtros.push(where('nombre', '>=', this.filtroNombre));
                    filtros.push(where('nombre', '<=', this.filtroNombre + '\uf8ff'));
                }

                // Obtener productos con los filtros
                const productosQuery = query(collection(db, 'productos'), ...filtros);
                const productosSnapshot = await getDocs(productosQuery);

                if (productosSnapshot.empty) {
                    Swal.fire('No se encontraron productos', '', 'info');
                    return;
                }

                // Convertir los productos a un Map para búsqueda rápida por ID
                const productosMap = new Map(productosSnapshot.docs.map(doc => [doc.id, doc.data()]));

                // Consultar inventario relacionado
                const inventarioIds = Array.from(productosMap.keys());
                if (inventarioIds.length > 10) {
                    Swal.fire('Demasiados resultados', 'Reduce los filtros para realizar la búsqueda.', 'warning');
                    return;
                }

                const inventarioQuery = query(collection(db, 'inventario'), where('idProducto', 'in', inventarioIds));
                const inventarioSnapshot = await getDocs(inventarioQuery);

                if (inventarioSnapshot.empty) {
                    Swal.fire('No se encontraron datos de inventario', '', 'info');
                    return;
                }

                // Combinar datos de productos con inventario
                this.inventario = inventarioSnapshot.docs.flatMap(doc => {
                    const data = doc.data();
                    const producto = productosMap.get(data.idProducto) || {};
                    const filas = [];

                    // Agregar filas por cada lote
                    if (data.lotes?.length) {
                        data.lotes.forEach(lote => {
                            filas.push({
                                codigo: producto.codigo || '',
                                nombre: producto.nombre || '',
                                lote: lote.lote || '',
                                fechaLote: lote.fecha ? new Date(lote.fecha.seconds * 1000).toLocaleDateString() : 'Sin fecha',
                                cantidad: lote.cantidad || 0,
                                unidad: lote.unidad || 0
                            });
                        });
                    }

                    // Agregar fila con cantidad general (sin lote)
                    filas.push({
                        codigo: producto.codigo || '',
                        nombre: producto.nombre || '',
                        lote: 'Sin lote',
                        cantidad: data.cantidad || 0,
                        unidad: data.unidad || 0,
                        fechaLote: 'Sin fecha'
                    });

                    return filas;
                });

                // console.log(this.inventario);
                Swal.close();

            } catch (error) {
                console.error('Error al consultar el inventario', error);
                Swal.fire('Error', error.message || 'Error al consultar el inventario.', 'error');
            } finally {
                this.isLoading = false;
            }
        },
    },
    mounted() {
        this.updateIsMobile();
        window.addEventListener('resize', this.updateIsMobile);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.updateIsMobile);
    },
};
</script>

<style scoped></style>