import { useState, useEffect } from 'react'
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'
import axios from 'axios'

interface ChatMessage {
  id: number
  userName: string
  content: string
  sentAt: string
}

interface AuthResponse {
  token: string
  userName: string
  userId: string
}

function App() {
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const API_BASE = 'http://localhost:5000'

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
      initializeSignalR(savedToken)
      fetchMessages()
    }
  }, [])

  const initializeSignalR = async (authToken: string) => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/chat`, {
        accessTokenFactory: () => authToken
      })
      .build()

    newConnection.on('ReceiveMessage', (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    })

    try {
      await newConnection.start()
      setConnection(newConnection)
      console.log('SignalR Connected')
    } catch (error) {
      console.error('SignalR Connection Error:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/messages`)
      setMessages(response.data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        // Login
        const response = await axios.post(`${API_BASE}/api/auth/login`, {
          userNameOrEmail: userName,
          password
        })
        const authData: AuthResponse = response.data
        setToken(authData.token)
        setIsAuthenticated(true)
        localStorage.setItem('token', authData.token)
        await initializeSignalR(authData.token)
        await fetchMessages()
      } else {
        // Register
        await axios.post(`${API_BASE}/api/auth/register`, {
          userName,
          email,
          password
        })
        alert('Registration successful! Please log in.')
        setIsLogin(true)
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('Authentication failed')
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (connection && message.trim()) {
      try {
        await connection.invoke('SendMessage', message)
        setMessage('')
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setIsAuthenticated(false)
    connection?.stop()
    setConnection(null)
    setMessages([])
    setUserName('')
    setEmail('')
    setPassword('')
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <h1>Chat App</h1>
        <form onSubmit={handleAuth}>
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder={isLogin ? "Username or Email" : "Username"}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
            />
          </div>
          {!isLogin && (
            <div style={{ marginBottom: '10px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
              />
            </div>
          )}
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none' }}
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Chat Room</h1>
        <button onClick={logout} style={{ padding: '8px 16px' }}>
          Logout
        </button>
      </div>
      
      <div style={{ 
        border: '1px solid #ccc', 
        height: '400px', 
        overflowY: 'auto', 
        padding: '10px', 
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '10px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
            <strong>{msg.userName}</strong>: {msg.content}
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {new Date(msg.sentAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>
          Send
        </button>
      </form>
    </div>
  )
}

export default App