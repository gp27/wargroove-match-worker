//declare const MATCHES: KVNamespace

import { getResponse200, getResponse404 } from './utils'

export async function handleRequest(request: Request, event: FetchEvent): Promise<Response> {
  let url = new URL(request.url)
  //let match_id = url.searchParams.get('match_id')

  /*if(request.method == 'GET' && match_id){
    let match = await  MATCHES.get(match_id)
    if(!match){
      return getResponse404()
    }

    return new Response(match, { headers: { 'Content-Type': 'application/json' } })
  }*/

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
  let { match_id, deltas = [] } = data || {}
  if(!match_id) return

  return multipartRelated(match_id, data, {
    deltas_length: deltas.length || 0
  })
  //return MATCHES.put(match_id, JSON.stringify(data))
}

function multipartRelated(match_id: string, data: any, metadata: Record<string,string>){
  const name = `matches/${match_id}.json`
  let url = 'https://firebasestorage.googleapis.com/v0/b/wargroove-match-storage.appspot.com/o?uploadType=multipart&name=' + name

  let dataJSON = JSON.stringify(data)
  const metadataRoot = Object.assign({}, {
    name,
    size: dataJSON.length,
    metadata,
    contentType: 'application/json'
  })

  const boundary = genBoundary() //'22436d8e312640efbf30-06208f99fa52'
  const body =
// MULTIPART BODY START
`--${boundary}
Content-Type: application/json; charset=UTF-8

${JSON.stringify(metadataRoot)}
--${boundary}
Content-Type: ${metadataRoot.contentType}

${dataJSON}
--${boundary}--`
// MULTIPART BODY END

  return fetch(url, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'multipart',
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  })
}

function genBoundary(): string {
  let str = '';
  for (let i = 0; i < 2; i++) {
    str = str + Math.random().toString().slice(2);
  }
  return str;
}