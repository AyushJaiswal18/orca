import multer from "multer";
import path from "path";

// Configure multer to store files on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/temp"); // Specify the directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file
  },
});

export const upload = multer({ storage: storage });
