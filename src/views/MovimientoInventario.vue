<template>

    <div class="container p-2">
        <h1 class="title">Movimiento Inventario</h1>
        <p class="is-size-7 has-text-danger">* Campos obligatorios</p>
        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end" style="gap: 8px;"
            :class="{ 'is-flex-direction-column': isMobile }">
            <div class="field">
                <label class="label"> Tipo </label>
                <div class="select is-fullwidth">
                    <select v-model="filtroTipoProducto">
                        <option value="" selected>TODOS</option>
                        <option value="producto">PRODUCTOS</option>
                        <option value="servicio">SERVICIOS</option>
                    </select>
                </div>
            </div>

            <div class="field">
                <label class="label"> Código </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroCodigo" placeholder="Código" />
                </div>
            </div>

            <div class="field">
                <label class="label has-text-danger">* Fecha Inicial </label>
                <div class="control">
                    <input class="input" type="date" v-model="filtroFechaIni" placeholder="Fecha del Servicio" />
                </div>
            </div>
            <div class="field">
                <label class="label has-text-danger">* Fecha Final</label>
                <div class="control">
                    <input class="input" type="date" v-model="filtroFechaFin" placeholder="Fecha del Servicio" />
                </div>
            </div>
            <div class="field">
                <label class="label"> Tipo Movimiento </label>
                <div class="select is-fullwidth">
                    <select v-model="filtroTipoMovimiento">
                        <option value="" selected>TODOS</option>
                        <option value="entrada">ENTRADA</option>
                        <option value="salida">SALIDA</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="is-flex is-justify-content-flex-end mb-2 mt-2" :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarMovInventario" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>

        <div class="buttons mb-3">

        </div>

        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                :rowData="movProductos" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="10" />
        </div>

    </div>
</template>

<script>
import Swal from 'sweetalert2';
import { db, Timestamp, collection, getDoc, getDocs, query, where, doc, ref } from '../firebase';

export default {
    name: 'MovimientoInventario',
    data() {
        return {
            isMobile: false,
            isLoading: false,
            servicios: [],
            productos: [],
            movProductos: [],
            filtroTipoProducto: '',
            filtroCodigo: '',
            filtroFechaIni: '',
            filtroFechaFin: '',
            filtroTipoMovimiento: '',
            columnDefs: [
                {
                    headerName: 'Producto/Servicio',
                    field: 'tipoObjeto',
                    sortable: true,
                    width: 100,
                    filter: true,
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    wrapHeaderText: true,
                    autoHeaderHeight: true
                },
                {
                    headerName: 'Código',
                    field: 'codigo',
                    sortable: true,
                    width: 120,
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    sort: 'desc',
                    wrapHeaderText: true,
                    autoHeaderHeight: true
                },
                {
                    headerName: 'Nombre',
                    field: 'nombre',
                    sortable: true,
                    flex: 1,
                    filter: true,
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    wrapText: true,
                    wrapHeaderText: true,
                },
                {
                    headerName: 'Tipo Movimiento',
                    field: 'tipo',
                    sortable: true,
                    filter: true,
                    width: 130,
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    wrapHeaderText: true,
                },
                {
                    headerName: 'Cantidad',
                    field: 'cantidad',
                    sortable: true,
                    width: 90,
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    wrapHeaderText: true,
                },
                {
                    headerName: 'Unidad',
                    field: 'unidad',
                    sortable: true,
                    width: 90,
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    wrapHeaderText: true,
                },
                {
                    headerName: 'Lote',
                    field: 'lote',
                    sortable: true,
                    filter: true,
                    width: 140,
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    wrapHeaderText: true,
                },
                {
                    headerName: 'Fecha Vencimiento',
                    field: 'fechaLote',
                    sortable: true,
                    width: 140,
                    filter: true,
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    wrapHeaderText: true,
                },
                {
                    headerName: 'Fecha Movimiento',
                    field: 'fecha',
                    sortable: true,
                    filter: true,
                    width: 160,
                    filterParams: { filterOptions: ['contains', 'equals'] },
                    wrapHeaderText: true,

                },
            ],
            gridOptions: {
                defaultColDef: {
                    ...this.$agGridEvents, ...this.$agGridDefaultColDef, floatingFilter: true,
                    filterParams: {
                        buttons: ['apply', 'reset'],
                        closeOnApply: true
                    },
                    wrapHeaderText: true
                },
                localeText: this.$agGridLocaleText,
                paginationPageSizeSelector: false
            }
        };
    },
    methods: {
        updateIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        async consultarMovInventario() {
            this.isLoading = true;
            if (this.filtroFechaIni === '' || this.filtroFechaFin === '') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Las fechas son obligatorias',
                });
                this.isLoading = false;
                return;
            }
            if (this.filtroFechaIni > this.filtroFechaFin) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'La fecha inicial no puede ser mayor a la fecha final',
                });
                this.isLoading = false;
                return;
            }
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

                this.servicios = [];
                this.productos = [];
                this.movProductos = [];

                const filtros = [];
                if (this.filtroTipoProducto) {
                    filtros.push(where('tipoObjeto', '==', this.filtroTipoProducto));
                }
                // No se puede filtrar por tipo de movimiento en Firestore cuando es un array de objetos.
                // Se filtra por tipo y fecha en memoria más abajo (listaFiltrada).
                // console.log("Filtros aplicados:", filtros);
                const q = query(collection(db, 'movimientoInventario'), ...filtros);
                const querySnapshot = await getDocs(q);
                const movProductosTemp = [];

                const productoRefs = [];
                const servicioRefs = [];

                for (const document of querySnapshot.docs) {
                    // console.log("Procesando documento:", document.id);
                    let movData = document.data();
                    const lista = movData.movimientos || [];

                    // Filtrar por fechas y tipo de movimiento
                    const listaFiltrada = lista.filter(item => {
                        if (!item.fecha) return false;

                        const fechaItem = item.fecha.toDate();
                        const [yearIni, monthIni, dayIni] = this.filtroFechaIni.split('-');
                        const fechaIni = new Date(yearIni, monthIni - 1, dayIni, 0, 0, 0);
                        const [yearFin, monthFin, dayFin] = this.filtroFechaFin.split('-');
                        const fechaFin = new Date(yearFin, monthFin - 1, dayFin, 23, 59, 59);

                        const cumpleFecha = fechaItem >= fechaIni && fechaItem <= fechaFin;
                        const cumpleTipo = !this.filtroTipoMovimiento || item.tipo === this.filtroTipoMovimiento;

                        return cumpleFecha && cumpleTipo;
                    });

                    if (listaFiltrada.length === 0) continue;

                    if (movData.tipoObjeto === 'producto') {
                        productoRefs.push({ ref: doc(db, 'productos', movData.idProducto), movData, listaFiltrada });
                    } else {
                        servicioRefs.push({ ref: doc(db, 'servicios', movData.idProducto), movData, listaFiltrada });
                    }
                }

                const productoSnaps = await Promise.all(productoRefs.map(({ ref }) => getDoc(ref)));
                const servicioSnaps = await Promise.all(servicioRefs.map(({ ref }) => getDoc(ref)));

                productoSnaps.forEach((snap, index) => {
                    if (snap.exists()) {
                        const data = snap.data();
                        const { movData, listaFiltrada } = productoRefs[index];
                        if (this.filtroCodigo && data.codigo !== this.filtroCodigo) return;

                        listaFiltrada.forEach(item => {
                            const fecha = item.fecha.toDate();
                            const fechaFormateada = fecha.toLocaleString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            const fechaLote = item.fechaVencimiento ? item.fechaVencimiento.toDate().toLocaleDateString('es-ES') : 'Sin fecha';

                            movProductosTemp.push({
                                tipoObjeto: movData.tipoObjeto,
                                codigo: data.codigo,
                                nombre: data.nombre,
                                tipo: item.tipo,
                                cantidad: item.cantidad,
                                unidad: item.unidad,
                                lote: item.lote || 'Sin lote',
                                fechaLote: fechaLote,
                                fecha: fechaFormateada
                            });
                        });
                    }
                });

                servicioSnaps.forEach((snap, index) => {
                    if (snap.exists()) {
                        const data = snap.data();
                        const { movData, listaFiltrada } = servicioRefs[index];
                        if (this.filtroCodigo && data.codigo !== this.filtroCodigo) return;

                        listaFiltrada.forEach(item => {
                            const fecha = item.fecha.toDate();
                            const fechaFormateada = fecha.toLocaleDateString('es-ES');
                            const fechaLote = item.fechaVencimiento ? item.fechaVencimiento.toDate().toLocaleDateString('es-ES') : 'Sin fecha';

                            movProductosTemp.push({
                                tipoObjeto: movData.tipoObjeto,
                                codigo: data.codigo,
                                nombre: data.nombre,
                                tipo: item.tipo,
                                cantidad: item.cantidad,
                                unidad: item.unidad,
                                lote: item.lote || 'Sin lote',
                                fechaLote: fechaLote,
                                fecha: fechaFormateada
                            });
                        });
                    }
                });

                this.movProductos = movProductosTemp;
            } catch (error) {
                Swal.close();
                console.error("Error obteniendo documentos: ", error);
            } finally {
                this.isLoading = false;
                Swal.close();
                if (this.movProductos.length === 0) {
                    Swal.fire({
                        title: "No se encontraron productos",
                        icon: "info",
                    });
                }
            }
        }
    },
    computed: {
        // Define your component's computed properties here
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