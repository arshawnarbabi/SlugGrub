# Food image prompt (Gemini Nano Banana 2.1)

Owner: Arshawn (design). One image per unique dish name on any UCSC dining hall menu, made once and reused.
Decided 2026-11-14: Gemini image generation, not ChatGPT, not stock photos (his call after the recommendation:
one key and one bill, scriptable over every dish, counts for the Gemini prize track; stock photos have unclear
licenses, inconsistent looks and miss UCSC-specific dishes). Generated images are placeholders: a student's real
photo from the photo log replaces a dish's image once one exists.

## Model and settings

- Model: `gemini-nano-banana-2.1` (newest Flash-tier image model, stable since 2026-10-06; not Pro, to keep cost down).
  Price (Google's pricing page, read 2026-11-14): $0.0336 per 1K image, no API free tier. Nano Banana 2 Lite
  (`gemini-3.1-flash-lite-image`) costs the same $0.0336 per 1K image on the API with no free tier either, so 2.1 wins on
  quality at equal cost; Lite is free only by hand in the AI Studio app (fine for the 3 test dishes, not for a script).
  Nano Banana 2 (`gemini-3.1-flash-image`) is $0.067. Set a budget alert first.
- Output: aspect ratio `4:3`, size `1K` (the smallest 2.1 offers; 512px is not supported). Then resize locally with
  sharp into the sizes `Photo.tsx` already uses (sm 160, md 360, full 720 wide), JPEG.
- JS SDK shape (from Google's image-generation docs, 2026-11): `ai.interactions.create({ model, input, response_format:
  { type: "image", mime_type: "image/png", aspect_ratio: "4:3", image_size: "1K" } })`, image in `output_image.data`
  (base64). Keys are snake_case and sizes need an uppercase K. Reference images go in `input` as
  `{ type: "image", mime_type, data }` parts next to the text.

## Why it is written this way (Google's prompting guidance)

- Open with a strong verb ("Create"), then describe the scene in sentences, not a keyword list.
- Google's photoreal template: shot type, subject, setting, light, camera angle and lens. Every slot is filled below.
- Say what you want, not what you don't ("the plate is the only object on the surface", not "no props").
- Consistency across hundreds of images: approve one image as the style reference and pass it with every request,
  with an explicit instruction about what stays the same and what changes (2.1 takes up to 10 object references).

## The prompt

Fill `{dish_name}`, `{dish_description}` and `{vessel}`. Send it with the approved style reference image after the first one.

```
Create a photorealistic food photograph of {dish_name}: {dish_description}.

It is one generous single serving as it is actually served at a university dining hall, scooped from the
serving line onto {vessel}. The food looks fresh, hot and appetizing but honest: realistic portion size,
natural texture, sauces spooned on rather than arranged, slight irregularity in how it sits. Show only the
ingredients that belong in this dish; add garnish only when the dish normally comes with it.

Setting: the {vessel_short} sits alone, centered, on a smooth matte tabletop in a very light cool gray with
a faint blue tint, an even seamless surface with nothing else on it. The vessel fills about 65 percent of
the frame's width, with an even margin of tabletop on every side, so the dish stays whole when the image is
cropped to a square or to a wide banner.

Light: soft, diffused daylight from a large window at the upper left, gentle and even, with a soft natural
shadow falling to the lower right and a subtle highlight on moist or glossy surfaces. Neutral white balance,
true-to-life colors, gentle contrast, clean and bright overall.

Camera: a high three-quarter angle, about 60 degrees above the table, looking down at the dish so both the
shape of the {vessel_short} and the height of the food read clearly. 50mm lens at f/5.6, the whole dish in
sharp focus, the tabletop softening slightly toward the edges of the frame.

Style: modern, minimal, editorial food photography for a clean mobile app; quiet, consistent and calm, so
it sits naturally next to hundreds of other dishes shot the same way. The image is the photograph alone,
edge to edge.
```

With the style reference attached, prepend this paragraph:

```
The attached image is the style reference for a series. Match its tabletop color, lighting direction and
softness, shadow, camera angle, lens look, framing, white balance and color grading exactly. Only the food
and its serving vessel change.
```

## Filling the variables

- `{dish_description}`: one plain sentence on what the dish looks like (main pieces, sauce, color, how it is cut).
  Write it with one cheap text call to `gemini-3.8-flash` from the dish name plus the ingredient list on the UCSC
  nutrition label, e.g. "Chicken Tikka Masala" becomes "bite-size pieces of chicken in a creamy orange-red tomato
  curry sauce, served over white basmati rice". The label's ingredients keep it from guessing.
- `{vessel}` / `{vessel_short}` by dish type:

| Dish type | `{vessel}` | `{vessel_short}` |
|---|---|---|
| Entrees, sides, pasta, pizza, sandwiches, burgers, tacos | a plain matte white round ceramic plate | plate |
| Soups, stews, chili, curry without rice, oatmeal, cereal, poke and rice bowls, salads | a plain matte white round ceramic bowl | bowl |
| Desserts, pastries, cookies, single fruit | a small plain matte white round ceramic plate | small plate |
| Drinks, smoothies | a clear plain drinking glass | glass |

## Workflow

1. Generate 3 test dishes (one plate, one bowl, one dessert). Arshawn picks the look; adjust the prompt, then lock it.
2. The approved image becomes the style reference for every later request.
3. Generate once per unique dish name across all halls (names repeat across halls and days), skip names that
   already have an image, and save as `public/food/gen/<slug>.jpg` plus the sm and md sizes.
4. A dish's image is replaced by a real student photo from the photo log when one exists.

Sources: Google Cloud, "Ultimate prompting guide for Nano Banana"; Google DeepMind, Gemini image prompt guide;
Google AI Studio docs, image generation and the gemini-nano-banana-2.1 model page (all read 2026-11-14).
