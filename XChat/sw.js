// sw.js — Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCSnRVqFHmz4h-H6fNagp4TrT3CarZNmow",
  authDomain: "xchat-958d4.firebaseapp.com",
  projectId: "xchat-958d4",
  storageBucket: "xchat-958d4.firebasestorage.app",
  messagingSenderId: "25347816332",
  appId: "1:25347816332:web:eb534109b2903dcf6e34a9",
  measurementId: "G-HESZQFGJPL"
};