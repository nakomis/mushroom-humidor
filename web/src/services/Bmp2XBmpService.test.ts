import convertToXBmp from './Bmp2XBmpService';
import * as bmp from 'bmp-ts';
const fs = require('fs');
const path = require('path');

describe('convertToXBmp', () => {
    let originalFileReader: typeof global.FileReader;
    let mockReadAsArrayBuffer: any;
    let mockFileReaderResult: ArrayBuffer;
    let mockBmpDecode: jest.SpyInstance;

    beforeAll(() => {
        // Mock bmp.decode
        mockBmpDecode = jest.spyOn(bmp, 'decode');
    });

    afterAll(() => {
        // @ts-ignore
        mockBmpDecode.mockRestore();
    });

    beforeEach(() => {
        // Mock FileReader
        originalFileReader = global.FileReader;
        mockFileReaderResult = new ArrayBuffer(8);

        mockReadAsArrayBuffer = jest.fn();

        class MockFileReader {
            public result: ArrayBuffer | null = mockFileReaderResult;
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;
            readAsArrayBuffer = mockReadAsArrayBuffer.mockImplementation(() => {
                // Simulate async behavior
                setTimeout(() => {
                    if (this.onload) {
                        this.onload();
                    }
                }, 0);
            });
        }
        // @ts-ignore
        global.FileReader = MockFileReader;
    });

    afterEach(() => {
        global.FileReader = originalFileReader;
    });

    it('should correctly convert a 3x5 BMP file to XBM format string', async () => {
        const fakeFile = new File([new Uint8Array([0, 1, 2, 3])], 'three_by_five.bmp');
        const width = 3;
        const height = 5;
        // 3x5 = 15 pixels, RGBA = 4 bytes per pixel
        // We'll alternate black (0) and white (255) pixels for the green channel
        const bmpData = {
            width,
            height,
            data: new Uint8Array([
                // x=0
                255, 0, 0, 255, // y=0 (red=255)
                0, 0, 0, 255,   // y=1 (red=0)
                255, 0, 0, 255, // y=2 (red=255)
                0, 0, 0, 255,   // y=3 (red=0)
                255, 0, 0, 255, // y=4 (red=255)
                // x=1
                0, 0, 0, 255,   // y=0 (red=0)
                255, 0, 0, 255, // y=1 (red=255)
                0, 0, 0, 255,   // y=2 (red=0)
                255, 0, 0, 255, // y=3 (red=255)
                0, 0, 0, 255,   // y=4 (red=0)
                // x=2
                255, 0, 0, 255, // y=0 (red=255)
                0, 0, 0, 255,   // y=1 (red=0)
                255, 0, 0, 255, // y=2 (red=255)
                0, 0, 0, 255,   // y=3 (red=0)
                255, 0, 0, 255, // y=4 (red=255)
            ]),
        };
        mockBmpDecode.mockReturnValue(bmpData);

        const result = await convertToXBmp(fakeFile);

        expect(result).toContain('const uint8_t three_by_five_bmp[] PROGMEM');
        expect(result).toMatch(/0x[0-9A-F]{2}/);
        expect(mockReadAsArrayBuffer).toHaveBeenCalled();
        expect(mockBmpDecode).toHaveBeenCalled();
    });

    it('should convert a BMP file to XBM format string', async () => {
        // Arrange
        const fakeFile = new File([new Uint8Array([0, 1, 2, 3])], 'test_bmp');
        const width = 2;
        const height = 2;
        // RGBA for 2x2 image (4 pixels)
        const bmpData = {
            width,
            height,
            data: new Uint8Array([
                0, 0, 0, 255, // pixel 0
                0, 255, 0, 255, // pixel 1
                0, 0, 0, 255, // pixel 2
                0, 255, 0, 255, // pixel 3
            ]),
        };
        mockBmpDecode.mockReturnValue(bmpData);

        // Act
        const result = await convertToXBmp(fakeFile);

        // Assert
        expect(result).toContain('const uint8_t test_bmp[] PROGMEM');
        expect(result).toContain('0x');
        expect(mockReadAsArrayBuffer).toHaveBeenCalled();
        expect(mockBmpDecode).toHaveBeenCalled();
    });

    it('should handle empty BMP data gracefully', async () => {
        const fakeFile = new File([new Uint8Array([])], 'empty_bmp');
        mockBmpDecode.mockReturnValue({
            width: 0,
            height: 0,
            data: new Uint8Array([]),
        });

        const result = await convertToXBmp(fakeFile);

        expect(result).toContain('const uint8_t empty_bmp[] PROGMEM');
    });

    it('should use the correct template for output', async () => {
        const fakeFile = new File([new Uint8Array([0, 1, 2, 3])], 'foo.bmp');
        mockBmpDecode.mockReturnValue({
            width: 1,
            height: 1,
            data: new Uint8Array([0, 0, 0, 255]),
        });

        const result = await convertToXBmp(fakeFile);

        expect(result.startsWith('const uint8_t foo_bmp[] PROGMEM')).toBe(true);
        expect(result).toMatch(/0x[0-9A-F]{2}/);
    });

    it('should make a mushroom of a mushroom', async () => {
        // Restore the original FileReader
        global.FileReader = originalFileReader;
        const bmpPath = path.resolve(__dirname, '../__tests__/mushroom-ico16x16.bmp');
        if (!fs.existsSync(bmpPath)) {
            // Skip test if file doesn't exist
            return;
        }
        const bmpBuffer = fs.readFileSync(bmpPath);
        const fakeFile = new File([bmpBuffer], 'mushroom-ico16x16.bmp');

        // Use the real bmp.decode for this test
        mockBmpDecode.mockRestore();

        const result = await convertToXBmp(fakeFile);

        expect(result).toContain(
            `const uint8_t mushroom_ico16x16_bmp[] PROGMEM =
    {
        0xF0, 0x0F,
        0x7C, 0x3F,
        0x3E, 0x73,
        0xFE, 0x71,
        0xFF, 0xFB,
        0xB9, 0xFF,
        0x1D, 0xCF,
        0xBF, 0xDF,
        0xFF, 0xFF,
        0x20, 0x04,
        0x20, 0x04,
        0x20, 0x04,
        0x20, 0x04,
        0x20, 0x04,
        0x60, 0x06,
        0xC0, 0x03
    };
`
        );
        expect(result).toMatch(/0x[0-9A-F]{2}/);
    });

    it('should make a bigger mushroom', async () => {
        // Restore the original FileReader
        global.FileReader = originalFileReader;
        const bmpPath = path.resolve(__dirname, '../__tests__/mushroom-ico32x32.bmp');
        if (!fs.existsSync(bmpPath)) {
            // Skip test if file doesn't exist
            return;
        }
        const bmpBuffer = fs.readFileSync(bmpPath);
        const fakeFile = new File([bmpBuffer], 'mushroom-ico32x32.bmp');

        // Use the real bmp.decode for this test
        mockBmpDecode.mockRestore();

        const result = await convertToXBmp(fakeFile);

        expect(result).toContain(
`const uint8_t mushroom_ico32x32_bmp[] PROGMEM =
    {
        0x00, 0x00, 0x00, 0x00,
        0x00, 0xFE, 0x7F, 0x00,
        0x80, 0xFF, 0xFF, 0x01,
        0xE0, 0x0F, 0xFF, 0x07,
        0xF0, 0x0F, 0x7E, 0x0F,
        0xF8, 0x0F, 0x10, 0x1C,
        0xF8, 0x0F, 0xE0, 0x18,
        0xFC, 0xEF, 0xF1, 0x39,
        0xFC, 0xF7, 0xF3, 0x3D,
        0xC6, 0xF1, 0xF3, 0x7D,
        0x06, 0xF0, 0xE3, 0x7D,
        0xC6, 0xF3, 0x03, 0x7C,
        0xE6, 0xFF, 0x03, 0x7C,
        0xF6, 0xEF, 0x7E, 0x78,
        0xF6, 0x1F, 0xFF, 0x70,
        0xF6, 0x1F, 0xFF, 0x61,
        0xFE, 0x1F, 0xFF, 0x71,
        0xFC, 0xFF, 0xFF, 0x3F,
        0xF0, 0xFF, 0xFF, 0x0F,
        0x00, 0x30, 0x0C, 0x00,
        0x00, 0x18, 0x18, 0x00,
        0x00, 0x18, 0x18, 0x00,
        0x00, 0x1C, 0x38, 0x00,
        0x00, 0x0C, 0x30, 0x00,
        0x00, 0x0C, 0x30, 0x00,
        0x00, 0x0C, 0x30, 0x00,
        0x00, 0x0C, 0x30, 0x00,
        0x00, 0x1C, 0x38, 0x00,
        0x00, 0x18, 0x18, 0x00,
        0x00, 0xF8, 0x1F, 0x00,
        0x00, 0xF0, 0x0F, 0x00,
        0x00, 0x00, 0x00, 0x00
    };
`
        );
        expect(result).toMatch(/0x[0-9A-F]{2}/);
    });
});
