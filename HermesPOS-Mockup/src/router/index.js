// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import LoginMock from '../components/Login-MOCK.vue';
import Dashboard from '@/views/Dashboard.vue';
import GestionProveedores from '../views/GestionProveedores.vue';
import GestionFacturas from '../views/GestionFacturas.vue';
import GestionCotizaciones from '@/views/GestionCotizaciones.vue';
import GestionProductos from '../views/GestionProductos.vue';
import MovimientoInventario from '../views/MovimientoInventario.vue';
import Inventario from '@/views/Inventario.vue';
import NotFound from '../views/NotFound.vue';
import GestionClientes from '../views/GestionClientes.vue';
import GestionServicios from '../views/GestionServicios.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginMock
  },
  {
    path: '/gestion-clientes',
    name: 'GestionClientes',
    component: GestionClientes
  },
  {
    path: '/gestion-proveedores',
    name: 'GestionProveedores',
    component: GestionProveedores
  },
  {
    path: '/gestion-servicios',
    name: 'GestionServicios',
    component: GestionServicios
  },
  {
    path: '/gestion-productos',
    name: 'GestionProductos',
    component: GestionProductos
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: Inventario
  },
  {
    path: '/movimiento-inventario',
    name: 'MovimientoInventario',
    component: MovimientoInventario
  },
  {
    path: '/gestion-facturas',
    name: 'GestionFacturas',
    component: GestionFacturas
  },
  {
    path: '/gestion-cotizaciones',
    name: 'GestionCotizaciones',
    component: GestionCotizaciones
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Sin guard de autenticación para mockup - todas las rutas son accesibles
export default router;
