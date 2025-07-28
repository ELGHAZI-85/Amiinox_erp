require('dotenv').config();
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const uploadFile = (filePath, key) => {
  const fileStream = fs.readFileSync(filePath);

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: fileStream,
  };

  return s3.upload(params).promise();
};

module.exports = { uploadFile };
