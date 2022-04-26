const disks = {
  local: {
    type: 'local',
    path: './storage',
  },
  s3: {
    type: 'aws',
    region: process.env.AWS_REGION || 'us-east-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'ACCESS_KEY',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'SECRET_KEY',
    bucket: process.env.AWS_BUCKET || 'bucket',
  },
};

export default disks;
