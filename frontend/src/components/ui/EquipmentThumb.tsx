import { equipmentImage } from '../../lib/equipmentImages';
import SafeImage from './SafeImage';

interface Props {
  equipment: { name?: string; category?: string; images?: string | null };
  className?: string;
  rounded?: 'xl' | '2xl' | 'lg';
}

export default function EquipmentThumb({ equipment, className = 'h-14 w-14', rounded = 'xl' }: Props) {
  const r = rounded === '2xl' ? 'rounded-2xl' : rounded === 'lg' ? 'rounded-lg' : 'rounded-xl';
  return (
    <SafeImage
      src={equipmentImage(equipment)}
      alt={equipment.name || 'Équipement'}
      className={`object-cover bg-surface-muted shrink-0 ${r} ${className}`}
    />
  );
}

export function EquipmentHero({ equipment, className = 'h-48 w-full' }: Props) {
  return (
    <div className={`overflow-hidden rounded-2xl ${className}`}>
      <SafeImage
        src={equipmentImage(equipment)}
        alt={equipment.name || 'Équipement'}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
