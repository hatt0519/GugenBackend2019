const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const docRef = admin
  .firestore()
  .collection(functions.config().firestore.collection)
  .doc(functions.config().firestore.document)

const SOIL_MOISTURE_SENSOR_GOOD = 1000.0
const SOIL_MOISTURE_SENSOR_NORMAL = 500.0
const SOIL_MOISTURE_SENSOR_BAD = 300.0
const getStatusBySoilMoistureSensor = function(soilMoistureSensor) {
  if (soilMoistureSensor >= SOIL_MOISTURE_SENSOR_GOOD) {
    return 0
  } else if (
    soilMoistureSensor > SOIL_MOISTURE_SENSOR_NORMAL &&
    soilMoistureSensor < SOIL_MOISTURE_SENSOR_GOOD
  ) {
    return 3
  } else {
    return 1
  }
}

const update = (change, context, getStatus) => {
  const sensorValue = change.after._data
  let transaction = admin.firestore().runTransaction(t => {
    let status = getStatus(sensorValue)
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
  return functions.database.ref(ref).onUpdate((change, context) => {
    update(change, context, getStatusBySoilMoistureSensor)
  })
}

exports.updateGirlStatusByMoisture = updateGirlStatus(
  functions.config().database.id + '/' + functions.config().database.key,
  update
)
