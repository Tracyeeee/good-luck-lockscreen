"use strict";

const portraits = (() => {
  const people = [
  {
    "id": "kris",
    "name": "Kris Jenner",
    "note": "浴袍经典版",
    "file": "kris-main.png",
    "crop": [
      0,
      0,
      1,
      1
    ],
    "source": "https://finance.sina.com.cn/wm/2026-04-17/doc-inhuuptn1119149.shtml",
    "credit": "浪潮工作室／新浪转载",
    "path": "art/people/kris-cutout.png"
  },
  {
    "id": "robert",
    "name": "罗伯特·帕丁森",
    "note": "浴袍事业版",
    "file": "robert-2.jpg",
    "crop": [
      0,
      0,
      1,
      1
    ],
    "source": "https://weibo.com/2/detail/5366623797774263",
    "credit": "季节限定sally 分享帖",
    "path": "art/people/robert-cutout.png"
  },
  {
    "id": "robert-wish",
    "name": "罗伯特·帕丁森",
    "note": "经典特写版",
    "file": "robert-1.jpg",
    "crop": [
      0,
      0,
      1,
      1
    ],
    "source": "https://weibo.com/2/detail/5366623797774263",
    "credit": "季节限定sally 分享帖",
    "path": "art/people/robert-wish-cutout.png"
  },
  {
    "id": "liu",
    "name": "刘亦菲",
    "note": "蓝衬衫捧花版",
    "file": "liu-3.jpg",
    "crop": [
      0,
      0,
      1,
      1
    ],
    "source": "https://k.sina.com.cn/article_1310754317_4e20860d040019z3k.html",
    "credit": "娱酷／新浪分享",
    "path": "art/people/liu-cutout.png"
  },
  {
    "id": "yang",
    "name": "杨超越",
    "note": "紫衣合掌锦鲤版",
    "file": "yang-1.jpg",
    "crop": [
      0,
      0,
      1,
      1
    ],
    "source": "https://www.sohu.com/a/252378917_700913",
    "credit": "陌上客旅行／搜狐",
    "path": "art/people/yang-cutout.png"
  },
  {
    "id": "malfoy",
    "name": "马尔福",
    "note": "福字角色头像",
    "file": "malfoy-2.png",
    "crop": [
      0,
      0,
      1,
      1
    ],
    "source": "https://kepu.cctv.cn/2026/02/12/ARTINRtFVpMGJg3lfZ9Lzy09260212.shtml",
    "credit": "科普中国／央视转载",
    "path": "art/people/malfoy-cutout.png"
  },
  {
    "id": "reference",
    "scale": 0.8,
    "name": "参考图人物",
    "note": "白色浴袍版",
    "path": "art/people/reference-cutout.png",
    "credit": "用户提供的三人参考图，ImageGen 提取",
    "crop": [
      0,
      0,
      1,
      1
    ]
  }
];
  const layouts = {
    group:{name:"自动同框",x:50,y:100,size:125,opacity:100},
    floating:{name:"悬浮同框",x:50,y:76,size:75,opacity:100},
    sky:{name:"天空浮像",x:50,y:58,size:65,opacity:65},
  };

  function draw(ctx, selected, width, height) {
    if (!selected?.length) return;
    const settings=selected[0];
    const columns=Math.min(selected.length,3);
    const rows=Math.ceil(selected.length/columns);
    const groupWidth=width*settings.size/100;
    const slotWidth=groupWidth/columns;
    const centerX=width*settings.x/100;
    const bottom=height*settings.y/100;
    const baseHeight=Math.min(height*.66,height*.68/rows);
    const drawOrder=[...selected.keys()].sort((a,b) => {
      const center=(columns-1)/2;
      return Math.abs(b%columns-center)-Math.abs(a%columns-center);
    });
    ctx.save();
    ctx.globalAlpha=settings.opacity/100;
    for(const index of drawOrder) {
      const person=selected[index];
      const image=person.image;
      const row=Math.floor(index/columns);
      const itemsInRow=Math.min(columns,selected.length-row*columns);
      const spacing=width*(columns===2 ? .50 : .30);
      const x=centerX+(index%columns-(itemsInRow-1)/2)*spacing;
      const scale=Math.min(slotWidth*1.9/image.width,baseHeight/image.height)*(person.scale ?? 1);
      const w=image.width*scale,h=image.height*scale;
      const y=bottom-(rows-1-row)*baseHeight*.85;
      ctx.drawImage(image,x-w/2,y-h,w,h);
    }
    ctx.restore();
  }

  function thumbnail(canvas, image) {
    canvas.width=100;
    canvas.height=100;
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,100,100);
    const scale=Math.min(94/image.width,98/image.height);
    const w=image.width*scale,h=image.height*scale;
    ctx.drawImage(image,(100-w)/2,100-h,w,h);
  }

  return {people,layouts,draw,thumbnail};
})();
