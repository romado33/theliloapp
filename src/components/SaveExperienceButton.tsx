import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useSavedExperiences } from '@/hooks/useSavedExperiences';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ARIA_LABELS } from '@/lib/accessibility';

interface SaveExperienceButtonProps {
  experienceId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

const SaveExperienceButton: React.FC<SaveExperienceButtonProps> = ({
  experienceId,
  variant = 'outline',
  size = 'sm',
  className,
  showLabel = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isExperienceSaved, toggleSaveExperience } = useSavedExperiences();

  const isSaved = isExperienceSaved(experienceId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth', { state: { returnTo: window.location.pathname } });
      return;
    }

    await toggleSaveExperience(experienceId);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      aria-label={isSaved ? ARIA_LABELS.removeSaved : ARIA_LABELS.saveExperience}
      aria-pressed={isSaved}
      className={cn(
        'transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isSaved && 'text-red-500 border-red-500 hover:bg-red-50',
        className
      )}
    >
      <Heart 
        className={cn(
          'w-4 h-4',
          showLabel && 'mr-2',
          isSaved && 'fill-current'
        )}
        aria-hidden="true"
      />
      {showLabel && (isSaved ? 'Saved' : 'Save')}
    </Button>
  );
};

export default SaveExperienceButton;