import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'

export class SignalRClient {
  private connection: HubConnection | null = null

  async start(token: string, hubUrl: string): Promise<HubConnection> {
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .build()

    await this.connection.start()
    return this.connection
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
    }
  }

  getConnection(): HubConnection | null {
    return this.connection
  }
}