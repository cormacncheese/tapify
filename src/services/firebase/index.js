import firebase from 'firebase/app'
import { notification } from 'antd'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyC_fjxECWEdzoynKnYsIhq2Uy6qmYohSus',
  authDomain: 'tapify.firebaseapp.com',
  databaseURL: 'https://tapify-default-rtdb.firebaseio.com',
  projectId: 'tapify',
  storageBucket: 'tapify.appspot.com',
  messagingSenderId: '550874717833',
  appId: '1:550874717833:web:b63fb201e24f517af8f058',
  measurementId: 'G-4BC2HX318K',
}

firebase.initializeApp(firebaseConfig)
export const firebaseAuth = firebase.auth()
export const firebaseDatabase = firebase.database()
export const firestoreDatabase = firebase.firestore()

export async function login(email, password) {
  return firebaseAuth
    .signInWithEmailAndPassword(email, password)
    .then(() => true)
    .catch(error => {
      notification.warning({
        message: error.code,
        description: error.message,
      })
    })
}

export async function register(email, password, name) {
  return firebaseAuth
    .createUserWithEmailAndPassword(email, password)
    .then(response => {
      if (response.user) {
        const { uid, phoneNumber } = response.user

        response.user
          .updateProfile({
            photoURL:
              'https://firebasestorage.googleapis.com/v0/b/tapify.appspot.com/o/avatars%2Fd3a5a702f01c2c290e5bcb4ea5043033.jpeg?alt=media&token=2673b3d3-9ad2-4525-a981-4a7df84fa60e',
          })
          .then(() => {
            console.log('firebase auth update successful')
          })
          .catch(error => {
            console.log('firebase auth user update failed: ', error)
          })

        firestoreDatabase
          .collection('users')
          .doc(uid)
          .set({
            id: uid,
            name,
            role: 'admin',
            email,
            phoneNumber,
            avatar:
              'https://firebasestorage.googleapis.com/v0/b/tapify.appspot.com/o/avatars%2Fd3a5a702f01c2c290e5bcb4ea5043033.jpeg?alt=media&token=2673b3d3-9ad2-4525-a981-4a7df84fa60e',
          })
          .then(docRef => {
            console.log('Document written with ID: ', docRef.id)
          })
          .catch(error => {
            console.error('Error adding document: ', error)
          })

        firebaseDatabase
          .ref('users')
          .child(uid)
          .set({
            role: 'admin',
            name,
          })
      }
      return true
    })
    .catch(error => {
      notification.warning({
        message: error.code,
        description: error.message,
      })
    })
}

export async function currentAccount() {
  let userLoaded = false
  function getCurrentUser(auth) {
    return new Promise((resolve, reject) => {
      if (userLoaded) {
        resolve(firebaseAuth.currentUser)
      }
      const unsubscribe = auth.onAuthStateChanged(user => {
        userLoaded = true
        unsubscribe()
        const getUserData = async () => {
          if (user) {
            const userFields = await firebaseDatabase
              .ref('users')
              .child(user.uid)
              .once('value')
              .then(snapshot => {
                return snapshot.val()
              })
            const mergedUser = Object.assign(user, {
              id: user.uid,
              name: userFields.name,
              role: userFields.role,
              avatar: user.photoUrl,
            })
            return mergedUser
          }
          return user
        }
        resolve(getUserData())
      }, reject)
    })
  }
  return getCurrentUser(firebaseAuth)
}

export async function logout() {
  return firebaseAuth.signOut().then(() => true)
}
