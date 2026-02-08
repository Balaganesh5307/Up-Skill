const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * File Parser Service
 * Extracts text content from PDF and DOCX files
 */

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
const extractFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text.trim();
    } catch (error) {
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
};

/**
 * Extract text from a DOCX file
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text content
 */
const extractFromDOCX = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value.trim();
    } catch (error) {
        throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
};

/**
 * Extract text from an uploaded resume file
 * Supports PDF and DOCX formats
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - Extracted text content
 */
const extractText = async (filePath, mimeType) => {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
    }

    // Determine file type and extract accordingly
    if (mimeType === 'application/pdf') {
        return await extractFromPDF(filePath);
    } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
    ) {
        return await extractFromDOCX(filePath);
    } else {
        throw new Error('Unsupported file format. Please upload PDF or DOCX.');
    }
};

/**
 * Delete a file from the filesystem
 * Used to clean up uploaded files after processing
 * @param {string} filePath - Path to the file to delete
 */
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(`Failed to delete file: ${error.message}`);
    }
};

module.exports = {
    extractText,
    deleteFile
};
