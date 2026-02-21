import * as pdfjsLib from 'pdfjs-dist';
import { useState } from 'react';

// Automatically match worker version with library version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractPdfText(file) {
  try {
    console.log('Starting PDF extraction for:', file.name);
    console.log('PDF.js version:', pdfjsLib.version);
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded: ${pdf.numPages} pages`);
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `Page ${pageNum}:\n${pageText}\n\n`;
      console.log(`Extracted page ${pageNum}`);
    }
    
    console.log(`Total text extracted: ${fullText.length} characters`);
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

export function uploadPdf(onSuccess, onError) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf,.pdf';
  
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      onError(new Error('Please select a valid PDF file'));
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError(new Error('PDF file is too large. Maximum size is 10MB'));
      return;
    }
    
    try {
      const text = await extractPdfText(file);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }
      
      onSuccess(text, file.name);
      console.log('PDF upload successful');
    } catch (error) {
      console.error('Upload error:', error);
      onError(error);
    }
  };
  
  input.click();
}

export function usePdfUpload() {
  const [pdfText, setPdfText] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = () => {
    console.log('Upload button clicked');
    setIsLoading(true);
    setError(null);
    
    uploadPdf(
      (text, name) => {
        console.log('Upload success callback:', name, text.substring(0, 100));
        setPdfText(text);
        setPdfName(name);
        setIsLoading(false);
        alert(`✅ PDF "${name}" uploaded successfully! ${Math.round(text.length / 1000)}KB of text extracted.`);
      },
      (err) => {
        console.error('Upload error callback:', err);
        setError(err.message);
        setIsLoading(false);
        alert(`❌ Error: ${err.message}`);
      }
    );
  };

  const clearPdf = () => {
    console.log('Clearing PDF');
    setPdfText('');
    setPdfName('');
    setError(null);
  };

  return {
    pdfText,
    pdfName,
    isLoading,
    error,
    handleUpload,
    clearPdf
  };
}