export class AuthCommandRejectedError extends Error {
  constructor() {
    super("AUTH_COMMAND_REJECTED")
    this.name = "AuthCommandRejectedError"
  }
}

export class AuthDependencyUnavailableError extends Error {
  readonly safeHttpStatus = 503

  constructor(message = "AUTH_DEPENDENCY_UNAVAILABLE") {
    super(message)
    this.name = "AuthDependencyUnavailableError"
  }
}
