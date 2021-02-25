import { RequestHandler } from "."
import { getResponse405 } from "./utils"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Max-Age': '86400',
}

function handleOptions(request: Request): Response {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    let headers = request.headers
    if (
        headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null
    ) {
        // Handle CORS pre-flight request.
        // If you want to check or reject the requested method + headers
        // you can do that here.
        let respHeaders = {
            ...corsHeaders,
            // Allow all future content Request headers to go back to browser
            // such as Authorization (Bearer) or X-Client-Name-Version
            'Access-Control-Allow-Headers': request.headers.get(
                'Access-Control-Request-Headers',
            ) || "",
        }

        return new Response(null, { headers: respHeaders })
    } else {
        // Handle standard OPTIONS request.
        // If you want to allow other HTTP Methods, you can do that here.
        return new Response(null, { headers: { Allow: 'GET, HEAD, POST, OPTIONS' } })
    }
}

async function handleCorsRequest(event: FetchEvent, handler: RequestHandler): Promise<Response> {
    let response: Response

    try {
        response = await handler(event.request, event)
    } catch (e) {
        if (e instanceof Response) {
            response = e
        }
        else {
            throw e
        }
    }

    response = new Response(response.body, response)
    response.headers.set('Access-Control-Allow-Origin', event.request.headers.get("Origin") || "null")

    return response
}

export async function handleCors(event: FetchEvent, handler: RequestHandler): Promise<Response> {
    let method = event.request.method

    let response: Response | Promise<Response>

    if (method === 'OPTIONS') {
        response = handleOptions(event.request)

    } else if (['GET', 'HEAD', 'POST', 'PUT', 'DELETE'].includes(method)) {
        response = handleCorsRequest(event, handler)

    } else {
        response = getResponse405()
    }

    return response
}