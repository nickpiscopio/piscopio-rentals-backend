const express = require('express');

const router = express.Router();

const pdfUtil = require("../util/PdfUtil.js");
const emailUtil = require("../util/EmailUtil.js");

const pdfKey = require("../constants/Key.js");
const path = require("../constants/Path.js");

router.post('/set', function(req, res, next) {
  const body = req.body
  const augmentedData = pdfUtil.augmentData(body);
  const finalizedPdfName = "153_keats_lane_completed.pdf";
  const pdfToAugmentPath = path.ASSETS + "/153_keats_lane_raw.pdf";
  const finalizedPdfPath = path.ASSETS + "/" + finalizedPdfName;
  const fromDate = body[pdfKey.DURATION_DATE_FROM]
  const toDate = body[pdfKey.DURATION_DATE_TO]

  const pdfAugmented = pdfUtil.augmentPDF(pdfToAugmentPath, finalizedPdfPath, augmentedData);
  pdfAugmented.then(() => {
    const pdfEmailed = emailUtil.sendEmailWithAttachment(finalizedPdfName, finalizedPdfPath, fromDate, toDate);
    pdfEmailed.then( (response) => {
      res.statusCode = 204;
      res.send();
    }, (error) => {
      res.statusCode = 501;
      res.send(error);
    });
  }, (error) => {
    res.statusCode = 500;
    res.send(error);
  });
});

module.exports = router;
