
const db = require('../Helper/DB');



// helper to store the image to data base 

const saveIntoStore = async (thumbUid, coverUid,ext) => {
    try {
        const result = await db.query(`insert into images (filename_cover,filename_thumb,ext) values (?,?,?)`, [coverUid, thumbUid,ext])

        let status = false;

        if (result.affectedRows) {
            status = true
        }

        return status;
    } catch (error) {
        return false;
    }

}



// check id image exist in db
// get the image from the store
const imageIsExistDb = async (imgUuid) => {
    try {
        const result = await db.query(`select * from images where filename_cover =? or filename_thumb=?`, [imgUuid, imgUuid])
        let status = false;
        console.log("result",result)
        if (result &&result.length>=1) {
            status = true
        }

        return {status,result:result[0]};
    } catch (error) {
        return {status:false,result:[],error};
    }
}

const deleteImageFromDb = async (imgUid) => {
    try {
        const result = await db.query(`delete from images where filename_thumb=? or filename_cover=?`, [imgUid, imgUid])
        let status = false;
        if (result &&result.affectedRows>=1) {
            status = true
        }

        return status;
    } catch (error) {
        return false;
    }
}


const updateImageDb = async (imgUid,ext) => {
    try {
        const result = await db.query(`update images set ext =? where filename_thumb=? or filename_cover=?`, [ext,imgUid, imgUid])
        let status = false;
        if (result &&result.affectedRows>=1) {
            status = true
        }

        return status;
    } catch (error) {
        return false;
    }
}


module.exports = {
    saveIntoStore,
    updateImageDb,
    deleteImageFromDb,
    imageIsExistDb
}