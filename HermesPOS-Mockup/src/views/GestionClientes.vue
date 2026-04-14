<template>
    <div class="container p-2">
        <h1 class="title">Gestión de Clientes</h1>

        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end"
            :class="{ 'is-flex-direction-column': isMobile }" style="gap: 10px;">
            <div class="field">
                <label class="label"> Identificación </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroIdentificacion"
                        placeholder="Identificación del cliente" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Nombre </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroNombre" placeholder="Nombre del cliente" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Estado </label>
                <div class="select is-fullwidth">
                    <select v-model="filtroEstado">
                        <option value="">TODOS</option>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="is-flex is-justify-content-flex-end mb-2 mt-2" :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarClientes" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>

        <div class="buttons mb-3">
            <button title="Agregar Cliente" @click="abrirModal('crear')"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-plus']" size="2xl" /></button>
            <button title="Editar Cliente" @click="abrirModal('editar')" :disabled="!seleccionado"
                v-if="rol === 'Administrador'"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-pen']" size="2xl" /></button>
            <button title="Visualizar Cliente" @click="abrirModal('ver')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'eye']" size="2xl" /></button>
            <button title="Eliminar Cliente" @click="eliminarCliente(seleccionado.id)" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'trash']" size="2xl" v-if="rol === 'Administrador'" /></button>
        </div>
        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :gridOptions="gridOptions" :domLayout="'autoHeight'"
                :rowData="clientes" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="20"
                :rowSelection="'single'" @rowClicked="seleccionarCliente" @rowSelected="!seleccionarCliente" />
        </div>


        <!-- Modal -->
        <ClienteModal :isVisible="modalVisible" :modo="modalMode" :clienteData="clienteSeleccionado"
            @close="cerrarModal" @guardar="guardarCliente" />
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import ClienteModal from '@/components/ClienteModal.vue';
import { db, collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from '../firebase';


export default {
    name: 'GestionClientes',
    components: {
        ClienteModal,
    },
    data() {
        return {
            rol: localStorage.getItem('userRole') || '',
            isMobile: false,
            filtroIdentificacion: '',
            filtroNombre: '',
            filtroEstado: '',
            isLoading: false,
            clientes: [],
            columnDefs: [
                {
                    headerName: 'Tipo',
                    field: 'TipoDocumento',
                    sortable: true,
                    width: 90,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Identificación',
                    field: 'identificacion',
                    sortable: true,
                    width: 150,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Nombre o Razón Social',
                    field: 'nombre',
                    flex: 1,
                    sortable: true,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Dirección',
                    field: 'direccion',
                    sortable: true,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Correo',
                    field: 'correo',
                    sortable: true,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Celular',
                    field: 'celular',
                    width: 150,
                    sortable: true,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Estado',
                    field: 'estado',
                    sortable: true,
                    width: 100,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
            ],
            seleccionado: null, // Almacena el cliente seleccionado
            modalVisible: false,
            modalMode: 'crear',
            clienteSeleccionado: {},
            gridOptions: {
                localeText: this.$agGridLocaleText,
                paginationPageSizeSelector: false,
                defaultColDef: {
                    ...this.$agGridEvents, ...this.$agGridDefaultColDef, floatingFilter: true,
                    wrapHeaderText: true,
                    filterParams: {
                        buttons: ['apply', 'reset'],
                        closeOnApply: true
                    }
                }
            }
        };
    },
    methods: {
        updateIsMobile() {
            this.isMobile = window.innerWidth <= 768;
        },
        validarCliente(cliente) {
            const requiredFields = ['identificacion', 'nombre', 'direccion', 'correo', 'celular'];
            const missingFields = requiredFields.filter(field => !cliente[field]);
            if (missingFields.length > 0) {
                Swal.fire({
                    title: "Campos obligatorios",
                    text: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}.`,
                    icon: "warning",
                });
                return false;
            }
            for (const field of requiredFields) {
                if (!cliente[field]) {
                    Swal.fire({
                        title: "Campo obligatorio",
                        text: `El campo ${field} es obligatorio.`,
                        icon: "warning",
                    });
                    return false;
                }
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(cliente.correo)) {
                Swal.fire({
                    title: "Email no válido",
                    text: "El correo electrónico no es válido.",
                    icon: "error",
                });
                return false;
            }
            const phonePattern = /^[0-9]{10}$/;
            if (!phonePattern.test(cliente.celular)) {
                Swal.fire({
                    title: "Celular no válido",
                    text: "El número de celular no es válido.",
                    icon: "error",
                });
                return false;
            }
            return true;
        },
        async checkIfIdExists(tipoDocumento, id, campo, documento) {
            const q = query(collection(db, documento), where(campo, '==', id), where('TipoDocumento', '==', tipoDocumento));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        },
        abrirModal(modo) {
            this.modalMode = modo;
            this.clienteSeleccionado = modo === 'crear' ? {} : { ...this.seleccionado };
            this.modalVisible = true;
        },
        cerrarModal() {
            this.modalVisible = false;
        },
        async guardarCliente(cliente) {
            if (!this.validarCliente(cliente)) {
                return;
            }
            cliente.estado = 'ACTIVO';
            if (this.modalMode === 'crear') {
                cliente.fechaCreacion = new Date().toLocaleDateString();
                // //console.log('Creando un nuevo cliente');
                const exits = await this.checkIfIdExists(cliente.TipoDocumento, cliente.identificacion, 'identificacion', 'clientes');
                if (exits) {
                    Swal.fire({
                        title: "Error",
                        text: "El cliente ya existe.",
                        icon: "error",
                    });
                    return;
                }
                try {
                    await addDoc(collection(db, "clientes"), cliente);
                    Swal.fire({
                        title: "Creación de Cliente Exitosa.",
                        icon: "success",
                    }).then(() => {
                        this.filtroIdentificacion = '';
                        this.filtroNombre = '';
                        this.filtroEstado = '';
                        this.consultarClientes();
                        this.cerrarModal();
                        // //console.log(this.clientes);
                    });
                } catch (e) {
                    console.error("Error adding document: ", e);
                    Swal.fire({
                        title: "Error",
                        text: "Ha ocurrido un error interno en el servidor.",
                        icon: "error",
                    });
                }
            } else if (this.modalMode === 'editar') {
                // Lógica para editar cliente existente
                //console.log('Editando cliente existente');
                try {
                    const id = cliente.id;
                    delete cliente.id;
                    // cliente.fechaModificacion = new Date().toLocaleDateString();
                    // cliente.estado = 'ACTIVO';
                    await updateDoc(doc(db, "clientes", id), cliente);
                    Swal.fire({
                        title: "Cliente actualizado",
                        icon: "success",
                    }).then(() => {
                        this.filtroIdentificacion = '';
                        this.filtroNombre = '';
                        this.filtroEstado = '';
                        this.consultarClientes();
                        this.cerrarModal();
                    });
                } catch (e) {
                    console.error("Error updating document: ", e);
                    Swal.fire({
                        title: "Error",
                        text: "Ha ocurrido un error interno en el servidor.",
                        icon: "error",
                    });
                }
            } else {
                // Lógica para visualizar cliente
            }
        },
        seleccionarCliente(event) {
            this.seleccionado = event.node.isSelected() ? event.data : null;

        },
        //METODO PARA CONSULTAR COLECCION DE  CLIENTES A FIREBASE
        async consultarClientes() {
            this.isLoading = true;
            try {
                this.clientes = [];

                const filtros = [];
                if (this.filtroIdentificacion) {
                    filtros.push(where('identificacion', '==', this.filtroIdentificacion));
                }
                if (this.filtroNombre) {
                    filtros.push(where('nombre', '>=', this.filtroNombre));
                    filtros.push(where('nombre', '<=', this.filtroNombre + '\uf8ff'));
                }
                if (this.filtroEstado) {
                    filtros.push(where('estado', '==', this.filtroEstado));
                }

                let q;
                if (filtros.length > 0) {
                    q = query(collection(db, "clientes"), ...filtros);
                } else {
                    q = query(collection(db, "clientes"));
                }

                //1. Obtener todas las referencais de mascotras en registros
                const querySnapshotRegistros = await getDocs(q);
                // const querySnapshotRegistros = await getDocs(collection(db, "clientes"));

                //2. Por cada referencia de mascotas, obtener los datos
                querySnapshotRegistros.forEach((doc) => {
                    // //console.log(doc.id, " => ", doc.data());
                    this.clientes.push({ id: doc.id, ...doc.data() });
                });

            } catch (error) {
                console.error("Error  obteniento documentos: ", error);
            } finally {
                this.isLoading = false;
                if (this.clientes.length === 0) {
                    Swal.fire({
                        title: "No se encontraron resultados",
                        text: "No se encontraron clientes con los filtros aplicados.",
                        icon: "info",
                    });
                }
            }
        },
        eliminarCliente(id) {
            if (id) {
                Swal.fire({
                    title: '¿Estás seguro de eliminar este cliente?',
                    text: 'Esta acción no se puede deshacer',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar',
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await updateDoc(doc(db, 'clientes', id), { estado: 'INACTIVO' });
                            Swal.fire({
                                title: 'Cliente eliminado',
                                icon: 'success',
                            }).then(() => {
                                this.seleccionado = null;
                                this.filtroIdentificacion = '';
                                this.filtroNombre = '';
                                this.filtroEstado = '';
                                this.consultarClientes();
                            });
                        } catch (error) {
                            console.error('Error eliminando cliente: ', error);
                            Swal.fire({
                                title: 'Error',
                                text: 'No se pudo eliminar el cliente. Inténtalo de nuevo.',
                                icon: 'error',
                            });
                        }
                    }
                })
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

<style scoped>
.table-container {
    margin-top: 20px;
}

.buttons {
    margin-bottom: 20px;
    /* Espacio entre botones y tabla */
}

/* 
@media (prefers-color-scheme: light) {
  .section {
    background-color: #daf5d2;
  }
}

@media (prefers-color-scheme: dark) {
  .section {
    background-color: #264d00;
  }
} */
</style>