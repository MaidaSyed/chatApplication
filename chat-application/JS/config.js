
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"
import {getDatabase} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"

 const firebaseConfig = {
  apiKey: "AIzaSyCbviQfGNqvA5eHHPqGyFZcfeBuhsJ3BX8",
  authDomain: "groupchat-41ab9.firebaseapp.com",
  projectId: "groupchat-41ab9",
  storageBucket: "groupchat-41ab9.appspot.com",
  messagingSenderId: "844245115688",
  appId: "1:844245115688:web:7f51b9f2789aed6d90261d"
};

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app)

  export {db}