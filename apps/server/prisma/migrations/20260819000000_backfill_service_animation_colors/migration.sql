UPDATE "services"
SET "animation_colors" = ARRAY[
  '#B22222',
  '#FF8C00',
  '#FFD700',
  '#2F4F4F',
  '#DCDCDC'
]::TEXT[]
WHERE cardinality("animation_colors") = 0;
