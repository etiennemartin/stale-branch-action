// Creates a date minus the number of days passed in. Used to determine expiry dates.
function expiryDate(days) {
  var expiry = new Date()
  expiry.setDate(expiry.getDate() - days) // Adjust date
  return expiry
}

module.exports = {
  expiryDate
}