<template>
  <div class="not-found-container">
    <h1 class="not-found-title">404 - <span class="not-found-error">Página No Encontrada</span></h1>
    <p class="not-found-message">Lo sentimos, la página que estás buscando no existe.</p>
    <router-link to="/" class="not-found-link">Volver al inicio</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}

.not-found-title {
  font-size: 3em;
}

.not-found-error {
  color: red;
}

.not-found-message {
  font-size: 1.5em;
}

.not-found-link {
  font-size: 1.2em;
  margin-top: 20px;
  text-decoration: none;
  color: #007bff;
}

.not-found-link:hover {
  text-decoration: underline;
}
</style>