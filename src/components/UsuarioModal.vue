<template>
    <div class="modal" :class="{ 'is-active': isVisible }">
        <div class="modal-background" @click="cerrarModal"></div>
        <div class="modal-card enhanced-card">
            <header class="modal-card-head enhanced-head">
                <p class="modal-card-title">{{ modalTitle }}</p>
                <button class="delete is-white" aria-label="close" @click="cerrarModal"></button>
            </header>

            <form @submit.prevent="guardarUsuario">
                <div class="modal-card-body enhanced-body">
                    <div class="field">
                        <label class="label">Nombre completo</label>
                        <div class="control has-icons-left">
                            <input
                                class="input"
                                type="text"
                                v-model="usuario.nombre"
                                placeholder="Ingresa el nombre completo"
                                :disabled="modo === 'ver'"
                                required
                            />
                            <span class="icon is-small is-left">
                                <font-awesome-icon :icon="['fas', 'user']" />
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
                                v-model="usuario.email"
                                placeholder="correo@ejemplo.com"
                                :disabled="modo !== 'crear'"
                                required
                            />
                            <span class="icon is-small is-left">
                                <font-awesome-icon :icon="['fas', 'envelope']" />
                            </span>
                        </div>
                    </div>

                    <div class="field" v-if="modo === 'crear'" >
                        <label class="label">Contraseña</label>
                        <div class="control has-icons-left has-icons-right">
                            <input
                                class="input"
                                :type="showPassword ? 'text' : 'password'"
                                autocomplete="new-password"
                                v-model="usuario.contrasena"
                                minlength="6"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <span class="icon is-small is-left">
                                <font-awesome-icon :icon="['fas', 'lock']" />
                            </span>
                            <span class="icon is-small is-right toggle-visibility" @click="togglePassword" :title="showPassword ? 'Ocultar' : 'Mostrar'">
                                <font-awesome-icon :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" />
                            </span>
                        </div>
                    </div>

                    <div class="field">
                        <label class="label">Rol</label>
                        <div class="control has-icons-left">
                            <div class="select is-fullwidth">
                                <select v-model="usuario.rol" :disabled="modo === 'ver'" required>
                                    <option value="" disabled>Selecciona un rol</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Vendedor">Vendedor</option>
                                </select>
                            </div>
                            <span class="icon is-small is-left">
                                <font-awesome-icon :icon="['fas', 'user-tag']" />
                            </span>
                        </div>
                    </div>
                </div>

                <footer class="modal-card-foot enhanced-foot">
                    <div class="buttons">
                        <button
                            v-if="modo !== 'ver'"
                            class="button is-success"
                            type="submit"
                            :disabled="!usuario.nombre || !usuario.email || (modo === 'crear' && !usuario.contrasena) || !usuario.rol"
                        >
                            {{ modo === 'crear' ? 'Crear' : 'Guardar' }}
                        </button>
                    </div>
                </footer>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        isVisible: Boolean,
        modo: String,
        usuarioData: Object
    },
    data() {
        return {
            usuario: { ...this.usuarioData },
            showPassword: false,
        };
    },
    computed: {
        modalTitle() {
            return this.modo === 'crear' ? 'Crear Usuario' : this.modo === 'editar' ? 'Editar Usuario' : 'Ver Usuario';
        }
    },
    methods: {
        cerrarModal() {
            this.showPassword = false;
            this.$emit('close');
        },
        guardarUsuario() {
            if (this.modo !== 'ver') {
                this.$emit('guardar', this.usuario);
            }
        },
        togglePassword() {
            this.showPassword = !this.showPassword;
        }
    },
    watch: {
        usuarioData(newData) {
            this.usuario = { ...newData };
        }
    }
};
</script>

<style scoped>
.modal-card {
  max-width: 500px;
  width: 100%;
}
.toggle-visibility {
    cursor: pointer;
    pointer-events: all !important;
}
</style>
