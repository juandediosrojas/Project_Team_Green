<template>
    <div class="container p-2">
        <h1 class="title">Gestión de Servicios</h1>


        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end"
            :class="{ 'is-flex-direction-column': isMobile }" style="gap: 8px;">
            <div class="field">
                <label class="label"> Código </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroCodigo" placeholder="Código del Servicio" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Nombre del Servicio</label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroNombre" placeholder="Nombre del Servicio" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Estado </label>
                <div class="select is-fullwidth">
                    <select v-model="filtroEstado">
                        <option value="" selected>TODOS</option>
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="INACTIVO">INACTIVO</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="is-flex is-justify-content-flex-end mb-2 mt-2 " :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarServicios" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>

        <div class="buttons mb-3">
            <button title="Agregar Servicio" @click="abrirModal('crear')"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-plus']" size="2xl" /></button>
            <button title="Editar Servicio" @click="abrirModal('editar')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-pen']" size="2xl" /></button>
            <button title="Visualizar Servicio" @click="abrirModal('ver')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'eye']" size="2xl" /></button>
            <button title="Eliminar Servicio" @click="eliminarServicio(seleccionado.id)" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'trash']" size="2xl" /></button>
        </div>
        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                :rowData="servicios" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="20"
                :rowSelection="'single'" @rowClicked="seleccionarServicio" @rowSelected="!seleccionarServicio" />
        </div>


        <!-- Modal -->
        <ServicioModal :isVisible="modalVisible" :modo="modalMode" :servicioData="servicioSeleccionado"
            @close="cerrarModal" @guardar="guardarServicio" />
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import { db, storage, collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getStorage, ref, uploadBytes, getDownloadURL } from '../firebase';
import ServicioModal from '@/components/ServicioModal.vue';


export default {
    name: 'GestionServicios',
    mounted() {
        // this.consultarServicios();
    },
    components: {
        ServicioModal,
    },
    data() {
        return {
            isMobile: false,
            filtroCodigo: '',
            filtroNombre: '',
            filtroEstado: '',
            isLoading: false,
            servicios: [],
            columnDefs: [
                {
                    headerName: 'Código',
                    field: 'codigo',
                    sortable: true,
                    width: 140,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                    , sort: 'desc'
                },
                {
                    headerName: 'Nombre',
                    field: 'nombre',
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
                    width: 340,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains'],
                    }
                },
                {
                    headerName: 'Precio',
                    field: 'precio',
                    sortable: true,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains'],
                    }
                },
                // {
                //     headerName: 'Mostrar',
                //     field: 'mostrarEnVentanaPrincipal',
                //     sortable: true,
                //     flex: 1,
                //     filter: true,
                //     filterParams: {
                //         filterOptions: ['contains'],
                //     }
                // },
                {
                    headerName: 'Estado',
                    field: 'estado',
                    sortable: true,
                    filter: true,
                    filterParams: {
                        filterOptions: ['contains', 'equals'],
                    }
                },
            ],
            seleccionado: null, // Almacena el servicio seleccionado
            modalVisible: false,
            modalMode: 'crear',
            servicioSeleccionado: {},
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
        async consultarServiciosMostrar() {
            this.isLoading = true;
            try {
                const q = query(collection(db, "servicios"), where('mostrarEnVentanaPrincipal', '==', true));
                const querySnapshot = await getDocs(q);
                return querySnapshot.size; // Devuelve el número de documentos
            } catch (error) {
                console.error("Error obteniendo documentos: ", error);
                return 0; // Devuelve 0 en caso de error
            } finally {
                this.isLoading = false;
            }
        },
        validarServicio(servicio) {
            const requiredFields = ['codigo', 'nombre'];
            const missingFields = requiredFields.filter(field => !servicio[field]);
            if (missingFields.length > 0) {
                Swal.fire({
                    title: "Campos obligatorios",
                    text: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}.`,
                    icon: "warning",
                });
                return false;
            }
            for (const field of requiredFields) {
                if (!servicio[field]) {
                    Swal.fire({
                        title: "Campo obligatorio",
                        text: `El campo ${field} es obligatorio.`,
                        icon: "warning",
                    });
                    return false;
                }
            }
            // const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // if (!emailPattern.test(cliente.correo)) {
            //     Swal.fire({
            //         title: "Email no válido",
            //         text: "El correo electrónico no es válido.",
            //         icon: "error",
            //     });
            //     return false;
            // }
            // const phonePattern = /^[0-9]{10}$/;
            // if (!phonePattern.test(cliente.celular)) {
            //     Swal.fire({
            //         title: "Celular no válido",
            //         text: "El número de celular no es válido.",
            //         icon: "error",
            //     });
            //     return false;
            // }
            return true;
        },
        async checkIfIdExists(id, campo, documento) {
            const q = query(collection(db, documento), where(campo, '==', id));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        },
        abrirModal(modo) {
            this.modalMode = modo;
            this.servicioSeleccionado = modo === 'crear' ? {} : { ...this.seleccionado };
            this.modalVisible = true;
        },
        cerrarModal() {
            this.modalVisible = false;
        },
        async guardarServicio(servicio) {
            const limiteMostrar = 4;

            if (!this.validarServicio(servicio)) {
                return;
            }
            servicio.estado = 'ACTIVO';
            //console.log('cantiadad traida' + this.consultarServiciosMostrar());

            // Subir imagen si se ha seleccionado
            let imagenUrl = servicio.imagenUrl || null;
            if (servicio.imagen) {
                const storageRef = ref(storage, `servicios/${servicio.codigo}`);
                //console.log('storageRef: ', storageRef);
                try {
                    Swal.fire({
                        title: "Subiendo imagen....",
                        text: "Por favor, espera un momento.",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        willOpen: () => {
                            Swal.showLoading();
                        },
                    });
                    await uploadBytes(storageRef, servicio.imagen);
                    imagenUrl = await getDownloadURL(storageRef); // Obtener URL pública
                    Swal.close();
                } catch (error) {
                    console.error("Error al subir la imagen: ", error.message);
                    Swal.close();
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo subir la imagen.",
                        icon: "error",
                    });
                    return;
                }
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
            // Asignar URL de imagen al servicio
            servicio.imagenUrl = imagenUrl;
            //console.log('url: ', imagenUrl);
            delete servicio.imagen;

            if (this.modalMode === 'crear') {
                if (!servicio.mostrarEnVentanaPrincipal) {
                    servicio.mostrarEnVentanaPrincipal = false;
                } else {
                    if (await this.consultarServiciosMostrar() >= limiteMostrar) {
                        Swal.fire({
                            title: "Error",
                            text: "No se puede mostrar más de 4 servicios. Por favor, desactive uno para poder mostrar otro.",
                            icon: "error",
                        });
                        return;
                    }
                }
                servicio.fechaCreacion = new Date().toLocaleDateString();
                //console.log('Creando un nuevo servicio');
                const exits = await this.checkIfIdExists(servicio.codigo, 'codigo', 'servicios');
                if (exits) {
                    Swal.fire({
                        title: "Error",
                        text: "El servicio ya existe.",
                        icon: "error",
                    });
                    return;
                }
                try {
                    await addDoc(collection(db, "servicios"), servicio);
                    Swal.fire({
                        title: "Creación de Servicio Exitosa.",
                        icon: "success",
                    }).then(() => {
                        this.filtroCodigo = '';
                        this.filtroNombre = '';
                        this.filtroEstado = '';
                        this.consultarServicios();
                        this.cerrarModal();
                        // //console.log(this.clientes);
                    });
                } catch (e) {
                    console.error("Error adding document: ", e);
                    Swal.close();
                    Swal.fire({
                        title: "Error",
                        text: "Ha ocurrido un error interno en el servidor. servicio1",
                        icon: "error",
                    });
                }
            } else if (this.modalMode === 'editar') {
                //console.log('servicioSeleccionado: ', this.servicioSeleccionado.mostrarEnVentanaPrincipal);
                //console.log('servicio: ', servicio.mostrarEnVentanaPrincipal);
                // Solo validar si el servicio seleccionado está en false y el nuevo estado es true
                if (!this.servicioSeleccionado.mostrarEnVentanaPrincipal && servicio.mostrarEnVentanaPrincipal) {
                    // Verificar si ya hay 4 servicios marcados como true
                    if (await this.consultarServiciosMostrar() >= limiteMostrar) {
                        Swal.fire({
                            title: "Error",
                            text: "No se puede mostrar más de 4 servicios. Por favor, desactive uno para poder mostrar otro.",
                            icon: "error",
                        });
                        return;
                    } else {
                        // Lógica para editar el servicio y guardarlo
                        servicio.fechaModificacion = new Date().toLocaleDateString();
                        //console.log('Editando servicio existente');
                        try {
                            const id = servicio.id;
                            delete servicio.id;
                            await updateDoc(doc(db, "servicios", id), servicio);
                            Swal.fire({
                                title: "Servicio actualizado",
                                icon: "success",
                            }).then(() => {
                                this.filtroCodigo = '';
                                this.filtroNombre = '';
                                this.filtroEstado = '';
                                this.consultarServicios();
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
                } else {
                    // Si no se está marcando el servicio, solo se guarda sin validación
                    servicio.fechaModificacion = new Date().toLocaleDateString();
                    //console.log('Editando servicio existente');
                    try {
                        const id = servicio.id;
                        delete servicio.id;
                        await updateDoc(doc(db, "servicios", id), servicio);
                        Swal.fire({
                            title: "Servicio actualizado",
                            icon: "success",
                        }).then(() => {
                            this.filtroCodigo = '';
                            this.filtroNombre = '';
                            this.filtroEstado = '';
                            this.consultarServicios();
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
            } else {
                // Lógica para visualizar cliente
            }
        },
        seleccionarServicio(event) {
            this.seleccionado = event.node.isSelected() ? event.data : null;

        },
        //METODO PARA CONSULTAR COLECCION DE  SERVICIOS A FIREBASE
        async consultarServicios() {
            this.isLoading = true;
            try {
                this.servicios = [];

                const filtros = [];
                if (this.filtroCodigo) {
                    filtros.push(where('codigo', '==', this.filtroCodigo));
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
                    q = query(collection(db, "servicios"), ...filtros);
                } else {
                    q = query(collection(db, "servicios"));
                }

                //1. Obtener todas las referencais de mascotras en registros
                const querySnapshotRegistros = await getDocs(q);
                // const querySnapshotRegistros = await getDocs(collection(db, "clientes"));

                //2. Por cada referencia de mascotas, obtener los datos
                querySnapshotRegistros.forEach((doc) => {
                    // //console.log(doc.id, " => ", doc.data());
                    this.servicios.push({ id: doc.id, ...doc.data() });
                });

            } catch (error) {
                console.error("Error  obteniento documentos: ", error);
            } finally {
                this.isLoading = false;
                if (this.servicios.length === 0) {
                    Swal.fire({
                        title: "No se encontraron servicios",
                        icon: "info",
                    });
                }
            }
        },
        eliminarServicio(id) {
            if (id) {
                Swal.fire({
                    title: '¿Estás seguro de eliminar este servicio?',
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
                            await updateDoc(doc(db, 'servicios', id), { estado: 'INACTIVO', mostrarEnVentanaPrincipal: false });
                            Swal.fire({
                                title: 'Servicio eliminado',
                                icon: 'success',
                            }).then(() => {
                                this.seleccionado = null;
                                this.filtroCodigo = '';
                                this.filtroNombre = '';
                                this.filtroEstado = '';
                                this.consultarServicios();
                            });
                        } catch (error) {
                            console.error('Error eliminando servicio: ', error);
                            Swal.fire({
                                title: 'Error',
                                text: 'No se pudo eliminar el servicio. Inténtalo de nuevo.',
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
</style>