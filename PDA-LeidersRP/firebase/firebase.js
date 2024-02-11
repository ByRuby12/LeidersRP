// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmNQFdptDVJBDiHFv-IJ50SOqrsru5Cys",
  authDomain: "pda-leidersrp.firebaseapp.com",
  projectId: "pda-leidersrp",
  storageBucket: "pda-leidersrp.appspot.com",
  messagingSenderId: "752072256958",
  appId: "1:752072256958:web:0c04167b0dfc30de805def"
};

//Conectamos con la base de datos
const app = initializeApp(firebaseConfig);
const db = getFirestore()

//CRUD

export const saveData = (ref,objeto) => addDoc(collection(db,ref),objeto)
export const getDataCollection = (ref) => getDocs(collection(db,ref))
export const getDataChanged_collection = ( ref, callBack) => onSnapshot(collection(db,ref),callBack)
export const getDataChanged_document = (ref, document, callBack) => onSnapshot(doc(db,ref, document),callBack)
export const deleteData = (id, ref) => deleteDoc(doc(db,ref,id))
export const getData = (id, ref) => getDoc(doc(db,ref,id))
export const updateData = (id, ref,objeto) => updateDoc(doc(db,ref,id),objeto)

export const deleteField = async (documentId, ref, fieldPath) => {
  const docRef = doc(db, ref, documentId);

  // Obtener el documento
  const documentSnapshot = await getDoc(docRef);

  if (documentSnapshot.exists()) {
    const updatedData = { ...documentSnapshot.data() };
    
    // Usar función auxiliar para eliminar el campo
    deleteFieldRecursive(fieldPath.split('.'), updatedData);

    // Actualizar el documento con los datos modificados
    await setDoc(docRef, updatedData);
  } else {
    console.error('El documento no existe');
    throw new Error('El documento no existe');
  }

  function deleteFieldRecursive(pathArray, currentData) {
    const [currentField, ...restPath] = pathArray;

    if (restPath.length === 0) {
      // Llegamos al final del camino, borramos el campo
      delete currentData[currentField];
    } else {
      // Seguimos bajando en el camino
      if (currentData[currentField] && typeof currentData[currentField] === 'object') {
        deleteFieldRecursive(restPath, currentData[currentField]);
      } else {
        console.error('El camino especificado no existe');
        throw new Error('El camino especificado no existe');
      }
    }
  }
};
