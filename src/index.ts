import { handleRequest } from './handler'
import { handleCors } from './cors'
import { getResponse500 } from './utils'

export type RequestHandler = (request: Request, event: FetchEvent) => Promise<Response>

addEventListener('fetch', (event) => {
  let responsePromise = handleCors(event, (req) =>
    handleRequest(req, event),
  ).catch((response) => {
    if (response instanceof Response) return response

    return getResponse500()
  })

  event.waitUntil(responsePromise)
  event.respondWith(responsePromise)
})
