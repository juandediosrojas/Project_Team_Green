<template>
    <div class="modal" :class="{ 'is-active': isVisible }">
        <div class="modal-background" @click="cerrarModal"></div>
        <div class="modal-card enhanced-card">
            <header class="modal-card-head enhanced-head">
                <p class="modal-card-title">Ajuste de Inventario</p>
                <button class="delete" aria-label="close" @click="cerrarModal"></button>
            </header>
            <form @submit.prevent="buscarProducto">
                <div class="modal-card-body enhanced-body">

                    <div class="field">
                        <label class="label">Tipo de Ajuste</label>
                        <div class="control">
                            <label class="radio">
                                <input type="radio" v-model="tipoAjuste" name="tipo" value="entrada" required>
                                Entrada
                            </label>
                            <p></p>
                            <label class="radio">
                                <input type="radio" v-model="tipoAjuste" name="tipo" value="salida" required>
                                Salida
                            </label>
                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field is-narrow" style="flex: 0 0 160px; max-width: 160px;">
                                <label class="label">Código Producto</label>
                                <div class="control">
                                    <input class="input" type="text" :disabled="encontradoProducto"
                                        placeholder="123456789" v-model="codigoProducto" required />
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Nombre Producto</label>
                                <div class="control">
                                    <input class="input" type="text" v-model="nombreProducto"
                                        placeholder="Nombre del producto" :disabled="true" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field is-narrow">
                                <label class="label">Cantidad Ajuste</label>
                                <div class="control">
                                    <input class="input" type="number" v-model="cantidadNueva" required
                                        :disabled="!nombreProducto" />
                                </div>
                            </div>
                            <div class="field is-narrow">
                                <label class="label">Unidad Ajuste</label>
                                <div class="control">
                                    <input class="input" type="number" v-model="unidadNueva" required
                                        :disabled="!nombreProducto || !(producto && producto.ventaDetal)" />
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
                                    <input class="input" type="text" v-model="loteProducto"
                                        placeholder="Ingrese lote" />
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
                            @click="ajustarInventario">Ajustar</button>
                        <!-- <button class="button" type="button" @click="cerrarModal">Cerrar</button> -->
                    </div>
                </footer>
            </form>
        </div>
    </div>
</template>

<script>
import { db, collection, getDoc, getDocs, query, where, updateDoc, doc } from '../firebase';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            tipoAjuste: 'entrada',
            codigoProducto: '',
            nombreProducto: '',
            producto: {},
            encontradoProducto: false,
            unidadNueva: 0,
            cantidadNueva: 0,
            usarLote: false,
            loteProducto: '',
            usarFechaVencimiento: false,
            fechaVencimiento: '',
            idProducto: '',
            isLoading: false,
        };
    },
    props: {
        isVisible: Boolean,
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
        clearFields() {
            this.codigoProducto = '';
            this.nombreProducto = '';
            this.usarLote = false;
            this.loteProducto = '';
            this.usarFechaVencimiento = false;
            this.fechaVencimiento = '';
            this.cantidadNueva = 0;
            this.unidadNueva = 0;
            this.idProducto = '';
            this.encontradoProducto = false;
        },
        ajustarInventario() {
            Swal.fire({
                title: "¿Estás seguro de ajustar este inventario?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "SI, AJUSTAR",
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
                        const cantidad = Number(this.cantidadNueva);
                        const unidad = Number(this.unidadNueva);

                        if (!this.idProducto || !this.nombreProducto) {
                            Swal.close();
                            await Swal.fire({
                                icon: "warning",
                                title: "Producto no válido",
                                text: "Debes buscar y seleccionar un producto válido antes de cargar."
                            });
                            return;
                        }


                        if (this.producto.ventaDetal) {
                            if (!Number.isFinite(unidad) || unidad <= 0) {
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
                        } else {
                            if (!Number.isFinite(cantidad) || cantidad <= 0) {
                                Swal.close();
                                await Swal.fire({
                                    icon: "warning",
                                    title: "Cantidad inválida",
                                    text: "La cantidad debe ser un número mayor a 0."
                                });
                                console.log("Cantidad inválida");
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

                        // Ajuste de inventario según tipo (entrada/salida)
                        this.cantidadNueva = cantidad;
                        this.unidadNueva = unidad;
                        const esEntrada = this.tipoAjuste === 'entrada';
                        const ahora = new Date();

                        const inventarioRef = doc(db, "inventario", this.idProducto);
                        const inventarioSnap = await getDoc(inventarioRef);

                        let totalActualProducto = 0;
                        let totalActualUnidad = 0;

                        if (this.usarLote) {
                            const loteInput = {
                                lote: this.loteProducto.trim(),
                                cantidad: this.cantidadNueva,
                                unidad: this.unidadNueva,
                                fecha: this.usarFechaVencimiento ? new Date(this.fechaVencimiento) : null,
                            };

                            if (inventarioSnap.exists()) {
                                const data = inventarioSnap.data();
                                const lotes = Array.isArray(data.lotes) ? [...data.lotes] : [];

                                const index = lotes.findIndex(l => l.lote === loteInput.lote);

                                if (esEntrada) {
                                    if (index !== -1) {
                                        lotes[index].cantidad = (lotes[index].cantidad || 0) + loteInput.cantidad;
                                        // Sumar unidades y convertir exceso a cantidad según la presentación
                                        {
                                            const presentacion = Number(this.producto.presentacion || 0);
                                            const unidadActual = Number(lotes[index].unidad || 0);
                                            const unidadAgregar = Number(loteInput.unidad || 0);
                                            let nuevaUnidad = unidadActual + unidadAgregar;

                                            if (presentacion > 0) {
                                                const incrementoCantidad = Math.floor(nuevaUnidad / presentacion);
                                                if (incrementoCantidad > 0) {
                                                    lotes[index].cantidad = (Number(lotes[index].cantidad || 0)) + incrementoCantidad;
                                                    nuevaUnidad = nuevaUnidad % presentacion;
                                                }
                                            }

                                            lotes[index].unidad = nuevaUnidad;
                                        }
                                        // Solo actualiza fecha de vencimiento si se proporcionó
                                        if (this.usarFechaVencimiento) {
                                            lotes[index].fecha = loteInput.fecha;
                                        }
                                    } else {
                                        lotes.push(loteInput);
                                    }
                                } else {
                                    if (index !== -1) {
                                        const actual = Number(lotes[index].cantidad || 0);
                                        let nueva = Math.max(0, actual - loteInput.cantidad);
                                        const unidadActual = Number(lotes[index].unidad || 0);
                                        let unidadNueva = unidadActual - Number(loteInput.unidad || 0);

                                        // Si hay presentación y la resta de unidades quedó negativa, intentar "pedir prestado"
                                        // de las cantidades (presentaciones) para compensar, igual que en la suma pero inverso.
                                        const presentacion = Number(this.producto.presentacion || 0);
                                        if (presentacion > 0 && unidadNueva < 0 && nueva > 0) {
                                            const deficit = Math.abs(unidadNueva);
                                            const necesarias = Math.ceil(deficit / presentacion);
                                            const tomadas = Math.min(necesarias, nueva); // no podemos tomar más cajas de las que quedan
                                            nueva = Math.max(0, nueva - tomadas); // reducir la cantidad por las cajas tomadas
                                            unidadNueva = unidadActual - Number(loteInput.unidad || 0) + tomadas * presentacion;
                                            if (unidadNueva < 0) unidadNueva = 0;
                                        } else {
                                            unidadNueva = Math.max(0, unidadNueva);
                                        }

                                        if (nueva === 0) {
                                            lotes.splice(index, 1);
                                        } else {
                                            lotes[index].cantidad = nueva;
                                        }

                                        if (unidadNueva === 0) {
                                            lotes[index].unidad = 0;
                                        } else {
                                            lotes[index].unidad = unidadNueva;
                                        }
                                    }
                                    // Si no existe el lote y es salida, no hace nada
                                }

                                totalActualProducto = lotes.reduce((acc, l) => acc + Number(l.cantidad || 0), 0);
                                totalActualUnidad = lotes.reduce((acc, l) => acc + Number(l.unidad || 0), 0);

                                await updateDoc(inventarioRef, {
                                    lotes,
                                    tipo: this.tipoAjuste,
                                    fecha: ahora,
                                });
                            } else {
                                if (esEntrada) {
                                    await setDoc(inventarioRef, {
                                        tipoObjeto: 'producto',
                                        idProducto: this.idProducto,
                                        tipo: this.tipoAjuste,
                                        lotes: [loteInput],
                                        fecha: ahora,
                                    });
                                    totalActualProducto = loteInput.cantidad;
                                    totalActualUnidad = loteInput.unidad;
                                } else {
                                    // Salida sin inventario: total queda en 0, no crea documento
                                    totalActualProducto = 0;
                                    totalActualUnidad = 0;
                                }
                            }
                        } else {
                            const actual = inventarioSnap.exists() ? Number(inventarioSnap.data().cantidad || 0) : 0;
                            let nuevaCantidad = esEntrada ? actual + this.cantidadNueva : Math.max(0, actual - this.cantidadNueva);
                            let nuevaUnidad = 0;
                            const actualCantidad = inventarioSnap.exists() ? Number(inventarioSnap.data().cantidad || 0) : 0;
                            const actualUnidad = inventarioSnap.exists() ? Number(inventarioSnap.data().unidad || 0) : 0;
                            const presentacion = Number(this.producto.presentacion || 0);

                            // cantidadInicial ya fue calculada en `nuevaCantidad` arriba.
                            // Usamos una variable intermedia para ajustar según unidades y presentación.
                            let cantidadFinal = nuevaCantidad;

                            if (this.producto.ventaDetal) {
                                if (esEntrada) {
                                    // Sumar unidades y convertir exceso en cantidades según presentación
                                    nuevaUnidad = actualUnidad + this.unidadNueva;
                                    if (presentacion > 0) {
                                        const cajasDesdeUnidades = Math.floor(nuevaUnidad / presentacion);
                                        if (cajasDesdeUnidades > 0) {
                                            cantidadFinal = cantidadFinal + cajasDesdeUnidades;
                                            nuevaUnidad = nuevaUnidad % presentacion;
                                        }
                                    }
                                } else {
                                    // Salida: restar unidades y, si hace falta, "tomar prestado" de las cantidades (presentaciones)
                                    nuevaUnidad = actualUnidad - this.unidadNueva;
                                    if (presentacion > 0 && nuevaUnidad < 0) {
                                        const deficit = Math.abs(nuevaUnidad);
                                        const cajasNecesarias = Math.ceil(deficit / presentacion);
                                        const cajasTomadas = Math.min(cajasNecesarias, cantidadFinal); // no quitar más cajas de las que hay
                                        cantidadFinal = Math.max(0, cantidadFinal - cajasTomadas);
                                        nuevaUnidad = actualUnidad + cajasTomadas * presentacion - this.unidadNueva;
                                        if (nuevaUnidad < 0) nuevaUnidad = 0;
                                    } else {
                                        nuevaUnidad = Math.max(0, nuevaUnidad);
                                    }
                                }
                            } else {
                                // Si no es venta por detalle, mantener unidad en 0
                                nuevaUnidad = 0;
                            }

                            // Asignar el resultado final a `nuevaCantidad` (si está declarada como let)
                            // y continuar usando `nuevaUnidad` más abajo.
                            nuevaCantidad = cantidadFinal;
                            totalActualProducto = nuevaCantidad;
                            totalActualUnidad = nuevaUnidad;

                            if (inventarioSnap.exists()) {
                                await updateDoc(inventarioRef, {
                                    cantidad: nuevaCantidad,
                                    unidad: nuevaUnidad,
                                    tipo: this.tipoAjuste,
                                    fecha: ahora,
                                });
                            } else {
                                await setDoc(inventarioRef, {
                                    tipoObjeto: 'producto',
                                    idProducto: this.idProducto,
                                    cantidad: nuevaCantidad,
                                    unidad: nuevaUnidad,
                                    tipo: this.tipoAjuste,
                                    fecha: ahora,
                                });
                            }
                        }

                        // Registrar movimiento de inventario
                        const movimientoRef = doc(db, 'movimientoInventario', this.idProducto);
                        const movimientoSnap = await getDoc(movimientoRef);

                        const nuevoMovimiento = {
                            cantidad: this.cantidadNueva,
                            unidad: this.unidadNueva,
                            tipo: this.tipoAjuste,
                            fecha: ahora,
                            lote: this.usarLote ? this.loteProducto.trim() : null,
                            fechaVencimiento: this.usarFechaVencimiento ? new Date(this.fechaVencimiento) : null,
                        };

                        if (movimientoSnap.exists()) {
                            const data = movimientoSnap.data();
                            const movimientos = Array.isArray(data.movimientos) ? [...data.movimientos] : [];
                            movimientos.push(nuevoMovimiento);

                            await updateDoc(movimientoRef, {
                                movimientos,
                                totalActual: totalActualProducto,
                                totalActualUnidad: totalActualUnidad,
                            });
                        } else {
                            await setDoc(movimientoRef, {
                                idProducto: this.idProducto,
                                movimientos: [nuevoMovimiento],
                                totalActual: totalActualProducto,
                                totalActualUnidad: totalActualUnidad,
                            });
                        }
                        Swal.close();
                        await Swal.fire({
                            icon: "success",
                            title: "Ajuste realizado",
                            text: "El ajuste de inventario se ha realizado correctamente."
                        }).then(() => {
                            this.cerrarModal();
                        });
                    } catch (error) {
                        // Manejo de errores
                        Swal.close();
                        console.error("Error ajustando inventario: ", error);
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "No se pudo Ajustar inventario. Inténtalo de nuevo." + (error.message ? ` Detalles: ${error.message}` : ''),
                        });
                    }
                }
            });
        },
        cerrarModal() {
            this.clearFields();
            this.$emit('close');
        },
    },
}
</script>

<style scoped></style>