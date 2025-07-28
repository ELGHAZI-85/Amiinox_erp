import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';

import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const dynamodb = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const createWindow = () => {
  const win = new BrowserWindow({
    title: 'AmiinoxErp',
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.openDevTools();

  // Use local dev server OR local file
  // const startUrl = url.format({
  //   pathname: join(__dirname, './app/build/index.html'),
  //   protocol: 'file:',
  //   slashes: true,
  // });

  // win.loadURL(startUrl);
  win.loadURL('http://localhost:5173');
};

ipcMain.handle('upload-to-s3', async (event, { s3Key, buffer, mimeType }) => {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: Buffer.from(buffer),
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-command-to-dynamo', async (event, { formData, uploadedUrls }) => {
  const requestId = uuidv4();

  const item = {
    request_id: { S: requestId },
    created_at: { S: new Date().toISOString() },
    Urls_Media: {
      L: uploadedUrls.map(url => ({ S: url }))
    },
    ...Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, { S: String(value) }])
    ),
  };

  const params = {
    TableName: 'Commands',
    Item: item,
  };

  await dynamodb.send(new PutItemCommand(params));

  return { success: true, request_id: requestId };
});

// Add error handling for S3 URL validation
ipcMain.handle('get-commands-from-dynamo', async () => {
  try {
    const command = new ScanCommand({
      TableName: 'Commands',
    });

    const response = await dynamodb.send(command);

    const items = response.Items.map(item => ({
      request_id: item.request_id?.S,
      created_at: item.created_at?.S,
      nom: item.nom?.S,
      demandeur: item.demandeur?.S,
      zone: item.zone?.S,
      contact: item.contact?.S,
      affaire: item.affaire?.S,
      designation: item.designation?.S,
      quantite: item.quantite?.S,
      reference: item.reference?.S,
      dea: item.dea?.S,
      urgent: item.urgent?.S === 'true',
      delai_retour: item.delai_retour?.S,
      date_retour: item.date_retour?.S,
      commentaires: item.commentaires?.S,
      state: parseInt(item.state?.N || "0", 10),
      // Filter out invalid URLs and ensure they're from your S3 bucket
      urls: item.Urls_Media?.L?.map(obj => obj.S)
        .filter(url => url && url.includes('s3.') || url.includes('amazonaws.com')) || [],
    }));

    return items;
  } catch (err) {
    console.error('Error fetching data:', err);
    return { error: true, message: err.message };
  }
});
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});