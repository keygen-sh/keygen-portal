export const MockEntitlements = [
  {
    data: {
      id: "db1ff21b-f42f-4623-952b-ca7f2600bded",
      type: "entitlements",
      attributes: {
        name: "Example Feature 1",
        code: "EXAMPLE_FEATURE_1",
        metadata: {},
        created: "2017-01-02T20:26:53.464Z",
        updated: "2017-01-02T20:26:53.464Z",
      },
      relationships: {
        account: {
          links: {
            related: "/v1/accounts/<account>",
          },
          data: {
            type: "accounts",
            id: "<account>",
          },
        },
      },
      links: {
        self: "/v1/accounts/<account>/entitlements/db1ff21b-f42f-4623-952b-ca7f2600bded",
      },
    },
  },
  {
    data: {
      id: "kb23jkb-f42f-4623-952b-ca7f2600bded",
      type: "entitlements",
      attributes: {
        name: "Example Feature 2",
        code: "EXAMPLE_FEATURE_2",
        metadata: {},
        created: "2017-01-02T20:26:53.464Z",
        updated: "2017-01-02T20:26:53.464Z",
      },
      relationships: {
        account: {
          links: {
            related: "/v1/accounts/<account>",
          },
          data: {
            type: "accounts",
            id: "<account>",
          },
        },
      },
      links: {
        self: "/v1/accounts/<account>/entitlements/kb23jkb-f42f-4623-952b-ca7f2600bded",
      },
    },
  },
]
