import multer, { Options } from 'multer';
import path from 'path';

const tempFolder = path.resolve(__dirname, '..', '..', 'tmp');
const options: Options = {
  fileFilter(request, file, callback) {
    if (file.mimetype !== 'text/csv') {
      return callback(
        new Error('Invalid extension.Is allowed just .csv files'),
      );
    }
    return callback(null, true);
  },
  storage: multer.diskStorage({
    destination: tempFolder,
    filename(request, file, callback) {
      const fileName = `svgPayload${path.extname(file.originalname)}`;
      return callback(null, fileName);
    },
  }),
};

export default options;
