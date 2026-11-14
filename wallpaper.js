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

  const galleryStyles = {chinese:"中式意象", tarot:"塔罗牌", vintage:"欧式复古", urban:"都市摄影", modern:"现代意象"};
  const artworks = [
    {"id":"career-door","name":"晨光之门","style":"modern","theme":"career","stage":0,"tag":"求职机会","elements":"火土","description":"门后的晨光，寓意机会开启。"},
    {"id":"career-steps","name":"清晰阶梯","style":"modern","theme":"career","stage":1,"tag":"面试自信","elements":"金土","description":"阶梯边的侧光，呼应面试时的从容表达。"},
    {"id":"career-letter","name":"等一封好消息","style":"modern","theme":"career","stage":2,"tag":"等好消息","elements":"土火","description":"暖光照亮信封，留给正在等回音的人。"},
    {"id":"love","name":"双枝桃花","style":"chinese","theme":"love","stage":0,"tag":"感情","elements":"木火","description":"两支桃花相向，寓意遇见合拍的人。"},
    {"id":"wealth","name":"金莲锦鲤","style":"chinese","theme":"wealth","stage":0,"tag":"财富","elements":"水金","description":"锦鲤与金莲，寓意日常丰盛与积累。"},
    {"id":"energy","name":"山间晨路","style":"modern","theme":"energy","stage":0,"tag":"行动力","elements":"木土","description":"晨光照亮山路，适合想开始行动的时候。"},
    {"id":"tarot-08-strength","name":"力量 VIII","style":"tarot","theme":"career","stage":1,"tag":"面试自信","elements":"土金","description":"力量牌寓意沉着与勇气，也适合找回行动力。","extra":"energy"},
    {"id":"tarot-17-star","name":"星星 XVII","style":"tarot","theme":"career","stage":2,"tag":"等好消息","elements":"水木","description":"星星牌寓意希望，适合等待回音。","extra":"energy"},
    {"id":"tarot-19-sun","name":"太阳 XIX","style":"tarot","theme":"career","stage":2,"tag":"等好消息","elements":"火金","description":"太阳牌寓意被看见与收获。","extra":"energy"},
    {"id":"tarot-01-magician","name":"魔术师 I","style":"tarot","theme":"career","stage":1,"tag":"面试自信","elements":"火木","description":"魔术师牌提醒你发挥已有的能力。","extra":"energy"},
    {"id":"tarot-06-lovers","name":"恋人 VI","style":"tarot","theme":"love","stage":0,"tag":"感情","elements":"火木","description":"恋人牌寓意相互选择、愿意靠近。"},
    {"id":"tarot-07-chariot","name":"战车 VII","style":"tarot","theme":"career","stage":0,"tag":"求职机会","elements":"金火","description":"战车牌寓意主动出发、向目标推进。","extra":"energy"},
    {"id":"tarot-ace-pentacles","name":"星币王牌","style":"tarot","theme":"career","stage":0,"tag":"求职机会","elements":"金土","description":"星币王牌寓意新机会或踏实积累。","extra":"wealth"},
    {"id":"vintage-stairs","name":"哥特回廊","style":"vintage","theme":"career","stage":1,"tag":"面试自信","elements":"土金","description":"古典拱廊中的阶梯，寓意一步一步往前走。","extra":"energy"},
    {"id":"vintage-letter","name":"窗前来信","style":"vintage","theme":"career","stage":2,"tag":"等好消息","elements":"水土","description":"窗前展开的信，寄托对消息的期待。"},
    {"id":"career","name":"中国尊倒影","style":"urban","theme":"career","stage":2,"tag":"等好消息","elements":"水金","description":"中国尊的水面倒影，呼应等待 Offer 的心愿。"},
    {"id":"career-dawn","name":"中国尊晨光","style":"urban","theme":"career","stage":0,"tag":"求职机会","elements":"火土","description":"晨光照亮高楼，寓意新的机会。"},
    {"id":"career-interview","name":"中国尊仰视","style":"urban","theme":"career","stage":1,"tag":"面试自信","elements":"金水","description":"清晰的建筑线条，适合为面试集中注意力。"},
    {"id":"career-night","name":"中国尊夜景","style":"urban","theme":"career","stage":2,"tag":"等好消息","elements":"水金","description":"深蓝夜色里的一盏光，适合等消息时。"},
    {"id":"love-swans","name":"晨雾双天鹅","style":"modern","theme":"love","stage":1,"tag":"感情","elements":"水金","description":"相向而游的天鹅，寓意双向靠近。"},
    {"id":"love-thread","name":"一线相逢","style":"chinese","theme":"love","stage":0,"tag":"感情","elements":"火土","description":"相接的红线，寓意相遇与牵挂。"},
    {"id":"love-moon","name":"月下双栖","style":"chinese","theme":"love","stage":1,"tag":"感情","elements":"水木","description":"两只玉鸟并肩停在花枝上，寓意安稳相伴。"},
    {"id":"love-cups","name":"两盏茶","style":"modern","theme":"love","stage":1,"tag":"感情","elements":"土金","description":"同一束光照着两盏茶，寓意日常相伴。"},
    {"id":"love-peony","name":"芍药相映","style":"chinese","theme":"love","stage":0,"tag":"感情","elements":"木土","description":"相映的芍药，寓意彼此欣赏。"},
    {"id":"love-ink-peach","name":"墨色桃枝","style":"chinese","theme":"love","stage":2,"tag":"感情","elements":"木火","description":"淡墨里点缀桃红，寓意为新相识留出空间。"},
    {"id":"wealth-oranges","name":"金橘满枝","style":"chinese","theme":"wealth","stage":2,"tag":"财富","elements":"木金","description":"枝头结满金橘，寓意积累渐有收成。"},
    {"id":"wealth-coins","name":"红绸铜钱","style":"chinese","theme":"wealth","stage":0,"tag":"财富","elements":"金火","description":"红绸上的铜钱，寓意守住一点一滴的积累。"},
    {"id":"wealth-harvest","name":"金穗丰收","style":"modern","theme":"wealth","stage":2,"tag":"财富","elements":"土金","description":"成熟的稻穗，寓意踏实投入有了收成。"},
    {"id":"wealth-water","name":"碧泉聚流","style":"modern","theme":"wealth","stage":1,"tag":"财富","elements":"水木","description":"清泉汇入水池，寓意新的机会慢慢汇聚。"},
    {"id":"wealth-carp","name":"墨鲤跃水","style":"chinese","theme":"wealth","stage":1,"tag":"财富","elements":"水土","description":"跃起的墨鲤，寓意稳步向前。"},
    {"id":"wealth-cascade","name":"层泉汇流","style":"vintage","theme":"wealth","stage":1,"tag":"财富","elements":"水土","description":"山间水流层层汇合，寓意涓滴成流。"},
  ];

  function references(theme) {
    return artworks.filter(art => art.theme === theme || art.extra === theme);
  }

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
  const variations = [
    {name:"原调", color:[0,0,0], zoom:0, x:.50},
    {name:"暮色", color:[183,135,243], zoom:.04, x:.37},
    {name:"暖晕", color:[248,169,116], zoom:.025, x:.64},
  ];
  const mod = (value, length) => ((value % length) + length) % length;

  function hash(text) {
    let value = 2166136261;
    for (const char of text) value = Math.imul(value ^ char.codePointAt(0), 16777619);
    return value >>> 0;
  }

  function build(input) {
    const theme = themes[input.theme];
    const wish = input.wish.trim();
    const match = wish ? theme.examples.findIndex(pattern => pattern.test(wish)) : -1;
    const options = references(input.theme);
    const selected = options.find(item => item.id === input.reference);
    const stageIndex = match >= 0 ? match : selected?.theme === input.theme ? selected.stage : input.theme === "career" ? 2 : 0;
    const stage = theme.stages[stageIndex];
    const sign = zodiac.find(item => item[0] === input.personal?.zodiac);
    const star = sign ? {...zodiacLight[sign[1]], label:sign[0]} : null;
    const key = input.personal?.element;
    const element = key ? {...elements[key], label:key + "元素",
      textColor:{木:"#d5f2d7",火:"#ffe1cc",土:"#f5dfbd",金:"#f5dda6",水:"#dcecff"}[key]} : null;
    const upload = input.reference === "upload" ? input.upload : null;
    const order = [...options].sort((a,b) => {
      const score = art => (art.id === selected?.id ? 30 : 0) +
        (art.theme === input.theme && art.stage === stageIndex ? 2 : 0) +
        (key && art.elements.includes(key) ? 4 : 0);
      return score(b) - score(a);
    });
    const art = upload ? {id:"upload",name:"我的参考图",description:"用你选的照片作为壁纸底图。"}
      : order[mod(input.variation,order.length)];
    const variation = variations[upload ? mod(input.variation,variations.length) : 0];
    const details = [];
    if (star) details.push(star.label + " · 加入" + star.detail + "。");
    if (element) details.push((input.personal.mode === "day" ? "日干五行灵感" : "八字配图建议 · 简化扶抑") +
      " · " + element.label + "，加入" + element.detail + "，开启有字时使用对应的短句色。");
    return {
      theme:input.theme, name:theme.name, phrase:stage[1], reason:art.description, details, art, upload,
      color:stage[3], motif:stage[4], wish, style:styles[input.style], star, element, variation, seed:hash(wish),
    };
  }

  return {themes, styles, zodiac, artworks, galleryStyles, references, build};
})();
if (typeof module === "object" && module.exports) module.exports = wallpaper;
