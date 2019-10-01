import {
  Platform,
} from 'react-native';

// Libraries
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';


// Constants
import config from '../config';

const rootPath = Platform.OS === 'android' ? `file://${RNFetchBlob.fs.dirs.DocumentDir}` : RNFetchBlob.fs.dirs.DocumentDir;

// Root path
export const getRootPath = (folderName, userGUID, experienceStreamGUID) => `${rootPath}/${folderName}/${userGUID}/${experienceStreamGUID}/`;

// Create folder
export const createFolder = async (folderName, userGUID, streamFolderName) => {
  const MkdirOptions = {
    NSURLIsExcludedFromBackupKey: true,
  };
  try {
    await RNFS.mkdir(`${rootPath}/${folderName}/${userGUID}/${streamFolderName}`, MkdirOptions);
    return ({ Confirmation: "SUCCESS" }); 
  } catch (error) {
    throw new Object ({
      Confirmation: "FAIL",
      type: 'Download',
      method: 'isFolderExists',
      message: 'Create folder error',
    })
  }
};

// Check folder exists
export const isFolderExists = async (folderName, userGUID, streamFolderName) => {
  try {
    const res = await RNFS.exists(`${rootPath}/${folderName}/${userGUID}/${streamFolderName}`);

    if (res) {
      return ({ Confirmation: "SUCCESS" });  
    }
  } catch (error) {
    return ({
      Confirmation: "FAIL",
      type: 'Download',
      method: 'isFolderExists',
      message: 'Cannot create folder',
    })
  }
};

// Check User folder exists
export const isUserFolderExists = async (folderName, userGUID) => {
  try {
    const res = await RNFS.exists(`${rootPath}/${folderName}/${userGUID}`);
    return res;
  } catch (error) {
    throw new Error('Check folder exists error');
  }
};

// Download Xi folder
export const downloadZip = (folderName, userGUID, streamFolderName, experienceGUID) => {
  const folderPath = `${RNFetchBlob.fs.dirs.DocumentDir}/${folderName}/${userGUID}/${streamFolderName}`;
  const options = {
    path: `${RNFetchBlob.fs.dirs.DocumentDir}/${folderName}/${userGUID}/${streamFolderName}/${experienceGUID}.zip`,
  };
  const folderLink = `${config.zipFileBaseLink}${experienceGUID}.zip`;

  return new Promise((resolve, reject) => {
    RNFetchBlob
      .config(options)
      .fetch('GET', `${folderLink}`, {
        'Cache-Control': 'no-store',
      })
      .then((response) => {
        // console.log('download success: ');
        // console.log('response.path: ', response.path());

        unzip(options.path, folderPath)
          .then((path) => {
            // console.log(`unzip completed at ${path}`);
            RNFS.unlink(options.path)
              .then(() => {
                resolve();
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Read file
export const readFile = async (folderName) => {
  try {
    const content = await RNFS.readFile(`${folderName}`);
    return content;
  } catch (err) {
    throw new Error('Reader file content error');
  }
};

// Delete file
export const deleteFile = (folderPath, userGUID, filename) => {
  const deletePathFile = `${rootPath}/${folderPath}/${userGUID}/${filename}`;
  try {
    return RNFS.unlink(deletePathFile);
  } catch (error) {
    throw new Error('Delete file error');
  }
};

// Delete file
export const deleteUserFile = (folderPath, userGUID) => {
  const deletePathFile = `${rootPath}/${folderPath}/${userGUID}`;
  try {
    return RNFS.unlink(deletePathFile);
  } catch (error) {
    throw new Error('Delete file error');
  }
};
