// Decision #18 (frozen 2026-08-03) — insert byte-identical into every art-gen
// prompt. Never edit; if the style needs to change, that's a new decision.
export const STYLE_FORMULA =
  "Soft hand-painted oil and gouache fantasy illustration with visible canvas " +
  "texture and brushwork, pre-digital 1980s-90s tabletop-RPG book-cover " +
  "style. Solid grounded anatomy, dramatic dynamic poses, form defined by " +
  "value contrast rather than clean outlines. Monsters in weathered earthy " +
  "tones (ochre, rust, bone) with one unsettling accent hue per creature " +
  "type; environments in muted parchment-and-shadow palette; protagonist " +
  "figures warmer and more saturated to read as the hero. Moody " +
  "single-source dramatic lighting like a paperback cover, ominous " +
  "gothic-fantasy atmosphere. High contrast between subject and background, " +
  "one creature/scene per image, consistent three-quarter portrait framing.";

// Compressed form for length-limited fields. Never maintain two competing
// style strings — STYLE_FORMULA is the source of truth, this is its compression.
export const STYLE_TOKEN =
  "painterly 1980s TTRPG book-cover oil illustration, earthy weathered " +
  "palette, dramatic single-source lighting, three-quarter portrait";
