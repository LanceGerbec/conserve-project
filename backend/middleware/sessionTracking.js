// middleware/sessionTracking.js
// Purpose: Track user sessions for document access logging

const { v4: uuidv4 } = require('uuid');

module.exports = function sessionTracking(req, res, next) {
  if (!req.session) {
    req.session = {};
  }
  
  if (!req.session.id) {
    req.session.id = uuidv4();
  }

  next();
};