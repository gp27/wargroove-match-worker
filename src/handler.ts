declare const MATCHES: KVNamespace

declare global {
  interface WorkerGlobalScope {
    matches: Record<string,any>
  }
}

import * as jsondiffpatch from 'jsondiffpatch'
import { getResponse200, getResponse404 } from './utils'

const jsondiff = jsondiffpatch.create()

if(!self.matches){
  self.matches = {}
}


export async function handleRequest(request: Request, event: FetchEvent): Promise<Response> {
  let url = new URL(request.url)
  let match_id = url.searchParams.get('match_id')

  if(request.method == 'GET' && match_id){
    let match = await  MATCHES.get(match_id)
    if(!match){
      return getResponse404()
    }

    return new Response(match, { headers: { 'Content-Type': 'application/json' } })
  }

  if(request.method != 'POST' || url.pathname != '/match_log'){
    return getResponse404()
  }

  return request.json()
  .then(data => {
    event.waitUntil(updateMatch(data))
    return getResponse200()
  })
  .catch(err => {
    return getResponse404()
  })
}

function getStateId(state: any){
  return state && state.id
}

async function updateMatch(data: any){
  let { match_id, map, players, state } = data || {}
  if(!match_id) return

  let match = await MATCHES.get(match_id, 'json') as any

  let memoryMatch = self.matches[match_id]

  if (memoryMatch){
    let memoryStateId = getStateId(memoryMatch.state)
    let diskStateId = getStateId(match && match.state) 

    if (memoryStateId >= diskStateId) {
      match = memoryMatch
    }
  }

  match = Object.assign({ state, deltas: [], map }, match, { players })


  if (getStateId(state) > getStateId(match.state)){
    let delta = jsondiff.diff(match.state, state)
    match.deltas.push(delta)
    match.state = state
  }

  self.matches[match_id] = match

  return MATCHES.put(match_id, JSON.stringify(match))
}