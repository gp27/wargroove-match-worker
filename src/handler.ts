declare const MATCHES: KVNamespace

import { getResponse200, getResponse404 } from './utils'

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
async function updateMatch(data: any){
  let { match_id } = data || {}
  if(!match_id) return
  return MATCHES.put(match_id, JSON.stringify(data))
}