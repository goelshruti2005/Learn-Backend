import multer from "multer"

//console.log("multer : ",multer);
//console.log("multer disk storage : ",multer.diskStorage);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
 export const upload = multer({ storage })
  //console.log("Upload: ",upload);
  
 
  