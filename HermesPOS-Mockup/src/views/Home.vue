<template>
  <div>
    <!-- Encabezado -->
    <header class="header navbar is-dark is-fixed-top">
      <div class="navbar-brand">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <transition name="fade">
              <img v-if="!isLoading" :src="logoUrl" alt="Logo" style="max-height: 4.5rem;">
            </transition>
          </a>
        </div>
        <a class="navbar-burger" :class="{ 'is-active': isMenuOpen }" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </a>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': isMenuOpen }">
        <div class="navbar-start" style="width: 100%; justify-content: space-evenly;">
          <a class="navbar-item" @click="scrollTo('inicio')">Inicio</a>
          <a class="navbar-item" @click="scrollTo('servicios')">Servicios</a>
          <a class="navbar-item" @click="scrollTo('nosotros')">Nosotros</a>
          <a class="navbar-item" @click="scrollTo('productos')">Productos</a>
          <a class="navbar-item" @click="scrollTo('contacto')">Contacto</a>
        </div>
        <div class="navbar-end">
          <a href="/login" class="navbar-item-end"><strong>Iniciar Sesión</strong></a>
        </div>
      </div>
    </header>


    <!-- Sección de Inicio -->
    <div v-if="isLoading" class="parallax-container">
      <div class="content">
        <div class="skeleton-image"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
    <div v-else>
      <section id="inicio" class="parallax-container" :style="{ backgroundImage: `url(${parallaxImageUrl})` }">
        <div class="content">
          <h1 style="text-align: center; color: white;">{{ empresaTitulo }}</h1>
          <p style="text-align: justify; margin: 0 auto; max-width: 800px; white-space: pre-line;">{{ empresaDescripcion
            }}</p>
        </div>
      </section>
    </div> <!-- <section id="inicio" class="parallax-container" :style="{ backgroundImage: `url(${parallaxImageUrl})` }">
      <div class="content">
        <h1 style="text-align: center;">{{ empresaTitulo }}</h1>
        <p style="text-align: center; margin: 0 auto; max-width: 800px;">{{ empresaDescripcion }}</p>
      </div>
    </section>
    -->

    <!-- Sección de Servicios -->
    <section id="servicios" class="section services-section">
      <h2 class="section-title">Servicios</h2>

      <div v-if="isLoading" class="columns">
        <div v-for="i in 3" :key="i" class="column is-one-third">
          <div class="box is-loading">
            <div class="skeleton-image"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="services">
          <div v-for="servicio in servicios" :key="servicio.id" class="service-box">
            <img :src="servicio.imagenUrl" alt="Imagen del servicio">
            <h3>{{ servicio.nombre }}</h3>
            <p>{{ servicio.descripcion }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Sección de Nosotros -->
    <section id="nosotros" class="section about-section">
      <div class="about-content">
        <div class="about-text">
          <h2 class="section-title"> Nosotros </h2>
          <p style="white-space: pre-line;"> {{ empresaDescripcionNosotros }}</p>
        </div>
        <div class="about-image parallax-image" :style="{ backgroundImage: `url(${nosotrosImagenUrl})` }"></div>
      </div>

      <!-- Franja verde con datos relevantes -->
      <div class="stats-bar">
        <div class="stat-item">
          <h3>{{ anioFundacion }}</h3>
          <p>Año de Fundación</p>
        </div>
        <div class="stat-item">
          <h3>{{ premiosObtenidos }}</h3>
          <p>Premios Obtenidos</p>
        </div>
        <div class="stat-item">
          <h3>{{ contratosFirmados }}</h3>
          <p>Contratos Firmados</p>
        </div>
        <div class="stat-item">
          <h3>{{ cantidadClientes }}</h3>
          <p>Cantidad de Clientes</p>
        </div>
      </div>
    </section>


    <!-- Sección de Producto -->
    <section id="productos" class="section">
      <div class="container">
        <h2 class="section-title-product">Productos</h2>
        <div class="products">
          <div v-for="producto in productos" :key="producto.id" class="product">
            <img :src="producto.imagenUrl" alt="Imagen del producto">
            <h3>{{ producto.nombre }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Sección de Contacto -->

    <section class="section">
      <div class="columns is-desktop">
        <!-- Información de Contacto -->
        <div class="column">
          <section id="contacto">
            <h2 class="section-title-contact">Contacto</h2>
            <p>Dirección: {{ direccion }}</p>
            <p>Teléfono: {{ celular }}</p>
            <p>Email: {{ correo }}</p>
            <div class="map-container">
              <iframe :src="googleMapsUrl" allowfullscreen="true" loading="lazy"></iframe>
            </div>
          </section>
        </div>

        <!-- Formulario de Contacto -->
        <div class="column">
          <section class="section-form">
            <h2 class="section-title-contact">Envíanos un mensaje</h2>
            <form @submit.prevent="submitForm">
              <div class="field">
                <label class="label">Nombre*</label>
                <div class="control">
                  <input class="input" type="text" v-model="contactForm.nombre" required>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-body">
                  <div class="field">
                    <label class="label">Correo Electrónico*</label>
                    <div class="control">
                      <input class="input" type="email" v-model="contactForm.correo" required>
                    </div>
                  </div>

                  <div class="field">
                    <label class="label">Celular*</label>
                    <div class="control">
                      <input class="input" type="tel" v-model="contactForm.celular" required>
                    </div>
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label">Mensaje*</label>
                <div class="control">
                  <textarea class="textarea" style="height: 198px;" v-model="contactForm.mensaje" required></textarea>
                </div>
              </div>
              <div class="field">
                <div class="control">
                  <label class="checkbox">
                    <input type="checkbox" v-model="contactForm.aceptaPoliticas" required>
                    Acepto las <a
                      href="https://www.minjusticia.gov.co/servicio-al-ciudadano/politica-de-proteccion-de-datos"
                      target="_blank">políticas de tratamiento de datos personales</a> según Colombia.
                  </label>
                </div>
              </div>
              <!-- <div class="field" style="transform: scale(0.85); transform-origin: 0 0;">
                <div class="g-recaptcha" :data-sitekey="VITE_GOOGLE_RECAPTCHA"></div>
              </div> -->
              <div class="field">
                <div class="control">
                  <button class="button custom-button" type="submit" :disabled="isLoadingButton">
                    <span v-if="isLoading">Enviando...</span>
                    <span v-else>Enviar</span>
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2024 Tecnow sas. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import { db, collection, getDocs, query, where } from '../firebase';

export default {
  data() {
    return {
      VITE_GOOGLE_RECAPTCHA: import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY,
      contactForm: {
        nombre: '',
        correo: '',
        mensaje: ''
      },
      // isCaptchaVerified: false,
      isLoading: true,
      isLoadingButton: false,
      isMenuOpen: false,
      empresaTitulo: '',
      empresaDescripcion: '',
      empresaDescripcionNosotros: '',
      anioFundacion: 0,
      premiosObtenidos: 0,
      contratosFirmados: 0,
      cantidadClientes: 0,
      nosotrosImagenUrl: 'https://placehold.co/1200x800',
      parallaxImageUrl: 'https://placehold.co/1200x800',
      servicios: [],
      productos: [],
      direccion: '',
      correo: '',
      celular: '',
      googleMapsUrl: '',
      logoUrl: '',
      modo: 'agregar'
    }
  },
  methods: {
    async submitForm() {
      // const token = grecaptcha.getResponse();
      // if (!token) {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'Error',
      //     text: 'Por favor, verifica que no eres un robot.'
      //   });
      //   return;
      // }
      // console.log('Token:', token);
      try {
        this.isLoadingButton = true;

        // const secretKey = import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY_SECRET;
        // console.log('Secret Key:', secretKey);
        // const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, {
        //   method: 'POST',
        //   mode: 'no-cors',
        // });
        // console.log('Response:', response);
        // const data = await response.json();
        // console.log('Data:', data);

        // if (!data.success) {
        //   Swal.fire({
        //     icon: 'error',
        //     title: 'Error',
        //     text: 'Fallo en la validación de reCAPTCHA, por favor intenta de nuevo.'
        //   });
        //   this.isLoadingButton = false;
        //   return;
        // }

        // Validar datos del formulario
        if (!this.contactForm.nombre || !this.contactForm.correo || !this.contactForm.celular || !this.contactForm.mensaje) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, completa todos los campos obligatorios.'
          });
          this.isLoadingButton = false;
          return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(this.contactForm.correo)) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingresa un correo electrónico válido.'
          });
          this.isLoadingButton = false;
          return;
        }

        const phonePattern = /^\d{10}$/;
        if (!phonePattern.test(this.contactForm.celular)) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingresa un número de celular válido (10 dígitos).'
          });
          this.isLoadingButton = false;
          return;
        }

        if (!this.contactForm.aceptaPoliticas) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debes aceptar las políticas de tratamiento de datos personales.'
          });
          this.isLoadingButton = false;
          return;
        }

        // Enviar correo
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID,
            template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            user_id: import.meta.env.VITE_EMAILJS_USER_ID,
            template_params: {
              to_email: 'juanro9910@gmail.com',
              name: this.contactForm.nombre,
              email: this.contactForm.correo,
              celular: this.contactForm.celular,
              msg: this.contactForm.mensaje
            }
          })
        });

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Mensaje Enviado',
          text: 'Tu mensaje ha sido enviado con éxito.'
        });

        // Restablecer el formulario
        this.contactForm.nombre = '';
        this.contactForm.correo = '';
        this.contactForm.celular = '';
        this.contactForm.mensaje = '';
        this.contactForm.aceptaPoliticas = false;
      } catch (error) {
        console.error('Error adding document: ', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al enviar el mensaje, por favor intenta de nuevo.'
        });
      } finally {
        this.isLoadingButton = false;
      }
    },
    generarGoogleMapsUrl(direccion) {
      const encodedDireccion = encodeURIComponent(direccion);
      return `https://www.google.com/maps/embed/v1/place?q=${encodedDireccion}&key=AIzaSyDCjyRi1tyFWW3gYd1Ov2OculVA5e3JDxo`;
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    async fetchTodo() {

      // Consulta Empresa
      const qEmpresa = query(collection(db, 'empresa'));
      const querySnapshotEmpresa = await getDocs(qEmpresa);
      const empresaData = querySnapshotEmpresa.docs.map(doc => doc.data())[0];

      try {
        if (empresaData) {
          this.empresaTitulo = empresaData.titulo || 'Bienvenidos a Nuestra Empresa';
          this.empresaDescripcion = empresaData.descripcion || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
          this.parallaxImageUrl = empresaData.imagenUrl || 'https://placehold.co/1200x800';
          this.empresaDescripcionNosotros = empresaData.descripcionNosotros || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
          this.nosotrosImagenUrl = empresaData.imagenUrlNosotros || 'https://placehold.co/1200x800';
          this.logoUrl = empresaData.logoUrl || 'https://placehold.co/1200x800';
          this.anioFundacion = empresaData.anioFundacion || 0;
          this.premiosObtenidos = empresaData.premiosObtenidos || 0;
          this.contratosFirmados = empresaData.contratosRealizados || 0;
          this.cantidadClientes = empresaData.cantidadClientes || 0;
          this.direccion = (empresaData.direccion || '') +
            (empresaData.barrio ? `, ${empresaData.barrio}` : '') +
            (empresaData.ciudad ? `, ${empresaData.ciudad}` : '') +
            (empresaData.pais ? `, ${empresaData.pais}` : '');
          this.correo = empresaData.correoElectronico || '';
          this.celular = empresaData.telefono || '';
        } else {
          this.empresaTitulo = 'Bienvenidos a Nuestra Empresa';
          this.empresaDescripcion = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
          this.parallaxImageUrl = 'https://placehold.co/1200x800';
          this.empresaDescripcionNosotros = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
          this.nosotrosImagenUrl = 'https://placehold.co/1200x800';
          this.logoUrl = 'https://placehold.co/1200x800';
          this.anioFundacion = 0;
          this.premiosObtenidos = 0;
          this.contratosFirmados = 0;
          this.cantidadClientes = 0;
          this.direccion = '';
          this.correo = '';
          this.celular = '';
        }

        this.googleMapsUrl = this.generarGoogleMapsUrl(this.direccion);
      } catch (error) {
        console.error('Error datos empresa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los datos de la empresa'
        });
      } finally {
        this.isLoading = false;
      }


      // Consulta Servicios
      const qServicios = query(collection(db, 'servicios'), where('mostrarEnVentanaPrincipal', '==', true));
      const querySnapshotServicios = await getDocs(qServicios);
      this.servicios = querySnapshotServicios.docs.map(doc => doc.data());
      this.servicios = this.servicios.map(servicio => {
        if (!servicio.imagenUrl) {
          servicio.imagenUrl = 'https://placehold.co/400';
        }
        return servicio;
      });

      // Consulta Productos
      const qProductos = query(collection(db, 'productos'), where('mostrarEnVentanaPrincipal', '==', true));
      const querySnapshotProductos = await getDocs(qProductos);
      this.productos = querySnapshotProductos.docs.map(doc => doc.data());
      this.productos = this.productos.map(producto => {
        if (!producto.imagenUrl) {
          producto.imagenUrl = 'https://placehold.co/400';
        }
        return producto;
      });
    },
    scrollTo(sectionId) {
      document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
    }


  },
  mounted() {
    this.fetchTodo();
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

</script>

<style scoped>
.button.custom-button {
  background-color: #4caf50;
  color: white;
  border: none;
}

.button.custom-button:hover {
  background-color: #388e3c;
}

.skeleton-image {
  width: 100%;
  height: 150px;
  background-color: #e0e0e0;
  margin-bottom: 1rem;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-text {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  margin-bottom: 0.5rem;
  animation: pulse 1.5s infinite ease-in-out;
}

/* Animación de pulsación */
@keyframes pulse {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 0.3;
  }
}

/* Contenedor del mapa para control de tamaño */
.map-container {
  border: 2px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 80%;
  margin: 0 auto;
  position: relative;
  padding-bottom: 56.25%;
  /* Relación de aspecto 16:9 */
  overflow: hidden;
}


/* Ajuste del iframe dentro del contenedor */
.map-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Vista en dispositivos más grandes */
@media (min-width: 1024px) {
  .map-container {
    width: 79%;
    padding-bottom: 42.6%;
    /* Relación de aspecto ajustada para escritorio */
  }
}

/* FIN */

@media (max-width: 768px) {
  .parallax-container {
    background-attachment: scroll;
  }
}


.navbar-item {
  color: white;
  font-size: 1.49rem;
  text-align: center;
  padding: 0.5rem 1rem;
}

.navbar-item-end {
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  color: white;
  font-size: 1.4rem;
  padding: 0.5rem 1rem;
}

.navbar-item-end:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: hsl(221, 14%, 9%)
}

.navbar-burger span {
  background-color: rgb(255, 255, 255);
}

/* Encabezado */
.header {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: green;
  z-index: 1000;
}

.header ul {
  display: flex;
  justify-content: space-around;
  list-style: none;
  padding: 1rem 0;
  margin: 0;
}

.header ul li a {
  color: white;
  text-decoration: none;
  cursor: pointer;
}

/* Efecto Parallax */
.parallax-container {
  position: relative;
  /* Necesario para el pseudo-elemento */
  height: 100vh;
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  overflow: hidden;
  /* Asegura que el pseudo-elemento no se desborde */
}

.parallax-container::before {
  content: "";
  /* Obligatorio para mostrar el pseudo-elemento */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  /* Capa negra con opacidad del 50% */
  z-index: 1;
  /* Coloca la capa detrás del texto */
}

.content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  /* Coloca el contenido por encima de la capa opaca */
}

/* Secciones Generales */
.section {
  padding: 50px;
  text-align: center;
}

/* Secciones Generales */
.section-form {
  text-align: left;
}

/* Sección de Servicios */
.services-section {
  background-color: white;
}

.section-title {
  color: rgb(62 62 62);
  font-size: 3.0rem;
  position: relative;
  margin-bottom: 10px;
  font-weight: bold;
}

.section-title::after {
  content: '';
  display: block;
  width: 100px;
  height: 4px;
  background-color: green;
  margin: 3px auto 0;

}

.section-title-contact {
  font-size: 3.0rem;
  position: relative;
  margin-bottom: 10px;
  font-weight: bold;
}

.section-title-contact::after {
  content: '';
  display: block;
  width: 100px;
  height: 4px;
  background-color: green;
  margin: 3px auto 0;
}

@media (prefers-color-scheme: light) {
  .section-title-contact {
    color: rgb(62, 62, 62);
  }

  .section-title-product {
    color: rgb(62, 62, 62);
  }
}

@media (prefers-color-scheme: dark) {
  .section-title-contact {
    color: white;
  }

  .section-title-product {
    color: white;
  }
}

.services {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.service-box {
  background-color: #e2e0e0;
  padding: 20px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  text-align: left;
  margin: 20px;
}

.service-box img {
  width: 100%;
  height: auto;
  margin-bottom: 15px;
}

.service-box h3 {
  color: rgb(62 62 62);
  font-size: 1.25rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.service-box p {
  color: rgb(62 62 62);
  font-size: 1rem;
  line-height: 1.5;
  text-align: justify;

}

/* Sección de Nosotros */
.about-section {
  display: flex;
  flex-direction: column;
  height: 100vh;
  align-items: center;
  background-color: #f8f8f8;
  padding: 0;
}

.about-content {
  display: flex;
  width: 100%;
  height: calc(100% - 100px);
  /* Asegura que el contenedor ocupe toda la altura */
}

.about-text {
  flex: 1;
  padding: 40px;
  height: 100%;
  /* Asegura que el texto ocupe toda la altura disponible */
  color: rgb(62 62 62);
  display: flex;
  justify-content: center;
  text-align: justify;
  align-items: center;
  flex-direction: column;
}

.about-image {
  flex: 1;
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  height: 100vh;
  /* Asegura que la imagen ocupe toda la altura disponible */
}

/* Franja verde con datos relevantes */
.stats-bar {
  background-color: green;
  color: white;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding: 20px 0;
  width: 100%;
  /* height: 100px; */
  /* Ajuste para dar tamaño a la franja */
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 2rem;
  margin: 0;
}

.stat-item p {
  margin: 5px 0 0;
}

/* Sección de Productos */
.products {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.section-title-product {
  font-size: 3.0rem;
  position: relative;
  margin-bottom: 10px;
  font-weight: bold;
}

.section-title-product::after {
  content: '';
  display: block;
  width: 100px;
  height: 4px;
  background-color: green;
  margin: 3px auto 0;
}

.product {
  margin: 10px;
}

.product img {
  width: 200px;
  height: 200px;
}

/* Footer */
.footer {
  background-color: green;
  color: white;
  text-align: center;
  padding: 20px;
}
</style>
