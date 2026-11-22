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


  // Head widths align the faces. Clothing below each neckline fills the lower edge.
  const framing = {
    kris:{faceX:.44,faceWidth:.52,bodyStart:.78},
    robert:{faceX:.46,faceWidth:.55,bodyStart:.78},
    "robert-wish":{faceX:.50,faceWidth:.62,bodyStart:.82},
    reference:{faceX:.51,faceWidth:.66,bodyStart:.74},
    liu:{faceX:.57,faceWidth:.57,bodyStart:.88},
    yang:{faceX:.51,faceWidth:.55,bodyStart:.88},
    malfoy:{faceX:.51,faceWidth:.62,bodyStart:.76},
  };

  function geometry(selected, width, height) {
    if (!selected?.length) return [];
    const settings=selected[0];
    const columns=Math.min(selected.length,3);
    const rows=Math.ceil(selected.length/columns);
    const isGroup=settings.layout==="group";
    const groupScale=settings.size/125;
    const centerX=width*settings.x/100;
    const baseBottom=height*settings.y/100;
    return selected.map((person,index) => {
      const image=person.image;
      const frame=framing[person.id] ?? {faceX:.5,faceWidth:.65,bodyStart:.78};
      const row=Math.floor(index/columns);
      const count=Math.min(columns,selected.length-row*columns);
      const slot=width/count;
      const faceWidth=Math.min(slot*.94,width*.48)*groupScale;
      const scale=faceWidth/(image.width*frame.faceWidth);
      const edit=person.transform ?? {x:0,y:0,scale:1};
      const zoom=edit.scale ?? 1;
      const drawWidth=image.width*scale*zoom;
      const naturalHeight=image.height*scale*zoom;
      const x=centerX+(index%columns-(count-1)/2)*slot;
      const desiredHeight=isGroup ? height*.51/rows*groupScale : image.height*scale;
      const rowStep=isGroup ? height*.48/rows*groupScale : Math.min(height*.3,naturalHeight*.82);
      const top=baseBottom-(rows-1-row)*rowStep-(isGroup ? desiredHeight : naturalHeight);
      const drawHeight=Math.max(naturalHeight,desiredHeight*zoom);
      const y=top+(isGroup ? (1-zoom)*desiredHeight*.35 : 0);
      const headHeight=image.height*frame.bodyStart*scale*zoom;
      const order=Math.abs(index%columns-(count-1)/2);
      return {person,index,order,x:x-drawWidth*frame.faceX+(edit.x ?? 0)*width,
        y:y+(edit.y ?? 0)*height,width:drawWidth,height:drawHeight,headHeight,
        bodyStart:frame.bodyStart,opacity:settings.opacity/100};
    }).sort((a,b) => Math.floor(a.index/columns)-Math.floor(b.index/columns) || b.order-a.order);
  }

  function draw(ctx, selected, width, height) {
    for(const box of geometry(selected,width,height)) {
      const image=box.person.image;
      const sourceTop=image.height*box.bodyStart;
      ctx.save();
      ctx.globalAlpha=box.opacity;
      ctx.drawImage(image,0,0,image.width,sourceTop,box.x,box.y,box.width,box.headHeight);
      ctx.drawImage(image,0,sourceTop,image.width,image.height-sourceTop,
        box.x,box.y+box.headHeight,box.width,box.height-box.headHeight);
      ctx.restore();
    }
  }

  function hitTest(selected,width,height,x,y) {
    const boxes=geometry(selected,width,height);
    for(const box of boxes.reverse()) {
      if(x<box.x || x>box.x+box.width || y<box.y || y>box.y+box.height) continue;
      const image=box.person.image;
      const sx=Math.min(image.width-1,Math.max(0,Math.floor((x-box.x)/box.width*image.width)));
      const localY=y-box.y;
      const sy=localY<box.headHeight ? localY/box.headHeight*image.height*box.bodyStart
        : image.height*box.bodyStart+(localY-box.headHeight)/(box.height-box.headHeight)*image.height*(1-box.bodyStart);
      const pixel=image.getContext("2d").getImageData(sx,Math.min(image.height-1,Math.max(0,Math.floor(sy))),1,1).data;
      if(pixel[3]>35) return box;
    }
    return null;
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

  return {people,layouts,geometry,draw,hitTest,thumbnail};
})();
