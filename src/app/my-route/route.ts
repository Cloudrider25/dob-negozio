export const GET = async (_request: Request) => {
  return Response.json({ error: 'Not found' }, { status: 404 })
}
