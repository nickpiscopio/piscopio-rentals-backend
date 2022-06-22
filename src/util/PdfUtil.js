const fs = require("fs");
const util = require("util");

const { PDFDocument } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const font = require("../constants/Font.js");
const pdfKey = require("../constants/Key.js");
const path = require("../constants/Path.js");
const property = require("../constants/Property.js");
const encoderUtil = require("../util/EncoderUtil.js");
const numberUtil = require("../util/NumberUtil.js");

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

    augmentedData[pdfKey.PROPERTY_OWNER] = encoderUtil.decode(property.PROPERTY_OWNER);
    augmentedData[pdfKey.AUTHORIZATION_INITIALS] = encoderUtil.decode(property.AUTHORIZATION_INITIALS);
    augmentedData[pdfKey.AUTHORIZATION_SIGNATURE] = encoderUtil.decode(property.AUTHORIZATION_SIGNATURE);
    augmentedData[pdfKey.AUTHORIZATION_DATE] = this.getCurrentDate();
    augmentedData[pdfKey.LOT_NUMBER] = encoderUtil.decode(property.LOT_NUMBER);
    augmentedData[pdfKey.STREET_NUMBER] = encoderUtil.decode(property.STREET_NUMBER);
    augmentedData[pdfKey.STREET] = encoderUtil.decode(property.STREET);
    augmentedData[pdfKey.PACKET_RETRIEVER] = encoderUtil.decode(property.PACKET_RETRIEVER_HOUSE_CONTACT);
    augmentedData[pdfKey.HOUSE_CONACT] = encoderUtil.decode(property.PACKET_RETRIEVER_HOUSE_CONTACT);
    augmentedData[pdfKey.NAME_SIGNATURE] = augmentedData[pdfKey.NAME_PRINTED];
  
    return augmentedData;
  }
  
  // TODO: Need to write tests.
  static async augmentPDF(pdfToAugmentPath, finalizedPdfPath, data) {
    const readFile = util.promisify(fs.readFile);
    const file = await readFile(pdfToAugmentPath);
    const pdfDoc = await PDFDocument.load(file);
  
    const form = pdfDoc.getForm();
  
    // Set the custom fonts.
    const fontPath = path.FONTS + "/";
    const ownerFontBytes = fs.readFileSync(fontPath + font.OWNER);
    const tenantFontBytes = fs.readFileSync(fontPath + this.getRandomFont());
  
    pdfDoc.registerFontkit(fontkit);
  
    const ownerFont = await pdfDoc.embedFont(ownerFontBytes);
    const tenantFont = await pdfDoc.embedFont(tenantFontBytes);
    
    // Populate the PDF inputs.
    Object.keys(data).forEach((element) => {
      const field = form.getTextField(element);
      field.setText(data[element]);
  
      if (element == pdfKey.AUTHORIZATION_INITIALS || element == pdfKey.AUTHORIZATION_SIGNATURE && ownerFont !== undefined) {
        field.defaultUpdateAppearances(ownerFont);
      }

      if (element == pdfKey.NAME_SIGNATURE && tenantFont !== undefined) {
        field.defaultUpdateAppearances(tenantFont);
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
    const fontNames = font.TENANT_LIST;
    const fontIndex = numberUtil.getRandomNumber(fontNames.length);
    return fontNames[fontIndex];
  }

  static getCurrentDate() {
    return new Date().toLocaleDateString('en-US');
  }
}