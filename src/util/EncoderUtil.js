module.exports = class EncoderUtil {
    static decodeList(encodedList) {
        const decodedList = [];
        
        encodedList.forEach(encodedString => {
            decodedList.push(this.decode(encodedString))
        });

        return decodedList;
    }

    static decode(encodedString) {
        return Buffer.from(encodedString, 'base64');
    }
}