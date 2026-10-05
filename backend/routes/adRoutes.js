const express = require("express");
const { 
    getAds, 
    createAd, 
    updateAd, 
    deleteAd, 
    uploadAdPhoto, 
    adUploadMiddleware 
} = require("../controllers/adController");

const router = express.Router();

router.get("/", getAds);
router.post("/upload", adUploadMiddleware, uploadAdPhoto);
router.post("/", createAd);
router.put("/:id", updateAd);
router.delete("/:id", deleteAd);

module.exports = router;


