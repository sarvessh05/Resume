// Simple text extraction from PDF and DOCX files
// Note: For production, consider using a backend service for better parsing

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return await extractTextFromDOCX(file);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  // For browser-based PDF parsing, we'll use a simple approach
  // In production, consider using pdf-parse on the backend
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(arrayBuffer);
  
  // Basic PDF text extraction (this is simplified)
  // Extract text between stream objects
  const textMatches = text.match(/\(([^)]+)\)/g);
  if (textMatches) {
    return textMatches
      .map(match => match.slice(1, -1))
      .join(' ')
      .replace(/\\n/g, '\n')
      .replace(/\\/g, '');
  }
  
  return text;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  // For DOCX, we'll use a simple text extraction
  // In production, use mammoth.js or similar library on the backend
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(arrayBuffer);
  
  // Extract readable text (simplified approach)
  const cleanText = text
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanText;
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
