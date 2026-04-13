<template>
    <Headerd />
    <div class="container p-2 text-dark">
        <h1 class="title">Gestión de Usuarios</h1>


        <div class="is-flex is-flex-wrap-wrap is-justify-content-flex-end"
            :class="{ 'is-flex-direction-column': isMobile }" style="gap: 8px;">
            <div class="field">
                <label class="label"> Nombre </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroNombre" placeholder="Buscar por nombre" />
                </div>
            </div>

            <div class="field">
                <label class="label"> Correo </label>
                <div class="control">
                    <input class="input" type="text" v-model="filtroEmail" placeholder="Buscar por correo" />
                </div>
            </div>
        </div>
        <div class="is-flex is-justify-content-flex-end mb-2 mt-2 " :class="{ 'is-flex-direction-column': isMobile }">
            <button class="button is-success" @click="consultarUsuarios" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">
                BUSCAR
            </button>
        </div>

        <div class="buttons mb-3">
            <button class="button" title="Agregar Usuario" @click="abrirModal('crear')"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-plus']" size="2xl" /></button>
            <button class="button" title="Editar Usuario" @click="abrirModal('editar')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'user-pen']" size="2xl" /></button>
            <button class="button" title="Visualizar Usuario" @click="abrirModal('ver')" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')"><font-awesome-icon
                    :icon="['fas', 'eye']" size="2xl" /></button>
            <button class="button" :title="seleccionado && seleccionado.activo ? 'Desactivar Usuario' : 'Activar Usuario'" 
                @click="toggleEstadoUsuario" :disabled="!seleccionado"
                @mouseenter="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.add('fa-beat')"
                @mouseleave="$event.currentTarget.querySelector('svg') && $event.currentTarget.querySelector('svg').classList.remove('fa-beat')">
                <font-awesome-icon :icon="seleccionado && seleccionado.activo ? ['fas', 'user-slash'] : ['fas', 'user-check']" size="2xl" />
            </button>
        </div>
        <!-- Contenedor de AG Grid -->
        <div>
            <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                :rowData="usuariosList" :columnDefs="columnDefs" :pagination="true" :paginationPageSize="20"
                :rowSelection="'single'" @rowClicked="seleccionarUsuario" @rowSelected="!seleccionarUsuario" />
        </div>


        <!-- Modal -->
        <UsuarioModal :isVisible="modalVisible" :modo="modalMode" :usuarioData="usuarioSeleccionado"
            @close="cerrarModal" @guardar="guardarUsuario" />
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import Headerd from '@/components/Headerd.vue';
import { db, auth, setDoc, doc, collection, getDocs, query, where, updateDoc } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import UsuarioModal from '@/components/UsuarioModal.vue';


export default {
    name: 'GestionUsuarios',
    components: {
        Headerd,
        UsuarioModal,
    },
    data() {
        return {
            isMobile: false,
            filtroNombre: '',
            filtroEmail: '',
            isLoading: false,
            usuariosList: [],
            columnDefs: [
                {
                    headerName: 'Nombre Completo',
                    field: 'nombre',
                    sortable: true,
                    flex: 1.5,
                    filter: true,
                },
                {
                    headerName: 'Correo Electrónico',
                    field: 'email',
                    sortable: true,
                    flex: 1.5,
                    filter: true,
                },
                {
                    headerName: 'Rol',
                    field: 'rol',
                    sortable: true,
                    width: 150,
                    filter: true,
                },
                {
                    headerName: 'Estado',
                    field: 'activo',
                    sortable: true,
                    width: 120,
                    valueFormatter: params => params.value ? '✅ ACTIVO' : '❌ INACTIVO',
                    filter: true,
                },
            ],
            seleccionado: null,
            modalVisible: false,
            modalMode: 'crear',
            usuarioSeleccionado: {},
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
        async consultarUsuarios() {
            this.isLoading = true;
            try {
                this.usuariosList = [];
                const filtros = [];
                if (this.filtroNombre) {
                    filtros.push(where('nombre', '>=', this.filtroNombre));
                    filtros.push(where('nombre', '<=', this.filtroNombre + '\uf8ff'));
                }
                if (this.filtroEmail) {
                    filtros.push(where('email', '==', this.filtroEmail));
                }

                let q = collection(db, "Usuarios");
                if (filtros.length > 0) {
                    q = query(q, ...filtros);
                }

                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    this.usuariosList.push({ id: doc.id, ...doc.data() });
                });

            } catch (error) {
                console.error("Error obteniendo usuarios: ", error);
            } finally {
                this.isLoading = false;
                if (this.usuariosList.length === 0) {
                    Swal.fire({
                        title: "No se encontraron usuarios",
                        icon: "info",
                    });
                }
            }
        },
        abrirModal(modo) {
            this.modalMode = modo;
            this.usuarioSeleccionado = modo === 'crear' ? {} : { ...this.seleccionado };
            this.modalVisible = true;
        },
        cerrarModal() {
            this.modalVisible = false;
        },
        async guardarUsuario(usuarioData) {
            Swal.fire({
                title: this.modalMode === 'crear' ? "Creando usuario..." : "Guardando cambios...",
                text: "Por favor, espera un momento.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                },
            });

            if (this.modalMode === 'crear') {
                try {
                    const cred = await createUserWithEmailAndPassword(auth, usuarioData.email, usuarioData.contrasena);
                    const uid = cred.user.uid;

                    await setDoc(doc(db, "Usuarios", uid), {
                        nombre: usuarioData.nombre,
                        email: usuarioData.email,
                        rol: usuarioData.rol,
                        activo: true,
                        creado: new Date()
                    });

                    Swal.fire({
                        title: "Usuario creado",
                        text: "El usuario ha sido creado exitosamente.",
                        icon: "success",
                    });
                    this.consultarUsuarios();
                    this.cerrarModal();
                } catch (error) {
                    Swal.close();
                    console.error("Error creando usuario: ", error);
                    let msg = "No se pudo crear el usuario.";
                    if (error.code === 'auth/email-already-in-use') msg = "El correo ya está en uso.";
                    Swal.fire({ title: "Error", text: msg, icon: "error" });
                }
            } else if (this.modalMode === 'editar') {
                try {
                    const id = usuarioData.id;
                    const updateData = {
                        nombre: usuarioData.nombre,
                        rol: usuarioData.rol
                    };
                    await updateDoc(doc(db, "Usuarios", id), updateData);
                    Swal.fire({
                        title: "Usuario actualizado",
                        text: "Los cambios han sido guardados.",
                        icon: "success",
                    });
                    this.consultarUsuarios();
                    this.cerrarModal();
                } catch (error) {
                    console.error("Error actualizando usuario: ", error);
                    Swal.fire({ title: "Error", text: "No se pudo actualizar el usuario.", icon: "error" });
                }
            }
        },
        seleccionarUsuario(event) {
            this.seleccionado = event.node.isSelected() ? event.data : null;
        },
        async toggleEstadoUsuario() {
            if (!this.seleccionado) return;
            const nuevoEstado = !this.seleccionado.activo;
            const accion = nuevoEstado ? "activar" : "desactivar";

            Swal.fire({
                title: `¿Estás seguro de ${accion} este usuario?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, continuar",
                cancelButtonText: "Cancelar",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await updateDoc(doc(db, "Usuarios", this.seleccionado.id), { activo: nuevoEstado });
                        Swal.fire({ title: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`, icon: "success" });
                        this.consultarUsuarios();
                    } catch (error) {
                        console.error("Error cambiando estado: ", error);
                        Swal.fire({ title: "Error", text: "No se pudo cambiar el estado.", icon: "error" });
                    }
                }
            });
        }
    },
    mounted() {
        this.updateIsMobile();
        window.addEventListener('resize', this.updateIsMobile);
        this.consultarUsuarios();
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
