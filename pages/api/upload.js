import lighthouse from '@lighthouse-web3/sdk';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';


// Helper method to wait for NodeJS to close the incoming stream
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
  
    const apiKey = process.env.LIGHTHOUSE_API_KEY;
  
    if (req.method === 'POST') {
      try {
        const { files } = await parseForm(req);
        const uploadedFiles = files.files.map((file) => file.filepath);
        const uploadResponse = await lighthouse.upload(uploadedFiles, apiKey, {
          uploadDirectory: true,
        });
        const cid = uploadResponse.data.Hash;
  
        return res.status(200).json({ cid });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error uploading to IPFS' });
      } finally {
        // Clean up temporary files
        files.files.forEach((file) => {
          fs.unlinkSync(file.filepath);
        });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch(e) {
    console.log("console error :",e)
  }
}