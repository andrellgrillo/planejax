import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path)
}

async function proxy(request: NextRequest, path: string[]) {
  try {
    const target = `${API_URL}/api/${path.join('/')}${request.nextUrl.search}`
    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.json().catch(() => undefined)
      : undefined

    const res = await fetch(target, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro de conexão com o servidor' },
      { status: 502 }
    )
  }
}
