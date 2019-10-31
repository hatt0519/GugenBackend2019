const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const docRef = admin
  .firestore()
  .collection(functions.config().firestore.collection)
  .doc(functions.config().firestore.document)

class Status {
  constructor(good, normal, bad) {
    this.good = good
    this.normal = normal
    this.bad = bad
  }
}

const getStatus = function(soilMoistureSensor, status) {
  if (soilMoistureSensor >= status.good) {
    return 0
  } else if (
    soilMoistureSensor > status.mormal &&
    soilMoistureSensor < status.bad
  ) {
    return 3
  } else {
    return 1
  }
}

const update = (change, context, getStatus, status) => {
  const sensorValue = change.after._data
  let transaction = admin.firestore().runTransaction(t => {
    let statusResult = getStatus(sensorValue, status)
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
        console.log('Transaction failure:', err)
      })
  })
}

const updateGirlStatus = (ref, onUpdate) => {
  return functions.database.ref(ref).onUpdate((change, context) => {
    update(change, context, getStatus, new Status(1000.0, 500.0, 200.0))
  })
}

exports.updateGirlStatusByMoisture = updateGirlStatus(
  functions.config().database.id + '/' + functions.config().database.key,
  update
)
