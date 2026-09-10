### 5.1 Image / video slots
Recommended px = 2× the rendered CSS box at 1440, rounded; tolerance ±5 % on aspect; formats JPG/PNG/WEBP unless noted; "Where" is the render site; "Missing" is today's behaviour, kept unless noted.

| Slot (resource.field) | Renders in | CSS box @1440 | **Aspect** | **Recommended px** | Min px | Max MB | Count | Missing |
|---|---|---|---|---|---|---|---|---|
| `settings.logo` | `SiteHeader` 130→100 wide | ~100×36 | **≥ 2:1 (landscape), target 3:1** | **600×200 PNG transparent** | 300×100 | 1 | 1 | site name as text |
| `home.heroVideo` | `VideoHero` | 1100×570 | **1100:570 ≈ 1.93** (accept 16:9…2:1) | **2200×1140 MP4 H.264**, ≤ 60 s | 1100×570 | 50 | 1 | poster |
| `home.heroPoster` | `VideoHero` poster | 1100×570 | same as video | 2200×1140 | 1100×570 | 10 | 1 | black frame |
| services `gridImage` (tile 1 slides) | `HeroGrid` tile | 363×400 | **10:11 (0.91)** | **726×800** | 363×400 | 10 | 1/service | tile hidden |
| `home.branchesTileImage` | `HeroGrid` tile 3 | 363×400 | 10:11 | 726×800 | 363×400 | 10 | 1 | tile hidden |
| `home.galleryTileImage` | `HeroGrid` tile 2 | 363×400 | 10:11 | 726×800 | 363×400 | 10 | 1 | tile hidden |
| `home.trustImage0-2` | `TrustStrip` icon | 40×40 | 1:1 | 160×160 PNG/SVG, mono | 80×80 | 1 | 3 | built-in icon |
| `home.whyUsImage` | `WhyUs` | **521×521** | **1:1** | **1042×1042** | 521×521 | 10 | 1 | placeholder box |
| `reviews.image` | `ReviewCarousel` card | **479×347** | **11:8 (1.38)** | **958×694** (Google review screenshot) | 479×347 | 10 | ≥ 2 shown, 8 typical | section hidden |
| `partners.logo` | `PartnerStrip` box | **128×85** | **3:2** | **384×256 PNG transparent** | 128×85 | 1 | ≥ 6 for a marquee | section hidden |
| `blog-posts.coverImage` | `PostCard`, `LatestPosts` | 298×186 / 351×220 | 16:10 | 1120×700 | 560×350 | 10 | 1 | placeholder |
| `products.images` | `ProductCard`, gallery | 353×265 | 4:3 | 1200×900 | 600×450 | 5 | ≤ 10 | placeholder |
| `packages.image` | offer card | **331×414** | **4:5** | 800×1000 | 400×500 | 10 | 1 | placeholder |
| `offers-page.banner` | `OffersPage` | **1100×450** | **22:9 (2.44)** | **2200×900** | 1100×450 | 10 | 1 | banner hidden |
| `gallery` type=image | `PhotoGallery` | square | 1:1 | 1200×1200 | 600×600 | 10 | — | section hidden |
| `gallery` type=video | `ReelCarousel` | 300×533 | **9:16** | 1080×1920 MP4 | 540×960 | 50 | — | section hidden |
| services `heroImage` | `ServiceDetail` | 720×720 | 1:1 | 1440×1440 | 720×720 | 10 | 1 | — |
| services `wideImage` | `ServiceDetail` | 640×400 | 16:10 | 1280×800 | 640×400 | 10 | 1 | — |
| services `collage` | `ServiceDetail` | 480×480 | 1:1 | 960×960 | 480×480 | 10 | 3 | — |
| `settings.aboutImage` | `AboutPage` (new, E2) | **470×470** | 1:1 | 940×940 | 470×470 | 10 | 1 | section without image |
| `promo.image` | `PromoModal` | ~1600×1080 | **3:2** | 1600×1067 | 800×533 | 10 | 1 | modal not rendered |
| `blog-intro.image` | blog banner | 320×400 | 4:5 | 800×1000 | — | 10 | 1 | — |

Current admin `aspect` values that **contradict** this table and must change (Task A1): `gridImage 3/4→10/11`, `branchesTileImage 3/4→10/11`, `galleryTileImage 3/4→10/11`, `whyUsImage 4/3→1/1`, `heroVideo/heroPoster 21/9→1100/570`, `banner 21/9→22/9`, `reviews.image 4/3→11/8`, `logo 3/1` (keep target, enforce **min** 2/1), `aboutImage 4/3→1/1`.

