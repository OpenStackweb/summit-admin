export const starters = [[220,120,20],[120,220,20],[80,20,240],[220,20,120],[20,120,220],[20,210,90]];

export const getRandomColors = (amount, starter) => {
  
  const starterColors = starters[starter];
  
  let incBase = starterColors[0] < 100 ? (255 - starterColors[0]) : starterColors[0];
  const incRed = Math.ceil(incBase / amount);
  
  incBase = starterColors[1] < 100 ? (255 - starterColors[1]) : starterColors[1];
  const incGreen = Math.ceil(incBase / amount);
  
  incBase = starterColors[2] < 100 ? (255 - starterColors[2]) : starterColors[2];
  const incBlue = Math.ceil(incBase / amount);
  
  
  return Array.apply(null, {length: amount}).map((v,i) => {
    let multiplier = starterColors[0] < 100 ? -1 : 1;
    const r = Math.ceil(starterColors[0] - (i * incRed * multiplier));
    multiplier = starterColors[1] < 100 ? -1 : 1;
    const g = Math.ceil(starterColors[1] - (i * incGreen * multiplier));
    multiplier = starterColors[2] < 100 ? -1 : 1;
    const b = Math.ceil(starterColors[2] - (i * incBlue * multiplier));
    
    return `rgb(${r}, ${g}, ${b})`;
  });
};

export const createDonnutCanvas = (arc, percent) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 100;
  canvas.height = 60;
  
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${percent}%`, 32, 28);
  
  ctx.beginPath()
  ctx.fillStyle = arc?.options?.backgroundColor;
  ctx.arc(32, 25, 20, 0, (2 * Math.PI * percent / 100), false); // outer (filled)
  ctx.arc(32, 25, 14, (2 * Math.PI * percent / 100), 0, true); // inner (unfills it)
  ctx.fill();
  
  ctx.beginPath()
  ctx.arc(32, 25, 20, 0, Math.PI * 2, true);
  ctx.stroke();
  ctx.beginPath()
  ctx.arc(32, 25, 14, 0, Math.PI * 2, true);
  ctx.stroke();
  
  return canvas;
};

