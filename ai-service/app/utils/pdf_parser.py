import fitz  # PyMuPDF
import re

class PDFParsingError(Exception):
    """Custom exception for PDF parsing errors."""
    pass

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts plain text from a PDF byte stream.
    Validates that the file is not corrupted, empty, or password protected.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise PDFParsingError(f"Failed to parse PDF file. The file might be corrupted: {str(e)}")

    if doc.is_encrypted:
        raise PDFParsingError("PDF file is password protected.")

    if len(doc) == 0:
        raise PDFParsingError("PDF file contains no pages.")

    full_text = []
    for page_num in range(len(doc)):
        try:
            page = doc.load_page(page_num)
            page_text = page.get_text()
            if page_text:
                full_text.append(page_text)
        except Exception as e:
            # Continue extracting other pages if one page fails, but log it
            print(f"Warning: Failed to extract text from page {page_num}: {str(e)}")

    merged_text = "\n".join(full_text)
    
    # Check if we got any actual text
    if not merged_text.strip():
        raise PDFParsingError("No readable text found in PDF. It might be scanned or image-only.")

    return merged_text

def clean_extracted_text(text: str) -> str:
    """
    Cleans up whitespace, duplicate blank lines, and formatting noise.
    """
    if not text:
        return ""

    # Replace carriage returns
    text = text.replace('\r', '\n')

    # Remove non-printable control characters, but keep standard whitespace
    text = "".join(ch for ch in text if ch.isprintable() or ch in '\n\t')

    # Normalize horizontal spacing (tabs/spaces) to a single space
    text = re.sub(r'[ \t]+', ' ', text)

    # Split lines, strip spaces from ends of each line
    lines = [line.strip() for line in text.split('\n')]

    # Remove empty lines
    cleaned_lines = [line for line in lines if line]

    # Rejoin with single newline
    return "\n".join(cleaned_lines)
