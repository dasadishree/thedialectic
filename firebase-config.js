const firebaseConfig = {
    apiKey: "AIzaSyDpXs-QJNBYuGfZxPBN3Ke85RwY5IbkYLM",
    authDomain: "thedialect-ac9b5.firebaseapp.com",
    projectId: "thedialect-ac9b5",
    storageBucket: "thedialect-ac9b5.firebasestorage.app",
    messagingSenderId: "500931066144",
    appId: "1:500931066144:web:77a1a9681bb0d7b7beff45",
    measurementId: "G-HVD916GDP9"
  };

if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
} else {
    window.firebaseConfig = firebaseConfig;
}
