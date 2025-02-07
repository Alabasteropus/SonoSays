import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/auth/google/callback`
);

const docs = google.docs({ version: 'v1', auth: oauth2Client });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file'
    ]
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getUserInfo(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data;
}

export async function listDocuments(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.document'",
    fields: 'files(id, name, modifiedTime)'
  });
  return response.data.files;
}

export async function getDocument(accessToken: string, documentId: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const doc = await docs.documents.get({ documentId });
  return doc.data;
}

export async function updateDocument(
  accessToken: string, 
  documentId: string, 
  content: string
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const requests = [{
    insertText: {
      location: { index: 1 },
      text: content
    }
  }];
  
  await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests }
  });
}

export async function createDocument(
  accessToken: string, 
  title: string, 
  content: string
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const doc = await docs.documents.create({
    requestBody: { title }
  });

  if (content) {
    await updateDocument(accessToken, doc.data.documentId!, content);
  }

  return doc.data;
}
