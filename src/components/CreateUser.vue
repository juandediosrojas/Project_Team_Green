<template>
    <div class="modal" :class="{ 'is-active': isVisible }">
        <div class="modal-background" @click="cerrarModal"></div>
        <div class="modal-card enhanced-card">
            <header class="modal-card-head enhanced-head">
                <p class="modal-card-title">Crear Usuario</p>
                <button class="delete is-white" aria-label="close" @click="cerrarModal"></button>
            </header>

            <form @submit.prevent="crearUsuario">
                <div class="modal-card-body enhanced-body">
                    <div class="field">
                        <label class="label">Nombre completo</label>
                        <div class="control has-icons-left">
                            <input
                                class="input"
                                type="text"
                                v-model="nombreCompleto"
                                placeholder="Ingresa el nombre completo"
                                required
                            />
                            <span class="icon is-small is-left">
                                <i class="fas fa-user"></i>
                            </span>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Correo</label>
                        <div class="control has-icons-left">
                            <input
                                class="input"
                                type="email"
                                autocomplete="username"
                                v-model="correo"
                                placeholder="correo@ejemplo.com"
                                required
                            />
                            <span class="icon is-small is-left">
                                <i class="fas fa-envelope"></i>
                            </span>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Contraseña</label>
                        <div class="control has-icons-left has-icons-right">
                            <input
                                class="input"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                v-model="contrasena"
                                minlength="6"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <span class="icon is-small is-left">
                                <i class="fas fa-lock"></i>
                            </span>
                            <span class="icon is-small is-right toggle-visibility" @click="togglePassword" :title="showPassword ? 'Ocultar' : 'Mostrar'">
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </span>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Rol</label>
                        <div class="control has-icons-left">
                            <div class="select is-fullwidth">
                                <select v-model="rol" required>
                                    <option value="" disabled>Selecciona un rol</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Vendedor">Vendedor</option>
                                </select>
                            </div>
                            <span class="icon is-small is-left">
                                <i class="fas fa-user-tag"></i>
                            </span>
                        </div>
                    </div>
                </div>

                <footer class="modal-card-foot enhanced-foot">
                    <div class="buttons">
                        <button
                            class="button is-success"
                            type="submit"
                            :class="{ 'is-loading': isLoading }"
                            :disabled="isLoading || !nombreCompleto || !correo || !contrasena || !rol"
                        >
                            Crear
                        </button>
                        <!-- <button class="button is-light" type="button" @click="cerrarModal">Cerrar</button> -->
                    </div>
                </footer>
            </form>
        </div>
    </div>
</template>

<script>
import { db, auth, setDoc, doc } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            nombreCompleto: '',
            correo: '',
            contrasena: '',
            rol: '',
            isLoading: false,
            showPassword: false,
        };
    },
    props: {
        isVisible: Boolean,
    },
    methods: {
        async crearUsuario() {
            this.isLoading = true;
            try {
                Swal.fire({
                    title: "Creando usuario..",
                    text: "Por favor, espera un momento.",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    willOpen: () => {
                        Swal.showLoading();
                    },
                });
                const cred = await createUserWithEmailAndPassword(auth, this.correo, this.contrasena);
                const uid = cred.user.uid;

                await setDoc(doc(db, "Usuarios", uid), {
                    email: this.correo,
                    rol: this.rol,
                    nombre: this.nombreCompleto,
                    activo: true,
                    creado: new Date()
                });
                Swal.fire({
                    title: "Usuario creado",
                    text: "El usuario ha sido creado exitosamente.",
                    icon: "success",
                });
                this.cerrarModal();
            } catch (error) {
                Swal.close();
                console.error("Error creando usuario: ", error);
                if (error.code === 'auth/email-already-in-use') {
                    Swal.fire({
                        title: "Error",
                        text: "El correo ya está en uso por otro usuario.",
                        icon: "error",
                    });
                    return;
                }
                Swal.fire({
                    title: "Error",
                    text: "No se pudo crear el usuario. " + error.message,
                    icon: "error",
                });
            } finally {
                this.isLoading = false;
            }
        },
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        clearFields() {
            this.nombreCompleto = '';
            this.correo = '';
            this.contrasena = '';
            this.rol = '';
            this.showPassword = false;
        },
        cerrarModal() {
            this.clearFields();
            this.$emit('close');
        },
    },
}
</script>

<style scoped>

.button.is-success {
    background-color: #e0a800;
    border-color: #e0a800;
    color: #2c3e50;
    font-weight: 600;
}

.button.is-success:hover {
    background-color: #c99600;
    border-color: #c99600;
}


</style>