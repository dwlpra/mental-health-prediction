// Root component — wraps ChatWindow.
// Jika butuh global provider (theme, auth, dsb), tambah di sini.
import ChatWindow from './components/ChatWindow'

export default function App() {
  return <ChatWindow />
}
