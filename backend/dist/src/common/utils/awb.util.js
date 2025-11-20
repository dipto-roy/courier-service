"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAWB = generateAWB;
exports.generateManifestNumber = generateManifestNumber;
function generateAWB() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `FX${dateStr}${randomDigits}`;
}
function generateManifestNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `MN${dateStr}${randomDigits}`;
}
//# sourceMappingURL=awb.util.js.map