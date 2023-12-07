import uploadFeature from '@adminjs/upload';
import { componentLoader } from '../components.bundler.js';

export const useUploadFeature = (name?: string, multiple = false) => {
  return uploadFeature({
    componentLoader,
    provider: {
      local: {
        bucket: 'public/files',
        opts: {
          baseUrl: '/files',
        },
      },
    },
    multiple,
    validation: {
      mimeTypes: [
        'image/png', // .png
        'image/jpeg', // .jpeg
        'application/pdf', // .pdf
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.rar', // .rar
        'application/zip', // .zip
      ],
    },
    properties: {
      file: name ? `${name}.file` : 'file',
      filePath: name ? `${name}.filePath` : 'filePath',
      filesToDelete: name ? `${name}.filesToDelete` : 'filesToDelete',
      key: name ? `${name}.key` : 'key',
      mimeType: name ? `${name}.mime` : 'mime',
      bucket: name ? `${name}.bucket` : 'bucket',
      size: name ? `${name}.size` : 'size',
    },
    uploadPath: (record, filename) =>
      name ? `${record.id()}/${name}/${filename}` : `${record.id()}/files/${filename}`,
  });
};
