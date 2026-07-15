export default function Icon({ name, style, className }: {
  name: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return <ion-icon name={name} style={style} className={className} suppressHydrationWarning />;
}
