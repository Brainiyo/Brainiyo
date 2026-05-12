const admin = require('firebase-admin');
const logger = require('../utils/logger');

let app;

const initFirebase = () => {
  if (admin.apps.length) return admin.apps[0]; // already initialised

  try {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // Cloud-friendly: inject JSON via env var
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // Local dev: path to JSON file
      const serviceAccount = require(
        require('path').resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      );
      credential = admin.credential.cert(serviceAccount);
    } else {
      // Application Default Credentials (GCP / Cloud Run)
      credential = admin.credential.applicationDefault();
    }

    app = admin.initializeApp({ credential });
    logger.info('Firebase Admin SDK initialised ✓');
  } catch (err) {
    logger.error('Firebase Admin SDK init failed', { error: err.message });
    throw err;
  }

  return app;
};

const jwt = require('jsonwebtoken');

/**
 * Verify a Firebase ID token and return the decoded payload
 * @param {string} idToken
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
const verifyFirebaseToken = async (idToken) => {
  try {
    initFirebase();
    return await admin.auth().verifyIdToken(idToken, true); // checkRevoked = true
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Firebase Admin verification failed, falling back to insecure JWT decode for dev mode.');
      const decoded = jwt.decode(idToken);
      if (!decoded) throw new Error('Invalid token format');
      return {
        uid: decoded.user_id || decoded.sub,
        email: decoded.email,
        name: decoded.name || 'Demo Student',
        phone_number: decoded.phone_number
      };
    }
    throw err;
  }
};

module.exports = { initFirebase, verifyFirebaseToken };
