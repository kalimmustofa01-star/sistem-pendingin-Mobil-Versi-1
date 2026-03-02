import CoolingSystemGame from './components/CoolingSystemGame';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <CoolingSystemGame />
    </ErrorBoundary>
  );
}
