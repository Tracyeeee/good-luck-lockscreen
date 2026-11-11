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
const state = {input:null, recipe:null, withText:true, variation:0, url:null, renderId:0};
const images = new Map();
const uploadInput = get("upload-file");
const uploadStatus = get("upload-status");
const uploadHint = uploadStatus.textContent;
let uploaded = null;
let uploadRequest = 0;
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

function configureTheme(theme) {
  choices(get("stages"), "stage", wallpaper.themes[theme].stages.map(([label], i) => [String(i),label]), "");
  const isCareer = theme === "career";
  get("role-field").hidden = !isCareer;
  get("role").disabled = !isCareer;
  const references = get("references");
  references.replaceChildren();
  get("reference-auto").checked = true;
  if (!isCareer) return;
  for (const art of wallpaper.careerReferences) {
    const label = document.createElement("label");
    label.className = "reference-card";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "reference";
    radio.value = art.id;
    const image = document.createElement("img");
    image.src = artUrl(art.id);
    image.alt = "";
    image.loading = "lazy";
    const title = document.createElement("span");
    title.textContent = art.name;
    label.append(radio,image,title);
    references.append(label);
  }
}

choices(get("themes"), "theme", Object.entries(wallpaper.themes).map(([key,item]) => [key,item.name,item.icon]), "career");
choices(get("styles"), "style", Object.entries(wallpaper.styles).map(([key,item]) => [key,item.name]), "soft");
configureTheme("career");
get("zodiac").add(new Option("请选择", ""));
for (const [name] of wallpaper.zodiac) get("zodiac").add(new Option(name, name));

form.addEventListener("change", event => {
  if (event.target.name === "theme") configureTheme(event.target.value);
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
  if (state.input.reference === "upload") {
    state.input = {...state.input,reference:"auto",upload:null};
    state.variation = 0;
    render().catch(showRenderError);
  }
});

get("crop").addEventListener("input", event => {
  const position = event.target.value + "%";
  get("uploaded-thumb").style.objectPosition = position + " " + position;
});
get("crop").addEventListener("change", () => {
  if (state.input.upload?.image !== uploaded?.image || get("reference-upload").checked === false) return;
  state.input.upload = {...state.input.upload,crop:Number(get("crop").value)/100};
  render().catch(showRenderError);
});
for (const card of document.querySelectorAll("[data-pick]")) {
  card.addEventListener("click", () => {
    const radio = Array.from(form.elements.theme).find(input => input.value === card.dataset.pick);
    radio.checked = true;
    configureTheme(card.dataset.pick);
    get("studio").scrollIntoView();
    radio.focus({preventScroll:true});
  });
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
  ctx.drawImage(image,(w-iw)*(crop ?? recipe.variation.x),(h-ih)*(crop ?? .54),iw,ih);
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
  if (recipe.time) glow(ctx,w,h,recipe.time.x,recipe.time.y,recipe.time.color,.22,.84);
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
    ctx.fillStyle = "#fff2ff";
    ctx.shadowColor = "rgba(18,9,33,.9)";
    ctx.shadowBlur = w*.018;
    ctx.font = '600 ' + Math.round(w*.054) + 'px "Songti SC","SimSun","Microsoft YaHei",serif';
    ctx.fillText(recipe.phrase,w/2,h*.843,w*.82);
    const note = recipe.wish || (recipe.role ? "奔赴 " + recipe.role : "");
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
  get("result-tags").textContent = [recipe.name,recipe.stage,recipe.art.name,recipe.style.name,recipe.star?.label,recipe.element?.label,
    state.variation && (recipe.upload || recipe.theme !== "career") ? recipe.variation.name : ""].filter(Boolean).join(" · ");
  const details = get("result-details");
  details.replaceChildren(...recipe.details.map(value => {
    const row = document.createElement("li");
    row.textContent = value;
    return row;
  }));
  details.hidden = !recipe.details.length;
  get("variation").textContent = (recipe.upload || recipe.theme !== "career") ? "换一种效果" : "换一张图";
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
    download.download = "好运锁屏-" + recipe.name + "-" + recipe.stage + (state.withText ? "-有字" : "-无字") + ".png";
    get("download-status").textContent = "PNG · 1080 × 2400";
  },"image/png");
}

function showRenderError(error) {
  const status = get("download-status");
  status.textContent = error.name === "SecurityError" ? "浏览器限制了本地图片导出，请从站点或本地服务打开。" : error.message;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const values = new FormData(form);
  const input = {
    theme:values.get("theme"), stage:values.has("stage") ? Number(values.get("stage")) : null,
    style:values.get("style"), wish:values.get("wish"), role:values.get("role"), zodiac:values.get("zodiac"),
    birth:values.get("birth"), period:values.get("period"), reference:values.get("reference"), date,
    upload:uploaded ? {image:uploaded.image,crop:Number(get("crop").value)/100} : null,
  };
  const error = get("error");
  if (input.birth && !wallpaper.dayStem(input.birth)) {
    error.textContent = "请填写有效的公历出生日期。";
    error.hidden = false;
    return;
  }
  const previousInput = state.input;
  const previousVariation = state.variation;
  state.input = input;
  state.variation = 0;
  const button = get("generate");
  button.disabled = true;
  error.hidden = true;
  try {
    await render();
    get("preview-status").textContent = "已生成";
    if (matchMedia("(max-width: 680px)").matches) get("result").scrollIntoView({block:"start"});
  } catch (problem) {
    state.input = previousInput;
    state.variation = previousVariation;
    error.textContent = problem.message;
    error.hidden = false;
    showRenderError(problem);
  } finally {
    button.disabled = false;
  }
});

get("variation").addEventListener("click", () => {
  const total = state.input.theme === "career" && state.input.reference !== "upload" ? wallpaper.careerReferences.length : 3;
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

state.input = {theme:"career", stage:2, style:"soft", wish:"", role:"", zodiac:"", birth:"", period:"any", reference:"auto", upload:null, date};
render().catch(showRenderError);

