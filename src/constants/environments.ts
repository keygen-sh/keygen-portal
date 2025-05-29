enum MODES {
  VIEW = "view",
  EDIT = "edit",
  CREATE = "create",
}

enum VIEWS {
  LIST = "list",
  DETAILS = "details",
}

enum STRATEGIES {
  ISOLATED = "ISOLATED",
  SHARED = "SHARED",
}

enum DESCRIPTIONS {
  ISOLATED = "Creating a new Isolated environment",
  SHARED = "Creating a new Shared environment",
}

export { MODES, VIEWS, STRATEGIES, DESCRIPTIONS }
