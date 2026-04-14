<template>
  <div class="modal" :class="{ 'is-active': isVisible }">
    <div class="modal-background" @click="cerrarModal"></div>
    <div class="modal-card enhanced-card">
      <header class="modal-card-head enhanced-head">
        <p class="modal-card-title">{{ modalTitle }}</p>
        <button class="delete" aria-label="close" @click="cerrarModal"></button>
      </header>
      <form @submit.prevent="guardarCliente">
        <div class="modal-card-body enhanced-body">
          <!-- Formulario de cliente -->

          <div class="field is-horizontal">
            <div class="field-body">

              <div class="field">
                <label class="label">Tipo de Documento</label>
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="cliente.TipoDocumento" :disabled="modo === 'ver'">
                      <option value="" disabled selected>Seleccione...</option>
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
                  <input class="input" type="text" placeholder="Ej: 123456789" v-model="cliente.identificacion"
                    :disabled="modo === 'ver' || modo === 'editar'" pattern="[0-9\-]*" maxlength="12" required />
                </div>
              </div>

            </div>
          </div>


          <div class="field">
            <label class="label">Nombre o Razón Social</label>
            <div class="control">
              <input class="input" type="text" placeholder="Ej: Juan Pérez" v-model="cliente.nombre" :disabled="modo === 'ver'" pattern="[A-Za-z 0-9]*"
                maxlength="45" required />
            </div>
          </div>
          <div class="field">
            <label class="label">Dirección</label>
            <div class="control">
              <input class="input" type="text" placeholder="Ej: Calle 123" v-model="cliente.direccion" :disabled="modo === 'ver'" maxlength="100"
                required />
            </div>
          </div>
          <div class="field">
            <label class="label">Ciudad</label>
            <div class="control">
              <input class="input" type="text" placeholder="Ej: Bogotá" v-model="cliente.ciudad" :disabled="modo === 'ver'" maxlength="45" required />
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <label class="label">Correo</label>
                <div class="control">
                  <input class="input" type="email" placeholder="Ej: juanperez@example.com" v-model="cliente.correo" :disabled="modo === 'ver'" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Celular</label>
                <div class="control">
                  <input class="input" type="tel" placeholder="Ej: 3001234567" v-model="cliente.celular" :disabled="modo === 'ver'" pattern="[0-9]*"
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
    clienteData: Object
  },
  data() {
    return {
      cliente: { ...this.clienteData }
    };
  },
  computed: {
    modalTitle() {
      return this.modo === 'crear' ? 'Crear Cliente' : this.modo === 'editar' ? 'Editar Cliente' : 'Ver Cliente';
    }
  },
  methods: {
    cerrarModal() {
      this.$emit('close');
    },
    guardarCliente() {
      this.$emit('guardar', this.cliente);
      // this.cerrarModal();
    }
  },
  watch: {
    clienteData(newData) {
      this.cliente = { ...newData };
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