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

const update = (change, context) => {
  const soilMoistureSensor = change.after._data
  let transaction = admin.firestore().runTransaction(t => {
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
}

const updateGirlStatus = (ref, onUpdate) => {
  return functions.database.ref(ref).onUpdate(update)
}

exports.updateGirlStatusByMoisture = updateGirlStatus(
  functions.config().database.id + '/' + functions.config().database.key,
  update
)
