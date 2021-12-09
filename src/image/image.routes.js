const express = require('express');
const router = express.Router();
const services = require('./image.services')
const error = require('../Helper/Error')
const upload = require('./image.services')


router.post('/upload-image',services.uploadImage,services.uploadService)

router.get('/get-image/:id',services.getImageByUuid)

router.delete('/delete-image/:id',services.deleteImageById)

router.put('/update-image/:id',services.uploadImage,services.updateImageByIdSerivce)



module.exports = router; 
