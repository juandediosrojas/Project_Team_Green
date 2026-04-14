<template>

    <div class="container p-2">
        <h1 class="title">Gestión de Facturas</h1>
        <p class="is-size-7 has-text-danger">* Campos obligatorios</p>
        <!-- FILTROS DE BUSQUEDA -->
        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end" style="gap: 8px;"
            :class="{ 'is-flex-direction-column': isMobile }">

            <div class="field">
                <label class="label"> Código Factura</label>
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
            <button class="button is-success" @click="consultarFacturas" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>



        <!-- Botones de acción -->
        <div class="buttons mb-3">
            <button title="Crear Factura" @click="abrirModal()"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')">
                <font-awesome-icon icon="fa-solid fa-file-circle-plus" size="2xl" />
            </button>
            <button title="Descargar Factura" @click="descargarFactura()"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    icon="fa-solid fa-file-arrow-down" size="2xl" />
            </button>
        </div>

        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                :rowData="facturas" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="10"
                :rowSelection="'single'" @rowClicked="seleccionarFactura" @rowSelected="!seleccionarFactura" />
        </div>

        <!-- Modal -->
        <ModalFactura :isVisible="modalVisible" @close="cerrarModal" />
    </div>
</template>

<script>
import { db, Timestamp, collection, getDocs, query, where, doc, getDoc, storage, uploadBytes, getDownloadURL, ref } from '@/firebase';
import Swal from 'sweetalert2';
import ModalFactura from '@/components/ModalFactura.vue';

export default {
    name: 'GestionFacturas',
    components: {
        ModalFactura,
    },
    data() {
        return {
            // Add your data properties here
            seleccionado: null, // Almacena la factura seleccionado, 
            cliente: {
                id: '',
                identificacion: '',
                nombre: '',
            },
            facturas: [],
            filtroCliente: '',
            filtroCodigo: '',
            filtroFechaIni: '',
            filtroFechaFin: '',
            isLoading: false,
            modalVisible: false,
            isMobile: false,
            columnDefs: [
                {
                    headerName: 'Factura', field: 'codigo', width: 120, sortable: true, filter: true, filterParams: {
                        filterOptions: ['contains', 'equals'],
                        defaultOption: 'contains'
                    }
                    , sort: 'desc'
                },
                {
                    headerName: 'Identificación Cliente', field: 'identificacion', width: 150, sortable: true, filter: 'agNumberColumnFilter', filterParams: {
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
                        return params.value ? params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '';
                    }
                },
                {
                    headerName: 'Iva', field: 'iva', width: 120, sortable: true, filter: 'agNumberColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],

                    }, valueFormatter: params => {
                        return params.value ? params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '';
                    }
                },
                {
                    headerName: 'Total', field: 'total', width: 120, sortable: true, filter: 'agNumberColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],

                    }, valueFormatter: params => {
                        return params.value ? params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '';
                    }
                },
                {
                    headerName: 'Fecha y Hora', field: 'fecha', width: 200, sortable: true, filter: 'agTextColumnFilter', filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
            ],
            gridOptions: {
                defaultColDef: {
                    ...this.$agGridEvents,
                    ...this.$agGridDefaultColDef,
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
        seleccionarFactura(event) {
            this.seleccionado = event.node.isSelected() ? event.data : null;
            //console.log(this.seleccionado);
        },
        descargarFactura() {
            if (!this.seleccionado) {
                Swal.fire({
                    icon: 'info',
                    title: 'Información',
                    text: 'Por favor, seleccione una factura',
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
                                link.download = `Factura_${this.seleccionado.codigo}.pdf`;
                                link.click();
                                URL.revokeObjectURL(link.href);
                                Swal.close();
                            })
                            .catch((error) => {
                                console.error(error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Ocurrió un error al descargar la factura',
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
                    text: 'La factura seleccionada no tiene un PDF asociado',
                });
            }


        },
        updateIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        abrirModal() {
            this.modalVisible = true;
        },
        cerrarModal() {
            this.modalVisible = false;
        },
        async consultarFacturas() {
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
            this.facturas = [];

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
                const q = query(collection(db, 'factura'), ...filtros);
                const querySnapshot = await getDocs(q);
                const facturaTemp = [];

                const clienteCache = {};

                for (const document of querySnapshot.docs) {
                    const factura = document.data();
                    const fecha = factura.fecha.toDate();
                    const fechaFormateada = fecha.toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                    factura.fecha = fechaFormateada;

                    if (!this.filtroCliente) {
                        if (!clienteCache[factura.idCliente]) {
                            const cliente = await getDoc(doc(db, 'clientes', factura.idCliente));
                            clienteCache[factura.idCliente] = cliente.data();
                        }
                        factura.nombre = clienteCache[factura.idCliente].nombre;
                        factura.identificacion = clienteCache[factura.idCliente].identificacion;

                    } else {
                        factura.nombre = this.cliente.nombre;
                        factura.identificacion = this.cliente.identificacion;
                    }

                    facturaTemp.push(factura);
                }
                this.facturas = facturaTemp;
                Swal.close();
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al consultar las facturas',
                });
            } finally {
                this.isLoading = false;
                if (this.facturas.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Información',
                        text: 'No se encontraron facturas con los filtros seleccionados',
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