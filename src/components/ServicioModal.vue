<template>
  <div class="modal is-large" :class="{ 'is-active': isVisible }">
    <div class="modal-background" @click="cerrarModal"></div>
    <div class="modal-card enhanced-card">
      <header class="modal-card-head enhanced-head">
        <p class="modal-card-title">{{ modalTitle }}</p>
        <button class="delete" aria-label="close" @click="cerrarModal"></button>
      </header>
      <form @submit.prevent="guardarServicio">
        <div class="modal-card-body enhanced-body">
          <!-- Formulario de cliente -->
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <label class="label">Código</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Ej: 123456789" v-model="servicio.codigo"
                    :disabled="modo === 'ver' || modo === 'editar'" pattern="[0-9]*" maxlength="25" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Nombre Servicio</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Ej: Servicio de Limpieza" v-model="servicio.nombre" :disabled="modo === 'ver'"
                    pattern="[A-Za-zñÑáéíóúÁÉÍÓÚ 0-9]*" maxlength="60" required />
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <label class="label">Precio</label>
                <div class="control">
                  <input class="input" type="number" placeholder="0.00" v-model="servicio.precio" :disabled="modo === 'ver'" min="0"
                    step="0.01" required />
                </div>
              </div>
              <div class="field">
                 <label class="label">Adicional</label>
                <!-- <label class="checkbox">
                  <input type="checkbox" v-model="servicio.mostrarEnVentanaPrincipal" :disabled="modo === 'ver'">
                  Mostrar en ventana principal
                </label> -->
                <div class="control">
                  <label class="checkbox">
                    <input type="checkbox" v-model="servicio.aplicaIva" :disabled="modo === 'ver'">
                    Aplica Iva
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea class="textarea" v-model="servicio.descripcion" :disabled="modo === 'ver'" maxlength="255"
                required></textarea>
            </div>
          </div>

          <div class="field">
            <div class="control">
              <label class="label">Imagen</label>
              <div class="file is-boxed">
                <label class="file-label">
                  <input class="file-input" type="file" name="resume" @change="onFileChange" :disabled="modo === 'ver'"
                    accept="image/*" />
                  <span class="file-cta">
                    <span class="file-icon">
                      <font-awesome-icon :icon="['fas', 'upload']" />
                    </span>
                    <span class="file-label"> Elige una iamgen… </span>
                  </span>
                </label>
              </div>
              <img v-if="servicio.imagenUrl" :src="servicio.imagenUrl" alt="Vista previa"
                style="max-width: 100%; margin-top: 10px;" />
            </div>
          </div>
        </div>


        <footer class="modal-card-foot enhanced-foot">
          <div class="buttons">
            <button v-if="modo !== 'ver'" class="button is-success" type="submit">Guardar</button>
            <!-- <button class="button" type="button" @click="cerrarModal">Cerrar</button> -->
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
    servicioData: Object
  },
  data() {
    return {
      servicio: { ...this.servicioData }
    };
  },
  computed: {
    modalTitle() {
      return this.modo === 'crear' ? 'Crear Servicio' : this.modo === 'editar' ? 'Editar Servicio' : 'Ver Servicio';
    }
  },
  methods: {
    cerrarModal() {
      this.$emit('close');
    },
    guardarServicio() {
      if (this.modo !== 'ver') {
        this.$emit('guardar', this.servicio);
        // this.cerrarModal();
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB


      if (file) {
        if (file.size > maxSize) {
          this.$toast.error('La imagen no debe superar los 5MB');
          return;
        }
        this.servicio.imagen = file;
        this.servicio.imagenUrl = URL.createObjectURL(file);
      }
    },
  },
  watch: {
    servicioData(newData) {
      this.servicio = { ...newData };
    }
  }
};
</script>

<style scoped>
.modal-card {
  max-width: 600px;
  width: 100%;
}
</style>