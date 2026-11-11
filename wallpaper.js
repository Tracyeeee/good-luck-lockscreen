"use strict";

const wallpaper = (() => {
  const themes = {
    career: {name:"接心仪 Offer", icon:"↑", stages:[
      ["正在投递", "让机会看见我", "把光放在城市天际线上，寓意打开新的机会。", [230,164,107], "horizon"],
      ["准备面试", "把我的故事讲清楚", "用一道清晰的侧光衬出楼体线条，呼应表达与专注。", [165,193,255], "line"],
      ["等待结果", "好消息在路上", "用中国尊与水面倒影，寓意期待的回音正在靠近。", [213,158,250], "ripple"],
    ], examples:[/投递|简历|找工作|求职/, /面试前|准备面试|面试顺利|面试.*表达|面试发挥/, /等待|终面|等.*offer|收到.*offer|拿到.*offer|回音|消息/i]},
    love: {name:"遇见正缘", icon:"♡", stages:[
      ["想遇见新人", "愿相遇自然发生", "让两支桃花朝同一个方向靠近，呼应你想遇见合拍的人的心愿。", [255,161,202], "pair"],
      ["让关系更近", "靠近也可以慢一点", "在相向的花枝间留一束柔光，给关系留一点慢慢展开的空间。", [244,178,156], "halo"],
      ["拓展人缘", "给新相遇留个位置", "在桃花周围留出开阔的暮色，把注意力放在新的连接上。", [192,171,250], "horizon"],
    ], examples:[/遇见|对象|脱单|正缘/, /靠近|关系|恋爱中|相处/, /人缘|社交|交友|新朋友/]},
    wealth: {name:"丰盛积累", icon:"◈", stages:[
      ["稳步积累", "一点一点攒起来", "把金色水纹集中在莲花旁，呼应日常的积累。", [229,178,99], "ripple"],
      ["拓展机会", "让新的可能流进来", "让金色光线沿着锦鲤的方向铺开，寓意打开新的机会。", [162,228,187], "line"],
      ["推进项目", "让努力慢慢落地", "用低处的暖光照亮莲花，呼应手里的事逐渐有了形状。", [255,171,126], "halo"],
    ], examples:[/攒|储蓄|存钱|积累/, /机会|客户|拓展|副业/, /项目|落地|交付/]},
    energy: {name:"找回行动力", icon:"✧", stages:[
      ["准备开始", "今天先走第一步", "让晨光落在山间小路的前方，把注意力带回第一步。", [255,184,130], "line"],
      ["恢复节奏", "按自己的节奏来", "压低山谷的对比，让层层薄雾衬出一条清楚的路。", [184,174,239], "horizon"],
      ["安定下来", "允许自己慢一点", "让远山和暖色天光保留安静的空间，给自己一点喘息。", [247,176,199], "halo"],
    ], examples:[/开始|行动|拖延/, /恢复|节奏|坚持/, /安定|放松|焦虑|休息/]},
  };

  const careerReferences = [
    {id:"career-door", name:"晨光之门", description:"门后的晨光象征刚打开的机会。"},
    {id:"career-steps", name:"清晰阶梯", description:"光线照亮下一阶，呼应面试时清楚地表达自己。"},
    {id:"career-letter", name:"等一封好消息", description:"暖光落在信封上，留给正在等待回音的人。"},
    {id:"career", name:"中国尊倒影", description:"中国尊在水中的倒影，呼应对 Offer 回音的期待。"},
    {id:"career-dawn", name:"中国尊晨光", description:"晨光照亮高楼和街道，呼应开启下一段工作旅程。"},
    {id:"career-interview", name:"中国尊仰视", description:"玻璃幕墙的线条向上收拢，画面利落、专注。"},
    {id:"career-night", name:"中国尊夜景", description:"深蓝夜色里保留一盏暖光，寄托等消息时的期待。"},
  ];
  const careerAlternatives = [
    ["career-door", "career-dawn", "career-night", "career-steps", "career-interview", "career-letter", "career"],
    ["career-steps", "career-interview", "career-dawn", "career-door", "career-letter", "career", "career-night"],
    ["career-letter", "career", "career-night", "career-door", "career-dawn", "career-steps", "career-interview"],
  ];
  const roleProfiles = [
    {pattern:/产品|设计|创意|内容|策划|品牌|媒体/,color:[231,166,209],motif:"halo",description:"用柔和的弧光呼应创意与表达。"},
    {pattern:/技术|开发|工程|研发|数据|算法|软件|程序|计算机|developer|engineer|\bAI\b/i,color:[157,210,253],motif:"line",description:"用清晰的线条和蓝色侧光呼应技术方向。"},
    {pattern:/金融|投资|会计|财务|银行|商业|销售|运营|商务|咨询/,color:[247,201,136],motif:"horizon",description:"用平直光线和米金色呼应稳健推进。"},
  ];
  const defaultRole = {color:[221,190,244],motif:"halo",description:"把你的目标融入短句和画面光线。"};

  const styles = {
    soft: {name:"柔光", zoom:1, intensity:.80, brightness:0, saturation:.08},
    dark: {name:"深色", zoom:1.035, intensity:1.02, brightness:-.12, saturation:.05},
    light: {name:"通透", zoom:1.015, intensity:.62, brightness:.13, saturation:.18},
  };
  const elements = {
    木:{color:[128,222,181], detail:"青绿枝线", motif:"branch"},
    火:{color:[255,143,105], detail:"暖橙散射光", motif:"ray"},
    土:{color:[242,204,145], detail:"米金层线", motif:"terrace"},
    金:{color:[232,226,245], detail:"银白细弧", motif:"halo"},
    水:{color:[133,186,248], detail:"深蓝水纹", motif:"ripple"},
  };
  const zodiac = [
    ["白羊座","火"],["金牛座","土"],["双子座","风"],["巨蟹座","水"],["狮子座","火"],["处女座","土"],
    ["天秤座","风"],["天蝎座","水"],["射手座","火"],["摩羯座","土"],["水瓶座","风"],["双鱼座","水"],
  ];
  const zodiacLight = {
    火:{color:[255,153,114],detail:"暖橙侧光",x:.19,y:.48},
    土:{color:[240,204,161],detail:"低处的柔金光",x:.48,y:.72},
    风:{color:[182,231,242],detail:"高处的青蓝光",x:.76,y:.24},
    水:{color:[141,177,251],detail:"低位蓝紫柔光",x:.74,y:.59},
  };
  const timeThemes = [
    {name:"微光", color:[211,177,246], x:.26, y:.38},
    {name:"向前", color:[255,184,123], x:.68, y:.46},
    {name:"舒展", color:[140,208,226], x:.79, y:.52},
    {name:"安定", color:[218,186,153], x:.41, y:.67},
  ];
  const variations = [
    {name:"原调", color:[0,0,0], zoom:0, x:.50},
    {name:"暮色", color:[183,135,243], zoom:.04, x:.37},
    {name:"暖晕", color:[248,169,116], zoom:.025, x:.64},
  ];
  const stems = "甲乙丙丁戊己庚辛壬癸";
  const stemElements = ["木","木","火","火","土","土","金","金","水","水"];
  const referenceDate = Date.UTC(2026, 10, 11);
  const day = 86400000;
  const mod = (value, length) => ((value % length) + length) % length;

  function dayStem(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "2099-12-31") return null;
    const utc = Date.parse(value + "T00:00:00Z");
    if (!Number.isFinite(utc) || new Date(utc).toISOString().slice(0,10) !== value) return null;
    const index = mod(5 + Math.round((utc - referenceDate) / day), stems.length);
    return {stem:stems[index], element:stemElements[index]};
  }

  function periodTheme(period, isoDate) {
    if (!["today","week"].includes(period)) return null;
    const utc = Date.parse(isoDate + "T00:00:00Z");
    if (!Number.isFinite(utc)) return null;
    const dayIndex = Math.round(utc / day);
    const weekIndex = Math.floor((dayIndex + 3) / 7);
    const item = timeThemes[mod(period === "week" ? weekIndex : dayIndex, timeThemes.length)];
    return {...item, label:(period === "week" ? "本周主题" : "今日主题") + " · " + item.name};
  }

  function hash(text) {
    let value = 2166136261;
    for (const char of text) value = Math.imul(value ^ char.codePointAt(0), 16777619);
    return value >>> 0;
  }

  function build(input) {
    const theme = themes[input.theme];
    const wish = input.wish.trim();
    const match = wish ? theme.examples.findIndex(pattern => pattern.test(wish)) : -1;
    const isCareer = input.theme === "career";
    const stageIndex = input.stage ?? (match >= 0 ? match : isCareer ? 2 : 0);
    const stage = theme.stages[stageIndex];
    const time = periodTheme(input.period, input.date);
    const sign = zodiac.find(item => item[0] === input.zodiac);
    const stem = input.birth ? dayStem(input.birth) : null;
    const star = sign ? {...zodiacLight[sign[1]], label:sign[0]} : null;
    const element = stem ? {...elements[stem.element], label:stem.stem + stem.element} : null;
    const role = isCareer ? input.role?.trim() || "" : "";
    const profile = role ? roleProfiles.find(item => item.pattern.test(role)) ?? defaultRole : null;
    const upload = input.reference === "upload" && input.upload ? input.upload : null;
    let art = {id:input.theme,name:"",description:stage[2]};
    if (isCareer && !upload) {
      const order = careerAlternatives[stageIndex];
      const start = Math.max(0,order.indexOf(input.reference));
      art = careerReferences.find(item => item.id === order[mod(start+input.variation,order.length)]);
    }
    if (upload) art = {id:"upload",name:"我的参考图",description:"用你选的照片作为壁纸底图。"};
    const variation = variations[isCareer && !upload ? 0 : mod(input.variation,variations.length)];
    const details = [];
    if (role) details.push("目标 · " + role + "。" + profile.description);
    if (star) details.push(star.label + " · 加入" + star.detail + "。");
    if (element) details.push("出生日干 " + element.label + " · 加入" + element.detail + "。");
    if (time) details.push(time.label + " · 调整背景的明暗。");
    return {
      theme:input.theme, name:theme.name, stage:stage[0], phrase:stage[1], reason:art.description, details, art, upload,
      color:profile?.color ?? stage[3], motif:profile?.motif ?? stage[4], role, wish, style:styles[input.style],
      star, element, time, variation, seed:hash(role+" "+wish),
    };
  }

  return {themes, styles, zodiac, careerReferences, dayStem, periodTheme, build};
})();
if (typeof module === "object" && module.exports) module.exports = wallpaper;

