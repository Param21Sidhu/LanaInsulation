// Reusable cover image, replacing the original `<image-slot>` custom element.
export default function Media({ src, alt, rounded = false }) {
  return (
    <img
      className={rounded ? 'media media--rounded' : 'media'}
      src={src}
      alt={alt}
      loading="lazy"
    />
  );
}
