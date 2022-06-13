module.exports = class NumberUtil {
    static getRandomNumber(max) {
        return Math.floor(Math.random() * max);
    }
}