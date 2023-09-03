export default function Orb({ posX, posY }: { posX: number; posY: number }) {
  return (
    <div
      className={`main-orb w-60 h-60 absolute rounded-full top-0 left-0 `}
      style={{
        transform: `translateX(${posX}px) translateY(${posY}px)`,
      }}
    ></div>
  );
}
