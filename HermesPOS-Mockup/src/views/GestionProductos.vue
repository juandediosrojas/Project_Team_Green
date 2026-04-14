<template>
    <div class="container p-2">
        <h1 class="title">Gestión de Productos</h1>


        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end"
            :class="{ 'is-flex-direction-column': isMobile }" style="gap: 8px;">
            <div class="field">
                <label class="label"> Código </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroCodigo" placeholder="Código del producto" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Nombre del Producto</label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroNombre" placeholder="Nombre del Producto" />
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
        <div class="is-flex is-justify-content-flex-end mb-2 mt-2" :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarProductos" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>

        <div class="buttons mb-3">
            <button title="Agregar Producto" @click="abrirModal('crear')"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-plus']" size="2xl" /></button>
            <button title="Editar Producto" @click="abrirModal('editar')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-pen']" size="2xl" /></button>
            <button title="Visualizar Producto" @click="abrirModal('ver')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'eye']" size="2xl" /></button>
            <button title="Eliminar Producto" @click="eliminarProducto(seleccionado.id)" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')">
                <font-awesome-icon :icon="['fas', 'trash']" size="2xl" /></button>
        </div>
        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                :rowData="productos" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="20"
                :rowSelection="'single'" @rowClicked="seleccionarProducto" @rowSelected="!seleccionarProducto" />
        </div>


        <!-- Modal -->
        <ProductoModal :isVisible="modalVisible" :modo="modalMode" :productoData="productoSeleccionado"
            @close="cerrarModal" @guardar="guardarProducto" />
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import { db, storage, collection, addDoc, getDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getStorage, ref, uploadBytes, getDownloadURL } from '../firebase';
import ProductoModal from '@/components/ProductoModal.vue';


export default {
    name: 'GestionProductos',
    mounted() {
        // this.consultarProductos();
    },
    components: {
        ProductoModal,
    },
    data() {
        return {
            isMobile: false,
            filtroCodigo: '',
            filtroNombre: '',
            filtroEstado: '',
            isLoading: false,
            productos: [],
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
                    width: 350,
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
            seleccionado: null, // Almacena el Producto seleccionado
            modalVisible: false,
            modalMode: 'crear',
            productoSeleccionado: {},
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
        async consultarProductosMostrar() {
            this.isLoading = true;
            try {
                const q = query(collection(db, "productos"), where('mostrarEnVentanaPrincipal', '==', true));
                const querySnapshot = await getDocs(q);
                return querySnapshot.size; // Devuelve el número de documentos
            } catch (error) {
                console.error("Error obteniendo documentos: ", error);
                return 0; // Devuelve 0 en caso de error
            } finally {
                this.isLoading = false;
            }
        },
        validarProducto(producto) {
            const requiredFields = ['codigo', 'nombre'];
            const missingFields = requiredFields.filter(field => !producto[field]);
            if (missingFields.length > 0) {
                Swal.fire({
                    title: "Campos obligatorios",
                    text: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}.`,
                    icon: "warning",
                });
                return false;
            }
            for (const field of requiredFields) {
                if (!producto[field]) {
                    Swal.fire({
                        title: "Campo obligatorio",
                        text: `El campo ${field} es obligatorio.`,
                        icon: "warning",
                    });
                    return false;
                }
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
            this.productoSeleccionado = modo === 'crear' ? {} : { ...this.seleccionado };
            this.modalVisible = true;
        },
        cerrarModal() {
            this.modalVisible = false;
        },
        async guardarProducto(producto) {
            const limiteMostrar = 4;
            if (!this.validarProducto(producto)) {
                return;
            }
            producto.estado = 'ACTIVO';

            // Subir imagen si se ha seleccionado
            let imagenUrl = producto.imagenUrl || null;
            //console.log('Imagen: ', producto.imagen);
            if (producto.imagen) {
                const storageRef = ref(storage, `productos/${producto.codigo}`);
                try {
                    Swal.fire({
                        title: "Subiendo imagen",
                        text: "Por favor, espera un momento.",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        willOpen: () => {
                            Swal.showLoading();
                        },
                    });
                    await uploadBytes(storageRef, producto.imagen);
                    imagenUrl = await getDownloadURL(storageRef); // Obtener URL pública
                    Swal.close();
                } catch (error) {
                    console.error("Error al subir la imagen: ", error);
                    Swal.fire({
                        title: "Error",
                        text: "No se pudo subir la imagen.",
                        icon: "error",
                    });
                    return;
                }
            }

            // Asignar URL de imagen al producto
            producto.imagenUrl = imagenUrl;
            //console.log('url: ', imagenUrl);
            delete producto.imagen;
            if (this.modalMode === 'crear') {
                if (!producto.mostrarEnVentanaPrincipal) {
                    producto.mostrarEnVentanaPrincipal = false;
                } else {
                    if (await this.consultarProductosMostrar() >= limiteMostrar) {
                        Swal.fire({
                            title: "Error",
                            text: "No se puede mostrar más de 4 productos. Por favor, desactive uno para poder mostrar otro.",
                            icon: "error",
                        });
                        return;
                    }
                }
                producto.fechaCreacion = new Date().toLocaleDateString();
                //console.log('Creando un nuevo producto');
                const exits = await this.checkIfIdExists(producto.codigo, 'codigo', 'productos');
                if (exits) {
                    Swal.fire({
                        title: "Error",
                        text: "El producto ya existe.",
                        icon: "error",
                    });
                    return;
                }
                try {
                    Swal.fire({
                        title: "Guardando...",
                        text: "Por favor, espera un momento.",
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        willOpen: () => {
                            Swal.showLoading();
                        },
                    });
                    await addDoc(collection(db, "productos"), producto);
                    Swal.close();
                    Swal.fire({
                        title: "Creación de Producto Exitosa.",
                        icon: "success",
                    }).then(() => {
                        this.filtroCodigo = '';
                        this.filtroNombre = '';
                        this.filtroEstado = '';
                        this.consultarProductos();
                        this.cerrarModal();
                        // //console.log(this.clientes);
                    });
                } catch (e) {
                    console.error("Error adding document: ", e);
                    Swal.close();
                    Swal.fire({
                        title: "Error",
                        text: "Ha ocurrido un error interno en el servidor. producto1",
                        icon: "error",
                    });
                }
            } else if (this.modalMode === 'editar') {

                if (!this.productoSeleccionado.mostrarEnVentanaPrincipal && producto.mostrarEnVentanaPrincipal) {
                    if (await this.consultarProductosMostrar() >= limiteMostrar) {
                        Swal.fire({
                            title: "Error",
                            text: "No se puede mostrar más de 4 productos. Por favor, desactive uno para poder mostrar otro.",
                            icon: "error",
                        });
                        return;
                    }
                }
                // Lógica para editar cliente existente
                producto.fechaModificacion = new Date().toLocaleDateString();
                //console.log('Editando producto existente');
                try {
                    const id = producto.id;
                    delete producto.id;
                    await updateDoc(doc(db, "productos", id), producto);
                    Swal.fire({
                        title: "producto actualizado",
                        icon: "success",
                    }).then(() => {
                        this.filtroCodigo = '';
                        this.filtroNombre = '';
                        this.filtroEstado = '';
                        this.consultarProductos();
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
        seleccionarProducto(event) {
            this.seleccionado = event.node.isSelected() ? event.data : null;

        },
        //METODO PARA CONSULTAR COLECCION DE  ProductoS A FIREBASE
        async consultarProductos() {
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
                this.productos = [];

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
                    q = query(collection(db, "productos"), ...filtros);
                } else {
                    q = query(collection(db, "productos"));
                }

                //1. Obtener todas las referencais de mascotras en registros
                const querySnapshotRegistros = await getDocs(q);
                // const querySnapshotRegistros = await getDocs(collection(db, "clientes"));

                //2. Por cada referencia de mascotas, obtener los datos
                querySnapshotRegistros.forEach((doc) => {
                    // //console.log(doc.id, " => ", doc.data());
                    this.productos.push({ id: doc.id, ...doc.data() });
                });

            } catch (error) {
                Swal.close();
                console.error("Error  obteniento documentos: ", error);
            } finally {
                this.isLoading = false;
                Swal.close();
                if (this.productos.length === 0) {
                    Swal.fire({
                        title: "No se encontraron productos",
                        icon: "info",
                    });
                }
            }
        },
        eliminarProducto(id) {
            if (id) {
                Swal.fire({
                    title: '¿Estás seguro de eliminar este producto?',
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
                            await updateDoc(doc(db, 'productos', id), { estado: 'INACTIVO', mostrarEnVentanaPrincipal: false });
                            Swal.fire({
                                title: 'Producto eliminado',
                                icon: 'success',
                            }).then(() => {
                                this.seleccionado = null;
                                this.filtroCodigo = '';
                                this.filtroNombre = '';
                                this.filtroEstado = '';
                                this.consultarProductos();
                            });
                        } catch (error) {
                            console.error('Error eliminando producto: ', error);
                            Swal.fire({
                                title: 'Error',
                                text: 'No se pudo eliminar el producto. Inténtalo de nuevo.',
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