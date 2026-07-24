// Static content for the marketing sections, extracted from the original
// single-file HTML so each component can stay focused on markup.
import serviceBlownIn from './assets/service-blown-in.png';
import serviceMoldRemoval from './assets/service-mold-removal.png';
import serviceDebrisRemoval from './assets/service-debris-removal.png';

export const services = [
  {
    id: 'svc-blown',
    image: serviceBlownIn,
    alt: 'Blown-in insulation being sprayed into an attic',
    title: 'Blown-in insulation',
    body:
      'Fast, even blown-in cellulose and fiberglass that fills every gap and corner — a strong thermal barrier that keeps heat in and bills down.',
  },
  {
    id: 'svc-mold',
    image: serviceMoldRemoval,
    alt: 'Attic rafters and insulation batts during mold remediation',
    title: 'Mold removal',
    body:
      'Safe inspection, removal, and prevention. We find the root cause, clear the mold, and protect your air quality before new insulation goes in.',
  },
  {
    id: 'svc-debris',
    image: serviceDebrisRemoval,
    alt: 'Cleared attic after debris removal',
    title: 'Debris removal',
    body:
      'Post-construction and old-insulation debris hauled away, leaving a clean, ready space behind — no shortcuts, no mess left over.',
  },
];

export const benefits = [
  {
    title: 'Lower energy bills',
    body: 'A tight attic means less heat escaping and real savings every month.',
  },
  {
    title: 'Student-affordable',
    body: 'Fair, honest pricing that beats the big guys.',
  },
  {
    title: 'Free quotes',
    body: 'Know your price up front — no cost, no pressure.',
  },
  {
    title: 'Local & reliable',
    body: "We show up, we're careful, and we do the job right.",
  },
];

export const steps = [
  {
    n: '1',
    title: 'Reach out',
    body: 'Call, text, or fill in the form. Tell us about your attic and what you need.',
  },
  {
    n: '2',
    title: 'Free quote',
    body: 'We assess your space and give you a clear, honest price — free of charge.',
  },
  {
    n: '3',
    title: 'We get to work',
    body: 'Our crew installs, cleans up, and leaves you with a warmer, cheaper-to-run home.',
  },
];

export const faqs = [
  {
    q: 'Do you really offer free quotes?',
    a: "Yes — every quote is completely free with no obligation to book. We'll assess your attic and give you an honest price, and it's up to you from there.",
  },
  {
    q: 'Why are your prices lower than the big companies?',
    a: "We're a student-run crew with low overhead. We pass those savings straight to you while still doing careful, thorough work.",
  },
  {
    q: 'How much can insulation really save me?',
    a: 'A properly insulated attic can cut a big chunk off your heating and cooling bills — many homes see up to around 20% off yearly heating costs, though it varies by home.',
  },
  {
    q: 'Do you handle mold and old insulation?',
    a: 'We do. We offer mold removal and can remove old or damaged insulation and post-construction debris before installing fresh insulation.',
  },
  {
    q: 'What areas do you serve?',
    a: "We're local and cover the surrounding area. Give us a call or send a message and we'll confirm we can reach you.",
  },
];

export const aboutHighlights = [
  'Expert service',
  'Dependability',
  'Speedy service',
  'Quality guarantee',
  'No obligations',
  'Free quotes',
];
