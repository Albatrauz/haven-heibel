import { initializeApp } from 'firebase/app';
import { getFirestore } from "@firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyBqZB28SLab7XFMpgVj8gBVV_B1gTf856o",
  authDomain: "haven-heibel.firebaseapp.com",
  projectId: "haven-heibel",
  storageBucket: "haven-heibel.appspot.com",
  messagingSenderId: "104717929414",
  appId: "1:104717929414:web:32d199aee7c6468b7300c7"

}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db }