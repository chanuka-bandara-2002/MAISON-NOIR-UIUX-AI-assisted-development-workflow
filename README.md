MAISON NOIR — Design System & Implementation Architecture
1. Brand & Design Tokens
Color Palette
Noir Black (#0a0a0a / #000000): Core branding, headings, primary buttons, checkout summary container, footer background.
Pure White (#ffffff): Clean background, primary card surfaces, contrasting elements.
Atelier Grey Light (#f5f5f5 / #f8f8f8): Editorial split background, newsletter section background, cart order summary card, complimentary shipping alert banner.
Input Grey (#ececec / #e8e8e8): Checkout form fields, promo code field, newsletter input fill.
Border Neutral (#e5e5e5 / #222222): Subtle luxury dividing lines, image borders, card outlines.
Muted Text (#737373 / #666666): Subtitles, edition tags (e.g., EDITION 04 / TAILORING), garment details, breadcrumbs.
Typography Hierarchy
Primary Editorial / Logo Face: 'Plus Jakarta Sans', sans-serif with geometric precision and refined high-fashion kerning (letter-spacing: 0.15em to 0.25em).
Headings:
Hero Display: clamp(2.5rem, 6vw, 4.5rem), uppercase, font-light to font-medium, letter-spacing wide.
Section Titles (NEW ARRIVALS, LESS, BUT BETTER., THE COLLECTION, SECURE CHECKOUT): clamp(1.75rem, 3.5vw, 2.75rem), uppercase, tracking-tight to tracking-wide.
Category / Edition Tags: 0.75rem (text-xs), font-semibold, uppercase, tracking-[0.2em], muted grey.
Product Titles: 0.875rem to 1.125rem, uppercase, font-medium, tracking-[0.1em].
Prices: 0.875rem to 1rem, font-normal to font-medium, formatted with LKR currency.
Spacing & Grid System
Scale: 8px base scale (8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px).
Container: max-w-7xl (1440px), responsive padding px-4 sm:px-8 lg:px-12.
Grids:
Mobile: 2 columns
Tablet: 3 columns
Desktop: 3 or 4 columns (matching designs)
Image Aspect Ratios: Strict 3:4 portrait ratio for garments and 1:1 square for accessories and thumbnails, preventing Cumulative Layout Shift (CLS).
2. Shared Component Architecture
Top Announcement Bar:
Rotates or marquee displays complimentary shipping messages, Colombo atelier notice, and bespoke tailoring highlights.
Sticky Header:
Minimalist brand logo MAISON NOIR.
Desktop Navigation: NEW ARRIVALS, WOMEN, MEN, COLLECTIONS, SEARCH, CART, ACCOUNT.
Dynamic Cart count badge (synced via localStorage).
Mobile Hamburger Menu with slide-over off-canvas drawer and body scroll locking.
Search Overlay Modal:
Full-screen or slide-down search dialog with live autocomplete, trending queries, and instant product card matches.
Slide-in Mini-Cart Drawer:
Opens on clicking CART or when adding items from any page.
Shows live items, quantities, total, and direct "Proceed to Checkout" button.
Product Cards:
3:4 aspect ratio with image hover swap (shows alternate angle).
Wishlist heart button with toggle persistence in localStorage.
Edition/tag, product name, subtitle, price in LKR.
Toast Notification System:
Unobtrusive luxury toast ("Added to archival bag", "Item saved to wishlist", "Promo code applied").
Global Footer:
Identical across all 5 pages. Brand manifesto, social icons, 4 navigation columns (SHOP, CLIENT SERVICES, ABOUT, LEGAL), and Colombo copyright.
3. Page Implementations
index.html (Home):

Announcement bar + Header
Hero: "THE ART OF LESS." with European colonnade imagery, subtitle, "EXPLORE COLLECTION" CTA.
Brand value proposition ribbon.
"NEW ARRIVALS" 6-card grid with hover image swaps.
Editorial split section: "LESS, BUT BETTER." with haute couture studio imagery and brand manifesto.
"CURATED CAPSULE" grid.
"THE MAISON NOIR LIST" newsletter signup with validation.
"COMPLETE YOUR LOOK" black banner + 4 accessories cards.
Footer.
collection.html (The Collection):

Page header: "THE COLLECTION" + subtitle.
Sticky filter & sort bar:
Dropdowns: Category (All, Women, Men, Tailoring, Accessories), Size (XS, S, M, L, XL), Color (Black, Beige, Camel, Grey, Sage, Olive), Price range.
Sort: Newest, Price: Low to High, Price: High to Low.
Live counter & active filters tags.
Dynamic product grid (18+ items) with client-side reactive rendering, load more button, and empty state.
Bottom editorial banner: "ARTISANAL PRECISION / MATERIAL ETHOS".
Footer.
product.html (Single Product):

URL parameter parsing (?id=noir-blazer, defaulting to The Noir Blazer).
2-Column layout:
Left: Main zoomable gallery photo + 2-image secondary grid beneath.
Right: Title, price, description, interactive color swatches (swaps gallery images), size buttons with active state, quantity stepper.
Solid black "ADD TO CART" + Outline "ADD TO WISHLIST".
Complimentary shipping banner over LKR 50,000.
4 Accessible accordions: Description, Details & Care, Delivery & Returns, Size & Fit.
"COMPLETE THE LOOK" 3-card curated grid.
Mobile sticky Add-to-Cart bar.
Footer.
cart.html (Shopping Cart):

Header with active CART indicator.
"ARCHIVAL SELECTION / YOUR SHOPPING CART" with piece count badge.
Left column: Cart items with edition tags, names, prices, quantity stepper - 1 +, remove button.
Right column: Order Summary card with Subtotal, Complimentary shipping status, 15% Sri Lanka Inland VAT/Duties included, total, promo code input + apply button, "PROCEED TO CHECKOUT" button.
Empty cart state with CTA to explore collection.
"COMPLETE YOUR LOOK" accessories recommendations.
Footer.
checkout.html (Secure Checkout):

"SECURE CHECKOUT" header.
5 Distinct Black Bar Sections:
CONTACT INFORMATION (Email, Phone)
DELIVERY INFORMATION (First/Last name, Address, City/Province/Apartment, Postal code, Phone, Save checkbox)
DELIVERY METHOD (Standard 3-5 days LKR 2,000 vs Express 1-2 days LKR 4,000 with interactive selection)
PAYMENT (Tabs: Visa, Mastercard, Amex, formatted Card Number, Expiry, CVV, Save payment)
ORDER SUMMARY (Solid black container with item list, shipping, dynamic total calculation)
"PROCEED TO CHECKOUT" / "CONFIRM & PAY" solid black CTA button.
Full client-side validation with inline error highlights.
Order confirmation modal / success state upon completion, clearing cart and presenting simulated tracking details.
Footer.
