export type MockExpiringLicense = {
  id: string
  name: string | null
  key: string
}

export type ExpirationHeatmapEntry = {
  date: string
  x: number
  y: number
  temperature: number
  count: number
}

export const ExpirationHeatmapMockData: ExpirationHeatmapEntry[] = [
  { date: "2026-03-02", x: 0, y: 1, count: 1, temperature: 0.2 },
  { date: "2026-03-06", x: 0, y: 5, count: 1, temperature: 0.2 },
  { date: "2026-03-10", x: 1, y: 2, count: 2, temperature: 0.4 },
  { date: "2026-03-16", x: 2, y: 1, count: 1, temperature: 0.2 },
  { date: "2026-03-19", x: 2, y: 4, count: 1, temperature: 0.2 },
  { date: "2026-03-25", x: 3, y: 3, count: 3, temperature: 0.6 },
  { date: "2026-03-30", x: 4, y: 1, count: 1, temperature: 0.2 },
  { date: "2026-04-03", x: 4, y: 5, count: 2, temperature: 0.4 },
  { date: "2026-04-08", x: 5, y: 3, count: 1, temperature: 0.2 },
  { date: "2026-04-14", x: 6, y: 2, count: 1, temperature: 0.2 },
  { date: "2026-04-18", x: 6, y: 6, count: 3, temperature: 0.6 },
  { date: "2026-04-22", x: 7, y: 3, count: 1, temperature: 0.2 },
  { date: "2026-04-28", x: 8, y: 2, count: 2, temperature: 0.4 },
  { date: "2026-05-04", x: 9, y: 1, count: 1, temperature: 0.2 },
  { date: "2026-05-09", x: 9, y: 6, count: 1, temperature: 0.2 },
  { date: "2026-05-14", x: 10, y: 4, count: 4, temperature: 0.8 },
  { date: "2026-05-19", x: 11, y: 2, count: 1, temperature: 0.2 },
  { date: "2026-05-26", x: 12, y: 2, count: 2, temperature: 0.4 },
  { date: "2026-05-29", x: 12, y: 5, count: 1, temperature: 0.2 },
  { date: "2026-06-01", x: 13, y: 1, count: 1, temperature: 0.2 },
  { date: "2026-06-05", x: 13, y: 5, count: 2, temperature: 0.4 },
  { date: "2026-06-11", x: 14, y: 4, count: 1, temperature: 0.2 },
  { date: "2026-06-17", x: 15, y: 3, count: 3, temperature: 0.6 },
  { date: "2026-06-25", x: 16, y: 4, count: 1, temperature: 0.2 },
  { date: "2026-06-29", x: 17, y: 1, count: 1, temperature: 0.2 },
  { date: "2026-07-02", x: 17, y: 4, count: 2, temperature: 0.4 },
  { date: "2026-07-08", x: 18, y: 3, count: 1, temperature: 0.2 },
  { date: "2026-07-13", x: 19, y: 1, count: 5, temperature: 1.0 },
  { date: "2026-07-17", x: 19, y: 5, count: 1, temperature: 0.2 },
  { date: "2026-07-23", x: 20, y: 4, count: 2, temperature: 0.4 },
  { date: "2026-07-28", x: 21, y: 2, count: 1, temperature: 0.2 },
  { date: "2026-08-03", x: 22, y: 1, count: 1, temperature: 0.2 },
  { date: "2026-08-05", x: 22, y: 3, count: 2, temperature: 0.4 },
  { date: "2026-08-12", x: 23, y: 3, count: 1, temperature: 0.2 },
  { date: "2026-08-20", x: 24, y: 4, count: 3, temperature: 0.6 },
  { date: "2026-08-27", x: 25, y: 4, count: 1, temperature: 0.2 },
  { date: "2026-09-02", x: 26, y: 3, count: 1, temperature: 0.2 },
  { date: "2026-09-07", x: 27, y: 1, count: 2, temperature: 0.4 },
  { date: "2026-09-15", x: 28, y: 2, count: 3, temperature: 0.6 },
  { date: "2026-09-21", x: 29, y: 1, count: 1, temperature: 0.2 },
  { date: "2026-09-25", x: 29, y: 5, count: 1, temperature: 0.2 },
  { date: "2026-10-01", x: 30, y: 4, count: 2, temperature: 0.4 },
  { date: "2026-10-07", x: 31, y: 3, count: 1, temperature: 0.2 },
  { date: "2026-10-13", x: 32, y: 2, count: 1, temperature: 0.2 },
  { date: "2026-10-20", x: 33, y: 2, count: 4, temperature: 0.8 },
  { date: "2026-10-29", x: 34, y: 4, count: 1, temperature: 0.2 },
  { date: "2026-11-03", x: 35, y: 2, count: 1, temperature: 0.2 },
  { date: "2026-11-09", x: 36, y: 1, count: 2, temperature: 0.4 },
  { date: "2026-11-16", x: 37, y: 1, count: 3, temperature: 0.6 },
  { date: "2026-11-20", x: 37, y: 5, count: 1, temperature: 0.2 },
  { date: "2026-11-25", x: 38, y: 3, count: 1, temperature: 0.2 },
  { date: "2026-12-03", x: 39, y: 4, count: 1, temperature: 0.2 },
  { date: "2026-12-09", x: 40, y: 3, count: 2, temperature: 0.4 },
  { date: "2026-12-15", x: 41, y: 2, count: 1, temperature: 0.2 },
  { date: "2026-12-22", x: 42, y: 2, count: 3, temperature: 0.6 },
  { date: "2026-12-30", x: 43, y: 3, count: 1, temperature: 0.2 },
  { date: "2027-01-05", x: 44, y: 1, count: 1, temperature: 0.2 },
  { date: "2027-01-11", x: 45, y: 1, count: 2, temperature: 0.4 },
  { date: "2027-01-16", x: 45, y: 6, count: 1, temperature: 0.2 },
  { date: "2027-01-22", x: 46, y: 5, count: 1, temperature: 0.2 },
  { date: "2027-01-28", x: 47, y: 4, count: 2, temperature: 0.4 },
  { date: "2027-02-02", x: 48, y: 2, count: 1, temperature: 0.2 },
  { date: "2027-02-04", x: 48, y: 4, count: 1, temperature: 0.2 },
  { date: "2027-02-11", x: 49, y: 4, count: 3, temperature: 0.6 },
  { date: "2027-02-18", x: 50, y: 4, count: 1, temperature: 0.2 },
  { date: "2027-02-25", x: 51, y: 4, count: 1, temperature: 0.2 },
]

export const ExpiringLicensesMockData = new Map<string, MockExpiringLicense[]>([
  [
    "2026-03-02",
    [{ id: "lic-1", name: null, key: "A9F3C-7B2E1-D04F8-3C6A2-V3" }],
  ],
  [
    "2026-03-06",
    [{ id: "lic-2", name: null, key: "E12B7-4D8F3-A6C91-0B5E4-V3" }],
  ],
  [
    "2026-03-10",
    [
      { id: "lic-3", name: null, key: "C84D2-1F7A9-B3E60-5D2C8-V3" },
      { id: "lic-4", name: null, key: "F0A61-9C3B7-2E8D4-7F1A5-V3" },
    ],
  ],
  [
    "2026-03-16",
    [{ id: "lic-5", name: null, key: "B5E92-3A1D8-C7F04-6B9E3-V3" }],
  ],
  [
    "2026-03-19",
    [{ id: "lic-6", name: null, key: "D73C1-8F4A2-0B6E9-1D5C7-V3" }],
  ],
  [
    "2026-03-25",
    [
      {
        id: "lic-7",
        name: "Blood Gulch",
        key: "A2D84-6C0F3-9B7E1-4A8D2-V3",
      },
      { id: "lic-8", name: null, key: "E9B13-5D7C4-2F0A8-8E3B6-V3" },
      { id: "lic-9", name: null, key: "C1F45-0A9E7-6D3B2-9C4F1-V3" },
    ],
  ],
  [
    "2026-03-30",
    [{ id: "lic-10", name: null, key: "B6A28-4E1D9-7C5F3-2B0A6-V3" }],
  ],
  [
    "2026-04-03",
    [
      { id: "lic-11", name: null, key: "D4C70-8B2F6-1A9E5-5D7C3-V3" },
      { id: "lic-12", name: null, key: "F8E31-2C6A9-5B0D7-3F4E8-V3" },
    ],
  ],
  [
    "2026-04-08",
    [{ id: "lic-13", name: null, key: "A0D52-7F3B1-9C8E4-6A2D0-V3" }],
  ],
  [
    "2026-04-14",
    [{ id: "lic-14", name: null, key: "C3B96-1D8F2-4A7E0-9C5B3-V3" }],
  ],
  [
    "2026-04-18",
    [
      { id: "lic-15", name: null, key: "E7A04-5C2D8-8F1B6-0E9A7-V3" },
      {
        id: "lic-16",
        name: "Lockout",
        key: "B1F63-9A4E7-2D0C5-7B8F1-V3",
      },
      { id: "lic-17", name: null, key: "D5C82-3F9A0-6B4E1-1D7C5-V3" },
    ],
  ],
  [
    "2026-04-22",
    [{ id: "lic-18", name: null, key: "A8E17-0C5D3-9F2B4-4A6E8-V3" }],
  ],
  [
    "2026-04-28",
    [
      { id: "lic-19", name: null, key: "F2D49-6A8C1-3E7B5-8F0D2-V3" },
      { id: "lic-20", name: null, key: "C6A73-4E1F8-0D9B2-5C3A6-V3" },
    ],
  ],
  [
    "2026-05-04",
    [{ id: "lic-21", name: null, key: "B9F05-2D7C4-8A1E6-3B5F9-V3" }],
  ],
  [
    "2026-05-09",
    [{ id: "lic-22", name: null, key: "E4B28-1A6D9-7C0F3-9E2B4-V3" }],
  ],
  [
    "2026-05-14",
    [
      {
        id: "lic-23",
        name: "Ascension",
        key: "D0C91-5F3A7-2B8E4-6D1C0-V3",
      },
      { id: "lic-24", name: null, key: "A7E36-8C2D0-4F9B1-0A5E7-V3" },
      { id: "lic-25", name: null, key: "F1B54-3D9A2-6C8E7-2F4B1-V3" },
      { id: "lic-26", name: null, key: "C8D02-0A7F5-1B3E9-4C6D8-V3" },
    ],
  ],
  [
    "2026-05-19",
    [{ id: "lic-27", name: null, key: "B3A69-6E4C1-9D2F7-7B0A3-V3" }],
  ],
  [
    "2026-05-26",
    [
      { id: "lic-28", name: null, key: "E5F14-2B8D6-0A3C9-8E1F5-V3" },
      { id: "lic-29", name: null, key: "D9C47-4F0A3-7E5B8-1D3C9-V3" },
    ],
  ],
  [
    "2026-05-29",
    [{ id: "lic-30", name: null, key: "A3B82-6F1D9-0C7E4-5A9B3-V3" }],
  ],
  [
    "2026-06-01",
    [{ id: "lic-31", name: null, key: "C0E56-2A8F1-4D3B7-8C6E0-V3" }],
  ],
  [
    "2026-06-05",
    [
      { id: "lic-32", name: null, key: "F7D14-9B0A3-1E5C8-3F2D7-V3" },
      { id: "lic-33", name: null, key: "B4A97-1C6E2-8F0D5-2B3A9-V3" },
    ],
  ],
  [
    "2026-06-11",
    [{ id: "lic-34", name: null, key: "E1C83-7D4F0-3A9B6-0E5C1-V3" }],
  ],
  [
    "2026-06-17",
    [
      {
        id: "lic-35",
        name: "Zanzibar",
        key: "D6F20-4B7A8-9C1E3-6D8F2-V3",
      },
      { id: "lic-36", name: null, key: "A5B74-0E3D1-7F2C9-4A6B5-V3" },
      { id: "lic-37", name: null, key: "C9E41-3A5F7-6B0D2-1C8E4-V3" },
    ],
  ],
  [
    "2026-06-25",
    [{ id: "lic-38", name: null, key: "F4D68-8B1C3-2E7A0-9F3D6-V3" }],
  ],
  [
    "2026-06-29",
    [{ id: "lic-39", name: null, key: "B2F95-5D0A4-1C6E8-7B4F2-V3" }],
  ],
  [
    "2026-07-02",
    [
      { id: "lic-40", name: null, key: "E8A37-0C9D5-4F1B2-3E7A8-V3" },
      { id: "lic-41", name: null, key: "D1C60-6F2B9-8A4E3-5D0C1-V3" },
    ],
  ],
  [
    "2026-07-08",
    [{ id: "lic-42", name: null, key: "A4F93-7C1B6-2E0D8-6A3F4-V3" }],
  ],
  [
    "2026-07-13",
    [
      {
        id: "lic-43",
        name: "Guardian",
        key: "C7E20-0D5A4-9B8F1-3C6E7-V3",
      },
      { id: "lic-44", name: null, key: "F3B58-4A9D2-1C7E6-8F0B3-V3" },
      { id: "lic-45", name: null, key: "B0D71-6E3C9-5A4F2-2B9D0-V3" },
      { id: "lic-46", name: null, key: "E6A84-1F7B3-4D2C0-9E5A6-V3" },
      { id: "lic-47", name: null, key: "D2C96-8B0F5-3A1E7-0D4C2-V3" },
    ],
  ],
  [
    "2026-07-17",
    [{ id: "lic-48", name: null, key: "A1F37-5C8D4-7B6E0-4A2F1-V3" }],
  ],
  [
    "2026-07-23",
    [
      { id: "lic-49", name: null, key: "C4E69-2D0A7-8F3B5-1C7E4-V3" },
      { id: "lic-50", name: null, key: "F9B12-3A6D8-0C5E4-6F8B9-V3" },
    ],
  ],
  [
    "2026-07-28",
    [{ id: "lic-51", name: null, key: "B7D45-9E1C2-6A0F3-5B8D7-V3" }],
  ],
  [
    "2026-08-03",
    [{ id: "lic-52", name: null, key: "E0A78-4F3B1-2D9C6-3E0A7-V3" }],
  ],
  [
    "2026-08-05",
    [
      { id: "lic-53", name: null, key: "D8C03-1B5F9-4A7E2-7D3C8-V3" },
      { id: "lic-54", name: null, key: "A6E50-0C2D7-9F4B1-8A6E5-V3" },
    ],
  ],
  [
    "2026-08-12",
    [{ id: "lic-55", name: null, key: "C2B84-6D9A3-1E0F7-4C2B8-V3" }],
  ],
  [
    "2026-08-20",
    [
      {
        id: "lic-56",
        name: "Sandtrap",
        key: "F5D17-8A4C0-3B6E9-0F5D1-V3",
      },
      { id: "lic-57", name: null, key: "B8A42-2E7F5-5C1D3-9B8A4-V3" },
      { id: "lic-58", name: null, key: "E3F96-7B0A1-4D8C2-6E3F9-V3" },
    ],
  ],
  [
    "2026-08-27",
    [{ id: "lic-59", name: null, key: "D0E53-3C6B8-8A2F4-1D0E5-V3" }],
  ],
  [
    "2026-09-02",
    [{ id: "lic-60", name: null, key: "A7C81-5F4D9-0B3E6-2A7C8-V3" }],
  ],
  [
    "2026-09-07",
    [
      { id: "lic-61", name: null, key: "C1D24-9A8F0-6E5B7-5C1D2-V3" },
      { id: "lic-62", name: null, key: "F6B59-0D3A4-2C7E1-8F6B5-V3" },
    ],
  ],
  [
    "2026-09-15",
    [
      { id: "lic-63", name: null, key: "B4E97-4C0F2-1A6D8-3B4E9-V3" },
      {
        id: "lic-64",
        name: "Snowbound",
        key: "E9A30-7F1B6-5D4C3-0E9A3-V3",
      },
      { id: "lic-65", name: null, key: "D3F62-1B8A5-9C0E7-7D3F6-V3" },
    ],
  ],
  [
    "2026-09-21",
    [{ id: "lic-66", name: null, key: "A0C85-6E2D1-4F9B3-4A0C8-V3" }],
  ],
  [
    "2026-09-25",
    [{ id: "lic-67", name: null, key: "C5B18-2A7F4-0D3E9-9C5B1-V3" }],
  ],
  [
    "2026-10-01",
    [
      { id: "lic-68", name: null, key: "F2E43-8D6C0-7A1B5-2F2E4-V3" },
      { id: "lic-69", name: null, key: "B9D76-3F0A2-1C8E4-6B9D7-V3" },
    ],
  ],
  [
    "2026-10-07",
    [{ id: "lic-70", name: null, key: "E4A01-5B9F7-3D2C6-1E4A0-V3" }],
  ],
  [
    "2026-10-13",
    [{ id: "lic-71", name: null, key: "D7C34-0A3E8-6F5B1-8D7C3-V3" }],
  ],
  [
    "2026-10-20",
    [
      { id: "lic-72", name: null, key: "A3F67-4D1C9-2B8E0-5A3F6-V3" },
      { id: "lic-73", name: null, key: "C6E90-9B4A2-5D7F3-0C6E9-V3" },
      {
        id: "lic-74",
        name: null,
        key: "F0B25-1C8D6-4A3E7-3F0B2-V3",
      },
      { id: "lic-75", name: null, key: "B5D48-7E2F1-0C6A9-4B5D4-V3" },
    ],
  ],
  [
    "2026-10-29",
    [{ id: "lic-76", name: null, key: "E8A73-2F5B0-9D1C4-7E8A7-V3" }],
  ],
  [
    "2026-11-03",
    [{ id: "lic-77", name: null, key: "D1F06-6A3E8-3B9C5-2D1F0-V3" }],
  ],
  [
    "2026-11-09",
    [
      { id: "lic-78", name: null, key: "A4C39-0D7F2-8E1B4-9A4C3-V3" },
      { id: "lic-79", name: null, key: "C9E64-5B0A7-1F3D6-6C9E6-V3" },
    ],
  ],
  [
    "2026-11-16",
    [
      { id: "lic-80", name: null, key: "F3B97-3A2D5-4C0E8-1F3B9-V3" },
      { id: "lic-81", name: null, key: "B6D20-8E9C1-7A4F3-0B6D2-V3" },
      { id: "lic-82", name: null, key: "E0A53-1F6B4-5D7C9-3E0A5-V3" },
    ],
  ],
  [
    "2026-11-20",
    [{ id: "lic-83", name: null, key: "D5C86-4B1E7-2A8F0-8D5C8-V3" }],
  ],
  [
    "2026-11-25",
    [{ id: "lic-84", name: null, key: "A8F19-7C4D3-0B2E6-5A8F1-V3" }],
  ],
  [
    "2026-12-03",
    [{ id: "lic-85", name: null, key: "C2B40-6E8A9-3F5D1-4C2B4-V3" }],
  ],
  [
    "2026-12-09",
    [
      { id: "lic-86", name: null, key: "F7E75-2D1C4-9A0B8-7F7E7-V3" },
      { id: "lic-87", name: null, key: "B0D08-5A6F2-1C3E7-2B0D0-V3" },
    ],
  ],
  [
    "2026-12-15",
    [{ id: "lic-88", name: null, key: "E3A31-0F9B6-4D2C5-9E3A3-V3" }],
  ],
  [
    "2026-12-22",
    [
      { id: "lic-89", name: null, key: "D6C64-3B7E0-8A1F9-0D6C6-V3" },
      {
        id: "lic-90",
        name: "Midship",
        key: "A9F97-4C0D3-2E5B4-3A9F9-V3",
      },
      { id: "lic-91", name: null, key: "C4B20-1E3A6-6F8D7-6C4B2-V3" },
    ],
  ],
  [
    "2026-12-30",
    [{ id: "lic-92", name: null, key: "F1E53-8D2C9-5A4B0-1F1E5-V3" }],
  ],
  [
    "2027-01-05",
    [{ id: "lic-93", name: null, key: "B8D86-6A0F5-3C7E1-4B8D8-V3" }],
  ],
  [
    "2027-01-11",
    [
      { id: "lic-94", name: null, key: "E5A19-2F4B8-0D1C3-7E5A1-V3" },
      { id: "lic-95", name: null, key: "D0C42-9B7E6-4A8F2-2D0C4-V3" },
    ],
  ],
  [
    "2027-01-16",
    [{ id: "lic-96", name: null, key: "A3F75-3C1D0-7E6B9-5A3F7-V3" }],
  ],
  [
    "2027-01-22",
    [{ id: "lic-97", name: null, key: "C6B08-0E5A4-1F3D7-8C6B0-V3" }],
  ],
  [
    "2027-01-28",
    [
      { id: "lic-98", name: null, key: "F9E31-4D8C2-6A0B5-3F9E3-V3" },
      { id: "lic-99", name: null, key: "B2D64-7A3F1-9C5E8-0B2D6-V3" },
    ],
  ],
  [
    "2027-02-02",
    [{ id: "lic-100", name: null, key: "E4A97-1F0B6-2D7C3-9E4A9-V3" }],
  ],
  [
    "2027-02-04",
    [{ id: "lic-101", name: null, key: "D7C20-5B4E8-3A9F1-4D7C2-V3" }],
  ],
  [
    "2027-02-11",
    [
      { id: "lic-102", name: null, key: "A0F53-8C2D7-6E1B0-1A0F5-V3" },
      { id: "lic-103", name: null, key: "C3B86-4E7A9-0F5D2-6C3B8-V3" },
      { id: "lic-104", name: null, key: "F6E19-1D0C4-5A3B7-3F6E1-V3" },
    ],
  ],
  [
    "2027-02-18",
    [{ id: "lic-105", name: null, key: "B9D42-3A6F5-8C2E1-8B9D4-V3" }],
  ],
  [
    "2027-02-25",
    [{ id: "lic-106", name: null, key: "E2A75-6F1B0-4D9C3-5E2A7-V3" }],
  ],
])
