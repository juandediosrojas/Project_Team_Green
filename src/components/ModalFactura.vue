<template>
    <div class="modal" :class="{ 'is-active': isVisible }">
        <div class="modal-card enhanced-card" style="width: 90vw; max-width: none;">
            <header class="modal-card-head enhanced-head">
                <p class="modal-card-title"> {{ tittleModal }} </p>
                <button class="delete" aria-label="close" @click="cerrarModal"></button>
            </header>

            <div class="modal-card-body enhanced-body">
                <!-- Formulario de cliente -->

                <div class="field is-horizontal">
                    <div class="field-body">
                        <div class="field">
                            <label class="label">Identificación Cliente</label>
                            <div class="control">
                                <input class="input" type="text" v-model="clienteIdentificación"
                                    placeholder="Ej: 1234567890" @keyup.enter="buscarCliente" :disabled="cliente.nombre"
                                    pattern="[0-9]*" maxlength="12" />

                            </div>
                        </div>

                        <div class="field">
                            <label class="label">Nombre o Razón Social</label>
                            <div class="control">
                                <input class="input" type="text" v-model="cliente.nombre" pattern="[A-Za-z ]*"
                                    placeholder="Nombre del Cliente" maxlength="45" :disabled="true" />
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Código Producto</label>
                            <div class="control">
                                <input class="input" type="text" v-model="codigoProducto" pattern="[A-Za-z ]*"
                                    maxlength="45" @keyup.enter="buscarProducto" placeholder="Código del Producto" />
                            </div>
                        </div>
                        <div class="field">
                            <label class="label">Código Servicio</label>
                            <div class="control">
                                <input class="input" type="text" v-model="codigoServicio" pattern="[A-Za-z ]*"
                                    maxlength="45" @keyup.enter="buscarServicio" placeholder="Código del Servicio" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="field">
                    <label class="checkbox">
                        <input type="checkbox" v-model="usarLotes">
                        Facturar con Lotes
                    </label>
                </div>

                <!-- Contenedor de AG Grid -->
                <div>
                    <ag-grid-vue class="ag-theme-quartz-auto-dark" :domLayout="'autoHeight'" :gridOptions="gridOptions"
                        :rowData="producAndService" :columnDefs="columnDefs" :pagination="false" />
                </div>
                <!-- Otros campos aquí -->


                <div class="field is-horizontal">

                </div>
            </div>

            <footer class="modal-card-foot enhanced-foot">
                <div class="buttons">
                    <button class="button is-success" type="button" @click="guardarFactura(false)"> Facturar </button>
                    <button class="button is-info" type="button" @click="guardarFactura(true)"
                        :class="{ 'is-hidden': cotizacionData }">Cotizar</button>
                </div>
                <div class="field-body" style="justify-content: flex-end;">
                    <div class="field" style="text-align: right;">

                        <div class="field" style="text-align: right;">
                            <label class="label">Subtotal</label>
                        </div>
                        <div class="control">
                            <label style="font-size: 1em;">${{
                                subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</label>
                        </div>
                        <div class="field" style="text-align: right;">
                            <label class="label">Total IVA</label>
                        </div>
                        <div class="control">
                            <label style="font-size: 1em;">${{
                                iva.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</label>
                        </div>
                    </div>
                    <div class="field" style="text-align: right;">
                        <label class="label" style="font-weight: bold;">Total de la Factura</label>
                        <div class="control">
                            <label style="font-size: 2em; font-weight: bold;">${{
                                totalFactura.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</label>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    </div>

    <!-- Modal de selección de lote -->
    <div class="modal" :class="{ 'is-active': modalLoteVisible }">
        <div class="modal-background" @click="cerrarModalLote"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Seleccionar Lote</p>
                <p v-if="productoSeleccionado?.nombre">{{ productoSeleccionado.nombre }}</p>
                <button class="delete" aria-label="close" @click="cerrarModalLote"></button>
            </header>
            <section class="modal-card-body">
                <div class="content">
                    <p><strong>Cantidad solicitada:</strong> {{ cantidadSolicitada }}</p>
                    <p><strong>Total disponible:</strong> {{ totalDisponible }}</p>

                    <div v-if="lotesDisponibles.length > 0">
                        <table class="table is-fullwidth is-striped">
                            <thead>
                                <tr>
                                    <th>Lote</th>
                                    <th>Disponible</th>
                                    <th>Vencimiento</th>
                                    <th>Cantidad a usar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(lote, index) in lotesDisponibles" :key="index">
                                    <td>{{ lote.lote }}</td>
                                    <td>{{ lote.disponible }}</td>
                                    <td>{{ lote.fecha ? new Date(lote.fecha.seconds * 1000).toLocaleDateString() : 'N/A'
                                        }}</td>
                                    <td>
                                        <input class="input" type="number" v-model.number="lote.cantidadUsar"
                                            :max="lote.disponible" min="0" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p class="has-text-weight-bold">Total asignado: {{ totalAsignado }} / {{ cantidadSolicitada }}
                        </p>
                    </div>
                    <div v-else>
                        <article class="message is-warning">
                            <div class="message-body">
                                No hay lotes disponibles para este producto.
                            </div>
                        </article>
                    </div>
                </div>
            </section>
            <footer class="modal-card-foot">
                <div class="buttons is-right">
                    <button class="button is-success" @click="confirmarSeleccionLote">Confirmar</button>
                    <button class="button" @click="cerrarModalLote">Cancelar</button>
                </div>
            </footer>
        </div>
    </div>
</template>

<script>
import { db, collection, addDoc, getDocs, query, where, updateDoc, orderBy, limit, storage, uploadBytes, getDownloadURL, ref, doc, getDoc, setDoc } from '../firebase';
import Swal from 'sweetalert2';
import jsPDF from "jspdf";

export default {
    props: {
        isVisible: Boolean,
        cotizacionData: Object
    },
    data() {
        return {
            codigoCotizacion: this.cotizacionData ? this.cotizacionData.codigo : '',
            nombreEmpresa: localStorage.getItem('nombreEmpresa') || 'Mi Empresa',
            direccion: localStorage.getItem('direccionEmpresa') || 'Dirección de la empresa',
            telefono: localStorage.getItem('telefonoEmpresa') || 'Teléfono de la empresa',
            correo: localStorage.getItem('correoEmpresa') || 'Correo de la empresa',
            celular: localStorage.getItem('celularEmpresa') || 'Celular de la empresa',
            nit: localStorage.getItem('nitEmpresa') || 'NIT de la empresa',
            totalFactura: 0,
            subtotal: 0,
            iva: 0,
            producAndService: [],
            clienteIdentificación: '',
            codigoProducto: '',
            codigoServicio: '',
            cliente: {},
            usarLotes: false,
            modalLoteVisible: false,
            productoSeleccionado: null,
            lotesDisponibles: [],
            cantidadSolicitada: 0,
            totalDisponible: 0,
            columnDefs: [
                { headerName: 'Código', field: 'codigo', width: 100, sortable: false, filter: false },
                { headerName: 'P/S', field: 'tipo', width: 90, sortable: false, filter: false },
                { headerName: 'Nombre', field: 'nombre', sortable: false, flex: 1, filter: false },
                { headerName: 'Cantidad', field: 'cantidad', sortable: false, width: 90, filter: false, editable: true, type: "numericColumn", },
                { headerName: 'Unidad', field: 'unidad', sortable: false, width: 90, filter: false, editable: (params) => !!params.data && !!params.data.ventaDetal, type: "numericColumn" },
                {
                    headerName: 'Precio', field: 'precio', sortable: false, width: 100, filter: false, editable: true, valueFormatter: this.formatNumberWithThousandsSeparator,
                    type: "numericColumn",

                },
                {
                    headerName: 'Iva', field: 'iva', sortable: false, width: 80, filter: false,
                    valueFormatter: this.formatNumberWithThousandsSeparator,
                    type: "numericColumn",
                },
                {
                    headerName: 'Total', field: 'total', sortable: false, width: 110, filter: false,
                    valueFormatter: this.formatNumberWithThousandsSeparator,
                    type: "numericColumn",
                },
                {
                    headerName: 'Lote', field: 'loteInfo', sortable: false, width: 100, filter: false,
                    valueFormatter: (params) => {
                        if (params.value && Array.isArray(params.value)) {
                            return params.value.map(l => `${l.lote} (${l.cantidad})`).join(', ');
                        }
                        return 'N/A';
                    }
                },
                {
                    headerName: '',
                    width: 45,
                    cellRenderer: this.renderButtonCell,
                    editable: false,
                    sortable: false,
                    filter: false,
                },
            ],
            gridOptions: {
                domLayout: 'autoHeight',
                defaultColDef: { ...this.$agGridDefaultColDef },
                localeText: this.$agGridLocaleText,
                paginationPageSizeSelector: false,
                onCellValueChanged: (event) => {
                    if (['cantidad', 'precio', 'unidad', 'presentacion'].includes(event.colDef.field)) {
                        const data = event.node.data;

                        const cantidad = Number(data.cantidad) || 0;
                        const precio = Number(data.precio) || 0;
                        const presentacion = Number(data.presentacion) || 1;

                        const unidadesExtra = data.ventaDetal ? Number(data.unidad) || 0 : 0;
                        const precioUnitario = precio / presentacion;

                        const subtotalItem = (cantidad * precio) + (unidadesExtra * precioUnitario);
                        const ivaItem = data.aplicaIva ? +(subtotalItem * 0.19).toFixed(2) : 0;
                        const totalItem = +(subtotalItem + ivaItem).toFixed(2);

                        // actualizar valores en el objeto (no sobreescribir precioOriginal)
                        data.iva = ivaItem;
                        data.total = totalItem;

                        event.node.setDataValue('total', totalItem);
                        this.updateTotalFactura();
                    }
                },
                onGridReady: (params) => {
                    this.gridApi = params.api;
                    this.gridColumnApi = params.columnApi;
                    this.updateTotalFactura();
                },
            }
        };
    },
    computed: {
        tittleModal() {
            return this.cotizacionData ? `Cotización ${this.cotizacionData.codigo}` : 'Crear Factura';
        },
        totalAsignado() {
            return this.lotesDisponibles.reduce((sum, lote) => sum + (lote.cantidadUsar || 0), 0);
        }
    },
    methods: {
        autoCompletar() {
            this.totalFactura = this.cotizacionData.total;
            this.subtotal = this.cotizacionData.subtotal;
            this.iva = this.cotizacionData.iva;
            this.producAndService = this.cotizacionData.productosYServicios;
            this.clienteIdentificación = this.cotizacionData.identificacion;
            this.buscarCliente();
        },
        renderButtonCell(params) {
            const button = document.createElement('button');
            button.title = "Eliminar";

            // Esto renderiza el SVG del icono directamente
            button.innerHTML = `
    <svg class="svg-inline--fa fa-trash" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash" viewBox="0 0 448 512" width="14" height="16">
      <path fill="currentColor" d="M135.2 17.7C140.6 7.3 151.1 0 162.9 0h122.3c11.8 0 22.3 7.3 27.7 17.7L328 32H432c8.8 0 16 7.2 16 16s-7.2 16-16 16H416 32 16C7.2 64 0 56.8 0 48S7.2 32 16 32H120l15.2-14.3zM32 96H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V96z"/>
    </svg>
  `;
            button.addEventListener('click', () => {
                this.deleteRow(params.data);
            });
            return button;
        },
        deleteRow(rowData) {
            if (!rowData || !rowData.id) {
                console.error('Error: El objeto no tiene una propiedad única definida.');
                return;
            }

            const rowIndex = this.producAndService.findIndex(item => item.id === rowData.id);

            if (rowIndex >= 0) {
                this.producAndService.splice(rowIndex, 1);

                if (this.gridApi) {
                    this.gridApi.applyTransaction({ remove: [rowData] });
                } else {
                    console.error('Error: `gridApi` no está disponible.');
                }

                this.updateTotalFactura();
            } else {
                console.error('Error: No se encontró el registro para eliminar.');
            }
        },
        updateTotalFactura() {
            console.log(this.producAndService);
            let subtotal = 0;
            let ivaTotal = 0;
            let total = 0;

            this.producAndService.forEach(item => {

                const cantPres = Number(item.cantidad) || 0;
                const precio = Number(item.precio) || 0;

                const presentacion = Number(item.presentacion) > 0
                    ? Number(item.presentacion)
                    : 1;

                const unidadesExtra = item.ventaDetal
                    ? Number(item.unidad) >= 0 ? Number(item.unidad) : 0
                    : 0;

                // ********* ESTA LÍNEA ES LA CLAVE *********
                const precioUnitario = presentacion > 1
                    ? precio / presentacion
                    : precio;
                console.log('precioUnitario', precioUnitario);
                console.log('unidadesExtra', unidadesExtra);
                const itemSubtotal =
                    (cantPres * precio) + (unidadesExtra * precioUnitario);
                console.log('itemSubtotal', itemSubtotal);

                const aplicaIva = item.aplicaIva == true;

                const itemIva = aplicaIva ? +(itemSubtotal * 0.19).toFixed(2) : 0;
                const itemTotal = +(itemSubtotal + itemIva).toFixed(2);

                item.precioUnitario = +precioUnitario.toFixed(2);
                item.iva = itemIva;
                item.total = itemTotal;

                subtotal += itemSubtotal;
                ivaTotal += itemIva;
                total += itemTotal;
            });

            this.subtotal = +subtotal.toFixed(2);
            this.iva = +ivaTotal.toFixed(2);
            this.totalFactura = +total.toFixed(2);
        },
        formatNumberWithThousandsSeparator(params) {
            if (params.value != null) {
                return params.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            return "";
        },
        async buscarProducto() {
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

                const q = query(collection(db, 'productos'), where('codigo', '==', this.codigoProducto));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    const data = docSnap.data();

                    if (this.usarLotes) {
                        // Verificar inventario con lotes
                        await this.verificarInventarioConLotes(docSnap.id, data);
                    } else {
                        // Facturación normal sin lotes
                        await this.agregarProductoSinLotes(docSnap.id, data);
                    }

                    Swal.close();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Producto no encontrado',
                        text: 'No se encontró un producto con ese código.',
                    });
                }
            } catch (error) {
                console.error('Error al buscar el producto:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al buscar el producto. Por favor, inténtelo de nuevo.',
                });
            } finally {
                this.codigoProducto = '';
            }
        },

        async verificarInventarioConLotes(idProducto, dataProducto) {
            const inventarioRef = doc(db, 'inventario', idProducto);
            const inventarioSnap = await getDoc(inventarioRef);

            if (!inventarioSnap.exists()) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Sin inventario',
                    text: 'Este producto no tiene inventario registrado. Puedes continuar con la facturación.',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            const inventarioData = inventarioSnap.data();
            const lotes = inventarioData.lotes || [];

            if (lotes.length === 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Sin lotes',
                    text: 'Este producto no tiene lotes disponibles. Puedes continuar con la facturación.',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            // Mostrar modal de selección de lotes
            this.productoSeleccionado = {
                id: idProducto,
                ...dataProducto
            };

            this.lotesDisponibles = lotes.map(lote => ({
                ...lote,
                disponible: lote.cantidad,
                cantidadUsar: 0
            }));

            this.cantidadSolicitada = 1;
            this.totalDisponible = lotes.reduce((sum, lote) => sum + lote.cantidad, 0);
            this.modalLoteVisible = true;
        },

        async agregarProductoSinLotes(idProducto, dataProducto) {
            // Verificar inventario sin lotes
            const inventarioRef = doc(db, 'inventario', idProducto);
            const inventarioSnap = await getDoc(inventarioRef);

            let cantidadDisponible = 0;
            if (inventarioSnap.exists()) {
                cantidadDisponible = inventarioSnap.data().cantidad || 0;
            }

            if (cantidadDisponible < 1) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Inventario insuficiente',
                    text: `Este producto tiene ${cantidadDisponible} unidades disponibles. Puedes continuar con la facturación.`,
                    confirmButtonText: 'Entendido'
                });
            }

            const aplicaIva = dataProducto.hasOwnProperty('aplicaIva') ? dataProducto.aplicaIva : false;
            const producto = {
                id: idProducto,
                codigo: dataProducto.codigo,
                nombre: dataProducto.nombre,
                cantidad: 1,
                unidad: dataProducto.unidad || 0,
                aplicaIva: aplicaIva,
                precio: dataProducto.precio,
                iva: aplicaIva ? (dataProducto.precio * 0.19).toFixed(1) : 0,
                total: (dataProducto.precio * 1 + (aplicaIva ? dataProducto.precio * 0.19 : 0)).toFixed(1),
                tipo: 'producto',
                loteInfo: null,
                usaLote: false,
                ventaDetal: dataProducto.ventaDetal || false,
                presentacion: dataProducto.presentacion || '',
            };

            this.producAndService.push(producto);
            this.producAndService = [
                ...new Map(this.producAndService.map(item => [`${item.codigo}-${item.tipo}`, item])).values()
            ];
        },

        cerrarModalLote() {
            this.modalLoteVisible = false;
            this.productoSeleccionado = null;
            this.lotesDisponibles = [];
        },

        confirmarSeleccionLote() {
            const totalAsignado = this.totalAsignado;

            if (totalAsignado === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin cantidad',
                    text: 'Debes asignar al menos una unidad de algún lote.',
                });
                return;
            }

            const lotesSeleccionados = this.lotesDisponibles
                .filter(lote => lote.cantidadUsar > 0)
                .map(lote => ({
                    lote: lote.lote,
                    cantidad: lote.cantidadUsar,
                    unidad: lote.unidadUsar || 0,
                    fecha: lote.fecha
                }));

            const aplicaIva = this.productoSeleccionado.aplicaIva || false;
            const precioUnitario = this.productoSeleccionado.precio;
            const subtotal = precioUnitario * totalAsignado;
            const iva = aplicaIva ? (subtotal * 0.19).toFixed(1) : 0;
            const total = (subtotal + parseFloat(iva)).toFixed(1);

            const producto = {
                id: this.productoSeleccionado.id,
                codigo: this.productoSeleccionado.codigo,
                nombre: this.productoSeleccionado.nombre,
                cantidad: totalAsignado,
                unidad: 0,
                aplicaIva: aplicaIva,
                precio: precioUnitario,
                iva: iva,
                total: total,
                tipo: 'producto',
                loteInfo: lotesSeleccionados,
                usaLote: true,
                ventaDetal: this.productoSeleccionado.ventaDetal || false,
                presentacion: this.productoSeleccionado.presentacion || ''
            };

            this.producAndService.push(producto);
            this.producAndService = [
                ...new Map(this.producAndService.map(item => [`${item.codigo}-${item.tipo}`, item])).values()
            ];

            this.cerrarModalLote();
        },

        async buscarServicio() {
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

                const q = query(collection(db, 'servicios'), where('codigo', '==', this.codigoServicio));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const aplicaIva = data.hasOwnProperty('aplicaIva') ? data.aplicaIva : false;
                        const servicio = {
                            id: doc.id,
                            codigo: data.codigo,
                            nombre: data.nombre,
                            cantidad: 1,
                            precio: data.precio,
                            aplicaIva: aplicaIva,
                            iva: aplicaIva ? (data.precio * 0.19).toFixed(1) : 0,
                            total: (data.precio * 1 + (aplicaIva ? data.precio * 0.19 : 0)).toFixed(1),
                            tipo: 'servicio',
                            loteInfo: null,
                            usaLote: false
                        };
                        this.producAndService.push(servicio);
                    });
                    this.producAndService = [
                        ...new Map(this.producAndService.map(item => [`${item.codigo}-${item.tipo}`, item])).values()
                    ];
                    Swal.close();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Servicio no encontrado',
                        text: 'No se encontró un servicio con ese código.',
                    });
                }
            } catch (error) {
                console.error('Error al buscar el servicio:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al buscar el servicio. Por favor, inténtelo de nuevo.',
                });
            } finally {
                this.codigoServicio = '';
            }
        },
        async buscarCliente() {
            try {
                const q = query(collection(db, 'clientes'), where('identificacion', '==', this.clienteIdentificación));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        this.cliente = { ...doc.data(), id: doc.id };
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Cliente no encontrado',
                        text: 'No se encontró un cliente con esa identificación.',
                    });
                }
            } catch (error) {
                console.error('Error al buscar el cliente:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al buscar el cliente. Por favor, inténtelo de nuevo.',
                });
            }
        },
        cerrarModal() {
            Swal.fire({
                title: '¿Está seguro?',
                text: "¿Desea cerrar la factura?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cerrar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.clearInputs();
                    this.$emit('close');
                }
            });
        },
        async guardarFactura(esCotizacion) {
            const result = await Swal.fire({
                title: `¿Está seguro?`,
                text: `¿Desea guardar la ${esCotizacion ? 'cotización' : 'factura'}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, guardar',
                cancelButtonText: 'Cancelar'
            });

            if (!result.isConfirmed) {
                return;
            }

            if (!this.cliente.nombre || this.producAndService.length === 0 ||
                this.producAndService.some(item => item.cantidad <= 0 && (item.ventaDetal && (Number(item.unidad) <= 0))) ||
                this.producAndService.some(item => item.precio <= 0) ||
                this.producAndService.some(item => item.total <= 0) ||
                this.totalFactura <= 0) {
                let errorMessage = '';
                if (!this.cliente.nombre) {
                    errorMessage = 'Por favor, seleccione un cliente antes de guardar la factura.';
                } else if (this.producAndService.length === 0) {
                    errorMessage = 'Por favor, agregue al menos un producto o servicio antes de guardar la factura.';
                } else if (this.producAndService.some(item => item.cantidad <= 0 && (item.ventaDetal && !(Number(item.unidad) <= 0)))) {
                    errorMessage = 'Por favor, verifique que la cantidad de los productos y servicios sea mayor a cero.';
                } else if (this.producAndService.some(item => item.precio <= 0)) {
                    errorMessage = 'Por favor, verifique que el precio de los productos y servicios sea mayor a cero.';
                } else if (this.producAndService.some(item => item.total <= 0)) {
                    errorMessage = 'Por favor, verifique que el total de los productos y servicios sea mayor a cero.';
                } else if (this.totalFactura <= 0) {
                    errorMessage = 'Por favor, verifique que el total de la factura sea mayor a cero.';
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorMessage,
                });
                return;
            }
            try {
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

                const collectionName = esCotizacion ? "cotizacion" : "factura";
                const refCollection = collection(db, collectionName);
                const q = query(refCollection, orderBy("codigo", "desc"), limit(1));
                const querySnapshot = await getDocs(q);

                let nuevoCodigo = 1;

                if (!querySnapshot.empty) {
                    const lastDoc = querySnapshot.docs[0].data();
                    nuevoCodigo = lastDoc.codigo + 1;
                }

                const totalFactura = this.totalFactura;
                const iva = this.iva;
                const subtotal = this.subtotal;

                // console.log('codigo nuevo:', nuevoCodigo);
                const pdfURL = await this.generarYGuardarFactura(nuevoCodigo, totalFactura, subtotal, iva, esCotizacion);

                const nuevoDoc = {
                    idCliente: this.cliente.id,
                    codigo: nuevoCodigo,
                    productosYServicios: this.producAndService,
                    total: totalFactura,
                    subtotal: subtotal,
                    iva: iva,
                    fecha: new Date(),
                    pdfURL: pdfURL
                };
                await addDoc(refCollection, nuevoDoc);

                if (!esCotizacion) {
                    // Actualizar inventario
                    // console.log('Actualizando inventario...');
                    await this.actualizarInventario();
                }

                Swal.fire({
                    icon: 'success',
                    title: `${esCotizacion ? 'Cotización' : 'Factura'} guardada`,
                    text: `La ${esCotizacion ? 'cotización' : 'factura'} se guardó correctamente.`,
                });

            } catch (error) {
                console.error('Error general:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo.',
                });
            } finally {
                this.clearInputs();
                this.$emit('close');
            }
        },

        async actualizarInventario() {
            try {
                for (const item of this.producAndService) {
                    if (item.tipo === 'producto') {
                        const inventarioRef = doc(db, 'inventario', item.id);
                        const inventarioSnap = await getDoc(inventarioRef);

                        if (!inventarioSnap.exists()) {
                            console.warn(`No se encontró inventario para el producto ${item.nombre}`);
                            continue;
                        }

                        const inventarioData = inventarioSnap.data();

                        if (item.usaLote && item.loteInfo && item.loteInfo.length > 0) {
                            // Actualizar inventario con lotes
                            const lotes = inventarioData.lotes || [];

                            for (const loteFacturado of item.loteInfo) {

                                const index = lotes.findIndex(l => l.lote === loteFacturado.lote);
                                if (index === -1) continue;

                                const lote = lotes[index];
                                const presentacion = item.presentacion || 1;
                                let presentaciones = lote.cantidad || 0;
                                let sueltas = item.unidad || 0;

                                // Venta por unidad
                                if (lote.ventaDetal && item.unidad > 0) {

                                    let solicitadas = item.unidad;

                                    // 1. Restar primero las unidades sueltas
                                    if (sueltas >= solicitadas) {
                                        sueltas -= solicitadas;
                                    } else {
                                        let faltan = solicitadas - sueltas;
                                        sueltas = 0;

                                        // 2. Romper presentaciones si es necesario
                                        let necesarias = Math.ceil(faltan / presentacion);

                                        if (necesarias > presentaciones) {
                                            throw new Error(`Inventario insuficiente en lote ${lote.lote}`);
                                        }

                                        presentaciones -= necesarias;

                                        // Unidades que quedan al romper las presentaciones usadas
                                        sueltas = (presentacion * necesarias) - faltan;
                                    }

                                } else {
                                    // Venta por presentación
                                    presentaciones -= loteFacturado.cantidad;

                                    if (presentaciones < 0) {
                                        throw new Error(`Inventario insuficiente en lote ${lote.lote}`);
                                    }
                                }

                                // 3. Guardar cambios
                                if (presentaciones <= 0 && sueltas <= 0) {
                                    // eliminar lote si quedó en 0 total
                                    lotes.splice(index, 1);
                                } else {
                                    lotes[index].cantidad = presentaciones;
                                    lotes[index].unidad = sueltas;
                                }
                            }

                            await updateDoc(inventarioRef, {
                                lotes: lotes,
                                fecha: new Date(),
                            });

                            // Registrar movimientos de inventario por lote
                            const movimientoRef = doc(db, 'movimientoInventario', item.id);
                            const movimientoSnap = await getDoc(movimientoRef);

                            for (const loteFacturado of item.loteInfo) {
                                const nuevoMovimiento = {        
                                    cantidad: loteFacturado.cantidad,
                                    unidad: item.unidad || 0,                            
                                    tipo: 'salida',
                                    fecha: new Date(),
                                    lote: loteFacturado.lote,
                                    fechaVencimiento: loteFacturado.fecha || null,
                                };

                                if (movimientoSnap.exists()) {
                                    const data = movimientoSnap.data();
                                    const movimientos = data.movimientos || [];
                                    const totalActual = (data.totalActual || 0) - loteFacturado.cantidad;

                                    movimientos.push(nuevoMovimiento);

                                    await updateDoc(movimientoRef, {
                                        movimientos: movimientos,
                                        totalActual: totalActual,
                                    });
                                } else {
                                    await setDoc(movimientoRef, {
                                        tipoObjeto: 'producto',
                                        idProducto: item.id,
                                        movimientos: [nuevoMovimiento],
                                        totalActual: -loteFacturado.cantidad,
                                    });
                                }
                            }
                        } else {
                            // --- NUEVO: manejo de venta por presentación y unidad ---
                            const inventario = inventarioData;
                            const presentacion = item.presentacion || 1; // ejemplo: 6 unidades por caja
                            let presentaciones = inventario.cantidad || 0;      // cajas completas
                            let sueltas = inventario.unidad || 0;      // unidades sueltas

                            // Si viene venta por UNIDAD
                            if (item.unidad > 0 && item.ventaDetal) {

                                let unidadesSolicitadas = item.unidad;

                                // 1. Restar de sueltas
                                if (sueltas >= unidadesSolicitadas) {
                                    sueltas -= unidadesSolicitadas;
                                } else {
                                    // Se consumen las sueltas y faltan unidades
                                    let faltan = unidadesSolicitadas - sueltas;
                                    sueltas = 0;

                                    // 2. Romper presentaciones si hace falta
                                    let presentacionesNecesarias = Math.ceil(faltan / presentacion);

                                    if (presentacionesNecesarias > presentaciones) {
                                        throw new Error("Inventario insuficiente para venta por unidades.");
                                    }

                                    presentaciones -= presentacionesNecesarias;

                                    // Agregar las unidades que se rompen
                                    sueltas = (presentacion * presentacionesNecesarias) - faltan;
                                }

                            } else {
                                // Venta normal por presentación
                                presentaciones -= item.cantidad;

                                if (presentaciones < 0) {
                                    throw new Error("Inventario insuficiente (presentaciones)");
                                }
                            }

                            // --- Guardar inventario actualizado ---
                            await updateDoc(inventarioRef, {
                                cantidad: presentaciones,
                                unidad: sueltas,
                                fecha: new Date(),
                            });

                            // Registrar movimiento
                            const movimientoRef = doc(db, 'movimientoInventario', item.id);
                            const movimientoSnap = await getDoc(movimientoRef);
                            const nuevoMovimiento = {
                                cantidad: item.cantidad,
                                unidad: item.unidad || 0,
                                tipo: 'salida',
                                fecha: new Date(),
                                lote: null,
                                fechaVencimiento: null,
                            };

                            if (movimientoSnap.exists()) {
                                const data = movimientoSnap.data();
                                const movimientos = data.movimientos || [];
                                movimientos.push(nuevoMovimiento);

                                await updateDoc(movimientoRef, {
                                    movimientos,
                                    totalActual: (presentaciones * presentacion) + sueltas,
                                });

                            } else {
                                await setDoc(movimientoRef, {
                                    tipoObjeto: 'producto',
                                    idProducto: item.id,
                                    movimientos: [nuevoMovimiento],
                                    totalActual: (presentaciones * presentacion) + sueltas,
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error al actualizar el inventario:', error);
                throw new Error('No se pudo actualizar el inventario.');
            }
        },

        async generarYGuardarFactura(nuevoCodigo, totalFactura, subtotal, iva, esCotizacion) {
            return new Promise((resolve, reject) => {
                // Calcular altura necesaria según productos
                const alturaPorProducto = 15; // mm aproximados por producto
                const alturaBase = 150; // mm para encabezado, cliente y pie
                const alturaCalculada = alturaBase + (this.producAndService.length * alturaPorProducto);
                const alturaFinal = Math.max(alturaCalculada, 200); // Mínimo 200mm

                // Configuración para tirilla térmica (80mm de ancho, altura dinámica)
                const anchoMM = 80;
                const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [anchoMM, alturaFinal]
                });

                let y = 10;
                const margen = 5;
                const anchoUtil = anchoMM - (margen * 2);

                // Función auxiliar para centrar texto
                const textoCentrado = (texto, yPos, fontSize = 10) => {
                    doc.setFontSize(fontSize);
                    const anchoTexto = doc.getTextWidth(texto);
                    const x = (anchoMM - anchoTexto) / 2;
                    doc.text(texto, x, yPos);
                };

                // Función auxiliar para línea separadora
                const lineaSeparadora = (yPos) => {
                    doc.setLineWidth(0.1);
                    doc.line(margen, yPos, anchoMM - margen, yPos);
                };

                // ENCABEZADO
                doc.setFont('helvetica', 'bold');
                textoCentrado(`${this.nombreEmpresa}`, y, 14);
                y += 6;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                textoCentrado(`NIT: ${this.nit}`, y);
                y += 4;
                {
                    const direccionTexto = `Dirección: ${this.direccion}`;
                    const lineasDireccion = doc.splitTextToSize(direccionTexto, anchoUtil);
                    lineasDireccion.forEach((linea) => {
                        textoCentrado(linea, y);
                        y += 4;
                    });
                }
                y += 4;
                textoCentrado(`Tel: ${this.celular}`, y);
                y += 6;

                lineaSeparadora(y);
                y += 5;

                // TIPO DE DOCUMENTO
                doc.setFont('helvetica', 'bold');
                textoCentrado(esCotizacion ? 'COTIZACIÓN' : 'TICKET DE VENTA', y, 12);
                y += 5;
                textoCentrado(`No. ${nuevoCodigo}`, y, 11);
                y += 6;

                lineaSeparadora(y);
                y += 5;

                // INFORMACIÓN DEL CLIENTE
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.text('CLIENTE:', margen, y);
                y += 5;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.text(`${this.cliente.nombre}`, margen, y);
                y += 4;
                doc.text(`CC/NIT: ${this.cliente.identificacion}`, margen, y);
                y += 4;
                doc.text(`Dir: ${this.cliente.direccion}` + ` ${this.cliente.ciudad}`, margen, y);            
                y += 4;
                doc.text(`Tel: ${this.cliente.celular}`, margen, y);
                y += 4;
                doc.text(`Email: ${this.cliente.correo}`, margen, y);
                y += 4;
                const now = new Date();
                doc.text(`Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, margen, y);
                y += 6;

                lineaSeparadora(y);
                y += 5;

                // ENCABEZADO DE PRODUCTOS
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.text('CANT', margen, y);
                doc.text('UNID', margen + 10, y);
                doc.text('DESCRIPCIÓN', margen + 20, y);
                doc.text('VALOR', anchoMM - margen - 5, y, { align: 'right' });
                y += 4;

                lineaSeparadora(y);
                y += 4;

                // PRODUCTOS
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);

                this.producAndService.forEach((item) => {
                    // Cantidad
                    doc.text(`${item.cantidad}`, margen + 2, y);
                    // Unidad                   
                    doc.text(`${item.unidad}`, margen + 10, y);

                    // Descripción (con salto de línea si es muy larga)
                    const descripcion = item.nombre.substring(0, 30);
                    const lineasDesc = doc.splitTextToSize(descripcion, 35);
                    doc.text(lineasDesc, margen + 20, y);

                    // Valor total del item
                    const valorItem = this.formatNumberWithThousandsSeparator({ value: item.total });
                    doc.text(`$${valorItem}`, anchoMM - margen, y, { align: 'right' });

                    y += (lineasDesc.length * 4);

                    // Precio unitario (más pequeño)
                    doc.setFontSize(7);
                    doc.text(`  @$${this.formatNumberWithThousandsSeparator({ value: item.precio })}`, margen + 20, y);
                    doc.setFontSize(8);
                    y += 5;
                });

                y += 2;
                lineaSeparadora(y);
                y += 5;

                // TOTALES
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);

                doc.text('Subtotal:', margen, y);
                doc.text(`$${this.formatNumberWithThousandsSeparator({ value: subtotal })}`, anchoMM - margen, y, { align: 'right' });
                y += 5;

                doc.text('IVA:', margen, y);
                doc.text(`$${this.formatNumberWithThousandsSeparator({ value: iva })}`, anchoMM - margen, y, { align: 'right' });
                y += 6;

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.text('TOTAL:', margen, y);
                doc.text(`$${this.formatNumberWithThousandsSeparator({ value: totalFactura })}`, anchoMM - margen, y, { align: 'right' });
                y += 8;

                lineaSeparadora(y);
                y += 5;

                // PIE DE PÁGINA
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                textoCentrado('¡Gracias por su compra!', y);
                y += 4;
                textoCentrado('www.hermesPOS-app.com', y);
                y += 10;

                // Guardar y subir
                const docName = esCotizacion ? `Cotizacion_${nuevoCodigo}.pdf` : `Factura_${nuevoCodigo}.pdf`;
                doc.save(docName);

                // Subir a Firebase
                (async () => {
                    try {
                        const pdfBlob = doc.output('blob');
                        const storageRef = ref(storage, `${esCotizacion ? 'cotizaciones' : 'facturas'}/${docName}`);
                        await uploadBytes(storageRef, pdfBlob);
                        const pdfURL = await getDownloadURL(storageRef);
                        resolve(pdfURL);
                    } catch (error) {
                        console.error('Error al guardar el PDF en Firebase Storage:', error);
                        reject(new Error('No se pudo guardar el PDF.'));
                    }
                })();
            });
        },
        clearInputs() {
            this.clienteIdentificación = '';
            this.codigoProducto = '';
            this.codigoServicio = '';
            this.cliente = {};
            this.producAndService = [];
            this.usarLotes = false;
        }
    },
    watch: {
        isVisible(value) {
            if (value && this.cotizacionData) {
                this.autoCompletar();
            }
        },
        producAndService: {
            handler() {
                this.updateTotalFactura();
            },
            deep: true
        }
    }
};
</script>

<style scoped>
.modal-card {
    max-height: 90vh;
}

.modal-card-body {
    overflow-y: auto;
}
</style>