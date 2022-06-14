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
    "durationDateFrom": "1/10/22",
    "durationDateTo": "2/5/22",
    "namePrinted": "John A. Ally",
    "addressStreet": "123 Address Lane Drive",
    "addressCity": "Bensalem",
    "addressState": "PA",
    "addressZipcode": "19020",
    "phoneNumber": "2155555555",
    "phoneNumber2": "2675555555",
    "vehicle1PlateState": "PA",
    "vehicle1PlateNumber": "123",
    "vehicle2PlateState": "NJ",
    "vehicle2PlateNumber": "456",
    "vehicle3PlateState": "NC",
    "vehicle3PlateNumber": "789",
    "vehicle4PlateState": "CA",
    "vehicle4PlateNumber": "357",
    "vehicle5PlateState": "TT",
    "vehicle5PlateNumber": "1234",
    "vehicle6PlateState": "RF",
    "vehicle6PlateNumber": "8920",
    "vehicle7PlateState": "PE",
    "vehicle7PlateNumber": "123456",
    "vehicle8PlateState": "NA",
    "vehicle8PlateNumber": "g46356"
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