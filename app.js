"use strict";

const get = id => document.getElementById(id);
const form = get("wish-form");
const canvas = get("canvas");
const download = get("download");
const dateParts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
  year:"numeric", month:"2-digit", day:"2-digit", timeZone:"Asia/Shanghai",
}).formatToParts(new Date()).map(part => [part.type, part.value]));
const date = [dateParts.year,dateParts.month,dateParts.day].join("-");
get("phone-date").textContent = new Intl.DateTimeFormat("zh-CN", {
  month:"long", day:"numeric", weekday:"long", timeZone:"Asia/Shanghai",
}).format(new Date());
get("birth").max = date;
const state = {input:null, recipe:null, withText:false, variation:0, url:null, renderId:0};
const images = new Map();
let suggestion = null;
let suggestionVersion = 0;
const uploadInput = get("upload-file");
const uploadStatus = get("upload-status");
const uploadHint = uploadStatus.textContent;
let uploaded = null;
let uploadRequest = 0;
const themes = Object.entries(wallpaper.themes);
const artUrl = id => globalThis.WALLPAPER_ART?.[id] ?? "art/" + id + ".jpg";

function choices(target, name, entries, selected) {
  target.replaceChildren();
  for (const [value, label, icon] of entries) {
    const option = document.createElement("label");
    option.className = "choice";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = name;
    radio.value = value;
    radio.checked = value === selected;
    option.append(radio);
    if (icon) {
      const symbol = document.createElement("span");
      symbol.className = "theme-icon";
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = icon;
      option.append(symbol);
    }
    option.append(document.createTextNode(label));
    target.append(option);
  }
}

function configureTheme(theme, selected = "auto") {
  get("wish").placeholder = wallpaper.themes[theme].example;
  const references = get("references");
  references.replaceChildren();
  get("reference-auto").checked = selected === "auto";
  for (const art of wallpaper.references(theme)) {
    const label = document.createElement("label");
    label.className = "reference-card";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "reference";
    radio.value = art.id;
    radio.checked = selected === art.id;
    const image = document.createElement("img");
    image.src = artUrl(art.id);
    image.alt = "";
    image.loading = "lazy";
    if (art.style === "tarot") label.classList.add("tarot-card");
    const title = document.createElement("span");
    title.textContent = art.name;
    label.append(radio,image,title);
    references.append(label);
  }
  updateReferenceSummary();
}

function updateReferenceSummary() {
  const id = new FormData(form).get("reference");
  get("reference-summary").textContent = id === "upload" ? "我的参考图"
    : wallpaper.artworks.find(art => art.id === id)?.name ?? "选图、上传或调整氛围";
}

choices(get("themes"), "theme", themes.map(([key,item]) => [key,item.name,item.icon]), "career");
choices(get("styles"), "style", Object.entries(wallpaper.styles).map(([key,item]) => [key,item.name]), "soft");
configureTheme("career");
get("zodiac").add(new Option("请选择", ""));
for (const [name] of wallpaper.zodiac) get("zodiac").add(new Option(name, name));

form.addEventListener("input", event => {
  if (!event.target.closest("#suggestion")) clearSuggestion();
});
form.addEventListener("change", event => {
  if (event.target.name === "theme") {
    configureTheme(event.target.value);
    generate(readInput(),{preview:true});
  }
  if (event.target.name === "reference") updateReferenceSummary();
  get("birth-time-field").hidden = !get("birth").value;
  get("birth-zone-field").hidden = !get("birth").value || !get("birth-time").value;
  get("custom-zone-field").hidden = get("birth-zone-field").hidden || get("birth-zone").value !== "other";
});

function setUploadStatus(message, error = false) {
  uploadStatus.textContent = message;
  uploadStatus.toggleAttribute("data-error", error);
}

function readUpload(url) {
  return new Promise((resolve,reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("这张图无法打开。请试试 JPG、PNG 或 WebP。"));
    image.src = url;
  });
}

get("pick-file").addEventListener("click", () => uploadInput.click());
uploadInput.addEventListener("change", async () => {
  const file = uploadInput.files[0];
  uploadInput.value = "";
  if (!file) return;
  const request = ++uploadRequest;
  if (file.size > 15 * 1024 * 1024) {
    setUploadStatus("请上传 15 MB 以内的图片。", true);
    return;
  }
  if (file.type && !/^image\/(jpeg|png|webp|avif|heic|heif)$/i.test(file.type)) {
    setUploadStatus("请选择 JPG、PNG、WebP、AVIF 或浏览器支持的 HEIC 图片。", true);
    return;
  }
  setUploadStatus("正在读取图片…");
  const url = URL.createObjectURL(file);
  try {
    const image = await readUpload(url);
    if (request !== uploadRequest) {
      URL.revokeObjectURL(url);
      return;
    }
    if (image.naturalWidth * image.naturalHeight > 60000000) {
      throw new Error("图片尺寸过大，请缩小图片后重新选择。");
    }
    if (uploaded) URL.revokeObjectURL(uploaded.url);
    uploaded = {image,url};
    get("uploaded-thumb").src = url;
    get("uploaded-thumb").style.objectPosition = "50% 50%";
    get("crop").value = "50";
    get("upload-preview").hidden = false;
    get("reference-upload").disabled = false;
    get("reference-upload").checked = true;
    setUploadStatus("已选用上传图。调整裁切位置后，点击生成。");
    updateReferenceSummary();
    clearSuggestion();
  } catch (problem) {
    URL.revokeObjectURL(url);
    if (request === uploadRequest) setUploadStatus(problem.message, true);
  }
});

get("remove-upload").addEventListener("click", () => {
  ++uploadRequest;
  if (uploaded) URL.revokeObjectURL(uploaded.url);
  uploaded = null;
  get("uploaded-thumb").removeAttribute("src");
  get("upload-preview").hidden = true;
  const reference = get("reference-upload");
  if (reference.checked) get("reference-auto").checked = true;
  reference.disabled = true;
  setUploadStatus(uploadHint);
  updateReferenceSummary();
  clearSuggestion();
  if (state.input.reference === "upload") {
    state.input = {...state.input,reference:"auto",upload:null};
    state.variation = 0;
    render().catch(showRenderError);
  }
});

get("crop").addEventListener("input", event => {
  const position = event.target.value + "%";
  get("uploaded-thumb").style.objectPosition = position + " " + position;
  clearSuggestion();
});
get("crop").addEventListener("change", () => {
  if (!uploaded || state.input.upload?.image !== uploaded.image || get("reference-upload").checked === false) return;
  state.input.upload = {...state.input.upload,crop:Number(get("crop").value)/100};
  render().catch(showRenderError);
});
const artDialog = get("art-dialog");
const artCanvas = get("art-canvas");
const artDownload = get("art-download");
const artStatus = get("art-status");
let activeArtwork = null;
let artPreviewVersion = 0;
let artPreviewUrl = null;

function closeArtwork() {
  ++artPreviewVersion;
  if (artPreviewUrl) URL.revokeObjectURL(artPreviewUrl);
  artPreviewUrl = null;
  activeArtwork = null;
  artDownload.removeAttribute("href");
  artDialog.close();
}

get("art-close").addEventListener("click", closeArtwork);
artDialog.addEventListener("cancel", event => {
  event.preventDefault();
  closeArtwork();
});
artDialog.addEventListener("click", event => {
  if (event.target === artDialog) closeArtwork();
});
get("art-customize").addEventListener("click", () => {
  const {art,theme} = activeArtwork;
  const radio = Array.from(form.elements.theme).find(input => input.value === theme);
  radio.checked = true;
  configureTheme(theme,art.id);
  generate(readInput(),{preview:true});
  closeArtwork();
  radio.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});
  get("studio").scrollIntoView();
  get("generate").focus({preventScroll:true});
});

async function previewArtwork(art, theme) {
  activeArtwork = {art,theme};
  const version = ++artPreviewVersion;
  get("art-title").textContent = art.name;
  get("art-description").textContent = art.description;
  artCanvas.setAttribute("aria-label",art.name + "壁纸大图");
  artCanvas.hidden = true;
  artStatus.textContent = "正在加载大图…";
  artStatus.hidden = false;
  artDownload.removeAttribute("href");
  artDialog.showModal();

  try {
    const image = await loadImage(art.id);
    if (version !== artPreviewVersion || !artDialog.open) return;
    const recipe = wallpaper.build({theme,reference:art.id,style:"soft",wish:"",variation:0});
    paint(artCanvas,image,recipe,false);
    artCanvas.hidden = false;
    artStatus.hidden = true;
    artCanvas.toBlob(blob => {
      if (version !== artPreviewVersion || !artDialog.open) return;
      if (blob) {
        artPreviewUrl = URL.createObjectURL(blob);
        artDownload.href = artPreviewUrl;
        artDownload.download = "好运锁屏-" + art.name + "-无字.png";
      } else {
        artStatus.textContent = "图片导出失败，请重新打开大图。";
        artStatus.hidden = false;
      }
    },"image/png");
  } catch (error) {
    if (version !== artPreviewVersion || !artDialog.open) return;
    artStatus.textContent = error.message;
  }
}

const gallery = get("gallery-cards");
let galleryStyle = "";
for (const [id,name] of [["","全部"],...Object.entries(wallpaper.galleryStyles)]) {
  const option = document.createElement("button");
  option.className = "choice";
  option.type = "button";
  option.textContent = name;
  option.setAttribute("aria-pressed",String(!id));
  option.addEventListener("click", () => {
    galleryStyle = id;
    for (const sibling of get("style-filter").children) sibling.setAttribute("aria-pressed",String(sibling === option));
    showGallery();
  });
  get("style-filter").append(option);
}
for (const [id,theme] of themes) {
  get("intent-filter").add(new Option(theme.name,id));
}
get("intent-filter").addEventListener("change",showGallery);
showGallery();

function showGallery() {
  const filter = get("intent-filter").value;
  const pool = filter ? wallpaper.references(filter) : wallpaper.artworks;
  const options = galleryStyle ? pool.filter(art => art.style === galleryStyle) : pool;
  gallery.replaceChildren();
  for (const art of options) {
    const theme = filter || art.theme;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-card" + (art.style === "tarot" ? " tarot-card" : "");
    button.dataset.artId = art.id;
    const image = document.createElement("img");
    image.src = artUrl(art.id);
    image.alt = "";
    image.loading = "lazy";
    const caption = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = art.name;
    const use = document.createElement("small");
    use.textContent = wallpaper.themes[theme].name;
    caption.append(title,use);
    button.append(image,caption);
    button.addEventListener("click", () => previewArtwork(art,theme));
    gallery.append(button);
  }
  get("gallery-empty").hidden = options.length > 0;
}

function paintTarot(ctx,image,w,h) {
  const background = ctx.createLinearGradient(0,0,w,h);
  background.addColorStop(0,"#251832");
  background.addColorStop(.56,"#39283a");
  background.addColorStop(1,"#171321");
  ctx.fillStyle = background;
  ctx.fillRect(0,0,w,h);
  glow(ctx,w,h,.5,.53,[212,178,135],.33,.7);
  const scale = Math.min(w*.78/image.width,h*.54/image.height);
  const iw = image.width*scale, ih = image.height*scale;
  ctx.save();
  ctx.shadowColor = "#090611";
  ctx.shadowBlur = w*.04;
  ctx.shadowOffsetY = w*.014;
  ctx.drawImage(image,(w-iw)/2,h*.55-ih/2,iw,ih);
  ctx.restore();
}

function loadImage(theme) {
  if (images.has(theme)) return images.get(theme);
  const image = new Image();
  const promise = new Promise((resolve,reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => {
      images.delete(theme);
      reject(new Error("底图加载失败，请刷新后重试。"));
    };
  });
  images.set(theme,promise);
  image.src = artUrl(theme);
  return promise;
}

function rgba(color, opacity) {
  return "rgba(" + color.join(",") + "," + opacity + ")";
}

function glow(ctx, w, h, x, y, color, opacity, radius) {
  const gradient = ctx.createRadialGradient(w*x,h*y,0,w*x,h*y,w*radius);
  gradient.addColorStop(0,rgba(color,opacity));
  gradient.addColorStop(1,rgba(color,0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,w,h);
}

function motif(ctx,w,h,shape,color,opacity) {
  ctx.save();
  ctx.strokeStyle = rgba(color,opacity);
  ctx.lineWidth = Math.max(1,w*.0018);
  const drawArc = (x,y,rx,ry,start,end) => {
    ctx.beginPath();
    ctx.ellipse(w*x,h*y,w*rx,w*ry,0,start,end);
    ctx.stroke();
  };
  const line = (x1,y1,x2,y2) => {
    ctx.beginPath();
    ctx.moveTo(w*x1,h*y1);
    ctx.lineTo(w*x2,h*y2);
    ctx.stroke();
  };
  switch (shape) {
    case "ripple":
      drawArc(.5,.64,.29,.032,.1,Math.PI-.1);
      drawArc(.5,.654,.34,.04,.2,Math.PI-.2);
      break;
    case "pair":
      drawArc(.35,.66,.125,.12,1.2,3.0);
      drawArc(.65,.66,.125,.12,.15,1.94);
      break;
    case "line":
      ctx.beginPath();
      ctx.moveTo(w*.33,h*.72);
      ctx.lineTo(w*.67,h*.43);
      ctx.stroke();
      break;
    case "horizon":
      ctx.beginPath();
      ctx.moveTo(w*.12,h*.62);
      ctx.lineTo(w*.88,h*.62);
      ctx.stroke();
      break;
    case "halo":
      drawArc(.5,.54,.26,.26,3.3,6.1);
      break;
    case "branch":
      line(.22,.79,.43,.52);
      line(.30,.69,.23,.59);
      line(.33,.65,.47,.61);
      line(.37,.60,.31,.50);
      break;
    case "ray":
      line(.43,.68,.22,.53);
      line(.43,.68,.34,.48);
      line(.43,.68,.54,.48);
      break;
    case "terrace":
      line(.20,.62,.80,.62);
      line(.26,.65,.74,.65);
      line(.31,.68,.69,.68);
      break;
  }
  ctx.restore();
}

function paint(target, image, recipe, withText) {
  const ctx = target.getContext("2d", {alpha:false});
  const {width:w,height:h} = target;
  const scale = Math.max(w/image.width,h/image.height) * (recipe.style.zoom + recipe.variation.zoom);
  const iw = image.width*scale, ih = image.height*scale;
  const crop = recipe.upload?.crop;
  if (recipe.art.style === "tarot") {
    paintTarot(ctx,image,w,h);
  } else {
    ctx.fillStyle = "#1b152a";
    ctx.fillRect(0,0,w,h);
    ctx.drawImage(image,(w-iw)*(crop ?? recipe.variation.x),(h-ih)*(crop ?? .54),iw,ih);
  }
  const color = recipe.color;
  const intensity = recipe.style.intensity;
  const variationColor = recipe.variation.color;
  if (recipe.style.brightness !== 0) {
    ctx.fillStyle = recipe.style.brightness > 0 ? "rgba(246,220,230,.10)" : "rgba(8,5,23,.18)";
    ctx.fillRect(0,0,w,h);
  }
  const shift = (recipe.seed % 37) / 100;
  glow(ctx,w,h,.31+shift,.55,color,.24*intensity,.85);
  if (recipe.variation.zoom) glow(ctx,w,h,recipe.variation.x,.31,variationColor,.33,.98);
  if (recipe.star) glow(ctx,w,h,recipe.star.x,recipe.star.y,recipe.star.color,.42*intensity,1.05);
  motif(ctx,w,h,recipe.motif,recipe.color,.18*intensity);
  if (recipe.element) {
    glow(ctx,w,h,.34,.65,recipe.element.color,.22*intensity,.64);
    motif(ctx,w,h,recipe.element.motif,recipe.element.color,.55*intensity);
  }

  const shade = ctx.createLinearGradient(0,0,0,h);
  shade.addColorStop(0,"rgba(12,8,28,.45)");
  shade.addColorStop(.28,"rgba(12,8,28,.03)");
  shade.addColorStop(.65,"rgba(12,8,28,0)");
  shade.addColorStop(1,withText ? "rgba(12,8,28,.66)" : "rgba(12,8,28,.20)");
  ctx.fillStyle = shade;
  ctx.fillRect(0,0,w,h);

  if (withText) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = recipe.element?.textColor ?? "#fff2ff";
    ctx.shadowColor = "rgba(18,9,33,.9)";
    ctx.shadowBlur = w*.018;
    ctx.font = '600 ' + Math.round(w*.054) + 'px "Songti SC","SimSun","Microsoft YaHei",serif';
    ctx.fillText(recipe.phrase,w/2,h*.843,w*.82);
    const note = recipe.wish;
    if (note) {
      const chars = Array.from(note);
      const text = chars.length > 25 ? chars.slice(0,24).join("") + "…" : chars.join("");
      ctx.fillStyle = "#eadcef";
      ctx.font = Math.round(w*.027) + 'px "Microsoft YaHei","PingFang SC",sans-serif';
      ctx.fillText(text,w/2,h*.884,w*.80);
    }
    ctx.shadowBlur = 0;
  }
}

function toggleText() {
  get("with-text").setAttribute("aria-pressed", String(state.withText));
  get("without-text").setAttribute("aria-pressed", String(!state.withText));
}

async function render() {
  const version = ++state.renderId;
  const recipe = wallpaper.build({...state.input, variation:state.variation});
  get("download-status").textContent = "正在合成壁纸…";
  download.removeAttribute("href");
  const image = recipe.upload?.image ?? await loadImage(recipe.art.id);
  if (version !== state.renderId) return;
  paint(canvas,image,recipe,state.withText);
  state.recipe = recipe;
  get("result-tags").textContent = [recipe.name,recipe.art.name,recipe.star?.label,recipe.element?.label,
    state.variation && recipe.upload ? recipe.variation.name : ""].filter(Boolean).join(" · ");
  const details = get("result-details");
  details.replaceChildren(...recipe.details.map(value => {
    const row = document.createElement("li");
    row.textContent = value;
    return row;
  }));
  details.hidden = !recipe.details.length;
  get("variation").textContent = recipe.upload ? "换一种效果" : "换一张图";
  const count = wallpaper.references(recipe.theme).length;
  get("variation-count").textContent = recipe.upload ? "" : (state.variation+1) + " / " + count;
  get("result-title").textContent = recipe.phrase;
  get("result-reason").textContent = recipe.reason;
  canvas.setAttribute("aria-label", recipe.name + "锁屏壁纸，" + recipe.phrase);
  canvas.toBlob(blob => {
    if (version !== state.renderId) return;
    if (!blob) {
      get("download-status").textContent = "图片导出失败，请重新生成。";
      return;
    }
    if (state.url) URL.revokeObjectURL(state.url);
    state.url = URL.createObjectURL(blob);
    download.href = state.url;
    download.download = "好运锁屏-" + recipe.name + "-" + recipe.art.name + (state.withText ? "-有字" : "-无字") + ".png";
    get("download-status").textContent = "PNG · 1080 × 2400";
  },"image/png");
}

function showRenderError(error) {
  const status = get("download-status");
  status.textContent = error.name === "SecurityError" ? "浏览器限制了本地图片导出，请从站点或本地服务打开。" : error.message;
}

function readInput() {
  const values = new FormData(form);
  return {
    theme:values.get("theme"), style:values.get("style"), wish:values.get("wish"), reference:values.get("reference"),
    upload:values.get("reference") === "upload" && uploaded ? {image:uploaded.image,crop:Number(get("crop").value)/100} : null,
  };
}

async function generate(input, {preview = false} = {}) {
  const button = get("generate");
  if (!preview && button.disabled) return;
  clearSuggestion();
  const previousInput = state.input;
  const previousVariation = state.variation;
  const previousWithText = state.withText;
  state.input = input;
  state.variation = 0;
  state.withText = false;
  toggleText();
  if (preview) get("preview-status").textContent = "预览";
  else button.disabled = true;
  get("error").hidden = true;
  const pending = render();
  const version = state.renderId;
  try {
    await pending;
    if (preview || version !== state.renderId) return;
    get("preview-status").textContent = "已生成";
    if (matchMedia("(max-width: 680px)").matches) get("result").scrollIntoView({block:"start"});
    get("result").focus({preventScroll:true});
  } catch (problem) {
    if (version !== state.renderId) return;
    if (!preview) {
      state.input = previousInput;
      state.variation = previousVariation;
      state.withText = previousWithText;
      toggleText();
    }
    get("error").textContent = problem.message;
    get("error").hidden = false;
    showRenderError(problem);
  } finally {
    if (!preview) button.disabled = false;
  }
}

function clearSuggestion() {
  ++suggestionVersion;
  suggestion = null;
  get("suggestion").hidden = true;
  get("personal-error").hidden = true;
}

async function previewSuggestion() {
  const version = ++suggestionVersion;
  const apply = get("apply-suggestion");
  const summary = get("suggestion-summary");
  apply.disabled = true;
  summary.textContent = "正在预览配图建议…";
  try {
    const input = {...suggestion.input,personal:{...suggestion.personal,element:get("suggestion-element").value}};
    const recipe = wallpaper.build({...input,variation:0});
    const image = recipe.upload?.image ?? await loadImage(recipe.art.id);
    if (version !== suggestionVersion) return;
    paint(get("suggestion-preview"),image,recipe,false);
    summary.textContent = "底图「" + recipe.art.name + "」。" + (recipe.details.join("") || "你可以仅按心愿生成。");
    apply.disabled = recipe.details.length === 0;
  } catch (error) {
    if (version === suggestionVersion) summary.textContent = error.message;
  }
}

get("suggest").addEventListener("click", () => {
  clearSuggestion();
  const zodiac = get("zodiac").value;
  const birth = get("birth").value;
  const time = get("birth-time").value;
  const zone = get("birth-zone").value === "other" ? get("custom-zone").value.trim() : get("birth-zone").value;
  try {
    if (!get("birth").validity.valid) throw new Error("请填写有效的公历出生日期。");
    if (!zodiac && !birth) throw new Error("请选择星座，或填写出生日期。");
    const chart = birth ? bazi.chartPillars(globalThis.Solar,birth,time,zone) : null;
    const candidates = get("suggestion-element");
    candidates.replaceChildren();
    for (const element of chart?.candidates ?? []) candidates.add(new Option(element + "元素",element));
    get("suggestion-element-field").hidden = !candidates.length;
    get("suggestion-chart").textContent = !chart ? zodiac + " · 星座配图"
      : chart.mode === "day" ? chart.dayStem + " · 日干五行灵感"
      : chart.pillars.join(" · ") + (chart.candidates.length ? " · 简化扶抑候选" : " · 此命盘暂无明确五行建议");
    suggestion = {input:readInput(),personal:{zodiac,mode:chart?.mode}};
    get("suggestion").hidden = false;
    previewSuggestion();
  } catch (error) {
    get("personal-error").textContent = error.message;
    get("personal-error").hidden = false;
  }
});
get("suggestion-element").addEventListener("change",previewSuggestion);
get("apply-suggestion").addEventListener("click", () => {
  if (!suggestion) return;
  generate({...suggestion.input,personal:{...suggestion.personal,element:get("suggestion-element").value}});
});
get("skip-suggestion").addEventListener("click", () => generate(readInput()));
form.addEventListener("submit", event => {
  event.preventDefault();
  generate(readInput());
});

get("variation").addEventListener("click", () => {
  const total = state.input.upload ? 3 : wallpaper.references(state.input.theme).length;
  state.variation = (state.variation+1)%total;
  render().catch(showRenderError);
});
for (const [id,flag] of [["with-text",true],["without-text",false]]) {
  get(id).addEventListener("click", () => {
    if (state.withText === flag) return;
    state.withText = flag;
    toggleText();
    render().catch(showRenderError);
  });
}

state.input = readInput();
render().catch(showRenderError);
