import { sanitizeDisplayText } from '@/lib/sanitize';

interface SecureDisplayTextProps {
  text: string;
  className?: string;
  maxLength?: number;
  allowLineBreaks?: boolean;
}

// Component for safely displaying user-generated content
export const SecureDisplayText = ({ 
  text, 
  className = '', 
  maxLength,
  allowLineBreaks = false 
}: SecureDisplayTextProps) => {
  if (!text) return null;

  // Sanitize the input
  let sanitizedText = sanitizeDisplayText(text);
  
  // Truncate if needed
  if (maxLength && sanitizedText.length > maxLength) {
    sanitizedText = sanitizedText.substring(0, maxLength) + '...';
  }

  // Handle line breaks securely
  if (allowLineBreaks) {
    const lines = sanitizedText.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < sanitizedText.split('\n').length - 1 && <br />}
      </span>
    ));
    
    return <div className={className}>{lines}</div>;
  }

  return <span className={className}>{sanitizedText}</span>;
};