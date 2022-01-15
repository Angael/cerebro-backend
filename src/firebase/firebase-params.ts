import * as firebase from 'firebase-admin';
import * as firebaseConfig from '../../env/fileupdownload-9d68f-firebase-adminsdk-r12jp-483cc95599.json';

const firebase_params = {
  type: firebaseConfig.type,
  projectId: firebaseConfig.project_id,
  privateKeyId: firebaseConfig.private_key_id,
  privateKey: firebaseConfig.private_key,
  clientEmail: firebaseConfig.client_email,
  clientId: firebaseConfig.client_id,
  authUri: firebaseConfig.auth_uri,
  tokenUri: firebaseConfig.token_uri,
  authProviderX509CertUrl: firebaseConfig.auth_provider_x509_cert_url,
  clientC509CertUrl: firebaseConfig.client_x509_cert_url,
};

firebase.initializeApp({
  credential: firebase.credential.cert(firebase_params),
  databaseURL: process.env.FIREBASE_DB_URL,
});

export default firebase;
