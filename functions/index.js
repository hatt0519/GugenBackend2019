const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const docRef = admin
  .firestore()
  .collection(functions.config().firestore.collection)
  .doc(functions.config().firestore.document)

class Threshold {
  constructor(threshold) {
    this.value = threshold
  }
}

const Status = {
  MOISTURE: Symbol('moisture'),
  SUNLIGHT: Symbol('sunlight'),
}

const getStatus = function(soilMoistureSensor, threshold, status) {
  if (soilMoistureSensor >= threshold.value) {
    return 3
  } else {
    switch (status) {
      case Status.MOISTURE:
        return 1
      case Status.SUNLIGHT:
        return 2
      default:
        break
    }
  }
}

const update = (change, context, getStatus, threshold, status) => {
  const sensorValue = change.after._data
  let transaction = admin.firestore().runTransaction(t => {
    let statusResult = getStatus(sensorValue, threshold, status)
    return t
      .get(docRef)
      .then(doc => {
        t.update(docRef, { status: statusResult })
        return Promise.resolve('success')
      })
      .then(result => {
        console.log('Transaction success', result)
        return ''
      })
      .catch(e => {
        console.log('Transaction failure:', e)
      })
  })
}

const updateGirlStatus = (ref, onUpdate, threshold, status) => {
  return functions.database.ref(ref).onUpdate((change, context) => {
    update(change, context, getStatus, threshold, status)
  })
}

exports.updateGirlStatusByMoisture = updateGirlStatus(
  functions.config().database.id + '/' + functions.config().database.key,
  update,
  new Threshold(3000.0),
  Status.MOISTURE
)
exports.updateGirlStatusBySunlight = updateGirlStatus(
  functions.config().database.id + '/' + functions.config().database.key2,
  update,
  new Threshold(800.0),
  Status.SUNLIGHT
)
