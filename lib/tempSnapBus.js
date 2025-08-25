let latestSnap = null;

export function setTempSnap(snap){
  latestSnap = snap;
}

export function consumeTempSnap(){
  const s = latestSnap;
  latestSnap = null;
  return s;
}


