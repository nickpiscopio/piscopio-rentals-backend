const express = require('express');

const router = express.Router();

const { PDFDocument, StandardFonts } = require('pdf-lib')
const fontkit = require('@pdf-lib/fontkit')

const fs = require('fs')
const util = require('util')

const PATH_ASSETS = "assets"
const PATH_FONTS = PATH_ASSETS + "/fonts"

const PDF_KEY_NAME_PRINTED = "name_printed";
const PDF_KEY_NAME_SIGNATURE = "name_signature";

router.post('/set', function(req, res, next) {
  const augmentedData = augmentData(req.body);
  const pdfToAugmentPath = PATH_ASSETS + "/153_keats_lane_raw.pdf"
  const finalizedPdfPath = PATH_ASSETS + "/153_keats_lane_completed.pdf"

  const pdfAugmented = augmentPDF(pdfToAugmentPath, finalizedPdfPath, augmentedData);
  pdfAugmented.then(() => {
    res.statusCode = 204
    res.send()
  }, (error) => {
    res.statusCode = 500
    res.send(error)
  });
});

/* Test Data
  {
    "duration_date_from": "1/5/22",
    "duration_date_to": "2/5/22",
    "name_printed": "John Ally",
    "address_street": "123 Address Lane Drive",
    "address_city": "Bensalem",
    "address_state": "PA",
    "address_zipcode": "19020",
    "phone_number": "2155555555",
    "phone_number_2": "2675555555",
    "vehicle_1_plate_state": "PA",
    "vehicle_1_plate_number": "123",
    "vehicle_2_plate_state": "NJ",
    "vehicle_2_plate_number": "456",
    "vehicle_3_plate_state": "NC",
    "vehicle_3_plate_number": "789",
    "vehicle_4_plate_state": "CA",
    "vehicle_4_plate_number": "357",
    "vehicle_5_plate_state": "TT",
    "vehicle_5_plate_number": "1234",
    "vehicle_6_plate_state": "RF",
    "vehicle_6_plate_number": "8920",
    "vehicle_7_plate_state": "PE",
    "vehicle_7_plate_number": "123456",
    "vehicle_8_plate_state": "NA",
    "vehicle_8_plate_number": "g46356"
  }
*/
function augmentData(dataToAugment) {
  var augmentedData = dataToAugment
  augmentedData[PDF_KEY_NAME_SIGNATURE] = augmentedData[PDF_KEY_NAME_PRINTED]

  return augmentedData
}

async function augmentPDF(pdfToAugmentPath, finalizedPdfPath, data) {
  const readFile = util.promisify(fs.readFile)
  const file = await readFile(pdfToAugmentPath)
  const pdfDoc = await PDFDocument.load(file)

  // Set the custom fonts.
  const form = pdfDoc.getForm()

  const fontBytes = fs.readFileSync(PATH_FONTS + "/" + getRandomFont());

  pdfDoc.registerFontkit(fontkit)

  const font = await pdfDoc.embedFont(fontBytes)
  
  // Populate the PDF inputs.
  Object.keys(data).forEach((element) => {
    const field = form.getTextField(element)
    field.setText(data[element])

    if (element == PDF_KEY_NAME_SIGNATURE && font !== undefined) {
      field.defaultUpdateAppearances(font)
    }
  });

  // Save the PDF to a byte array.
  const pdfBytes = await pdfDoc.save()

  // Write to the PDF.
  return new Promise((resolve, reject) => {
    fs.writeFile(finalizedPdfPath, pdfBytes, (error) => {
      if (error) {
        reject()
      }

      resolve()
    });
  });
}

function getRandomFont() {
  const fontNames = [
    "AlexBrush-Regular.ttf",
    "HaloHandletter.otf",
    "Marrisa.ttf",
    "Kristi.ttf",
    "DawningofaNewDay.ttf"
  ]

  const fontIndex = getRandomNumber(fontNames.length)
  return fontNames[fontIndex];
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max)
}

module.exports = router;
