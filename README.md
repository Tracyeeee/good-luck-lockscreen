# 好运锁屏

手机壁纸生成网页。打开 [GitHub Pages](https://tracyeeee.github.io/good-luck-lockscreen/)，或在项目目录运行 `python -m http.server 8765 --bind 127.0.0.1` 后访问 [本地预览](http://127.0.0.1:8765/)。

默认选择心愿即可生成。自定义画面可换底图、上传图片、补充心愿或调整氛围。可下载有字或无字的 1080 × 2400 PNG。


## 图片来源

使用内置 ImageGen 生成，站点使用以下 JPEG 交付文件。

- [career.jpg](art/career.jpg) · Blue-hour photograph of Beijing CITIC Tower (China Zun), instantly recognizable waisted skyscraper, silver vertical ribs and blue violet twilight reflected in a shallow calm urban pool, tiny amber-lit windows, soft skyline. Gallery-grade architectural photography, quiet and aspirational. Center the recognizable tower and use a very tall vertical phone wallpaper composition, calm low-detail dark lavender sky in top quarter and reflection through lower third. One full-bleed picture, no words, no device, no frame, no watermark.
- [love.jpg](art/love.jpg) · Dreamlike premium macro fine-art wallpaper, two pink peach blossom branches curling gently toward one another across a dusk mauve sky, exquisite pink blush blossoms, tiny raindrops and glowing translucent petals, a few out-of-focus blossom highlights, high-end Asian editorial photography. Very tall vertical phone wallpaper, principal blooms clustered at lower middle, generous darker lavender top space for lockscreen clock, no lettering, no device, no border.
- [wealth.jpg](art/wealth.jpg) · A premium phone wallpaper, two rich crimson and gold koi in a quiet deep teal ink pond, their forms like a slow rising curve around a luminous pale lotus, a handful of gold light reflections, finely detailed scales. Refined contemporary Chinese cinematic illustration with real texture, uncluttered, deep atmospheric color. Very tall vertical, main koi and lotus lower middle, upper quarter quiet dark water. No words, no device, no border.
- [energy.jpg](art/energy.jpg) · Fine-art cinematic landscape photograph for a premium phone lockscreen, a tiny path threading through misty amethyst mountain ridges up toward a warm dawn, deep indigo spruce silhouettes in foreground, soft pale amber band, fine atmospheric texture. Very tall vertical full bleed, main visual in lower middle, upper quarter calm hazy sky. No text, no device, no border.



## Offer 新增底图

使用内置 ImageGen 生成。

- [career-dawn.jpg](art/career-dawn.jpg) · Create a premium phone lock screen background, very tall 9:20, a photoreal editorial architectural view of the Beijing CITIC Tower / China Zun during a golden dawn. Use the actual distinctive curved waisted rectangular silhouette visible from the upper third, from across the CBD with clean skyline and leading avenue lines, sunbeams filtering from the left, warm pale gold and navy shadows. Cinematic yet believable and refined. This is the ‘sending applications / opening opportunities’ image in a collection. Uncluttered muted sky in the upper quarter for lock screen clock, main focal point at center-to-lower part. No text, no interface, no phone frame, no watermarks, no people.
- [career-interview.jpg](art/career-interview.jpg) · Premium tall 9:20 phone wallpaper. A low-angle architectural photographic study of Beijing China Zun seen between two angular neighboring glass buildings from a broad walkway. China Zun's distinctive waisted rectangular silhouette clearly identifiable, straight converging perspective lines, clean silver-blue vertical glass ribs with a blade of crisp afternoon sidelight. Modern Chinese financial district. Focus and clarity, contemporary editorial architecture photography. Quiet cloudless steel blue gradient sky in upper quarter, strong coherent composition. No text, no interface, no logos, no people, no watermarks.
- [career-night.jpg](art/career-night.jpg) · Fine-art architectural photograph as a 9:20 premium phone lockscreen of Beijing's China Zun skyscraper at deep blue night, from the perspective of a distant elevated pedestrian overlook; China Zun's very distinctive waisted rectangular form stands above an elegant CBD silhouette, with subtle gold window lights and a soft atmospheric trace of rainy streets beneath. High-end editorial style, cool navy with very sparse silver and amber highlights. Distinct from a water reflection, quiet navy sky in top quarter for the clock and balanced building outlines. No text, no device, no interface, no watermarks.
- [career-door.jpg](art/career-door.jpg) · A sophisticated very tall vertical phone lock screen artwork, 9:20. Photorealistic cinematic minimalist architecture interior. A single elegant tall doorway stands half open at the end of a muted dark navy hallway, soft golden morning light beyond, a long amber beam across the terrazzo floor. Theme of new opportunity for someone applying for jobs. Center-lower composition, quiet indigo plaster wall and subtle glow in upper quarter for the clock, depth and subtle grain, timeless editorial style. No text, no people, no device, no logo, no frame.
- [career-steps.jpg](art/career-steps.jpg) · A luxury editorial architecture photo for a 9:20 phone wallpaper. Clean sculptural pale travertine steps rise diagonally across the lower and middle part of the frame to a crisp stripe of soft daylight. Modern minimalist building interior with one diagonal line, deep blue lilac shadows and pale warm highlights, calm matte deep grey-lavender wall and negative space in top quarter for lock screen clock. Theme: clarity and composure just before an important interview. No text or people, no frame, no watermark.
- [career-letter.jpg](art/career-letter.jpg) · Refined still life photography for a very tall 9:20 mobile wallpaper. A beautiful closed ivory envelope on a dark plum tabletop with an oblique band of warm window light, faint reflections, slight lavender twilight, almost tactile handmade paper fibers. Subtly hopeful, anticipation of a welcome job offer. Frame the envelope in the lower middle about 66 percent down, leave the upper quarter dark soft mauve and completely calm for a lockscreen clock. No words, no letter markings, no logos, no device, no frame.

## 图库与配图规则

图库有 19 张底图，按视觉风格浏览，也可按心愿筛选。塔罗牌保留完整牌框，构图为手机锁屏时钟留出空间。

- [韦特塔罗牌面](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck)，Pamela Colman Smith。七张采用 Wikimedia Commons 标注为公有领域的历史牌面，其中[力量牌](https://commons.wikimedia.org/wiki/File:Strength,_Waite-Smith_Tarot_Deck,_Yale_University.jpg)来自耶鲁馆藏扫描件。
- 欧式复古来自克利夫兰艺术博物馆开放馆藏，[哥特回廊](https://www.clevelandart.org/art/1980.218)和[窗前来信](https://www.clevelandart.org/art/2017.217)，CC0。

[供应的 lunar-javascript 1.7.8](https://github.com/6tail/lunar-javascript/tree/5c92e62c904ba5cc0b62f032796aeef433702268)以 MIT 许可随附在 `vendor/`。节气使用 UTC+8 口径，日柱与时柱使用出生地民用时间，晚子日柱按当天。出生时区由用户选择，夏令时重复或不存在的钟表时间可改用生日建议。只填生日用公历当日日干。填写时间后，以月支加权及旺衰阈值给出简化扶抑候选五行，参考[规则声明](https://github.com/qilaidev/metaphysics-engine/blob/0536f4e12ea8dbc3f81263e7f5d9170109789e84/backend/constants/rulings.js)。中和及疑似从格、专旺格返回空候选。星座及五行只在用户确认后用于生成，出生资料在浏览器内计算。
