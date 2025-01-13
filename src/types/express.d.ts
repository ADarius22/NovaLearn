declare namespace Express {
    export interface Request {
      file?: Express.Multer.File; // Correctly specify the type for a single file
      files?: Express.Multer.File[]; // Correctly specify the type for multiple files
    }
  }
  