import { google } from 'googleapis';

const APP_URL = process.env.NODE_ENV === 'production' 
  ? process.env.APP_URL 
  : 'http://localhost:5000';

const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const docs = google.docs({ version: 'v1', auth: oauth2Client });
const drive = google.drive({ version: 'v3', auth: oauth2Client });

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file'
    ],
    include_granted_scopes: true
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error('No refresh token received. Please ensure you have proper access.');
  }
  return tokens;
}

export async function getUserInfo(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data;
}

export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

export async function listDocuments(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  try {
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: 'files(id, name, modifiedTime)',
      pageSize: 50
    });
    return response.data.files;
  } catch (error) {
    console.error('Error listing documents:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please sign in again.');
    }
    throw error;
  }
}

export async function getDocument(accessToken: string, documentId: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  try {
    const doc = await docs.documents.get({ documentId });
    return doc.data;
  } catch (error) {
    console.error('Error getting document:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please sign in again.');
    }
    throw error;
  }
}

export async function updateDocument(
  accessToken: string, 
  documentId: string, 
  content: string
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  try {
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
  } catch (error) {
    console.error('Error updating document:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please sign in again.');
    }
    throw error;
  }
}

export async function createDocument(
  accessToken: string, 
  title: string, 
  content: string = ''
) {
  oauth2Client.setCredentials({ access_token: accessToken });
  try {
    const doc = await docs.documents.create({
      requestBody: { title }
    });

    if (content) {
      await updateDocument(accessToken, doc.data.documentId!, content);
    }

    return doc.data;
  } catch (error) {
    console.error('Error creating document:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please sign in again.');
    }
    throw error;
  }
}