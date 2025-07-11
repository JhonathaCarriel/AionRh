import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyCBAav8YWS-yDeaCPa01mrGF-Q01UPQbFM",
    authDomain: "simulador-326c3.firebaseapp.com",
    projectId: "simulador-326c3",
    storageBucket: "simulador-326c3.firebasestorage.app",
    messagingSenderId: "701518295175",
    appId: "1:701518295175:web:8fe61750d8e7b096070822",
    measurementId: "G-03J1GZ9ZHJ"
  }
};

firebase.initializeApp(environment.firebaseConfig);
export default firebase;
