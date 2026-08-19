import { useAuth } from "../context/useAuth";

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        }}
      >
        <p
          style={{
            color: '#64748b',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.12em',
          }}
        >
          LANDELA · DASHBOARD
        </p>

        <h1 style={{ color: '#0f172a' }}>
          Bienvenue, {user?.name}
        </h1>

        <p style={{ color: '#64748b' }}>
          Vous êtes connecté en tant que <strong>{user?.role}</strong>.
        </p>

        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            borderRadius: '12px',
            background: '#f8fafc',
          }}
        >
          <p>
            <strong>ID :</strong> {user?.user_id}
          </p>

          <p>
            <strong>Email :</strong> {user?.email}
          </p>

          <p>
            <strong>Rôle :</strong> {user?.role}
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            marginTop: '25px',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            background: '#172554',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '700',
          }}
        >
          Se déconnecter
        </button>
      </div>
    </main>
  )
}

export default Dashboard