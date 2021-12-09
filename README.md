# Upload image test Documentation

## image scehma at db
 {
    id,
    filename_cover,
    filename_thumbs,
    ext,
} 
created fixed schema for fast implementation i beleive it has many downsided but i create just prove of concept project 


## folder structure
|_ ./uploads ==> storage 

|_ ./src/Helper ==> functionalites for general use
|_ ./src/image ==> Image feature
    |_ image.model ==> implement the mysql queries asyncrounsly 
    |_ imgage.service ==> my bussiness logic for get, add, update and delete
    |_ image.routes ==> routes my api endpoint happen here

## image.service

### uploadImage 
```` multer upload file handler for upload and update````

### uploadService
``` upload handler for uploading image this will process the image and validate the size here and create the thumb and cover images```

### getImageByUuid
``` provide id in params and u get the image as file return file```

### deleteImageById()
```deleteing one image will delete both the cover and the thumb i found out this later on but its too late to revers is i have no time ```


### updateImageByIdSerivce

``` update image but due to not consdiering all corder case u caon only upload the same extention image```

## cases i didnt consider
1. checking if the image exist in file not in db
2. the database schema has downside of not detail the image
3. since its just prove of concept i didnt cover all the cases 



# [you can check the postman collection here]('./UploadImage.postman_collection')