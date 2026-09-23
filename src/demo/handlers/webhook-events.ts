import {
  MOCK_ACCOUNT,
  assertWritable,
  baseRefs,
  destroyMock,
  environmentRelationship,
  errors,
  fail,
  makeMockRow,
  onMockEvent,
  paginateMock,
  queryList,
  randomHex,
  registerMockDestroyer,
  registerMockSerializer,
  requireVisible,
  resource,
  mockRoute,
  sameEnvironment,
  scoped,
  serializeMock,
  mockStore,
  uuid,
  type MockAttributes,
  type MockContext,
  type Linkage,
  type MockResource,
  type MockResult,
  type MockRow,
} from "@/demo/server"
import { isSubscribed } from "./webhook-endpoints"

const TYPE = "webhook-events"
const LABEL = "webhook event"
const ENDPOINT_TYPE = "webhook-endpoints"
const IDEMPOTENCY_TOKEN_LENGTH = 32
const MIN_DELIVERY_DELAY = 800
const MAX_DELIVERY_DELAY = 2500
const FAILING_URL_MARKER = "fail"
const TIMEOUT_URL_MARKER = "timeout"
const TIMEOUT_BODY = "REQ_TIMEOUT"
const DELIVERED_BODY = "ok"
const FAILING_BODY = '{"error":"boom"}'

import { WebhookEventStatus } from "@/types/webhook-events"

export { WebhookEventStatus }

const webhookEvents = () => mockStore.table(TYPE)
const webhookEndpoints = () => mockStore.table(ENDPOINT_TYPE)

export function serializeMockWebhookEvent(
  ctx: MockContext,
  row: MockRow,
): MockResource {
  return resource(
    ctx,
    row,
    {
      endpoint: row.attributes.endpoint,
      payload: row.attributes.payload ?? null,
      event: row.attributes.event,
      status: row.attributes.status ?? WebhookEventStatus.Delivering,
      lastResponseCode: row.attributes.lastResponseCode ?? null,
      lastResponseBody: row.attributes.lastResponseBody ?? null,
      apiVersion: row.attributes.apiVersion ?? null,
      created: row.created,
      updated: row.updated,
    },
    {
      environment: environmentRelationship(ctx, row.refs.environment),
    },
    { meta: { idempotencyToken: row.attributes.idempotencyToken ?? null } },
  )
}

registerMockSerializer(TYPE, serializeMockWebhookEvent)

registerMockDestroyer(TYPE, (_ctx, row) => {
  webhookEvents().delete(row.id)
})

function unprocessableEntity(detail: string): MockResult {
  return errors(422, { title: "Unprocessable entity", detail })
}

function deliveryDelay(): number {
  return (
    MIN_DELIVERY_DELAY +
    Math.random() * (MAX_DELIVERY_DELAY - MIN_DELIVERY_DELAY)
  )
}

function settleDelivery(id: string, attributes: MockAttributes): void {
  if (!webhookEvents().has(id)) return
  webhookEvents().patch(id, { attributes })
}

function scheduleDelivery(id: string, url: string): void {
  window.setTimeout(() => {
    if (url.includes(TIMEOUT_URL_MARKER)) {
      settleDelivery(id, {
        status: WebhookEventStatus.Failed,
        lastResponseCode: null,
        lastResponseBody: TIMEOUT_BODY,
      })
      return
    }

    if (url.includes(FAILING_URL_MARKER)) {
      settleDelivery(id, {
        status: WebhookEventStatus.Failing,
        lastResponseCode: 500,
        lastResponseBody: FAILING_BODY,
      })
      window.setTimeout(() => {
        settleDelivery(id, {
          status: WebhookEventStatus.Failed,
          lastResponseCode: 500,
          lastResponseBody: FAILING_BODY,
        })
      }, deliveryDelay())
      return
    }

    settleDelivery(id, {
      status: WebhookEventStatus.Delivered,
      lastResponseCode: 200,
      lastResponseBody: DELIVERED_BODY,
    })
  }, deliveryDelay())
}

function endpointUrl(endpoint: MockRow): string {
  return typeof endpoint.attributes.url === "string"
    ? endpoint.attributes.url
    : ""
}

function payloadFor(ctx: MockContext, resourceRow: MockRow): string {
  try {
    return JSON.stringify({ data: serializeMock(ctx, resourceRow) })
  } catch {
    return JSON.stringify({
      data: { type: resourceRow.type, id: resourceRow.id },
    })
  }
}

function insertDelivery(
  ctx: MockContext,
  endpoint: MockRow,
  attributes: MockAttributes,
  environment: Linkage | null,
): MockRow {
  const row = makeMockRow(
    TYPE,
    uuid(),
    {
      ...attributes,
      status: WebhookEventStatus.Delivering,
      lastResponseCode: null,
      lastResponseBody: null,
    },
    {
      ...baseRefs(ctx),
      environment,
      endpoint: { type: ENDPOINT_TYPE, id: endpoint.id },
    },
  )
  webhookEvents().insert(row)
  scheduleDelivery(row.id, endpointUrl(endpoint))
  return row
}

onMockEvent((ctx, event, resourceRow) => {
  if (!ctx || !resourceRow) return

  const accountId = ctx.accountId
  const eventName = String(event.attributes.event)
  const subscribers = webhookEndpoints().where(
    (endpoint) =>
      endpoint.refs.account?.id === accountId &&
      sameEnvironment(endpoint, event) &&
      isSubscribed(endpoint, eventName),
  )
  if (subscribers.length === 0) return

  const payload = payloadFor(ctx, resourceRow)

  for (const endpoint of subscribers) {
    insertDelivery(
      ctx,
      endpoint,
      {
        endpoint: endpointUrl(endpoint),
        payload,
        event: eventName,
        apiVersion: endpoint.attributes.apiVersion ?? null,
        idempotencyToken: randomHex(IDEMPOTENCY_TOKEN_LENGTH),
      },
      event.refs.environment,
    )
  }
})

function retryEndpoint(row: MockRow): MockRow | undefined {
  const linked = row.refs.endpoint
    ? webhookEndpoints().get(row.refs.endpoint.id)
    : undefined
  if (linked && sameEnvironment(linked, row)) return linked

  return webhookEndpoints().find(
    (endpoint) =>
      endpoint.refs.account?.id === row.refs.account?.id &&
      sameEnvironment(endpoint, row) &&
      endpoint.attributes.url === row.attributes.endpoint,
  )
}

mockRoute("GET", `${MOCK_ACCOUNT}/webhook-events`, (ctx) => {
  const events = queryList(ctx.query, "events")
  const rows = scoped(ctx, webhookEvents().all()).filter(
    (row) =>
      events.length === 0 || events.includes(String(row.attributes.event)),
  )
  return {
    status: 200,
    body: paginateMock(ctx, rows, (row) => serializeMockWebhookEvent(ctx, row)),
  }
})

mockRoute("GET", `${MOCK_ACCOUNT}/webhook-events/:id`, (ctx) => {
  const row = requireVisible(ctx, webhookEvents(), ctx.params.id, LABEL)
  ctx.resource = { type: TYPE, id: row.id }
  return { status: 200, body: { data: serializeMockWebhookEvent(ctx, row) } }
})

mockRoute("DELETE", `${MOCK_ACCOUNT}/webhook-events/:id`, (ctx) => {
  const row = requireVisible(ctx, webhookEvents(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  destroyMock(ctx, TYPE, row.id)

  return { status: 204 }
})

mockRoute("POST", `${MOCK_ACCOUNT}/webhook-events/:id/actions/retry`, (ctx) => {
  const row = requireVisible(ctx, webhookEvents(), ctx.params.id, LABEL)
  assertWritable(ctx, row)
  ctx.resource = { type: TYPE, id: row.id }

  const endpoint = retryEndpoint(row)
  if (!endpoint) fail(unprocessableEntity("webhook event failed to retry"))

  const retried = insertDelivery(
    ctx,
    endpoint,
    {
      endpoint: row.attributes.endpoint,
      payload: row.attributes.payload ?? null,
      event: row.attributes.event,
      apiVersion: row.attributes.apiVersion ?? null,
      idempotencyToken: row.attributes.idempotencyToken ?? null,
    },
    row.refs.environment,
  )

  return {
    status: 201,
    body: { data: serializeMockWebhookEvent(ctx, retried) },
  }
})
