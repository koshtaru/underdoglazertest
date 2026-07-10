const SUBTITLE = 'Precision laser engraving for businesses and individuals';
const PRICING_NOTE = 'Every piece is custom — contact us for pricing and options.';

/**
 * Products page hero — title, subtitle, and glass pricing note (no CTA button).
 */
export default function ProductsHero() {
  return (
    <section className="gallery-hero gallery-hero--products" aria-labelledby="gallery-hero-title">
      <div className="container">
        <div className="gallery-hero__content gallery-hero__content--products">
          <h1 className="hero__title" id="gallery-hero-title">
            Products
          </h1>
          <p className="hero__subtitle">{SUBTITLE}</p>
          <p className="gallery-hero__chip">{PRICING_NOTE}</p>
        </div>
      </div>
    </section>
  );
}
