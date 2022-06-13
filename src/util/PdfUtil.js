const fs = require("fs");
const util = require("util");

const { PDFDocument } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

const pdfKey = require("../constants/key.js");
const path = require("../constants/path.js");
const numberUtil = require("../util/NumberUtil.js")

module.exports = class PdfUtil {
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
static augmentData(dataToAugment) {
    var augmentedData = dataToAugment;
    augmentedData[pdfKey.NAME_SIGNATURE] = augmentedData[pdfKey.NAME_PRINTED];
  
    return augmentedData;
  }
  
  // TODO: Need to either add our real signature as an image or a auto generated one.
  // TODO: Need to add Dottie's info to the sheet as well.
  // TODO: Need to write tests.
  static async augmentPDF(pdfToAugmentPath, finalizedPdfPath, data) {
    const readFile = util.promisify(fs.readFile);
    const file = await readFile(pdfToAugmentPath);
    const pdfDoc = await PDFDocument.load(file);
  
    // Set the custom fonts.
    const form = pdfDoc.getForm();
  
    const fontBytes = fs.readFileSync(path.FONTS + "/" + this.getRandomFont());
  
    pdfDoc.registerFontkit(fontkit);
  
    const font = await pdfDoc.embedFont(fontBytes);
    
    // Populate the PDF inputs.
    Object.keys(data).forEach((element) => {
      const field = form.getTextField(element);
      field.setText(data[element]);
  
      if (element == pdfKey.NAME_SIGNATURE && font !== undefined) {
        field.defaultUpdateAppearances(font);
      }
    });
  
    // Save the PDF to a byte array.
    const pdfBytes = await pdfDoc.save();
  
    // Write to the PDF.
    return new Promise((resolve, reject) => {
      fs.writeFile(finalizedPdfPath, pdfBytes, (error) => {
        if (error) {
          reject();
        }
  
        resolve();
      });
    });
  }
  
  static getRandomFont() {
    const fontNames = [
      "AlexBrush-Regular.ttf",
      "HaloHandletter.otf",
      "Marrisa.ttf",
      "Kristi.ttf",
      "DawningofaNewDay.ttf"
    ]
  
    const fontIndex = numberUtil.getRandomNumber(fontNames.length);
    return fontNames[fontIndex];
  }
}