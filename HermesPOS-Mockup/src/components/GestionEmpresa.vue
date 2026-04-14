<template>
    <div class="modal" :class="{ 'is-active': isVisible }">
        <div class="modal-background" @click="cerrarModal"></div>
        <div class="modal-card enhanced-card" style="width: 90vw; max-width: none;">
            <header class="modal-card-head enhanced-head">
                <p class="modal-card-title">Gestion Empresa</p>
                <button class="delete" aria-label="close" @click="cerrarModal"></button>
            </header>
            <form @submit.prevent="guardar">
                <div class="modal-card-body enhanced-body">

                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <label class="label">NIT</label>
                                <div class="control">
                                    <input class="input" type="text" v-model="empresa.nit" pattern="[0-9\-]*"
                                        maxlength="12" required />
                                </div>
                            </div>

                            <div class="field">
                                <label class="label">Nombre Empresa</label>
                                <div class="control">
                                    <input class="input" type="text" v-model="empresa.nombre" pattern="[A-Za-z ]*"
                                        maxlength="45" required />
                                </div>
                            </div>

                            <div class="field">
                                <label class="label">Logo</label>
                                <div class="control">
                                    <div class="file">
                                        <label class="file-label">
                                            <input class="file-input" type="file" name="logo" @change="onFileChange($event, 'logo')" accept="image/*" />
                                            <span class="file-cta">
                                                <span class="file-icon">
                                                    <font-awesome-icon :icon="['fas', 'upload']" />
                                                </span>
                                                <span class="file-label"> Elige una imagen… </span>
                                            </span>
                                        </label>
                                        <!-- Previsualización de la imagen -->
                                        <div style="margin-left: 10px;">
                                            <img :src="empresa.logoUrl" alt="Vista previa" style="max-width: 100px; max-height: 100px; border: 1px solid #ddd; border-radius: 5px;" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
<!-- 
                    <div class="field">
                        <label class="label"> Título Principal</label>
                        <div class="control">
                            <input class="input" type="text" v-model="empresa.titulo" pattern="[A-Za-z ]*"
                                 required />
                        </div>
                    </div> -->
                    <!-- <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <label class="label">Año Fundación</label>
                                <div class="control">
                                    <input class="input" type="number" v-model="empresa.anioFundacion" min="0"
                                        required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Premios Obtenidos</label>
                                <div class="control">
                                    <input class="input" type="number" v-model="empresa.premiosObtenidos" min="0"
                                        required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Contratos Firmados</label>
                                <div class="control">
                                    <input class="input" type="number" v-model="empresa.contratosRealizados" min="0"
                                        required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Cantidad Clientes </label>
                                <div class="control">
                                    <input class="input" type="number" v-model="empresa.cantidadClientes" min="0"
                                        required />
                                </div>
                            </div>
                        </div>
                    </div> -->



                    <!-- <div class="field is-horizontal">
                        <div class="field-body">

                            <div class="field">
                                <label class="label">Descripción Título</label>
                                <div class="control">
                                    <textarea class="textarea" v-model="empresa.descripcion" 
                                        required></textarea>
                                </div>
                            </div>
                            <div class="field">
                                <div class="control">
                                    <label class="label">Imagen Principal</label>
                                    <div class="file is-boxed">
                                        <label class="file-label">
                                            <input class="file-input" type="file" name="imagenTitulo"
                                                @change="onFileChange($event, 'imagenTitulo')" accept="image/*" />
                                            <span class="file-cta">
                                                <span class="file-icon">
                                                    <font-awesome-icon :icon="['fas', 'upload']" />
                                                </span>
                                                <span class="file-label"> Elige una iamgen… </span>
                                            </span>
                                        </label>
                                        Previsualización de la imagen
                                        <div style="margin-left: 10px;">
                                            <img :src="empresa.imagenUrl" alt="Vista previa"
                                                style="max-width: 100px; max-height: 100px; border: 1px solid #ddd; border-radius: 5px;" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div> -->

                    <!-- <div class="field is-horizontal">
                        <div class="field-body">


                            <div class="field">
                                <label class="label">Descripción Nosotros</label>
                                <div class="control">
                                    <textarea class="textarea" v-model="empresa.descripcionNosotros" 
                                        required></textarea>
                                </div>
                            </div>
                            <div class="field">
                                <div class="control">
                                    <label class="label">Imagen Nosotros</label>
                                    <div class="file is-boxed">
                                        <label class="file-label">
                                            <input class="file-input" type="file" name="imagenNosotros"
                                                @change="onFileChange($event, 'imagenNosotros')" accept="image/*" />
                                            <span class="file-cta">
                                                <span class="file-icon">
                                                    <font-awesome-icon :icon="['fas', 'upload']" />
                                                </span>
                                                <span class="file-label"> Elige una iamgen… </span>
                                            </span>
                                        </label>
                                        Previsualización de la imagen
                                        <div style="margin-left: 10px;">
                                            <img :src="empresa.imagenUrlNosotros" alt="Vista previa"
                                                style="max-width: 100px; max-height: 100px; border: 1px solid #ddd; border-radius: 5px;" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> -->

                    <div class="field is-horizontal">
                        <div class="field-body">

                            <div class="field">
                                <label class="label">Dirección </label>
                                <div class="control">
                                    <input class="input" type="text" v-model="empresa.direccion" maxlength="100"
                                        required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Barrio </label>
                                <div class="control">
                                    <input class="input" type="text" v-model="empresa.barrio" maxlength="100"
                                        required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Ciudad </label>
                                <div class="control">
                                    <input class="input" type="text" v-model="empresa.ciudad" maxlength="100"
                                        required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">País </label>
                                <div class="control">
                                    <input class="input" type="text" v-model="empresa.pais" maxlength="100" required />
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <label class="label">Teléfono</label>
                                <div class="control">
                                    <input class="input" type="text" v-model="empresa.telefono" pattern="[0-9]*"
                                        maxlength="10" required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Correo Electrónico</label>
                                <div class="control">
                                    <input class="input" type="email" v-model="empresa.correoElectronico" required />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <footer class="modal-card-foot enhanced-foot">
                    <div class="buttons">
                        <button class="button is-success" type="submit">Guardar</button>
                        <button class="button" type="button" @click="cerrarModal">Cerrar</button>
                    </div>
                </footer>
            </form>
        </div>
    </div>
</template>

<script>
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, orderBy, limit, storage, uploadBytes, getDownloadURL, ref } from '../firebase';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            idEmpresa: '',
            empresa: {
                nit: '',
                nombre: '',
                titulo: '',
                descripcion: '',
                descripcionNosotros: '',
                imagenUrlNosotros: '',
                imagenUrl: '',
                logoUrl: '',
                anioFundacion: 0,
                premiosObtenidos: 0,
                contratosRealizados: 0,
                cantidadClientes: 0,
                direccion: '',
                telefono: '',
                correoElectronico: '',
            },
            logo: null,
            imagenTitulo: null,
            imagenNosotros: null,
        };
    },
    props: {
        isVisible: Boolean,
    },
    watch: {
        isVisible(newVal) {
            if (newVal) {
                this.buscarEmpresa();
            }
        }
    },
    methods: {
        async buscarEmpresa() {
            try {
                // Mostrar el mensaje de cargando
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

                // Buscar la empresa en la base de datos
                const q = query(collection(db, 'empresa'));
                const querySnapshot = await getDocs(q);

                // Procesar los datos
                querySnapshot.forEach((doc) => {
                    this.idEmpresa = doc.id;
                    this.empresa = doc.data();
                });

                // Cerrar el modal de carga
                Swal.close();
            } catch (error) {
                console.error(error);

                // Mostrar error si ocurre
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al buscar la empresa',
                });
            }
        },
        clearFields() {
            this.empresa = {
                nit: '',
                nombre: '',
                titulo: '',
                descripcion: '',
                descripcionNosotros: '',
                imagenUrlNosotros: '',
                imagenUrl: '',
                anioFundacion: 0,
                premiosObtenidos: 0,
                contratosRealizados: 0,
                cantidadClientes: 0,
                direccion: '',
                ciudad: '',
                barrio: '',
                pais: '',
                telefono: '',
                correoElectronico: '',

            };
            this.imagenTitulo = null;
            this.imagenNosotros = null;
            this.logo = null;
        },
        onFileChange(e, field) {
            const file = e.target.files[0];
            const maxSize = 1 * 1024 * 1024; // 1MB

            if (file) {
                if (file.size > maxSize) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'La imagen no debe superar las 1MB',
                    });
                    return;
                }

                // Manejo dinámico para diferentes campos
                if (field === 'imagenTitulo' || field === 'imagenNosotros' || field === 'logo') {
                    this[field] = file;
                    if (field === 'logo') {
                        this.empresa.logoUrl = URL.createObjectURL(file);
                    } else {
                        this.empresa[`imagenUrl${field === 'imagenTitulo' ? '' : 'Nosotros'}`] = URL.createObjectURL(file);
                    }
                }
            }
        },
        validarTipoDatos() {
            const errores = [];

            if (this.empresa.anioFundacion < 0 || this.empresa.premiosObtenidos < 0 || this.empresa.contratosRealizados < 0 || this.empresa.cantidadClientes < 0) {
                errores.push('Los campos de tipo número no pueden ser negativos');
            }
            if (this.empresa.telefono.length !== 10) {
                errores.push('El campo de teléfono debe tener 10 dígitos');
            }
            if (this.empresa.nit.length !== 12) {
                errores.push('El campo de NIT debe tener 12 dígitos');
            }
            if (this.empresa.correoElectronico.length < 5) {
                errores.push('El campo de correo electrónico no puede estar vacío');
            }
            // if (this.empresa.descripcion.length > 255 || this.empresa.descripcionNosotros.length > 255) {
            //     errores.push('Los campos de descripción no pueden tener más de 255 caracteres');
            // } 
            if (this.empresa.nombre.length > 45 || this.empresa.titulo.length > 45) {
                errores.push('Los campos de nombre y título no pueden tener más de 45 caracteres');
            }
            if (this.empresa.direccion.length > 100) {
                errores.push('El campo de dirección no puede tener más de 100 caracteres');
            }
            if (this.imagenTitulo && this.imagenTitulo.size > 1 * 1024 * 1024) {
                errores.push('La imagen del título no puede superar 1MB');
            }
            if (this.imagenNosotros && this.imagenNosotros.size > 1 * 1024 * 1024) {
                errores.push('La imagen de nosotros no puede superar 1MB');
            }
            if (!this.imagenTitulo && !this.empresa.imagenUrl) {
                errores.push('Debe subir una imagen del título');
            }
            if (!this.imagenNosotros && !this.empresa.imagenUrlNosotros) {
                errores.push('Debe subir una imagen de nosotros');
            }
            if (!this.empresa.nit || !this.empresa.nombre || !this.empresa.titulo
                || !this.empresa.descripcion || !this.empresa.descripcionNosotros
                || !this.empresa.anioFundacion || !this.empresa.premiosObtenidos
                || !this.empresa.contratosRealizados || !this.empresa.cantidadClientes
                || !this.empresa.direccion || !this.empresa.telefono || !this.empresa.correoElectronico || !this.empresa.ciudad || !this.empresa.barrio || !this.empresa.pais) {
                errores.push('Todos los campos son obligatorios');
            }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(this.empresa.correoElectronico)) {
                errores.push('El correo electrónico no tiene un formato válido');
            }

            if (errores.length > 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errores.join(', '),
                });
                return false;
            }
            return true;
        },
        async guardar() {
            // Validar los datos
            this.validarTipoDatos();

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

            // Subir el logo si se modificó
            if (this.logo) {
                try {
                    const storageRef = ref(storage, `empresa/${this.empresa.nit}/logo`);
                    await uploadBytes(storageRef, this.logo);
                    this.empresa.logoUrl = await getDownloadURL(storageRef);
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un error al subir el logo',
                    });
                    return;
                }
            }
            // Subir la imagen si se modificaron
            if (this.imagenTitulo) {
                try {
                    const storageRef = ref(storage, `empresa/${this.empresa.nit}/imagenTitulo`);
                    await uploadBytes(storageRef, this.imagenTitulo);
                    this.empresa.imagenUrl = await getDownloadURL(storageRef);
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un error al subir la imagen del título',
                    });
                    return;
                }
            }

            if (this.imagenNosotros) {
                try {
                    const storageRef = ref(storage, `empresa/${this.empresa.nit}/imagenNosotros`);
                    await uploadBytes(storageRef, this.imagenNosotros);
                    this.empresa.imagenUrlNosotros = await getDownloadURL(storageRef);
                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un error al subir la imagen de nosotros',
                    });
                    return;
                }
            }

            try {
                // Guardar en la base de datos
                if (!this.idEmpresa) {
                    const docRef = await addDoc(collection(db, 'empresa'), this.empresa);
                    this.idEmpresa = docRef.id;
                } else {
                    await updateDoc(doc(db, 'empresa', this.idEmpresa), this.empresa);
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Guardado',
                    text: 'Datos guardados correctamente',
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al guardar datos',
                });
            }

            // Guardar en la base de datos
            // Cerrar el modal
            this.cerrarModal();
        },
        cerrarModal() {
            this.clearFields();
            this.$emit('close');
        },
    },
}
</script>

<style scoped>


</style>