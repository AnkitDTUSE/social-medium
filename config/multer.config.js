const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

//disk-storage 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/upload");
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(12, (err, name) => {
      const fn = name.toString("hex") + path.extname(file.originalname);
      cb(null, fn); 
    });
  },
});


//create and export upload variable

let upload = multer({storage})

module.exports = upload