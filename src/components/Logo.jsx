import logoUrl from '../assets/lana-logo.png';

// Brand logo used in the header and footer.
// Source image: src/assets/lana-logo.png — replace that file to update the logo.
export default function Logo({ variant }) {
  return (
    <img
      className={variant === 'boxed' ? 'logo__img logo__img--boxed' : 'logo__img'}
      src={logoUrl}
      alt="Lana Insulation"
    />
  );
}
