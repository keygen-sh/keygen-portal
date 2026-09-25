import {
  MOCK_ACCOUNT,
  requireMockBearer,
  mockRoute,
  serializeMock,
} from "@/demo/server"

mockRoute("GET", `${MOCK_ACCOUNT}/me`, (ctx) => {
  const { token, subject } = requireMockBearer(ctx)
  ctx.resource = { type: subject.type, id: subject.id }

  return {
    status: 200,
    body: {
      data: serializeMock(ctx, subject),
      included: [serializeMock(ctx, token)],
    },
  }
})
