<template>
  <div class="modal" :class="{ 'is-active': isVisible }">
    <div class="modal-background" @click="cerrarModal"></div>
    <div class="modal-card enhanced-card">
      <header class="modal-card-head enhanced-head">
        <p class="modal-card-title">{{ modalTitle }}</p>
        <button class="delete" aria-label="close" @click="cerrarModal"></button>
      </header>
      <form @submit.prevent="guardarProducto">
        <div class="modal-card-body enhanced-body">
          <!-- Formulario de producto -->
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <label class="label">Código</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Ej: 123456789" v-model="producto.codigo"
                    :disabled="modo === 'ver' || modo === 'editar'" pattern="[0-9]*" maxlength="25" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Nombre Producto</label>
                <div class="control">
                  <input class="input" type="text" placeholder="Ej: Producto" v-model="producto.nombre"
                    :disabled="modo === 'ver'" pattern="[A-Za-zñÑáéíóúÁÉÍÓÚ0-9 ]*" maxlength="255" required />
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-body">
              <div class="field">
                <label class="label">Precio</label>
                <div class="control">
                  <input class="input" type="number" placeholder="$ 0.00" v-model="producto.precio"
                    :disabled="modo === 'ver'" min="0" step="0.01" required />
                </div>
              </div>
              <div class="field">
                <label class="label">Adicional</label>
                <div class="control">
                  <label class="checkbox">
                    <input type="checkbox" v-model="producto.ventaDetal" :disabled="modo === 'ver'">
                    Permitir venta al detalle
                  </label>
                </div>
                <div class="control">
                  <label class="checkbox">
                    <input type="checkbox" v-model="producto.aplicaIva" :disabled="modo === 'ver'">
                    Aplica Iva
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="field is-horizontal">
            <div class="field-body">
              <div v-if="producto.ventaDetal" class="field is-narrow">
                <label class="label">Presentación x Unidad</label>
                <div class="control">
                  <input class="input" type="number" placeholder="Ej: 100 Tabletas"
                    v-model="producto.presentacion" :disabled="modo === 'ver'" maxlength="255" :required="producto.ventaDetal" />
                </div>        
              </div>
              <!-- <div class="field">
                <label class="label">Cantidad Mínima</label>
                <div class="control">
                  <input class="input" type="number" placeholder="Ej: 0" v-model="producto.cantidadMinima"
                    :disabled="modo === 'ver'" min="0" step="1" required />
                </div>
              </div> -->
            </div>
          </div>

          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea class="textarea" v-model="producto.descripcion" :disabled="modo === 'ver'" maxlength="255"
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
              <img v-if="producto.imagenUrl" :src="producto.imagenUrl" alt="Vista previa"
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
    productoData: Object
  },
  data() {
    return {
      producto: { ...this.productoData }
    };
  },
  computed: {
    modalTitle() {
      return this.modo === 'crear' ? 'Crear Producto' : this.modo === 'editar' ? 'Editar Producto' : 'Ver Producto';
    }
  },
  methods: {
    cerrarModal() {
      this.$emit('close');
    },
    guardarProducto() {
      if (this.modo !== 'ver') {
        this.$emit('guardar', this.producto);
        // this.cerrarModal();
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];
      const maxSize = 1 * 1024 * 1024; // 1MB


      if (file) {
        if (file.size > maxSize) {
          this.$toast.error('La imagen no debe superar los 5MB');
          return;
        }
        this.producto.imagen = file;
        this.producto.imagenUrl = URL.createObjectURL(file);
      }
    },
  },
  watch: {
    productoData(newData) {
      this.producto = { ...newData };
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