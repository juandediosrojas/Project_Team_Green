<template>
    <div class="container p-2">
        <h1 class="title">Gestión de Proveedores</h1>

        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end"
            :class="{ 'is-flex-direction-column': isMobile }" style="gap: 8px;">
            <div class="field">
                <label class="label"> Identificación </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroCedula" placeholder="Identificación" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Nombre </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroNombre" placeholder="Nombre del proveedor" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Estado </label>
                <div class="select is-fullwidth">
                    <select v-model="filtroEstado">
                        <option value="">Todos</option>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="is-flex is-justify-content-flex-end mb-2 mt-2" :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarProveedores" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>

        <div class="buttons mb-3">
            <button title="Agregar Proveedor" @click="abrirModal('crear')"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-plus']" size="2xl" /></button>
            <button title="Editar Proveedor" @click="abrirModal('editar')" :disabled="!seleccionado"
                v-if="rol === 'Administrador'"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-pen']" size="2xl" /></button>
            <button title="Visualizar Proveedor" @click="abrirModal('ver')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'eye']" size="2xl" /></button>
            <button title="Eliminar Proveedor" @click="eliminarProveedor(seleccionado.id)" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'trash']" size="2xl" v-if="rol === 'Administrador'" /></button>
        </div>
        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :gridOptions="gridOptions" :rowData="proveedores"
                :defaultColDef="defaultColDef" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="20"
                :rowSelection="'single'" @rowClicked="seleccionarProveedor" @rowSelected="!seleccionarProveedor"
                :domLayout="'autoHeight'" />
        </div>



        <!-- Modal -->
        <ProveedorModal :isVisible="modalVisible" :modo="modalMode" :proveedorData="proveedorSeleccionado"
            @close="cerrarModal" @guardar="guardarProveedor" />
    </div>
</template>

<script>

import Swal from 'sweetalert2';
import ProveedorModal from '@/components/ProveedorModal.vue';
import { db, collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from '../firebase';


export default {
    name: 'GestionProveedores',
    components: {
        ProveedorModal,
    },

    data() {
        return {
            rol: localStorage.getItem('userRole') || '',
            isMobile: false,
            filtroCedula: '',
            filtroNombre: '',
            filtroEstado: '',
            isLoading: false,
            proveedores: [],
            columnDefs: [
                {
                    headerName: 'Tipo',
                    field: 'TipoDocumento',
                    sortable: true,
                    width: 100,
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
                    sortable: true,
                    flex: 1,
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
                    sortable: true,
                    filter: true,
                    width: 120,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Estado',
                    field: 'estado',
                    sortable: true,
                    filter: true,
                    width: 120,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
            ],

            seleccionado: null, // Almacena el cliente seleccionado
            modalVisible: false,
            modalMode: 'crear',
            proveedorSeleccionado: {},
            gridOptions: {
                defaultColDef: {
                    ...this.$agGridEvents, ...this.$agGridDefaultColDef, floatingFilter: true,
                    wrapHeaderText: true,
                    filterParams: {
                        buttons: ['apply', 'reset'],
                        closeOnApply: true
                    }
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
        validarProveedor(proveedor) {
            const requiredFields = ['identificacion', 'nombre', 'direccion', 'correo', 'celular'];
            const missingFields = requiredFields.filter(field => !proveedor[field]);
            if (missingFields.length > 0) {
                Swal.fire({
                    title: "Campos obligatorios",
                    text: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}.`,
                    icon: "warning",
                });
                return false;
            }
            for (const field of requiredFields) {
                if (!proveedor[field]) {
                    Swal.fire({
                        title: "Campo obligatorio",
                        text: `El campo ${field} es obligatorio.`,
                        icon: "warning",
                    });
                    return false;
                }
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(proveedor.correo)) {
                Swal.fire({
                    title: "Email no válido",
                    text: "El correo electrónico no es válido.",
                    icon: "error",
                });
                return false;
            }
            const phonePattern = /^[0-9]{10}$/;
            if (!phonePattern.test(proveedor.celular)) {
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
            this.proveedorSeleccionado = modo === 'crear' ? {} : { ...this.seleccionado };
            this.modalVisible = true;
        },
        cerrarModal() {
            this.modalVisible = false;
        },
        async guardarProveedor(proveedor) {
            if (!this.validarProveedor(proveedor)) {
                return;
            }
            Swal.fire({
                title: "Guardando..",
                text: "Por favor, espera un momento.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });
            proveedor.estado = 'ACTIVO';
            if (this.modalMode === 'crear') {
                proveedor.fechaCreacion = new Date().toLocaleDateString();
                // //console.log('Creando un nuevo proveedor');
                const exits = await this.checkIfIdExists(proveedor.TipoDocumento, proveedor.identificacion, 'identificacion', 'proveedores');
                if (exits) {
                    Swal.fire({
                        title: "Error",
                        text: "El proveedor ya existe.",
                        icon: "error",
                    });
                    return;
                }
                try {
                    await addDoc(collection(db, "proveedores"), proveedor);
                    Swal.close();
                    Swal.fire({
                        title: "Creación de proveedor Exitosa.",
                        icon: "success",
                    }).then(() => {
                        this.filtroCedula = '';
                        this.filtroNombre = '';
                        this.filtroEstado = '';
                        this.consultarProveedores();
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
                // Lógica para editar proveedor existente
                //console.log('Editando proveedor existente');
                try {
                    const id = proveedor.id;
                    delete proveedor.id;
                    proveedor.fechaModificacion = new Date().toLocaleDateString();
                    // cliente.estado = 'ACTIVO';
                    await updateDoc(doc(db, "proveedores", id), proveedor);
                    Swal.close();
                    Swal.fire({
                        title: "proveedor actualizado",
                        icon: "success",
                    }).then(() => {
                        this.filtroCedula = '';
                        this.filtroNombre = '';
                        this.filtroEstado = '';
                        this.consultarProveedores();
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
                // Lógica para visualizar proveedor
            }
        },
        seleccionarProveedor(event) {
            this.seleccionado = event.node.isSelected() ? event.data : null;

        },
        //METODO PARA CONSULTAR COLECCION DE  proveedor A FIREBASE
        async consultarProveedores() {
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
                this.proveedores = [];

                const filtros = [];
                if (this.filtroCedula) {
                    filtros.push(where('identificacion', '==', this.filtroCedula));
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
                    q = query(collection(db, "proveedores"), ...filtros);
                } else {
                    q = query(collection(db, "proveedores"));
                }

                //1. Obtener todas las referencais de proveedor 
                const querySnapshotRegistros = await getDocs(q);
                // const querySnapshotRegistros = await getDocs(collection(db, "clientes"));

                //2. Por cada referencia de mascotas, obtener los datos
                querySnapshotRegistros.forEach((doc) => {
                    // //console.log(doc.id, " => ", doc.data());
                    this.proveedores.push({ id: doc.id, ...doc.data() });
                });

            } catch (error) {
                Swal.close();
                console.error("Error  obteniento documentos: ", error);
            } finally {
                this.isLoading = false;
                Swal.close();
                if (this.proveedores.length === 0) {
                    Swal.fire({
                        title: "No se encontraron resultados",
                        text: "No se encontraron proveedor con los filtros aplicados.",
                        icon: "info",
                    });
                }
            }
        },
        eliminarProveedor(id) {
            if (id) {
                Swal.fire({
                    title: '¿Estás seguro de eliminar este proveedor?',
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
                            await updateDoc(doc(db, 'proveedores', id), { estado: 'INACTIVO' });
                            Swal.fire({
                                title: 'proveedor eliminado',
                                icon: 'success',
                            }).then(() => {
                                this.seleccionado = null;
                                this.filtroCedula = '';
                                this.filtroNombre = '';
                                this.filtroEstado = '';
                                this.consultarProveedores();
                            });
                        } catch (error) {
                            console.error('Error eliminando proveedor: ', error);
                            Swal.fire({
                                title: 'Error',
                                text: 'No se pudo eliminar el proveedor. Inténtalo de nuevo.',
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
}
</style>