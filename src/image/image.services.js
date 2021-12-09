
const fs = require('fs')
const path = require('path')
const helper = require('../Helper/dbHelper');
const error = require('../Helper/Error')
const multer = require('multer')
const imageModel = require('./image.model')
const sharp = require('sharp');
const config = require('../../config')

const { v4: uuidv4 ,validate} = require('uuid');
const maxImageSize = 1000000
const imageExt = ['.png', '.jpg','.jpeg']
const targetPathUpload = "./uploads/"
const sizes = {
    filename_cover:{height: 829, width: 312},
    filename_thumb:{height: 285, width: 380}
}
const upload = multer({
    dest: targetPathUpload,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});


const uploadImage = upload.single('file')

const uploadService = async (req, res) => {

    try {
        
        // extract the properties of the file 
        // so i can validate the file
        const tempPath = req.file.path;
        const imageNamethumb = uuidv4()
        const imageNameCover = uuidv4()

        const extImage = path.extname(req.file.originalname).toLowerCase()
        const targetPaththumb = getImagePath(imageNamethumb,extImage);
        const targetPathCover = getImagePath(imageNameCover,extImage);
        const imgs = [{ height: 285, width: 380, path: targetPaththumb },
        { height: 829, width: 312, path: targetPathCover }]
        const imageSize = req.file.size


        // validate the image request
        // validate the size and shold be less than 1MB
        // validate the ext should be png and jpg
        if (imageSize > maxImageSize) {
            deleteFile(res, tempPath, "image size is larage than 1Mb , please provide less than 1Mb")
            error.handleError("image size is larage than 1Mb , please provide less than 1Mb",res)
        } else if (imageExt.indexOf(extImage) == -1) {
            deleteFile(res, tempPath, "image extention are not allowd only jpg and png are allowd")
            error.handleError("image extention are not allowd only jpg and png are allowd",res)
        } else {




            // creating thumbs for the images
            // storing it to database
            Promise
                .all(imgs.map((img) => resize(img, tempPath)))
                .then(() => {
                    
                    const isStored = imageModel.saveIntoStore(imageNamethumb, imageNameCover,extImage)
                    if (!isStored) {
                        deleteFile(res, targetPath, "problem at storing to database")
                    }
                    deleteFile(res, tempPath)
                    return res.status(200).json({images:{thumb:`/get-image/${imageNamethumb}` ,cover:`/get-image/${imageNameCover}`}});
             
                }).catch(err => {
                    deleteFile(res, tempPath)
                    error.handleError(err.message, res)
                });









        }

    } catch (err) {
        return error.handleError(err.message, res)
    }




}


// get image by id
const getImageByUuid = async (req,res) => {
    try {

  

         // extract id from parameters
         const id =  req.params.id
         checkValidUuid(id,res)
         
         // check if exist file in store
         const recored = await imageModel.imageIsExistDb(id)
         const ext = recored?.result?.ext

         const pathImage = getImagePath(id,ext)
 
         // safty check for not available 
         if(!recored.status){
            return error.handleError("not image availabe for such id",res)
         }
         
         if(!fs.existsSync(pathImage)){
            error.handleError("not image availabe at storage",res)

         }
         return res.status(200).sendFile(pathImage)
    } catch (err) {
            error.handleError(err.message,res)
    }
   


}


const deleteImageById = async(req,res) =>{
    try {
        const id = req.params.id

        // chekc the validaty of the id
        checkValidUuid(id,res)

        // check the existing of the images
        const retrivedImages = await imageModel.imageIsExistDb(id)
        if( !retrivedImages.status){
            return error.handleError("no such image available",res)
         }
         
        const {filename_thumb,filename_cover,ext} = retrivedImages.result


         // delete image from store 
         const isDeleted = await imageModel.deleteImageFromDb(id)
        if(isDeleted){
              // delete file image from storage 
        [filename_cover,filename_thumb].forEach(imgUid => {
            let pathImage = getImagePath(imgUid,ext)
            deleteFile(res,pathImage)
        });
        }

        return res.status(201).json(true)

      
       

       



       
       

    } catch (err) {
        console.log(err)
        error.handleError(err.message,res)
    }
}


const updateImageByIdSerivce  =async (req,res) => {
    try {
        const tempPath = req.file.path;
        const id = req.params.id
        const imageSize = req.file.size
        const extImage = path.extname(req.file.originalname).toLowerCase()

        // chekc the validaty of the id
        checkValidUuid(id,res)
          // check the existing of the images
          const retrivedImages = await imageModel.imageIsExistDb(id)
          if( !retrivedImages.status){
              return error.handleError("no such image available",res)
           }
           const {filename_cover,filename_thumb,ext} = retrivedImages.result

           if (imageSize > maxImageSize) {
            deleteFile(res, tempPath, "image size is larage than 1Mb , please provide less than 1Mb")
            error.handleError("image size is larage than 1Mb , please provide less than 1Mb",res)
        } else if (imageExt.indexOf(extImage) == -1) {
            deleteFile(res, tempPath, "image extention are not allowd only jpg and png are allowd")
            error.handleError("image extention are not allowd only jpg and png are allowd",res)
        } else {
            
    
            const imageSize = sizes[getImageType(id,filename_thumb)]
            const imagePath = getImagePath(id,extImage)
            const oldImagePath = getImagePath(id,ext)


            // if its diffrent extention update at database
            
            if(ext != extImage){
                return error.handleError(`please only type ${ext} is allowed at update `,res)
            }

            // delete old image from storage
            deleteFile(res, oldImagePath)

            // creating thumbs for the images
            resize({...imageSize,path:imagePath}, tempPath)
                .then(() => {
                    
                    deleteFile(res, tempPath)
                    return res.status(200).json({images:{thumb:`/get-image/${filename_thumb}` ,cover:`/get-image/${filename_cover}`}});
             
                }).catch(err => {
                    deleteFile(res, tempPath)
                    error.handleError(err.message, res)
                });

        }

    } catch (err) {
        console.log(err)
        error.handleError(err.message,res)
    }
}
// helper to delete the temp 
// handle the validation error
const deleteFile = (res, tempPath, errorMessge) => {
    fs.unlink(tempPath, err => {
        if (err) return error.handleError(errorMessge, res);

    });
}




// resizing image by sharp
const resize = (img, tempPath) => sharp(tempPath)
    .resize(img.height, img.width)
    .toFile(img.path);

const  checkValidUuid = (uid,res) =>{
    if(!validate(uid)){
        error.handleError("not valid image id",res)
     }
}

const getImagePath = (imgId,extImage) =>  path.join(`${config.root}/uploads/${imgId}${extImage}`);


const getImageType = (id,filename_thumb)=>{
    let type = 'filename_cover'
    if(id == filename_thumb){
        type = 'filename_thumb'
    }

    return type

}

module.exports = {
    uploadImage,
    uploadService,
    getImageByUuid,
    deleteImageById,
    updateImageByIdSerivce
}