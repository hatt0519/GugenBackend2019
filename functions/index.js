const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const docRef = admin
  .firestore()
  .collection(functions.config().firestore.collection)
  .doc(functions.config().firestore.document)

const GOOD = 1000.0
const NORMAL = 500.0
const BAD = 300.0
const getStatus = function(soilMoistureSensor) {
  if (soilMoistureSensor >= GOOD) {
    return 0
  } else if (soilMoistureSensor > NORMAL && soilMoistureSensor < GOOD) {
    return 3
  } else {
    return 1
  }
}

exports.addRecord = functions.database
  .ref(functions.config().database.id)
  .onUpdate((change, context) => {
    const plantData = change.after._data
    let transaction = admin.firestore().runTransaction(t => {
      let soilMoistureSensor = plantData[functions.config().database.key]
      let status = getStatus(soilMoistureSensor)
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
