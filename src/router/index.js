import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import GestionActividades from '../views/GestionActividades.vue';
import GestionUsuarios from '../views/GestionUsuarios.vue';
import { auth } from "../firebase.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/gestion-actividades',
      name: 'GestionActividades',
      component: GestionActividades,
      meta: { requiresAuth: true, allowedRoles: ['Administrador'] }
    },
    {
      path: '/gestion-usuarios',
      name: 'GestionUsuarios',
      component: GestionUsuarios,
      meta: { requiresAuth: true, allowedRoles: ['Administrador'] }
    },
  ],
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const allowedRoles = to.meta.allowedRoles || [];
  const isAuthenticated = auth.currentUser;
  const userRole = localStorage.getItem('userRole');

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (requiresAuth && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    next('/dashboard'); // Redirige a dashboard si el rol no está permitido
  } else {
    next();
  }
});


export default router
