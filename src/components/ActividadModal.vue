<template>
  <div class="modal is-large" :class="{ 'is-active': isVisible }">
    <div class="modal-background" @click="cerrarModal"></div>
    <div class="modal-card enhanced-card">
      <header class="modal-card-head enhanced-head">
        <p class="modal-card-title">{{ modalTitle }}</p>
        <button class="delete" aria-label="close" @click="cerrarModal"></button>
      </header>
      <form @submit.prevent="guardarActividad">
        <div class="modal-card-body enhanced-body">
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <label class="label">Código</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Ej: 123456" v-model="actividad.codigo"
                    :disabled="modo === 'ver' || modo === 'editar'" pattern="[0-9]*" maxlength="25" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Cliente (Nombre/ID)</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Ej: Juan Perez" v-model="actividad.cliente" :disabled="modo === 'ver'"
                    maxlength="60" required />
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <label class="label">Tipo de Actividad</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Ej: Soporte Técnico" v-model="actividad.tipoActividad" :disabled="modo === 'ver'"
                    maxlength="60" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Fecha de Actividad</label>
                <div class="control">
                  <input class="input" type="date" v-model="actividad.fecha" :disabled="modo === 'ver'" required />
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">ID Usuario que realizó</label>
            <div class="control">
              <input class="input" type="text" placeholder="Ej: USR-001" v-model="actividad.idUsuario" :disabled="modo === 'ver'"
                maxlength="60" required />
            </div>
          </div>

          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea class="textarea" v-model="actividad.descripcion" :disabled="modo === 'ver'" maxlength="255"
                required></textarea>
            </div>
          </div>
        </div>

        <footer class="modal-card-foot enhanced-foot">
          <div class="buttons">
            <button v-if="modo !== 'ver'" class="button is-success" type="submit">Guardar</button>
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
    actividadData: Object
  },
  data() {
    return {
      actividad: { ...this.actividadData }
    };
  },
  computed: {
    modalTitle() {
      return this.modo === 'crear' ? 'Crear Actividad' : this.modo === 'editar' ? 'Editar Actividad' : 'Ver Actividad';
    }
  },
  methods: {
    cerrarModal() {
      this.$emit('close');
    },
    guardarActividad() {
      if (this.modo !== 'ver') {
        this.$emit('guardar', this.actividad);
      }
    }
  },
  watch: {
    actividadData(newData) {
      this.actividad = { ...newData };
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
