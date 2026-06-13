interface CMYKMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CMYKMark({ className = '', size = 'md' }: CMYKMarkProps) {
  const dotSize = size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  const overlap = size === 'sm' ? '-ml-1.5' : size === 'lg' ? '-ml-3' : '-ml-2';

  return (
    <div className={`flex items-center ${className}`} aria-hidden="true">
      <div className={`${dotSize} rounded-full bg-[#00AEEF] opacity-90`} />
      <div className={`${dotSize} rounded-full bg-[#EC008C] opacity-90 ${overlap}`} />
      <div className={`${dotSize} rounded-full bg-[#FFF200] opacity-90 ${overlap}`} />
      <div className={`${dotSize} rounded-full bg-[#231F20] opacity-70 ${overlap}`} />
    </div>
  );
}
