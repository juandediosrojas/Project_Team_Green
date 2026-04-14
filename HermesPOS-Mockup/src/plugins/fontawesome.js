// src/plugins/fontawesome.js
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'; // o cualquier otro paquete de iconos que necesites

// Agregar los iconos que se van a utilizar
library.add(fas);

export default (app) => {
  app.component('font-awesome-icon', FontAwesomeIcon);
};
