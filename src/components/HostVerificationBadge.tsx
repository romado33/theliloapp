import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BadgeCheck, Shield, Star, Award } from 'lucide-react';

export type VerificationLevel = 'verified' | 'superhost' | 'trusted' | null;

interface HostVerificationBadgeProps {
  level: VerificationLevel;
  showLabel?: boolean;
}

const VERIFICATION_CONFIG = {
  verified: {
    icon: BadgeCheck,
    label: 'Verified Host',
    description: 'Identity and experience credentials verified',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  superhost: {
    icon: Star,
    label: 'Superhost',
    description: 'Top-rated host with exceptional reviews',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  trusted: {
    icon: Shield,
    label: 'Trusted Partner',
    description: 'Long-standing partner with proven track record',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
};

export const HostVerificationBadge = ({ level, showLabel = false }: HostVerificationBadgeProps) => {
  if (!level) return null;

  const config = VERIFICATION_CONFIG[level];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${config.className} cursor-help`}>
            <Icon className="w-3 h-3 mr-1" />
            {showLabel && config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{config.label}</p>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Summary component showing all verification badges a host has
interface HostVerificationSummaryProps {
  badges: VerificationLevel[];
}

export const HostVerificationSummary = ({ badges }: HostVerificationSummaryProps) => {
  const validBadges = badges.filter((b): b is NonNullable<VerificationLevel> => b !== null);
  
  if (validBadges.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {validBadges.map((level) => (
        <HostVerificationBadge key={level} level={level} showLabel />
      ))}
    </div>
  );
};
