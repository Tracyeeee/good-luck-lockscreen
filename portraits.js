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
    "path": "art/people/kris.png"
  },
  {
    "id": "robert",
    "name": "罗伯特·帕丁森",
    "note": "浴袍事业版",
    "file": "robert-2.jpg",
    "crop": [
      0,
      0.28,
      0.69,
      0.72
    ],
    "source": "https://weibo.com/2/detail/5366623797774263",
    "credit": "季节限定sally 分享帖",
    "path": "art/people/robert.jpg"
  },
  {
    "id": "robert-wish",
    "name": "罗伯特·帕丁森",
    "note": "I GET EVERYTHING I WANT",
    "file": "robert-1.jpg",
    "crop": [
      0,
      0,
      1,
      1
    ],
    "source": "https://weibo.com/2/detail/5366623797774263",
    "credit": "季节限定sally 分享帖",
    "path": "art/people/robert-wish.jpg"
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
    "path": "art/people/liu.jpg"
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
    "path": "art/people/yang.jpg"
  },
  {
    "id": "malfoy",
    "name": "马尔福",
    "note": "福字角色头像",
    "file": "malfoy-2.png",
    "crop": [
      0.34,
      0.5,
      0.31,
      0.31
    ],
    "source": "https://kepu.cctv.cn/2026/02/12/ARTINRtFVpMGJg3lfZ9Lzy09260212.shtml",
    "credit": "科普中国／央视转载",
    "path": "art/people/malfoy.png"
  }
];
  const layouts = {
    side:{name:"侧边贴纸",x:25,y:65,size:42,opacity:100},
    center:{name:"居中头像",x:50,y:65,size:46,opacity:100},
    sky:{name:"天空浮像",x:50,y:41,size:52,opacity:65},
  };

  function draw(ctx, portrait, width, height) {
    if (!portrait) return;
    const image = portrait.image;
    const [left,top,cropWidth,cropHeight] = portrait.crop ?? [0,0,1,1];
    const sw = image.width*cropWidth;
    const sh = image.height*cropHeight;
    const square = Math.min(sw,sh);
    const sx = image.width*left+(sw-square)/2;
    const sy = image.height*top+(sh-square)*portrait.focus/100;
    const radius = width*portrait.size/200;
    const x = Math.max(radius+width*.02,Math.min(width-radius-width*.02,width*portrait.x/100));
    const y = Math.max(height*.26+radius,Math.min(height*.81-radius,height*portrait.y/100));
    ctx.save();
    ctx.globalAlpha = portrait.opacity/100;
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2);
    ctx.clip();
    ctx.drawImage(image,sx,sy,square,square,x-radius,y-radius,radius*2,radius*2);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = portrait.opacity/100*.7;
    ctx.strokeStyle = "#ead5ff";
    ctx.lineWidth = width*.002;
    ctx.beginPath();
    ctx.arc(x,y,radius,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  function thumbnail(canvas, image, person) {
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,100,100);
    const [x,y,w,h] = person.crop;
    const size = Math.min(image.width*w,image.height*h);
    ctx.beginPath();
    ctx.arc(50,50,49,0,Math.PI*2);
    ctx.clip();
    ctx.drawImage(image,image.width*x+(image.width*w-size)/2,image.height*y,size,size,0,0,100,100);
  }

  return {people,layouts,draw,thumbnail};
})();
