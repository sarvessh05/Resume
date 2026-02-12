/**
 * Resume Parser Module
 * Extracts text content from PDF and DOCX files using PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Extracts text from uploaded resume files
 * Supports PDF and DOCX formats
 * 
 * @param file - The uploaded file
 * @returns Promise<string> - Extracted text content
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(file);
    } else {
      throw new Error('Unsupported file type. Please upload PDF or DOCX files.');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

/**
 * Extracts text from PDF files using PDF.js
 * Processes all pages and combines text content
 * 
 * @param file - PDF file
 * @returns Promise<string> - Extracted text
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    // Clean up extracted text
    fullText = fullText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    if (fullText.length < 50) {
      throw new Error('Insufficient text extracted from PDF. The file may be scanned or image-based.');
    }
    
    // Limit to reasonable size for AI processing
    if (fullText.length > 20000) {
      fullText = fullText.substring(0, 20000) + '\n\n[Content truncated for processing...]';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Unable to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts text from DOCX files
 * Note: This is a simplified extraction method
 * For production, consider using a dedicated DOCX parser library
 * 
 * @param file - DOCX file
 * @returns Promise<string> - Extracted text
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);
    
    // Extract readable text from DOCX (simplified)
    const cleanText = text
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanText.length < 100) {
      throw new Error('Insufficient text extracted from DOCX');
    }
    
    return cleanText;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Unable to extract text from DOCX file.');
  }
}

/**
 * Fallback: Read file as plain text
 * Used when other extraction methods fail
 * 
 * @param file - Any text file
 * @returns Promise<string> - File content as text
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
