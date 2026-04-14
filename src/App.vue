<script>
import 'bulma/css/bulma.min.css';
import './assets/custom-style.css';
import Headerd from '@/components/Headerd.vue';
import Footer from '@/components/Footer.vue';

export default {
  name: 'App',
  components: {
    Headerd,
    Footer
  },
  data() {
    return {
      currentModule: 'inventario' // Solo mostrar el menú de Inventario
    };
  }
};
</script>

<template>
  <div id="app">
    <Headerd v-if="$route.name !== 'Login'" :module="currentModule" />
    <router-view :key="$route.fullPath" />
    <Footer v-if="$route.name !== 'Login'" />
  </div>
</template>

<style scoped></style>
