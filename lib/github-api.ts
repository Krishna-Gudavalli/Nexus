
const API="https://api.github.com";
function headers(){
  return {
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2022-11-28",
    ...(process.env.GITHUB_TOKEN?{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`}:{})
  };
}
export async function gh(path:string, init:RequestInit={}) {
  const res=await fetch(`${API}${path}`,{...init,headers:{...headers(),...(init.headers||{})},cache:"no-store"});
  const text=await res.text();
  let data:any; try{data=JSON.parse(text)}catch{data={raw:text}};
  if(!res.ok) throw new Error(`GitHub ${res.status}: ${data?.message||text}`);
  return data;
}
export async function repoInfo(owner:string,repo:string){return gh(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)}
export async function branchRef(owner:string,repo:string,branch:string){
  return gh(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
}
export async function commitInfo(owner:string,repo:string,sha:string){
  return gh(`/repos/${owner}/${repo}/git/commits/${sha}`);
}
export async function repoTree(owner:string,repo:string,sha:string){return gh(`/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`)}
export async function fileContent(owner:string,repo:string,path:string,ref:string){
  const d=await gh(`/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`);
  if(d.encoding!=="base64") throw new Error(`Unsupported GitHub content encoding for ${path}`);
  return Buffer.from(d.content.replace(/\n/g,""),"base64").toString("utf8");
}
export async function createBranch(owner:string,repo:string,baseSha:string,branch:string){
  return gh(`/repos/${owner}/${repo}/git/refs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ref:`refs/heads/${branch}`,sha:baseSha})});
}
export async function createBlob(owner:string,repo:string,content:string){
  return gh(`/repos/${owner}/${repo}/git/blobs`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content,encoding:"utf-8"})});
}
export async function createTree(owner:string,repo:string,baseTree:string,entries:any[]){
  return gh(`/repos/${owner}/${repo}/git/trees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base_tree:baseTree,tree:entries})});
}
export async function createCommit(owner:string,repo:string,message:string,tree:string,parent:string){
  return gh(`/repos/${owner}/${repo}/git/commits`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,tree,parents:[parent]})});
}
export async function updateRef(owner:string,repo:string,branch:string,sha:string){
  return gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sha,force:false})});
}
export async function createPullRequest(owner:string,repo:string,head:string,base:string,title:string,body:string){
  return gh(`/repos/${owner}/${repo}/pulls`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,head,base,body})});
}
