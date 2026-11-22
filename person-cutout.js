"use strict";

// MediaPipe runs locally. Uploaded image pixels stay in this browser.
const personCutout = (() => {
  let modelPromise = null;
  let queue = Promise.resolve();
  const cache = new Map();
  const base = new URL("vendor/selfie-segmentation/",document.baseURI);

  function getModel() {
    if (modelPromise) return modelPromise;
    modelPromise = new Promise((resolve,reject) => {
      const script = document.createElement("script");
      script.src = new URL("selfie_segmentation.js",base).href;
      script.onload = () => {
        try {
          const model = new SelfieSegmentation({locateFile:file => new URL(file,base).href});
          model.setOptions({modelSelection:0,selfieMode:false});
          resolve(model);
        } catch (error) { reject(error); }
      };
      script.onerror = () => reject(new Error("抠图组件加载失败，请刷新后重试。"));
      document.head.append(script);
    }).catch(error => {
      modelPromise = null;
      throw error;
    });
    return modelPromise;
  }

  function trim(canvas) {
    const ctx = canvas.getContext("2d");
    const image = ctx.getImageData(0,0,canvas.width,canvas.height);
    let left=canvas.width,top=canvas.height,right=-1,bottom=-1;
    for (let y=0;y<canvas.height;y++) {
      for (let x=0;x<canvas.width;x++) {
        const index=(y*canvas.width+x)*4+3;
        const alpha=image.data[index];
        if (alpha<12) { image.data[index]=0; continue; }
        left=Math.min(left,x);
        right=Math.max(right,x);
        top=Math.min(top,y);
        bottom=Math.max(bottom,y);
      }
    }
    if (right<left || bottom<top) throw new Error("没有识别到清晰人物，请换一张人物更明显的照片。");
    ctx.putImageData(image,0,0);
    const result=document.createElement("canvas");
    result.width=right-left+1;
    result.height=bottom-top+1;
    result.getContext("2d").drawImage(canvas,left,top,result.width,result.height,0,0,result.width,result.height);
    return result;
  }

  async function segment(image, crop) {
    const [x,y,w,h]=crop ?? [0,0,1,1];
    const sw=image.width*w, sh=image.height*h;
    const scale=Math.min(1,1200/Math.max(sw,sh));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(sw*scale));
    canvas.height=Math.max(1,Math.round(sh*scale));
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    ctx.drawImage(image,image.width*x,image.height*y,sw,sh,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let transparent=0;
    for(let i=3;i<pixels.length;i+=4) if(pixels[i]<240) transparent++;
    if(transparent>canvas.width*canvas.height*.02) return trim(canvas);
    const model=await getModel();
    let output=null;
    model.onResults(results => {
      const mask=document.createElement("canvas");
      mask.width=canvas.width;
      mask.height=canvas.height;
      const target=mask.getContext("2d");
      target.drawImage(results.segmentationMask,0,0,mask.width,mask.height);
      target.globalCompositeOperation="source-in";
      target.drawImage(canvas,0,0);
      target.globalCompositeOperation="source-over";
      output=mask;
    });
    // Each frame needs a strictly increasing timestamp, including rapid uploads.
    await new Promise(resolve => setTimeout(resolve,2));
    try { await model.send({image:canvas}); }
    catch (error) { throw new Error("自动抠图未完成，请重试或上传透明背景 PNG。",{cause:error}); }
    if(!output) throw new Error("没有获得人像抠图结果，请重试。");
    return trim(output);
  }

  function extract(image, crop, key) {
    if(key && cache.has(key)) return cache.get(key);
    // Serialize inference so callbacks cannot be mixed between two upload requests.
    const result=queue.then(() => segment(image,crop));
    queue=result.catch(() => {});
    if(key) {
      cache.set(key,result);
      result.catch(() => cache.delete(key));
    }
    return result;
  }

  return {extract};
})();
