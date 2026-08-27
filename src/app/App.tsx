import { BrowserRouter } from 'react-router-dom';
import { Providers } from './providers/Providers';
import { AppRouter } from './router';

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Providers>
  );
}

export default App;
