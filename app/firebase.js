// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeNZObmWy2Ych4hdsZdBWST4jBfhyMaes",
  authDomain: "inventory-management-d1e6e.firebaseapp.com",
  projectId: "inventory-management-d1e6e",
  storageBucket: "inventory-management-d1e6e.appspot.com",
  messagingSenderId: "976463086967",
  appId: "1:976463086967:web:d5c3ee892536ca3c134d72",
  measurementId: "G-HN6R0VSLJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)

export{firestore}