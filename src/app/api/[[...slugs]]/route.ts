import { app } from "@/server"

export const GET = (req: Request) => app.handle(req)
export const POST = (req: Request) => app.handle(req)
export const PUT = (req: Request) => app.handle(req)
export const PATCH = (req: Request) => app.handle(req)
export const DELETE = (req: Request) => app.handle(req)
