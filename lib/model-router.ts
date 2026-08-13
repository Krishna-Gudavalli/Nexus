import { getModels } from "@/lib/platform-store";
export async function routeModel(task:string){const models=(await getModels()).filter(x=>x.enabled);const t=task.toLowerCase();const tier=/security|patch|exploit|architecture|complex/.test(t)?"reasoning":/research|latest|compare/.test(t)?"balanced":"fast";return models.find(x=>x.tier===tier)||models[0]}
