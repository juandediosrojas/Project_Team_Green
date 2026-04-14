<template>
  <div class="modal" :class="{ 'is-active': isVisible }">
    <div class="modal-background" @click="cerrarModal"></div>
    <div class="modal-card enhanced-card">
      <header class="modal-card-head enhanced-head">
        <p class="modal-card-title">{{ modalTitle }}</p>
        <button class="delete" aria-label="close" @click="cerrarModal"></button>
      </header>
      <form @submit.prevent="guardarProveedor">
        <div class="modal-card-body enhanced-body">
          <!-- Formulario de proveedor -->

          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <label class="label">Tipo de Documento</label>
                <div class="control">
                  <div class="select">
                    <select v-model="proveedor.TipoDocumento" :disabled="modo === 'ver'">
                      <option value="CC">CC - Cedula Ciudadania</option>
                      <option value="NIT">NIT - Empresa </option>
                      <option value="PSP">PSP - Pasaporte </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label">Identificación</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Ej: 123456789" v-model="proveedor.identificacion"
                    :disabled="modo === 'ver' || modo === 'editar'" pattern="[0-9]*" maxlength="13" required />
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">Nombre o Razón Social</label>
            <div class="control">
              <input class="input" type="text" placeholder="Ej: Juan Pérez" v-model="proveedor.nombre" :disabled="modo === 'ver'"
                pattern="[A-Za-z 0-9]*" maxlength="45" required />
            </div>
          </div>
          <div class="field">
            <label class="label">Dirección</label>
            <div class="control">
              <input class="input" type="text" placeholder="Ej: Calle 123" v-model="proveedor.direccion" :disabled="modo === 'ver'" maxlength="100"
                required />
            </div>
          </div>
          <div class="field">
            <label class="label">Ciudad</label>
            <div class="control">
              <input class="input" type="text" placeholder="Ej: Bucaramanga" v-model="proveedor.ciudad" :disabled="modo === 'ver'" maxlength="45"
                required />
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-body">
            <div class="field">
              <label class="label">Correo</label>
              <div class="control">
                <input class="input" type="email" placeholder="Ej: juanperez@example.com" v-model="proveedor.correo" :disabled="modo === 'ver'" required />
              </div>
            </div>
            <div class="field">
              <label class="label">Celular</label>
              <div class="control">
                <input class="input" type="tel" placeholder="Ej: 3001234567" v-model="proveedor.celular" :disabled="modo === 'ver'" pattern="[0-9]*"
                  maxlength="10" required />
              </div>
            </div>
          </div>
        </div>
        <!-- Otros campos aquí -->
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
    proveedorData: Object    
  },
  data() {
    return {
      proveedor: { ...this.proveedorData }
    };
  },
  computed: {
    modalTitle() {
      return this.modo === 'crear' ? 'Crear Proveedor' : this.modo === 'editar' ? 'Editar Proveedor' : 'Ver Proveedor';
    }
  },
  methods: {
    cerrarModal() {
      this.$emit('close');
    },
    guardarProveedor() {
      this.$emit('guardar', this.proveedor);
      // this.cerrarModal();
    }
  },
  watch: {
    proveedorData(newData) {
      this.proveedor = { ...newData };
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