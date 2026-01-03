import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to split text into multiple lines
const splitTextIntoLines = (pdf, text, maxWidth, x, y, fontSize = 10) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  pdf.setFontSize(fontSize);
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = pdf.getTextWidth(testLine);
    
    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Generate professional PDF for candidate results
export const generateCandidateResultPDF = async (candidateData, testResults) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Professional color scheme
  const primaryColor = [59, 130, 246]; // Blue
  const secondaryColor = [30, 64, 175]; // Dark Blue
  const successColor = [16, 185, 129]; // Green
  const warningColor = [245, 158, 11]; // Yellow
  const dangerColor = [239, 68, 68]; // Red
  const grayColor = [107, 114, 128];
  const lightGrayColor = [243, 244, 246];
  const borderColor = [229, 231, 235];

  // Helper function to get score color
  const getScoreColor = (score) => {
    if (score >= 80) return successColor;
    if (score >= 60) return warningColor;
    return dangerColor;
  };

  // Helper function to get score status
  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  // Add header with gradient effect
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // White text on blue background
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('InterviewPro', 20, 18);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Candidate Assessment Report', 20, 26);

  // Date in header
  pdf.setFontSize(10);
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(reportDate, pageWidth - 20, 26, { align: 'right' });

  // Add a subtle line under header
  pdf.setDrawColor(...borderColor);
  pdf.setLineWidth(0.5);
  pdf.line(0, 35, pageWidth, 35);

  // Candidate Information Section
  let yPosition = 50;
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Candidate Information', 20, yPosition);
  
  yPosition += 12;
  
  // Professional info box with border
  pdf.setFillColor(...lightGrayColor);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 45, 'FD');
  
  const infoLeftX = 25;
  const infoRightX = pageWidth / 2 + 5;
  const lineHeight = 8;
  let infoY = yPosition + 3;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Name:', infoLeftX, infoY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(candidateData.candidateName || 'N/A', infoLeftX + 20, infoY);
  
  infoY += lineHeight + 2;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Email:', infoLeftX, infoY);
  pdf.setFont('helvetica', 'normal');
  const emailLines = splitTextIntoLines(pdf, candidateData.candidateEmail || 'N/A', pageWidth - infoLeftX - 25, infoLeftX + 20, infoY);
  emailLines.forEach((line, idx) => {
    pdf.text(line, infoLeftX + 20, infoY + (idx * 4));
  });
  infoY += (emailLines.length - 1) * 4;
  
  infoY += lineHeight;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Position:', infoLeftX, infoY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(candidateData.positionName || 'N/A', infoLeftX + 25, infoY);
  
  infoY += lineHeight + 2;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Test Date:', infoLeftX, infoY);
  pdf.setFont('helvetica', 'normal');
  const testDate = new Date(candidateData.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(testDate, infoLeftX + 28, infoY);

  yPosition += 55;

  // Test Results Summary Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Test Results', 20, yPosition);
  
  yPosition += 12;

  // Score card with professional styling
  const score = Math.round(candidateData.score);
  const scoreColor = getScoreColor(score);
  
  // Main score box
  pdf.setFillColor(...scoreColor);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Overall Score: ${score}%`, 25, yPosition + 8);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Status: ${getScoreStatus(score)}`, 25, yPosition + 16);
  
  // Right side info
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(`Time Taken: ${candidateData.timeTakenFormatted || 'N/A'}`, pageWidth - 25, yPosition + 8, { align: 'right' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Questions: ${testResults.length}`, pageWidth - 25, yPosition + 16, { align: 'right' });

  yPosition += 40;

  // Detailed Question Analysis Section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Question Analysis', 20, yPosition);
  
  yPosition += 10;

  // Professional table headers
  pdf.setFillColor(...secondaryColor);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  const colQ = 22;
  const colQuestion = 30;
  const colYourAnswer = 100;
  const colCorrectAnswer = 150;
  
  pdf.text('Q#', colQ, yPosition + 2);
  pdf.text('Question', colQuestion, yPosition + 2);
  pdf.text('Your Answer', colYourAnswer, yPosition + 2);
  pdf.text('Correct Answer', colCorrectAnswer, yPosition + 2);

  yPosition += 12;

  // Question rows with better formatting
  testResults.forEach((result, index) => {
    const isCorrect = result.isCorrect;
    const rowColor = isCorrect ? successColor : dangerColor;
    
    // Calculate text wrapping for all columns first
    pdf.setFontSize(8);
    const questionText = result.question || 'N/A';
    const questionLines = splitTextIntoLines(pdf, questionText, colYourAnswer - colQuestion - 3, colQuestion, yPosition + 3, 8);
    
    const selectedAnswer = result.selectedOptionText || 'Not answered';
    const selectedLines = splitTextIntoLines(pdf, selectedAnswer, colCorrectAnswer - colYourAnswer - 3, colYourAnswer, yPosition + 3, 8);
    
    const correctAnswer = result.correctOptionText || 'N/A';
    const correctLines = splitTextIntoLines(pdf, correctAnswer, pageWidth - colCorrectAnswer - 20, colCorrectAnswer, yPosition + 3, 8);
    
    // Calculate max height needed for this row
    const maxLines = Math.max(questionLines.length, selectedLines.length, correctLines.length, 1);
    const rowHeight = Math.max(10, maxLines * 4 + 2);
    
    // Check if we need a new page before drawing
    if (yPosition + rowHeight > pageHeight - 25) {
      pdf.addPage();
      yPosition = 20;
      
      // Redraw header on new page
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('InterviewPro', 20, 18);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Candidate Assessment Report', 20, 26);
      pdf.setDrawColor(...borderColor);
      pdf.line(0, 35, pageWidth, 35);
      
      yPosition = 50;
      
      // Redraw table header
      pdf.setFillColor(...secondaryColor);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Q#', colQ, yPosition + 2);
      pdf.text('Question', colQuestion, yPosition + 2);
      pdf.text('Your Answer', colYourAnswer, yPosition + 2);
      pdf.text('Correct Answer', colCorrectAnswer, yPosition + 2);
      yPosition += 12;
    }
    
    // Alternate row background for better readability
    if (index % 2 === 0) {
      pdf.setFillColor(...lightGrayColor);
      pdf.rect(20, yPosition - 3, pageWidth - 40, rowHeight, 'F');
    }
    
    // Border for each row
    pdf.setDrawColor(...borderColor);
    pdf.setLineWidth(0.2);
    pdf.line(20, yPosition - 3, pageWidth - 20, yPosition - 3);
    pdf.line(20, yPosition - 3 + rowHeight, pageWidth - 20, yPosition - 3 + rowHeight);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // Question number (centered vertically)
    pdf.setFont('helvetica', 'bold');
    const qNumY = yPosition + (rowHeight / 2) - 2;
    pdf.text((index + 1).toString(), colQ, qNumY);
    
    // Question text (with wrapping)
    pdf.setFont('helvetica', 'normal');
    questionLines.forEach((line, idx) => {
      pdf.text(line, colQuestion, yPosition + 3 + (idx * 4));
    });
    
    // Selected answer
    selectedLines.forEach((line, idx) => {
      pdf.text(line, colYourAnswer, yPosition + 3 + (idx * 4));
    });
    
    // Correct answer
    correctLines.forEach((line, idx) => {
      pdf.text(line, colCorrectAnswer, yPosition + 3 + (idx * 4));
    });
    
    yPosition += rowHeight + 2;
  });

  // Professional footer on each page
  const addFooter = (pageNum, totalPages) => {
    const footerY = pageHeight - 15;
    pdf.setDrawColor(...borderColor);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    pdf.setTextColor(...grayColor);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Generated by InterviewPro Assessment System', 20, footerY);
    pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 20, footerY, { align: 'right' });
    pdf.text('Confidential Document - Do Not Share', pageWidth / 2, footerY, { align: 'center' });
  };

  // Add footer to all pages
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(i, totalPages);
  }

  return pdf;
};

// Generate PDF from HTML element (alternative method)
export const generatePDFFromHTML = async (elementId, filename = 'candidate-result.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf;
};
