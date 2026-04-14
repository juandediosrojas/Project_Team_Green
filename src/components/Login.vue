<!-- src/components/Login.vue -->
<template>
    <div class="login-page">
        <div class="login-container">
            <div class="logo-container">
                <img src="@/assets/hermespos.png" alt="HermesPOS Logo" class="logo">
                <div class="brand-name">HermesPOS</div>
                <div class="company-name">MyoPharma</div>
            </div>

            <h1>Iniciar Sesión</h1>
            <!-- <p class="subtitle">Acceso al panel de administración</p> -->

            <form @submit.prevent="login" id="loginForm">
                <div class="form-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" placeholder="usuario@empresa.com" autocomplete="email"
                        v-model="email" :class="{ 'error': emailError }" @input="emailError = false" required>
                    <div class="error-message" v-if="emailError">
                        Por favor ingresa un correo válido
                    </div>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <div class="input-wrapper">
                        <input :type="showPassword ? 'text' : 'password'" id="password" placeholder="••••••••"
                            autocomplete="current-password" v-model="password" :class="{ 'error': passwordError }"
                            @input="passwordError = false" required>
                        <span class="password-toggle" @click="togglePassword">
                            <font-awesome-icon :icon="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
                        </span>
                    </div>
                    <div class="error-message" v-if="passwordError">
                        La contraseña es requerida
                    </div>
                </div>

                <div class="forgot-password-container">
                    <a href="#" class="forgot-password" @click.prevent="resetPassword">¿Olvidaste tu contraseña?</a>
                </div>

                <button type="submit" class="btn-login" :disabled="loading">
                    <span v-if="loading" class="loading"></span>
                    {{ loading ? 'Ingresando...' : 'Ingresar' }}
                </button>
            </form>

            <div class="security-badge">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
                <span>Conexión segura con Firebase</span>
            </div>

            <div class="version">Versión 1.0.0</div>
        </div>
    </div>
</template>

<script>
import { auth } from '../firebase';
import { useAuthStore } from '../stores/useAuthStore';
import Swal from 'sweetalert2';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: '',
            showPassword: false,
            loading: false,
            emailError: false,
            passwordError: false
        };
    },
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        async login() {
            // Validaciones básicas
            this.emailError = !this.email || !this.email.includes('@');
            this.passwordError = !this.password || this.password.length < 6;

            if (this.emailError || this.passwordError) {
                return;
            }

            this.loading = true;

            try {
                const cred = await signInWithEmailAndPassword(auth, this.email, this.password);
                const uid = cred.user.uid;
                const userStore = useAuthStore();
                await userStore.fetchUser(uid);

                if (userStore.user.activo === false) {
                    Swal.fire('Error', 'Tu cuenta está inactiva. Por favor, contacta al administrador.', 'error');
                    this.loading = false;
                    return;
                }

                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Has iniciado sesión correctamente',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });

                this.$router.push('/dashboard');
            } catch (error) {
                let errorMessage = 'Error de inicio de sesión: ';
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage += 'Correo electrónico inválido.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage += 'La cuenta de usuario está deshabilitada.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage += 'Usuario no encontrado.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage += 'Contraseña incorrecta.';
                        break;
                    case 'auth/invalid-credential':
                        errorMessage += 'Credencial inválida.';
                        break;
                    default:
                        errorMessage += error.message;
                }
                Swal.fire('Error', errorMessage, 'error');
            } finally {
                this.loading = false;
            }
        },
        async resetPassword() {
            if (!this.email) {
                Swal.fire('Error', 'Por favor, ingrese su correo electrónico para restablecer la contraseña.', 'error');
                return;
            }
            try {
                await sendPasswordResetEmail(auth, this.email);
                Swal.fire('¡Éxito!', 'Se ha enviado un correo para restablecer la contraseña.', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo enviar el correo para restablecer la contraseña.', 'error');
            }
        }
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Poppins:wght@400;500;600&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.login-page {
    font-family: 'Poppins', sans-serif;
     background: linear-gradient(0deg, #011f31, #002538);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 420px;
    padding: 28px 20px;
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.logo-container {
    text-align: center;
    margin-bottom: 20px;
}

.logo {
    width: 100px;
    height: 100px;
    margin: 0 auto 16px;
    display: block;
    border-radius: 50%;
}

.brand-name {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    color: #d4a229;
    font-size: 24px;
    margin-bottom: 8px;
}

.company-name {
    color: #0d3b52;
    font-size: 14px;
    font-weight: 500;
}

h1 {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 28px;
    color: #1a1a1a;
    margin-bottom: 8px;
    text-align: center;
}

.subtitle {
    text-align: center;
    color: #666;
    font-size: 14px;
    margin-bottom: 32px;
}

.form-group {
    margin-bottom: 24px;
}

label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-size: 14px;
    font-weight: 500;
}

.input-wrapper {
    position: relative;
}

input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.3s ease;
    background: #fafafa;
    font-family: 'Poppins', sans-serif;
}

input:focus {
    outline: none;
    border-color: #d4a229;
    background: white;
    box-shadow: 0 0 0 3px rgba(212, 162, 41, 0.1);
}

input:hover {
    border-color: #d4a229;
}

input.error {
    border-color: #e74c3c;
    background: #fff5f5;
}

.error-message {
    color: #e74c3c;
    font-size: 13px;
    margin-top: 6px;
}

.password-toggle {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #666;
    user-select: none;
    font-size: 18px;
}

.password-toggle:hover {
    color: #0d3b52;
}

.forgot-password-container {
    text-align: right;
    margin-bottom: 24px;
}

.forgot-password {
    color: #0d3b52;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    transition: color 0.3s ease;
}

.forgot-password:hover {
    color: #d4a229;
}

.btn-login {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #d4a229 0%, #c89520 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(212, 162, 41, 0.3);
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-login:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 162, 41, 0.4);
}

.btn-login:active:not(:disabled) {
    transform: translateY(0);
}

.btn-login:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.loading {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid white;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.version {
    text-align: center;
    color: #999;
    font-size: 12px;
    margin-top: 32px;
}

.security-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
    color: #666;
    font-size: 13px;
}

.security-badge svg {
    width: 16px;
    height: 16px;
}

@media (max-width: 480px) {
    .login-container {
        padding: 32px 24px;
    }

    h1 {
        font-size: 24px;
    }

    .logo {
        width: 80px;
        height: 80px;
    }
}
</style>