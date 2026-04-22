import BottomNav from './BottomNav';

/**
 * Layout principal para vistas protegidas (usuario autenticado).
 *
 * Envuelve el contenido en el contenedor mobile-first con máximo ancho
 * de 500px y renderiza la BottomNav flotante en la parte inferior.
 * Las páginas públicas (Landing, Login, Register) no usan este Layout.
 *
 * @param {{ children: React.ReactNode }} props
 */
function Layout({ children }) {
  return (
    <div className="app-container">
      <main className="main-content">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default Layout;
