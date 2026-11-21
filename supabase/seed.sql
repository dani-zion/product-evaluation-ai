-- Fictional sample products so the home page's infinite scroll can be seen
-- working. Apply it yourself (Supabase SQL editor or `supabase db reset`);
-- it is safe to run more than once. No images: cards show the placeholder.
insert into public.products
  (id, name, description, image_url, external_link, score, created_at)
values
  ('seed-product-01', 'Aero 2 wireless headphones', 'Over-ear, noise cancelling, about 30 hours per charge.', null, 'https://shop.example.com/aero', 4, now() - interval '0 hours'),
  ('seed-product-02', 'Ridge trail running shoes', 'Grippy outsole and a rock plate for technical trails.', null, 'https://shop.example.com/ridge', 5, now() - interval '1 hours'),
  ('seed-product-03', 'Hearth cast-iron skillet', 'Pre-seasoned 26 cm pan that goes from hob to oven.', null, 'https://shop.example.com/hearth', 4, now() - interval '2 hours'),
  ('seed-product-04', 'Lumen desk lamp', 'Dimmable LED lamp with a warm-to-cool colour slider.', null, 'https://shop.example.com/lumen', 3, now() - interval '3 hours'),
  ('seed-product-05', 'Drift travel backpack', '35-litre carry-on with a clamshell opening and laptop sleeve.', null, 'https://shop.example.com/drift', null, now() - interval '4 hours'),
  ('seed-product-06', 'Kettle One electric kettle', '1.7 litres, variable temperature, keeps water warm for 30 minutes.', null, 'https://shop.example.com/kettle', 4, now() - interval '5 hours'),
  ('seed-product-07', 'Pulse fitness tracker', 'Heart rate, sleep and step tracking with a 10-day battery.', null, 'https://shop.example.com/pulse', 3, now() - interval '6 hours'),
  ('seed-product-08', 'Mason standing desk', 'Dual-motor frame with four height presets.', null, 'https://shop.example.com/mason', 5, now() - interval '7 hours'),
  ('seed-product-09', 'Orbit robot vacuum', 'Maps rooms and empties itself into a base station.', null, 'https://shop.example.com/orbit', 2, now() - interval '8 hours'),
  ('seed-product-10', 'Tide insulated bottle', 'Keeps drinks cold for 24 hours; dishwasher-safe lid.', null, 'https://shop.example.com/tide', null, now() - interval '9 hours'),
  ('seed-product-11', 'Quill fountain pen', 'Steel nib, piston filler, fine and medium options.', null, 'https://shop.example.com/quill', 4, now() - interval '10 hours'),
  ('seed-product-12', 'Atlas 4-person tent', 'Freestanding dome that pitches in about ten minutes.', null, 'https://shop.example.com/atlas', 3, now() - interval '11 hours'),
  ('seed-product-13', 'Brew pour-over set', 'Glass carafe, ceramic dripper and 100 paper filters.', null, 'https://shop.example.com/brew', 5, now() - interval '12 hours'),
  ('seed-product-14', 'Nimbus memory foam pillow', 'Adjustable fill so you can set the height yourself.', null, 'https://shop.example.com/nimbus', null, now() - interval '13 hours'),
  ('seed-product-15', 'Echo smart speaker', 'Room-filling sound with a hardware mic switch.', null, 'https://shop.example.com/echo', 3, now() - interval '14 hours'),
  ('seed-product-16', 'Cinder pizza oven', 'Gas-fired outdoor oven that reaches 500 °C.', null, 'https://shop.example.com/cinder', 4, now() - interval '15 hours'),
  ('seed-product-17', 'Glide electric toothbrush', 'Two-minute timer, pressure sensor, two-week battery.', null, 'https://shop.example.com/glide', 4, now() - interval '16 hours'),
  ('seed-product-18', 'Harbor rain jacket', 'Packable, seam-sealed shell with pit zips.', null, 'https://shop.example.com/harbor', null, now() - interval '17 hours'),
  ('seed-product-19', 'Pixel mirrorless camera', '24 MP sensor, in-body stabilisation, 4K video.', null, 'https://shop.example.com/pixel', 5, now() - interval '18 hours'),
  ('seed-product-20', 'Fern indoor planter', 'Self-watering pot with a water level window.', null, 'https://shop.example.com/fern', 2, now() - interval '19 hours'),
  ('seed-product-21', 'Sprout kids'' balance bike', 'Light aluminium frame for ages 2 to 5.', null, 'https://shop.example.com/sprout', 4, now() - interval '20 hours'),
  ('seed-product-22', 'Anvil cordless drill', '18 V drill driver with two batteries and a case.', null, 'https://shop.example.com/anvil', 4, now() - interval '21 hours'),
  ('seed-product-23', 'Loom wool throw blanket', 'Merino blend, 130 by 170 cm, machine washable.', null, 'https://shop.example.com/loom', null, now() - interval '22 hours'),
  ('seed-product-24', 'Vector mechanical keyboard', 'Hot-swappable switches and a compact 75% layout.', null, 'https://shop.example.com/vector', 5, now() - interval '23 hours'),
  ('seed-product-25', 'Summit hiking poles', 'Carbon, collapsible, with cork grips.', null, 'https://shop.example.com/summit', 3, now() - interval '24 hours'),
  ('seed-product-26', 'Crest air fryer', '5.5 litres with a window and two baskets.', null, 'https://shop.example.com/crest', 4, now() - interval '25 hours'),
  ('seed-product-27', 'Halo ring light', '25 cm light with phone holder and three colour modes.', null, 'https://shop.example.com/halo', null, now() - interval '26 hours'),
  ('seed-product-28', 'Tempo jump rope', 'Weighted handles and a tangle-free cable.', null, 'https://shop.example.com/tempo', 3, now() - interval '27 hours'),
  ('seed-product-29', 'Canvas tote bag', 'Heavy cotton with an inside zip pocket.', null, 'https://shop.example.com/canvas', null, now() - interval '28 hours'),
  ('seed-product-30', 'Stride walking pad', 'Folding under-desk treadmill up to 6 km/h.', null, 'https://shop.example.com/stride', 2, now() - interval '29 hours'),
  ('seed-product-31', 'Mosaic jigsaw puzzle', '1,000 pieces, recycled board, poster included.', null, 'https://shop.example.com/mosaic', 4, now() - interval '30 hours'),
  ('seed-product-32', 'Arc gaming mouse', 'Lightweight wireless mouse with a 70-hour battery.', null, 'https://shop.example.com/arc', null, now() - interval '31 hours')
on conflict (id) do nothing;
