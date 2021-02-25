export function getResponse405() {
    return new Response(null, {
        status: 405,
        statusText: 'Method Not Allowed',
    })
}

export function getResponse404() {
    return new Response(null, {
        status: 404,
        statusText: 'Not Found',
    })
}

export function getResponse500() {
    return new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
    })
}

export function getResponse200() {
    return new Response(null, {
        status: 200,
        statusText: 'OK',
    })
}