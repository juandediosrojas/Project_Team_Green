<template>
    <div class="container p-2">
        <h1 class="title">Gestión de Cotizaciones</h1>
        <!-- Add your template code here -->
        <p class="is-size-7 has-text-danger">* Campos obligatorios</p>
        <!-- FILTROS DE BUSQUEDA -->
        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end" style="gap: 8px;"
            :class="{ 'is-flex-direction-column': isMobile }">

            <div class="field">
                <label class="label"> Código Cotizacion</label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroCodigo" placeholder="Código" maxlength="14"
                        pattern="[0-9]" />
                </div>
            </div>
            <div class="field">
                <label class="label"> Identificación Cliente </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroCliente" placeholder="Cliente" />
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

        </div>

        <div class="is-flex is-justify-content-flex-end mb-2 mt-2" :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarCotizaciones" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>



        <!-- Botones de acción -->
        <div class="buttons mb-3">
            <button title="Editar Cotización" @click="abrirModal()" @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon icon="fa-solid fa-file-circle-plus" size="2xl" /></button>
            <button title="Descargar Cotización" @click="descargarCotización()" @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    icon="fa-solid fa-file-arrow-down" size="2xl" />
            </button>
        </div>

        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                :rowData="cotizaciones" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="20"  :rowSelection="'single'"
                @rowClicked="seleccionarCotizacion" @rowSelected="!seleccionarCotizacion" />
        </div>

        <!-- Modal -->
        <ModalFactura :isVisible="modalVisible" @close="cerrarModal" :cotizacionData="seleccionado" />
    </div>
</template>

<script>
import { db, Timestamp, collection, getDocs, query, where, doc, getDoc, storage, getDownloadURL, ref } from '@/firebase';
import Swal from 'sweetalert2';
import ModalFactura from '@/components/ModalFactura.vue';

export default {
    name: 'GestionCotizaciones',
    components: {
        ModalFactura,
    },
    data() {
        return {
            seleccionado: null, // Almacena la factura seleccionado
            cliente: {
                id: '',
                identificacion: '',
                nombre: '',
            },
            cotizaciones: [],
            filtroCliente: '',
            filtroCodigo: '',
            filtroFechaIni: '',
            filtroFechaFin: '',
            isLoading: false,
            modalVisible: false,
            isMobile: false,
            columnDefs: [
                {
                    headerName: 'Cotización', field: 'codigo', width: 130, sortable: true, filter: 'agTextColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    },sort: 'desc'
                },
                {
                    headerName: 'Identificación Cliente', field: 'identificacion', width: 150, sortable: true, filter: 'agTextColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Nombre Cliente', field: 'nombre', flex: 1, sortable: true, filter: 'agTextColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Subtotal', field: 'subtotal', width: 120, sortable: true, filter: 'agNumberColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],

                    }, valueFormatter: params => {
                        return params.value ? params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
                    }
                },
                {
                    headerName: 'Iva', field: 'iva', width: 120, sortable: true, filter: 'agNumberColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }, valueFormatter: params => {
                        return params.value ? params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
                    }
                },
                {
                    headerName: 'Total', field: 'total', width: 120, sortable: true, filter: 'agNumberColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],

                    }, valueFormatter: params => {
                        return params.value ? params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
                    }
                },
                {
                    headerName: 'Fecha', field: 'fecha', width: 190, sortable: true, filter: 'agTextColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
            ],
            gridOptions: {
                defaultColDef: { ...this.$agGridEvents, ...this.$agGridDefaultColDef,
                    wrapHeaderText: true,
                    floatingFilter: true,
                    filterParams: {
                        buttons: ['apply', 'reset'],
                        closeOnApply: true
                    }
                },
                localeText: this.$agGridLocaleText,
                paginationPageSizeSelector: false
            },
        };
    },
    methods: {
        seleccionarCotizacion(event) {
            this.seleccionado = event.node.isSelected() ? event.data : null;
            //console.log(this.seleccionado);
        },
        descargarCotización() {
            if (!this.seleccionado) {
                Swal.fire({
                    icon: 'info',
                    title: 'Información',
                    text: 'Por favor, seleccione una cotización',
                });
                return;
            }
            if (this.seleccionado.pdfURL) {
                Swal.fire({
                    title: "Descargando..",
                    text: "Por favor, espera un momento.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    },
                });
                const storageRef = ref(storage, this.seleccionado.pdfURL);
                getDownloadURL(storageRef)
                    .then((url) => {
                        fetch(url)
                            .then(response => response.blob())
                            .then(blob => {
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = `Cotización_${this.seleccionado.codigo}.pdf`;
                                link.click();
                                URL.revokeObjectURL(link.href);
                                Swal.close();
                            })
                            .catch((error) => {
                                console.error(error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Ocurrió un error al descargar la cotización',
                                });
                            });
                    })
                    .catch((error) => {
                        console.error(error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Ocurrió un error al obtener la URL de descarga',
                        });
                    });
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Información',
                    text: 'La cotización seleccionada no tiene un PDF asociado',
                });
            }


        },
        updateIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        abrirModal() {
            if (!this.seleccionado) {
                Swal.fire({
                    icon: 'info',
                    title: 'Información',
                    text: 'Por favor, seleccione una cotización',
                });
                return;
            }
            this.modalVisible = true;
        },
        cerrarModal() {
            this.modalVisible = false;
        },
        async consultarCotizaciones() {
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
            this.cotizaciones = [];

            const filtros = [];
            if (this.filtroCodigo !== '') {
                const codigoNumerico = parseInt(this.filtroCodigo, 10);
                if (!isNaN(codigoNumerico)) {
                    filtros.push(where('codigo', '==', codigoNumerico));
                }
            }
            if (this.filtroFechaIni) {
                const [year, month, day] = this.filtroFechaIni.split('-');
                const fechaIni = new Date(year, month - 1, day, 0, 0, 0); // Construye la fecha en UTC
                const timestampIni = Timestamp.fromDate(fechaIni);
                filtros.push(where('fecha', '>=', timestampIni));
            }
            if (this.filtroFechaFin) {
                const [year, month, day] = this.filtroFechaFin.split('-');
                const fechaFin = new Date(year, month - 1, day, 23, 59, 59); // Construye la fecha en UTC
                const timestampFin = Timestamp.fromDate(fechaFin);
                filtros.push(where('fecha', '<=', timestampFin));
            }
            if (this.filtroCliente) {
                try {
                    const clienteRef = collection(db, 'clientes');
                    const consulta = query(clienteRef, where('identificacion', '==', this.filtroCliente));
                    const cliente = await getDocs(consulta);

                    if (cliente.empty) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Información',
                            text: 'No se encontró el cliente con la identificación ingresada',
                        });
                        this.isLoading = false;
                        return;
                    }
                    this.cliente.id = cliente.docs[0].id;
                    this.cliente.identificacion = cliente.docs[0].data().identificacion;
                    this.cliente.nombre = cliente.docs[0].data().nombre;
                    filtros.push(where('idCliente', '==', cliente.docs[0].id));
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un error al consultar el cliente',
                    });
                    this.isLoading = false;
                    return;
                }
            }
            try {
                const q = query(collection(db, 'cotizacion'), ...filtros);
                const querySnapshot = await getDocs(q);
                const cotizacionTemp = [];

                const clienteCache = {};

                for (const document of querySnapshot.docs) {
                    const cotizacion = document.data();
                    const fecha = cotizacion.fecha.toDate();
                    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }); // Formato 'día/mes/año'
                    cotizacion.fecha = fechaFormateada;

                    if (!this.filtroCliente) {
                        if (!clienteCache[cotizacion.idCliente]) {
                            const cliente = await getDoc(doc(db, 'clientes', cotizacion.idCliente));
                            clienteCache[cotizacion.idCliente] = cliente.data();
                        }
                        cotizacion.nombre = clienteCache[cotizacion.idCliente].nombre;
                        cotizacion.identificacion = clienteCache[cotizacion.idCliente].identificacion;
                    } else {
                        cotizacion.nombre = this.cliente.nombre;
                        cotizacion.identificacion = this.cliente.identificacion;
                    }

                    cotizacionTemp.push(cotizacion);
                }
                this.cotizaciones = cotizacionTemp;
                Swal.close();
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al consultar las cotizaciones',
                });
            } finally {
                this.isLoading = false;
                if (this.cotizaciones.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Información',
                        text: 'No se encontraron cotizaciones con los filtros seleccionados',
                    });
                }
            }
        }
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