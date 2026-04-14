// src/router/index.js - HermesPOS-Inventario
import { createRouter, createWebHistory } from 'vue-router';
import LoginMock from '../components/Login-MOCK.vue';
import Dashboard from '@/views/Dashboard.vue';
import MovimientoInventario from '../views/MovimientoInventario.vue';
import Inventario from '@/views/Inventario.vue';
import NotFound from '../views/NotFound.vue';

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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
