<!-- src/components/Headerd.vue -->
<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item" @click="$router.push('/dashboard')">
          <font-awesome-icon :icon="['fas', 'house']" />
        </a>
        <!-- Botón de toggle para pantallas pequeñas -->
        <button class="navbar-burger" @click="toggleNavbar" aria-label="menu" aria-expanded="false"
          :class="{ 'is-active': isActive }">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isActive }">
        <div class="navbar-start">
          <div class="navbar-item has-dropdown is-hoverable" :class="{ 'is-active': activeDropdown === 'contactos' }">
            <a class="navbar-link" @click="toggleDropdown('contactos')">
              <font-awesome-icon :icon="['fas', 'users']" /> Contactos
            </a>
            <div class="navbar-dropdown">
              <a class="navbar-item" @click="$router.push('/gestion-clientes')">Gestión Clientes</a>
              <a class="navbar-item" @click="$router.push('/gestion-proveedores')">Gestión Proveedores</a>
            </div>
          </div>

          <div class="navbar-item has-dropdown is-hoverable" :class="{ 'is-active': activeDropdown === 'operaciones' }">
            <a class="navbar-link" @click="toggleDropdown('operaciones')"><font-awesome-icon :icon="['fas', 'gear']" />
              Operaciones</a>
            <div class="navbar-dropdown">
              <a class="navbar-item" @click="$router.push('/gestion-servicios')" v-if="rol === 'Administrador'">Gestión
                Servicios</a>
              <a class="navbar-item" @click="$router.push('/gestion-productos')" v-if="rol === 'Administrador'">Gestión
                Productos</a>
              <a class="navbar-item" @click="abrirModal('empresa')" v-if="rol === 'Administrador'">Gestión Empresa</a>
              <a class="navbar-item" @click="$router.push('/gestion-usuarios')" v-if="rol === 'Administrador'">Gestión Usuarios</a>
              <a class="navbar-item" @click="$router.push('/gestion-actividades')" v-if="rol === 'Administrador'">Gestión Actividades</a>
            </div>
          </div>

          <div class="navbar-item has-dropdown is-hoverable" :class="{ 'is-active': activeDropdown === 'inventario' }">
            <a class="navbar-link" @click="toggleDropdown('inventario')"><font-awesome-icon
                :icon="['fas', 'clipboard-list']" /> Inventario</a>
            <div class="navbar-dropdown">
              <a class="navbar-item" @click="$router.push('/inventario')">Inventario</a>
              <a class="navbar-item" @click="$router.push('/movimiento-inventario')">Movimientos Inventario</a>
              <a class="navbar-item" @click="abrirModal('inventario')" v-if="rol === 'Administrador'">Cargar
                Inventario</a>
              <a class="navbar-item" @click="abrirModal('ajusteInv')" v-if="rol === 'Administrador'">Ajuste
                Inventario</a>
            </div>
          </div>

          <div class="navbar-item has-dropdown is-hoverable" :class="{ 'is-active': activeDropdown === 'ventas' }">
            <a class="navbar-link" @click="toggleDropdown('ventas')"><font-awesome-icon
                :icon="['fas', 'dollar-sign']" /> Ventas</a>
            <div class="navbar-dropdown">
              <a class="navbar-item" @click="$router.push('/gestion-facturas')">Gestión Facturas</a>
              <a class="navbar-item" @click="$router.push('/gestion-cotizaciones')">Gestión Cotizaciones</a>
            </div>
          </div>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <span>Hola, {{ nombreEmpleado }} </span>
          </div>
          <a class="navbar-item" @click="salir()">
            Salir
            <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
          </a>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modalVisible" class="modal is-active">
      <div class="modal-background" @click="cerrarModal"></div>
      <div class="modal-card enhanced-card">
        <header class="modal-card-head enhanced-head">
          <p class="modal-card-title"> Cargar Inventario</p>
          <button class="delete" aria-label="close" @click="cerrarModal"></button>
        </header>
        <form @submit.prevent="buscarProducto">
          <div class="modal-card-body enhanced-body">
            <div class="field is-horizontal">
              <div class="field-body">
                <div class="field is-narrow" style="flex: 0 0 160px; max-width: 160px;">
                  <label class="label">Código Producto</label>
                  <div class="control">
                    <input class="input" type="text" :disabled="encontradoProducto" v-model="codigoProducto" required />
                  </div>
                </div>
                <div class="field">
                  <label class="label">Nombre Producto</label>
                  <div class="control">
                    <input class="input" type="text" v-model="nombreProducto" :disabled="true"
                      :title="nombreProducto ? nombreProducto : 'Sin nombre'" />
                  </div>
                </div>
              </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-body">
                <div class="field is-narrow" style="flex: 0 0 120px; max-width: 120px;">
                  <label class="label">Cantidad</label>
                  <div class="control">
                    <input class="input" type="number" v-model="cantidadProducto" :disabled="!nombreProducto" />
                  </div>
                </div>
                <div class="field is-narrow" style="flex: 0 0 120px; max-width: 120px;">
                  <label class="label">Unidad</label>
                  <div class="control">
                    <input class="input" type="number" v-model="unidadProducto" :disabled="!nombreProducto || !(producto && producto.ventaDetal)" />
                  </div>
                </div>
                <div class="field">
                  <label class="label">Lote</label>
                  <div class="control">
                    <label class="checkbox">
                      <input type="checkbox" v-model="usarLote" />
                      Usar Lote
                    </label>
                  </div>
                  <div class="control" v-if="usarLote">
                    <input class="input" type="text" v-model="loteProducto" placeholder="Ingrese lote" />
                  </div>
                </div>
                <div class="field">
                  <label class="label">Fecha Vencimiento</label>
                  <div class="control">
                    <label class="checkbox">
                      <input type="checkbox" v-model="usarFechaVencimiento" />
                      Usar Fecha Vencimiento
                    </label>
                  </div>
                  <div class="control" v-if="usarFechaVencimiento">
                    <input class="input" type="date" v-model="fechaVencimiento" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer class="modal-card-foot enhanced-foot">
            <div class="buttons">
              <button class="button is-success" type="submit" :class="{ 'is-loading': isLoading }"
                :disabled="isLoading">Buscar</button>
              <button class="button is-info" :disabled="!nombreProducto" type="button"
                @click="cargarInventario">Cargar</button>
              <!-- <button class="button" type="button" @click="cerrarModal">Cerrar</button> -->
            </div>
          </footer>
        </form>
      </div>
    </div>

    <GestionEmpresa :isVisible="modalEmpresaVisible" @close="cerrarModal" />

    <AjusteInventario :isVisible="modalAjusteInvVisible" @close="cerrarModal" />

    <CreateUser :isVisible="modalUserVisible" @close="cerrarModal" />
  </nav>
</template>


<script>
import Swal from 'sweetalert2';
import { signOut } from '@firebase/auth';
import { db, collection, getDoc, getDocs, query, where, updateDoc, doc, setDoc } from '../firebase';
// import GestionEmpresa from '@/components/GestionEmpresa.vue';
// import AjusteInventario from './AjusteInventario.vue';
// import CreateUser from './CreateUser.vue';
import { auth } from '@/firebase';

export default {
  name: 'Headerd',
  data() {
    return {
      modalEmpresaVisible: false,
      modalAjusteInvVisible: false,
      modalUserVisible: false,
      producto : {},
      idProducto: '',
      codigoProducto: '',
      nombreProducto: '',
      encontradoProducto: false,
      cantidadProducto: 0,
      unidadProducto: 0,
      isLoading: false,
      isActive: false,
      usarLote: false,
      loteProducto: '',
      usarFechaVencimiento: false,
      fechaVencimiento: '',
      activeDropdown: null, // Guarda el submenú abierto
      modalVisible: false,
      modalMode: 'cargar',
      nombreEmpleado: localStorage.getItem('userName') || '',
      rol: localStorage.getItem('userRole') || '',
    };
  },
  components: {
    // GestionEmpresa,
    // AjusteInventario,
    // CreateUser,
  },
  methods: {
    async buscarProducto() {
      this.isLoading = true;
      try {
        Swal.fire({
          title: "Buscando..",
          text: "Por favor, espera un momento.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const productosRef = collection(db, 'productos');
        const q = query(productosRef, where('codigo', '==', this.codigoProducto));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const producto = querySnapshot.docs[0].data();
          this.producto = producto;
          this.idProducto = querySnapshot.docs[0].id;
          this.nombreProducto = producto.nombre;
          this.encontradoProducto = true;
        }
      } catch (error) {
        Swal.close();
        console.error("Error  obteniento documentos: ", error);
      } finally {
        this.isLoading = false;
        Swal.close();
        if (this.nombreProducto === '') {
          Swal.fire({
            title: "No se encontraron productos",
            icon: "info",
          });
        }
      }
    },
    cargarInventario() {
      Swal.fire({
        title: "¿Estás seguro de cargar este inventario?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "SI, CARGAR",
        cancelButtonText: "NO, MEJOR NO",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            Swal.fire({
              title: "Guardando...",
              text: "Por favor, espera un momento.",
              allowOutsideClick: false,
              allowEscapeKey: false,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading();
              },
            });
            //console.log(this.idProducto);

            // Validaciones de datos antes de continuar
            const cantidad = Number(this.cantidadProducto);
            const unidad = Number(this.unidadProducto);

            if (!this.idProducto || !this.nombreProducto) {
              Swal.close();
              await Swal.fire({
                icon: "warning",
                title: "Producto no válido",
                text: "Debes buscar y seleccionar un producto válido antes de cargar."
              });
              return;
            }

            if (!Number.isFinite(cantidad) || cantidad <= 0) {
              Swal.close();
              await Swal.fire({
                icon: "warning",
                title: "Cantidad inválida",
                text: "La cantidad debe ser un número mayor a 0."
              });
              return;
            }
            if (this.producto.ventaDetal) {
              if ((!Number.isFinite(unidad) || unidad <= 0) && cantidad === 0) {
                Swal.close();
                await Swal.fire({
                  icon: "warning",
                  title: "Unidad inválida",
                  text: "La unidad debe ser un número mayor a 0."
                });
                return;
              } else if (unidad > this.producto.presentacion) {
                Swal.close();
                await Swal.fire({
                  icon: "warning",
                  title: "Unidad inválida",
                  text: "La unidad no puede ser mayor a la cantidad presentación " + this.producto.presentacion + "."
                });
                return;
              }
            }
            if (this.usarLote && (!this.loteProducto || !this.loteProducto.trim())) {
              Swal.close();
              await Swal.fire({
                icon: "warning",
                title: "Lote requerido",
                text: "Ingresa un lote válido o desactiva la opción de lote."
              });
              return;
            }

            if (this.usarFechaVencimiento) {
              if (!this.fechaVencimiento) {
                Swal.close();
                await Swal.fire({
                  icon: "warning",
                  title: "Fecha de vencimiento requerida",
                  text: "Selecciona una fecha de vencimiento válida."
                });
                return;
              }
              const fv = new Date(this.fechaVencimiento);
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              if (isNaN(fv.getTime()) || fv < hoy) {
                Swal.close();
                await Swal.fire({
                  icon: "warning",
                  title: "Fecha de vencimiento inválida",
                  text: "La fecha debe ser válida y no puede ser anterior a hoy."
                });
                return;
              }
            }

            // Normaliza cantidad
            this.cantidadProducto = cantidad;
            this.unidadProducto = this.producto.ventaDetal ? unidad : 0;
            const inventarioRef = doc(db, "inventario", this.idProducto);
            const inventarioSnap = await getDoc(inventarioRef);

            if (this.usarLote) {
              const lote = {
                lote: this.loteProducto.trim(),
                cantidad: this.cantidadProducto,
                unidad: this.unidadProducto,
                fecha: this.usarFechaVencimiento ? new Date(this.fechaVencimiento) : null,
              };

              if (inventarioSnap.exists()) {
                const data = inventarioSnap.data();
                const lotes = data.lotes || [];

                // Buscar si el lote ya existe
                const index = lotes.findIndex(l => l.lote === lote.lote);

                if (index !== -1) {
                  //  Actualizar cantidad si el lote ya existe
                  lotes[index].cantidad += lote.cantidad;
                   //  Actualizar unidad si el lote ya existe
                  lotes[index].unidad += lote.unidad;
                } else {
                  //  Agregar nuevo lote al array
                  lotes.push(lote);
                }

                // Actualizar documento completo
                await updateDoc(inventarioRef, {
                  lotes: lotes,
                  fecha: new Date(),
                });
              } else {
                // Crear documento de inventario con primer lote
                await setDoc(inventarioRef, {
                  cantidad: 0,
                  unidad: 0,
                  tipoObjeto: 'producto',
                  idProducto: this.idProducto,
                  tipo: "entrada",
                  lotes: [lote],
                  fecha: new Date(),
                });
              }
            } else { // NO USA LOTE
              if (inventarioSnap.exists()) {
                // Producto ya existe en inventario, actualizar cantidad
                const nuevaCantidad = inventarioSnap.data().cantidad + this.cantidadProducto;
                const nuevaUnidad = inventarioSnap.data().unidad + this.unidadProducto;
                await updateDoc(inventarioRef, {
                  cantidad: nuevaCantidad,
                  unidad: nuevaUnidad,
                });
              } else {
                // Producto no existe en inventario, agregar nuevo
                await setDoc(inventarioRef, {
                  tipoObjeto: 'producto',
                  idProducto: this.idProducto,
                  cantidad: this.cantidadProducto,
                  unidad: this.unidadProducto,
                  tipo: 'entrada',
                  fecha: new Date(),
                });
              }
            }

            // Registrar movimiento de inventario

            const movimientoRef = doc(db, 'movimientoInventario', this.idProducto);
            const movimientoSnap = await getDoc(movimientoRef);

            const nuevoMovimiento = {
              cantidad: this.cantidadProducto,
              unidad: this.unidadProducto,
              tipo: 'entrada',
              fecha: new Date(),
              lote: this.usarLote ? this.loteProducto.trim() : null,
              fechaVencimiento: this.usarFechaVencimiento ? new Date(this.fechaVencimiento) : null,
            };

            if (movimientoSnap.exists()) {
              // Documento existe, agregar movimiento al array
              const data = movimientoSnap.data();
              const movimientos = data.movimientos || [];
              const totalActual = (data.totalActual || 0) + this.cantidadProducto;
              const totalUnidad = (data.totalUnidad || 0) + this.unidadProducto;

              movimientos.push(nuevoMovimiento);

              await updateDoc(movimientoRef, {
                movimientos: movimientos,
                totalActual: totalActual,
                totalUnidad: totalUnidad,
              });
            } else {
              // Documento no existe, crear con movimiento inicial
              await setDoc(movimientoRef, {
                tipoObjeto: 'producto',
                idProducto: this.idProducto,
                movimientos: [nuevoMovimiento],
                totalActual: this.cantidadProducto,
                totalUnidad: this.unidadProducto,
              });
            }

            Swal.close();
            Swal.fire({
              title: "Carga de Producto Exitosa.",
              icon: "success",
            }).then(() => {
              this.cerrarModal();
            });

          } catch (error) {
            // Manejo de errores
            Swal.close();
            // console.error("Error cargando inventario: ", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo cargar inventario. Inténtalo de nuevo.",
            });
          }
        }
      });

    },
    abrirModal(modo) {
      if (modo === 'empresa') {
        this.modalEmpresaVisible = true;
      } else if (modo === 'inventario') {
        this.modalVisible = true;
      } else if (modo === 'ajusteInv') {
        this.modalAjusteInvVisible = true;
      } else if (modo === 'usuario') {
        this.modalUserVisible = true;
      }
    },
    cerrarModal() {
      this.codigoProducto = '';
      this.nombreProducto = '';
      this.cantidadProducto = 0;
      this.unidadProducto = 0;
      this.producto = {};
      this.modalVisible = false;
      this.modalEmpresaVisible = false;
      this.modalAjusteInvVisible = false;
      this.modalUserVisible = false;
      this.idProducto = '';
      this.usarLote = false;
      this.loteProducto = '';
      this.usarFechaVencimiento = false;
      this.fechaVencimiento = '';
      this.isLoading = false;
      this.encontradoProducto = false;
    },
    toggleNavbar() {
      this.isActive = !this.isActive;
    },
    toggleDropdown(menuName) {
      // Alterna entre abrir/cerrar un submenú
      this.activeDropdown = this.activeDropdown === menuName ? null : menuName;
    },
    salir() {
      Swal.fire({
        title: "¿Estás seguro de salir?",
        text: "Esto cerrara la sesión!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "SI, SALIR",
        cancelButtonText: "NO, MEJOR NO",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await signOut(auth); // Cierra la sesión del usuario en Firebase

            // Limpiar el almacenamiento local
            localStorage.clear();

            // Mostrar mensaje de éxito
            Swal.fire({
              title: "Sesión cerrada",
              text: "Has salido de tu cuenta.",
              icon: "success",
              confirmButtonColor: "#3085d6",
            }).then(() => {
              // Redirigir al usuario a la página de inicio
              this.$router.push("/login");
            })
              ;
          } catch (error) {
            // Manejo de errores
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
            });
          }
        }
      });
    },
  },
};
</script>

<style scoped>
/* Evita que los submenús se muestren automáticamente en pantallas pequeñas */
.navbar-item.has-dropdown .navbar-dropdown {
  display: none;
}

.navbar-item.has-dropdown.is-active .navbar-dropdown {
  display: block;
  /* Solo muestra el submenú si está activo */
}

th {
  text-align: center;
}

td {
  text-align: center;
}


.navbar {
  background-color: #004E7C;
}

.navbar-burger {
  color: #E0A800;
}

.navbar-brand {
  color: #E0A800;
}

.navbar-item .navbar-link {
  color: #E0A800;
}

.navbar-item {
  color: #E0A800;
}

@media (min-width: 1024px) {
  .navbar-link {
    color: #E0A800;
  }

  .navbar-item {
    color: #E0A800;
  }
}
</style>