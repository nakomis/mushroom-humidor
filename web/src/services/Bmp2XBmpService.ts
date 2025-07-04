import * as bmp from 'bmp-ts';

function template(strings: any, ...keys: number[]) {
    return (...values: any[]) => {
        const dict = values[values.length - 1] || {};
        const result = [strings[0]];
        keys.forEach((key, i) => {
            const value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join("");
    };
}

const templateClosure = template
    `const uint8_t ${0}[] PROGMEM =
    {
${1}
    };
`;

const convertToXBmp = (source: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            try {
                const bmpData = bmp.decode(Buffer.from(reader.result as ArrayBuffer));
                const outArray: Uint8Array = new Uint8Array(Math.ceil((bmpData.width * bmpData.height) / 8));
                var currentByte: number = 0;
                var leftShiftCount: number = 0;
                for (let y = 0; y < bmpData.height; y++) {
                    for (let x = 0; x < bmpData.width; x++) {
                        leftShiftCount++;
                        let pixelIndex: number = (y * bmpData.width) + x;
                        let dataIndex: number = pixelIndex * 4;
                        let pixelRedValue = bmpData.data[dataIndex + 1];
                        if (pixelRedValue === 0) {
                            currentByte += (1 << (leftShiftCount - 1));
                        }
                        if (pixelIndex % 8 === 7) {
                            const arrayPosition = Math.floor(pixelIndex / 8);
                            outArray[arrayPosition] = currentByte;
                            currentByte = 0;
                            leftShiftCount = 0;
                        } else if (dataIndex == bmpData.data.length - 4) {
                            // If we are at the last pixel, we need to set the last byte
                            // Need to work out how many bits are left in the last byte
                            // leftShiftCount should be 8 when we are at the last pixel
                            let pixelRedValue = bmpData.data[dataIndex + 1];
                            if (pixelRedValue === 0) {
                                currentByte += 1;
                            }
                            if (leftShiftCount != 0) {
                                currentByte = currentByte << (8 - leftShiftCount);
                            }
                            outArray[Math.floor(pixelIndex / 8)] = currentByte;
                        }
                    }
                }


                // const flippedArray: Uint8Array = new Uint8Array(outArray.length);
                // // for (let i: number = 0; i < outArray.length / 2; i++) {
                // //     let n: number = outArray[i * 2];
                // //     let m: number = outArray[i * 2 + 1];
                // //     flippedArray[i * 2 + 1] = n;
                // //     flippedArray[i * 2] = m;
                // // }
                // for (let y: number = 0; y < bmpData.height; y += 1) {
                //     for (let x: number = 0; x < bmpData.width / 8; x += 1) {
                //         flippedArray[(y * (bmpData.width / 8)) + x] = outArray[((bmpData.height - y - 1) * (bmpData.width / 8)) + x];
                //     }
                // }

                var outString: string = '        ';
                for (let i: number = 0; i < outArray.length; i++) {
                    outString += '0x' + outArray[i].toString(16).padStart(2, '0').toUpperCase();
                    if ((i != 0) && (i % (bmpData.width / 8) === ((bmpData.width / 8) - 1))) {
                        outString += ",\n        ";
                    } else {
                        outString += ", ";
                    }
                }
                outString = outString.trimEnd().slice(0, -1); // Remove the last comma and space   

                return resolve(templateClosure(source.name.replaceAll(/[.-]/g, '_'), outString));
            } catch (error) {
                reject(error);
            }
        };

        reader.readAsArrayBuffer(source);
    });
}

export default convertToXBmp;