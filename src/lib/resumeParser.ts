// Simple text extraction from PDF and DOCX files
// Note: For production, consider using a backend service for better parsing

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
    // Return a basic text representation
    return `Resume file: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}\n\nNote: Unable to extract full text. Please review manually.`;
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // Extract text between common PDF text markers
    const textContent: string[] = [];
    
    // Method 1: Extract text between parentheses (common in PDFs)
    const parenMatches = text.match(/\(([^)]+)\)/g);
    if (parenMatches) {
      parenMatches.forEach(match => {
        const cleaned = match
          .slice(1, -1)
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\/g, '');
        if (cleaned.trim().length > 2) {
          textContent.push(cleaned);
        }
      });
    }
    
    // Method 2: Extract readable ASCII text
    const readableText = text
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && /[a-zA-Z]/.test(word))
      .join(' ');
    
    const result = textContent.length > 50 
      ? textContent.join(' ') 
      : readableText;
    
    if (result.length < 100) {
      throw new Error('Insufficient text extracted from PDF');
    }
    
    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Unable to extract text from PDF. The file may be scanned or encrypted.');
  }
}

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

// Fallback: Read file as text
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
