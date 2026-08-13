export type Role="owner"|"admin"|"developer"|"security"|"viewer";
export function can(role:Role,action:"read"|"run"|"write"|"manage"){if(role==="owner"||role==="admin")return true;if(role==="viewer")return action==="read";if(role==="developer")return action!=="manage";if(role==="security")return action!=="manage";return false}
