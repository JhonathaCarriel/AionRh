import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyBhnNa3BqiSPcxvUEsnYF7lyCQxOhpGoK0",
  authDomain: "sala-mundo.firebaseapp.com",
  databaseURL: "https://sala-mundo-default-rtdb.firebaseio.com",
  projectId: "sala-mundo",
  storageBucket: "sala-mundo.appspot.com",
  messagingSenderId: "957872730707",
  appId: "1:957872730707:web:53cd5459ab3cae44f80ca6"
  }
};

firebase.initializeApp(environment.firebaseConfig);
export default firebase;
