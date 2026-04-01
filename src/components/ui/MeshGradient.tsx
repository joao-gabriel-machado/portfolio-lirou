const MeshGradient = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
    {/* Blob 1 - Primary cyan, top-left */}
    <div
      className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full opacity-[0.07] animate-mesh-float blur-[120px]"
      style={{ background: 'hsl(178 70% 41%)' }}
    />
    {/* Blob 2 - Teal accent, bottom-right, offset animation */}
    <div
      className="absolute -bottom-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full opacity-[0.05] animate-mesh-float blur-[100px]"
      style={{
        background: 'hsl(175 65% 45%)',
        animationDelay: '-7s',
        animationDuration: '25s',
      }}
    />
    {/* Blob 3 - Subtle warm accent, center drift */}
    <div
      className="absolute top-1/3 left-1/2 w-[40vw] h-[40vw] rounded-full opacity-[0.03] animate-mesh-float blur-[80px]"
      style={{
        background: 'hsl(200 50% 50%)',
        animationDelay: '-13s',
        animationDuration: '30s',
      }}
    />
  </div>
);

export default MeshGradient;
