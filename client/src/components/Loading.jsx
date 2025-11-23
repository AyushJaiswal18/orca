/**
 * Loading Components
 * Reusable loading states and spinners
 */

/**
 * Spinner Component
 */
export const Spinner = ({ size = 40, color = '#646cff' }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `4px solid ${color}20`,
        borderTop: `4px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * Full Page Loading Overlay
 */
export const FullPageLoading = ({ message = 'Loading...' }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <Spinner size={50} />
      {message && (
        <p style={{ marginTop: '20px', fontSize: '1rem', color: '#666' }}>
          {message}
        </p>
      )}
    </div>
  );
};

/**
 * Inline Loading Component
 */
export const InlineLoading = ({ message = 'Loading...', size = 24 }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <Spinner size={size} />
      {message && <span style={{ color: '#666' }}>{message}</span>}
    </div>
  );
};

/**
 * Button Loading State
 */
export const ButtonLoading = ({ size = 16 }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <Spinner size={size} color="#fff" />
      <span>Loading...</span>
    </div>
  );
};

export default Spinner;

