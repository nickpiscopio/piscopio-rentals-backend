const express = require('express');

const router = express.Router();

const { PDFDocument, StandardFonts } = require('pdf-lib')
const fontkit = require('@pdf-lib/fontkit')

const fs = require('fs')
const util = require('util')

const data = {
  "DATE_FROM": "1/5/22",
  "DATE_TO": "2/5/22",
  "STR_NAME": "John Ally",
  "STR_MAILING_ADDRESS": "123 Address Lane Drive",
  "SIGNATURE": "John Ally",
  "STATE_2": "NA"
}

router.post('/set', function(req, res, next) {
  createPdf("assets/pocono.pdf", "assets/output.pdf")

  res.send({
    "success": true
  });
});

async function createPdf(input, output) {
  const readFile = util.promisify(fs.readFile)
  function getStuff() {
    return readFile(input)
  }
  const file = await getStuff()
  const pdfDoc = await PDFDocument.load(file)
  pdfDoc.registerFontkit(fontkit)

  const form = pdfDoc.getForm()
  // TODO: Find a different font for here. Find a few that look like they are hand written.
  const fontBytes = fs.readFileSync('assets/fonts/AlexBrush-Regular.ttf');

  const font = await pdfDoc.embedFont(fontBytes)
  
  Object.keys(data).forEach((element) => {
    const field = form.getTextField(element)
    field.setText(data[element])
    if (element == "SIGNATURE" && font !== undefined) {
      field.defaultUpdateAppearances(font)
    }
  });
  const pdfBytes = await pdfDoc.save()
  fs.writeFile(output, pdfBytes, () => {
    console.log('PDF created!')
  });
}

module.exports = router;
