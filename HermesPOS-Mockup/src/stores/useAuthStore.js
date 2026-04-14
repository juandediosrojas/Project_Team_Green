import { defineStore } from 'pinia';
import { auth, db } from '@/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        role: null,
        email: null,
        activo: null,
        nombreEmpresa: '',
        nit: '',
        direccion: '',
        correo: '',
        celular: '',
        loading: true

    }),

    actions: {
        async fetchUser() {
            this.loading = true;
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'Usuarios', user.uid));
                if (userDoc.exists()) {
                    const querySnapshotEmpresa = await getDocs(collection(db, 'empresa'));
                    const empresaData = querySnapshotEmpresa.docs.map(doc => doc.data())[0];
                    try {
                        if (empresaData) {
                            this.nombreEmpresa = empresaData.nombre || '';
                            this.direccion = (empresaData.direccion || '') +
                                (empresaData.barrio ? `, ${empresaData.barrio}` : '') +
                                (empresaData.ciudad ? `, ${empresaData.ciudad}` : '') +
                                (empresaData.pais ? `, ${empresaData.pais}` : '');
                            this.correo = empresaData.correoElectronico || '';
                            this.celular = empresaData.telefono || '';
                            this.nit = empresaData.nit || '';
                            localStorage.setItem('nombreEmpresa', this.nombreEmpresa);
                            localStorage.setItem('direccionEmpresa', this.direccion);
                            localStorage.setItem('correoEmpresa', this.correo);
                            localStorage.setItem('celularEmpresa', this.celular);
                            localStorage.setItem('nitEmpresa', this.nit);
                        } else {
                            this.nombreEmpresa = '';
                            this.direccion = '';
                            this.correo = '';
                            this.celular = '';
                            this.nit = '';
                        }
                        this.user = userDoc.data().nombre;
                        this.role = userDoc.data().rol;
                        this.activo = userDoc.data().activo;
                        this.email = userDoc.data().email;
                        localStorage.setItem('userRole', this.role);
                        localStorage.setItem('userName', this.user);
                        localStorage.setItem('userEmail', this.email);
                        localStorage.setItem('userActivo', this.activo);
                    } catch (error) {
                        console.error('Error loading company data:', error);
                    }
                    this.user = userDoc.data().nombre;
                    this.role = userDoc.data().rol;
                    this.activo = userDoc.data().activo;
                    this.email = userDoc.data().email;
                    localStorage.setItem('userRole', this.role);
                    localStorage.setItem('userName', this.user);
                    localStorage.setItem('userEmail', this.email);
                    localStorage.setItem('userActivo', this.activo);
                }
            } else {
                this.user = null;
                this.role = null;
                this.email = null;
                this.activo = null;
                this.nombreEmpresa = null;
                this.direccion = null;
                this.correo = null;
                this.celular = null;
                this.nit = null;
                localStorage.removeItem('nitEmpresa');
                localStorage.removeItem('nombreEmpresa');
                localStorage.removeItem('direccionEmpresa');
                localStorage.removeItem('correoEmpresa');
                localStorage.removeItem('celularEmpresa');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userActivo');
            }
            this.loading = false;
        },

        logout() {
            auth.signOut();
            this.user = null;
            this.role = null;
            this.email = null;
            this.activo = null;
            this.nombreEmpresa = null;
            this.direccion = null;
            this.correo = null;
            this.celular = null;
            this.nombreEmpresa = null;
            this.direccion = null;
            this.nit = null;
            localStorage.removeItem('nitEmpresa');
            localStorage.removeItem('nombreEmpresa');
            localStorage.removeItem('direccionEmpresa');
            localStorage.removeItem('correoEmpresa');
            localStorage.removeItem('celularEmpresa');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userActivo');
        }
    }
});
