import { onAuthStateChanged } from "firebase/auth";
import { AgGridVue } from "ag-grid-vue3";
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { auth } from "./firebase.js";
import fontawesome from "./plugins/fontawesome";
import Swal from "sweetalert2";

// Estilos de AG Grid
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
// Importar filtros de AG Grid
import {
  TextFilter as agTextColumnFilter,
  NumberFilter as agNumberColumnFilter, 
  DateFilter as agDateColumnFilter
} from "ag-grid-community";

import App from './App.vue'
import router from './router'

let app;
let pinia;
 

onAuthStateChanged(auth, (user) => {
    if (!app) {
        app = createApp(App);
        pinia = createPinia();
    
        fontawesome(app);
        app.use(pinia);
        app.use(router);

        // Componente de AG Grid
        app.component("ag-grid-vue", AgGridVue);

        // Registrar filtros globalmente
        app.config.globalProperties.$agGridFilters = {
          textFilter: agTextColumnFilter,
          numericFilter: agNumberColumnFilter,
          dateFilter: agDateColumnFilter,
        };

        app.config.globalProperties.$agGridDefaultColDef = {
          tooltipValueGetter: (p) => (p.value != null ? String(p.value) : '')
        };

        app.config.globalProperties.$agGridEvents = {
          onCellDoubleClicked: async (params) => {
            const text = params.value != null ? String(params.value) : '';
            try {
              await navigator.clipboard.writeText(text);
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Copiado al portapapeles',
                showConfirmButton: false,
                timer: 1200
              });
            } catch {
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'No se pudo copiar',
                showConfirmButton: false,
                timer: 1500
              });
            }
          }
        };

        app.config.globalProperties.$agGridLocaleText = {
          filterOoo: 'Escribe aquí',
          applyFilter: 'Aplicar Filtro',
          resetFilter: 'Reiniciar Filtro',
          contains: 'Contiene',
          notContains: 'No Contiene',
          equals: 'Igual a',
          notEqual: 'Diferente a',
          lessThan: 'Menor que',
          greaterThan: 'Mayor que',
          notBlank: 'Vacio',
          notblank: 'No Vacio',
          beginsWith: 'Empieza con',
          endsWith: 'Finaliza con',
          page: 'Página',
          more: 'Más',
          to: 'a',
          of: 'de',
          next: 'Siguiente',
          last: 'Último',
          first: 'Primero',
          previous: 'Anterior',
          loadingOoo: 'Cargando...',
          noRowsToShow: 'No hay registros para mostrar',
          selectAll: 'Seleccionar Todo',
          selectRow: 'Seleccionar Fila',
          pageSizePanelLabel: 'Registros por página',
          pageSize: '',
          pageRange: 'Rango de Página',
          andCondition: 'Y',
          orCondition: 'O'
        };

        app.mount('#app');
    
}});
