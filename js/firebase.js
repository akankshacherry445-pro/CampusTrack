const firebaseConfig = {
  apiKey: "AIzaSyDgu02UF-poA4KULjOAY1AljQ5CgD_S8P0",
  authDomain: "campustrack-35a16.firebaseapp.com",
  projectId: "campustrack-35a16",
  storageBucket: "campustrack-35a16.firebasestorage.app",
  messagingSenderId: "728291640876",
  appId: "1:728291640876:web:79329514c8919f02b83389"
};

firebase.initializeApp(firebaseConfig);

// ✅ GLOBAL
window.auth = firebase.auth();
window.db = firebase.firestore();