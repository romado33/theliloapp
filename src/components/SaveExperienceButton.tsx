import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useSavedExperiences } from '@/hooks/useSavedExperiences';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
      className={cn(
        'transition-colors',
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
      />
      {showLabel && (isSaved ? 'Saved' : 'Save')}
    </Button>
  );
};

export default SaveExperienceButton;