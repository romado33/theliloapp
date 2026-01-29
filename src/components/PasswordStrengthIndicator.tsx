import { useMemo } from 'react';
import { checkPasswordStrength } from '@/lib/passwordStrength';

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  showSuggestions = true 
}: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => checkPasswordStrength(password), [password]);

  if (!password) return null;

  const progressValue = (strength.score / 4) * 100;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${
          strength.score < 2 ? 'text-destructive' : 
          strength.score < 3 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {strength.label}
        </span>
      </div>
      
      {showSuggestions && strength.suggestions.length > 0 && strength.score < 3 && (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {strength.suggestions.map((suggestion, i) => (
            <li key={i} className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
