import multer from "multer";

//for saving file into server temporary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp') //save the file into server 
  },
  
  filename: function (req, file, cb) {
    cb(null, file.originalname)//and give original file name
  }
})

export const upload = multer({ storage: storage })
