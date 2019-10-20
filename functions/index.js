const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const docRef = admin
  .firestore()
  .collection(functions.config().firestore.collection)
  .doc(functions.config().firestore.document)

exports.addRecord = functions.database
  .ref(functions.config().database.id)
  .onUpdate((change, context) => {
    const plantData = change.after._data
    let transaction = admin.firestore().runTransaction(t => {
      let soilMoistureSensor = plantData[functions.config().database.key]
      var status = 1
      if (soilMoistureSensor > 100) {
        status = 0
      } else if (soilMoistureSensor > 30 && soilMoistureSensor < 100) {
        status = 1
      } else {
        status = 2
      }
      return t
        .get(docRef)
        .then(doc => {
          t.update(docRef, { status: status })
          return Promise.resolve('success')
        })
        .then(result => {
          console.log('Transaction success', result)
          return ''
        })
        .catch(e => {
          console.log('Transaction failure:', err)
        })
    })
  })
