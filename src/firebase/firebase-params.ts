import admin from 'firebase-admin';

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FB_PROJECT_ID,
  private_key_id: '483cc9559928cede2807b9a345effe402ff965e3',
  private_key: process.env.FB_KEY,
  client_email: process.env.FB_EMAIL,
  client_id: '116388986778231348956',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-r12jp%40fileupdownload-9d68f.iam.gserviceaccount.com',
} as any;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
