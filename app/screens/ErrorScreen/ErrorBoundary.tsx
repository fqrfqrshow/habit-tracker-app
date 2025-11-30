import React, { Component, ErrorInfo, ReactNode } from "react"
import { ErrorDetails } from "./ErrorDetails" // убедись, что в ErrorDetails.tsx есть именованный экспорт

interface Props {
  children: ReactNode
  catchErrors: "always" | "dev" | "prod" | "never"
}

interface State {
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary — компонент для отлова JS-ошибок в React.
 * Используется паттерн "error boundary", который возможен только в class-компонентах.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (!this.isEnabled()) return

    this.setState({ error, errorInfo })

    // Здесь можно подключить Sentry, BugSnag или другой сервис логирования
    // reportCrash(error)
  }

  resetError = () => {
    this.setState({ error: null, errorInfo: null })
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return nextState.error !== this.state.error
  }

  isEnabled(): boolean {
    return (
      this.props.catchErrors === "always" ||
      (this.props.catchErrors === "dev" && __DEV__) ||
      (this.props.catchErrors === "prod" && !__DEV__)
    )
  }

  render() {
    return this.isEnabled() && this.state.error ? (
      <ErrorDetails
        onReset={this.resetError}
        error={this.state.error}
        errorInfo={this.state.errorInfo}
      />
    ) : (
      this.props.children
    )
  }
}
