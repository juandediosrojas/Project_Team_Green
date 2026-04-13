<template>
    <Headerd />
    <div class="container p-2 text-dark">
        <h1 class="title">Gestión de Actividades</h1>


        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end"
            :class="{ 'is-flex-direction-column': isMobile }" style="gap: 8px;">
            <div class="field">
                <label class="label"> Código </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroCodigo" placeholder="Código de la Actividad" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Usuario (Nombre/ID) </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroUsuario" placeholder="Usuario que realizó" />
                </div>
            </div>
        </div>
        <div class="is-flex is-justify-content-flex-end mb-2 mt-2 " :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarActividades" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>

        <div class="buttons mb-3">
            <button class="button" title="Agregar Actividad" @click="abrirModal('crear')"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'plus']" size="2xl" /></button>
            <button class="button" title="Editar Actividad" @click="abrirModal('editar')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'pen-to-square']" size="2xl" /></button>
            <button class="button" title="Visualizar Actividad" @click="abrirModal('ver')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'eye']" size="2xl" /></button>
            <button class="button" title="Eliminar Actividad" @click="eliminarActividad(seleccionado.id)" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'trash']" size="2xl" /></button>
        </div>
        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                :rowData="actividades" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="20"
                :rowSelection="'single'" @rowClicked="seleccionarActividad" @rowSelected="!seleccionarActividad" />
        </div>


        <!-- Modal -->
        <ActividadModal :isVisible="modalVisible" :modo="modalMode" :actividadData="actividadSeleccionada"
            @close="cerrarModal" @guardar="guardarActividad" />
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import Headerd from '@/components/Headerd.vue';
import { db, storage, collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getStorage, ref, uploadBytes, getDownloadURL } from '../firebase';
import ActividadModal from '@/components/ActividadModal.vue';


export default {
    name: 'GestionActividades',
    components: {
        Headerd,
        ActividadModal,
    },
    data() {
        return {
            isMobile: false,
            filtroCodigo: '',
            filtroUsuario: '',
            isLoading: false,
            actividades: [],
            columnDefs: [
                {
                    headerName: 'Código',
                    field: 'codigo',
                    sortable: true,
                    width: 140,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    },
                    sort: 'desc'
                },
                {
                    headerName: 'Cliente',
                    field: 'cliente',
                    sortable: true,
                    flex: 1,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Tipo Actividad',
                    field: 'tipoActividad',
                    sortable: true,
                    flex: 1,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
                {
                    headerName: 'Descripción',
                    field: 'descripcion',
                    sortable: true,
                    flex: 1.5,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains'],
                    }
                },
                {
                    headerName: 'Fecha',
                    field: 'fecha',
                    sortable: true,
                    width: 140,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains'],
                    }
                },
                {
                    headerName: 'Usuario',
                    field: 'idUsuario',
                    sortable: true,
                    width: 140,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
            ],
            seleccionado: null,
            modalVisible: false,
            modalMode: 'crear',
            actividadSeleccionada: {},
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
        validarActividad(actividad) {
            const requiredFields = ['codigo', 'cliente', 'tipoActividad', 'fecha', 'idUsuario'];
            const missingFields = requiredFields.filter(field => !actividad[field]);
            if (missingFields.length > 0) {
                Swal.fire({
                    title: "Campos obligatorios",
                    text: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}.`,
                    icon: "warning",
                });
                return false;
            }
            return true;
        },
        async checkIfIdExists(id, campo, documento) {
            const q = query(collection(db, documento), where(campo, '==', id));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        },
        abrirModal(modo) {
            this.modalMode = modo;
            this.actividadSeleccionada = modo === 'crear' ? {} : { ...this.seleccionado };
            this.modalVisible = true;
        },
        cerrarModal() {
            this.modalVisible = false;
        },
        async guardarActividad(actividad) {
            if (!this.validarActividad(actividad)) {
                return;
            }
            
            Swal.fire({
                title: "Guardando....",
                text: "Por favor, espera un momento.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            if (this.modalMode === 'crear') {
                actividad.fechaCreacion = new Date().toLocaleDateString();
                const exits = await this.checkIfIdExists(actividad.codigo, 'codigo', 'actividades');
                if (exits) {
                    Swal.fire({
                        title: "Error",
                        text: "La actividad ya existe con ese código.",
                        icon: "error",
                    });
                    return;
                }
                try {
                    await addDoc(collection(db, "actividades"), actividad);
                    Swal.fire({
                        title: "Creación de Actividad Exitosa.",
                        icon: "success",
                    }).then(() => {
                        this.filtroCodigo = '';
                        this.filtroUsuario = '';
                        this.consultarActividades();
                        this.cerrarModal();
                    });
                } catch (e) {
                    console.error("Error adding document: ", e);
                    Swal.close();
                    Swal.fire({
                        title: "Error",
                        text: "Ha ocurrido un error interno en el servidor.",
                        icon: "error",
                    });
                }
            } else if (this.modalMode === 'editar') {
                actividad.fechaModificacion = new Date().toLocaleDateString();
                try {
                    const id = actividad.id;
                    delete actividad.id;
                    await updateDoc(doc(db, "actividades", id), actividad);
                    Swal.fire({
                        title: "Actividad actualizada",
                        icon: "success",
                    }).then(() => {
                        this.filtroCodigo = '';
                        this.filtroUsuario = '';
                        this.consultarActividades();
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
            }
        },
        seleccionarActividad(event) {
            this.seleccionado = event.node.isSelected() ? event.data : null;
        },
        async consultarActividades() {
            this.isLoading = true;
            try {
                this.actividades = [];
                const filtros = [];
                if (this.filtroCodigo) {
                    filtros.push(where('codigo', '==', this.filtroCodigo));
                }
                if (this.filtroUsuario) {
                    filtros.push(where('idUsuario', '>=', this.filtroUsuario));
                    filtros.push(where('idUsuario', '<=', this.filtroUsuario + '\uf8ff'));
                }

                let q;
                if (filtros.length > 0) {
                    q = query(collection(db, "actividades"), ...filtros);
                } else {
                    q = query(collection(db, "actividades"));
                }

                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    this.actividades.push({ id: doc.id, ...doc.data() });
                });

            } catch (error) {
                console.error("Error obteniendo documentos: ", error);
            } finally {
                this.isLoading = false;
                if (this.actividades.length === 0) {
                    Swal.fire({
                        title: "No se encontraron actividades",
                        icon: "info",
                    });
                }
            }
        },
        eliminarActividad(id) {
            if (id) {
                Swal.fire({
                    title: '¿Estás seguro de eliminar esta actividad?',
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
                            await deleteDoc(doc(db, 'actividades', id));
                            Swal.fire({
                                title: 'Actividad eliminada',
                                icon: 'success',
                            }).then(() => {
                                this.seleccionado = null;
                                this.filtroCodigo = '';
                                this.filtroUsuario = '';
                                this.consultarActividades();
                            });
                        } catch (error) {
                            console.error('Error eliminando actividad: ', error);
                            Swal.fire({
                                title: 'Error',
                                text: 'No se pudo eliminar la actividad. Inténtalo de nuevo.',
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
.title {
    color: #ffffff;
}
.label {
    color: #ffffff;
}
.buttons .button {
    background-color: transparent;
    border-color: #e0a800;
    color: #ffffff;
}
.buttons .button:hover {
    background-color: #e0a800;
    color: #fff;
}
.text-dark {
    color: #2c3e50;
}
</style>
